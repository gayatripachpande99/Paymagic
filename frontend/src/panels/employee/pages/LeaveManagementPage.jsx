import React from "react";
import { Calendar } from "lucide-react";

export default function LeaveManagementPage({
  handleApplyLeave,
  leaveType = "Casual Leave",
  setLeaveType,
  fromDate = "",
  setFromDate,
  toDate = "",
  setToDate,
  leaveReason = "",
  setLeaveReason,
  leaveRequests = []
}) {
  return (
    <div className="portal-tab-content">
      <div className="portal-card mb-6">
        <div className="card-header">
          <div className="header-left">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h4>Apply for Leave</h4>
          </div>
        </div>

        <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">From Date</label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">To Date</label>
              <input
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Leave</label>
            <textarea
              rows={2}
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Provide reason for absence..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs resize-none"
            />
          </div>

          <button type="submit" className="primary-btn" style={{ padding: "8px 20px" }}>
            Submit Leave Request
          </button>
        </form>
      </div>

      {/* Leave Applications History */}
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h4>My Leave Applications</h4>
          </div>
        </div>

        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => (
                <tr key={req.id}>
                  <td className="font-mono text-indigo-400 text-xs font-semibold">{req.id}</td>
                  <td className="text-xs text-white">{req.type}</td>
                  <td className="text-xs text-slate-300 font-mono">{req.fromDate} &rarr; {req.toDate}</td>
                  <td className="text-xs font-bold text-slate-200">{req.days} Day(s)</td>
                  <td className="text-xs text-slate-400">{req.reason}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                      req.status === "REJECTED" ? "bg-rose-500/20 text-rose-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
