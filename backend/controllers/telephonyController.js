import { v4 as uuidv4 } from "uuid";
import { memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { telephonyProvider } from "../adapters/telephonyAdapter.js";

/**
 * Check if current time is within IST calling hours (08:00 - 19:00).
 * Returns { allowed, istHour, istMinute, message }.
 */
function isWithinCallingHours() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 3600000 * 5.5);
  const istHour = istDate.getHours();
  const istMinute = istDate.getMinutes();

  const startHour = parseInt(process.env.CALLING_HOURS_START || "8", 10);
  const endHour = parseInt(process.env.CALLING_HOURS_END || "19", 10);

  const allowed = istHour >= startHour && (istHour < endHour || (istHour === endHour && istMinute === 0));

  return {
    allowed,
    istHour,
    istMinute,
    message: allowed
      ? "Within permissible calling hours."
      : `Calling outside permissible recovery hours (${startHour}:00 - ${endHour}:00 IST) is strictly prohibited.`
  };
}

/**
 * POST /api/telephony/calls/initiate
 * Initiate a call to a customer for a specific case.
 */
export const initiateCall = async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({ success: false, message: "caseId is required." });
    }

    // Check calling hours
    const callingCheck = isWithinCallingHours();
    if (!callingCheck.allowed) {
      return res.status(403).json({ success: false, message: callingCheck.message });
    }

    // Find case
    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId);
    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    // Verify employee is assigned (or supervisor/admin)
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      loanCase.assigned_employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    // Find customer
    const customer = memoryStore.customers.find(c => c.id === loanCase.customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found for this case." });
    }

    // Find agent telephony ID
    const empRecord = memoryStore.employees.find(e => e.id === req.user.id);
    const agentId = empRecord ? empRecord.telephony_agent_id : `TEL-AGENT-${req.user.id}`;

    // Initiate via provider
    const providerResponse = await telephonyProvider.initiateCall(agentId, customer.phone_raw);

    // Create call record
    const callId = `call_${uuidv4()}`;
    const now = new Date().toISOString();

    const callRecord = {
      id: callId,
      case_id: caseId,
      employee_id: req.user.id,
      customer_id: customer.id,
      telephony_call_id: providerResponse.telephony_call_id,
      direction: "OUTBOUND",
      status: "ringing",
      started_at: now,
      ended_at: null,
      duration_seconds: 0,
      customer_notification_status: "ANNOUNCED_RECORDED",
      call_outcome: null,
      call_notes: null,
      next_follow_up_date: null,
      created_at: now
    };

    memoryStore.calls.push(callRecord);

    return res.status(200).json({
      success: true,
      message: "Call initiated successfully. Ringing customer.",
      data: {
        call_id: callId,
        telephony_call_id: providerResponse.telephony_call_id,
        case_number: loanCase.case_number,
        customer_name: customer.full_name,
        provider: providerResponse.provider,
        status: "ringing",
        started_at: now
      }
    });
  } catch (error) {
    console.error("initiateCall Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/telephony/webhook
 * Handle call-end webhook from telephony provider.
 */
export const handleWebhook = async (req, res) => {
  try {
    const {
      telephony_call_id,
      status,
      duration_seconds,
      recording_url,
      recording_s3_key,
      ended_at,
      signature
    } = req.body;

    // Basic signature verification (mock)
    if (!telephonyProvider.verifyWebhookSignature(req.body, signature || "mock-valid")) {
      return res.status(401).json({ success: false, message: "Invalid webhook signature." });
    }

    if (!telephony_call_id) {
      return res.status(400).json({ success: false, message: "telephony_call_id is required." });
    }

    // Find the call record
    const callRecord = memoryStore.calls.find(c => c.telephony_call_id === telephony_call_id);
    if (!callRecord) {
      return res.status(404).json({ success: false, message: `Call with telephony ID '${telephony_call_id}' not found.` });
    }

    const now = new Date().toISOString();
    const callDuration = parseInt(duration_seconds, 10) || 0;
    const callStatus = status === "COMPLETED" || status === "answered"
      ? "answered"
      : status === "UNANSWERED" || status === "unanswered"
        ? "unanswered"
        : status || "answered";

    // Update call record
    callRecord.status = callStatus;
    callRecord.duration_seconds = callDuration;
    callRecord.ended_at = ended_at || now;

    // Create recording entry if call was answered
    if (callStatus === "answered" && callDuration > 0) {
      const s3Key = recording_s3_key || `recordings/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${telephony_call_id}.mp3`;

      const recording = {
        id: `rec_${uuidv4()}`,
        call_id: callRecord.id,
        s3_bucket: "paymagic-telephony-recordings-secure",
        s3_key: s3Key,
        recording_url: recording_url || `https://paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com/${s3Key}`,
        duration_seconds: callDuration,
        file_size_bytes: callDuration * 16000,
        mime_type: "audio/mp3",
        encryption_type: "aws:kms:sse",
        processing_status: "READY",
        is_legal_hold: false,
        retention_until: new Date(Date.now() + 365 * 86400000).toISOString(),
        created_at: now
      };

      memoryStore.call_recordings.push(recording);
    }

    return res.status(200).json({
      success: true,
      message: `Webhook processed: call ${telephony_call_id} updated to '${callStatus}'.`,
      data: {
        call_id: callRecord.id,
        telephony_call_id,
        status: callStatus,
        duration_seconds: callDuration
      }
    });
  } catch (error) {
    console.error("handleWebhook Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/telephony/calls/:callId/outcome
 * Submit call outcome after a call ends.
 */
export const submitCallOutcome = async (req, res) => {
  try {
    const callId = req.params.callId || req.body.callId || req.body.call_id;
    const { call_outcome, call_notes, next_follow_up_date, newCaseStatus } = req.body;

    if (!callId) {
      return res.status(400).json({ success: false, message: "callId is required." });
    }

    if (!call_outcome) {
      return res.status(400).json({ success: false, message: "call_outcome is required." });
    }

    const callRecord = memoryStore.calls.find(c => c.id === callId);
    if (!callRecord) {
      return res.status(404).json({ success: false, message: `Call '${callId}' not found.` });
    }

    // Verify ownership (caller can only update their own calls)
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      callRecord.employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "You can only submit outcomes for your own calls." });
    }

    // Update call record
    callRecord.call_outcome = call_outcome;
    callRecord.call_notes = call_notes || callRecord.call_notes;
    callRecord.next_follow_up_date = next_follow_up_date || callRecord.next_follow_up_date;

    // Update follow-up on the case
    if (next_follow_up_date) {
      const loanCase = memoryStore.loan_cases.find(c => c.id === callRecord.case_id);
      if (loanCase) {
        loanCase.follow_up_date = next_follow_up_date;
        loanCase.updated_at = new Date().toISOString();
      }
    }

    // Update case status if provided
    let statusResult = null;
    if (newCaseStatus) {
      const validStatuses = [
        "Contacted", "Promise to Pay", "Partially Paid", "Fully Paid",
        "Disputed", "Not Reachable", "Field Visit", "Closed"
      ];
      if (!validStatuses.includes(newCaseStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid case status '${newCaseStatus}'. Valid: ${validStatuses.join(", ")}`
        });
      }

      statusResult = await updateCaseStatusWithHistory({
        caseId: callRecord.case_id,
        employeeId: req.user.id,
        newStatus: newCaseStatus,
        remarks: `Status changed via call outcome: ${call_outcome}. ${call_notes || ""}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Call outcome '${call_outcome}' recorded.${newCaseStatus ? ` Case status updated to '${newCaseStatus}'.` : ""}`,
      data: {
        call: callRecord,
        status_update: statusResult ? { changed: statusResult.changed, new_status: statusResult.case?.status } : null
      }
    });
  } catch (error) {
    console.error("submitCallOutcome Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/telephony/calls/simulate
 * DEV ONLY: Simulate a full call lifecycle instantly.
 */
export const simulateCall = async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({ success: false, message: "caseId is required." });
    }

    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId);
    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    const customer = memoryStore.customers.find(c => c.id === loanCase.customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found for this case." });
    }

    const empRecord = memoryStore.employees.find(e => e.id === req.user.id);
    const agentId = empRecord ? empRecord.telephony_agent_id : `TEL-AGENT-${req.user.id}`;

    // Simulate entire lifecycle via provider
    const simResult = await telephonyProvider.simulateFullCallLifecycle(agentId, customer.phone_raw);
    const simCall = simResult.call;

    const callId = `call_${uuidv4()}`;
    const now = new Date().toISOString();

    // Create call record
    const callRecord = {
      id: callId,
      case_id: caseId,
      employee_id: req.user.id,
      customer_id: customer.id,
      telephony_call_id: simCall.telephony_call_id,
      direction: "OUTBOUND",
      status: simCall.status === "COMPLETED" ? "answered" : "unanswered",
      started_at: simCall.initiated_at,
      ended_at: simCall.ended_at,
      duration_seconds: simCall.duration_seconds,
      customer_notification_status: "ANNOUNCED_RECORDED",
      call_outcome: null,
      call_notes: `[SIMULATED] Dev call simulation for testing.`,
      next_follow_up_date: null,
      created_at: now
    };

    memoryStore.calls.push(callRecord);

    // Create recording if call was answered
    if (simCall.recording_available && simCall.duration_seconds > 0) {
      const recording = {
        id: `rec_${uuidv4()}`,
        call_id: callId,
        s3_bucket: "paymagic-telephony-recordings-secure",
        s3_key: simCall.recording_s3_key,
        recording_url: simCall.recording_url,
        duration_seconds: simCall.duration_seconds,
        file_size_bytes: simCall.file_size_bytes,
        mime_type: "audio/mp3",
        encryption_type: "aws:kms:sse",
        processing_status: "READY",
        is_legal_hold: false,
        retention_until: new Date(Date.now() + 365 * 86400000).toISOString(),
        created_at: now
      };

      memoryStore.call_recordings.push(recording);
    }

    return res.status(200).json({
      success: true,
      message: `Call simulated: ${callRecord.status === "answered" ? `Connected for ${simCall.duration_seconds}s` : "Unanswered"}.`,
      data: {
        call_id: callId,
        telephony_call_id: simCall.telephony_call_id,
        case_number: loanCase.case_number,
        customer_name: customer.full_name,
        status: callRecord.status,
        duration_seconds: simCall.duration_seconds,
        recording_available: simCall.recording_available,
        simulated: true
      }
    });
  } catch (error) {
    console.error("simulateCall Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const AGENT_EXTENSIONS = {
  "usr_super_admin": "1001",
  "usr_admin": "1009",
  "usr_supervisor": "1007",
  "usr_caller_1": "1012",
  "usr_caller_2": "1003",
  "usr_field_1": "1005"
};

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTotalDuration(seconds) {
  if (!seconds || seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * GET /api/telephony/calls
 * Get call history with rich filters, CDR metadata, and metrics ribbon.
 */
export const getCallHistory = async (req, res) => {
  try {
    const {
      caseId,
      employeeId,
      direction,
      type,
      status,
      campaign,
      disposition,
      search,
      timeRange = "7d",
      page = 1,
      limit = 50,
      sortBy = "started_at",
      sortOrder = "desc"
    } = req.query;

    let calls = [...memoryStore.calls];

    // Filter by case
    if (caseId) {
      calls = calls.filter(c => c.case_id === caseId);
    }

    // Filter by employee
    if (employeeId) {
      calls = calls.filter(c => c.employee_id === employeeId);
    }

    // Role-based: callers/field agents see only their own calls
    if (["CALLER", "FIELD_AGENT"].includes(req.user.role) && !employeeId) {
      calls = calls.filter(c => c.employee_id === req.user.id);
    }

    // Direction filter: INBOUND | OUTBOUND
    if (direction && direction !== "ALL" && direction !== "All Directions") {
      calls = calls.filter(c => (c.direction || "OUTBOUND").toUpperCase() === direction.toUpperCase());
    }

    // Type / Status filter: answered | unanswered | busy | voicemail | rejected
    const filterStatus = status || type;
    if (filterStatus && filterStatus !== "ALL" && filterStatus !== "All Types") {
      const target = filterStatus.toLowerCase();
      calls = calls.filter(c => {
        const s = (c.status || "").toLowerCase();
        if (target === "no answer" || target === "unanswered") {
          return s === "unanswered" || s === "no answer";
        }
        return s === target;
      });
    }

    // Campaign filter
    if (campaign && campaign !== "ALL" && campaign !== "All Campaigns") {
      calls = calls.filter(c => {
        const loanCase = memoryStore.loan_cases.find(lc => lc.id === c.case_id);
        const camp = c.campaign || (loanCase ? loanCase.lender_name : "");
        return camp.toLowerCase().includes(campaign.toLowerCase());
      });
    }

    // Disposition filter
    if (disposition && disposition !== "ALL" && disposition !== "All Dispositions") {
      calls = calls.filter(c => {
        const disp = c.disposition || c.call_outcome || "";
        return disp.toLowerCase().includes(disposition.toLowerCase());
      });
    }

    // Time range filter
    if (timeRange && timeRange !== "custom") {
      const now = Date.now();
      let maxAgeMs = 7 * 86400000;
      if (timeRange === "today") maxAgeMs = 86400000;
      else if (timeRange === "7d") maxAgeMs = 7 * 86400000;
      else if (timeRange === "30d") maxAgeMs = 30 * 86400000;
      else if (timeRange === "90d") maxAgeMs = 90 * 86400000;

      calls = calls.filter(c => {
        const t = new Date(c.started_at || c.created_at).getTime();
        return now - t <= maxAgeMs;
      });
    }

    // Search filter across customer name, phone, case number, caller
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      calls = calls.filter(c => {
        const loanCase = memoryStore.loan_cases.find(lc => lc.id === c.case_id);
        const customer = memoryStore.customers.find(cust => cust.id === c.customer_id);
        const user = memoryStore.users.find(u => u.id === c.employee_id);

        return (
          (customer && customer.full_name.toLowerCase().includes(q)) ||
          (customer && customer.phone_raw.includes(q)) ||
          (loanCase && loanCase.case_number.toLowerCase().includes(q)) ||
          (user && user.full_name.toLowerCase().includes(q)) ||
          (c.telephony_call_id && c.telephony_call_id.toLowerCase().includes(q)) ||
          (c.call_notes && c.call_notes.toLowerCase().includes(q)) ||
          (c.call_outcome && c.call_outcome.toLowerCase().includes(q))
        );
      });
    }

    // Calculate CDR metrics ribbon before pagination
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.status === "answered" || c.status === "COMPLETED").length;
    const inboundCalls = calls.filter(c => (c.direction || "").toUpperCase() === "INBOUND").length;
    const outboundCalls = calls.filter(c => (c.direction || "OUTBOUND").toUpperCase() === "OUTBOUND").length;
    const totalDurationSeconds = calls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);

    const metrics = {
      total_calls: totalCalls,
      answered_calls: answeredCalls,
      inbound_calls: inboundCalls,
      outbound_calls: outboundCalls,
      total_duration_seconds: totalDurationSeconds,
      total_duration_formatted: formatTotalDuration(totalDurationSeconds)
    };

    // Sort
    const order = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    calls.sort((a, b) => {
      const valA = a[sortBy] || "";
      const valB = b[sortBy] || "";
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    // Paginate
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedCalls = calls.slice(startIdx, startIdx + limitNum);

    // Enrich each call for the CDR table view
    const enriched = paginatedCalls.map((call, idx) => {
      const loanCase = memoryStore.loan_cases.find(c => c.id === call.case_id);
      const customer = memoryStore.customers.find(c => c.id === call.customer_id);
      const callerUser = memoryStore.users.find(u => u.id === call.employee_id);
      const recording = memoryStore.call_recordings.find(r => r.call_id === call.id);

      const callDate = new Date(call.started_at || call.created_at);
      const rawExt = AGENT_EXTENSIONS[call.employee_id] || (callerUser ? callerUser.employee_id.replace(/\D/g, "").slice(-4) : "1012");

      // Format Call ID like CA-2024-0527-0001
      const year = callDate.getFullYear();
      const month = String(callDate.getMonth() + 1).padStart(2, "0");
      const day = String(callDate.getDate()).padStart(2, "0");
      const formattedCallId = call.formatted_call_id || `CA-${year}-${month}${day}-${String(startIdx + idx + 1).padStart(4, "0")}`;

      // Format type
      let callType = "Answered";
      if (call.status === "unanswered" || call.status === "no_answer") callType = "No Answer";
      else if (call.status === "busy") callType = "Busy";
      else if (call.status === "voicemail") callType = "Voicemail";
      else if (call.status === "rejected" || call.status === "abandoned") callType = "Abandoned";

      // Format disposition
      const dispositionVal = call.disposition || call.call_outcome || (call.status === "answered" ? "Completed" : callType);

      return {
        ...call,
        formatted_call_id: formattedCallId,
        case_number: loanCase ? loanCase.case_number : "CASE-GEN",
        customer_name: customer ? customer.full_name : "Direct Customer",
        customer_phone: customer ? customer.phone_raw : "+91 98765 43210",
        agent_name: callerUser ? callerUser.full_name : "Telecaller Staff",
        agent_extension: rawExt,
        direction: (call.direction || "OUTBOUND").toUpperCase(),
        call_type: callType,
        campaign: call.campaign || (loanCase ? loanCase.lender_name : "May Outreach"),
        duration_formatted: formatDuration(call.duration_seconds || 0),
        disposition: dispositionVal,
        date_formatted: callDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time_formatted: callDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        has_recording: !!recording && (call.duration_seconds || 0) > 0,
        recording_id: recording ? recording.id : null,
        recording_duration: recording ? formatDuration(recording.duration_seconds) : null
      };
    });

    return res.status(200).json({
      success: true,
      message: `${totalCalls} call(s) retrieved.`,
      data: {
        calls: enriched,
        metrics,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: totalCalls,
          totalPages: Math.ceil(totalCalls / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("getCallHistory Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/telephony/agents
 * Employee-wise calling reports & performance metrics.
 */
export const getAgentCallingReports = async (req, res) => {
  try {
    const employees = memoryStore.users.filter(u =>
      ["CALLER", "FIELD_AGENT", "SUPERVISOR", "ADMIN"].includes(u.role)
    );

    const reports = employees.map(emp => {
      const empCalls = memoryStore.calls.filter(c => c.employee_id === emp.id);
      const totalCalls = empCalls.length;
      const answeredCalls = empCalls.filter(c => c.status === "answered" || c.status === "COMPLETED").length;
      const inboundCalls = empCalls.filter(c => (c.direction || "").toUpperCase() === "INBOUND").length;
      const outboundCalls = empCalls.filter(c => (c.direction || "OUTBOUND").toUpperCase() === "OUTBOUND").length;
      const totalSeconds = empCalls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
      const avgSeconds = answeredCalls > 0 ? Math.round(totalSeconds / answeredCalls) : 0;
      const connectionRate = totalCalls > 0 ? ((answeredCalls / totalCalls) * 100).toFixed(1) : "0.0";
      const ptpCount = empCalls.filter(c => (c.call_outcome || "").includes("Promise to Pay")).length;
      const disputeCount = empCalls.filter(c => (c.call_outcome || "").includes("Disput")).length;

      const extension = AGENT_EXTENSIONS[emp.id] || emp.employee_id.replace(/\D/g, "").slice(-4) || "1012";

      return {
        employee_id: emp.id,
        emp_code: emp.employee_id,
        name: emp.full_name,
        role: emp.role,
        department: emp.department,
        extension,
        total_calls: totalCalls,
        answered_calls: answeredCalls,
        inbound_calls: inboundCalls,
        outbound_calls: outboundCalls,
        connection_rate: parseFloat(connectionRate),
        total_duration_seconds: totalSeconds,
        total_duration_formatted: formatTotalDuration(totalSeconds),
        avg_duration_seconds: avgSeconds,
        avg_duration_formatted: formatDuration(avgSeconds),
        ptp_conversions: ptpCount,
        disputes_handled: disputeCount,
        quality_score: 98.5
      };
    });

    return res.status(200).json({
      success: true,
      message: `${reports.length} employee calling report(s) retrieved.`,
      data: {
        agentReports: reports
      }
    });
  } catch (error) {
    console.error("getAgentCallingReports Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/telephony/recordings/:callId
 * Get recording metadata and generate a signed URL for access.
 */
export const getCallRecording = async (req, res) => {
  try {
    const { callId } = req.params;

    const recording = memoryStore.call_recordings.find(r => r.call_id === callId);
    if (!recording) {
      return res.status(404).json({ success: false, message: `No recording found for call '${callId}'.` });
    }

    // Verify access: callers can only access recordings of their own calls
    const callRecord = memoryStore.calls.find(c => c.id === callId);
    if (
      callRecord &&
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      callRecord.employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "You do not have access to this recording." });
    }

    // Generate signed URL
    const signedUrlResult = await telephonyProvider.generateSignedUrl(recording.s3_key, 3600);

    // Log access
    const accessLog = {
      id: `ral_${uuidv4()}`,
      recording_id: recording.id,
      call_id: callId,
      accessed_by: req.user.id,
      accessed_by_name: req.user.fullName,
      accessed_by_role: req.user.role,
      access_type: "STREAM",
      ip_address: req.ip || req.connection?.remoteAddress || "unknown",
      accessed_at: new Date().toISOString()
    };
    memoryStore.recording_access_logs.push(accessLog);

    return res.status(200).json({
      success: true,
      message: "Recording metadata retrieved with signed URL.",
      data: {
        recording: {
          ...recording,
          signed_url: signedUrlResult.signed_url,
          signed_url_expires_at: signedUrlResult.expires_at,
          signed_url_expires_in: signedUrlResult.expires_in_seconds
        },
        access_log_id: accessLog.id
      }
    });
  } catch (error) {
    console.error("getCallRecording Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
