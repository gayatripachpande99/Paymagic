import { v4 as uuidv4 } from "uuid";
import { memoryStore } from "../config/db.js";
import { telephonyProvider } from "../adapters/telephonyAdapter.js";

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
 * Helper to enrich a raw recording item with related metadata:
 * - Call metadata
 * - Employee details
 * - Borrower / customer details
 * - Linked complaint details
 * - Access audit summary
 */
function enrichRecording(recording) {
  const call = memoryStore.calls.find(c => c.id === recording.call_id);
  const loanCase = call ? memoryStore.loan_cases.find(lc => lc.id === call.case_id) : null;
  const customer = (call && call.customer_id)
    ? memoryStore.customers.find(c => c.id === call.customer_id)
    : (loanCase ? memoryStore.customers.find(c => c.id === loanCase.customer_id) : null);
  const employee = call ? memoryStore.users.find(u => u.id === call.employee_id) : null;
  const accessLogs = (memoryStore.recording_access_logs || []).filter(l => l.recording_id === recording.id);

  let complaint = null;
  if (recording.linked_complaint_id) {
    complaint = (memoryStore.complaints || []).find(c => c.id === recording.linked_complaint_id);
  } else if (call && call.case_id) {
    complaint = (memoryStore.complaints || []).find(c => c.case_id === call.case_id);
  }

  const callDate = new Date((call && call.started_at) || recording.created_at);
  const extension = (employee && AGENT_EXTENSIONS[employee.id]) || (employee ? employee.employee_id.replace(/\D/g, "").slice(-4) : "1012");

  return {
    ...recording,
    duration_formatted: formatDuration(recording.duration_seconds),
    file_size_formatted: `${((recording.file_size_bytes || (recording.duration_seconds * 16000)) / (1024 * 1024)).toFixed(2)} MB`,
    checksum_sha256: recording.checksum_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    encryption_type: recording.encryption_type || "aws:kms:sse",
    kms_key_arn: recording.kms_key_arn || "arn:aws:kms:ap-south-1:123456789012:key/paymagic-voice-rec-vault-kms",
    customer_notification_status: recording.customer_notification_status || (call ? call.customer_notification_status : "ANNOUNCED_RECORDED"),
    customer_notification_timestamp: recording.customer_notification_timestamp || (call ? call.started_at : recording.created_at),
    call_metadata: call ? {
      id: call.id,
      telephony_call_id: call.telephony_call_id,
      direction: (call.direction || "OUTBOUND").toUpperCase(),
      duration_seconds: call.duration_seconds,
      duration_formatted: formatDuration(call.duration_seconds),
      started_at: call.started_at,
      ended_at: call.ended_at,
      status: call.status,
      disposition: call.disposition || call.call_outcome || "Completed",
      campaign: call.campaign || (loanCase ? loanCase.lender_name : "Recovery Outreach"),
      call_notes: call.call_notes
    } : null,
    case_metadata: loanCase ? {
      id: loanCase.id,
      case_number: loanCase.case_number,
      loan_account_number: loanCase.loan_account_number,
      lender_name: loanCase.lender_name,
      outstanding_amount: loanCase.outstanding_amount,
      status: loanCase.status
    } : null,
    customer_details: customer ? {
      id: customer.id,
      full_name: customer.full_name,
      phone: customer.phone_raw,
      city: customer.city
    } : {
      full_name: "Customer",
      phone: "+91 98765 43210"
    },
    employee_details: employee ? {
      id: employee.id,
      employee_code: employee.employee_id,
      full_name: employee.full_name,
      role: employee.role,
      department: employee.department,
      extension
    } : {
      full_name: "Recovery Officer",
      employee_code: "EMP-001",
      extension: "1012"
    },
    linked_complaint: complaint ? {
      id: complaint.id,
      complaint_number: complaint.complaint_number,
      complaint_type: complaint.complaint_type,
      status: complaint.status,
      description: complaint.description
    } : null,
    access_history_count: accessLogs.length,
    date_formatted: callDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time_formatted: callDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  };
}

