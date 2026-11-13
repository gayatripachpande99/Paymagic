import React from "react";
import { Clock, Search } from "lucide-react";

const defaultFormatTime = (isoString) => {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

const defaultFormatMinutes = (mins) => {
  if (mins === null || mins === undefined) return "--";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

export default function LiveAttendancePage({
  attendanceSummary = { totalEmployees: 0, present: 0, working: 0, completed: 0 },
  attSearchTerm = "",
  setAttSearchTerm,
  attStatusFilter = "ALL",
  setAttStatusFilter,
  attDeptFilter = "ALL",
  setAttDeptFilter,
  departments = [],
  filteredAttendance = [],
  formatTime = defaultFormatTime,
  formatMinutes = defaultFormatMinutes
}) {
  return (
    <div className="portal-tab-content">
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap blue-wrap">👥</div>
          <div className="kpi-data">
            <span className="kpi-label">Total Staff</span>
            <div className="kpi-val">{attendanceSummary.totalEmployees}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap green-wrap">✓</div>
          <div className="kpi-data">
            <span className="kpi-label">Present Today</span>
            <div className="kpi-val text-green">{attendanceSummary.present}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap gold-wrap">⚡</div>
          <div className="kpi-data">
            <span className="kpi-label">Currently Working</span>
            <div className="kpi-val text-gold">{attendanceSummary.working}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap purple-wrap">⌛</div>
          <div className="kpi-data">
            <span className="kpi-label">Shift Completed</span>
            <div className="kpi-val text-purple">{attendanceSummary.completed}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="portal-card mb-5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="search-box flex-1 min-w-[200px]">
            <Search className="search-icon w-4 h-4" />
            <input
              type="text"
              placeholder="Search staff name, ID or department..."
              value={attSearchTerm}
              onChange={(e) => setAttSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={attStatusFilter}
              onChange={(e) => setAttStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="NOT_MARKED">Not Marked</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>

            <select
              value={attDeptFilter}
              onChange={(e) => setAttDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h4>Today's Attendance Roster ({filteredAttendance.length})</h4>
          </div>
          <span className="badge badge-info">{new Date().toDateString()}</span>
        </div>

        <div className="portal-table-container">
          <table className="portal-table min-w-[950px]">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Department</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((item) => (
                <tr key={item.employeeId}>
                  <td>
                    <div className="font-bold text-white text-xs">{item.name}</div>
                    <span className="text-[11px] text-slate-400 font-mono">{item.employeeId}</span>
                  </td>
                  <td className="text-xs text-slate-300">{item.department}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === "PRESENT" ? "bg-emerald-500/20 text-emerald-400" :
                      item.status === "ON_LEAVE" ? "bg-amber-500/20 text-amber-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-slate-300">{formatTime(item.checkIn)}</td>
                  <td className="font-mono text-xs text-slate-300">{formatTime(item.checkOut)}</td>
                  <td className="font-mono text-xs text-indigo-400 font-semibold">{formatMinutes(item.workMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
