import React from "react";
import { Calendar, RefreshCw } from "lucide-react";

export default function LeaveApprovalsPage({
  leaveApprovals = [],
  leaveLoading = false,
  loadLeaveApprovals = () => {},
  handleApproveLeave = () => {},
  handleRejectLeave = () => {}
}) {
  return (
    <div className="portal-tab-content">
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h4>Employee Leave Requests &amp; Supervisor Desk ({leaveApprovals.length})</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-warning">
              {leaveApprovals.filter((l) => l.status === "PENDING").length} Pending Review
            </span>
            <button
              type="button"
              onClick={loadLeaveApprovals}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Requests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="portal-table-container">
          <table className="portal-table min-w-[950px]">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaveApprovals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No leave requests pending review.
                  </td>
                </tr>
              ) : (
                leaveApprovals.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="font-bold text-white text-xs">{req.employeeName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{req.employeeId}</span>
                    </td>
                    <td className="text-xs text-slate-300">{req.type}</td>
                    <td className="font-semibold text-xs text-white">{req.days} Day(s)</td>
                    <td className="text-xs text-slate-300 font-mono">
                      {req.fromDate} &rarr; {req.toDate}
                    </td>
                    <td className="text-xs text-slate-400 max-w-xs truncate">{req.reason}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                        req.status === "REJECTED" ? "bg-rose-500/20 text-rose-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(req.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectLeave(req.id)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {req.remarks || "Actioned"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
