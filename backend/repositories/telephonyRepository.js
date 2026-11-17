import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Telephony Repository
 * ACID transactional persistence for customer call records and carrier lifecycle.
 * Fully supports PostgreSQL and memoryStore fallback.
 */
export const telephonyRepository = {
  /**
   * Insert a new call record
   */
  async createCall(data, client = null) {
    const id = data.id || `call_${uuidv4()}`;
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `INSERT INTO calls (
          id, case_id, employee_id, customer_id, telephony_call_id,
          direction, status, started_at, ended_at, duration_seconds,
          customer_notification_status, call_outcome, call_notes,
          next_follow_up_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          id,
          data.case_id || data.caseId,
          data.employee_id || data.employeeId,
          data.customer_id || data.customerId,
          data.telephony_call_id || data.telephonyCallId,
          data.direction || "OUTBOUND",
          data.status || "ringing",
          data.started_at || now,
          data.ended_at || null,
          data.duration_seconds || 0,
          data.customer_notification_status || "ANNOUNCED_RECORDED",
          data.call_outcome || null,
          data.call_notes || null,
          data.next_follow_up_date || null,
          now
        ]
      );
      return res.rows[0];
    }

    // In-memory fallback
    if (!memoryStore.calls) memoryStore.calls = [];

    const callRecord = {
      id,
      case_id: data.case_id || data.caseId,
      employee_id: data.employee_id || data.employeeId,
      customer_id: data.customer_id || data.customerId,
      telephony_call_id: data.telephony_call_id || data.telephonyCallId,
      direction: data.direction || "OUTBOUND",
      status: data.status || "ringing",
      started_at: data.started_at || now,
      ended_at: data.ended_at || null,
      duration_seconds: data.duration_seconds || 0,
      customer_notification_status: data.customer_notification_status || "ANNOUNCED_RECORDED",
      call_outcome: data.call_outcome || null,
      call_notes: data.call_notes || null,
      next_follow_up_date: data.next_follow_up_date || null,
      created_at: now
    };

    memoryStore.calls.unshift(callRecord);
    return { ...callRecord };
  },

  /**
   * Get call by primary ID
   */
  async getCallById(callId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT c.*,
                lc.case_number, lc.loan_account_no, lc.outstanding_amount,
                cust.full_name as customer_name, cust.phone as customer_phone,
                u.full_name as employee_name
         FROM calls c
         JOIN loan_cases lc ON c.case_id = lc.id
         JOIN customers cust ON c.customer_id = cust.id
         LEFT JOIN users u ON c.employee_id = u.id
         WHERE c.id = $1`,
        [callId]
      );
      return res.rows[0] || null;
    }

    const call = (memoryStore.calls || []).find(c => c.id === callId);
    if (!call) return null;

    const lc = (memoryStore.loan_cases || []).find(c => c.id === call.case_id);
    const cust = (memoryStore.customers || []).find(c => c.id === call.customer_id);
    const u = (memoryStore.users || []).find(user => user.id === call.employee_id);

    return {
      ...call,
      case_number: lc ? lc.case_number : "Unknown",
      loan_account_no: lc ? lc.loan_account_no : "Unknown",
      outstanding_amount: lc ? lc.outstanding_amount : 0,
      customer_name: cust ? cust.full_name : "Unknown",
      customer_phone: cust ? cust.phone : "Unknown",
      employee_name: u ? u.full_name : "Staff Agent"
    };
  },

  /**
   * Get call by provider's telephony call ID
   */
  async getCallByTelephonyId(telephonyCallId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        "SELECT * FROM calls WHERE telephony_call_id = $1",
        [telephonyCallId]
      );
      return res.rows[0] || null;
    }

    return (memoryStore.calls || []).find(c => c.telephony_call_id === telephonyCallId) || null;
  },

  /**
   * Update call status and duration upon completion/webhook event
   */
  async updateCallStatus(callIdOrTelephonyId, statusOrOptions, extraOptionsOrClient = null, client = null) {
    let opts = {};
    let dbClient = client;

    if (typeof statusOrOptions === "string") {
      opts = typeof extraOptionsOrClient === "object" && extraOptionsOrClient !== null
        ? { ...extraOptionsOrClient, status: statusOrOptions }
        : { status: statusOrOptions };
    } else if (typeof statusOrOptions === "object" && statusOrOptions !== null) {
      opts = statusOrOptions;
      dbClient = extraOptionsOrClient;
    }

    const { status, durationSeconds = 0, endedAt = null } = opts;
    const now = endedAt || new Date().toISOString();

    if (db.isPgActive()) {
      const q = dbClient || db.getPool();
      const res = await q.query(
        `UPDATE calls
         SET status = $1, duration_seconds = $2, ended_at = $3
         WHERE id = $4 OR telephony_call_id = $4
         RETURNING *`,
        [status, durationSeconds, now, callIdOrTelephonyId]
      );
      return res.rows[0] || null;
    }

    const call = (memoryStore.calls || []).find(
      c => c.id === callIdOrTelephonyId || c.telephony_call_id === callIdOrTelephonyId
    );
    if (!call) return null;

    if (status !== undefined) call.status = status;
    if (durationSeconds !== undefined) call.duration_seconds = durationSeconds;
    call.ended_at = now;
    return { ...call };
  },

  /**
   * Submit call outcome, notes, and schedule callback
   */
  async updateCallOutcome(callId, { outcome, notes = "", nextFollowUpDate = null, status = null }, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [outcome, notes, nextFollowUpDate];
      let sql = "UPDATE calls SET call_outcome = $1, call_notes = $2, next_follow_up_date = $3";

      if (status) {
        params.push(status);
        sql += `, status = $${params.length}`;
      }

      params.push(callId);
      sql += ` WHERE id = $${params.length} RETURNING *`;

      const res = await q.query(sql, params);
      const updated = res.rows[0];

      if (updated && nextFollowUpDate) {
        await q.query(
          "UPDATE loan_cases SET follow_up_date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [nextFollowUpDate, updated.case_id]
        );
      }

      return updated || null;
    }

    const call = (memoryStore.calls || []).find(c => c.id === callId);
    if (!call) return null;

    call.call_outcome = outcome;
    call.call_notes = notes;
    call.next_follow_up_date = nextFollowUpDate;
    if (status) call.status = status;

    if (nextFollowUpDate) {
      const lc = (memoryStore.loan_cases || []).find(c => c.id === call.case_id);
      if (lc) {
        lc.follow_up_date = nextFollowUpDate;
        lc.updated_at = new Date().toISOString();
      }
    }

    return { ...call };
  },

  /**
   * List calls with filtering and pagination
   */
  async listCalls({
    caseId,
    employeeId,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = {}, client = null) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      const whereClauses = [];

      if (caseId) {
        params.push(caseId);
        whereClauses.push(`c.case_id = $${params.length}`);
      }
      if (employeeId) {
        params.push(employeeId);
        whereClauses.push(`c.employee_id = $${params.length}`);
      }
      if (status && status !== "ALL") {
        params.push(status);
        whereClauses.push(`c.status = $${params.length}`);
      }
      if (startDate) {
        params.push(new Date(startDate).toISOString());
        whereClauses.push(`c.started_at >= $${params.length}`);
      }
      if (endDate) {
        params.push(new Date(endDate).toISOString());
        whereClauses.push(`c.started_at <= $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countRes = await q.query(
        `SELECT COUNT(*) as count FROM calls c ${whereSql}`,
        params
      );
      const total = parseInt(countRes.rows[0]?.count || 0, 10);

      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT c.*,
                lc.case_number, lc.loan_account_no,
                cust.full_name as customer_name,
                u.full_name as agent_name,
                cr.id as recording_id, cr.s3_key as recording_s3_key, cr.duration_seconds as recording_duration
         FROM calls c
         JOIN loan_cases lc ON c.case_id = lc.id
         JOIN customers cust ON c.customer_id = cust.id
         LEFT JOIN users u ON c.employee_id = u.id
         LEFT JOIN call_recordings cr ON cr.call_id = c.id
         ${whereSql}
         ORDER BY c.started_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      return {
        calls: dataRes.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    // In-memory fallback
    let list = [...(memoryStore.calls || [])];
    if (caseId) list = list.filter(c => c.case_id === caseId);
    if (employeeId) list = list.filter(c => c.employee_id === employeeId);
    if (status && status !== "ALL") list = list.filter(c => c.status === status);
    if (startDate) list = list.filter(c => c.started_at >= startDate);
    if (endDate) list = list.filter(c => c.started_at <= endDate);

    list.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
    const total = list.length;

    const paginated = list.slice(offset, offset + limitNum).map(c => {
      const lc = (memoryStore.loan_cases || []).find(item => item.id === c.case_id);
      const cust = (memoryStore.customers || []).find(item => item.id === c.customer_id);
      const u = (memoryStore.users || []).find(item => item.id === c.employee_id);
      const cr = (memoryStore.call_recordings || []).find(item => item.call_id === c.id);

      return {
        ...c,
        case_number: lc ? lc.case_number : "Unknown",
        loan_account_no: lc ? lc.loan_account_no : "Unknown",
        customer_name: cust ? cust.full_name : "Unknown",
        agent_name: u ? u.full_name : "Staff Agent",
        recording_id: cr ? cr.id : null,
        recording_s3_key: cr ? cr.s3_key : null,
        recording_duration: cr ? cr.duration_seconds : null
      };
    });

    return {
      calls: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }
};

export default telephonyRepository;
