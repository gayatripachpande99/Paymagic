import React from "react";
import { Clock, IndianRupee, ChevronRight } from "lucide-react";
import PerformanceDashboard from "../../../components/portal/PerformanceDashboard";

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

export default function EmployeePerformancePage({
  todayAttendance,
  liveWorkingTime,
  handleCheckIn,
  handleCheckOut,
  actionLoading = false,
  formatTime = defaultFormatTime,
  formatMinutes = defaultFormatMinutes,
  dashboardMode = "scorecard",
  setDashboardMode,
  kpiData = {},
  myCases = [],
  setActiveTab
}) {
  return (
    <div className="portal-tab-content">
      {/* Shift Tracker Ribbon */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            todayAttendance?.checkIn && !todayAttendance?.checkOut
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-indigo-500/20 text-indigo-400"
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Shift Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                todayAttendance?.checkIn && !todayAttendance?.checkOut
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : todayAttendance?.checkOut
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
              }`}>
                {todayAttendance?.checkIn && !todayAttendance?.checkOut
                  ? "ACTIVE / CLOCKED IN"
                  : todayAttendance?.checkOut
                  ? "SHIFT COMPLETED"
                  : "NOT CLOCKED IN"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {todayAttendance?.checkIn
                ? `Shift started at ${formatTime(todayAttendance.checkIn)}`
                : "Start your recovery shift to begin customer outreach."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {liveWorkingTime && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Live Shift Timer</span>
              <span className="font-mono text-lg font-extrabold text-emerald-400">{liveWorkingTime}</span>
            </div>
          )}

          {!todayAttendance?.checkIn ? (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="primary-btn"
              style={{ padding: "8px 18px", fontSize: "12px", background: "#059669" }}
            >
              {actionLoading ? "Clocking In..." : "Clock In / Start Shift"}
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="secondary-btn"
              style={{ padding: "8px 18px", fontSize: "12px", borderColor: "#f43f5e", color: "#f43f5e" }}
            >
              {actionLoading ? "Ending Shift..." : "End Shift / Clock Out"}
            </button>
          ) : (
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
              Shift Done &bull; Total: {formatMinutes(todayAttendance.workMinutes)}
            </span>
          )}
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setDashboardMode("scorecard")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dashboardMode === "scorecard"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Personal Scorecard (9 KPIs &amp; Formulas)
          </button>
          <button
            type="button"
            onClick={() => setDashboardMode("team-analytics")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dashboardMode === "team-analytics"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Team Manager Dashboard (AHT &amp; Efficiency)
          </button>
        </div>
      </div>

      {dashboardMode === "team-analytics" ? (
        <PerformanceDashboard role="CALLER" initialSubTab="Team Manager" />
      ) : (
        <>
          {/* Exact Formula KPI Cards Banner */}
          <div className="admin-kpi-grid" style={{ marginBottom: "24px" }}>
            {/* Formula 1: Call Connection Rate */}
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap purple-wrap">📞</div>
              <div className="kpi-data">
                <span className="kpi-label">Call Connection Rate</span>
                <div className="kpi-val text-purple">
                  {kpiData.call_connection_rate}%
                </div>
                <span className="text-[11px] text-slate-400">
                  Formula: (Connected / Total Calls) &times; 100
                </span>
              </div>
            </div>

            {/* Formula 2: Recovery Percentage */}
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap blue-wrap">📈</div>
              <div className="kpi-data">
                <span className="kpi-label">Recovery Percentage</span>
                <div className="kpi-val text-blue">
                  {kpiData.recovery_percentage}%
                </div>
                <span className="text-[11px] text-slate-400">
                  Formula: (Recovered / Assigned Debt) &times; 100
                </span>
              </div>
            </div>

            {/* Formula 3: Employee Target Achievement */}
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap green-wrap">🎯</div>
              <div className="kpi-data">
                <span className="kpi-label">Target Achievement</span>
                <div className="kpi-val text-green">
                  {kpiData.target_achievement}%
                </div>
                <span className="text-[11px] text-slate-400">
                  Formula: (Actual Recovery / Target) &times; 100
                </span>
              </div>
            </div>

            {/* Total Talk Time */}
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap gold-wrap">⏱️</div>
              <div className="kpi-data">
                <span className="kpi-label">Total Talk Time</span>
                <div className="kpi-val text-gold">
                  {kpiData.total_talk_time_formatted || "4h 20m"}
                </div>
                <span className="text-[11px] text-slate-400">
                  Cumulative customer voice time
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Assigned Cases</span>
              <span className="text-xl font-extrabold text-white">{kpiData.assigned_cases || myCases.length || 150}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Total Calls</span>
              <span className="text-xl font-extrabold text-white">{kpiData.total_calls || 120}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Connected Calls</span>
              <span className="text-xl font-extrabold text-emerald-400">{kpiData.connected_calls || 85}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Promises to Pay (PTP)</span>
              <span className="text-xl font-extrabold text-amber-400">{kpiData.promises_to_pay || 12}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Follow-ups Pending</span>
              <span className="text-xl font-extrabold text-rose-400">{kpiData.follow_ups_pending || 18}</span>
            </div>
          </div>

          {/* Target Progress Bar Card */}
          <div className="portal-card mb-6">
            <div className="card-header">
              <div className="header-left">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <h4>Monthly Target Achievement Progress</h4>
              </div>
              <span className="badge badge-success">Target: ₹{Number(kpiData.target_amount || 100000).toLocaleString("en-IN")}</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">
                  Recovered: <strong className="text-emerald-400 font-mono text-base">₹{Number(kpiData.amount_recovered || 85000).toLocaleString("en-IN")}</strong>
                </span>
                <span className="text-slate-400">
                  Target: <strong className="text-white font-mono text-base">₹{Number(kpiData.target_amount || 100000).toLocaleString("en-IN")}</strong>
                </span>
              </div>

              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (kpiData.target_achievement || 0) >= 100 ? "bg-emerald-500" :
                    (kpiData.target_achievement || 0) >= 70 ? "bg-indigo-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(kpiData.target_achievement || 85, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Progress to Target: <strong className="text-white">{kpiData.target_achievement || 85}%</strong></span>
                <span>Balance Needed: <strong className="text-amber-400">₹{Math.max(0, (kpiData.target_amount || 100000) - (kpiData.amount_recovered || 85000)).toLocaleString("en-IN")}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action to View Cases */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white text-sm">Ready to begin calling outreach?</h4>
              <p className="text-xs text-slate-400">Open your assigned loan cases list to initiate click-to-call with automatic recording.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("cases")}
              className="primary-btn"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              <span>View Assigned Cases</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
