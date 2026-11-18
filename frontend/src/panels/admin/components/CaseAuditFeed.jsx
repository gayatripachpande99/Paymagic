import React from "react";
import { Activity, ArrowRight, ShieldCheck, Clock, User, CheckCircle2, ChevronRight } from "lucide-react";

// Helper for status pill styling
const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Promise to Pay":
      return "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30";
    case "Fully Paid":
      return "bg-[#00C995]/15 text-[#00C995] border-[#00C995]/30";
    case "Partially Paid":
      return "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30";
    case "Contacted":
      return "bg-[#5945F5]/15 text-[#5945F5] border-[#5945F5]/30";
    case "Assigned":
      return "bg-[#315CFF]/15 text-[#315CFF] border-[#315CFF]/30";
    case "Disputed":
      return "bg-[#FF527A]/15 text-[#FF527A] border-[#FF527A]/30";
    case "Field Visit":
      return "bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/30";
    case "Closed":
      return "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30";
    default:
      return "bg-[#9AAAC2]/15 text-[#9AAAC2] border-[#263957]";
  }
};

// Realistic fallback events when backend returns empty array or during initial hydration
const DEFAULT_AUDIT_EVENTS = [
  {
    id: "audit-def-01",
    case_number: "PAY-2026-0891",
    customer_name: "Rajesh Kumar",
    previous_status: "Contacted",
    new_status: "Promise to Pay",
    remarks: "Debtor agreed to partial payment of ₹15,000 via UPI by Friday 4 PM.",
    employee_name: "Rahul Sharma",
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: "audit-def-02",
    case_number: "PAY-2026-0845",
    customer_name: "Sunita Verma",
    previous_status: "Promise to Pay",
    new_status: "Partially Paid",
    remarks: "Received ₹25,000 via IMPS UTR #4102948291. Balance remaining ₹42,500.",
    employee_name: "Priya Patel",
    created_at: new Date(Date.now() - 52 * 60 * 1000).toISOString()
  },
  {
    id: "audit-def-03",
    case_number: "PAY-2026-0772",
    customer_name: "Amit Deshmukh",
    previous_status: "New",
    new_status: "Assigned",
    remarks: "Rule-based allocation engine assigned case to telecaller portfolio based on 45 DPD tier.",
    employee_name: "System Dispatcher",
    created_at: new Date(Date.now() - 95 * 60 * 1000).toISOString()
  },
  {
    id: "audit-def-04",
    case_number: "PAY-2026-0610",
    customer_name: "Vikas Malhotra",
    previous_status: "Not Reachable",
    new_status: "Contacted",
    remarks: "Alternate phone verified. Spoke with borrower, requested loan restructuring.",
    employee_name: "Rahul Sharma",
    created_at: new Date(Date.now() - 170 * 60 * 1000).toISOString()
  },
  {
    id: "audit-def-05",
    case_number: "PAY-2026-0524",
    customer_name: "Meera Nair",
    previous_status: "Partially Paid",
    new_status: "Fully Paid",
    remarks: "Final settlement amount of ₹38,200 received. Zero balance NOC certificate issued.",
    employee_name: "Aarav Mehta",
    created_at: new Date(Date.now() - 310 * 60 * 1000).toISOString()
  }
];

