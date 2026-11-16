import React from "react";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";

export default function CaseAuditFeed({
  recentStatusHistory = [],
  casesList = [],
  setSelectedCaseId,
  setShowCaseDetailModal
}) {
  return (
    <div className="case-audit-box p-4 sm:p-5 rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5945F5]/40 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-[#5945F5] shrink-0 shadow-inner">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#F4F7FF] text-sm tracking-tight truncate">
              Audit Trail &amp; Activity
            </h4>
            <span className="text-[10px] text-[#9AAAC2]">Case event &amp; transition stream</span>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#315CFF]/15 text-[#315CFF] border border-[#315CFF]/30 shrink-0 shadow-sm">
          AUDIT STREAM
        </span>
      </div>

      <p className="text-[11px] text-[#9AAAC2] mb-3.5 pb-2 leading-relaxed border-b border-[#263957]/70">
        Captures every status transition, employee allocation, target modification, and debt resolution milestone.
      </p>

      {/* Activity Feed List */}
      <div className="space-y-2.5 max-h-[500px] sm:max-h-[560px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#263957]">
        {recentStatusHistory.length === 0 ? (
          <div className="py-8 text-center text-[#9AAAC2] text-xs italic">
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
              className="p-3 sm:p-3.5 rounded-xl bg-[#14223A] hover:bg-[#1b2e4f] border border-[#263957] text-xs space-y-1.5 transition-all duration-200 shadow-sm hover:border-[#315CFF]/50 cursor-pointer"
              title="Click to view full case history timeline"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-mono font-bold text-[#315CFF] bg-[#315CFF]/15 px-2 py-0.5 rounded-md border border-[#315CFF]/30 text-[10.5px]">
                  {act.case_number}
                </span>
                <span className="text-[10px] text-[#9AAAC2] font-mono shrink-0 bg-[#08132D] px-1.5 py-0.5 rounded border border-[#263957]">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-medium text-[#F4F7FF] flex-wrap py-0.5">
                <span className="truncate font-semibold text-[#F4F7FF]">{act.customer_name}</span>
                <span className="text-[#263957]">&bull;</span>
                <span className="text-[11px] text-[#9AAAC2] font-medium break-words flex items-center gap-1">
                  <span>{act.previous_status}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#315CFF]" />
                  <span className="text-[#F4F7FF] font-semibold">{act.new_status}</span>
                </span>
              </div>

              <p className="text-[11px] text-[#F4F7FF]/90 leading-snug break-words bg-[#08132D] p-2 rounded-lg border border-[#263957] italic font-sans">
                "{act.remarks || "Status transition recorded."}"
              </p>

              <div className="pt-1.5 mt-1.5 flex items-center justify-between gap-1 text-[10px] text-[#9AAAC2] border-t border-[#263957]/60 flex-wrap">
                <span className="truncate">
                  By: <strong className="text-[#F4F7FF]">{act.employee_name || act.employee_id}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[#00C995] shrink-0 font-medium bg-[#00C995]/10 px-1.5 py-0.5 rounded border border-[#00C995]/20">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>RECORDED</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3.5 mt-3 border-t border-[#263957] text-center">
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
          className="text-xs text-[#315CFF] hover:text-[#F4F7FF] font-semibold transition cursor-pointer"
        >
          View Detailed Audit Records &rarr;
        </button>
      </div>
    </div>
  );
}
