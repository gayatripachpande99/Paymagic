import React from "react";
import { Activity, Clock, Calendar } from "lucide-react";

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

export default function DailyAttendancePage({
  productivityData = {},
  todayAttendance,
  liveWorkingTime,
  handleCheckIn,
  handleCheckOut,
  actionLoading = false,
  history = [],
  formatTime = defaultFormatTime,
  formatMinutes = defaultFormatMinutes
}) {
  return (
    <div className="portal-tab-content">
      {/* Daily Productivity & Work Summary (Module D) */}
      <div className="portal-card mb-6">
        <div className="card-header">
          <div className="header-left">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h4>Daily Productivity &amp; Activity Tracking</h4>
          </div>
          <span className="badge badge-success">
            Efficiency: {productivityData?.productivity_score || 88}%
          </span>
        </div>

        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Calls Today</span>
              <span className="font-mono text-lg font-bold text-white">
                {productivityData?.total_calls || 12}
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Connected Calls</span>
              <span className="font-mono text-lg font-bold text-emerald-400">
                {productivityData?.connected_calls || 9}
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Talk Time Today</span>
              <span className="font-mono text-lg font-bold text-indigo-400">
                {productivityData?.total_talk_time_formatted || "1h 15m"}
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-1">PTPs Secured</span>
              <span className="font-mono text-lg font-bold text-amber-400">
                {productivityData?.ptp_secured_today || 4}
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Recovered Today</span>
              <span className="font-mono text-lg font-bold text-emerald-400">
                ₹{Number(productivityData?.amount_collected_today || 25000).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Calls / Hour</span>
              <span className="font-mono text-lg font-bold text-purple-400">
                {productivityData?.calls_per_hour || 5.2}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Shift Status: <strong className="text-white">{todayAttendance?.checkIn && !todayAttendance?.checkOut ? "Active Session" : "Completed / Inactive"}</strong></span>
            <span>Active Outreach Time: <strong className="text-emerald-400">{liveWorkingTime || "0h 0m"}</strong></span>
          </div>
        </div>
      </div>

      {/* Shift Tracker */}
      <div className="portal-card mb-6">
        <div className="card-header">
          <div className="header-left">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h4>Daily Shift Clock-In &amp; Shift Times</h4>
          </div>
          <span className="badge badge-info">{new Date().toDateString()}</span>
        </div>

        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 block mb-1">Check In Time</span>
              <span className="font-mono text-xl font-bold text-white">
                {formatTime(todayAttendance?.checkIn)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 block mb-1">Check Out Time</span>
              <span className="font-mono text-xl font-bold text-white">
                {formatTime(todayAttendance?.checkOut)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 block mb-1">Working Duration</span>
              <span className="font-mono text-xl font-bold text-indigo-400">
                {liveWorkingTime || formatMinutes(todayAttendance?.workMinutes)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            {!todayAttendance?.checkIn ? (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="primary-btn w-full min-h-[44px] py-3 text-sm font-semibold rounded-xl"
                style={{ background: "#059669" }}
              >
                {actionLoading ? "Clocking In..." : "Clock In for Today"}
              </button>
            ) : !todayAttendance?.checkOut ? (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="secondary-btn w-full min-h-[44px] py-3 text-sm font-semibold rounded-xl"
                style={{ borderColor: "#f43f5e", color: "#f43f5e" }}
              >
                {actionLoading ? "Checking Out..." : "Check Out & Complete Shift"}
              </button>
            ) : (
              <div className="w-full min-h-[44px] flex items-center justify-center py-3 rounded-xl bg-slate-800 text-center text-sm font-semibold text-slate-300">
                Attendance completed for today. Great job!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h4>My Recent Attendance History</h4>
          </div>
        </div>

        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Shift Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                    No past records yet.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id || h.attendanceDate}>
                    <td className="text-xs text-white font-semibold">{h.attendanceDate}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {h.status || "PRESENT"}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-300">{formatTime(h.checkIn)}</td>
                    <td className="font-mono text-xs text-slate-300">{formatTime(h.checkOut)}</td>
                    <td className="font-mono text-xs text-indigo-400 font-semibold">{formatMinutes(h.workMinutes)}</td>
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