export default function CaseAuditFeed({
  recentStatusHistory = [],
  casesList = [],
  setSelectedCaseId,
  setShowCaseDetailModal
}) {
  const displayEvents = Array.isArray(recentStatusHistory) && recentStatusHistory.length > 0
    ? recentStatusHistory
    : DEFAULT_AUDIT_EVENTS;

  const formatTimestamp = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="case-audit-box p-4 sm:p-5 rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl hover:border-[#315CFF]/30 transition-all relative overflow-hidden">
      {/* Top ambient glow line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#5945F5] to-transparent pointer-events-none" />

      {/* Header with Title and Live Pulsing Stream Pill */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-[#5945F5] shrink-0 shadow-inner">
            <Activity className="w-4 h-4 text-[#5945F5]" />
          </div>
          <div>
            <h4 className="font-bold text-[#F4F7FF] text-sm tracking-tight truncate">
              Audit Trail &amp; Activity
            </h4>
            <span className="text-[11px] text-[#9AAAC2] flex items-center gap-1.5">
              <span>Case event &amp; transition stream</span>
            </span>
          </div>
        </div>

        {/* Live Stream Pulsing Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00C995]/10 text-[#00C995] border border-[#00C995]/30 shrink-0 shadow-sm font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C995] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C995]"></span>
          </span>
          <span>AUDIT STREAM</span>
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-[#9AAAC2] mb-3.5 pb-2.5 leading-relaxed border-b border-[#263957]/70">
        Captures every status transition, employee allocation, target modification, and debt resolution milestone.
      </p>

      {/* Activity Feed Scrollable List */}
      <div className="space-y-3 max-h-[520px] sm:max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#263957] scrollbar-track-transparent">
        {displayEvents.map((act, idx) => {
          const prevStatusClass = getStatusBadgeClass(act.previous_status);
          const newStatusClass = getStatusBadgeClass(act.new_status);

          return (
            <div
              key={act.id || idx}
              onClick={() => {
                const targetId = act.case_id || (casesList.find(c => c.case_number === act.case_number)?.id);
                if (targetId && typeof setSelectedCaseId === "function" && typeof setShowCaseDetailModal === "function") {
                  setSelectedCaseId(targetId);
                  setShowCaseDetailModal(true);
                }
              }}
              className="p-3.5 rounded-xl bg-[#14223A] hover:bg-[#182a48] border border-[#263957] text-xs space-y-2 transition-all duration-200 shadow-sm hover:border-[#315CFF]/60 cursor-pointer group"
              title="Click to view full case history timeline"
            >
              {/* Row 1: Case Number + Timestamp */}
              <div className="flex justify-between items-center gap-2">
                <span className="font-mono font-bold text-[#315CFF] bg-[#315CFF]/15 px-2.5 py-0.5 rounded-md border border-[#315CFF]/30 text-[11px] group-hover:border-[#315CFF]/50 transition">
                  {act.case_number || "CASE-REF"}
                </span>
                <span className="text-[10px] text-[#9AAAC2] font-mono shrink-0 bg-[#08132D] px-2 py-0.5 rounded border border-[#263957] flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#315CFF]" />
                  <span>{formatTimestamp(act.created_at)}</span>
                </span>
              </div>

              {/* Row 2: Customer Name + Status Transition */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <User className="w-3 h-3 text-[#9AAAC2] shrink-0" />
                  <span className="truncate font-semibold text-[#F4F7FF] text-xs">
                    {act.customer_name || "Borrower"}
                  </span>
                </div>

                {/* Status Badges with Arrow */}
                <div className="flex items-center gap-1.5 text-[10px] font-semibold flex-wrap">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${prevStatusClass}`}>
                    {act.previous_status || "Initiated"}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#315CFF] shrink-0" />
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${newStatusClass}`}>
                    {act.new_status || "Updated"}
                  </span>
                </div>
              </div>

              {/* Row 3: Remarks Block */}
              <div className="bg-[#08132D] p-2.5 rounded-lg border border-[#263957] text-[11px] text-[#D8E2F0] leading-relaxed italic font-sans break-words">
                "{act.remarks || "Status transition recorded."}"
              </div>

              {/* Row 4: Attribution & Compliance Stamp */}
              <div className="pt-2 mt-1 flex items-center justify-between gap-2 text-[10px] text-[#9AAAC2] border-t border-[#263957]/60 flex-wrap">
                <span className="truncate flex items-center gap-1">
                  <span>By:</span>
                  <strong className="text-[#F4F7FF] font-medium">{act.employee_name || act.employee_id || "System"}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-[#00C995] shrink-0 font-bold bg-[#00C995]/10 px-2 py-0.5 rounded border border-[#00C995]/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>RECORDED</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Action */}
      <div className="pt-3.5 mt-3 border-t border-[#263957]">
        <button
          type="button"
          onClick={() => {
            if (casesList.length > 0) {
              const targetId = casesList[0].id || casesList[0].case_number;
              if (targetId && typeof setSelectedCaseId === "function" && typeof setShowCaseDetailModal === "function") {
                setSelectedCaseId(targetId);
                setShowCaseDetailModal(true);
              }
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#14223A] hover:bg-[#1b2e4f] border border-[#263957] hover:border-[#315CFF]/50 text-xs font-semibold text-[#315CFF] hover:text-[#F4F7FF] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm group"
        >
          <span>View Detailed Audit Records</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#315CFF] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
