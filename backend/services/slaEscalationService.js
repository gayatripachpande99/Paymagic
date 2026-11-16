import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

export const slaEscalationService = {
  /**
   * Run SLA monitoring check and trigger idempotent escalations
   */
  async checkAndEscalate({ actor = null, client = null } = {}) {
    const q = client || db;
    const todayStr = new Date().toISOString().split("T")[0];
    const escalationsCreated = [];

    // 1. Fetch active cases requiring SLA audit
    let activeCases = [];

    if (db.isPgActive()) {
      const res = await q.query(`
        SELECT 
          lc.id, lc.case_number, lc.status, lc.priority, lc.follow_up_date, lc.outstanding_amount,
          lc.assigned_employee_id, lc.assigned_supervisor_id, lc.updated_at,
          u.full_name as assigned_employee_name,
          e.supervisor_id
        FROM loan_cases lc
        LEFT JOIN users u ON lc.assigned_employee_id = u.id
        LEFT JOIN employees e ON lc.assigned_employee_id = e.id
        WHERE lc.status NOT IN ('Closed', 'Fully Paid')
      `);
      activeCases = res.rows;
    } else {
      activeCases = memoryStore.loan_cases.filter(c => !["Closed", "Fully Paid"].includes(c.status)).map(c => {
        const u = memoryStore.users.find(user => user.id === c.assigned_employee_id);
        const emp = memoryStore.employees.find(e => e.id === c.assigned_employee_id);
        return {
          ...c,
          assigned_employee_name: u?.full_name || "Unassigned",
          supervisor_id: emp?.supervisor_id || c.assigned_supervisor_id || "usr_supervisor"
        };
      });
    }

    const now = new Date();

    for (const lc of activeCases) {
      if (!lc.assigned_employee_id) continue;

      let reason = null;
      let level = 1;

      // Condition A: Overdue Follow-up Date
      if (lc.follow_up_date) {
        const fDate = new Date(lc.follow_up_date);
        const daysPast = Math.floor((now.getTime() - fDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysPast > 0) {
          reason = "OVERDUE_FOLLOWUP";
          level = daysPast > 3 ? 2 : 1; // Escalate to supervisor if > 3 days overdue
        }
      }

      // Condition B: Critical Case Without Activity (> 3 days)
      if (!reason && lc.priority === "CRITICAL" && lc.updated_at) {
        const uDate = new Date(lc.updated_at);
        const daysInactive = Math.floor((now.getTime() - uDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysInactive >= 3) {
          reason = "INACTIVE_CRITICAL";
          level = daysInactive > 5 ? 3 : 2; // Level 3 for severe critical inactivity
        }
      }

      // Condition C: Broken Promise to Pay
      if (!reason && lc.status === "Promise to Pay" && lc.follow_up_date) {
        if (new Date(lc.follow_up_date) < new Date(todayStr)) {
          reason = "MISSED_PTP";
          level = 2; // Broken PTP immediately alerts supervisor
        }
      }

      if (reason) {
        // Target recipient based on level
        let recipientId = lc.assigned_employee_id;
        if (level === 2) {
          recipientId = lc.supervisor_id || "usr_supervisor";
        } else if (level === 3) {
          recipientId = "usr_admin";
        }

        // Idempotency check: Don't create duplicate open escalation for same case & reason today
        let alreadyEscalated = false;

        if (db.isPgActive()) {
          const check = await q.query(
            `SELECT id FROM sla_escalations
             WHERE case_id = $1 AND escalation_reason = $2 AND status = 'OPEN'
               AND created_at >= CURRENT_DATE`,
            [lc.id, reason]
          );
          if (check.rows.length > 0) alreadyEscalated = true;
        } else {
          if (!memoryStore.sla_escalations) memoryStore.sla_escalations = [];
          const existing = memoryStore.sla_escalations.find(
            e => e.case_id === lc.id && e.escalation_reason === reason && e.status === "OPEN" &&
                 e.created_at && e.created_at.startsWith(todayStr)
          );
          if (existing) alreadyEscalated = true;
        }

        if (!alreadyEscalated) {
          const escId = `esc_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
          const remarks = `SLA Escalation (Level ${level}): Case ${lc.case_number} triggered ${reason}. Action required.`;

          if (db.isPgActive()) {
            await q.query(
              `INSERT INTO sla_escalations (
                id, case_id, escalation_level, escalation_reason, notified_user_id, status, remarks, created_at
              ) VALUES ($1, $2, $3, $4, $5, 'OPEN', $6, $7)`,
              [escId, lc.id, level, reason, recipientId, remarks, now.toISOString()]
            );

            // Create notification record
            await q.query(
              `INSERT INTO notifications (
                id, recipient_id, type, title, message, link_url, is_read, created_at
              ) VALUES ($1, $2, 'SLA_ALERT', $3, $4, $5, FALSE, $6)`,
              [
                `notif_${uuidv4().replace(/-/g, "").slice(0, 10)}`,
                recipientId,
                `SLA Escalation: Case ${lc.case_number}`,
                remarks,
                `/cases/${lc.id}`,
                now.toISOString()
              ]
            );
          } else {
            memoryStore.sla_escalations.push({
              id: escId,
              case_id: lc.id,
              escalation_level: level,
              escalation_reason: reason,
              notified_user_id: recipientId,
              status: "OPEN",
              remarks,
              created_at: now.toISOString()
            });

            if (!memoryStore.notifications) memoryStore.notifications = [];
            memoryStore.notifications.unshift({
              id: `notif_${uuidv4().replace(/-/g, "").slice(0, 10)}`,
              recipient_id: recipientId,
              type: "SLA_ALERT",
              title: `SLA Escalation: Case ${lc.case_number}`,
              message: remarks,
              link_url: `/cases/${lc.id}`,
              is_read: false,
              created_at: now.toISOString()
            });
          }

          escalationsCreated.push({
            id: escId,
            case_id: lc.id,
            case_number: lc.case_number,
            level,
            reason,
            notified_user_id: recipientId
          });
        }
      }
    }

    return {
      success: true,
      audited_cases_count: activeCases.length,
      escalations_created_count: escalationsCreated.length,
      escalations: escalationsCreated
    };
  },

  /**
   * List recent escalations
   */
  async listEscalations({ caseId = null, status = null, page = 1, limit = 20 } = {}) {
    if (db.isPgActive()) {
      const params = [];
      const whereClauses = [];

      if (caseId) {
        params.push(caseId);
        whereClauses.push(`se.case_id = $${params.length}`);
      }
      if (status) {
        params.push(status);
        whereClauses.push(`se.status = $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const limitNum = Math.max(1, parseInt(limit, 10) || 20);
      const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limitNum;

      const res = await db.query(
        `SELECT se.*, lc.case_number, lc.outstanding_amount, u.full_name as notified_user_name
         FROM sla_escalations se
         JOIN loan_cases lc ON se.case_id = lc.id
         LEFT JOIN users u ON se.notified_user_id = u.id
         ${whereSql}
         ORDER BY se.created_at DESC
         LIMIT ${limitNum} OFFSET ${offset}`
      );
      return res.rows;
    }

    let list = [...(memoryStore.sla_escalations || [])];
    if (caseId) list = list.filter(e => e.case_id === caseId);
    if (status) list = list.filter(e => e.status === status);
    return list;
  }
};

export default slaEscalationService;