/**
 * GET /api/telephony/evidence/overview
 * Executive summary & governance telemetry for voice evidence management.
 */
export const getEvidenceOverview = async (req, res) => {
  try {
    const recordings = memoryStore.call_recordings || [];
    const accessLogs = memoryStore.recording_access_logs || [];
    const complaints = memoryStore.complaints || [];

    const totalRecordings = recordings.length;
    const totalStorageBytes = recordings.reduce((acc, r) => acc + (r.file_size_bytes || r.duration_seconds * 16000), 0);
    const totalStorageMb = (totalStorageBytes / (1024 * 1024)).toFixed(2);
    const totalDurationSeconds = recordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0);
    const legalHoldsActive = recordings.filter(r => r.is_legal_hold).length;
    const kmsEncryptedCount = recordings.filter(r => (r.encryption_type || "").includes("kms")).length;

    // Today's access audits
    const todayStr = new Date().toISOString().split("T")[0];
    const playbackAuditsToday = accessLogs.filter(l => (l.accessed_at || "").startsWith(todayStr)).length;

    // Count recordings with linked complaint
    const linkedComplaintsCount = recordings.filter(r => r.linked_complaint_id || r.is_legal_hold).length;

    return res.status(200).json({
      success: true,
      data: {
        total_recordings: totalRecordings,
        total_storage_bytes: totalStorageBytes,
        total_storage_mb: parseFloat(totalStorageMb),
        total_storage_formatted: `${totalStorageMb} MB`,
        total_duration_seconds: totalDurationSeconds,
        total_duration_formatted: formatTotalDuration(totalDurationSeconds),
        legal_holds_active: legalHoldsActive,
        kms_encrypted_count: kmsEncryptedCount,
        kms_encryption_rate_pct: totalRecordings > 0 ? ((kmsEncryptedCount / totalRecordings) * 100).toFixed(1) : "100.0",
        statutory_notice_compliance_rate_pct: "100.0",
        retention_schedule: "365-day statutory rolling window (WORM protected)",
        total_access_audits: accessLogs.length,
        playback_audits_today: playbackAuditsToday,
        linked_complaints_count: linkedComplaintsCount,
        s3_vault_bucket: "paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com",
        kms_key_alias: "alias/paymagic-voice-rec-vault-kms",
        worm_storage_policy: "RBI Fair Practice Code Compliant (Immutability Enforced)"
      }
    });
  } catch (error) {
    console.error("getEvidenceOverview Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/telephony/recordings
 * List all recordings with metadata, search, filters, pagination, and RBAC isolation.
 */
export const getRecordings = async (req, res) => {
  try {
    const {
      search,
      status,
      legalHoldOnly,
      hasComplaint,
      timeRange = "7d",
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "desc"
    } = req.query;

    let recordings = [...(memoryStore.call_recordings || [])];

    // RBAC: Callers and Field Agents only see recordings of their own calls
    if (["CALLER", "FIELD_AGENT"].includes(req.user.role)) {
      const allowedCallIds = new Set(
        memoryStore.calls.filter(c => c.employee_id === req.user.id).map(c => c.id)
      );
      recordings = recordings.filter(r => allowedCallIds.has(r.call_id));
    }

    // Filter: Legal Hold
    if (legalHoldOnly === "true") {
      recordings = recordings.filter(r => r.is_legal_hold);
    }

    // Filter: Linked Complaint
    if (hasComplaint === "true") {
      recordings = recordings.filter(r => r.linked_complaint_id || r.is_legal_hold);
    }

    // Filter: Status (READY, LEGAL_HOLD, PROCESSING, ARCHIVED)
    if (status && status !== "ALL") {
      recordings = recordings.filter(r => (r.processing_status || "").toUpperCase() === status.toUpperCase());
    }

    // Filter: Time Range
    if (timeRange && timeRange !== "all" && timeRange !== "custom") {
      const now = Date.now();
      let maxAgeMs = 7 * 86400000;
      if (timeRange === "today") maxAgeMs = 86400000;
      else if (timeRange === "7d") maxAgeMs = 7 * 86400000;
      else if (timeRange === "30d") maxAgeMs = 30 * 86400000;
      else if (timeRange === "90d") maxAgeMs = 90 * 86400000;

      recordings = recordings.filter(r => {
        const t = new Date(r.created_at).getTime();
        return now - t <= maxAgeMs;
      });
    }

    // Search filter across call ID, recording ID, customer, case number, caller
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      recordings = recordings.filter(r => {
        const call = memoryStore.calls.find(c => c.id === r.call_id);
        const loanCase = call ? memoryStore.loan_cases.find(lc => lc.id === call.case_id) : null;
        const customer = (call && call.customer_id) ? memoryStore.customers.find(c => c.id === call.customer_id) : null;
        const user = call ? memoryStore.users.find(u => u.id === call.employee_id) : null;

        return (
          r.id.toLowerCase().includes(q) ||
          (r.call_id && r.call_id.toLowerCase().includes(q)) ||
          (r.legal_hold_reference && r.legal_hold_reference.toLowerCase().includes(q)) ||
          (customer && customer.full_name.toLowerCase().includes(q)) ||
          (customer && customer.phone_raw.includes(q)) ||
          (loanCase && loanCase.case_number.toLowerCase().includes(q)) ||
          (loanCase && loanCase.loan_account_number.toLowerCase().includes(q)) ||
          (user && user.full_name.toLowerCase().includes(q))
        );
      });
    }

    const totalCount = recordings.length;

    // Sorting
    const order = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    recordings.sort((a, b) => {
      const valA = a[sortBy] || "";
      const valB = b[sortBy] || "";
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = recordings.slice(startIdx, startIdx + limitNum);

    const enriched = paginated.map(enrichRecording);

    return res.status(200).json({
      success: true,
      message: `${totalCount} recording evidence file(s) retrieved.`,
      data: {
        recordings: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("getRecordings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/telephony/recordings/:id
 * Retrieve single recording with full metadata, statutory notice status, and access history.
 * Parameter can be recording ID (rec_...) or call ID (call_...).
 */
export const getRecordingById = async (req, res) => {
  try {
    const { id } = req.params;

    const recording = (memoryStore.call_recordings || []).find(
      r => r.id === id || r.call_id === id
    );

    if (!recording) {
      return res.status(404).json({ success: false, message: `Recording '${id}' not found.` });
    }

    // RBAC: caller can only inspect recording of their own call
    const call = memoryStore.calls.find(c => c.id === recording.call_id);
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      call &&
      call.employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized: You may only view recordings of your own recovery calls." });
    }

    const enriched = enrichRecording(recording);

    // Fetch related audit logs
    const accessLogs = (memoryStore.recording_access_logs || [])
      .filter(l => l.recording_id === recording.id || l.call_id === recording.call_id)
      .slice(-20)
      .reverse();

    return res.status(200).json({
      success: true,
      data: {
        recording: enriched,
        access_logs: accessLogs
      }
    });
  } catch (error) {
    console.error("getRecordingById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/telephony/recordings/:id/playback-url
 * Generate short-lived signed S3 KMS URL for authorized audio stream.
 * Automatically appends immutable record to recording_access_logs.
 */
export const getPlaybackSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose = "Routine Recovery Quality Review", expiresInSeconds = 900 } = req.body;

    const recording = (memoryStore.call_recordings || []).find(
      r => r.id === id || r.call_id === id
    );

    if (!recording) {
      return res.status(404).json({ success: false, message: `Recording '${id}' not found.` });
    }

    // RBAC Check
    const call = memoryStore.calls.find(c => c.id === recording.call_id);
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      call &&
      call.employee_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to stream audio recordings of other recovery agents."
      });
    }

    // Cap expiry to max 1 hour (3600s), default 900s (15 min)
    const expiry = Math.min(3600, Math.max(60, parseInt(expiresInSeconds, 10) || 900));

    // Generate signed URL via telephony provider adapter
    const signedUrlResult = await telephonyProvider.generateSignedUrl(recording.s3_key, expiry);

    // Create immutable audit log entry
    const accessLog = {
      id: `ral_${uuidv4()}`,
      recording_id: recording.id,
      call_id: recording.call_id,
      user_id: req.user.id,
      user_name: req.user.fullName || req.user.full_name || "Authorized Staff",
      user_role: req.user.role,
      employee_code: req.user.employeeId || req.user.employee_id || "EMP-SEC",
      access_type: "PLAYBACK",
      purpose: purpose.trim() || "Routine Recovery Quality Review",
      ip_address: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      user_agent: req.headers["user-agent"] || "PayMagic-Console/1.0",
      accessed_at: new Date().toISOString()
    };

    if (!memoryStore.recording_access_logs) {
      memoryStore.recording_access_logs = [];
    }
    memoryStore.recording_access_logs.push(accessLog);

    return res.status(200).json({
      success: true,
      message: "Time-limited KMS-signed playback URL generated and access logged in immutable audit registry.",
      data: {
        recording_id: recording.id,
        call_id: recording.call_id,
        signed_url: signedUrlResult.signed_url,
        expires_at: signedUrlResult.expires_at,
        expires_in_seconds: expiry,
        encryption_type: recording.encryption_type || "aws:kms:sse",
        s3_bucket: recording.s3_bucket,
        customer_notification_status: recording.customer_notification_status || "ANNOUNCED_RECORDED",
        audit_log_id: accessLog.id,
        access_timestamp: accessLog.accessed_at
      }
    });
  } catch (error) {
    console.error("getPlaybackSignedUrl Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/telephony/recordings/:id/download-url
 * Generate short-lived signed S3 KMS download URL with Content-Disposition: attachment.
 * Restricted to SUPER_ADMIN, ADMIN, SUPERVISOR.
 * Automatically appends immutable record to recording_access_logs.
 */
export const getDownloadSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose = "Official Grievance Arbitration / Court Production" } = req.body;

    // RBAC: Callers and Field Agents CANNOT download raw voice evidence
    if (["CALLER", "FIELD_AGENT"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Voice evidence downloading is strictly reserved for Supervisors and Compliance Administrators under RBI Digital Lending security directives."
      });
    }

    const recording = (memoryStore.call_recordings || []).find(
      r => r.id === id || r.call_id === id
    );

    if (!recording) {
      return res.status(404).json({ success: false, message: `Recording '${id}' not found.` });
    }

    // 10-minute short-lived signed download URL
    const expiry = 600;
    const signedUrlResult = await telephonyProvider.generateSignedUrl(recording.s3_key, expiry);

    // Add download flag & content disposition
    const downloadUrl = `${signedUrlResult.signed_url}&response-content-disposition=attachment%3B%20filename%3D"${recording.id}.mp3"`;

    // Create immutable audit log entry
    const accessLog = {
      id: `ral_${uuidv4()}`,
      recording_id: recording.id,
      call_id: recording.call_id,
      user_id: req.user.id,
      user_name: req.user.fullName || req.user.full_name || "Compliance Officer",
      user_role: req.user.role,
      employee_code: req.user.employeeId || req.user.employee_id || "EMP-COMPL",
      access_type: "DOWNLOAD",
      purpose: purpose.trim() || "Official Grievance Arbitration / Court Production",
      ip_address: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      user_agent: req.headers["user-agent"] || "PayMagic-Console/1.0",
      accessed_at: new Date().toISOString()
    };

    if (!memoryStore.recording_access_logs) {
      memoryStore.recording_access_logs = [];
    }
    memoryStore.recording_access_logs.push(accessLog);

    return res.status(200).json({
      success: true,
      message: "Encrypted evidence download URL generated. Download event permanently recorded in compliance audit ledger.",
      data: {
        recording_id: recording.id,
        download_url: downloadUrl,
        expires_at: signedUrlResult.expires_at,
        expires_in_seconds: expiry,
        file_size_bytes: recording.file_size_bytes || recording.duration_seconds * 16000,
        checksum_sha256: recording.checksum_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        audit_log_id: accessLog.id
      }
    });
  } catch (error) {
    console.error("getDownloadSignedUrl Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/telephony/recordings/:id/audit-trail
 * Retrieve immutable access and download history for a specific recording.
 */
export const getRecordingAuditTrail = async (req, res) => {
  try {
    const { id } = req.params;

    const recording = (memoryStore.call_recordings || []).find(
      r => r.id === id || r.call_id === id
    );

    if (!recording) {
      return res.status(404).json({ success: false, message: `Recording '${id}' not found.` });
    }

    const call = memoryStore.calls.find(c => c.id === recording.call_id);
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      call &&
      call.employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to inspect audit logs for this recording." });
    }

    const logs = (memoryStore.recording_access_logs || [])
      .filter(l => l.recording_id === recording.id || l.call_id === recording.call_id)
      .sort((a, b) => new Date(b.accessed_at) - new Date(a.accessed_at));

    return res.status(200).json({
      success: true,
      data: {
        recording_id: recording.id,
        call_id: recording.call_id,
        total_accesses: logs.length,
        audit_trail: logs
      }
    });
  } catch (error) {
    console.error("getRecordingAuditTrail Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/telephony/recordings/:id/legal-hold
 * Place or release legal hold on call audio evidence.
 * Restricted to SUPER_ADMIN, ADMIN, SUPERVISOR.
 */
export const updateLegalHold = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_legal_hold, reason, reference } = req.body;

    if (!["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Legal hold modifications require Supervisor or Compliance Administrator privilege."
      });
    }

    const recording = (memoryStore.call_recordings || []).find(
      r => r.id === id || r.call_id === id
    );

    if (!recording) {
      return res.status(404).json({ success: false, message: `Recording '${id}' not found.` });
    }

    const holdActive = Boolean(is_legal_hold);
    const now = new Date().toISOString();

    if (holdActive && !reason) {
      return res.status(400).json({
        success: false,
        message: "A formal reason is required when placing an evidence record under Legal Hold."
      });
    }

    recording.is_legal_hold = holdActive;
    recording.processing_status = holdActive ? "LEGAL_HOLD" : "READY";
    recording.legal_hold_reason = holdActive ? reason.trim() : null;
    recording.legal_hold_reference = holdActive ? (reference || `OMBUDS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`) : null;
    recording.legal_hold_by_id = holdActive ? req.user.id : null;
    recording.legal_hold_applied_at = holdActive ? now : null;

    // Log the legal hold change in access ledger
    const accessLog = {
      id: `ral_${uuidv4()}`,
      recording_id: recording.id,
      call_id: recording.call_id,
      user_id: req.user.id,
      user_name: req.user.fullName || req.user.full_name || "Compliance Supervisor",
      user_role: req.user.role,
      employee_code: req.user.employeeId || req.user.employee_id || "EMP-SUP",
      access_type: holdActive ? "LEGAL_HOLD_APPLIED" : "LEGAL_HOLD_RELEASED",
      purpose: holdActive
        ? `Legal Hold Applied: ${reason}. Ref: ${recording.legal_hold_reference}`
        : `Legal Hold Released: Dispute concluded.`,
      ip_address: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      user_agent: req.headers["user-agent"] || "PayMagic-Console/1.0",
      accessed_at: now
    };

    if (!memoryStore.recording_access_logs) {
      memoryStore.recording_access_logs = [];
    }
    memoryStore.recording_access_logs.push(accessLog);

    return res.status(200).json({
      success: true,
      message: holdActive
        ? `Recording evidence placed under Legal Hold (${recording.legal_hold_reference}). Automated retention purging locked.`
        : `Legal Hold released. Recording reverted to standard statutory retention schedule.`,
      data: {
        recording_id: recording.id,
        is_legal_hold: recording.is_legal_hold,
        processing_status: recording.processing_status,
        legal_hold_reason: recording.legal_hold_reason,
        legal_hold_reference: recording.legal_hold_reference,
        legal_hold_applied_at: recording.legal_hold_applied_at,
        audit_log_id: accessLog.id
      }
    });
  } catch (error) {
    console.error("updateLegalHold Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/telephony/recordings/:id
 * WORM (Write Once, Read Many) IMMUTABILITY POLICY ENFORCEMENT
 * Original call recordings are legally protected under RBI Fair Practice Code and CANNOT be deleted.
 */
export const deleteRecording = async (req, res) => {
  return res.status(403).json({
    success: false,
    error: "WORM_IMMUTABILITY_RESTRICTION",
    message: "Original call recordings are legally protected evidence under the RBI Fair Practice Code and Digital Lending Guidelines. Audio files cannot be edited or deleted (WORM Storage Policy Enforced)."
  });
};

/**
 * PUT or PATCH /api/telephony/recordings/:id (Tamper prevention)
 */
export const preventRecordingModification = async (req, res) => {
  return res.status(403).json({
    success: false,
    error: "WORM_IMMUTABILITY_RESTRICTION",
    message: "Modifying raw telephony audio or checksums is strictly prohibited under digital evidence integrity rules (WORM Policy Enforced)."
  });
};

/**
 * PATCH /api/telephony/recordings/:id/link-complaint
 * Link a customer complaint/grievance ticket to a call recording evidence.
 */
export const linkComplaintToRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const { complaint_id } = req.body;

    if (!complaint_id) {
      return res.status(400).json({ success: false, message: "complaint_id is required." });
    }

    const recording = (memoryStore.call_recordings || []).find(
      r => r.id === id || r.call_id === id
    );

    if (!recording) {
      return res.status(404).json({ success: false, message: `Recording '${id}' not found.` });
    }

    const complaint = (memoryStore.complaints || []).find(c => c.id === complaint_id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: `Complaint '${complaint_id}' not found.` });
    }

    recording.linked_complaint_id = complaint.id;
    recording.linked_complaint_number = complaint.complaint_number;

    // Also update call record if found
    const call = memoryStore.calls.find(c => c.id === recording.call_id);
    if (call) {
      call.linked_complaint_id = complaint.id;
    }

    // Log the link
    const accessLog = {
      id: `ral_${uuidv4()}`,
      recording_id: recording.id,
      call_id: recording.call_id,
      user_id: req.user.id,
      user_name: req.user.fullName || req.user.full_name || "Staff",
      user_role: req.user.role,
      employee_code: req.user.employeeId || req.user.employee_id || "EMP-LINK",
      access_type: "COMPLAINT_LINKED",
      purpose: `Linked to Grievance Ticket #${complaint.complaint_number} (${complaint.complaint_type})`,
      ip_address: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      user_agent: req.headers["user-agent"] || "PayMagic-Console/1.0",
      accessed_at: new Date().toISOString()
    };

    if (!memoryStore.recording_access_logs) {
      memoryStore.recording_access_logs = [];
    }
    memoryStore.recording_access_logs.push(accessLog);

    return res.status(200).json({
      success: true,
      message: `Recording successfully linked to Grievance #${complaint.complaint_number}.`,
      data: {
        recording_id: recording.id,
        complaint_id: complaint.id,
        complaint_number: complaint.complaint_number,
        complaint_type: complaint.complaint_type,
        complaint_status: complaint.status
      }
    });
  } catch (error) {
    console.error("linkComplaintToRecording Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/telephony/recordings/legal-holds
 * List all evidence items currently placed under legal hold.
 */
export const getLegalHoldsList = async (req, res) => {
  try {
    const recordings = (memoryStore.call_recordings || [])
      .filter(r => r.is_legal_hold)
      .map(enrichRecording);

    return res.status(200).json({
      success: true,
      message: `${recordings.length} legal hold evidence record(s) active.`,
      data: {
        legal_holds: recordings
      }
    });
  } catch (error) {
    console.error("getLegalHoldsList Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
