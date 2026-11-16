import React from "react";

export const STATUS_DOT_COLORS = {
  "ALL": "bg-[#315CFF] shadow-[0_0_8px_rgba(49,92,255,0.7)]",
  "New": "bg-[#06C7E8] shadow-[0_0_8px_rgba(6,199,232,0.7)]",
  "Assigned": "bg-[#5945F5] shadow-[0_0_8px_rgba(89,69,245,0.7)]",
  "Contacted": "bg-[#315CFF] shadow-[0_0_8px_rgba(49,92,255,0.7)]",
  "Promise to Pay": "bg-[#FFB800] shadow-[0_0_8px_rgba(255,184,0,0.7)]",
  "Partially Paid": "bg-[#FF8A00] shadow-[0_0_8px_rgba(255,138,0,0.7)]",
  "Fully Paid": "bg-[#00C995] shadow-[0_0_8px_rgba(0,201,149,0.7)]",
  "Disputed": "bg-[#FF527A] shadow-[0_0_8px_rgba(255,82,122,0.7)]",
  "Not Reachable": "bg-[#9AAAC2] shadow-[0_0_8px_rgba(154,170,194,0.5)]",
  "Field Visit": "bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.7)]",
  "Closed": "bg-[#64748B] shadow-[0_0_8px_rgba(100,116,139,0.5)]"
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
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#08132D] border border-[#263957] rounded-2xl shadow-xl scrollbar-none no-scrollbar touch-pan-x">
        {/* All Cases Tab */}
        <button
          type="button"
          onClick={() => setCaseFilterStatus("ALL")}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            caseFilterStatus === "ALL"
              ? "bg-gradient-to-r from-[#315CFF] to-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#315CFF]/30 ring-1 ring-[#315CFF]/50"
              : "bg-[#0B1733] hover:bg-[#14223A] text-[#9AAAC2] hover:text-[#F4F7FF] border border-[#263957]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS["ALL"]}`} />
          <span>All Cases</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              caseFilterStatus === "ALL"
                ? "bg-white/20 text-[#F4F7FF]"
                : "bg-[#14223A] text-[#9AAAC2] border border-[#263957]"
            }`}
          >
            {totalCasesCount}
          </span>
        </button>

        {/* 10 Lifecycle Status Tabs */}
        {CASE_STATUSES.map((st) => {
          const count = adminOverview?.cases_by_status?.[st];
          const dotClass = STATUS_DOT_COLORS[st] || "bg-[#9AAAC2]";
          const isActive = caseFilterStatus === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setCaseFilterStatus(st)}
              className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#315CFF] to-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#315CFF]/30 ring-1 ring-[#315CFF]/50"
                  : "bg-[#0B1733] hover:bg-[#14223A] text-[#9AAAC2] hover:text-[#F4F7FF] border border-[#263957]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              <span>{st}</span>
              {count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-[#F4F7FF]"
                      : "bg-[#14223A] text-[#9AAAC2] border border-[#263957]"
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
