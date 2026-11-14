import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Case Repository
 * Production PostgreSQL repository with atomic transactions, advanced multi-column filtering,
 * deterministic pagination, and high-speed in-memory fallback.
 */

const ALLOWED_SORT_COLUMNS = {
  outstanding_amount: "lc.outstanding_amount",
  principal_amount: "lc.principal_amount",
  dpd: "lc.dpd",
  priority: "lc.priority",
  borrower_name: "c.full_name",
  customer_name: "c.full_name",
  created_date: "lc.created_at",
  created_at: "lc.created_at",
  updated_date: "lc.updated_at",
  updated_at: "lc.updated_at",
  status: "lc.status",
  case_status: "lc.status",
  assigned_employee: "u.full_name",
  case_id: "lc.id",
  case_number: "lc.case_number"
};

const PRIORITY_ORDER = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

/**
 * Validate and parse multi-column sort expression
 * e.g. "dpd:desc,outstanding_amount:desc" or single "dpd" with default direction
 */
export const parseSortExpression = (sortBy = "created_at", defaultOrder = "DESC") => {
  if (!sortBy) {
    return [{ field: "created_at", column: "lc.created_at", direction: defaultOrder.toUpperCase() }];
  }

  const parts = String(sortBy)
    .split(",")
    .map(p => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return [{ field: "created_at", column: "lc.created_at", direction: defaultOrder.toUpperCase() }];
  }

  const sortSpecs = [];

  for (const part of parts) {
    let field = part;
    let direction = defaultOrder.toUpperCase();

    if (part.includes(":")) {
      const split = part.split(":");
      field = split[0].trim();
      direction = split[1].trim().toUpperCase();
    }

    const normalizedField = field.toLowerCase();
    if (!ALLOWED_SORT_COLUMNS[normalizedField]) {
      throw new Error(`Invalid sort field: '${field}'. Allowed fields: ${Object.keys(ALLOWED_SORT_COLUMNS).join(", ")}`);
    }

    if (direction !== "ASC" && direction !== "DESC") {
      throw new Error(`Invalid sort direction: '${direction}'. Allowed directions: ASC, DESC.`);
    }

    sortSpecs.push({
      field: normalizedField,
      column: ALLOWED_SORT_COLUMNS[normalizedField],
      direction
    });
  }

  return sortSpecs;
};

