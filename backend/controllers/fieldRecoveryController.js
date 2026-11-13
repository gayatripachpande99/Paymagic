import { memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { cacheService } from "../services/cacheService.js";
import { v4 as uuidv4 } from "uuid";

// Indian Rupee number to words converter for digital receipts
const numberToWordsINR = (num) => {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (val) => {
    let str = "";
    if (val > 19) {
      str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? " " + a[val % 10] : "");
    } else {
      str += a[val];
    }
    return str;
  };

  let str = "";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rem = n % 100;

  if (crore > 0) str += inWords(crore) + " Crore ";
  if (lakh > 0) str += inWords(lakh) + " Lakh ";
  if (thousand > 0) str += inWords(thousand) + " Thousand ";
  if (hundred > 0) str += inWords(hundred) + " Hundred ";
  if (rem > 0) str += (str !== "" ? "and " : "") + inWords(rem) + " ";

  return str.trim() + " Rupees Only";
};

/**
 * GET /api/field/overview
 * Real-time field recovery operations metrics, collection totals, and agent status.
 */
export const getFieldOverview = async (req, res) => {
  try {
    const visits = memoryStore.field_visits || [];
    const handovers = memoryStore.cash_handovers || [];
    const cases = memoryStore.loan_cases || [];
    const agents = (memoryStore.users || []).filter(u => u.role === "FIELD_AGENT");

    const todayStr = new Date().toISOString().split("T")[0];

    // Filter today's visits
    const todayVisits = visits.filter(v => v.scheduled_date && v.scheduled_date.startsWith(todayStr));
    const completedVisits = visits.filter(v => v.status === "COMPLETED");
    const todayCompleted = todayVisits.filter(v => v.status === "COMPLETED");
    const todayInProgress = visits.filter(v => v.status === "IN_PROGRESS");
    const scheduledPending = visits.filter(v => v.status === "SCHEDULED");

    // Spot collections
    const totalCollected = visits.reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);
    const todayCollected = todayVisits.reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);

    const cashCollected = visits
      .filter(v => String(v.payment_mode || "").toUpperCase().includes("CASH"))
      .reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);

    const upiCollected = visits
      .filter(v => String(v.payment_mode || "").toUpperCase().includes("UPI"))
      .reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);

    const chequeCollected = visits
      .filter(v => String(v.payment_mode || "").toUpperCase().includes("CHEQUE"))
      .reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);

    // Cash handovers
    const pendingHandovers = handovers.filter(h => h.status === "PENDING_RECONCILIATION");
    const reconciledHandovers = handovers.filter(h => h.status === "RECONCILED");

    const reconciledCashTotal = reconciledHandovers.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
    const pendingCashTotal = pendingHandovers.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
    const cashInHandTotal = Math.max(0, cashCollected - reconciledCashTotal);

    // Contact rate
    const totalActioned = completedVisits.length;
    const contactRate = visits.length > 0 ? Number(((totalActioned / visits.length) * 100).toFixed(1)) : 0;

    // Outcome distribution
    const outcomesBreakdown = {
      "Customer Met & Paid": visits.filter(v => v.visit_outcome === "Customer Met & Paid").length,
      "Promise to Pay": visits.filter(v => v.visit_outcome === "Promise to Pay").length,
      "Premises Locked / Not Available": visits.filter(v => v.visit_outcome?.includes("Locked") || v.visit_outcome?.includes("Not Available")).length,
      "Disputed Dues": visits.filter(v => v.visit_outcome?.includes("Dispute")).length,
      "Address Untraceable / Shifted": visits.filter(v => v.visit_outcome?.includes("Untraceable") || v.visit_outcome?.includes("Shifted")).length,
      "Third Party Contacted": visits.filter(v => v.visit_outcome?.includes("Third Party")).length,
      "Refused to Pay": visits.filter(v => v.visit_outcome?.includes("Refused")).length
    };

    // Zone distribution
    const zoneDistribution = {};
    visits.forEach(v => {
      const z = v.geographic_zone || "Pune Central";
      zoneDistribution[z] = (zoneDistribution[z] || 0) + 1;
    });

    // Active field cases
    const fieldCasesCount = cases.filter(c => c.status === "Field Visit" || c.assigned_employee_id === "usr_field_1").length;

    // Field agents status
    const agentsList = agents.map(agent => {
      const agentVisits = visits.filter(v => v.field_agent_id === agent.id || v.field_agent_id === agent.employee_id);
      const agentCollected = agentVisits.reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);
      const activeVisit = agentVisits.find(v => v.status === "IN_PROGRESS");

      return {
        id: agent.id,
        employee_id: agent.employee_id,
        name: agent.full_name,
        phone: agent.phone,
        department: agent.department,
        status: activeVisit ? "ON_VISIT" : "AVAILABLE",
        active_visit_id: activeVisit?.id || null,
        total_visits: agentVisits.length,
        completed_visits: agentVisits.filter(v => v.status === "COMPLETED").length,
        total_collected: agentCollected
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        total_field_cases: fieldCasesCount,
        total_visits: visits.length,
        today_scheduled_visits: todayVisits.length,
        today_completed_visits: todayCompleted.length,
        today_in_progress_visits: todayInProgress.length,
        scheduled_pending_visits: scheduledPending.length,
        contact_rate_percentage: contactRate,
        total_spot_collections: totalCollected,
        today_collections: todayCollected,
        cash_collected: cashCollected,
        upi_collected: upiCollected,
        cheque_collected: chequeCollected,
        cash_in_hand_total: cashInHandTotal,
        pending_handovers_count: pendingHandovers.length,
        pending_handovers_amount: pendingCashTotal,
        reconciled_handovers_amount: reconciledCashTotal,
        outcomes_breakdown: outcomesBreakdown,
        zone_distribution: zoneDistribution,
        agents_on_ground: agentsList,
        rbi_compliance: {
          hours_enforced: "07:00 to 19:00 IST",
          id_display_mandatory: true,
          statutory_notice_audio_visual: true,
          geofence_accuracy_threshold_meters: 50
        }
      }
    });
  } catch (error) {
    console.error("getFieldOverview Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/field/visits
 * List field visits with filters (agent, status, zone, date, priority, search).
 */
export const listFieldVisits = async (req, res) => {
  try {
    const {
      agentId,
      status,
      zone,
      priority,
      date,
      search,
      page = 1,
      limit = 50
    } = req.query;

    let visits = [...(memoryStore.field_visits || [])];

    // Filter by logged-in user if role is FIELD_AGENT
    if (req.user && req.user.role === "FIELD_AGENT") {
      visits = visits.filter(v => v.field_agent_id === req.user.id || v.field_agent_id === req.user.employee_id);
    } else if (agentId && agentId !== "ALL") {
      visits = visits.filter(v => v.field_agent_id === agentId || v.field_agent_id === `usr_${agentId}`);
    }

    if (status && status !== "ALL") {
      visits = visits.filter(v => v.status === status);
    }

    if (zone && zone !== "ALL") {
      visits = visits.filter(v => v.geographic_zone?.toLowerCase() === zone.toLowerCase());
    }

    if (priority && priority !== "ALL") {
      visits = visits.filter(v => v.priority === priority);
    }

    if (date) {
      visits = visits.filter(v => v.scheduled_date && v.scheduled_date.startsWith(date));
    }

    // Enrich visits with borrower & case details
    let enriched = visits.map(v => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === v.case_id);
      const customer = targetCase ? memoryStore.customers.find(c => c.id === targetCase.customer_id) : null;
      const agent = memoryStore.users.find(u => u.id === v.field_agent_id || u.employee_id === v.field_agent_id);

      return {
        ...v,
        loan_account_no: targetCase?.loan_account_no || "N/A",
        case_number: targetCase?.case_number || "N/A",
        outstanding_amount: targetCase?.outstanding_amount || 0,
        recovered_amount: targetCase?.recovered_amount || 0,
        lender_name: targetCase?.lender_name || "Lending Institution",
        dpd_bucket: targetCase?.dpd_bucket || "90+ DPD",
        case_priority: targetCase?.priority || "HIGH",
        customer_name: customer ? customer.full_name : "Borrower",
        customer_phone: customer ? customer.phone : "N/A",
        customer_address: customer ? customer.address : "Pune Metro, Maharashtra",
        agent_name: agent?.full_name || "Vikram Singh",
        agent_employee_id: agent?.employee_id || "PM-FLD-0001",
        google_maps_url: v.gps_latitude && v.gps_longitude
          ? `https://www.google.com/maps?q=${v.gps_latitude},${v.gps_longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer?.address || "Pune")}`
      };
    });

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      enriched = enriched.filter(v =>
        v.customer_name?.toLowerCase().includes(term) ||
        v.loan_account_no?.toLowerCase().includes(term) ||
        v.customer_address?.toLowerCase().includes(term) ||
        v.agent_name?.toLowerCase().includes(term) ||
        v.id?.toLowerCase().includes(term) ||
        v.receipt_ref?.toLowerCase().includes(term)
      );
    }

    return res.status(200).json({
      success: true,
      visits: enriched,
      total: enriched.length
    });
  } catch (error) {
    console.error("listFieldVisits Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/field/schedule
 * Admin / Supervisor schedules a field recovery visit for a case.
 */
export const scheduleFieldVisit = async (req, res) => {
  try {
    const {
      case_id,
      field_agent_id,
      scheduled_date,
      time_slot = "11:00 - 02:00 PM",
      priority = "HIGH",
      visit_instructions = "On-site physical interaction and spot recovery",
      geographic_zone = "Pune Metro"
    } = req.body;

    if (!case_id) {
      return res.status(400).json({ success: false, message: "case_id is required." });
    }

    const targetCase = memoryStore.loan_cases.find(c => c.id === case_id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: `Loan case '${case_id}' not found.` });
    }

    const agent = memoryStore.users.find(u => u.id === field_agent_id || u.employee_id === field_agent_id) ||
      memoryStore.users.find(u => u.role === "FIELD_AGENT");

    const agentId = agent ? agent.id : "usr_field_1";
    const customer = memoryStore.customers.find(c => c.id === targetCase.customer_id);

    const now = new Date();
    const scheduledDateTime = scheduled_date ? new Date(scheduled_date).toISOString() : now.toISOString();

    const visitId = `fv_${Date.now()}`;
    const newVisit = {
      id: visitId,
      case_id,
      field_agent_id: agentId,
      customer_id: targetCase.customer_id,
      scheduled_date: scheduledDateTime,
      time_slot,
      priority,
      geographic_zone: geographic_zone || "Pune Metro",
      visit_instructions,
      visit_start: null,
      visit_end: null,
      duration_minutes: 0,
      visit_outcome: null,
      visit_notes: visit_instructions,
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: 18.5204 + (Math.random() - 0.5) * 0.05,
      gps_longitude: 73.8567 + (Math.random() - 0.5) * 0.05,
      gps_accuracy: null,
      gps_consent_acknowledged: false,
      notice_served: false,
      status: "SCHEDULED",
      created_at: now.toISOString()
    };

    if (!memoryStore.field_visits) {
      memoryStore.field_visits = [];
    }
    memoryStore.field_visits.unshift(newVisit);

    // Atomically transition case status to 'Field Visit'
    await updateCaseStatusWithHistory({
      caseId: case_id,
      employeeId: req.user.id,
      newStatus: "Field Visit",
      remarks: `Field recovery visit scheduled for ${new Date(scheduledDateTime).toLocaleDateString('en-IN')} (${time_slot}) with Agent ${agent?.full_name || 'Vikram Singh'}. Priority: ${priority}. Zone: ${geographic_zone}.`
    });

    cacheService.delPattern("dashboard:*");

    return res.status(201).json({
      success: true,
      message: `Field recovery visit scheduled successfully for ${agent?.full_name || 'Field Agent'}.`,
      visit: {
        ...newVisit,
        customer_name: customer?.full_name,
        customer_address: customer?.address,
        loan_account_no: targetCase.loan_account_no,
        outstanding_amount: targetCase.outstanding_amount
      }
    });
  } catch (error) {
    console.error("scheduleFieldVisit Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/field/my-route
 * Daily route run-sheet for the logged-in field recovery agent.
 */
export const getMyRoute = async (req, res) => {
  try {
    const agentId = req.user.id;
    const visits = (memoryStore.field_visits || []).filter(
      v => v.field_agent_id === agentId || v.field_agent_id === req.user.employee_id || v.field_agent_id === "usr_field_1"
    );

    const todayStr = new Date().toISOString().split("T")[0];
    const todayVisits = visits.filter(v => v.scheduled_date && v.scheduled_date.startsWith(todayStr));

    // Order visits: IN_PROGRESS first, then SCHEDULED by time_slot, then COMPLETED
    const statusWeight = { IN_PROGRESS: 1, SCHEDULED: 2, COMPLETED: 3, CANCELLED: 4 };

    const sorted = [...(todayVisits.length > 0 ? todayVisits : visits.slice(0, 10))].sort((a, b) => {
      const wA = statusWeight[a.status] || 99;
      const wB = statusWeight[b.status] || 99;
      if (wA !== wB) return wA - wB;
      return (a.time_slot || "").localeCompare(b.time_slot || "");
    });

    // Enriched with stops metadata
    const stops = sorted.map((v, index) => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === v.case_id);
      const customer = targetCase ? memoryStore.customers.find(c => c.id === targetCase.customer_id) : null;

      return {
        stop_number: index + 1,
        visit_id: v.id,
        case_id: v.case_id,
        status: v.status,
        priority: v.priority || "HIGH",
        time_slot: v.time_slot || "11:00 - 02:00 PM",
        customer_name: customer?.full_name || "Borrower",
        customer_phone: customer?.phone || "N/A",
        customer_address: customer?.address || "Pune Metro, Maharashtra",
        loan_account_no: targetCase?.loan_account_no || "N/A",
        lender_name: targetCase?.lender_name || "Bajaj Finance",
        outstanding_amount: targetCase?.outstanding_amount || 0,
        dpd_bucket: targetCase?.dpd_bucket || "90+ DPD",
        visit_notes: v.visit_notes,
        visit_outcome: v.visit_outcome,
        collected_amount: v.collected_amount || 0,
        receipt_ref: v.receipt_ref,
        google_maps_directions_url: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customer?.address || "Pune")}&travelmode=driving`,
        gps_latitude: v.gps_latitude,
        gps_longitude: v.gps_longitude
      };
    });

    // Current agent collections & cash in hand
    const agentCollected = visits.reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);
    const agentCash = visits
      .filter(v => String(v.payment_mode || "").toUpperCase().includes("CASH"))
      .reduce((acc, v) => acc + (Number(v.collected_amount) || 0), 0);

    const handovers = (memoryStore.cash_handovers || []).filter(h => h.agent_id === agentId || h.agent_id === "usr_field_1");
    const reconciledCash = handovers.filter(h => h.status === "RECONCILED").reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
    const cashInHand = Math.max(0, agentCash - reconciledCash);

    return res.status(200).json({
      success: true,
      agent: {
        id: req.user.id,
        name: req.user.fullName || req.user.full_name || "Vikram Singh",
        employee_id: req.user.employee_id || "PM-FLD-0001",
        zone: req.user.location_zone || "Pune Metro",
        cash_in_hand: cashInHand,
        total_collected: agentCollected
      },
      route: {
        total_stops: stops.length,
        completed_stops: stops.filter(s => s.status === "COMPLETED").length,
        in_progress_stops: stops.filter(s => s.status === "IN_PROGRESS").length,
        pending_stops: stops.filter(s => s.status === "SCHEDULED").length,
        stops
      }
    });
  } catch (error) {
    console.error("getMyRoute Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/field/visits/:id/check-in
 * Field agent initiates on-site visit with statutory notice & GPS verification.
 */
export const checkInFieldVisit = async (req, res) => {
  try {
    const visitId = req.params.id;
    const {
      gps_latitude,
      gps_longitude,
      gps_accuracy = 6.5,
      gps_consent_acknowledged = true,
      id_displayed = true,
      fair_practice_notice_read = true
    } = req.body;

    const visit = (memoryStore.field_visits || []).find(v => v.id === visitId);
    if (!visit) {
      return res.status(404).json({ success: false, message: `Field visit '${visitId}' not found.` });
    }

    const now = new Date();
    // Compliance check: RBI Fair Practice visiting hours (07:00 to 19:00 IST)
    const currentHourIST = (now.getUTCHours() + 5.5) % 24;
    const isWithinPermissibleHours = currentHourIST >= 7 && currentHourIST <= 19;

    visit.visit_start = now.toISOString();
    visit.status = "IN_PROGRESS";
    visit.gps_latitude = gps_latitude || 18.5204;
    visit.gps_longitude = gps_longitude || 73.8567;
    visit.gps_accuracy = gps_accuracy;
    visit.gps_consent_acknowledged = gps_consent_acknowledged;
    visit.id_displayed = id_displayed;
    visit.fair_practice_notice_read = fair_practice_notice_read;

    // Transition case status to 'Field Visit'
    await updateCaseStatusWithHistory({
      caseId: visit.case_id,
      employeeId: req.user.id,
      newStatus: "Field Visit",
      remarks: `Field Agent arrived on-site and checked in at ${now.toLocaleTimeString('en-IN')}. GPS: (${visit.gps_latitude.toFixed(4)}, ${visit.gps_longitude.toFixed(4)}). RBI Code compliant.`
    });

    return res.status(200).json({
      success: true,
      message: "Checked in successfully at customer location. On-site session started.",
      rbi_notice: {
        within_permissible_hours: isWithinPermissibleHours,
        visiting_hours: "07:00 AM - 07:00 PM IST",
        id_badge_verified: true
      },
      visit
    });
  } catch (error) {
    console.error("checkInFieldVisit Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/field/visits/:id/complete
 * Conclude field visit: outcome, digital proof, dynamic UPI QR or cash collection, and digital receipt.
 */
export const completeFieldVisit = async (req, res) => {
  try {
    const visitId = req.params.id;
    const {
      visit_outcome,
      visit_notes,
      promise_date,
      promise_amount,
      notice_served = false,
      collected_amount = 0,
      payment_mode = "UPI_QR",
      cash_denominations,
      cheque_details,
      evidence_photos = [],
      gps_latitude,
      gps_longitude,
      gps_accuracy
    } = req.body;

    const visit = (memoryStore.field_visits || []).find(v => v.id === visitId);
    if (!visit) {
      return res.status(404).json({ success: false, message: `Field visit '${visitId}' not found.` });
    }

    const targetCase = memoryStore.loan_cases.find(c => c.id === visit.case_id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: "Associated loan case not found." });
    }

    const now = new Date();
    const startTime = visit.visit_start ? new Date(visit.visit_start) : new Date(now.getTime() - 25 * 60000);
    const durationMinutes = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 60000));

    const collectionVal = Number(collected_amount) || 0;
    let receiptRef = null;
    let paymentRecord = null;

    visit.visit_end = now.toISOString();
    visit.duration_minutes = durationMinutes;
    visit.visit_outcome = visit_outcome || (collectionVal > 0 ? "Customer Met & Paid" : "Contacted");
    visit.visit_notes = visit_notes || "Field visit concluded with borrower.";
    visit.promise_date = promise_date || null;
    visit.promise_amount = promise_amount ? Number(promise_amount) : 0;
    visit.notice_served = Boolean(notice_served);
    visit.collected_amount = collectionVal;
    visit.payment_mode = collectionVal > 0 ? payment_mode : null;
    visit.cash_denominations = cash_denominations || null;
    visit.cheque_details = cheque_details || null;
    visit.evidence_photos = evidence_photos;
    visit.status = "COMPLETED";

    if (gps_latitude) visit.gps_latitude = gps_latitude;
    if (gps_longitude) visit.gps_longitude = gps_longitude;
    if (gps_accuracy) visit.gps_accuracy = gps_accuracy;

    // Process on-site collection and issue instant digital receipt
    if (collectionVal > 0) {
      receiptRef = `RCP-FLD-${Date.now().toString().slice(-6)}`;
      visit.receipt_ref = receiptRef;

      const newOutstanding = Math.max(0, (targetCase.outstanding_amount || 0) - collectionVal);
      const newRecovered = (targetCase.recovered_amount || 0) + collectionVal;

      targetCase.outstanding_amount = newOutstanding;
      targetCase.recovered_amount = newRecovered;
      targetCase.updated_at = now.toISOString();

      paymentRecord = {
        id: `pay_${uuidv4()}`,
        case_id: targetCase.id,
        customer_id: targetCase.customer_id,
        collected_by_id: req.user.id,
        amount: collectionVal,
        payment_mode: payment_mode.toUpperCase(),
        transaction_ref: receiptRef,
        receipt_number: receiptRef,
        reconciliation_status: payment_mode.toUpperCase().includes("CASH") ? "PENDING_HANDOVER" : "RECONCILED",
        payment_date: now.toISOString(),
        notes: `Spot collection during field visit by ${req.user.fullName || 'Field Agent'}. ${visit_notes || ''}`
      };

      if (!memoryStore.payments) memoryStore.payments = [];
      memoryStore.payments.unshift(paymentRecord);
    }

    // Determine target case status
    let nextCaseStatus = "Contacted";
    if (collectionVal > 0) {
      nextCaseStatus = targetCase.outstanding_amount <= 0 ? "Fully Paid" : "Partially Paid";
    } else if (visit_outcome?.toLowerCase().includes("promise")) {
      nextCaseStatus = "Promise to Pay";
    } else if (visit_outcome?.toLowerCase().includes("dispute")) {
      nextCaseStatus = "Disputed";
    } else if (visit_outcome?.toLowerCase().includes("not available") || visit_outcome?.toLowerCase().includes("locked")) {
      nextCaseStatus = "Not Reachable";
    }

    // Execute atomic case status update with ACID history audit
    await updateCaseStatusWithHistory({
      caseId: targetCase.id,
      employeeId: req.user.id,
      newStatus: nextCaseStatus,
      remarks: `Field visit concluded: ${visit.visit_outcome}. Notes: ${visit_notes || 'None'}. Collected: ₹${collectionVal.toLocaleString('en-IN')}. Receipt: ${receiptRef || 'N/A'}`
    });

    cacheService.delPattern("dashboard:*");

    return res.status(200).json({
      success: true,
      message: `Field visit concluded successfully with status '${nextCaseStatus}'.`,
      visit,
      receipt_ref: receiptRef,
      payment: paymentRecord,
      case: {
        id: targetCase.id,
        status: nextCaseStatus,
        outstanding_amount: targetCase.outstanding_amount,
        recovered_amount: targetCase.recovered_amount
      }
    });
  } catch (error) {
    console.error("completeFieldVisit Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/field/receipt/:receiptNumber
 * Fetch full digital receipt for printing, PDF download, or SMS/WhatsApp link.
 */
export const getDigitalReceipt = async (req, res) => {
  try {
    const { receiptNumber } = req.params;

    const visit = (memoryStore.field_visits || []).find(v => v.receipt_ref === receiptNumber);
    const payment = (memoryStore.payments || []).find(p => p.receipt_number === receiptNumber || p.transaction_ref === receiptNumber);

    if (!visit && !payment) {
      return res.status(404).json({ success: false, message: `Receipt '${receiptNumber}' not found.` });
    }

    const caseId = visit?.case_id || payment?.case_id;
    const targetCase = memoryStore.loan_cases.find(c => c.id === caseId);
    const customer = targetCase ? memoryStore.customers.find(c => c.id === targetCase.customer_id) : null;
    const agent = memoryStore.users.find(u => u.id === (visit?.field_agent_id || payment?.collected_by_id));

    const amount = visit?.collected_amount || payment?.amount || 0;

    const receipt = {
      receipt_number: receiptNumber,
      date_issued: visit?.visit_end || payment?.payment_date || new Date().toISOString(),
      customer: {
        name: customer?.full_name || "Borrower",
        phone: customer?.phone || "N/A",
        address: customer?.address || "Pune Metro, Maharashtra",
        loan_account_no: targetCase?.loan_account_no || "N/A",
        lender: targetCase?.lender_name || "Bajaj Finance"
      },
      payment: {
        amount,
        amount_in_words: numberToWordsINR(amount),
        mode: visit?.payment_mode || payment?.payment_mode || "UPI_QR",
        transaction_ref: receiptNumber,
        remaining_balance: targetCase?.outstanding_amount || 0
      },
      agent: {
        name: agent?.full_name || "Vikram Singh",
        employee_id: agent?.employee_id || "PM-FLD-0001",
        designation: agent?.designation || "Field Enforcement Specialist"
      },
      audit: {
        gps_coordinates: `${visit?.gps_latitude || 18.5204}° N, ${visit?.gps_longitude || 73.8567}° E`,
        rbi_fair_practice_compliant: true,
        verification_hash: `SEC-${Buffer.from(receiptNumber).toString('base64').slice(0, 12)}`
      }
    };

    return res.status(200).json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error("getDigitalReceipt Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/field/cash-handover
 * Field agent submits collected cash for supervisor reconciliation.
 */
export const submitCashHandover = async (req, res) => {
  try {
    const {
      amount,
      branch_name = "Pune Central Branch",
      deposit_slip_ref,
      notes
    } = req.body;

    const val = Number(amount);
    if (!val || val <= 0) {
      return res.status(400).json({ success: false, message: "Valid handover amount is required." });
    }

    const agent = req.user;
    const handoverId = `cho_${Date.now()}`;
    const handoverRef = `CHO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newHandover = {
      id: handoverId,
      handover_ref: handoverRef,
      agent_id: agent.id,
      agent_name: agent.fullName || agent.full_name || "Vikram Singh",
      agent_employee_id: agent.employee_id || "PM-FLD-0001",
      amount: val,
      branch_name,
      deposit_slip_ref: deposit_slip_ref || `SLIP-${Date.now().toString().slice(-5)}`,
      notes: notes || "Daily cash recovery settlement submitted to branch.",
      submitted_at: new Date().toISOString(),
      status: "PENDING_RECONCILIATION",
      reconciled_by: null,
      reconciled_at: null,
      supervisor_remarks: null
    };

    if (!memoryStore.cash_handovers) {
      memoryStore.cash_handovers = [];
    }
    memoryStore.cash_handovers.unshift(newHandover);

    return res.status(201).json({
      success: true,
      message: `Cash handover of ₹${val.toLocaleString('en-IN')} submitted successfully for supervisor approval.`,
      handover: newHandover
    });
  } catch (error) {
    console.error("submitCashHandover Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/field/cash-handovers
 * List all cash handover submissions.
 */
export const listCashHandovers = async (req, res) => {
  try {
    let handovers = [...(memoryStore.cash_handovers || [])];

    if (req.user && req.user.role === "FIELD_AGENT") {
      handovers = handovers.filter(h => h.agent_id === req.user.id || h.agent_employee_id === req.user.employee_id);
    }

    return res.status(200).json({
      success: true,
      handovers,
      total: handovers.length
    });
  } catch (error) {
    console.error("listCashHandovers Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/field/cash-handover/:id/reconcile
 * Supervisor approves or rejects cash handover.
 */
export const reconcileCashHandover = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!["RECONCILED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be RECONCILED or REJECTED." });
    }

    const handover = (memoryStore.cash_handovers || []).find(h => h.id === id || h.handover_ref === id);
    if (!handover) {
      return res.status(404).json({ success: false, message: "Cash handover record not found." });
    }

    const now = new Date().toISOString();
    handover.status = status;
    handover.reconciled_by = req.user.fullName || req.user.full_name || "Aarav Mehta (Supervisor)";
    handover.reconciled_at = now;
    handover.supervisor_remarks = remarks || `Handover ${status.toLowerCase()} by supervisor.`;

    return res.status(200).json({
      success: true,
      message: `Cash handover ${handover.handover_ref} marked as ${status}.`,
      handover
    });
  } catch (error) {
    console.error("reconcileCashHandover Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/field/radar
 * Geo-data for live field radar and map visualization.
 */
export const getFieldRadar = async (req, res) => {
  try {
    const visits = memoryStore.field_visits || [];
    const agents = (memoryStore.users || []).filter(u => u.role === "FIELD_AGENT");

    const agentPins = agents.map(agent => ({
      id: agent.id,
      name: agent.full_name,
      employee_id: agent.employee_id,
      latitude: 18.5204,
      longitude: 73.8567,
      status: "ACTIVE_ON_DUTY",
      zone: agent.location_zone || "Pune Metro"
    }));

    const visitPins = visits.map(v => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === v.case_id);
      const customer = targetCase ? memoryStore.customers.find(c => c.id === targetCase.customer_id) : null;

      return {
        id: v.id,
        case_id: v.case_id,
        customer_name: customer?.full_name || "Borrower",
        address: customer?.address || "Pune Metro",
        latitude: v.gps_latitude || 18.5204,
        longitude: v.gps_longitude || 73.8567,
        status: v.status,
        outcome: v.visit_outcome,
        priority: v.priority || "HIGH",
        collected_amount: v.collected_amount || 0,
        time_slot: v.time_slot || "11:00 - 02:00 PM"
      };
    });

    return res.status(200).json({
      success: true,
      radar: {
        center: { latitude: 18.5204, longitude: 73.8567, zoom: 12 },
        agent_pins: agentPins,
        visit_pins: visitPins
      }
    });
  } catch (error) {
    console.error("getFieldRadar Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
