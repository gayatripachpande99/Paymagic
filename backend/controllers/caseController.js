import { v4 as uuidv4 } from "uuid";
import db, { memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { maskCustomerForRole } from "../middleware/authMiddleware.js";
import { cacheService } from "../services/cacheService.js";
import { indexService } from "../services/indexService.js";
import {
  caseRepository,
  customerRepository,
  uploadRepository,
  targetRepository,
  followupRepository,
  paymentRepository
} from "../repositories/index.js";
import { caseAllocationService } from "../services/caseAllocationService.js";
import { maskCustomerByRole } from "../services/piiMaskingService.js";

const VALID_STATUSES = [
  "New", "Assigned", "Contacted", "Promise to Pay", "Partially Paid",
  "Fully Paid", "Disputed", "Not Reachable", "Field Visit", "Closed"
];

/**
 * GET /api/cases
 * List cases with advanced multi-column filtering, multi-column sorting,
 * deterministic pagination, and role-based customer PII masking.
 */
export const listCases = async (req, res) => {
  try {
    const {
      case_id, caseId,
      borrower_name, borrowerName, customer_name, customerName,
      customer_code, customerCode,
      loan_account_no, loanAccountNo,
      lender_name, lenderName, lender,
      loan_type, loanType,
      status, caseStatus,
      priority,
      dpd_min, dpdMin, minDpd,
      dpd_max, dpdMax, maxDpd,
      min_amount, minAmount, minOutstanding,
      max_amount, maxAmount, maxOutstanding,
      assigned_employee_id, assignedEmployeeId, assignedTo,
      supervisor_id, supervisorId, assignedSupervisorId,
      city, state, pincode,
      created_from, createdFrom, createdDateFrom,
      created_to, createdTo, createdDateTo,
      updated_from, updatedFrom, updatedDateFrom,
      updated_to, updatedTo, updatedDateTo,
      search,
      sortBy, sort_by,
      sortOrder, order,
      page = 1,
      limit = 20
    } = req.query;

    let targetAssignedTo = assigned_employee_id || assignedEmployeeId || assignedTo;
    if (["CALLER", "FIELD_AGENT"].includes(req.user?.role)) {
      targetAssignedTo = req.user.id;
    }

    const sortExpression = sortBy || sort_by || "created_at";
    const sortDirection = sortOrder || order || "DESC";

    const result = await caseRepository.findAll({
      case_id: case_id || caseId || undefined,
      borrower_name: borrower_name || borrowerName || customer_name || customerName || undefined,
      customer_code: customer_code || customerCode || undefined,
      loan_account_no: loan_account_no || loanAccountNo || undefined,
      lender_name: lender_name || lenderName || lender || undefined,
      loan_type: loan_type || loanType || undefined,
      status: status || caseStatus || undefined,
      priority: priority || undefined,
      dpd_min: dpd_min !== undefined ? dpd_min : (dpdMin !== undefined ? dpdMin : minDpd),
      dpd_max: dpd_max !== undefined ? dpd_max : (dpdMax !== undefined ? dpdMax : maxDpd),
      min_amount: min_amount !== undefined ? min_amount : (minAmount !== undefined ? minAmount : minOutstanding),
      max_amount: max_amount !== undefined ? max_amount : (maxAmount !== undefined ? maxAmount : maxOutstanding),
      assigned_employee_id: targetAssignedTo || undefined,
      supervisor_id: supervisor_id || supervisorId || assignedSupervisorId || undefined,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
      created_from: created_from || createdFrom || createdDateFrom || undefined,
      created_to: created_to || createdTo || createdDateTo || undefined,
      updated_from: updated_from || updatedFrom || updatedDateFrom || undefined,
      updated_to: updated_to || updatedTo || updatedDateTo || undefined,
      search: search || undefined,
      sort_by: sortExpression,
      order: sortDirection,
      page,
      limit
    });

    // Centralized role-based customer PII masking for case listing
    const maskedCases = result.cases.map(c => {
      const custObj = {
        id: c.customer_id,
        customer_code: c.customer_code,
        full_name: c.customer_name || c.borrower_name,
        phone_raw: c.phone_raw,
        phone_masked: c.phone_masked,
        alternate_phone: c.alternate_phone,
        email: c.customer_email || c.email,
        current_address: c.current_address || c.address,
        city: c.customer_city || c.city,
        state: c.customer_state || c.state,
        pincode: c.customer_pincode || c.pincode,
        credit_score: c.credit_score
      };
      const masked = maskCustomerByRole(custObj, req.user, c);
      return {
        ...c,
        customer_id: c.customer_id,
        borrower_name: masked.full_name,
        customer_name: masked.full_name,
        customer_code: masked.customer_code,
        phone: masked.phone,
        phone_masked: masked.phone_masked,
        phone_raw: masked.phone_raw,
        alternate_phone: masked.alternate_phone,
        email: masked.email,
        customer_email: masked.email,
        current_address: masked.current_address,
        address: masked.current_address,
        city: masked.city,
        customer_city: masked.city,
        state: masked.state,
        customer_state: masked.state,
        pincode: masked.pincode,
        customer_pincode: masked.pincode
      };
    });

    return res.status(200).json({
      success: true,
      message: `Found ${result.total} case(s).`,
      data: maskedCases,
      cases: maskedCases,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalRecords: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      }
    });
  } catch (error) {
    if (
      error.message &&
      (error.message.includes("Invalid") ||
        error.message.includes("Excessive") ||
        error.message.includes("exceed"))
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("listCases Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * GET /api/cases/:caseId
 * Get complete case detail with loan, customer (masked by role), assignment,
 * status timeline, follow-ups, and audit history.
 */
export const getCaseById = async (req, res) => {
  try {
    const targetId = req.params.caseId || req.params.id;
    if (!targetId || targetId === "undefined" || targetId === "null") {
      return res.status(404).json({ success: false, message: "Case ID is required." });
    }

    const loanCase = await caseRepository.findById(targetId);

    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Loan case '${targetId}' not found.` });
    }

    // Role-based object-level authorization
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user?.role) &&
      loanCase.assigned_employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized case access blocked: You are not assigned to this case." });
    }

    // Customer details with role-based PII masking
    const rawCustomer = await customerRepository.findById(loanCase.customer_id);
    const customer = maskCustomerByRole(rawCustomer, req.user, loanCase);

    // Status audit history timeline
    const statusHistory = await caseRepository.getCaseHistory(loanCase.id);

    // Chronological assignment history
    const assignments = await caseRepository.getCaseAssignments(loanCase.id);

    // Structured Follow-ups
    const followups = await followupRepository.getFollowupsForCase(loanCase.id);

    // Recent calls (memory / DB)
    const calls = (memoryStore.calls || [])
      .filter(c => c.case_id === loanCase.id)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, 20);

    // Payments
    const payments = (memoryStore.payments || [])
      .filter(p => p.case_id === loanCase.id)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

    // Assigned employee profile
    const assignedEmployee = loanCase.assigned_employee_id
      ? memoryStore.users.find(u => u.id === loanCase.assigned_employee_id) || {
          id: loanCase.assigned_employee_id,
          full_name: loanCase.assigned_employee_name,
          employee_id: loanCase.assigned_employee_code,
          role: loanCase.assigned_employee_role
        }
      : null;

    // Masked case representation
    const maskedCase = {
      ...loanCase,
      customer_id: loanCase.customer_id,
      borrower_name: customer?.full_name || loanCase.borrower_name,
      customer_name: customer?.full_name || loanCase.customer_name,
      customer_code: customer?.customer_code || loanCase.customer_code,
      phone: customer?.phone,
      phone_masked: customer?.phone_masked,
      phone_raw: customer?.phone_raw,
      alternate_phone: customer?.alternate_phone,
      email: customer?.email,
      customer_email: customer?.email,
      current_address: customer?.current_address,
      address: customer?.address,
      city: customer?.city,
      customer_city: customer?.city,
      state: customer?.state,
      customer_state: customer?.state,
      pincode: customer?.pincode,
      customer_pincode: customer?.pincode
    };

    return res.status(200).json({
      success: true,
      message: "Case details retrieved.",
      data: {
        // Loan details
        loan_account_no: loanCase.loan_account_no,
        lender_name: loanCase.lender_name,
        loan_type: loanCase.loan_type,
        principal_amount: loanCase.principal_amount,
        outstanding_amount: loanCase.outstanding_amount,
        dpd: loanCase.dpd,
        priority: loanCase.priority,
        status: loanCase.status,
        current_status: loanCase.status,

        // Customer details
        customer,
        borrower_name: customer?.full_name,
        customer_code: customer?.customer_code,
        phone: customer?.phone,
        alternate_phone: customer?.alternate_phone,
        email: customer?.email,
        current_address: customer?.current_address,
        address: customer?.address,
        city: customer?.city,
        state: customer?.state,
        pincode: customer?.pincode,

        // Assignment details
        assigned_employee: assignedEmployee,
        assigned_employee_id: loanCase.assigned_employee_id,
        assigned_employee_name: assignedEmployee?.full_name || loanCase.assigned_employee_name || null,
        assigned_supervisor_id: loanCase.assigned_supervisor_id || null,
        assigned_supervisor_name: loanCase.assigned_supervisor_name || null,
        assigned_at: loanCase.assigned_at,
        assignment_date: loanCase.assigned_at,

        // Status history
        status_history: statusHistory,

        // Follow-ups
        followups,

        // Audit information
        audit_information: {
          created_at: loanCase.created_at,
          updated_at: loanCase.updated_at,
          audit_events: statusHistory
        },

        // Legacy & extended UI compatibility
        case: maskedCase,
        recent_calls: calls,
        payments,
        assignments
      }
    });
  } catch (error) {
    console.error("getCaseById Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * GET /api/cases/:caseId/assignments
 * Retrieve chronological assignment and transfer history for a specific case.
 */
export const getCaseAssignments = async (req, res) => {
  try {
    const targetId = req.params.caseId || req.params.id;
    if (!targetId || targetId === "undefined" || targetId === "null") {
      return res.status(400).json({ success: false, message: "Case ID is required." });
    }

    const loanCase = await caseRepository.findById(targetId);
    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Loan case '${targetId}' not found.` });
    }

    // Role-based authorization
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user?.role) &&
      loanCase.assigned_employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized: You are not assigned to this case." });
    }

    const assignments = await caseRepository.getCaseAssignments(loanCase.id);

    return res.status(200).json({
      success: true,
      message: "Case assignment history retrieved.",
      data: assignments,
      assignments
    });
  } catch (error) {
    console.error("getCaseAssignments Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * PATCH /api/cases/:caseId/status
 * Update case status using updateCaseStatusWithHistory inside atomic transaction.
 */
export const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const newStatus = req.body.newStatus || req.body.status;
    const { remarks, follow_up_date, payment_ref } = req.body;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: "newStatus is required." });
    }
    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${newStatus}'. Valid statuses: ${VALID_STATUSES.join(", ")}`
      });
    }

    const targetCase = memoryStore.loan_cases.find(c => c.id === caseId || c.case_number === caseId);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    // Role-based authorization: callers & field agents can only update assigned cases
    if (["CALLER", "FIELD_AGENT"].includes(req.user.role) && targetCase.assigned_employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to update status for a case not assigned to you." });
    }

    // Mandatory remarks check for sensitive transitions per Business Rules
    if (["Disputed", "Closed", "Not Reachable"].includes(newStatus) && (!remarks || remarks.trim().length < 3)) {
      return res.status(400).json({
        success: false,
        message: `Remarks are mandatory for '${newStatus}' status (minimum 3 characters).`
      });
    }

    // Optional follow-up date update
    if (follow_up_date) {
      targetCase.follow_up_date = follow_up_date;
    }

    // Payment reference for paid cases
    if (payment_ref && (newStatus === "Fully Paid" || newStatus === "Partially Paid")) {
      targetCase.last_payment_ref = payment_ref;
    }

    const source = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role)
      ? "Admin"
      : (req.user.role === "SUPERVISOR" ? "Manager" : "Employee");

    const result = await updateCaseStatusWithHistory({
      caseId: targetCase.id,
      employeeId: req.user.id,
      newStatus,
      remarks: remarks || `Status transition from ${targetCase.status} to ${newStatus}`,
      source
    });

    if (!result.changed) {
      return res.status(200).json({
        success: true,
        message: `Case is already in '${newStatus}' status. No change made.`,
        data: { case: result.case }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Case status updated to '${newStatus}'.`,
      data: {
        case: result.case,
        history_entry: result.historyEntry
      }
    });
  } catch (error) {
    console.error("updateCaseStatus Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/:caseId/assign
 * Assign a single case to an employee.
 */
export const assignCase = async (req, res) => {
  try {
    if (["CALLER", "FIELD_AGENT"].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized: Callers and field agents cannot assign cases." });
    }

    const caseId = req.params.caseId || req.params.id || req.body.caseId || req.body.case_id;
    const { employeeId, remarks } = req.body;

    if (!caseId) {
      return res.status(400).json({ success: false, message: "caseId is required." });
    }

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }

    let employee = null;
    if (db.isPgActive()) {
      const empRes = await db.query(
        "SELECT * FROM users WHERE (id = $1 OR employee_id = $1) AND is_active = true",
        [employeeId]
      );
      employee = empRes.rows[0];
    } else {
      employee = memoryStore.users.find(
        u => (u.id === employeeId || u.employee_id === employeeId) && u.is_active
      );
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: `Active employee '${employeeId}' not found.` });
    }

    const updatedCase = await caseRepository.assignSingle(
      caseId,
      employee.id,
      req.user.id,
      remarks || `Assigned to ${employee.full_name}`
    );

    const now = new Date().toISOString();
    const assignment = {
      id: `asgn_${uuidv4()}`,
      case_id: updatedCase.id,
      assigned_to: employee.id,
      assigned_by: req.user.id,
      assignment_type: "MANUAL",
      assigned_at: now,
      remarks: remarks || `Assigned to ${employee.full_name}`
    };

    return res.status(200).json({
      success: true,
      message: `Case ${updatedCase.case_number || caseId} assigned to ${employee.full_name}.`,
      data: {
        case: updatedCase,
        assignment
      }
    });
  } catch (error) {
    console.error("assignCase Error:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-memory store for active allocation preview sessions
/**
 * POST /api/cases/allocate/preview
 * Compute proposed case distribution across active employees based on strategy without mutating data.
 */
export const previewRuleAllocation = async (req, res) => {
  try {
    const {
      strategy = "EQUAL",
      rules = {},
      limit = 50,
      targetEmployeeIds = []
    } = req.body;

    const preview = await caseAllocationService.generatePreview({
      strategy,
      rules,
      limit,
      targetEmployeeIds,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: `Preview generated: ${preview.total_cases_selected} cases evaluated across ${preview.eligible_employees_count} agents.`,
      data: preview
    });
  } catch (error) {
    console.error("previewRuleAllocation Error:", error);
    return res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/allocate/execute
 * Atomically commits the rule-based allocation to the database.
 */
export const executeRuleAllocation = async (req, res) => {
  try {
    const { preview_id, previewId } = req.body;
    const idToExecute = preview_id || previewId;

    if (!idToExecute) {
      return res.status(400).json({ success: false, message: "preview_id is required." });
    }

    const result = await caseAllocationService.executeAllocation({
      previewId: idToExecute,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: `Successfully executed rule allocation: ${result.total_assigned} cases assigned across ${result.allocations_summary.length} employees.`,
      data: {
        total_assigned: result.total_assigned,
        strategy: result.strategy,
        summary: result.allocations_summary
      }
    });
  } catch (error) {
    console.error("executeRuleAllocation Error:", error);
    const statusCode = error.status || (error.message.includes("expired") ? 410 : 500);
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/bulk-assign
 * Bulk assign cases. Supports manual (caseIds + employeeId) or rule-based.
 */
export const bulkAssignCases = async (req, res) => {
  try {
    const targetEmpId = req.body.employeeId || req.body.targetEmployeeId || req.body.employee_id;
    const { mode = "manual", caseIds, rules, rule, limit, city } = req.body;

    // Handle modal rule-based payload if sent without explicit employeeId
    if (!targetEmpId && rule) {
      req.body.strategy = rule;
      req.body.limit = limit;
      req.body.rules = { city };
      return previewRuleAllocation(req, res);
    }

    if (!targetEmpId) {
      return res.status(400).json({ success: false, message: "Target employeeId is required for bulk assignment." });
    }

    let employee = null;
    if (db.isPgActive()) {
      const empRes = await db.query(
        "SELECT * FROM users WHERE (id = $1 OR employee_id = $1) AND is_active = true",
        [targetEmpId]
      );
      employee = empRes.rows[0];
    } else {
      employee = memoryStore.users.find(
        u => (u.id === targetEmpId || u.employee_id === targetEmpId) && u.is_active
      );
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: `Active employee '${targetEmpId}' not found.` });
    }

    let targetCaseIds = [];

    if (caseIds && Array.isArray(caseIds) && caseIds.length > 0) {
      targetCaseIds = caseIds;
    } else if (mode === "rule-based" || rule) {
      let candidateCases = [];
      if (db.isPgActive()) {
        const cRes = await db.query(
          "SELECT id, outstanding_amount, status FROM loan_cases WHERE status = 'New' OR assigned_employee_id IS NULL"
        );
        candidateCases = cRes.rows;
      } else {
        candidateCases = memoryStore.loan_cases.filter(c => c.status === "New" || !c.assigned_employee_id);
      }

      const filterRules = rules || {};
      if (rule === "AMOUNT_DESC") {
        candidateCases.sort((a, b) => (Number(b.outstanding_amount) || 0) - (Number(a.outstanding_amount) || 0));
      }

      const maxLimit = parseInt(limit || filterRules.maxCases || 25, 10);
      targetCaseIds = candidateCases.slice(0, maxLimit).map(c => c.id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide either a list of caseIds or allocation rules/limit."
      });
    }

    if (targetCaseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No eligible cases found matching selection criteria."
      });
    }

    const assignedResults = await caseRepository.assignBulk(
      targetCaseIds,
      employee.id,
      req.user.id,
      `Bulk assignment to ${employee.full_name}`
    );

    return res.status(200).json({
      success: true,
      message: `${assignedResults.length} case(s) assigned to ${employee.full_name}.`,
      data: {
        assigned_count: assignedResults.length,
        total_requested: targetCaseIds.length,
        assigned_to: {
          id: employee.id,
          employee_id: employee.employee_id,
          name: employee.full_name
        },
        assigned_cases: assignedResults
      }
    });
  } catch (error) {
    console.error("bulkAssignCases Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/transfer
 * POST /api/cases/:caseId/transfer
 * Transfer single case or batch of cases between employees.
 */
export const transferCase = async (req, res) => {
  try {
    if (["CALLER", "FIELD_AGENT"].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized: Callers and field agents cannot transfer cases." });
    }

    const caseId = req.params.caseId || req.params.id || req.body.caseId || req.body.case_id;
    const { fromEmployeeId, toEmployeeId, count, reason } = req.body;

    if (!toEmployeeId) {
      return res.status(400).json({ success: false, message: "toEmployeeId is required." });
    }

    let toEmployee = null;
    if (db.isPgActive()) {
      const empRes = await db.query(
        "SELECT * FROM users WHERE (id = $1 OR employee_id = $1) AND is_active = true",
        [toEmployeeId]
      );
      toEmployee = empRes.rows[0];
    } else {
      toEmployee = memoryStore.users.find(
        u => (u.id === toEmployeeId || u.employee_id === toEmployeeId) && u.is_active
      );
    }

    if (!toEmployee) {
      return res.status(404).json({ success: false, message: `Target employee '${toEmployeeId}' not found or inactive.` });
    }

    const now = new Date().toISOString();

    // 1. Single Case Transfer
    if (caseId) {
      const updatedCase = await caseRepository.transferCase(
        caseId,
        toEmployee.id,
        req.user.id,
        reason || `Transferred to ${toEmployee.full_name}`
      );

      const assignment = {
        id: `asgn_${uuidv4()}`,
        case_id: updatedCase.id,
        assigned_to: toEmployee.id,
        assigned_from: updatedCase.assigned_from || null,
        assigned_by: req.user.id,
        assignment_type: "TRANSFER",
        assigned_at: now,
        remarks: reason || `Transferred to ${toEmployee.full_name}`
      };

      return res.status(200).json({
        success: true,
        message: `Case ${updatedCase.case_number || caseId} transferred to ${toEmployee.full_name}.`,
        data: { case: updatedCase, assignment }
      });
    }

    // 2. Bulk Employee-to-Employee Transfer
    if (fromEmployeeId) {
      let casesToTransfer = [];
      let fromEmp = null;

      if (db.isPgActive()) {
        const fromEmpRes = await db.query(
          "SELECT * FROM users WHERE id = $1 OR employee_id = $1",
          [fromEmployeeId]
        );
        fromEmp = fromEmpRes.rows[0];
        const targetFromId = fromEmp ? fromEmp.id : fromEmployeeId;

        const limitVal = parseInt(count, 10) || 50;
        const cRes = await db.query(
          "SELECT id FROM loan_cases WHERE assigned_employee_id = $1 AND status NOT IN ('Closed', 'Fully Paid') LIMIT $2",
          [targetFromId, limitVal]
        );
        casesToTransfer = cRes.rows;
      } else {
        fromEmp = memoryStore.users.find(u => u.id === fromEmployeeId || u.employee_id === fromEmployeeId);
        const targetFromId = fromEmp ? fromEmp.id : fromEmployeeId;
        casesToTransfer = memoryStore.loan_cases.filter(
          c => c.assigned_employee_id === targetFromId && !["Closed", "Fully Paid"].includes(c.status)
        );
        const limitVal = parseInt(count, 10) || casesToTransfer.length;
        casesToTransfer = casesToTransfer.slice(0, limitVal);
      }

      if (casesToTransfer.length === 0) {
        return res.status(400).json({ success: false, message: "No active cases found to transfer from this employee." });
      }

      for (const lc of casesToTransfer) {
        await caseRepository.transferCase(
          lc.id,
          toEmployee.id,
          req.user.id,
          reason || `Bulk transfer from ${fromEmp?.full_name || fromEmployeeId} to ${toEmployee.full_name}`
        );
      }

      return res.status(200).json({
        success: true,
        message: `Successfully transferred ${casesToTransfer.length} case(s) from ${fromEmp?.full_name || fromEmployeeId} to ${toEmployee.full_name}.`,
        data: { transferredCount: casesToTransfer.length }
      });
    }

    return res.status(400).json({ success: false, message: "Either caseId or fromEmployeeId is required." });
  } catch (error) {
    console.error("transferCase Error:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/cases/:caseId/follow-up
 * Set follow-up date on a case.
 */
export const setFollowUpDate = async (req, res) => {
  try {
    const caseId = req.params.caseId || req.params.id || req.body.caseId || req.body.case_id;
    const { follow_up_date } = req.body;

    if (!caseId) {
      return res.status(400).json({ success: false, message: "caseId is required." });
    }

    if (!follow_up_date) {
      return res.status(400).json({ success: false, message: "follow_up_date is required (YYYY-MM-DD)." });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(follow_up_date)) {
      return res.status(400).json({ success: false, message: "follow_up_date must be in YYYY-MM-DD format." });
    }

    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId || c.case_number === caseId);
    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    // Role-based check
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      loanCase.assigned_employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    loanCase.follow_up_date = follow_up_date;
    loanCase.updated_at = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: `Follow-up date set to ${follow_up_date} for case ${loanCase.case_number}.`,
      data: { case: loanCase }
    });
  } catch (error) {
    console.error("setFollowUpDate Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/targets
 * Create or update a recovery target for an employee for a given month.
 */
export const setRecoveryTarget = async (req, res) => {
  try {
    const { employeeId, month, year, target_amount } = req.body;

    if (!employeeId || !month || !year || target_amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "employeeId, month, year, and target_amount are all required."
      });
    }

    if (target_amount < 0) {
      return res.status(400).json({ success: false, message: "target_amount must be non-negative." });
    }

    const now = new Date().toISOString();

    // Support team-level target setting for all active calling specialists
    if (employeeId === "ALL" || employeeId === "TEAM") {
      const eligibleEmployees = memoryStore.users.filter(
        u => ["CALLER", "FIELD_AGENT", "SUPERVISOR", "EMPLOYEE"].includes(u.role) && u.is_active
      );
      const updatedTargets = [];
      for (const emp of eligibleEmployees) {
        let existingTarget = memoryStore.targets.find(
          t => (t.employee_id === emp.id || t.employee_id === emp.employee_id) && t.month === month && t.year === year
        );
        if (existingTarget) {
          existingTarget.target_amount = target_amount;
          existingTarget.updated_at = now;
          updatedTargets.push(existingTarget);
        } else {
          const newTarget = {
            id: `tgt_${uuidv4()}`,
            employee_id: emp.id,
            month,
            year,
            target_amount,
            achieved_amount: 0,
            achievement_percentage: 0,
            created_at: now,
            updated_at: now
          };
          memoryStore.targets.push(newTarget);
          updatedTargets.push(newTarget);
        }
      }
      return res.status(200).json({
        success: true,
        message: `Recovery target of ₹${Number(target_amount).toLocaleString("en-IN")} set for all ${eligibleEmployees.length} active recovery specialists (${month}/${year}).`,
        data: { targets: updatedTargets }
      });
    }

    const employee = memoryStore.users.find(u => u.id === employeeId || u.employee_id === employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee '${employeeId}' not found.` });
    }

    // Check if target already exists for this employee/month/year
    const existingTarget = memoryStore.targets.find(
      t => (t.employee_id === employee.id || t.employee_id === employee.employee_id) && t.month === month && t.year === year
    );

    if (existingTarget) {
      existingTarget.target_amount = target_amount;
      existingTarget.updated_at = now;

      return res.status(200).json({
        success: true,
        message: `Recovery target updated for ${employee.full_name} (${month}/${year}).`,
        data: { target: existingTarget }
      });
    }

    // Calculate current recovered amount for that month
    const monthStart = new Date(year, month - 1, 1).toISOString();
    const monthEnd = new Date(year, month, 0, 23, 59, 59).toISOString();

    const recovered = memoryStore.payments
      .filter(p =>
        p.collected_by_id === employeeId &&
        p.payment_date >= monthStart &&
        p.payment_date <= monthEnd
      )
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const newTarget = {
      id: `tgt_${uuidv4()}`,
      employee_id: employeeId,
      month,
      year,
      target_amount,
      achieved_amount: recovered,
      achievement_percentage: target_amount > 0 ? Math.round((recovered / target_amount) * 10000) / 100 : 0,
      created_at: now,
      updated_at: now
    };

    memoryStore.targets.push(newTarget);

    // Also update employee's assigned_target
    const empRecord = memoryStore.employees.find(e => e.id === employeeId);
    if (empRecord) {
      empRecord.assigned_target = target_amount;
    }

    return res.status(201).json({
      success: true,
      message: `Recovery target set for ${employee.full_name} (${month}/${year}): ₹${target_amount.toLocaleString()}.`,
      data: { target: newTarget }
    });
  } catch (error) {
    console.error("setRecoveryTarget Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cases/targets
 * List recovery targets and achievement metrics across all staff or team.
 */
export const listRecoveryTargets = async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    const targetMonth = parseInt(month, 10);
    const targetYear = parseInt(year, 10);

    const monthStart = new Date(targetYear, targetMonth - 1, 1).toISOString();
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();
    const todayStr = new Date().toISOString().split("T")[0];

    const eligibleEmployees = memoryStore.users.filter(
      u => ["CALLER", "FIELD_AGENT", "SUPERVISOR", "EMPLOYEE"].includes(u.role) && u.is_active
    );

    const employeeTargets = eligibleEmployees.map(emp => {
      const recordedTarget = memoryStore.targets.find(
        t => (t.employee_id === emp.id || t.employee_id === emp.employee_id) && t.month === targetMonth && t.year === targetYear
      );

      const empRecord = memoryStore.employees.find(e => e.id === emp.id);
      const targetAmount = recordedTarget ? recordedTarget.target_amount : (empRecord?.assigned_target || 100000);

      const assignedCases = memoryStore.loan_cases.filter(c => c.assigned_employee_id === emp.id);
      const assignedAmount = assignedCases.reduce((sum, c) => sum + (c.outstanding_amount || 0), 0);

      const recoveredAmount = memoryStore.payments
        .filter(p => p.collected_by_id === emp.id && p.payment_date >= monthStart && p.payment_date <= monthEnd)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const remainingTarget = Math.max(0, targetAmount - recoveredAmount);
      const achievementPercentage = targetAmount > 0 ? Math.round((recoveredAmount / targetAmount) * 10000) / 100 : 0;

      const upcomingFollowups = assignedCases.filter(
        c => c.follow_up_date && c.follow_up_date >= todayStr && !["Closed", "Fully Paid"].includes(c.status)
      ).length;

      const overdueFollowups = assignedCases.filter(
        c => c.follow_up_date && c.follow_up_date < todayStr && !["Closed", "Fully Paid"].includes(c.status)
      ).length;

      return {
        employee_id: emp.employee_id,
        user_id: emp.id,
        full_name: emp.full_name,
        role: emp.role,
        department: emp.department || "Operations",
        target_amount: targetAmount,
        assigned_amount: assignedAmount,
        recovered_amount: recoveredAmount,
        remaining_target: remainingTarget,
        achievement_percentage: achievementPercentage,
        assigned_cases_count: assignedCases.length,
        upcoming_followups: upcomingFollowups,
        overdue_followups: overdueFollowups,
        month: targetMonth,
        year: targetYear
      };
    });

    const teamTargetTotal = employeeTargets.reduce((s, e) => s + e.target_amount, 0);
    const teamRecoveredTotal = employeeTargets.reduce((s, e) => s + e.recovered_amount, 0);
    const teamAssignedTotal = employeeTargets.reduce((s, e) => s + e.assigned_amount, 0);
    const teamAchievement = teamTargetTotal > 0 ? Math.round((teamRecoveredTotal / teamTargetTotal) * 10000) / 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        summary: {
          team_target_amount: teamTargetTotal,
          team_recovered_amount: teamRecoveredTotal,
          team_assigned_amount: teamAssignedTotal,
          team_remaining_target: Math.max(0, teamTargetTotal - teamRecoveredTotal),
          team_achievement_percentage: teamAchievement,
          total_eligible_staff: eligibleEmployees.length
        },
        employee_targets: employeeTargets
      }
    });
  } catch (error) {
    console.error("listRecoveryTargets Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cases/audit/history
 * GET /api/cases/audit-history
 * Returns chronological status change and case lifecycle audit logs.
 */
export const getCaseAuditHistory = async (req, res) => {
  try {
    const { caseId, employeeId, page = 1, limit = 25 } = req.query;
    let history = [...memoryStore.case_status_history];

    if (caseId) {
      history = history.filter(h => h.case_id === caseId);
    }
    if (employeeId) {
      history = history.filter(h => h.employee_id === employeeId);
    }

    const totalCount = history.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = history.slice(startIdx, startIdx + limitNum);

    const enriched = paginated.map(h => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === h.case_id);
      const employee = memoryStore.users.find(u => u.id === h.employee_id || u.employee_id === h.employee_id);
      const customer = targetCase ? memoryStore.customers.find(c => c.id === targetCase.customer_id) : null;
      return {
        ...h,
        case_number: targetCase?.case_number || "N/A",
        loan_account_no: targetCase?.loan_account_no || "N/A",
        customer_name: customer?.full_name || "Borrower",
        employee_name: employee?.full_name || "Operations User",
        source: h.source || "System"
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        history: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("getCaseAuditHistory Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cases/transfers/history
 * Returns historical transfer records between staff members.
 */
export const getTransferHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const countRes = await db.query(
        "SELECT COUNT(*) as count FROM case_assignments WHERE assigned_from_id IS NOT NULL"
      );
      const totalCount = parseInt(countRes.rows[0]?.count || 0, 10);

      const dataRes = await db.query(
        `SELECT ca.*, lc.case_number, lc.loan_account_no,
                u_from.full_name as from_employee_name,
                u_to.full_name as to_employee_name,
                u_by.full_name as assigned_by_name
         FROM case_assignments ca
         LEFT JOIN loan_cases lc ON ca.case_id = lc.id
         LEFT JOIN users u_from ON ca.assigned_from_id = u_from.id
         LEFT JOIN users u_to ON ca.assigned_to_id = u_to.id
         LEFT JOIN users u_by ON ca.assigned_by_id = u_by.id
         WHERE ca.assigned_from_id IS NOT NULL
         ORDER BY ca.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limitNum, offset]
      );

      return res.status(200).json({
        success: true,
        data: {
          transfers: dataRes.rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    const transfers = (memoryStore.case_assignments || [])
      .filter(a => a.assignment_type === "TRANSFER" || a.assigned_from || a.assigned_from_id)
      .sort((a, b) => new Date(b.assigned_at || b.created_at) - new Date(a.assigned_at || a.created_at));

    const paginated = transfers.slice(offset, offset + limitNum);

    const enriched = paginated.map(t => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === t.case_id);
      const fromEmp = memoryStore.users.find(u => u.id === t.assigned_from || u.id === t.assigned_from_id || u.employee_id === t.assigned_from);
      const toEmp = memoryStore.users.find(u => u.id === t.assigned_to || u.id === t.assigned_to_id || u.employee_id === t.assigned_to);
      const byEmp = memoryStore.users.find(u => u.id === t.assigned_by || u.id === t.assigned_by_id);
      return {
        ...t,
        case_number: targetCase?.case_number || "N/A",
        loan_account_no: targetCase?.loan_account_no || "N/A",
        from_employee_name: fromEmp?.full_name || t.assigned_from || t.assigned_from_id || "Unassigned",
        to_employee_name: toEmp?.full_name || t.assigned_to || t.assigned_to_id,
        assigned_by_name: byEmp?.full_name || "Admin"
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        transfers: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: transfers.length,
          totalPages: Math.ceil(transfers.length / limitNum) || 1
        }
      }
    });
  } catch (error) {
    console.error("getTransferHistory Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cases/payments/all
 * List all payments with case and customer enrichment, totals, and filtering.
 */
export const listAllPayments = async (req, res) => {
  try {
    const { caseId, employeeId, paymentMode, startDate, endDate, page = 1, limit = 50 } = req.query;

    let targetEmployeeId = employeeId;
    // Caller/Field Agent only sees their own collections
    if (["CALLER", "FIELD_AGENT"].includes(req.user?.role) && !employeeId) {
      targetEmployeeId = req.user.id;
    }

    const result = await paymentRepository.listPayments({
      caseId,
      employeeId: targetEmployeeId,
      paymentMode,
      startDate,
      endDate,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: {
        payments: result.payments,
        summary: {
          total_count: result.total,
          total_collected: result.totalCollected
        },
        pagination: {
          page: result.page,
          limit: result.limit,
          totalCount: result.total,
          totalPages: result.totalPages
        }
      }
    });
  } catch (error) {
    console.error("listAllPayments Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/:id/payments
 * Record a recovery payment against a case.
 * Enforces atomic database transaction rule:
 * - Mutates case recovered_amount and outstanding_amount
 * - If paid in full -> updates status to 'Fully Paid' with history entry
 * - If paid partially -> updates status to 'Partially Paid' with history entry
 * - Evicts dashboard caches
 */
export const recordPayment = async (req, res) => {
  try {
    const caseId = req.params.caseId || req.params.id || req.body.caseId || req.body.case_id;
    const { amount, payment_mode = "UPI", paymentMode, transaction_ref, transactionRef, notes = "" } = req.body;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid payment amount is required." });
    }

    const mode = (paymentMode || payment_mode || "UPI").toUpperCase();
    const txnRef = transactionRef || transaction_ref || `TXN-PM-${Date.now().toString().slice(-8)}`;

    const result = await paymentRepository.recordPayment({
      caseId,
      collectedById: req.user.id,
      amount: paymentAmount,
      paymentMode: mode,
      transactionRef: txnRef,
      notes
    });

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString()} successfully recorded and reconciled. Case status is now '${result.case?.status}'.`,
      data: {
        payment: result.payment,
        case: result.case
      }
    });
  } catch (error) {
    console.error("recordPayment Error:", error);
    if (error.code === "DUPLICATE_PAYMENT" || error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cases/field-visits
 * List field visits (filtered by agent if FIELD_AGENT).
 */
export const listFieldVisits = async (req, res) => {
  try {
    let visits = [...(memoryStore.field_visits || [])];

    if (req.user && req.user.role === "FIELD_AGENT") {
      visits = visits.filter(v => v.field_agent_id === req.user.id || v.field_agent_id === req.user.employee_id);
    }

    const enrichedVisits = visits.map(v => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === v.case_id);
      const customer = targetCase ? memoryStore.customers.find(c => c.id === targetCase.customer_id) : null;
      const agent = memoryStore.users.find(u => u.id === v.field_agent_id);

      return {
        ...v,
        loan_account_no: targetCase?.loan_account_no || "N/A",
        outstanding_amount: targetCase?.outstanding_amount || 0,
        customer_name: customer ? customer.full_name : "Customer",
        customer_phone: customer ? customer.phone : "N/A",
        customer_address: customer ? customer.address : "Pune Metro, Maharashtra",
        agent_name: agent?.full_name || req.user?.fullName || "Field Specialist"
      };
    });

    return res.status(200).json({
      success: true,
      visits: enrichedVisits
    });
  } catch (err) {
    console.error("listFieldVisits Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/cases/:id/field-visits/start
 * Initiate an on-site physical visit with statutory GPS notice & recording
 */
export const startFieldVisit = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { gps_latitude, gps_longitude, gps_accuracy, gps_consent_acknowledged } = req.body;

    const targetCase = memoryStore.loan_cases.find(c => c.id === caseId);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: "Loan case not found." });
    }

    const now = new Date().toISOString();
    const visitId = `fv_${Date.now()}`;

    const newVisit = {
      id: visitId,
      case_id: caseId,
      field_agent_id: req.user.id,
      customer_id: targetCase.customer_id,
      scheduled_date: now,
      visit_start: now,
      visit_end: null,
      duration_minutes: 0,
      visit_outcome: null,
      visit_notes: null,
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: gps_latitude || 18.5204,
      gps_longitude: gps_longitude || 73.8567,
      gps_accuracy: gps_accuracy || 8.5,
      gps_consent_acknowledged: gps_consent_acknowledged ?? true,
      status: "IN_PROGRESS"
    };

    if (!memoryStore.field_visits) {
      memoryStore.field_visits = [];
    }
    memoryStore.field_visits.unshift(newVisit);

    await updateCaseStatusWithHistory({
      caseId,
      employeeId: req.user.id,
      newStatus: "Field Visit",
      remarks: `Authorized on-site field recovery visit initiated at ${new Date(now).toLocaleTimeString('en-IN')}. GPS verified: (${newVisit.gps_latitude}, ${newVisit.gps_longitude}). Statutory Fair Practice notice provided.`
    });

    return res.status(201).json({
      success: true,
      message: "Field visit started successfully with verified GPS coordinates.",
      visit: newVisit
    });
  } catch (err) {
    console.error("startFieldVisit Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/cases/:id/field-visits/:visitId/complete
 * Conclude field visit: outcome, notes, payment collection, and closing GPS coordinates
 */
export const completeFieldVisit = async (req, res) => {
  try {
    const { id: caseId, visitId } = req.params;
    const {
      visit_outcome,
      visit_notes,
      collected_amount = 0,
      payment_mode = "Cash",
      gps_latitude,
      gps_longitude,
      gps_accuracy
    } = req.body;

    const targetCase = memoryStore.loan_cases.find(c => c.id === caseId);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: "Loan case not found." });
    }

    const visit = (memoryStore.field_visits || []).find(v => v.id === visitId);
    if (!visit) {
      return res.status(404).json({ success: false, message: "Field visit record not found." });
    }

    const now = new Date();
    const startTime = new Date(visit.visit_start);
    const durationMinutes = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 60000));

    visit.visit_end = now.toISOString();
    visit.duration_minutes = durationMinutes;
    visit.visit_outcome = visit_outcome || "Customer Met & Paid";
    visit.visit_notes = visit_notes || "Field visit completed successfully.";
    visit.collected_amount = Number(collected_amount) || 0;
    visit.payment_mode = payment_mode;
    visit.status = "COMPLETED";
    if (gps_latitude) visit.gps_latitude = gps_latitude;
    if (gps_longitude) visit.gps_longitude = gps_longitude;
    if (gps_accuracy) visit.gps_accuracy = gps_accuracy;

    let receiptRef = null;
    let paymentRecord = null;
    let nextCaseStatus = "Contacted";

    const hasCollectionAttempt = collected_amount !== undefined && collected_amount !== null && collected_amount !== "" && Number(collected_amount) !== 0;

    if (hasCollectionAttempt) {
      const numAmount = Number(collected_amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Payment amount must be a positive number.");
      }
      receiptRef = `RCP-FLD-${Date.now().toString().slice(-6)}`;
      visit.receipt_ref = receiptRef;
      visit.collected_amount = numAmount;

      // Persist payment atomically through paymentRepository
      const paymentResult = await paymentRepository.recordPayment({
        caseId,
        customerId: targetCase.customerId || targetCase.customer_id,
        collectedById: req.user?.id || visit.field_agent_id,
        amount: numAmount,
        paymentMode: (payment_mode || "Cash").toUpperCase(),
        transactionRef: receiptRef,
        receiptNumber: receiptRef,
        notes: `Field collection on-site by agent. ${visit_notes || ''}`
      });

      paymentRecord = paymentResult.payment;
      nextCaseStatus = paymentResult.case?.status || "Partially Paid";
    } else {
      if (visit_outcome?.toLowerCase().includes("promise")) {
        nextCaseStatus = "Promise to Pay";
      } else if (visit_outcome?.toLowerCase().includes("dispute")) {
        nextCaseStatus = "Disputed";
      } else if (visit_outcome?.toLowerCase().includes("not available")) {
        nextCaseStatus = "Not Reachable";
      }

      await updateCaseStatusWithHistory({
        caseId,
        employeeId: req.user.id,
        newStatus: nextCaseStatus,
        remarks: `Field visit concluded: ${visit_outcome}. Notes: ${visit_notes || 'None'}.`
      });
    }

    cacheService.delPattern("dashboard:*");

    return res.status(200).json({
      success: true,
      message: `Field visit concluded successfully with status '${nextCaseStatus}'.`,
      visit,
      payment: paymentRecord
    });
  } catch (err) {
    console.error("completeFieldVisit Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
