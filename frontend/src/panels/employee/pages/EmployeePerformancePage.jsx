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
      <div className="portal-card shift-tracker-card mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Status with icon & text */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              todayAttendance?.checkIn && !todayAttendance?.checkOut
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm tracking-wide">Shift Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                  todayAttendance?.checkIn && !todayAttendance?.checkOut
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : todayAttendance?.checkOut
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    todayAttendance?.checkIn && !todayAttendance?.checkOut
                      ? "bg-emerald-400 animate-pulse"
                      : todayAttendance?.checkOut
                      ? "bg-blue-400"
                      : "bg-slate-500"
                  }`} />
                  {todayAttendance?.checkIn && !todayAttendance?.checkOut
                    ? "ACTIVE / CLOCKED IN"
                    : todayAttendance?.checkOut
                    ? "SHIFT COMPLETED"
                    : "NOT CLOCKED IN"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {todayAttendance?.checkIn
                  ? `Shift started at ${formatTime(todayAttendance.checkIn)} • Outreach active`
                  : "Start your recovery shift to begin customer outreach and auto-recording."}
              </p>
            </div>
          </div>

          {/* Right: Live timer & Action Button */}
          <div className="flex items-center justify-between md:justify-end gap-3.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            {liveWorkingTime && (
              <div className="text-left md:text-right px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Live Shift Timer</span>
                <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-400">{liveWorkingTime}</span>
              </div>
            )}

            {!todayAttendance?.checkIn ? (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>{actionLoading ? "Clocking In..." : "Clock In / Start Shift"}</span>
              </button>
            ) : !todayAttendance?.checkOut ? (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4 text-rose-400" />
                <span>{actionLoading ? "Ending Shift..." : "End Shift / Clock Out"}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/25">
                <span>Shift Done</span>
                <span className="text-slate-400">•</span>
                <span>Total: {formatMinutes(todayAttendance.workMinutes)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="mb-6 w-full">
        <div className="inline-flex flex-wrap sm:flex-nowrap p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl gap-1.5 w-full sm:w-auto shadow-inner">
          <button
            type="button"
            onClick={() => setDashboardMode("scorecard")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              dashboardMode === "scorecard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span>Personal Scorecard</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 hidden xs:inline-block">
              9 KPIs
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDashboardMode("team-analytics")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              dashboardMode === "team-analytics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span>Team Manager Dashboard</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 hidden xs:inline-block">
              AHT
            </span>
          </button>
        </div>
      </div>

      {dashboardMode === "team-analytics" ? (
        <PerformanceDashboard role="CALLER" initialSubTab="Team Manager" />
      ) : (
        <>
          {/* Exact Formula KPI Cards Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
            {/* Formula 1: Call Connection Rate */}
            <div className="portal-card mb-0 p-5 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-slate-700/80 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                📞
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400 tracking-wide block uppercase">Call Connection Rate</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono mt-0.5 mb-1">
                  {kpiData.call_connection_rate}%
                </div>
                <span className="text-[11px] text-slate-400 block truncate" title="Formula: (Connected / Total Calls) × 100">
                  Formula: (Connected / Total) × 100
                </span>
              </div>
            </div>

            {/* Formula 2: Recovery Percentage */}
            <div className="portal-card mb-0 p-5 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-slate-700/80 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-xl shrink-0">
                📈
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400 tracking-wide block uppercase">Recovery Percentage</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono mt-0.5 mb-1">
                  {kpiData.recovery_percentage}%
                </div>
                <span className="text-[11px] text-slate-400 block truncate" title="Formula: (Recovered / Assigned Debt) × 100">
                  Formula: (Recovered / Assigned) × 100
                </span>
              </div>
            </div>

            {/* Formula 3: Employee Target Achievement */}
            <div className="portal-card mb-0 p-5 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-slate-700/80 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400 tracking-wide block uppercase">Target Achievement</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-0.5 mb-1">
                  {kpiData.target_achievement}%
                </div>
                <span className="text-[11px] text-slate-400 block truncate" title="Formula: (Actual Recovery / Target) × 100">
                  Formula: (Actual / Target) × 100
                </span>
              </div>
            </div>

            {/* Total Talk Time */}
            <div className="portal-card mb-0 p-5 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-slate-700/80 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                ⏱️
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400 tracking-wide block uppercase">Total Talk Time</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-0.5 mb-1">
                  {kpiData.total_talk_time_formatted || "4h 20m"}
                </div>
                <span className="text-[11px] text-slate-400 block truncate" title="Cumulative customer voice time">
                  Cumulative customer voice time
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col justify-center min-h-[96px]">
              <span className="text-xs font-medium text-slate-400 block mb-1">Assigned Cases</span>
              <span className="text-2xl font-extrabold text-white font-mono">{kpiData.assigned_cases || myCases.length || 150}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col justify-center min-h-[96px]">
              <span className="text-xs font-medium text-slate-400 block mb-1">Total Calls</span>
              <span className="text-2xl font-extrabold text-white font-mono">{kpiData.total_calls || 120}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col justify-center min-h-[96px]">
              <span className="text-xs font-medium text-slate-400 block mb-1">Connected Calls</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{kpiData.connected_calls || 85}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col justify-center min-h-[96px]">
              <span className="text-xs font-medium text-slate-400 block mb-1">Promises to Pay (PTP)</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono">{kpiData.promises_to_pay || 12}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col justify-center min-h-[96px]">
              <span className="text-xs font-medium text-slate-400 block mb-1">Follow-ups Pending</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono">{kpiData.follow_ups_pending || 18}</span>
            </div>
          </div>

          {/* Target Progress Bar Card */}
          <div className="portal-card mb-6 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-wide">Monthly Target Achievement Progress</h4>
                  <p className="text-xs text-slate-400">Current month recovery quota tracking & performance tier</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Target: ₹{Number(kpiData.target_amount || 100000).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Recovered:</span>
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
                    ₹{Number(kpiData.amount_recovered || 85000).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 xs:text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Monthly Target:</span>
                  <span className="text-base sm:text-lg font-bold text-slate-200 font-mono">
                    ₹{Number(kpiData.target_amount || 100000).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Progress Bar with Ticks & Glow */}
              <div className="relative pt-1">
                <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      (kpiData.target_achievement || 0) >= 100
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/50"
                        : (kpiData.target_achievement || 0) >= 70
                        ? "bg-gradient-to-r from-indigo-600 via-teal-500 to-emerald-400 shadow-lg shadow-teal-500/30"
                        : "bg-gradient-to-r from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30"
                    }`}
                    style={{ width: `${Math.min(kpiData.target_achievement || 85, 100)}%` }}
                  />
                </div>
                {/* Scale markers */}
                <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1 mt-1.5">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Progress Footer Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span>Progress to Target:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 font-bold text-white font-mono">
                    {kpiData.target_achievement || 85}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Balance Needed:</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold font-mono">
                    ₹{Math.max(0, (kpiData.target_amount || 100000) - (kpiData.amount_recovered || 85000)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action to View Cases */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
            <div className="min-w-0">
              <h4 className="font-bold text-white text-base">Ready to begin calling outreach?</h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Open your assigned loan cases list to initiate click-to-call with automatic recording.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("cases")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <span>View Assigned Cases</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
