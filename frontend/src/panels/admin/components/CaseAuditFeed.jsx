import React from "react";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";

export default function CaseAuditFeed({
  recentStatusHistory = [],
  casesList = [],
  setSelectedCaseId,
  setShowCaseDetailModal
}) {
  return (
    <div className="portal-card case-audit-box p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] shadow-2xl relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3.5 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm tracking-tight truncate">
              Audit Trail &amp; Activity
            </h4>
            <span className="text-[10px] text-slate-400">Live immutable case event stream</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE AUDIT</span>
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mb-4 pb-2 leading-relaxed border-b border-slate-800/80">
        Captures every status transition, employee allocation, target modification, and debt resolution milestone.
      </p>

      {/* Activity Feed List */}
      <div className="space-y-3 max-h-[500px] sm:max-h-[560px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {recentStatusHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No recent activity recorded.
          </div>
        ) : (
          recentStatusHistory.map((act, idx) => (
            <div
              key={act.id || idx}
              onClick={() => {
                const targetId = act.case_id || (casesList.find(c => c.case_number === act.case_number)?.id);
                if (targetId) {
                  setSelectedCaseId(targetId);
                  setShowCaseDetailModal(true);
                }
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/60 text-xs space-y-2 transition-all duration-200 shadow-sm hover:border-indigo-500/40 cursor-pointer"
              title="Click to view full case history timeline"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-mono font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/25 text-[11px]">
                  {act.case_number}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-medium text-slate-200 flex-wrap py-0.5">
                <span className="truncate font-semibold text-white">{act.customer_name}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-[11px] text-indigo-300 font-semibold break-words flex items-center gap-1">
                  <span>{act.previous_status}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-indigo-400" />
                  <span className="text-white">{act.new_status}</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug break-words bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 italic font-sans">
                "{act.remarks || "Status transition recorded."}"
              </p>

              <div className="pt-2 mt-2 flex items-center justify-between gap-1 text-[10px] text-slate-400 border-t border-slate-700/50 flex-wrap">
                <span className="truncate">
                  By: <strong className="text-slate-300">{act.employee_name || act.employee_id}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-emerald-400 shrink-0 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>AUDIT VERIFIED</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={() => {
            if (casesList.length > 0) {
              const targetId = casesList[0].id || casesList[0].case_number;
              if (targetId) {
                setSelectedCaseId(targetId);
                setShowCaseDetailModal(true);
              }
            }
          }}
          className="inline-flex items-center justify-center gap-2 text-xs text-indigo-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 hover:border-indigo-500/50 transition-all shadow-sm w-full cursor-pointer"
        >
          <span>View Complete Case Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

