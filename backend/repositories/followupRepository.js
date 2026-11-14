import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Case Follow-up Repository
 * Manages structured borrower callback reminders and follow-up SLAs.
 */
export const followupRepository = {
  /**
   * Schedule a new follow-up for a case
   */
  async createFollowup(data, client = null) {
    const id = data.id || `flw_${uuidv4()}`;
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `INSERT INTO case_followups (
          id, case_id, scheduled_by, follow_up_date, follow_up_time,
          priority, notes, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          data.caseId || data.case_id,
          data.scheduledBy || data.scheduled_by,
          data.followUpDate || data.follow_up_date,
          data.followUpTime || data.follow_up_time || "10:00 AM",
          data.priority || "MEDIUM",
          data.notes || "",
          data.status || "PENDING",
          now,
          now
        ]
      );

      // Also update the follow_up_date on loan_cases for index compatibility
      await q.query(
        "UPDATE loan_cases SET follow_up_date = $1, updated_at = $2 WHERE id = $3",
        [data.followUpDate || data.follow_up_date, now, data.caseId || data.case_id]
      );

      return res.rows[0];
    }

    // In-memory fallback
    if (!memoryStore.case_followups) {
      memoryStore.case_followups = [];
    }

    const newFollowup = {
      id,
      case_id: data.caseId || data.case_id,
      scheduled_by: data.scheduledBy || data.scheduled_by,
      follow_up_date: data.followUpDate || data.follow_up_date,
      follow_up_time: data.followUpTime || data.follow_up_time || "10:00 AM",
      priority: data.priority || "MEDIUM",
      notes: data.notes || "",
      status: data.status || "PENDING",
      completed_at: null,
      completed_by: null,
      created_at: now,
      updated_at: now
    };

    memoryStore.case_followups.unshift(newFollowup);

    // Update case record
    const targetCase = memoryStore.loan_cases.find(c => c.id === (data.caseId || data.case_id));
    if (targetCase) {
      targetCase.follow_up_date = data.followUpDate || data.follow_up_date;
      targetCase.updated_at = now;
    }

    return newFollowup;
  },

  /**
   * Get all follow-ups for a specific case
   */
  async getFollowupsForCase(caseId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT cf.*, u.full_name as scheduled_by_name
         FROM case_followups cf
         LEFT JOIN users u ON cf.scheduled_by = u.id
         WHERE cf.case_id = $1
         ORDER BY cf.follow_up_date ASC, cf.created_at DESC`,
        [caseId]
      );
      return res.rows;
    }

    const list = (memoryStore.case_followups || []).filter(f => f.case_id === caseId);
    return list.map(f => {
      const u = memoryStore.users.find(user => user.id === f.scheduled_by);
      return {
        ...f,
        scheduled_by_name: u ? u.full_name : "System"
      };
    });
  },

  /**
   * Get upcoming follow-ups for an employee or all team members
   */
  async getUpcomingFollowups({ employeeId, date, status = "PENDING", limit = 20 } = {}, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      let whereClauses = [];

      if (status) {
        params.push(status);
        whereClauses.push(`cf.status = $${params.length}`);
      }
      if (employeeId) {
        params.push(employeeId);
        whereClauses.push(`(cf.scheduled_by = $${params.length} OR lc.assigned_employee_id = $${params.length})`);
      }
      if (date) {
        params.push(date);
        whereClauses.push(`cf.follow_up_date = $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
      params.push(limit);

      const res = await q.query(
        `SELECT cf.*, lc.case_number, lc.outstanding_amount, c.full_name as customer_name
         FROM case_followups cf
         JOIN loan_cases lc ON cf.case_id = lc.id
         JOIN customers c ON lc.customer_id = c.id
         ${whereSql}
         ORDER BY cf.follow_up_date ASC
         LIMIT $${params.length}`,
        params
      );
      return res.rows;
    }

    let items = memoryStore.case_followups || [];
    if (status) items = items.filter(f => f.status === status);
    if (employeeId) {
      items = items.filter(f => {
        const lc = memoryStore.loan_cases.find(c => c.id === f.case_id);
        return f.scheduled_by === employeeId || (lc && lc.assigned_employee_id === employeeId);
      });
    }
    if (date) items = items.filter(f => f.follow_up_date === date);

    return items.slice(0, limit).map(f => {
      const lc = memoryStore.loan_cases.find(c => c.id === f.case_id);
      const cust = lc ? memoryStore.customers.find(c => c.id === lc.customer_id) : null;
      return {
        ...f,
        case_number: lc ? lc.case_number : "",
        outstanding_amount: lc ? lc.outstanding_amount : 0,
        customer_name: cust ? cust.full_name : "Unknown"
      };
    });
  },

  /**
   * Update follow-up status (e.g. COMPLETED, RESCHEDULED)
   */
  async updateStatus(followupId, { status, completedBy, notes } = {}, client = null) {
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE case_followups
         SET status = $1, completed_by = $2, completed_at = $3,
             notes = COALESCE($4, notes), updated_at = $5
         WHERE id = $6
         RETURNING *`,
        [status, completedBy || null, status === "COMPLETED" ? now : null, notes || null, now, followupId]
      );
      return res.rows[0] || null;
    }

    const item = (memoryStore.case_followups || []).find(f => f.id === followupId);
    if (!item) return null;

    item.status = status;
    item.updated_at = now;
    if (completedBy) item.completed_by = completedBy;
    if (status === "COMPLETED") item.completed_at = now;
    if (notes) item.notes = notes;

    return { ...item };
  }
};

export default followupRepository;