export const caseRepository = {
  /**
   * Find a single loan case by ID or case number with customer and assigned employee details
   */
  async findById(caseId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT lc.*,
                c.customer_code, c.full_name as customer_name, c.full_name as borrower_name,
                c.phone_masked, c.phone_raw, c.alternate_phone, c.email as customer_email,
                c.current_address, c.city as customer_city, c.city,
                c.state as customer_state, c.state, c.pincode as customer_pincode, c.pincode,
                c.credit_score,
                u.full_name as assigned_employee_name, u.employee_id as assigned_employee_code, u.role as assigned_employee_role,
                uSup.full_name as assigned_supervisor_name, uSup.employee_id as assigned_supervisor_code
         FROM loan_cases lc
         JOIN customers c ON lc.customer_id = c.id
         LEFT JOIN users u ON lc.assigned_employee_id = u.id
         LEFT JOIN users uSup ON lc.assigned_supervisor_id = uSup.id
         WHERE lc.id = $1 OR lc.case_number = $1`,
        [caseId]
      );
      if (!res.rows[0]) return null;
      const row = res.rows[0];
      return {
        ...row,
        case_id: row.id,
        current_status: row.status,
        created_date: row.created_at,
        updated_date: row.updated_at
      };
    }

    const lc = db.indexService.getCase(caseId) ||
      memoryStore.loan_cases.find(c => c.id === caseId || c.case_number === caseId);
    if (!lc) return null;

    const cust = db.indexService.getCustomer(lc.customer_id) ||
      memoryStore.customers.find(c => c.id === lc.customer_id);
    const emp = lc.assigned_employee_id ? memoryStore.users.find(u => u.id === lc.assigned_employee_id) : null;
    const sup = lc.assigned_supervisor_id ? memoryStore.users.find(u => u.id === lc.assigned_supervisor_id) : null;

    return {
      ...lc,
      case_id: lc.id,
      current_status: lc.status,
      created_date: lc.created_at,
      updated_date: lc.updated_at,
      customer_code: cust?.customer_code || "",
      customer_name: cust?.full_name || "",
      borrower_name: cust?.full_name || "",
      phone_masked: cust?.phone_masked || "",
      phone_raw: cust?.phone_raw || "",
      alternate_phone: cust?.alternate_phone || null,
      customer_email: cust?.email || null,
      email: cust?.email || null,
      current_address: cust?.current_address || "",
      address: cust?.current_address || "",
      customer_city: cust?.city || "",
      city: cust?.city || "",
      customer_state: cust?.state || "",
      state: cust?.state || "",
      customer_pincode: cust?.pincode || "",
      pincode: cust?.pincode || "",
      credit_score: cust?.credit_score || null,
      assigned_employee_name: emp?.full_name || null,
      assigned_employee_code: emp?.employee_id || null,
      assigned_employee_role: emp?.role || null,
      assigned_supervisor_name: sup?.full_name || null,
      assigned_supervisor_code: sup?.employee_id || null
    };
  },

  /**
   * Query cases with extensive filtering, multi-column sorting, and deterministic pagination
   */
  async findAll({
    case_id,
    borrower_name,
    customer_code,
    loan_account_no,
    lender_name,
    loan_type,
    status,
    priority,
    dpd_min,
    dpd_max,
    min_amount,
    max_amount,
    assigned_employee_id,
    supervisor_id,
    city,
    state,
    pincode,
    created_from,
    created_to,
    updated_from,
    updated_to,
    search,
    sort_by = "created_at",
    order = "DESC",
    page = 1,
    limit = 20
  } = {}, client = null) {
    // 1. Validate pagination parameters
    const rawPage = Number(page);
    if (isNaN(rawPage) || rawPage < 1 || !Number.isInteger(rawPage)) {
      throw new Error(`Invalid page parameter: '${page}'. Page must be an integer >= 1.`);
    }

    const rawLimit = Number(limit);
    if (isNaN(rawLimit) || rawLimit < 1 || !Number.isInteger(rawLimit)) {
      throw new Error(`Invalid limit parameter: '${limit}'. Limit must be an integer >= 1.`);
    }

    if (rawLimit > 100) {
      throw new Error(`Excessive page size: limit ${rawLimit} exceeds the maximum allowed limit of 100.`);
    }

    const pageNum = rawPage;
    const limitNum = rawLimit;
    const offset = (pageNum - 1) * limitNum;

    // 2. Validate range filters
    if (dpd_min !== undefined && dpd_min !== "") {
      const v = Number(dpd_min);
      if (isNaN(v) || v < 0) throw new Error(`Invalid dpd_min: '${dpd_min}'. Must be a non-negative number.`);
    }
    if (dpd_max !== undefined && dpd_max !== "") {
      const v = Number(dpd_max);
      if (isNaN(v) || v < 0) throw new Error(`Invalid dpd_max: '${dpd_max}'. Must be a non-negative number.`);
    }
    if (dpd_min !== undefined && dpd_min !== "" && dpd_max !== undefined && dpd_max !== "") {
      if (Number(dpd_min) > Number(dpd_max)) {
        throw new Error(`Invalid DPD range: dpd_min (${dpd_min}) cannot exceed dpd_max (${dpd_max}).`);
      }
    }

    if (min_amount !== undefined && min_amount !== "") {
      const v = Number(min_amount);
      if (isNaN(v) || v < 0) throw new Error(`Invalid min_amount: '${min_amount}'. Must be a non-negative number.`);
    }
    if (max_amount !== undefined && max_amount !== "") {
      const v = Number(max_amount);
      if (isNaN(v) || v < 0) throw new Error(`Invalid max_amount: '${max_amount}'. Must be a non-negative number.`);
    }
    if (min_amount !== undefined && min_amount !== "" && max_amount !== undefined && max_amount !== "") {
      if (Number(min_amount) > Number(max_amount)) {
        throw new Error(`Invalid amount range: min_amount (${min_amount}) cannot exceed max_amount (${max_amount}).`);
      }
    }

    if (created_from) {
      if (isNaN(new Date(created_from).getTime())) throw new Error(`Invalid created_from date: '${created_from}'.`);
    }
    if (created_to) {
      if (isNaN(new Date(created_to).getTime())) throw new Error(`Invalid created_to date: '${created_to}'.`);
    }
    if (created_from && created_to && new Date(created_from) > new Date(created_to)) {
      throw new Error(`Invalid created date range: created_from cannot be later than created_to.`);
    }

    if (updated_from) {
      if (isNaN(new Date(updated_from).getTime())) throw new Error(`Invalid updated_from date: '${updated_from}'.`);
    }
    if (updated_to) {
      if (isNaN(new Date(updated_to).getTime())) throw new Error(`Invalid updated_to date: '${updated_to}'.`);
    }
    if (updated_from && updated_to && new Date(updated_from) > new Date(updated_to)) {
      throw new Error(`Invalid updated date range: updated_from cannot be later than updated_to.`);
    }

    // 3. Parse and validate multi-column sorting
    const sortSpecs = parseSortExpression(sort_by, order);

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      const whereClauses = [];

      // 17 Filters:
      if (case_id) {
        params.push(case_id);
        whereClauses.push(`(lc.id = $${params.length} OR lc.case_number = $${params.length})`);
      }
      if (borrower_name) {
        params.push(`%${borrower_name}%`);
        whereClauses.push(`c.full_name ILIKE $${params.length}`);
      }
      if (customer_code) {
        params.push(`%${customer_code}%`);
        whereClauses.push(`c.customer_code ILIKE $${params.length}`);
      }
      if (loan_account_no) {
        params.push(`%${loan_account_no}%`);
        whereClauses.push(`lc.loan_account_no ILIKE $${params.length}`);
      }
      if (lender_name) {
        params.push(`%${lender_name}%`);
        whereClauses.push(`lc.lender_name ILIKE $${params.length}`);
      }
      if (loan_type) {
        params.push(loan_type);
        whereClauses.push(`lc.loan_type ILIKE $${params.length}`);
      }
      if (status && status !== "ALL") {
        params.push(status);
        whereClauses.push(`lc.status = $${params.length}`);
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
      if (assigned_employee_id) {
        if (assigned_employee_id === "UNASSIGNED") {
          whereClauses.push("(lc.assigned_employee_id IS NULL OR lc.status = 'New')");
        } else {
          params.push(assigned_employee_id);
          whereClauses.push(`lc.assigned_employee_id = $${params.length}`);
        }
      }
      if (supervisor_id) {
        params.push(supervisor_id);
        whereClauses.push(`lc.assigned_supervisor_id = $${params.length}`);
      }
      if (city) {
        params.push(`%${city}%`);
        whereClauses.push(`c.city ILIKE $${params.length}`);
      }
      if (state) {
        params.push(`%${state}%`);
        whereClauses.push(`c.state ILIKE $${params.length}`);
      }
      if (pincode) {
        params.push(pincode);
        whereClauses.push(`c.pincode = $${params.length}`);
      }
      if (created_from) {
        params.push(new Date(created_from).toISOString());
        whereClauses.push(`lc.created_at >= $${params.length}`);
      }
      if (created_to) {
        params.push(new Date(created_to).toISOString());
        whereClauses.push(`lc.created_at <= $${params.length}`);
      }
      if (updated_from) {
        params.push(new Date(updated_from).toISOString());
        whereClauses.push(`lc.updated_at >= $${params.length}`);
      }
      if (updated_to) {
        params.push(new Date(updated_to).toISOString());
        whereClauses.push(`lc.updated_at <= $${params.length}`);
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

      // Construct SQL ORDER BY clause with deterministic secondary sort
      const orderSql = sortSpecs.map(s => `${s.column} ${s.direction}`).join(", ") + ", lc.id ASC";

      // Count query
      const countRes = await q.query(
        `SELECT COUNT(*) as total_count
         FROM loan_cases lc
         JOIN customers c ON lc.customer_id = c.id
         LEFT JOIN users u ON lc.assigned_employee_id = u.id
         ${whereSql}`,
        params
      );
      const total = parseInt(countRes.rows[0]?.total_count || 0, 10);

      // Data query with joins
      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT lc.*,
                c.customer_code, c.full_name as customer_name, c.full_name as borrower_name,
                c.phone_masked, c.phone_raw, c.alternate_phone, c.email as customer_email,
                c.current_address, c.city as customer_city, c.city,
                c.state as customer_state, c.state, c.pincode as customer_pincode, c.pincode,
                u.full_name as assigned_employee_name, u.employee_id as assigned_employee_code
         FROM loan_cases lc
         JOIN customers c ON lc.customer_id = c.id
         LEFT JOIN users u ON lc.assigned_employee_id = u.id
         ${whereSql}
         ORDER BY ${orderSql}
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      const formattedCases = dataRes.rows.map(row => ({
        ...row,
        case_id: row.id,
        current_status: row.status,
        created_date: row.created_at,
        updated_date: row.updated_at,
        assignment_date: row.assigned_at
      }));

      const totalPages = Math.ceil(total / limitNum) || 0;

      return {
        cases: formattedCases,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      };
    }

    // In-memory relational fallback
    let list = [...memoryStore.loan_cases];

    if (case_id) {
      list = list.filter(c => c.id === case_id || c.case_number === case_id);
    }
    if (borrower_name) {
      const lower = borrower_name.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.full_name && cust.full_name.toLowerCase().includes(lower);
      });
    }
    if (customer_code) {
      const lower = customer_code.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.customer_code && cust.customer_code.toLowerCase().includes(lower);
      });
    }
    if (loan_account_no) {
      const lower = loan_account_no.toLowerCase();
      list = list.filter(c => c.loan_account_no && c.loan_account_no.toLowerCase().includes(lower));
    }
    if (lender_name) {
      const lower = lender_name.toLowerCase();
      list = list.filter(c => c.lender_name && c.lender_name.toLowerCase().includes(lower));
    }
    if (loan_type) {
      const lower = loan_type.toLowerCase();
      list = list.filter(c => c.loan_type && c.loan_type.toLowerCase().includes(lower));
    }
    if (status && status !== "ALL") {
      list = list.filter(c => c.status === status);
    }
    if (priority) {
      list = list.filter(c => c.priority === priority);
    }
    if (dpd_min !== undefined && dpd_min !== "") {
      list = list.filter(c => Number(c.dpd) >= Number(dpd_min));
    }
    if (dpd_max !== undefined && dpd_max !== "") {
      list = list.filter(c => Number(c.dpd) <= Number(dpd_max));
    }
    if (min_amount !== undefined && min_amount !== "") {
      list = list.filter(c => Number(c.outstanding_amount) >= Number(min_amount));
    }
    if (max_amount !== undefined && max_amount !== "") {
      list = list.filter(c => Number(c.outstanding_amount) <= Number(max_amount));
    }
    if (assigned_employee_id) {
      if (assigned_employee_id === "UNASSIGNED") {
        list = list.filter(c => !c.assigned_employee_id || c.status === "New");
      } else {
        list = list.filter(c => c.assigned_employee_id === assigned_employee_id);
      }
    }
    if (supervisor_id) {
      list = list.filter(c => c.assigned_supervisor_id === supervisor_id);
    }
    if (city) {
      const lower = city.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.city && cust.city.toLowerCase().includes(lower);
      });
    }
    if (state) {
      const lower = state.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && cust.state && cust.state.toLowerCase().includes(lower);
      });
    }
    if (pincode) {
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return cust && String(cust.pincode) === String(pincode);
      });
    }
    if (created_from) {
      const fromTime = new Date(created_from).getTime();
      list = list.filter(c => new Date(c.created_at).getTime() >= fromTime);
    }
    if (created_to) {
      const toTime = new Date(created_to).getTime();
      list = list.filter(c => new Date(c.created_at).getTime() <= toTime);
    }
    if (updated_from) {
      const fromTime = new Date(updated_from).getTime();
      list = list.filter(c => new Date(c.updated_at).getTime() >= fromTime);
    }
    if (updated_to) {
      const toTime = new Date(updated_to).getTime();
      list = list.filter(c => new Date(c.updated_at).getTime() <= toTime);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => {
        const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
        return (
          (c.case_number && c.case_number.toLowerCase().includes(s)) ||
          (c.loan_account_no && c.loan_account_no.toLowerCase().includes(s)) ||
          (c.id && c.id.toLowerCase().includes(s)) ||
          (cust && cust.full_name && cust.full_name.toLowerCase().includes(s)) ||
          (cust && cust.customer_code && cust.customer_code.toLowerCase().includes(s)) ||
          (cust && cust.phone_raw && cust.phone_raw.includes(s))
        );
      });
    }

    // Multi-column in-memory sort
    list.sort((a, b) => {
      for (const spec of sortSpecs) {
        let valA;
        let valB;

        if (spec.field === "borrower_name" || spec.field === "customer_name") {
          const custA = memoryStore.customers.find(c => c.id === a.customer_id);
          const custB = memoryStore.customers.find(c => c.id === b.customer_id);
          valA = custA?.full_name?.toLowerCase() || "";
          valB = custB?.full_name?.toLowerCase() || "";
        } else if (spec.field === "assigned_employee") {
          const empA = a.assigned_employee_id ? memoryStore.users.find(u => u.id === a.assigned_employee_id) : null;
          const empB = b.assigned_employee_id ? memoryStore.users.find(u => u.id === b.assigned_employee_id) : null;
          valA = empA?.full_name?.toLowerCase() || "";
          valB = empB?.full_name?.toLowerCase() || "";
        } else if (spec.field === "outstanding_amount" || spec.field === "principal_amount" || spec.field === "dpd") {
          valA = Number(a[spec.field] || 0);
          valB = Number(b[spec.field] || 0);
        } else if (spec.field === "priority") {
          valA = PRIORITY_ORDER[a.priority] || 0;
          valB = PRIORITY_ORDER[b.priority] || 0;
        } else if (spec.field === "created_date" || spec.field === "created_at") {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        } else if (spec.field === "updated_date" || spec.field === "updated_at") {
          valA = new Date(a.updated_at).getTime();
          valB = new Date(b.updated_at).getTime();
        } else {
          valA = a[spec.field] || "";
          valB = b[spec.field] || "";
        }

        if (valA < valB) return spec.direction === "ASC" ? -1 : 1;
        if (valA > valB) return spec.direction === "ASC" ? 1 : -1;
      }

      // Deterministic tie-breaker
      return String(a.id).localeCompare(String(b.id));
    });

    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(c => {
      const cust = memoryStore.customers.find(cust => cust.id === c.customer_id);
      const emp = c.assigned_employee_id ? memoryStore.users.find(u => u.id === c.assigned_employee_id) : null;
      return {
        ...c,
        case_id: c.id,
        current_status: c.status,
        created_date: c.created_at,
        updated_date: c.updated_at,
        assignment_date: c.assigned_at,
        customer_code: cust?.customer_code || "",
        customer_name: cust?.full_name || "",
        borrower_name: cust?.full_name || "",
        phone_masked: cust?.phone_masked || "",
        phone_raw: cust?.phone_raw || "",
        alternate_phone: cust?.alternate_phone || null,
        email: cust?.email || null,
        customer_email: cust?.email || null,
        current_address: cust?.current_address || "",
        address: cust?.current_address || "",
        city: cust?.city || "",
        customer_city: cust?.city || "",
        state: cust?.state || "",
        customer_state: cust?.state || "",
        pincode: cust?.pincode || "",
        customer_pincode: cust?.pincode || "",
        assigned_employee_name: emp?.full_name || null,
        assigned_employee_code: emp?.employee_id || null
      };
    });

    const totalPages = Math.ceil(total / limitNum) || 0;

    return {
      cases: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1
    };
  },

  /**
   * Atomically transition case status and write immutable audit history
   */
  async updateStatusWithAudit({ caseId, employeeId, newStatus, remarks = "", source = "Admin", referenceId = null }, client = null) {
    const execute = async (trxClient) => {
      const now = new Date().toISOString();

      if (db.isPgActive()) {
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

        if (newStatus === "Fully Paid") {
          newOutstanding = 0;
        } else if (newStatus === "Field Visit") {
          isFieldVisit = true;
        }

        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET status = $1, outstanding_amount = $2, is_field_visit_required = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [newStatus, newOutstanding, isFieldVisit, now, caseId]
        );

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

        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET assigned_employee_id = $1, assigned_at = $2, status = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [employeeId, now, newStatus, now, caseId]
        );

        const assignId = `asgn_${uuidv4()}`;
        await trxClient.query(
          `INSERT INTO case_assignments (
            id, case_id, assigned_from_id, assigned_to_id, assigned_by_id, assignment_reason, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [assignId, caseId, prevEmpId || null, employeeId, assignedById, remarks || "Manual Case Assignment", remarks, now]
        );

        if (prevStatus !== newStatus) {
          const auditId = `csh_${uuidv4()}`;
          await trxClient.query(
            `INSERT INTO case_status_history (
              id, case_id, employee_id, previous_status, new_status, source, remarks, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [auditId, caseId, assignedById, prevStatus, newStatus, "Assignment", remarks || "Auto status transition on assignment", now]
          );
        }

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
        remarks: remarks || "Manual Case Assignment",
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

        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET assigned_employee_id = $1, assigned_at = $2, updated_at = $3
           WHERE id = $4
           RETURNING *`,
          [toEmployeeId, now, now, caseId]
        );

        const assignId = `asgn_${uuidv4()}`;
        await trxClient.query(
          `INSERT INTO case_assignments (
            id, case_id, assigned_from_id, assigned_to_id, assigned_by_id, assignment_reason, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [assignId, caseId, fromEmpId || null, toEmployeeId, transferredById, reason, reason, now]
        );

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
        remarks: reason,
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

    const list = (memoryStore.case_status_history || []).filter(h => h.case_id === caseId);
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
   * Retrieve chronological assignment and transfer history for a specific case
   */
  async getCaseAssignments(caseId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT ca.*,
                lc.case_number, lc.loan_account_no, lc.outstanding_amount,
                uFrom.full_name as assigned_from_name, uFrom.employee_id as assigned_from_code, uFrom.role as assigned_from_role,
                uTo.full_name as assigned_to_name, uTo.employee_id as assigned_to_code, uTo.role as assigned_to_role,
                uBy.full_name as assigned_by_name, uBy.employee_id as assigned_by_code, uBy.role as assigned_by_role
         FROM case_assignments ca
         JOIN loan_cases lc ON ca.case_id = lc.id
         LEFT JOIN users uFrom ON ca.assigned_from_id = uFrom.id
         LEFT JOIN users uTo ON ca.assigned_to_id = uTo.id
         LEFT JOIN users uBy ON ca.assigned_by_id = uBy.id
         WHERE ca.case_id = $1
         ORDER BY ca.created_at ASC`,
        [caseId]
      );
      return res.rows;
    }

    const list = (memoryStore.case_assignments || []).filter(a => a.case_id === caseId);
    return list
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(a => {
        const lc = memoryStore.loan_cases.find(c => c.id === a.case_id);
        const fromId = a.assigned_from_id || a.assigned_from;
        const toId = a.assigned_to_id || a.assigned_to;
        const byId = a.assigned_by_id || a.assigned_by;
        const uFrom = fromId ? memoryStore.users.find(u => u.id === fromId) : null;
        const uTo = toId ? memoryStore.users.find(u => u.id === toId) : null;
        const uBy = byId ? memoryStore.users.find(u => u.id === byId) : null;
        return {
          ...a,
          case_number: lc ? lc.case_number : "",
          loan_account_no: lc ? lc.loan_account_no : "",
          outstanding_amount: lc ? lc.outstanding_amount : 0,
          assigned_from_name: uFrom ? uFrom.full_name : null,
          assigned_from_code: uFrom ? uFrom.employee_id : null,
          assigned_from_role: uFrom ? uFrom.role : null,
          assigned_to_name: uTo ? uTo.full_name : "Unknown",
          assigned_to_code: uTo ? uTo.employee_id : null,
          assigned_to_role: uTo ? uTo.role : null,
          assigned_by_name: uBy ? uBy.full_name : "System",
          assigned_by_code: uBy ? uBy.employee_id : null,
          assigned_by_role: uBy ? uBy.role : null
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
