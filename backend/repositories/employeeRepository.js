import db, { memoryStore } from "../config/db.js";

/**
 * Employee Repository
 * Handles persistent operational queries for employee workload, capacity,
 * attendance/shift status, supervisor hierarchies, and geographical profiles.
 */
export const employeeRepository = {
  /**
   * Get eligible employees for case allocation with dynamic workload and capacity metrics
   */
  async getEligibleEmployees({
    supervisorId = null,
    targetEmployeeIds = null,
    role = null,
    roles = ["CALLER", "FIELD_AGENT", "SUPERVISOR", "EMPLOYEE"],
    city = null,
    shiftAware = false,
    includeOnLeave = false,
    client = null
  } = {}) {
    const q = client || db;

    if (db.isPgActive()) {
      const params = [];
      const whereClauses = ["u.is_active = TRUE"];

      if (targetEmployeeIds && targetEmployeeIds.length > 0) {
        params.push(targetEmployeeIds);
        whereClauses.push(`(e.id = ANY($${params.length}) OR e.employee_id = ANY($${params.length}))`);
      }

      if (roles && roles.length > 0) {
        params.push(roles);
        whereClauses.push(`u.role = ANY($${params.length})`);
      } else if (role) {
        params.push(role);
        whereClauses.push(`u.role = $${params.length}`);
      }

      if (supervisorId) {
        params.push(supervisorId);
        whereClauses.push(`(e.supervisor_id = $${params.length} OR e.id = $${params.length})`);
      }

      if (city) {
        params.push(city.toLowerCase());
        whereClauses.push(`LOWER(COALESCE(e.city, '')) = $${params.length}`);
      }

      if (!includeOnLeave) {
        whereClauses.push(`COALESCE(e.is_on_leave, FALSE) = FALSE`);
      }

      if (shiftAware) {
        whereClauses.push(`e.shift_status = 'ON_SHIFT'`);
      }

      const sql = `
        SELECT 
          e.id,
          e.employee_id,
          u.full_name,
          u.email,
          u.phone,
          u.role,
          u.department,
          u.designation,
          u.is_active,
          e.supervisor_id,
          sup.full_name AS supervisor_name,
          COALESCE(e.max_workload_capacity, 150) AS max_workload_capacity,
          COALESCE(e.max_portfolio_amount, 25000000.00) AS max_portfolio_amount,
          COALESCE(e.shift_status, 'OFF_SHIFT') AS shift_status,
          COALESCE(e.city, '') AS city,
          COALESCE(e.state, '') AS state,
          COALESCE(e.pincode, '') AS pincode,
          COALESCE(e.specialization, 'GENERAL') AS specialization,
          COALESCE(e.is_on_leave, FALSE) AS is_on_leave,
          COALESCE(lc_stats.active_cases_count, 0)::INTEGER AS current_active_cases,
          COALESCE(lc_stats.current_portfolio_amount, 0.00)::NUMERIC AS current_portfolio_amount
        FROM employees e
        JOIN users u ON e.id = u.id
        LEFT JOIN users sup ON e.supervisor_id = sup.id
        LEFT JOIN (
          SELECT 
            assigned_employee_id,
            COUNT(*) AS active_cases_count,
            SUM(outstanding_amount) AS current_portfolio_amount
          FROM loan_cases
          WHERE status NOT IN ('Closed', 'Fully Paid')
          GROUP BY assigned_employee_id
        ) lc_stats ON e.id = lc_stats.assigned_employee_id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY current_active_cases ASC, e.employee_id ASC
      `;

      const res = await q.query(sql, params);
      return res.rows.map(r => ({
        ...r,
        current_active_cases: parseInt(r.current_active_cases, 10) || 0,
        max_workload_capacity: parseInt(r.max_workload_capacity, 10) || 150,
        current_portfolio_amount: parseFloat(r.current_portfolio_amount) || 0,
        max_portfolio_amount: parseFloat(r.max_portfolio_amount) || 2000000.00,
        remaining_case_capacity: Math.max(0, (parseInt(r.max_workload_capacity, 10) || 150) - (parseInt(r.current_active_cases, 10) || 0)),
        remaining_portfolio_capacity: Math.max(0, (parseFloat(r.max_portfolio_amount) || 25000000.00) - (parseFloat(r.current_portfolio_amount) || 0))
      }));
    }

    // In-memory relational mode
    const todayStr = new Date().toISOString().split("T")[0];
    const targetRoles = roles || (role ? [role] : ["CALLER", "FIELD_AGENT", "SUPERVISOR", "EMPLOYEE"]);

    return memoryStore.employees
      .map(emp => {
        const u = memoryStore.users.find(user => user.id === emp.id || user.employee_id === emp.employee_id);
        if (!u) return null;

        const sup = emp.supervisor_id ? memoryStore.users.find(user => user.id === emp.supervisor_id) : null;

        // Calculate live active cases & portfolio amount
        const activeCases = memoryStore.loan_cases.filter(
          c => (c.assigned_employee_id === emp.id || c.assigned_employee_id === u.id || c.assigned_employee_id === emp.employee_id) &&
               !["Closed", "Fully Paid"].includes(c.status)
        );

        const currentActive = activeCases.length;
        const currentPortfolio = activeCases.reduce((sum, c) => sum + (parseFloat(c.outstanding_amount) || 0), 0);
        const maxCapacity = parseInt(emp.max_workload_capacity, 10) || 150;
        const maxPortfolio = parseFloat(emp.max_portfolio_amount) || 25000000.00;

        // Check attendance/leave status for today
        const todayAttendance = (memoryStore.attendance || []).find(
          a => (a.employee_id === emp.id || a.employee_id === u.id) &&
               (a.attendance_date === todayStr || (a.attendance_date && a.attendance_date.startsWith(todayStr)))
        );

        const isOnLeave = emp.is_on_leave || todayAttendance?.status === "LEAVE";
        const currentShift = emp.shift_status === "OFF_SHIFT"
          ? "OFF_SHIFT"
          : (todayAttendance?.status === "PRESENT" ? "ON_SHIFT" : (emp.shift_status || "OFF_SHIFT"));

        return {
          id: u.id,
          employee_id: u.employee_id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          department: u.department,
          designation: u.designation,
          is_active: u.is_active !== false,
          supervisor_id: emp.supervisor_id || null,
          supervisor_name: sup?.full_name || null,
          max_workload_capacity: maxCapacity,
          max_portfolio_amount: maxPortfolio,
          shift_status: currentShift,
          city: emp.city || "",
          state: emp.state || "",
          pincode: emp.pincode || "",
          specialization: emp.specialization || "GENERAL",
          is_on_leave: Boolean(isOnLeave),
          current_active_cases: currentActive,
          current_portfolio_amount: Math.round(currentPortfolio * 100) / 100,
          remaining_case_capacity: Math.max(0, maxCapacity - currentActive),
          remaining_portfolio_capacity: Math.max(0, Math.round((maxPortfolio - currentPortfolio) * 100) / 100)
        };
      })
      .filter(Boolean)
      .filter(emp => {
        if (!emp.is_active) return false;
        if (targetEmployeeIds && targetEmployeeIds.length > 0 && !targetEmployeeIds.includes(emp.id) && !targetEmployeeIds.includes(emp.employee_id)) return false;
        if (targetRoles.length > 0 && !targetRoles.includes(emp.role)) return false;
        if (supervisorId && emp.supervisor_id !== supervisorId && emp.id !== supervisorId) return false;
        if (city && emp.city.toLowerCase() !== city.toLowerCase()) return false;
        if (!includeOnLeave && emp.is_on_leave) return false;
        if (shiftAware && emp.shift_status !== "ON_SHIFT") return false;
        return true;
      })
      .sort((a, b) => a.current_active_cases - b.current_active_cases);
  },

  /**
   * Find employee by ID
   */
  async getById(employeeId, client = null) {
    const q = client || db;

    if (db.isPgActive()) {
      const res = await q.query(
        `SELECT e.*, u.full_name, u.email, u.phone, u.role, u.is_active
         FROM employees e
         JOIN users u ON e.id = u.id
         WHERE e.id = $1 OR e.employee_id = $1`,
        [employeeId]
      );
      return res.rows[0] || null;
    }

    const emp = memoryStore.employees.find(e => e.id === employeeId || e.employee_id === employeeId);
    if (!emp) return null;
    const u = memoryStore.users.find(user => user.id === emp.id || user.employee_id === emp.employee_id);
    return { ...emp, ...u };
  },

  /**
   * Update active workload and portfolio summary for an employee
   */
  async updateWorkloadAndPortfolio(employeeId, activeCount, portfolioAmount, client = null) {
    const q = client || db;
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      await q.query(
        `UPDATE employees
         SET active_cases_count = $1, current_portfolio_amount = $2, updated_at = $3
         WHERE id = $4 OR employee_id = $4`,
        [activeCount, portfolioAmount, now, employeeId]
      );
      return;
    }

    const emp = memoryStore.employees.find(e => e.id === employeeId || e.employee_id === employeeId);
    if (emp) {
      emp.active_cases_count = activeCount;
      emp.current_portfolio_amount = portfolioAmount;
      emp.updated_at = now;
    }
  }
};

export default employeeRepository;
