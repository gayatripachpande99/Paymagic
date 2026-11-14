import React from "react";
import { Wallet, PieChart, AlertTriangle, Users } from "lucide-react";

export default function CaseKpiDashboard({
  totalOutstanding = 0,
  standardDue = 0,
  criticalOverdue = 0,
  standardPct = 0,
  criticalPct = 0,
  totalCasesCount = 0,
  donutSegments = [],
  adminOverview,
  criticalCount = 0,
  followUpsDueCount = 0,
  disputesTotal = 0,
  recoveryRate = 0,
  displaySpecialists = [],
  avgHandlingTime = "—",
  connectionRate = 0
}) {
  return (
    <div className="case-kpi-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 w-full">
      {/* ── CARD A: OUTSTANDING AMOUNT & ARREARS RATIO ── */}
      <div className="case-kpi-card xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[220px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
                Total Outstanding
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 whitespace-nowrap shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              LIVE PORTFOLIO
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight break-words flex items-baseline gap-1">
              <span className="text-amber-400 font-sans font-bold text-xl sm:text-2xl">₹</span>
              <span>{Number(totalOutstanding).toLocaleString("en-IN")}</span>
              <span className="text-slate-500 text-sm font-normal">.00</span>
            </div>
          </div>

          {/* Visual Segmented Progress Ratio Bar */}
          <div className="mt-3 mb-2.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Standard Due ({standardPct}%)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Critical Overdue ({criticalPct}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800/80 p-0.5 overflow-hidden flex border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-l-full transition-all duration-500"
                style={{ width: `${standardPct}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-r-full transition-all duration-500"
                style={{ width: `${criticalPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-3.5 mt-auto border-t border-slate-800/90 space-y-2 text-xs">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Due (Standard Arrears):
            </span>
            <span className="font-mono text-slate-200 font-semibold text-right">
              ₹{Number(standardDue).toLocaleString("en-IN")}.00
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Overdue (Critical Delinquency):
            </span>
            <span className="font-mono text-rose-400 font-bold text-right">
              ₹{Number(criticalOverdue).toLocaleString("en-IN")}.00
            </span>
          </div>
          <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">Accounts Managed:</span>
            <span className="font-mono text-indigo-400 font-bold text-right px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              {totalCasesCount} Accounts
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD B: ACCOUNTS STATUS DONUT CHART & DISTRIBUTION ── */}
      <div className="case-kpi-card xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[220px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase truncate">
                Status Distribution
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
              10 Statuses
            </span>
          </div>

          {/* Modern Dynamic Donut Chart & Legend */}
          <div className="flex flex-row items-center justify-between gap-3 py-2">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="10" />
                {donutSegments.length > 0 ? (
                  donutSegments.map((seg) => (
                    <circle
                      key={seg.status}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={seg.stroke}
                      strokeWidth="10"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      strokeLinecap="round"
                    />
                  ))
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeDasharray="238.8 0"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-white leading-none font-mono">
                  {totalCasesCount}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold tracking-wider mt-1 uppercase">
                  Accounts
                </span>
              </div>
            </div>

            {/* Status Legend Grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-300 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                <span className="truncate">Assigned ({adminOverview?.cases_by_status?.Assigned ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                <span className="truncate">Contacted ({adminOverview?.cases_by_status?.Contacted ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                <span className="truncate">PTP ({adminOverview?.cases_by_status?.["Promise to Pay"] ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span className="truncate">Paid ({adminOverview?.cases_by_status?.["Fully Paid"] ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
                <span className="truncate">Disputed ({adminOverview?.cases_by_status?.Disputed ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                <span className="truncate">Field ({adminOverview?.cases_by_status?.["Field Visit"] ?? 0})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2.5 mt-auto border-t border-slate-800 text-[11px] text-slate-400 flex justify-between gap-1">
          <span>New: <strong className="text-cyan-400 font-mono">{adminOverview?.cases_by_status?.New ?? 0}</strong></span>
          <span>Partial: <strong className="text-orange-400 font-mono">{adminOverview?.cases_by_status?.["Partially Paid"] ?? 0}</strong></span>
          <span>Unreachable: <strong className="text-slate-400 font-mono">{adminOverview?.cases_by_status?.["Not Reachable"] ?? 0}</strong></span>
        </div>
      </div>

      {/* ── CARD C: OPERATIONAL PRIORITIES & ACTION QUEUE ── */}
      <div className="case-kpi-card xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[220px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-inner shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
                Operational Priorities
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              ACTION QUEUE
            </span>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5 my-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-center flex flex-col justify-center shadow-sm">
              <span className="text-[10px] text-rose-300 font-semibold block truncate">
                Critical
              </span>
              <span className="font-black text-xl font-mono text-rose-400 mt-0.5">{criticalCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-center flex flex-col justify-center shadow-sm">
              <span className="text-[10px] text-indigo-300 font-semibold block truncate">
                Follow-ups
              </span>
              <span className="font-black text-xl font-mono text-indigo-400 mt-0.5">{followUpsDueCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center flex flex-col justify-center shadow-sm">
              <span className="text-[10px] text-amber-300 font-semibold block truncate">
                Disputes
              </span>
              <span className="font-black text-xl font-mono text-amber-400 mt-0.5">{disputesTotal}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-auto border-t border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Follow-ups due today:</span>
            <span className="text-white font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              {followUpsDueCount} cases
            </span>
          </div>
          <div>
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span>Resolution SLA target:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {recoveryRate > 0 ? `${recoveryRate}%` : "94.2% on-time"}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${recoveryRate > 0 ? Math.min(100, recoveryRate) : 94.2}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD D: ACTIVE CALLING SPECIALISTS & WORKLOAD ── */}
      <div className="case-kpi-card xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[220px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
                Calling Specialists
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>

          {/* Specialist Avatars */}
          <div className="grid grid-cols-4 gap-2 py-1 my-1">
            {(displaySpecialists.length > 0 ? displaySpecialists : [
              { id: "emp_1", fullName: "Rahul Sharma", active_cases_count: 0 },
              { id: "emp_2", fullName: "Priya Patel", active_cases_count: 0 },
              { id: "emp_3", fullName: "Vikram Singh", active_cases_count: 0 }
            ]).map((emp) => (
              <div
                key={emp.employeeId || emp.id}
                className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/90 transition-all group/emp"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-[11px] flex items-center justify-center border border-slate-700 shadow-md group-hover/emp:scale-105 transition-transform">
                  {emp.fullName?.slice(0, 2).toUpperCase() || "SP"}
                </div>
                <span className="text-[10px] text-slate-200 font-medium truncate w-full mt-1.5" title={emp.fullName}>
                  {emp.fullName?.split(" ")[0]}
                </span>
                <span className="text-[9px] text-indigo-400 font-mono font-semibold">
                  {emp.active_cases_count ?? 0} accts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 mt-auto border-t border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Avg Handling Time:</span>
            <span className="text-indigo-400 font-mono font-semibold">{avgHandlingTime}</span>
          </div>
          <div>
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span>Team Connection Rate:</span>
              <span className="text-emerald-400 font-mono font-bold">{connectionRate}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, connectionRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
