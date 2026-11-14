import React from "react";

export const STATUS_DOT_COLORS = {
  "ALL": "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
  "New": "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]",
  "Assigned": "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]",
  "Contacted": "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
  "Promise to Pay": "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
  "Partially Paid": "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]",
  "Fully Paid": "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
  "Disputed": "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
  "Not Reachable": "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]",
  "Field Visit": "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
  "Closed": "bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.6)]"
};

export default function CaseStatusTabs({
  caseFilterStatus = "ALL",
  setCaseFilterStatus,
  CASE_STATUSES = [],
  adminOverview,
  totalCasesCount = 0
}) {
  return (
    <div className="case-status-tabs-box w-full max-w-full overflow-hidden my-3">
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-white/[0.08] rounded-2xl shadow-xl scrollbar-none no-scrollbar touch-pan-x">
        {/* All Cases Tab */}
        <button
          type="button"
          onClick={() => setCaseFilterStatus("ALL")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            caseFilterStatus === "ALL"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
              : "bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80 hover:border-slate-700/80"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS["ALL"]}`} />
          <span>All Cases</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              caseFilterStatus === "ALL"
                ? "bg-white/20 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {totalCasesCount}
          </span>
        </button>

        {/* 10 Lifecycle Status Tabs */}
        {CASE_STATUSES.map((st) => {
          const count = adminOverview?.cases_by_status?.[st];
          const dotClass = STATUS_DOT_COLORS[st] || "bg-slate-400";
          return (
            <button
              key={st}
              type="button"
              onClick={() => setCaseFilterStatus(st)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                caseFilterStatus === st
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
                  : "bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80 hover:border-slate-700/80"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              <span>{st}</span>
              {count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    caseFilterStatus === st
                      ? "bg-white/20 text-white"
                      : "bg-slate-800/90 text-slate-400 border border-slate-700/50"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

