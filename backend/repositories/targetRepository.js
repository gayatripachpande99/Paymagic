import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Recovery Target Repository
 * Manages monthly employee recovery targets and verified collections.
 */
export const targetRepository = {
  /**
   * Find target for specific employee and month
   */
  async getTarget(employeeId, monthYear, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        "SELECT * FROM targets WHERE employee_id = $1 AND month_year = $2",
        [employeeId, monthYear]
      );
      return res.rows[0] || null;
    }

    return memoryStore.targets.find(
      t => t.employee_id === employeeId && t.month_year === monthYear
    ) || null;
  },

  /**
   * Set or update monthly recovery target
   */
  async setTarget({ employeeId, monthYear, targetAmount, createdById }, client = null) {
    const now = new Date().toISOString();
    const targetAmt = parseFloat(targetAmount) || 0;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const existing = await q.query(
        "SELECT id FROM targets WHERE employee_id = $1 AND month_year = $2",
        [employeeId, monthYear]
      );

      if (existing.rows.length > 0) {
        const res = await q.query(
          `UPDATE targets
           SET target_amount = $1, created_by_id = $2, updated_at = $3
           WHERE id = $4
           RETURNING *`,
          [targetAmt, createdById || null, now, existing.rows[0].id]
        );
        return res.rows[0];
      }

      const id = `tgt_${uuidv4()}`;
      const res = await q.query(
        `INSERT INTO targets (
          id, employee_id, month_year, target_amount, achieved_amount, created_by_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 0.00, $5, $6, $7)
        RETURNING *`,
        [id, employeeId, monthYear, targetAmt, createdById || null, now, now]
      );

      // Also update employee profile default target
      await q.query(
        "UPDATE employees SET assigned_target = $1, updated_at = $2 WHERE id = $3",
        [targetAmt, now, employeeId]
      );

      return res.rows[0];
    }

    let existing = memoryStore.targets.find(
      t => t.employee_id === employeeId && t.month_year === monthYear
    );

    if (existing) {
      existing.target_amount = targetAmt;
      existing.updated_at = now;
      if (createdById) existing.created_by_id = createdById;
    } else {
      existing = {
        id: `tgt_${uuidv4()}`,
        employee_id: employeeId,
        month_year: monthYear,
        target_amount: targetAmt,
        achieved_amount: 0.00,
        created_by_id: createdById || null,
        created_at: now,
        updated_at: now
      };
      memoryStore.targets.push(existing);
    }

    // Update employee profile
    const emp = memoryStore.employees.find(e => e.id === employeeId || e.employee_id === employeeId);
    if (emp) {
      emp.assigned_target = targetAmt;
      emp.updated_at = now;
    }

    return { ...existing };
  },

  /**
   * List targets for month
   */
  async listTargets({ monthYear } = {}, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      let where = "";
      if (monthYear) {
        params.push(monthYear);
        where = "WHERE t.month_year = $1";
      }

      const res = await q.query(
        `SELECT t.*, u.full_name as employee_name, u.employee_id as employee_code, u.role
         FROM targets t
         JOIN users u ON t.employee_id = u.id
         ${where}
         ORDER BY t.target_amount DESC`,
        params
      );
      return res.rows;
    }

    let list = memoryStore.targets;
    if (monthYear) {
      list = list.filter(t => t.month_year === monthYear);
    }

    return list.map(t => {
      const u = memoryStore.users.find(user => user.id === t.employee_id);
      return {
        ...t,
        employee_name: u ? u.full_name : "Unknown",
        employee_code: u ? u.employee_id : "",
        role: u ? u.role : ""
      };
    });
  },

  /**
   * Recalculate achieved recovery strictly against verified payment transactions
   */
  async recalculateAchievement(employeeId, monthYear, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      // Parse monthYear e.g. '2026-11' to start and end dates
      const [year, month] = monthYear.split("-");
      const startDate = `${year}-${month}-01T00:00:00Z`;
      const nextMonth = String(Number(month) % 12 + 1).padStart(2, "0");
      const nextYear = Number(month) === 12 ? Number(year) + 1 : year;
      const endDate = `${nextYear}-${nextMonth}-01T00:00:00Z`;

      const sumRes = await q.query(
        `SELECT COALESCE(SUM(amount), 0) as total_collected
         FROM payments
         WHERE collected_by_id = $1
           AND reconciliation_status = 'RECONCILED'
           AND payment_date >= $2 AND payment_date < $3`,
        [employeeId, startDate, endDate]
      );
      const totalCollected = parseFloat(sumRes.rows[0]?.total_collected || 0);

      await q.query(
        "UPDATE targets SET achieved_amount = $1, updated_at = NOW() WHERE employee_id = $2 AND month_year = $3",
        [totalCollected, employeeId, monthYear]
      );

      await q.query(
        "UPDATE employees SET current_recovery = $1, updated_at = NOW() WHERE id = $2",
        [totalCollected, employeeId]
      );

      return totalCollected;
    }

    const [year, month] = monthYear.split("-");
    const payments = memoryStore.payments.filter(p => {
      if (p.collected_by_id !== employeeId) return false;
      if (p.reconciliation_status !== "RECONCILED") return false;
      const pDate = new Date(p.payment_date);
      return pDate.getFullYear() === Number(year) && (pDate.getMonth() + 1) === Number(month);
    });

    const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const target = memoryStore.targets.find(t => t.employee_id === employeeId && t.month_year === monthYear);
    if (target) {
      target.achieved_amount = totalCollected;
      target.updated_at = new Date().toISOString();
    }

    const emp = memoryStore.employees.find(e => e.id === employeeId);
    if (emp) {
      emp.current_recovery = totalCollected;
      emp.updated_at = new Date().toISOString();
    }

    return totalCollected;
  }
};

export default targetRepository;
