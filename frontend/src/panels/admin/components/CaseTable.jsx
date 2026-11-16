import React from "react";
import { Search, Layers, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";

export const getDpdBadge = (dpd) => {
  const num = Number(dpd || 0);
  if (num >= 90) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#FF527A]/15 text-[#FF527A] border border-[#FF527A]/30 whitespace-nowrap shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF527A]" />
        {num} DPD &bull; Critical
      </span>
    );
  }
  if (num >= 60) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 whitespace-nowrap shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
        {num} DPD &bull; High
      </span>
    );
  }
  if (num >= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-[#315CFF]/15 text-[#315CFF] border border-[#315CFF]/30 whitespace-nowrap">
        {num} DPD &bull; Standard
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-[#00C995]/15 text-[#00C995] border border-[#00C995]/30 whitespace-nowrap">
      {num} DPD &bull; Early
    </span>
  );
};

export default function CaseTable({
  casesList = [],
  casesLoading = false,
  casesPagination = { page: 1, limit: 15, totalCount: 0, totalPages: 1 },
  casePage = 1,
  setCasePage,
  loadCases,
  caseSearchTerm = "",
  setCaseSearchTerm,
  selectedCaseIds = [],
  handleToggleSelectAll,
  handleToggleSelectCase,
  CASE_STATUSES = [],
  STATUS_PILL_CLASSES = {},
  onStatusSelectChange,
  handleInlineAssign,
  employeesList = [],
  setSelectedCaseId,
  setShowCaseDetailModal
}) {
  const isAllCurrentPageSelected =
    casesList.length > 0 && casesList.every((c) => selectedCaseIds.includes(c.id));

  return (
    <div className="case-table-card relative w-full overflow-hidden rounded-2xl shadow-xl bg-[#0B1733] border border-[#263957]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#315CFF]/40 to-transparent pointer-events-none" />
      
      {/* Table Card Header & Search Controls */}
      <div className="p-4 sm:p-5 border-b border-[#263957] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#08132D]/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#14223A] border border-[#263957] text-[#315CFF] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-[#F4F7FF] text-sm sm:text-base tracking-tight">
              Customer Case Management &amp; Delinquent Accounts
            </h4>
          </div>
          <span className="text-[11px] text-[#9AAAC2] pl-9 block">
            Showing {casesList.length} accounts &bull; Rule-allocated &amp; tracked
          </span>
        </div>

        {/* Integrated Search Input Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#9AAAC2] pointer-events-none" />
          <input
            type="text"
            placeholder="Search borrower or loan account..."
            value={caseSearchTerm}
            onChange={(e) => {
              setCaseSearchTerm(e.target.value);
              if (loadCases) loadCases(1);
            }}
            className="w-full text-xs pl-10 pr-4 py-2 min-h-[38px] bg-[#14223A] border border-[#263957] rounded-xl text-[#F4F7FF] placeholder-[#9AAAC2]/70 focus:outline-none focus:border-[#315CFF] transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── DESKTOP TABLE VIEW ── */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="portal-table w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#263957] bg-[#08132D] text-[#9AAAC2] text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5 text-center w-10">
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-[#263957] bg-[#14223A] text-[#315CFF] focus:ring-0 focus:outline-none cursor-pointer w-3.5 h-3.5 accent-[#315CFF]"
                  title="Select all cases on this page"
                  aria-label="Select all cases on this page"
                />
              </th>
              <th className="py-3 px-3">Borrower Details</th>
              <th className="py-3 px-3 text-right">Priority Amount</th>
              <th className="py-3 px-3">Upcoming Task</th>
              <th className="py-3 px-3">Delinquency Stage</th>
              <th className="py-3 px-3">Status (Audit)</th>
              <th className="py-3 px-3">Assigned Caller</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263957]/50 font-sans">
            {casesLoading ? (
              // 5-Row Skeleton Loader
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-3 px-3.5 text-center">
                    <div className="w-3.5 h-3.5 bg-[#14223A] rounded mx-auto" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-[#14223A] rounded w-32 mb-1.5" />
                    <div className="h-2.5 bg-[#14223A] rounded w-24" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="h-3.5 bg-[#14223A] rounded w-20 ml-auto mb-1.5" />
                    <div className="h-2.5 bg-[#14223A] rounded w-16 ml-auto" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3 bg-[#14223A] rounded w-20" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 bg-[#14223A] rounded-full w-24" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-7 bg-[#14223A] rounded-lg w-28" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-7 bg-[#14223A] rounded-lg w-28" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="h-6 bg-[#14223A] rounded-lg w-16 mx-auto" />
                  </td>
                </tr>
              ))
            ) : casesList.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-14 text-center text-[#9AAAC2] text-xs">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <AlertCircle className="w-8 h-8 text-[#9AAAC2]/60" />
                    <span className="font-semibold text-[#F4F7FF] text-sm">No matching cases found</span>
                    <p className="text-[11px] text-[#9AAAC2]">
                      Try adjusting your status filter or search query to find delinquent accounts.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              casesList.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[#14223A]/80 transition-colors duration-150 ${
                    selectedCaseIds.includes(item.id) ? "bg-[#315CFF]/10" : ""
                  }`}
                >
                  <td className="py-3 px-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCaseIds.includes(item.id)}
                      onChange={() => handleToggleSelectCase(item.id)}
                      className="rounded border-[#263957] bg-[#14223A] text-[#315CFF] focus:ring-0 focus:outline-none cursor-pointer w-3.5 h-3.5 accent-[#315CFF]"
                      aria-label={`Select case ${item.case_number}`}
                    />
                  </td>
                  <td className="py-3 px-3 min-w-[170px]">
                    <div className="font-semibold text-[#F4F7FF] truncate max-w-[190px]">
                      {item.customer_name || item.customer_id}
                    </div>
                    <div className="text-[11px] text-[#9AAAC2] font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{item.case_number}</span>
                      <span className="text-[#263957]">&bull;</span>
                      <span className="text-[#9AAAC2]/80">{item.loan_account_no}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap min-w-[120px]">
                    <div className="font-mono text-[#FFB800] font-bold text-xs">
                      ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-[#9AAAC2] font-mono mt-0.5">
                      Orig: ₹{Number(item.principal_amount || 0).toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#F4F7FF] font-mono text-[11px] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#9AAAC2]" />
                      <span>{item.follow_up_date || "—"}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getDpdBadge(item.dpd)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap min-w-[130px]">
                    <select
                      value={item.status}
                      onChange={(e) => onStatusSelectChange(item.id, e.target.value)}
                      className="text-[11px] font-semibold px-2 py-1.5 min-h-[32px] rounded-lg cursor-pointer border border-[#263957] bg-[#14223A] text-[#F4F7FF]"
                      title="Change status with atomic audit entry"
                    >
                      {CASE_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-[#0B1733] text-[#F4F7FF]">
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap min-w-[140px]">
                    <select
                      value={item.assigned_employee_id || ""}
                      onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                      className="text-[11px] bg-[#14223A] border border-[#263957] rounded-lg px-2 py-1.5 min-h-[32px] text-[#F4F7FF] truncate max-w-[140px]"
                      title="Reassign to calling employee"
                    >
                      <option value="" className="bg-[#0B1733] text-[#9AAAC2]">Unassigned</option>
                      {employeesList.map((emp) => (
                        <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id} className="bg-[#0B1733] text-[#F4F7FF]">
                          {emp.fullName?.split(" ")[0]} ({emp.employeeId || emp.id})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = item.id || item.case_number;
                        if (targetId) {
                          setSelectedCaseId(targetId);
                          setShowCaseDetailModal(true);
                        }
                      }}
                      className="px-2.5 py-1 min-h-[28px] rounded-lg bg-[#14223A] hover:bg-[#315CFF]/20 text-[#315CFF] hover:text-[#F4F7FF] border border-[#263957] hover:border-[#315CFF]/50 text-[11px] font-semibold transition cursor-pointer"
                      title="View case timeline and details"
                    >
                      Timeline
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARD VIEW (< 640px) ── */}
      <div className="block sm:hidden divide-y divide-[#263957]/60 p-3 space-y-3">
        {casesLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={`mob-skeleton-${idx}`} className="p-3.5 rounded-xl bg-[#14223A] border border-[#263957] animate-pulse space-y-2">
              <div className="h-4 bg-[#0B1733] rounded w-3/4" />
              <div className="h-3 bg-[#0B1733] rounded w-1/2" />
              <div className="h-8 bg-[#0B1733] rounded w-full mt-2" />
            </div>
          ))
        ) : casesList.length === 0 ? (
          <div className="py-12 text-center text-[#9AAAC2] text-xs">
            No matching cases found.
          </div>
        ) : (
          casesList.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl bg-[#08132D] border border-[#263957] space-y-2.5 ${
                selectedCaseIds.includes(item.id) ? "bg-[#315CFF]/10 border-[#315CFF]/50" : ""
              }`}
            >
              {/* Top Row: Checkbox, Borrower Info & Amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedCaseIds.includes(item.id)}
                    onChange={() => handleToggleSelectCase(item.id)}
                    className="rounded border-[#263957] bg-[#14223A] text-[#315CFF] focus:ring-0 focus:outline-none cursor-pointer w-4 h-4 mt-0.5 accent-[#315CFF]"
                    aria-label={`Select case ${item.case_number}`}
                  />
                  <div className="min-w-0">
                    <h5 className="font-semibold text-[#F4F7FF] text-xs truncate">
                      {item.customer_name || item.customer_id}
                    </h5>
                    <span className="text-[10px] text-[#9AAAC2] font-mono block">
                      {item.case_number} &bull; {item.loan_account_no}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="font-mono text-[#FFB800] font-bold text-xs">
                    ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                  </div>
                  <div>
                    {getDpdBadge(item.dpd)}
                  </div>
                </div>
              </div>

              {/* Middle Row: Upcoming Task & Status Dropdown */}
              <div className="flex items-center justify-between gap-2.5 text-xs py-0.5">
                <div className="flex items-center gap-1.5 text-[#9AAAC2] text-[11px]">
                  <span>Task:</span>
                  <span className="text-[#F4F7FF] font-mono font-medium">{item.follow_up_date || "Today"}</span>
                </div>
                <div>
                  <select
                    value={item.status}
                    onChange={(e) => onStatusSelectChange(item.id, e.target.value)}
                    className="text-[11px] font-semibold px-2 py-1 min-h-[30px] rounded-lg cursor-pointer border border-[#263957] bg-[#14223A] text-[#F4F7FF]"
                    title="Change status with atomic audit entry"
                  >
                    {CASE_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-[#0B1733] text-[#F4F7FF]">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Row: Caller Assignment & Action Buttons */}
              <div className="pt-2.5 border-t border-[#263957]/60 flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-[10px] text-[#9AAAC2] shrink-0">Caller:</span>
                  <select
                    value={item.assigned_employee_id || ""}
                    onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                    className="text-[11px] bg-[#14223A] border border-[#263957] rounded-lg px-2 py-1 min-h-[30px] text-[#F4F7FF] truncate max-w-[130px]"
                    title="Reassign to calling employee"
                  >
                    <option value="" className="bg-[#0B1733] text-[#9AAAC2]">Unassigned</option>
                    {employeesList.map((emp) => (
                      <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id} className="bg-[#0B1733] text-[#F4F7FF]">
                        {emp.fullName?.split(" ")[0]} ({emp.employeeId || emp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = item.id || item.case_number;
                      if (targetId) {
                        setSelectedCaseId(targetId);
                        setShowCaseDetailModal(true);
                      }
                    }}
                    className="px-2.5 py-1 min-h-[30px] rounded-lg bg-[#14223A] hover:bg-[#315CFF]/20 text-[#315CFF] hover:text-[#F4F7FF] border border-[#263957] hover:border-[#315CFF]/50 text-[11px] font-semibold transition cursor-pointer"
                    title="View case timeline and details"
                  >
                    Timeline
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-t border-[#263957] bg-[#08132D]/80">
        <span className="text-xs text-[#9AAAC2] text-center sm:text-left">
          Showing {casesList.length > 0 ? (casePage - 1) * 15 + 1 : 0} to{" "}
          {Math.min(casePage * 15, casesPagination.totalCount)} of {casesPagination.totalCount} accounts
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={casePage <= 1}
            onClick={() => {
              const prev = casePage - 1;
              setCasePage(prev);
              if (loadCases) loadCases(prev);
            }}
            className="secondary-btn min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#315CFF]/50 cursor-pointer disabled:opacity-40"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3.5 py-1.5 text-xs text-[#F4F7FF] font-mono bg-[#14223A] border border-[#263957] rounded-xl min-h-[36px] flex items-center justify-center shadow-inner">
            {casePage} / {casesPagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={casePage >= (casesPagination.totalPages || 1)}
            onClick={() => {
              const next = casePage + 1;
              setCasePage(next);
              if (loadCases) loadCases(next);
            }}
            className="secondary-btn min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#315CFF]/50 cursor-pointer disabled:opacity-40"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
