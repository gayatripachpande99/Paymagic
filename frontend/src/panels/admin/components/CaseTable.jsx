import React from "react";
import { Search, Loader2, Layers, ChevronLeft, ChevronRight } from "lucide-react";

export const getDpdBadge = (dpd) => {
  const num = Number(dpd || 0);
  if (num >= 90) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        {num} DPD &bull; Critical
      </span>
    );
  }
  if (num >= 60) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {num} DPD &bull; High
      </span>
    );
  }
  if (num >= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
        {num} DPD &bull; Standard
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
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
  return (
    <div className="portal-card case-table-card table-card-wrapper relative w-full overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />
      
      {/* Table Card Header & Search Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
              Customer Case Management &amp; Delinquent Accounts
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 pl-9 block">
            Showing {casesList.length} accounts &bull; Rule-allocated &amp; tracked
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search borrower or loan account..."
            value={caseSearchTerm}
            onChange={(e) => {
              setCaseSearchTerm(e.target.value);
              if (loadCases) loadCases(1);
            }}
            className="w-full text-xs pl-10 pr-4 py-2.5 min-h-[42px] bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── DESKTOP TABLE VIEW (hidden on mobile, visible on sm/md+) ── */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="portal-table w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/90 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5 text-center w-10">
                <input
                  type="checkbox"
                  checked={casesList.length > 0 && selectedCaseIds.length === casesList.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:outline-none cursor-pointer w-3.5 h-3.5"
                  title="Select all cases on this page"
                />
              </th>
              <th className="py-3 px-3">Borrower Details</th>
              <th className="py-3 px-3 text-right">Priority Amount</th>
              <th className="py-3 px-3">Upcoming Task</th>
              <th className="py-3 px-3">Days Outstanding</th>
              <th className="py-3 px-3">Status (Audit)</th>
              <th className="py-3 px-3">Assigned Caller</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {casesLoading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <span>Loading delinquent portfolio cases...</span>
                  </div>
                </td>
              </tr>
            ) : casesList.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                  No matching cases found for criteria.
                </td>
              </tr>
            ) : (
              casesList.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-600/5 transition-colors duration-150 ${
                    selectedCaseIds.includes(item.id) ? "bg-indigo-950/25" : ""
                  }`}
                >
                  <td className="py-3 px-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCaseIds.includes(item.id)}
                      onChange={() => handleToggleSelectCase(item.id)}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:outline-none cursor-pointer w-3.5 h-3.5"
                    />
                  </td>
                  <td className="py-3 px-3 min-w-[170px]">
                    <div className="font-semibold text-slate-100 truncate max-w-[180px]">
                      {item.customer_name || item.customer_id}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{item.case_number}</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-500">{item.loan_account_no}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap min-w-[120px]">
                    <div className="font-mono text-amber-400 font-bold text-xs">
                      ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Orig: ₹{Number(item.principal_amount || 0).toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                    {item.follow_up_date || "—"}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getDpdBadge(item.dpd)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap min-w-[130px]">
                    <select
                      value={item.status}
                      onChange={(e) => onStatusSelectChange(item.id, e.target.value)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 min-h-[34px] rounded-lg cursor-pointer border ${
                        STATUS_PILL_CLASSES[item.status] || "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                      title="Change status with atomic audit entry"
                    >
                      {CASE_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-slate-900 text-white">
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap min-w-[140px]">
                    <select
                      value={item.assigned_employee_id || ""}
                      onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                      className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 min-h-[34px] text-slate-200 truncate max-w-[140px]"
                      title="Reassign to calling employee"
                    >
                      <option value="">Unassigned</option>
                      {employeesList.map((emp) => (
                        <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
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
                      className="px-2.5 py-1 min-h-[30px] rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
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

      {/* ── MOBILE CARD VIEW (visible on xs screens, hidden on sm+) ── */}
      <div className="block sm:hidden divide-y divide-slate-800/80 p-3 space-y-3">
        {casesLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading cases...</span>
          </div>
        ) : casesList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No matching cases found.
          </div>
        ) : (
          casesList.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 ${
                selectedCaseIds.includes(item.id) ? "bg-indigo-950/30 border-indigo-500/40" : ""
              }`}
            >
              {/* Top Row: Checkbox, Borrower Info & Amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedCaseIds.includes(item.id)}
                    onChange={() => handleToggleSelectCase(item.id)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:outline-none cursor-pointer w-4 h-4 mt-0.5"
                  />
                  <div className="min-w-0">
                    <h5 className="font-semibold text-white text-xs truncate">
                      {item.customer_name || item.customer_id}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {item.case_number} &bull; {item.loan_account_no}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="font-mono text-amber-400 font-bold text-xs">
                    ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                  </div>
                  <div>
                    {getDpdBadge(item.dpd)}
                  </div>
                </div>
              </div>

              {/* Middle Row: Upcoming Task & Status Dropdown */}
              <div className="flex items-center justify-between gap-2.5 text-xs py-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span>Task:</span>
                  <span className="text-slate-200 font-mono font-medium">{item.follow_up_date || "Today"}</span>
                </div>
                <div>
                  <select
                    value={item.status}
                    onChange={(e) => onStatusSelectChange(item.id, e.target.value)}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 min-h-[34px] rounded-lg cursor-pointer border ${
                      STATUS_PILL_CLASSES[item.status] || "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                    title="Change status with atomic audit entry"
                  >
                    {CASE_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-slate-900 text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Row: Caller Assignment & Action Buttons */}
              <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 shrink-0">Caller:</span>
                  <select
                    value={item.assigned_employee_id || ""}
                    onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 min-h-[34px] text-slate-200 truncate max-w-[130px] xs:max-w-[150px]"
                    title="Reassign to calling employee"
                  >
                    <option value="">Unassigned</option>
                    {employeesList.map((emp) => (
                      <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
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
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
                    title="View case timeline and details"
                  >
                    Timeline &amp; Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/40">
        <span className="text-xs text-slate-400 text-center sm:text-left">
          Showing {casesList.length > 0 ? (casePage - 1) * 15 + 1 : 0} to{" "}
          {Math.min(casePage * 15, casesPagination.totalCount)} of {casesPagination.totalCount} accounts
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={casePage <= 1}
            onClick={() => {
              const prev = casePage - 1;
              setCasePage(prev);
              if (loadCases) loadCases(prev);
            }}
            className="secondary-btn min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer disabled:opacity-40"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3.5 py-1.5 text-xs text-white font-mono bg-slate-800/90 border border-slate-700/60 rounded-xl min-h-[38px] flex items-center justify-center shadow-inner">
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
            className="secondary-btn min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer disabled:opacity-40"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
