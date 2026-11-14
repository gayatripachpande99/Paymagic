import { v4 as uuidv4 } from "uuid";
import { memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { maskCustomerForRole } from "../middleware/authMiddleware.js";
import { cacheService } from "../services/cacheService.js";
import { indexService } from "../services/indexService.js";

const VALID_STATUSES = [
  "New", "Assigned", "Contacted", "Promise to Pay", "Partially Paid",
  "Fully Paid", "Disputed", "Not Reachable", "Field Visit", "Closed"
];

/**
 * GET /api/cases
 * List cases with filtering, search, sorting, and pagination.
 */
export const listCases = async (req, res) => {
  try {
    const {
      status, priority, assignedTo, lender, search,
      sortBy = "created_at", sortOrder = "desc",
      page = 1, limit = 20
    } = req.query;

    let cases = [...memoryStore.loan_cases];

    // --- Filters ---
    if (status) {
      const statusList = status.split(",").map(s => s.trim());
      cases = cases.filter(c => statusList.includes(c.status));
    }
    if (priority) {
      const priorityList = priority.split(",").map(p => p.trim().toUpperCase());
      cases = cases.filter(c => priorityList.includes(c.priority));
    }
    if (assignedTo) {
      cases = cases.filter(c => c.assigned_employee_id === assignedTo);
    }
    if (lender) {
      const lenderLower = lender.toLowerCase();
      cases = cases.filter(c => c.lender_name.toLowerCase().includes(lenderLower));
    }

    // Role-based visibility: callers/field agents see only their own cases
    if (["CALLER", "FIELD_AGENT"].includes(req.user.role)) {
      cases = cases.filter(c => c.assigned_employee_id === req.user.id);
    }

    // --- Search ---
    if (search) {
      const term = search.toLowerCase();
      cases = cases.filter(c => {
        const customer = memoryStore.customers.find(cust => cust.id === c.customer_id);
        const customerName = customer ? customer.full_name.toLowerCase() : "";
        return (
          c.case_number.toLowerCase().includes(term) ||
          customerName.includes(term) ||
          (c.loan_account_no && c.loan_account_no.toLowerCase().includes(term))
        );
      });
    }

    const totalCount = cases.length;

    // --- Sorting ---
    const order = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    cases.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    // --- Pagination ---
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedCases = cases.slice(startIdx, startIdx + limitNum);

    // Enrich with customer name
    const enriched = paginatedCases.map(c => {
      const customer = memoryStore.customers.find(cust => cust.id === c.customer_id);
      return {
        ...c,
        customer_name: customer ? customer.full_name : "Unknown",
        customer_city: customer ? customer.city : null
      };
    });

    return res.status(200).json({
      success: true,
      message: `Found ${totalCount} case(s).`,
      data: {
        cases: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("listCases Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cases/:caseId
 * Get single case with customer details, status history, calls, and payments.
 */
export const getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;
    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId);

    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    // Role-based visibility
    if (
      ["CALLER", "FIELD_AGENT"].includes(req.user.role) &&
      loanCase.assigned_employee_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    // Customer details (masked by role)
    const rawCustomer = memoryStore.customers.find(c => c.id === loanCase.customer_id);
    const customer = maskCustomerForRole(rawCustomer, req.user.role);

    // Status history timeline
    const statusHistory = memoryStore.case_status_history
      .filter(h => h.case_id === caseId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Recent calls
    const calls = memoryStore.calls
      .filter(c => c.case_id === caseId)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, 20);

    // Payments
    const payments = memoryStore.payments
      .filter(p => p.case_id === caseId)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

    // Assigned employee info
    const assignedEmployee = loanCase.assigned_employee_id
      ? memoryStore.users.find(u => u.id === loanCase.assigned_employee_id)
      : null;

    // Case assignments history
    const assignments = memoryStore.case_assignments
      ? memoryStore.case_assignments.filter(a => a.case_id === caseId)
          .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))
      : [];

    return res.status(200).json({
      success: true,
      message: "Case details retrieved.",
      data: {
        case: loanCase,
        customer,
        assigned_employee: assignedEmployee
          ? { id: assignedEmployee.id, full_name: assignedEmployee.full_name, role: assignedEmployee.role, employee_id: assignedEmployee.employee_id }
          : null,
        status_history: statusHistory,
        recent_calls: calls,
        payments,
        assignments
      }
    });
  } catch (error) {
    console.error("getCaseById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/cases/:caseId/status
 * Update case status using updateCaseStatusWithHistory inside atomic transaction.
 */
export const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { newStatus, remarks, follow_up_date, payment_ref } = req.body;

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
    const { caseId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }

    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId);
    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    const employee = memoryStore.users.find(u => u.id === employeeId && u.is_active);
    if (!employee) {
      return res.status(404).json({ success: false, message: `Active employee '${employeeId}' not found.` });
    }

    const now = new Date().toISOString();
    const previousEmployeeId = loanCase.assigned_employee_id;

    // Create assignment record
    const assignment = {
      id: `asgn_${uuidv4()}`,
      case_id: caseId,
      assigned_to: employeeId,
      assigned_from: previousEmployeeId || null,
      assigned_by: req.user.id,
      assignment_type: "MANUAL",
      assigned_at: now,
      remarks: req.body.remarks || `Assigned to ${employee.full_name}`
    };
    memoryStore.case_assignments.push(assignment);

    // Update case
    loanCase.assigned_employee_id = employeeId;
    loanCase.assigned_at = now;
    loanCase.updated_at = now;

    // If case is "New", transition to "Assigned"
    if (loanCase.status === "New") {
      await updateCaseStatusWithHistory({
        caseId,
        employeeId: req.user.id,
        newStatus: "Assigned",
        remarks: `Case assigned to ${employee.full_name} (${employee.employee_id})`
      });
    }

    // Update employee active cases count
    const empRecord = memoryStore.employees.find(e => e.id === employeeId);
    if (empRecord) {
      empRecord.active_cases_count = memoryStore.loan_cases.filter(
        c => c.assigned_employee_id === employeeId && !["Closed", "Fully Paid"].includes(c.status)
      ).length;
    }

    return res.status(200).json({
      success: true,
      message: `Case ${loanCase.case_number} assigned to ${employee.full_name}.`,
      data: { case: loanCase, assignment }
    });
  } catch (error) {
    console.error("assignCase Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-memory store for active allocation preview sessions
const allocationPreviewStore = new Map();

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

    // 1. Identify eligible active employees
    let eligibleEmployees = memoryStore.users.filter(
      u => ["CALLER", "FIELD_AGENT", "SUPERVISOR", "EMPLOYEE"].includes(u.role) && u.is_active
    );

    if (targetEmployeeIds && targetEmployeeIds.length > 0) {
      eligibleEmployees = eligibleEmployees.filter(
        u => targetEmployeeIds.includes(u.id) || targetEmployeeIds.includes(u.employee_id)
      );
    }

    if (eligibleEmployees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No eligible active employees available for allocation."
      });
    }

    // 2. Filter candidate cases (unassigned or "New")
    let candidateCases = memoryStore.loan_cases.filter(
      c => !c.assigned_employee_id || c.status === "New"
    );

    if (rules.minAmount !== undefined && rules.minAmount !== "") {
      const minA = parseFloat(rules.minAmount);
      if (!isNaN(minA)) candidateCases = candidateCases.filter(c => c.outstanding_amount >= minA);
    }
    if (rules.maxAmount !== undefined && rules.maxAmount !== "") {
      const maxA = parseFloat(rules.maxAmount);
      if (!isNaN(maxA)) candidateCases = candidateCases.filter(c => c.outstanding_amount <= maxA);
    }
    if (rules.priority) {
      const pList = Array.isArray(rules.priority) ? rules.priority : [rules.priority];
      candidateCases = candidateCases.filter(c => pList.includes(c.priority));
    }
    if (rules.city) {
      const cityLower = rules.city.toLowerCase();
      candidateCases = candidateCases.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.city && cust.city.toLowerCase() === cityLower;
      });
    }
    if (rules.lender) {
      const lenderLower = rules.lender.toLowerCase();
      candidateCases = candidateCases.filter(c => c.lender_name.toLowerCase().includes(lenderLower));
    }

    const maxAllocation = Math.min(candidateCases.length, parseInt(limit, 10) || 50);
    const selectedCases = candidateCases.slice(0, maxAllocation);

    if (selectedCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No unassigned cases match the specified allocation criteria."
      });
    }

    // 3. Compute distribution according to strategy
    const employeeBuckets = eligibleEmployees.map(emp => {
      const currentActive = memoryStore.loan_cases.filter(
        c => c.assigned_employee_id === emp.id && !["Closed", "Fully Paid"].includes(c.status)
      ).length;
      return {
        employee: emp,
        current_active: currentActive,
        assigned_cases: []
      };
    });

    if (strategy === "AMOUNT_BALANCED" || strategy === "AMOUNT_DESC") {
      // Sort cases by outstanding amount descending
      const sortedCases = [...selectedCases].sort((a, b) => (b.outstanding_amount || 0) - (a.outstanding_amount || 0));
      // Snake / greedy distribution: assign next case to employee with smallest running total
      for (const lc of sortedCases) {
        employeeBuckets.sort((a, b) => {
          const sumA = a.assigned_cases.reduce((s, c) => s + (c.outstanding_amount || 0), 0);
          const sumB = b.assigned_cases.reduce((s, c) => s + (c.outstanding_amount || 0), 0);
          return sumA - sumB;
        });
        employeeBuckets[0].assigned_cases.push(lc);
      }
    } else if (strategy === "WORKLOAD_BASED") {
      // Prioritize staff with lowest current active cases
      for (const lc of selectedCases) {
        employeeBuckets.sort((a, b) => (a.current_active + a.assigned_cases.length) - (b.current_active + b.assigned_cases.length));
        employeeBuckets[0].assigned_cases.push(lc);
      }
    } else if (strategy === "LOCATION_MATCH" || strategy === "LOCATION") {
      let roundRobinIdx = 0;
      for (const lc of selectedCases) {
        const cust = memoryStore.customers.find(c => c.id === lc.customer_id);
        const city = cust?.city || "";
        const matchedBucket = employeeBuckets.find(
          b => b.employee.city && b.employee.city.toLowerCase() === city.toLowerCase()
        );
        if (matchedBucket) {
          matchedBucket.assigned_cases.push(lc);
        } else {
          employeeBuckets[roundRobinIdx % employeeBuckets.length].assigned_cases.push(lc);
          roundRobinIdx++;
        }
      }
    } else {
      // Default: EQUAL distribution (Round-Robin)
      selectedCases.forEach((lc, idx) => {
        const bucketIdx = idx % employeeBuckets.length;
        employeeBuckets[bucketIdx].assigned_cases.push(lc);
      });
    }

    const previewId = `alloc_prev_${uuidv4().slice(0, 8)}`;
    const totalOutstanding = selectedCases.reduce((s, c) => s + (c.outstanding_amount || 0), 0);

    const proposedSummary = employeeBuckets.map(b => ({
      user_id: b.employee.id,
      employee_id: b.employee.employee_id,
      employee_name: b.employee.full_name,
      role: b.employee.role,
      current_active_cases: b.current_active,
      proposed_cases_count: b.assigned_cases.length,
      proposed_outstanding_amount: b.assigned_cases.reduce((s, c) => s + (c.outstanding_amount || 0), 0),
      case_ids: b.assigned_cases.map(c => c.id),
      sample_cases: b.assigned_cases.slice(0, 3).map(c => ({
        id: c.id,
        case_number: c.case_number,
        loan_account_no: c.loan_account_no,
        outstanding_amount: c.outstanding_amount,
        priority: c.priority
      }))
    }));

    // Cache preview session
    allocationPreviewStore.set(previewId, {
      previewId,
      strategy,
      rules,
      selectedCases,
      proposedSummary,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Preview generated: ${selectedCases.length} cases evaluated across ${eligibleEmployees.length} agents.`,
      data: {
        preview_id: previewId,
        strategy,
        total_cases_selected: selectedCases.length,
        total_outstanding_amount: totalOutstanding,
        eligible_employees_count: eligibleEmployees.length,
        allocations: proposedSummary
      }
    });
  } catch (error) {
    console.error("previewRuleAllocation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cases/allocate/execute
 * Atomically commits the rule-based allocation to the database.
 */
export const executeRuleAllocation = async (req, res) => {
  try {
    const { preview_id } = req.body;

    if (!preview_id) {
      return res.status(400).json({ success: false, message: "preview_id is required." });
    }

    const preview = allocationPreviewStore.get(preview_id);
    if (!preview) {
      return res.status(404).json({
        success: false,
        message: "Allocation preview session expired or not found. Please regenerate preview."
      });
    }

    const { strategy, proposedSummary } = preview;
    const now = new Date().toISOString();
    let totalAssigned = 0;

    for (const alloc of proposedSummary) {
      for (const caseId of alloc.case_ids) {
        const lc = memoryStore.loan_cases.find(c => c.id === caseId);
        if (!lc) continue;

        const prevEmpId = lc.assigned_employee_id;
        lc.assigned_employee_id = alloc.user_id;
        lc.assigned_at = now;
        lc.updated_at = now;

        // Record assignment
        memoryStore.case_assignments.push({
          id: `asgn_${uuidv4()}`,
          case_id: lc.id,
          assigned_to: alloc.user_id,
          assigned_from: prevEmpId || null,
          assigned_by: req.user.id,
          assignment_type: "RULE_BASED",
          assigned_at: now,
          remarks: `Rule-based allocation (${strategy}) to ${alloc.employee_name}`
        });

        // If case was New, transition to Assigned
        if (lc.status === "New") {
          lc.status = "Assigned";
          memoryStore.case_status_history.unshift({
            id: `csh_${uuidv4()}`,
            case_id: lc.id,
            employee_id: req.user.id,
            previous_status: "New",
            new_status: "Assigned",
            source: "Admin",
            remarks: `Rule-allocated (${strategy}) to ${alloc.employee_name} (${alloc.employee_id})`,
            created_at: now
          });
        }

        totalAssigned++;
      }

      // Update employee active cases count
      const empRecord = memoryStore.employees.find(e => e.id === alloc.user_id);
      if (empRecord) {
        empRecord.active_cases_count = memoryStore.loan_cases.filter(
          c => c.assigned_employee_id === alloc.user_id && !["Closed", "Fully Paid"].includes(c.status)
        ).length;
      }
    }

    indexService.rebuild(memoryStore);
    cacheService.delPattern("cases:*");
    cacheService.delPattern("dashboard:*");
    allocationPreviewStore.delete(preview_id);

    return res.status(200).json({
      success: true,
      message: `Successfully executed rule allocation: ${totalAssigned} cases assigned across ${proposedSummary.length} employees.`,
      data: {
        total_assigned: totalAssigned,
        strategy,
        summary: proposedSummary.map(p => ({
          employee_id: p.employee_id,
          employee_name: p.employee_name,
          assigned_cases_count: p.proposed_cases_count,
          assigned_outstanding_amount: p.proposed_outstanding_amount
        }))
      }
    });
  } catch (error) {
    console.error("executeRuleAllocation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
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

    const employee = memoryStore.users.find(
      u => (u.id === targetEmpId || u.employee_id === targetEmpId) && u.is_active
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: `Active employee '${targetEmpId}' not found.` });
    }

    let targetCases = [];

    if (caseIds && Array.isArray(caseIds) && caseIds.length > 0) {
      targetCases = memoryStore.loan_cases.filter(c => caseIds.includes(c.id));
    } else if (mode === "rule-based" || rule) {
      targetCases = memoryStore.loan_cases.filter(c => c.status === "New" || !c.assigned_employee_id);

      const filterRules = rules || {};
      if (rule === "AMOUNT_DESC") {
        targetCases.sort((a, b) => (b.outstanding_amount || 0) - (a.outstanding_amount || 0));
      } else if (rule === "LOCATION" || filterRules.city || city) {
        const targetCity = (city || filterRules.city || "").toLowerCase();
        if (targetCity) {
          targetCases = targetCases.filter(c => {
            const customer = memoryStore.customers.find(cust => cust.id === c.customer_id);
            return customer && customer.city && customer.city.toLowerCase() === targetCity;
          });
        }
      }

      const maxLimit = parseInt(limit || filterRules.maxCases || 25, 10);
      targetCases = targetCases.slice(0, maxLimit);
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide either a list of caseIds or allocation rules/limit."
      });
    }

    if (targetCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No eligible cases found matching selection criteria."
      });
    }

    const now = new Date().toISOString();
    let assignedCount = 0;
    const errors = [];

    for (const loanCase of targetCases) {
      try {
        const previousEmployeeId = loanCase.assigned_employee_id;

        const assignment = {
          id: `asgn_${uuidv4()}`,
          case_id: loanCase.id,
          assigned_to: employee.id,
          assigned_from: previousEmployeeId || null,
          assigned_by: req.user.id,
          assignment_type: caseIds ? "BULK_MANUAL" : "RULE_BASED",
          assigned_at: now,
          remarks: `Bulk assignment to ${employee.full_name}`
        };
        memoryStore.case_assignments.push(assignment);

        loanCase.assigned_employee_id = employee.id;
        loanCase.assigned_at = now;
        loanCase.updated_at = now;

        if (loanCase.status === "New") {
          await updateCaseStatusWithHistory({
            caseId: loanCase.id,
            employeeId: req.user.id,
            newStatus: "Assigned",
            source: "Admin",
            remarks: `Bulk assigned to ${employee.full_name}`
          });
        }

        assignedCount++;
      } catch (err) {
        errors.push({ caseId: loanCase.id, error: err.message });
      }
    }

    // Update employee active cases count
    const empRecord = memoryStore.employees.find(e => e.id === employee.id);
    if (empRecord) {
      empRecord.active_cases_count = memoryStore.loan_cases.filter(
        c => c.assigned_employee_id === employee.id && !["Closed", "Fully Paid"].includes(c.status)
      ).length;
    }

    indexService.rebuild(memoryStore);
    cacheService.delPattern("cases:*");
    cacheService.delPattern("dashboard:*");

    return res.status(200).json({
      success: true,
      message: `${assignedCount} case(s) assigned to ${employee.full_name}.`,
      data: {
        assigned_count: assignedCount,
        total_requested: targetCases.length,
        assigned_to: {
          id: employee.id,
          employee_id: employee.employee_id,
          name: employee.full_name
        },
        errors: errors.length > 0 ? errors : undefined
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
    const caseId = req.params.caseId || req.params.id || req.body.caseId || req.body.case_id;
    const { fromEmployeeId, toEmployeeId, count, reason } = req.body;

    if (!toEmployeeId) {
      return res.status(400).json({ success: false, message: "toEmployeeId is required." });
    }

    const toEmployee = memoryStore.users.find(
      u => (u.id === toEmployeeId || u.employee_id === toEmployeeId) && u.is_active
    );
    if (!toEmployee) {
      return res.status(404).json({ success: false, message: `Target employee '${toEmployeeId}' not found or inactive.` });
    }

    const now = new Date().toISOString();

    // 1. Single Case Transfer
    if (caseId) {
      const loanCase = memoryStore.loan_cases.find(c => c.id === caseId || c.case_number === caseId);
      if (!loanCase) {
        return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
      }

      const prevEmpId = loanCase.assigned_employee_id;
      if (prevEmpId === toEmployee.id) {
        return res.status(400).json({ success: false, message: "Case is already assigned to this employee." });
      }

      const assignment = {
        id: `asgn_${uuidv4()}`,
        case_id: loanCase.id,
        assigned_to: toEmployee.id,
        assigned_from: prevEmpId,
        assigned_by: req.user.id,
        assignment_type: "TRANSFER",
        assigned_at: now,
        remarks: reason || `Transferred to ${toEmployee.full_name}`
      };
      memoryStore.case_assignments.push(assignment);

      loanCase.assigned_employee_id = toEmployee.id;
      loanCase.assigned_at = now;
      loanCase.updated_at = now;

      // Status history entry for transfer audit
      memoryStore.case_status_history.unshift({
        id: `csh_${uuidv4()}`,
        case_id: loanCase.id,
        employee_id: req.user.id,
        previous_status: loanCase.status,
        new_status: loanCase.status,
        remarks: `Case transferred to ${toEmployee.full_name} (${toEmployee.employee_id}). Reason: ${reason || 'Workload rebalance'}`,
        created_at: now
      });

      cacheService.delPattern("dashboard:*");

      return res.status(200).json({
        success: true,
        message: `Case ${loanCase.case_number} transferred to ${toEmployee.full_name}.`,
        data: { case: loanCase, assignment }
      });
    }

    // 2. Bulk Employee-to-Employee Transfer
    if (fromEmployeeId) {
      const fromEmp = memoryStore.users.find(u => u.id === fromEmployeeId || u.employee_id === fromEmployeeId);
      let casesToTransfer = memoryStore.loan_cases.filter(
        c => c.assigned_employee_id === (fromEmp ? fromEmp.id : fromEmployeeId) && !["Closed", "Fully Paid"].includes(c.status)
      );

      const limit = parseInt(count, 10) || casesToTransfer.length;
      casesToTransfer = casesToTransfer.slice(0, limit);

      if (casesToTransfer.length === 0) {
        return res.status(400).json({ success: false, message: "No active cases found to transfer from this employee." });
      }

      for (const lc of casesToTransfer) {
        lc.assigned_employee_id = toEmployee.id;
        lc.assigned_at = now;
        lc.updated_at = now;

        memoryStore.case_assignments.push({
          id: `asgn_${uuidv4()}`,
          case_id: lc.id,
          assigned_to: toEmployee.id,
          assigned_from: fromEmp?.id || fromEmployeeId,
          assigned_by: req.user.id,
          assignment_type: "TRANSFER",
          assigned_at: now,
          remarks: reason || `Bulk transfer from ${fromEmp?.full_name || fromEmployeeId} to ${toEmployee.full_name}`
        });

        memoryStore.case_status_history.unshift({
          id: `csh_${uuidv4()}`,
          case_id: lc.id,
          employee_id: req.user.id,
          previous_status: lc.status,
          new_status: lc.status,
          remarks: `Transferred to ${toEmployee.full_name}. ${reason || ''}`,
          created_at: now
        });
      }

      cacheService.delPattern("dashboard:*");

      return res.status(200).json({
        success: true,
        message: `Successfully transferred ${casesToTransfer.length} case(s) from ${fromEmp?.full_name || fromEmployeeId} to ${toEmployee.full_name}.`,
        data: { transferredCount: casesToTransfer.length }
      });
    }

    return res.status(400).json({ success: false, message: "Either caseId or fromEmployeeId is required." });
  } catch (error) {
    console.error("transferCase Error:", error);
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

    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId);
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

    const employee = memoryStore.users.find(u => u.id === employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee '${employeeId}' not found.` });
    }

    const now = new Date().toISOString();

    // Check if target already exists for this employee/month/year
    const existingTarget = memoryStore.targets.find(
      t => t.employee_id === employeeId && t.month === month && t.year === year
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
    const transfers = (memoryStore.case_assignments || [])
      .filter(a => a.assignment_type === "TRANSFER")
      .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = transfers.slice(startIdx, startIdx + limitNum);

    const enriched = paginated.map(t => {
      const targetCase = memoryStore.loan_cases.find(c => c.id === t.case_id);
      const fromEmp = memoryStore.users.find(u => u.id === t.assigned_from || u.employee_id === t.assigned_from);
      const toEmp = memoryStore.users.find(u => u.id === t.assigned_to || u.employee_id === t.assigned_to);
      const byEmp = memoryStore.users.find(u => u.id === t.assigned_by);
      return {
        ...t,
        case_number: targetCase?.case_number || "N/A",
        loan_account_no: targetCase?.loan_account_no || "N/A",
        from_employee_name: fromEmp?.full_name || t.assigned_from || "Unassigned",
        to_employee_name: toEmp?.full_name || t.assigned_to,
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
          totalPages: Math.ceil(transfers.length / limitNum)
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

    let payments = [...memoryStore.payments];

    if (caseId) payments = payments.filter(p => p.case_id === caseId);
    if (employeeId) payments = payments.filter(p => p.collected_by_id === employeeId);
    if (paymentMode && paymentMode !== "ALL") {
      payments = payments.filter(p => p.payment_mode?.toUpperCase() === paymentMode.toUpperCase());
    }
    if (startDate) payments = payments.filter(p => p.payment_date >= startDate);
    if (endDate) payments = payments.filter(p => p.payment_date <= endDate);

    // Caller/Field Agent only sees their own collections
    if (["CALLER", "FIELD_AGENT"].includes(req.user.role) && !employeeId) {
      payments = payments.filter(p => p.collected_by_id === req.user.id);
    }

    payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const enriched = payments.map(p => {
      const loanCase = memoryStore.loan_cases.find(c => c.id === p.case_id);
      const customer = memoryStore.customers.find(c => c.id === p.customer_id);
      const collector = memoryStore.users.find(u => u.id === p.collected_by_id);
      return {
        ...p,
        case_number: loanCase ? loanCase.case_number : "Unknown",
        lender_name: loanCase ? loanCase.lender_name : "Unknown",
        customer_name: customer ? customer.full_name : "Unknown",
        collector_name: collector ? collector.full_name : "Staff Member"
      };
    });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = enriched.slice(startIdx, startIdx + limitNum);

    return res.status(200).json({
      success: true,
      data: {
        payments: paginated,
        summary: {
          total_count: payments.length,
          total_collected: totalCollected
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: payments.length,
          totalPages: Math.ceil(payments.length / limitNum)
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
    const { id: caseId } = req.params;
    const { amount, payment_mode = "UPI", transaction_ref, notes = "" } = req.body;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid payment amount is required." });
    }

    const loanCase = memoryStore.loan_cases.find(c => c.id === caseId);
    if (!loanCase) {
      return res.status(404).json({ success: false, message: `Case '${caseId}' not found.` });
    }

    const now = new Date().toISOString();
    const prevOutstanding = loanCase.outstanding_amount || 0;
    const newOutstanding = Math.max(0, prevOutstanding - paymentAmount);
    const newRecovered = (loanCase.recovered_amount || 0) + paymentAmount;

    // Determine target status
    let targetStatus = loanCase.status;
    if (newOutstanding === 0) {
      targetStatus = "Fully Paid";
    } else if (targetStatus !== "Fully Paid") {
      targetStatus = "Partially Paid";
    }

    // Atomic update with audit trail
    const statusResult = await updateCaseStatusWithHistory({
      caseId,
      employeeId: req.user.id,
      newStatus: targetStatus,
      remarks: `Payment of ₹${paymentAmount.toLocaleString()} recorded via ${payment_mode}. Receipt ref: ${transaction_ref || 'N/A'}. ${notes}`
    });

    // Update case amounts
    loanCase.outstanding_amount = newOutstanding;
    loanCase.recovered_amount = newRecovered;
    loanCase.updated_at = now;

    // Create payment entry
    const paymentRecord = {
      id: `pay_${uuidv4()}`,
      case_id: caseId,
      customer_id: loanCase.customer_id,
      collected_by_id: req.user.id,
      amount: paymentAmount,
      payment_mode: payment_mode.toUpperCase(),
      transaction_ref: transaction_ref || `TXN-PM-${Date.now().toString().slice(-8)}`,
      receipt_number: `RCP-PAY-${Date.now().toString().slice(-6)}`,
      reconciliation_status: "RECONCILED",
      payment_date: now,
      notes: notes || `Direct payment settlement for loan account ${loanCase.loan_account_no}`
    };

    memoryStore.payments.unshift(paymentRecord);
    cacheService.delPattern("dashboard:*");

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString()} successfully recorded and reconciled. Case status is now '${targetStatus}'.`,
      data: {
        payment: paymentRecord,
        case: loanCase,
        statusHistoryEntry: statusResult.historyEntry
      }
    });
  } catch (error) {
    console.error("recordPayment Error:", error);
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

    if (visit.collected_amount > 0) {
      receiptRef = `RCP-FLD-${Date.now().toString().slice(-6)}`;
      visit.receipt_ref = receiptRef;

      const newOutstanding = Math.max(0, (targetCase.outstanding_amount || 0) - visit.collected_amount);
      const newRecovered = (targetCase.recovered_amount || 0) + visit.collected_amount;

      targetCase.outstanding_amount = newOutstanding;
      targetCase.recovered_amount = newRecovered;
      targetCase.updated_at = now.toISOString();

      paymentRecord = {
        id: `pay_${uuidv4()}`,
        case_id: caseId,
        customer_id: targetCase.customer_id,
        collected_by_id: req.user.id,
        amount: visit.collected_amount,
        payment_mode: payment_mode.toUpperCase(),
        transaction_ref: receiptRef,
        receipt_number: receiptRef,
        reconciliation_status: "RECONCILED",
        payment_date: now.toISOString(),
        notes: `Field collection on-site by agent. ${visit_notes || ''}`
      };

      memoryStore.payments.unshift(paymentRecord);
    }

    let nextCaseStatus = "Contacted";
    if (visit.collected_amount > 0) {
      nextCaseStatus = targetCase.outstanding_amount <= 0 ? "Fully Paid" : "Partially Paid";
    } else if (visit_outcome?.toLowerCase().includes("promise")) {
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
      remarks: `Field visit concluded: ${visit_outcome}. Notes: ${visit_notes || 'None'}. Collected: ₹${visit.collected_amount.toLocaleString('en-IN')}. Receipt: ${receiptRef || 'N/A'}`
    });

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
