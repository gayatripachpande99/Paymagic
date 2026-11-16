import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";
import { caseRepository } from "../repositories/caseRepository.js";
import { employeeRepository } from "../repositories/employeeRepository.js";
import { toPaise, fromPaise } from "../repositories/paymentRepository.js";

// Active cases that count toward employee workload
const ACTIVE_STATUSES = ["Assigned", "Contacted", "Promise to Pay", "Partially Paid", "Not Reachable", "Field Visit"];
const INACTIVE_STATUSES = ["Fully Paid", "Closed"];

// Priority weights
const PRIORITY_WEIGHTS = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export const caseAllocationService = {
  /**
   * Retrieve eligible employees considering role, supervisor boundaries, shift status, and capacity
   */
  async getEligibleEmployees({
    actor,
    supervisorId = null,
    targetEmployeeIds = [],
    role = null,
    roles = ["CALLER", "FIELD_AGENT", "SUPERVISOR", "EMPLOYEE"],
    city = null,
    shiftAware = false,
    includeOnLeave = false,
    client = null
  }) {
    // If actor is a supervisor, restrict supervisorId to their own ID
    let effectiveSupervisorId = supervisorId;
    if (actor && actor.role === "SUPERVISOR") {
      effectiveSupervisorId = actor.id;
    }

    let employees = await employeeRepository.getEligibleEmployees({
      supervisorId: effectiveSupervisorId,
      role,
      roles,
      city,
      shiftAware,
      includeOnLeave,
      client
    });

    if (targetEmployeeIds && targetEmployeeIds.length > 0) {
      employees = employees.filter(
        e => targetEmployeeIds.includes(e.id) || targetEmployeeIds.includes(e.employee_id)
      );
    }

    return employees;
  },

  /**
   * Retrieve and filter candidate cases based on query or rule specifications
   */
  async getCandidateCases({
    caseIds = [],
    rules = {},
    limit = 50,
    supervisorId = null,
    actor = null,
    client = null
  }) {
    const q = client || db;

    if (db.isPgActive()) {
      const params = [];
      const whereClauses = [];

      if (caseIds && caseIds.length > 0) {
        params.push(caseIds);
        whereClauses.push(`(lc.id = ANY($${params.length}) OR lc.case_number = ANY($${params.length}))`);
      } else {
        // Default candidates: unassigned or "New" cases
        whereClauses.push(`(lc.assigned_employee_id IS NULL OR lc.status = 'New')`);
      }

      // Never allocate Closed or Fully Paid
      whereClauses.push(`lc.status NOT IN ('Closed', 'Fully Paid')`);

      if (actor && actor.role === "SUPERVISOR") {
        params.push(actor.id);
        whereClauses.push(`(lc.assigned_supervisor_id = $${params.length} OR lc.assigned_supervisor_id IS NULL)`);
      }

      if (rules.minAmount !== undefined && rules.minAmount !== "") {
        params.push(parseFloat(rules.minAmount));
        whereClauses.push(`lc.outstanding_amount >= $${params.length}`);
      }
      if (rules.maxAmount !== undefined && rules.maxAmount !== "") {
        params.push(parseFloat(rules.maxAmount));
        whereClauses.push(`lc.outstanding_amount <= $${params.length}`);
      }
      if (rules.priority) {
        const priorities = Array.isArray(rules.priority) ? rules.priority : [rules.priority];
        params.push(priorities);
        whereClauses.push(`lc.priority = ANY($${params.length})`);
      }
      if (rules.dpdMin !== undefined && rules.dpdMin !== "") {
        params.push(parseInt(rules.dpdMin, 10));
        whereClauses.push(`lc.dpd >= $${params.length}`);
      }
      if (rules.dpdMax !== undefined && rules.dpdMax !== "") {
        params.push(parseInt(rules.dpdMax, 10));
        whereClauses.push(`lc.dpd <= $${params.length}`);
      }
      if (rules.city) {
        params.push(rules.city.toLowerCase());
        whereClauses.push(`LOWER(c.city) = $${params.length}`);
      }
      if (rules.lender) {
        params.push(`%${rules.lender.toLowerCase()}%`);
        whereClauses.push(`LOWER(lc.lender_name) LIKE $${params.length}`);
      }
      if (rules.loanType) {
        params.push(rules.loanType);
        whereClauses.push(`lc.loan_type = $${params.length}`);
      }

      params.push(parseInt(limit, 10) || 50);
      const limitParam = `$${params.length}`;

      const sql = `
        SELECT lc.*, c.full_name as customer_name, c.city, c.state, c.pincode
        FROM loan_cases lc
        JOIN customers c ON lc.customer_id = c.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY lc.outstanding_amount DESC, lc.id ASC
        LIMIT ${limitParam}
      `;

      const res = await q.query(sql, params);
      return res.rows.map(r => ({
        ...r,
        outstanding_amount: parseFloat(r.outstanding_amount) || 0,
        principal_amount: parseFloat(r.principal_amount) || 0,
        dpd: parseInt(r.dpd, 10) || 0
      }));
    }

    // In-memory relational mode
    let list = [...memoryStore.loan_cases];

    if (caseIds && caseIds.length > 0) {
      list = list.filter(c => caseIds.includes(c.id) || caseIds.includes(c.case_number));
    } else {
      const unassigned = list.filter(c => !c.assigned_employee_id || c.status === "New");
      list = unassigned.length > 0 ? unassigned : list.filter(c => !INACTIVE_STATUSES.includes(c.status));
    }

    list = list.filter(c => !INACTIVE_STATUSES.includes(c.status));

    if (actor && actor.role === "SUPERVISOR") {
      list = list.filter(c => !c.assigned_supervisor_id || c.assigned_supervisor_id === actor.id);
    }

    if (rules.minAmount !== undefined && rules.minAmount !== "") {
      const minA = parseFloat(rules.minAmount);
      if (!isNaN(minA)) list = list.filter(c => c.outstanding_amount >= minA);
    }
    if (rules.maxAmount !== undefined && rules.maxAmount !== "") {
      const maxA = parseFloat(rules.maxAmount);
      if (!isNaN(maxA)) list = list.filter(c => c.outstanding_amount <= maxA);
    }
    if (rules.priority) {
      const pList = Array.isArray(rules.priority) ? rules.priority : [rules.priority];
      list = list.filter(c => pList.includes(c.priority));
    }
    if (rules.dpdMin !== undefined && rules.dpdMin !== "") {
      const dMin = parseInt(rules.dpdMin, 10);
      if (!isNaN(dMin)) list = list.filter(c => c.dpd >= dMin);
    }
    if (rules.dpdMax !== undefined && rules.dpdMax !== "") {
      const dMax = parseInt(rules.dpdMax, 10);
      if (!isNaN(dMax)) list = list.filter(c => c.dpd <= dMax);
    }
    if (rules.city) {
      const cityLower = rules.city.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.city && cust.city.toLowerCase() === cityLower;
      });
    }
    if (rules.lender) {
      const lenderLower = rules.lender.toLowerCase();
      list = list.filter(c => c.lender_name && c.lender_name.toLowerCase().includes(lenderLower));
    }
    if (rules.loanType) {
      list = list.filter(c => c.loan_type === rules.loanType);
    }

    const lim = parseInt(limit, 10) || 50;
    return list.slice(0, lim).map(c => {
      const cust = memoryStore.customers.find(customer => customer.id === c.customer_id);
      return {
        ...c,
        customer_name: cust?.full_name || "",
        city: cust?.city || "",
        state: cust?.state || "",
        pincode: cust?.pincode || ""
      };
    });
  },

  /**
   * PHASE 5.10 — Generate a durable, read-only allocation preview.
   * Never mutates database records or case assignments.
   */
  async generatePreview({
    strategy = "EQUAL",
    caseIds = [],
    rules = {},
    limit = 50,
    targetEmployeeIds = [],
    shiftAware = false,
    actor = null
  }) {
    // 1. Identify eligible employees
    const eligibleEmployees = await this.getEligibleEmployees({
      actor,
      targetEmployeeIds,
      city: strategy === "LOCATION" ? rules.city : null,
      shiftAware: shiftAware || strategy === "SHIFT_AWARE"
    });

    if (eligibleEmployees.length === 0) {
      throw new Error("No eligible active employees available matching the specified allocation criteria.");
    }

    // 2. Identify candidate cases
    const candidateCases = await this.getCandidateCases({
      caseIds,
      rules,
      limit,
      actor
    });

    if (candidateCases.length === 0) {
      throw new Error("No eligible unassigned cases match the specified allocation criteria.");
    }

    // 3. Prepare distribution buckets with live capacities
    const employeeBuckets = eligibleEmployees.map(emp => ({
      employee: emp,
      current_active_cases: emp.current_active_cases,
      max_workload_capacity: emp.max_workload_capacity,
      remaining_case_capacity: emp.remaining_case_capacity,
      current_portfolio_paise: toPaise(emp.current_portfolio_amount),
      max_portfolio_paise: toPaise(emp.max_portfolio_amount),
      remaining_portfolio_paise: toPaise(emp.remaining_portfolio_capacity),
      assigned_cases: [],
      assigned_portfolio_paise: 0n
    }));

    const unallocatedCases = [];

    // Helper: test if an employee has capacity for a case
    const hasCapacity = (bucket, caseItem) => {
      const casePaise = toPaise(caseItem.outstanding_amount);
      const wouldExceedCases = (bucket.assigned_cases.length + 1) > bucket.remaining_case_capacity;
      const wouldExceedPortfolio = (bucket.assigned_portfolio_paise + casePaise) > bucket.remaining_portfolio_paise;
      return !wouldExceedCases && !wouldExceedPortfolio;
    };

    // Helper: assign case to bucket
    const assignToBucket = (bucket, caseItem) => {
      bucket.assigned_cases.push(caseItem);
      bucket.assigned_portfolio_paise += toPaise(caseItem.outstanding_amount);
    };

    // 4. Execute strategy-specific distribution
    if (strategy === "AMOUNT_BALANCED" || strategy === "AMOUNT_DESC") {
      // Sort cases by outstanding amount descending
      const sortedCases = [...candidateCases].sort((a, b) => b.outstanding_amount - a.outstanding_amount);
      const isBatchOnly = rules.batchOnly === true || rules.balanceMode === "BATCH";

      for (const lc of sortedCases) {
        // Pick eligible employee with lowest projected portfolio who still has capacity
        const candidates = employeeBuckets
          .filter(b => hasCapacity(b, lc))
          .sort((a, b) => {
            const baseA = isBatchOnly ? 0n : a.current_portfolio_paise;
            const baseB = isBatchOnly ? 0n : b.current_portfolio_paise;
            const projA = baseA + a.assigned_portfolio_paise;
            const projB = baseB + b.assigned_portfolio_paise;
            return projA < projB ? -1 : (projA > projB ? 1 : 0);
          });

        if (candidates.length > 0) {
          assignToBucket(candidates[0], lc);
        } else {
          unallocatedCases.push({
            id: lc.id,
            case_number: lc.case_number,
            outstanding_amount: lc.outstanding_amount,
            reason: "All eligible employees have reached maximum capacity or portfolio limit."
          });
        }
      }
    } else if (strategy === "PRIORITY" || strategy === "PRIORITY_BASED") {
      // Sort by priority weight descending, then DPD descending
      const sortedCases = [...candidateCases].sort((a, b) => {
        const pwA = PRIORITY_WEIGHTS[a.priority?.toUpperCase()] || 0;
        const pwB = PRIORITY_WEIGHTS[b.priority?.toUpperCase()] || 0;
        if (pwB !== pwA) return pwB - pwA;
        return (b.dpd || 0) - (a.dpd || 0);
      });

      for (const lc of sortedCases) {
        const candidates = employeeBuckets
          .filter(b => hasCapacity(b, lc))
          .sort((a, b) => {
            // Prefer employee with lowest current + assigned workload
            const totalA = a.current_active_cases + a.assigned_cases.length;
            const totalB = b.current_active_cases + b.assigned_cases.length;
            return totalA - totalB;
          });

        if (candidates.length > 0) {
          assignToBucket(candidates[0], lc);
        } else {
          unallocatedCases.push({
            id: lc.id,
            case_number: lc.case_number,
            outstanding_amount: lc.outstanding_amount,
            reason: "All eligible employees at capacity for this priority level."
          });
        }
      }
    } else if (strategy === "DPD" || strategy === "OVERDUE_BUCKET") {
      // Sort by DPD descending (oldest debt first)
      const sortedCases = [...candidateCases].sort((a, b) => (b.dpd || 0) - (a.dpd || 0));

      for (const lc of sortedCases) {
        const candidates = employeeBuckets
          .filter(b => hasCapacity(b, lc))
          .sort((a, b) => (a.current_active_cases + a.assigned_cases.length) - (b.current_active_cases + b.assigned_cases.length));

        if (candidates.length > 0) {
          assignToBucket(candidates[0], lc);
        } else {
          unallocatedCases.push({
            id: lc.id,
            case_number: lc.case_number,
            outstanding_amount: lc.outstanding_amount,
            reason: "All eligible employees at capacity for DPD allocation."
          });
        }
      }
    } else if (strategy === "LOCATION" || strategy === "GEOGRAPHICAL") {
      for (const lc of candidateCases) {
        const cityLower = (lc.city || "").toLowerCase().trim();
        const pincode = (lc.pincode || "").trim();

        // 1. Try exact pincode match
        let matched = employeeBuckets.find(b => b.employee.pincode === pincode && hasCapacity(b, lc));

        // 2. Try city match
        if (!matched && cityLower) {
          matched = employeeBuckets.find(
            b => b.employee.city && b.employee.city.toLowerCase().trim() === cityLower && hasCapacity(b, lc)
          );
        }

        // 3. Fallback to lowest workload bucket with capacity
        if (!matched) {
          const candidates = employeeBuckets
            .filter(b => hasCapacity(b, lc))
            .sort((a, b) => (a.current_active_cases + a.assigned_cases.length) - (b.current_active_cases + b.assigned_cases.length));
          if (candidates.length > 0) matched = candidates[0];
        }

        if (matched) {
          assignToBucket(matched, lc);
        } else {
          unallocatedCases.push({
            id: lc.id,
            case_number: lc.case_number,
            outstanding_amount: lc.outstanding_amount,
            city: lc.city,
            reason: "No available staff with capacity in location or fallback pool."
          });
        }
      }
    } else {
      // Default: EQUAL (Round-Robin with capacity guards)
      let roundRobinIdx = 0;
      for (const lc of candidateCases) {
        let placed = false;
        const attempts = employeeBuckets.length;

        for (let i = 0; i < attempts; i++) {
          const bucket = employeeBuckets[(roundRobinIdx + i) % attempts];
          if (hasCapacity(bucket, lc)) {
            assignToBucket(bucket, lc);
            roundRobinIdx = (roundRobinIdx + i + 1) % attempts;
            placed = true;
            break;
          }
        }

        if (!placed) {
          unallocatedCases.push({
            id: lc.id,
            case_number: lc.case_number,
            outstanding_amount: lc.outstanding_amount,
            reason: "All eligible staff have reached maximum case capacity or portfolio limit."
          });
        }
      }
    }

    // 5. Build proposed summary per employee
    const proposedAllocations = employeeBuckets.map(b => {
      const assignedCount = b.assigned_cases.length;
      const assignedPaise = b.assigned_portfolio_paise;
      const assignedAmount = parseFloat(fromPaise(assignedPaise));
      const projectedActive = b.current_active_cases + assignedCount;
      const projectedPortfolio = parseFloat(fromPaise(b.current_portfolio_paise + assignedPaise));

      const capacityUsagePct = b.max_workload_capacity > 0
        ? Math.round((projectedActive / b.max_workload_capacity) * 100)
        : 100;
      const portfolioUsagePct = b.max_portfolio_paise > 0n
        ? Math.round(Number((b.current_portfolio_paise + assignedPaise) * 100n / b.max_portfolio_paise))
        : 100;

      // Group by priority
      const priorityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      b.assigned_cases.forEach(c => {
        const p = c.priority?.toUpperCase() || "MEDIUM";
        priorityCounts[p] = (priorityCounts[p] || 0) + 1;
      });

      return {
        user_id: b.employee.id,
        employee_id: b.employee.employee_id,
        employee_name: b.employee.full_name,
        role: b.employee.role,
        supervisor_id: b.employee.supervisor_id,
        city: b.employee.city,
        current_active_cases: b.current_active_cases,
        proposed_cases_count: assignedCount,
        projected_total_cases: projectedActive,
        max_workload_capacity: b.max_workload_capacity,
        capacity_utilization_pct: capacityUsagePct,
        current_portfolio_amount: b.employee.current_portfolio_amount,
        proposed_portfolio_amount: assignedAmount,
        projected_portfolio_amount: projectedPortfolio,
        max_portfolio_amount: b.employee.max_portfolio_amount,
        portfolio_utilization_pct: portfolioUsagePct,
        case_ids: b.assigned_cases.map(c => c.id),
        priority_breakdown: priorityCounts,
        sample_cases: b.assigned_cases.slice(0, 3).map(c => ({
          id: c.id,
          case_number: c.case_number,
          loan_account_no: c.loan_account_no,
          outstanding_amount: c.outstanding_amount,
          priority: c.priority,
          city: c.city
        }))
      };
    });

    const totalAllocated = proposedAllocations.reduce((s, p) => s + p.proposed_cases_count, 0);
    const totalAllocatedAmount = proposedAllocations.reduce((s, p) => s + p.proposed_portfolio_amount, 0);

    const previewId = `alloc_prev_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString(); // 15-minute durability

    const previewPayload = {
      preview_id: previewId,
      strategy,
      rules,
      total_cases_selected: candidateCases.length,
      total_allocated_cases: totalAllocated,
      unallocated_cases_count: unallocatedCases.length,
      unallocated_cases: unallocatedCases,
      total_outstanding_amount: Math.round(totalAllocatedAmount * 100) / 100,
      eligible_employees_count: eligibleEmployees.length,
      allocations: proposedAllocations,
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    };

    // Store preview durably
    if (db.isPgActive()) {
      await db.query(
        `INSERT INTO allocation_sessions (
          id, created_by_id, strategy, rules, total_cases_selected, total_outstanding_amount,
          eligible_employees_count, preview_data, status, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)`,
        [
          previewId,
          actor?.id || "usr_admin",
          strategy,
          JSON.stringify(rules),
          candidateCases.length,
          totalAllocatedAmount,
          eligibleEmployees.length,
          JSON.stringify(previewPayload),
          expiresAt
        ]
      );
    } else {
      if (!memoryStore.allocation_sessions) memoryStore.allocation_sessions = [];
      memoryStore.allocation_sessions.push({
        id: previewId,
        created_by_id: actor?.id || "usr_admin",
        strategy,
        rules,
        total_cases_selected: candidateCases.length,
        total_outstanding_amount: totalAllocatedAmount,
        eligible_employees_count: eligibleEmployees.length,
        preview_data: previewPayload,
        status: "PENDING",
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });
    }

    return previewPayload;
  },

  /**
   * PHASE 5.10 — Execute confirmed allocation preview atomically.
   * Real-time revalidation: Rechecks case status, capacity, and session expiration.
   */
  async executeAllocation({ previewId, actor }) {
    if (!previewId) {
      throw new Error("preview_id is required.");
    }

    const now = new Date();

    // 1. Fetch preview session
    let session = null;

    if (db.isPgActive()) {
      const res = await db.query(
        "SELECT * FROM allocation_sessions WHERE id = $1 FOR UPDATE",
        [previewId]
      );
      session = res.rows[0];
    } else {
      session = (memoryStore.allocation_sessions || []).find(s => s.id === previewId);
    }

    if (!session) {
      throw new Error("Allocation preview session not found. Please regenerate preview.");
    }

    if (session.status === "EXECUTED") {
      const err = new Error("This allocation preview has already been executed.");
      err.status = 409;
      throw err;
    }

    if (session.status === "CANCELLED") {
      throw new Error("This allocation preview has been cancelled.");
    }

    if (new Date(session.expires_at) < now) {
      const err = new Error("Allocation preview session expired. Please generate a fresh preview.");
      err.status = 410;
      throw err;
    }

    const previewData = typeof session.preview_data === "string"
      ? JSON.parse(session.preview_data)
      : session.preview_data;

    const allocations = previewData.allocations || [];
    let totalAssigned = 0;

    // 2. Atomic Transaction Execution
    await db.transaction(async (trxClient) => {
      for (const alloc of allocations) {
        if (!alloc.case_ids || alloc.case_ids.length === 0) continue;

        // Revalidate employee capacity
        const emp = await employeeRepository.getById(alloc.user_id, trxClient);
        if (!emp || emp.is_active === false) {
          throw new Error(`Target employee '${alloc.employee_name}' is no longer active or available.`);
        }

        // Assign cases in bulk via caseRepository
        const assigned = await caseRepository.assignBulk(
          alloc.case_ids,
          alloc.user_id,
          actor?.id || session.created_by_id,
          `Intelligent Allocation (${session.strategy}) to ${alloc.employee_name}`,
          trxClient
        );

        totalAssigned += assigned.length;

        // Record supervisor attribution on assignments if present
        if (alloc.supervisor_id && db.isPgActive()) {
          await trxClient.query(
            `UPDATE case_assignments
             SET to_supervisor_id = $1, allocation_method = $2
             WHERE case_id = ANY($3) AND assigned_to_id = $4`,
            [alloc.supervisor_id, session.strategy, alloc.case_ids, alloc.user_id]
          );
        }

        // Update employee summary
        const newActiveCount = alloc.projected_total_cases;
        const newPortfolioAmount = alloc.projected_portfolio_amount;
        await employeeRepository.updateWorkloadAndPortfolio(alloc.user_id, newActiveCount, newPortfolioAmount, trxClient);
      }

      // Mark session as EXECUTED
      if (db.isPgActive()) {
        await trxClient.query(
          `UPDATE allocation_sessions
           SET status = 'EXECUTED', executed_at = $1
           WHERE id = $2`,
          [now.toISOString(), previewId]
        );
      } else {
        session.status = "EXECUTED";
        session.executed_at = now.toISOString();
      }
    });

    return {
      preview_id: previewId,
      strategy: session.strategy,
      total_assigned: totalAssigned,
      allocations_summary: allocations.map(a => ({
        employee_id: a.employee_id,
        employee_name: a.employee_name,
        assigned_cases_count: a.proposed_cases_count,
        assigned_portfolio_amount: a.proposed_portfolio_amount
      }))
    };
  },

  /**
   * PHASE 5.8 — Manual single or bulk case assignment with capacity checks
   */
  async manualAssign({ caseIds, employeeId, actor, remarks = "Manual Assignment" }) {
    if (!caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
      throw new Error("caseIds array is required.");
    }
    if (!employeeId) {
      throw new Error("employeeId is required.");
    }

    const emp = await employeeRepository.getById(employeeId);
    if (!emp || emp.is_active === false) {
      throw new Error(`Target employee '${employeeId}' is inactive or not found.`);
    }

    // Role-based supervisor team check
    if (actor && actor.role === "SUPERVISOR") {
      if (emp.supervisor_id && emp.supervisor_id !== actor.id && emp.id !== actor.id) {
        const err = new Error("Supervisors can only assign cases to members of their own team.");
        err.status = 403;
        throw err;
      }
    }

    let assigned = [];

    await db.transaction(async (trxClient) => {
      assigned = await caseRepository.assignBulk(
        caseIds,
        emp.id,
        actor?.id || "usr_admin",
        remarks,
        trxClient
      );

      if (db.isPgActive()) {
        await trxClient.query(
          `UPDATE case_assignments
           SET allocation_method = 'MANUAL'
           WHERE case_id = ANY($1) AND assigned_to_id = $2`,
          [caseIds, emp.id]
        );
      }
    });

    return {
      total_assigned: assigned.length,
      assigned_to: emp.full_name || emp.name,
      cases: assigned
    };
  },

  /**
   * PHASE 5.9 — Automated Workload Rebalancing Preview & Recommendations
   */
  async previewRebalance({ actor, supervisorId = null }) {
    const effectiveSupervisorId = (actor && actor.role === "SUPERVISOR") ? actor.id : supervisorId;

    const allStaff = await employeeRepository.getEligibleEmployees({
      actor,
      supervisorId: effectiveSupervisorId,
      includeOnLeave: true
    });

    const overloadedStaff = [];
    const underutilizedStaff = [];

    allStaff.forEach(s => {
      const isOverloaded = s.remaining_case_capacity <= 0 || s.remaining_portfolio_capacity <= 0 || s.is_on_leave;
      if (isOverloaded && s.current_active_cases > 0) {
        overloadedStaff.push(s);
      } else if (!s.is_on_leave && s.remaining_case_capacity > 5) {
        underutilizedStaff.push(s);
      }
    });

    const proposedTransfers = [];

    for (const source of overloadedStaff) {
      // Find cases held by source employee
      const heldCases = await this.getCandidateCases({
        rules: {},
        limit: source.is_on_leave ? source.current_active_cases : Math.abs(source.remaining_case_capacity) + 5,
        actor
      });

      const transferable = heldCases.filter(
        c => c.assigned_employee_id === source.id && !["Disputed", "Closed", "Fully Paid"].includes(c.status)
      );

      for (const lc of transferable) {
        // Pick recipient with highest remaining capacity
        const recipient = underutilizedStaff
          .filter(u => u.remaining_case_capacity > 0 && u.remaining_portfolio_capacity >= lc.outstanding_amount)
          .sort((a, b) => b.remaining_case_capacity - a.remaining_case_capacity)[0];

        if (recipient) {
          proposedTransfers.push({
            case_id: lc.id,
            case_number: lc.case_number,
            outstanding_amount: lc.outstanding_amount,
            priority: lc.priority,
            from_employee_id: source.id,
            from_employee_name: source.full_name,
            to_employee_id: recipient.id,
            to_employee_name: recipient.full_name,
            reason: source.is_on_leave ? "Employee currently on leave" : "Workload balancing from overloaded staff"
          });
          recipient.remaining_case_capacity -= 1;
          recipient.remaining_portfolio_capacity -= lc.outstanding_amount;
        }
      }
    }

    return {
      rebalance_required: proposedTransfers.length > 0,
      total_proposed_transfers: proposedTransfers.length,
      overloaded_staff_count: overloadedStaff.length,
      underutilized_staff_count: underutilizedStaff.length,
      recommendations: proposedTransfers
    };
  },

  /**
   * PHASE 5.11 — Get Assignment and Reassignment Audit History
   */
  async getAssignmentHistory({ caseId = null, employeeId = null, page = 1, limit = 20, client = null }) {
    const q = client || db;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const params = [];
      const whereClauses = [];

      if (caseId) {
        params.push(caseId);
        whereClauses.push(`ca.case_id = $${params.length}`);
      }
      if (employeeId) {
        params.push(employeeId);
        whereClauses.push(`(ca.assigned_to_id = $${params.length} OR ca.assigned_from_id = $${params.length})`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countRes = await q.query(
        `SELECT COUNT(*) as total FROM case_assignments ca ${whereSql}`,
        params
      );
      const total = parseInt(countRes.rows[0]?.total || 0, 10);

      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT 
          ca.id, ca.case_id, ca.assignment_reason, ca.remarks, ca.allocation_method, ca.created_at,
          lc.case_number, lc.loan_account_no, lc.status as case_status, lc.outstanding_amount,
          u_from.full_name as assigned_from_name, u_from.employee_id as assigned_from_code,
          u_to.full_name as assigned_to_name, u_to.employee_id as assigned_to_code,
          u_by.full_name as assigned_by_name, u_by.role as assigned_by_role
         FROM case_assignments ca
         JOIN loan_cases lc ON ca.case_id = lc.id
         LEFT JOIN users u_from ON ca.assigned_from_id = u_from.id
         LEFT JOIN users u_to ON ca.assigned_to_id = u_to.id
         LEFT JOIN users u_by ON ca.assigned_by_id = u_by.id
         ${whereSql}
         ORDER BY ca.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      return {
        history: dataRes.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0
      };
    }

    // In-memory relational mode
    let list = [...(memoryStore.case_assignments || [])];

    if (caseId) {
      list = list.filter(a => a.case_id === caseId);
    }
    if (employeeId) {
      list = list.filter(a => a.assigned_to === employeeId || a.assigned_to_id === employeeId || a.assigned_from === employeeId);
    }

    const total = list.length;
    const paged = list.slice(offset, offset + limitNum).map(a => {
      const lc = memoryStore.loan_cases.find(c => c.id === a.case_id);
      const uFrom = a.assigned_from_id ? memoryStore.users.find(u => u.id === a.assigned_from_id) : null;
      const uTo = a.assigned_to_id ? memoryStore.users.find(u => u.id === a.assigned_to_id) : null;
      const uBy = a.assigned_by_id ? memoryStore.users.find(u => u.id === a.assigned_by_id) : null;

      return {
        id: a.id,
        case_id: a.case_id,
        case_number: lc?.case_number || a.case_number,
        loan_account_no: lc?.loan_account_no,
        case_status: lc?.status,
        outstanding_amount: lc?.outstanding_amount,
        assigned_from_name: uFrom?.full_name || a.assigned_from,
        assigned_to_name: uTo?.full_name || a.assigned_to,
        assigned_by_name: uBy?.full_name || a.assigned_by,
        assignment_reason: a.assignment_reason || a.remarks,
        remarks: a.remarks || a.assignment_reason,
        allocation_method: a.allocation_method || a.assignment_type || "MANUAL",
        created_at: a.created_at || a.assigned_at
      };
    });

    return {
      history: paged,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 0
    };
  }
};

export default caseAllocationService;
