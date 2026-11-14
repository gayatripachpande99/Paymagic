import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Case Repository
 * Production PostgreSQL repository with atomic transactions and high-speed in-memory fallback.
 */
export const caseRepository = {
  /**
   * Find a single loan case by ID with customer and assigned employee details
   */
  async findById(caseId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT lc.*,
                c.customer_code, c.full_name as customer_name, c.phone_masked, c.phone_raw,
                c.alternate_phone, c.email as customer_email, c.current_address,
                c.city as customer_city, c.state as customer_state, c.pincode as customer_pincode,
                u.full_name as assigned_employee_name, u.employee_id as assigned_employee_code, u.role as assigned_employee_role
         FROM loan_cases lc
         JOIN customers c ON lc.customer_id = c.id
         LEFT JOIN users u ON lc.assigned_employee_id = u.id
         WHERE lc.id = $1`,
        [caseId]
      );
      return res.rows[0] || null;
    }

    const lc = db.indexService.getCase(caseId) || memoryStore.loan_cases.find(c => c.id === caseId);
    if (!lc) return null;

    const cust = db.indexService.getCustomer(lc.customer_id) || memoryStore.customers.find(c => c.id === lc.customer_id);
    const emp = lc.assigned_employee_id ? memoryStore.users.find(u => u.id === lc.assigned_employee_id) : null;

    return {
      ...lc,
      customer_code: cust?.customer_code || "",
      customer_name: cust?.full_name || "",
      phone_masked: cust?.phone_masked || "",
      phone_raw: cust?.phone_raw || "",
      alternate_phone: cust?.alternate_phone || null,
      customer_email: cust?.email || null,
      current_address: cust?.current_address || "",
      customer_city: cust?.city || "",
      customer_state: cust?.state || "",
      customer_pincode: cust?.pincode || "",
      assigned_employee_name: emp?.full_name || null,
      assigned_employee_code: emp?.employee_id || null,
      assigned_employee_role: emp?.role || null
    };
  },

  /**
   * Query cases with extensive filtering, sorting, and pagination
   */
  async findAll({
    status,
    assigned_employee_id,
    lender_name,
    city,
    priority,
    dpd_min,
    dpd_max,
    min_amount,
    max_amount,
    search,
    sort_by = "created_at",
    order = "DESC",
    page = 1,
    limit = 20
  } = {}, client = null) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      const whereClauses = [];

      if (status && status !== "ALL") {
        params.push(status);
        whereClauses.push(`lc.status = $${params.length}`);
      }
      if (assigned_employee_id) {
        if (assigned_employee_id === "UNASSIGNED") {
          whereClauses.push("(lc.assigned_employee_id IS NULL OR lc.status = 'New')");
        } else {
          params.push(assigned_employee_id);
          whereClauses.push(`lc.assigned_employee_id = $${params.length}`);
        }
      }
      if (lender_name) {
        params.push(`%${lender_name}%`);
        whereClauses.push(`lc.lender_name ILIKE $${params.length}`);
      }
      if (city) {
        params.push(`%${city}%`);
        whereClauses.push(`c.city ILIKE $${params.length}`);
      }
      if (priority) {
        params.push(priority);
        whereClauses.push(`lc.priority = $${params.length}`);
      }
      if (dpd_min !== undefined && dpd_min !== "") {
        params.push(parseInt(dpd_min, 10));
        whereClauses.push(`lc.dpd >= $${params.length}`);
      }
      if (dpd_max !== undefined && dpd_max !== "") {
        params.push(parseInt(dpd_max, 10));
        whereClauses.push(`lc.dpd <= $${params.length}`);
      }
      if (min_amount !== undefined && min_amount !== "") {
        params.push(parseFloat(min_amount));
        whereClauses.push(`lc.outstanding_amount >= $${params.length}`);
      }
      if (max_amount !== undefined && max_amount !== "") {
        params.push(parseFloat(max_amount));
        whereClauses.push(`lc.outstanding_amount <= $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        const pIndex = params.length;
        whereClauses.push(`(
          c.full_name ILIKE $${pIndex} OR
          c.customer_code ILIKE $${pIndex} OR
          lc.loan_account_no ILIKE $${pIndex} OR
          lc.case_number ILIKE $${pIndex} OR
          c.phone_raw ILIKE $${pIndex} OR
          c.phone_masked ILIKE $${pIndex}
        )`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      // Whitelist sorting columns to prevent SQL injection
      const allowedSortColumns = {
        outstanding_amount: "lc.outstanding_amount",
        dpd: "lc.dpd",
        created_at: "lc.created_at",
        priority: "lc.priority",
        case_number: "lc.case_number"
      };
      const sortColumn = allowedSortColumns[sort_by] || "lc.created_at";
      const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Count query
      const countRes = await q.query(
        `SELECT COUNT(*) as total_count
         FROM loan_cases lc
         JOIN customers c ON lc.customer_id = c.id
         ${whereSql}`,
        params
      );
      const total = parseInt(countRes.rows[0]?.total_count || 0, 10);

      // Data query with joins
      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT lc.*,
                c.customer_code, c.full_name as customer_name, c.phone_masked, c.phone_raw,
                c.city as customer_city, c.state as customer_state,
                u.full_name as assigned_employee_name, u.employee_id as assigned_employee_code
         FROM loan_cases lc
         JOIN customers c ON lc.customer_id = c.id
         LEFT JOIN users u ON lc.assigned_employee_id = u.id
         ${whereSql}
         ORDER BY ${sortColumn} ${sortOrder}
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      return {
        cases: dataRes.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    // In-memory fallback
    let list = [...memoryStore.loan_cases];

    if (status && status !== "ALL") {
      list = list.filter(c => c.status === status);
    }
    if (assigned_employee_id) {
      if (assigned_employee_id === "UNASSIGNED") {
        list = list.filter(c => !c.assigned_employee_id || c.status === "New");
      } else {
        list = list.filter(c => c.assigned_employee_id === assigned_employee_id);
      }
    }
    if (lender_name) {
      const lower = lender_name.toLowerCase();
      list = list.filter(c => c.lender_name && c.lender_name.toLowerCase().includes(lower));
    }
    if (city) {
      const lower = city.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.city && cust.city.toLowerCase().includes(lower);
      });
    }
    if (priority) {
      list = list.filter(c => c.priority === priority);
    }
    if (dpd_min !== undefined && dpd_min !== "") {
      list = list.filter(c => c.dpd >= parseInt(dpd_min, 10));
    }
    if (dpd_max !== undefined && dpd_max !== "") {
      list = list.filter(c => c.dpd <= parseInt(dpd_max, 10));
    }
    if (min_amount !== undefined && min_amount !== "") {
      list = list.filter(c => c.outstanding_amount >= parseFloat(min_amount));
    }
    if (max_amount !== undefined && max_amount !== "") {
      list = list.filter(c => c.outstanding_amount <= parseFloat(max_amount));
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return (
          (c.case_number && c.case_number.toLowerCase().includes(s)) ||
          (c.loan_account_no && c.loan_account_no.toLowerCase().includes(s)) ||
          (cust && cust.full_name && cust.full_name.toLowerCase().includes(s)) ||
          (cust && cust.customer_code && cust.customer_code.toLowerCase().includes(s)) ||
          (cust && cust.phone_raw && cust.phone_raw.includes(s))
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sort_by];
      let valB = b[sort_by];
      if (sort_by === "outstanding_amount" || sort_by === "dpd") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }
      if (valA < valB) return order.toUpperCase() === "ASC" ? -1 : 1;
      if (valA > valB) return order.toUpperCase() === "ASC" ? 1 : -1;
      return 0;
    });

    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(c => {
      const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
      const emp = c.assigned_employee_id ? memoryStore.users.find(u => u.id === c.assigned_employee_id) : null;
      return {
        ...c,
        customer_code: cust?.customer_code || "",
        customer_name: cust?.full_name || "",
        phone_masked: cust?.phone_masked || "",
        phone_raw: cust?.phone_raw || "",
        customer_city: cust?.city || "",
        customer_state: cust?.state || "",
        assigned_employee_name: emp?.full_name || null,
        assigned_employee_code: emp?.employee_id || null
      };
    });

    return {
      cases: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  },

  /**
   * Atomically transition case status and write immutable audit history
   */
  async updateStatusWithAudit({ caseId, employeeId, newStatus, remarks = "", source = "Admin", referenceId = null }, client = null) {
    const execute = async (trxClient) => {
      const now = new Date().toISOString();

      if (db.isPgActive()) {
        // 1. Fetch current case with lock
        const caseRes = await trxClient.query(
          "SELECT * FROM loan_cases WHERE id = $1 FOR UPDATE",
          [caseId]
        );
        const currentCase = caseRes.rows[0];
        if (!currentCase) {
          throw new Error(`Loan case '${caseId}' not found.`);
        }

        const previousStatus = currentCase.status;
        if (previousStatus === newStatus) {
          return { case: currentCase, history: null, changed: false };
        }

        let newOutstanding = currentCase.outstanding_amount;
        let isFieldVisit = currentCase.is_field_visit_required;

        // Business rules: Fully Paid zeroes outstanding; Closed preserves balance
        if (newStatus === "Fully Paid") {
          newOutstanding = 0;
        } else if (newStatus === "Field Visit") {
          isFieldVisit = true;
        }

        // 2. Update case
        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET status = $1, outstanding_amount = $2, is_field_visit_required = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [newStatus, newOutstanding, isFieldVisit, now, caseId]
        );

        // 3. Insert audit log
        const auditId = `csh_${uuidv4()}`;
        const auditRes = await trxClient.query(
          `INSERT INTO case_status_history (
            id, case_id, employee_id, previous_status, new_status, source, reference_id, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [auditId, caseId, employeeId, previousStatus, newStatus, source, referenceId, remarks, now]
        );

        db.cacheService.delPattern("cases:*");
        db.cacheService.delPattern("dashboard:*");

        return {
          case: updateRes.rows[0],
          history: auditRes.rows[0],
          changed: true
        };
      }

      // In-memory atomic transition
      const targetCase = db.indexService.getCase(caseId) || memoryStore.loan_cases.find(c => c.id === caseId);
      if (!targetCase) {
        throw new Error(`Loan case '${caseId}' not found.`);
      }

      const previousStatus = targetCase.status;
      if (previousStatus === newStatus) {
        return { case: targetCase, history: null, changed: false };
      }

      targetCase.status = newStatus;
      targetCase.updated_at = now;

      if (newStatus === "Fully Paid") {
        targetCase.outstanding_amount = 0;
      } else if (newStatus === "Closed") {
        targetCase.is_closed = true;
        targetCase.closed_at = now;
        targetCase.closed_by = employeeId;
      } else if (newStatus === "Field Visit") {
        targetCase.is_field_visit_required = true;
      }

      const historyEntry = {
        id: `csh_${uuidv4()}`,
        case_id: caseId,
        employee_id: employeeId,
        previous_status: previousStatus,
        new_status: newStatus,
        source: source || "Admin",
        reference_id: referenceId,
        remarks: remarks || `Status transition from ${previousStatus} to ${newStatus}`,
        created_at: now
      };

      memoryStore.case_status_history.unshift(historyEntry);
      db.indexService.updateCaseStatus(targetCase, previousStatus, newStatus);
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return {
        case: { ...targetCase },
        history: { ...historyEntry },
        changed: true
      };
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Assign a single case to an employee
   */
  async assignSingle(caseId, employeeId, assignedById, remarks = "", client = null) {
    const execute = async (trxClient) => {
      const now = new Date().toISOString();

      if (db.isPgActive()) {
        const caseRes = await trxClient.query(
          "SELECT * FROM loan_cases WHERE id = $1 FOR UPDATE",
          [caseId]
        );
        const currentCase = caseRes.rows[0];
        if (!currentCase) throw new Error(`Loan case '${caseId}' not found.`);

        const prevEmpId = currentCase.assigned_employee_id;
        const prevStatus = currentCase.status;
        const newStatus = prevStatus === "New" ? "Assigned" : prevStatus;

        // 1. Update case assignment
        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET assigned_employee_id = $1, assigned_at = $2, status = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [employeeId, now, newStatus, now, caseId]
        );

        // 2. Insert case assignment history
        const assignId = `asgn_${uuidv4()}`;
        await trxClient.query(
          `INSERT INTO case_assignments (
            id, case_id, assigned_from_id, assigned_to_id, assigned_by_id, assignment_reason, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [assignId, caseId, prevEmpId || null, employeeId, assignedById, remarks || "Manual Case Assignment", now]
        );

        // 3. Insert audit log if status changed
        if (prevStatus !== newStatus) {
          const auditId = `csh_${uuidv4()}`;
          await trxClient.query(
            `INSERT INTO case_status_history (
              id, case_id, employee_id, previous_status, new_status, source, remarks, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [auditId, caseId, assignedById, prevStatus, newStatus, "Assignment", remarks || "Auto status transition on assignment", now]
          );
        }

        // 4. Update employee active cases count
        await trxClient.query(
          `UPDATE employees
           SET active_cases_count = (
             SELECT COUNT(*) FROM loan_cases
             WHERE assigned_employee_id = $1 AND status NOT IN ('Closed', 'Fully Paid')
           ), updated_at = $2
           WHERE id = $1`,
          [employeeId, now]
        );

        db.cacheService.delPattern("cases:*");
        db.cacheService.delPattern("dashboard:*");

        return updateRes.rows[0];
      }

      // In-memory fallback
      const lc = memoryStore.loan_cases.find(c => c.id === caseId);
      if (!lc) throw new Error(`Loan case '${caseId}' not found.`);

      const prevEmpId = lc.assigned_employee_id;
      const prevStatus = lc.status;
      const newStatus = prevStatus === "New" ? "Assigned" : prevStatus;

      lc.assigned_employee_id = employeeId;
      lc.assigned_at = now;
      lc.status = newStatus;
      lc.updated_at = now;

      memoryStore.case_assignments.unshift({
        id: `asgn_${uuidv4()}`,
        case_id: caseId,
        assigned_to: employeeId,
        assigned_to_id: employeeId,
        assigned_from: prevEmpId || null,
        assigned_from_id: prevEmpId || null,
        assigned_by: assignedById,
        assigned_by_id: assignedById,
        assignment_reason: remarks || "Manual Case Assignment",
        assignment_type: "MANUAL",
        created_at: now
      });

      if (prevStatus !== newStatus) {
        memoryStore.case_status_history.unshift({
          id: `csh_${uuidv4()}`,
          case_id: caseId,
          employee_id: assignedById,
          previous_status: prevStatus,
          new_status: newStatus,
          source: "Assignment",
          remarks: remarks || "Auto status transition on assignment",
          created_at: now
        });
      }

      db.indexService.rebuild(memoryStore);
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return { ...lc };
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Bulk assign multiple cases
   */
  async assignBulk(caseIds, employeeId, assignedById, remarks = "", client = null) {
    const execute = async (trxClient) => {
      const results = [];
      for (const id of caseIds) {
        const res = await this.assignSingle(id, employeeId, assignedById, remarks, trxClient);
        results.push(res);
      }
      return results;
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Transfer a case from one employee to another with mandatory reason
   */
  async transferCase(caseId, toEmployeeId, transferredById, reason, client = null) {
    const execute = async (trxClient) => {
      const now = new Date().toISOString();

      if (db.isPgActive()) {
        const caseRes = await trxClient.query(
          "SELECT * FROM loan_cases WHERE id = $1 FOR UPDATE",
          [caseId]
        );
        const currentCase = caseRes.rows[0];
        if (!currentCase) throw new Error(`Loan case '${caseId}' not found.`);

        const fromEmpId = currentCase.assigned_employee_id;

        // 1. Update case assigned employee
        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET assigned_employee_id = $1, assigned_at = $2, updated_at = $3
           WHERE id = $4
           RETURNING *`,
          [toEmployeeId, now, now, caseId]
        );

        // 2. Record in case_assignments
        const assignId = `asgn_${uuidv4()}`;
        await trxClient.query(
          `INSERT INTO case_assignments (
            id, case_id, assigned_from_id, assigned_to_id, assigned_by_id, assignment_reason, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [assignId, caseId, fromEmpId || null, toEmployeeId, transferredById, reason, now]
        );

        // 3. Record in case_status_history as administrative transfer
        const auditId = `csh_${uuidv4()}`;
        await trxClient.query(
          `INSERT INTO case_status_history (
            id, case_id, employee_id, previous_status, new_status, source, reference_id, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [auditId, caseId, transferredById, currentCase.status, currentCase.status, "Case Transfer", assignId, `Transferred to employee ${toEmployeeId}: ${reason}`, now]
        );

        db.cacheService.delPattern("cases:*");
        db.cacheService.delPattern("dashboard:*");

        return updateRes.rows[0];
      }

      const lc = memoryStore.loan_cases.find(c => c.id === caseId);
      if (!lc) throw new Error(`Loan case '${caseId}' not found.`);

      const fromEmpId = lc.assigned_employee_id;
      lc.assigned_employee_id = toEmployeeId;
      lc.assigned_at = now;
      lc.updated_at = now;

      const assignId = `asgn_${uuidv4()}`;
      memoryStore.case_assignments.unshift({
        id: assignId,
        case_id: caseId,
        assigned_to: toEmployeeId,
        assigned_to_id: toEmployeeId,
        assigned_from: fromEmpId || null,
        assigned_from_id: fromEmpId || null,
        assigned_by: transferredById,
        assigned_by_id: transferredById,
        assignment_reason: reason,
        assignment_type: "TRANSFER",
        created_at: now
      });

      memoryStore.case_status_history.unshift({
        id: `csh_${uuidv4()}`,
        case_id: caseId,
        employee_id: transferredById,
        previous_status: lc.status,
        new_status: lc.status,
        source: "Case Transfer",
        reference_id: assignId,
        remarks: `Transferred to employee ${toEmployeeId}: ${reason}`,
        created_at: now
      });

      db.indexService.rebuild(memoryStore);
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return { ...lc };
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Retrieve immutable status audit history for a case
   */
  async getCaseHistory(caseId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT csh.*, u.full_name as employee_name, u.employee_id as employee_code, u.role as employee_role
         FROM case_status_history csh
         LEFT JOIN users u ON csh.employee_id = u.id
         WHERE csh.case_id = $1
         ORDER BY csh.created_at DESC`,
        [caseId]
      );
      return res.rows;
    }

    const list = memoryStore.case_status_history.filter(h => h.case_id === caseId);
    return list.map(h => {
      const u = memoryStore.users.find(user => user.id === h.employee_id);
      return {
        ...h,
        employee_name: u ? u.full_name : "System",
        employee_code: u ? u.employee_id : "",
        employee_role: u ? u.role : "SYSTEM"
      };
    });
  },

  /**
   * Retrieve transfer history across cases
   */
  async getTransferHistory({ caseId, employeeId, limit = 50 } = {}, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
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
      params.push(limit);

      const res = await q.query(
        `SELECT ca.*,
                lc.case_number, lc.loan_account_no, lc.outstanding_amount,
                uFrom.full_name as assigned_from_name,
                uTo.full_name as assigned_to_name,
                uBy.full_name as assigned_by_name
         FROM case_assignments ca
         JOIN loan_cases lc ON ca.case_id = lc.id
         LEFT JOIN users uFrom ON ca.assigned_from_id = uFrom.id
         LEFT JOIN users uTo ON ca.assigned_to_id = uTo.id
         LEFT JOIN users uBy ON ca.assigned_by_id = uBy.id
         ${whereSql}
         ORDER BY ca.created_at DESC
         LIMIT $${params.length}`,
        params
      );
      return res.rows;
    }

    let list = memoryStore.case_assignments || [];
    if (caseId) list = list.filter(a => a.case_id === caseId);
    if (employeeId) {
      list = list.filter(a => (a.assigned_to === employeeId || a.assigned_to_id === employeeId || a.assigned_from === employeeId || a.assigned_from_id === employeeId));
    }

    return list.slice(0, limit).map(a => {
      const lc = memoryStore.loan_cases.find(c => c.id === a.case_id);
      const uFrom = a.assigned_from || a.assigned_from_id ? memoryStore.users.find(u => u.id === (a.assigned_from || a.assigned_from_id)) : null;
      const uTo = a.assigned_to || a.assigned_to_id ? memoryStore.users.find(u => u.id === (a.assigned_to || a.assigned_to_id)) : null;
      const uBy = a.assigned_by || a.assigned_by_id ? memoryStore.users.find(u => u.id === (a.assigned_by || a.assigned_by_id)) : null;

      return {
        ...a,
        case_number: lc ? lc.case_number : "",
        loan_account_no: lc ? lc.loan_account_no : "",
        outstanding_amount: lc ? lc.outstanding_amount : 0,
        assigned_from_name: uFrom ? uFrom.full_name : null,
        assigned_to_name: uTo ? uTo.full_name : "Unknown",
        assigned_by_name: uBy ? uBy.full_name : "System"
      };
    });
  }
};

export default caseRepository;
