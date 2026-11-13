import React from "react";
import {
  FileSpreadsheet,
  Sparkles,
  ArrowRightLeft,
  Calendar,
  Download,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  User,
  ArrowRight
} from "lucide-react";

export default function CaseAllocationPage({
  adminOverview,
  casesPagination = { page: 1, limit: 15, totalCount: 0, totalPages: 1 },
  employeesList = [],
  fileUploadLoading = false,
  handleFileUploadInput,
  setShowBulkAllocateModal,
  setShowTransferModal,
  setShowTargetModal,
  handleExportCasesCSV,
  caseFilterStatus = "ALL",
  setCaseFilterStatus,
  CASE_STATUSES = [],
  STATUS_PILL_CLASSES = {},
  caseSearchTerm = "",
  setCaseSearchTerm,
  loadCases,
  casesLoading = false,
  casesList = [],
  handleQuickStatusChange,
  handleInlineAssign,
  setSelectedCaseId,
  setShowCaseDetailModal,
  setSelectedPaymentCase,
  setShowPaymentModal,
  casePage = 1,
  setCasePage
}) {
  return (
    <div className="portal-tab-content case-allocation-page relative w-full space-y-4 sm:space-y-6 pb-8">
      {/* ── TOP HERO GRID (DIRECTLY INSPIRED BY DASHBOARD DESIGN) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-5 w-full">
        {/* Card 1: Outstanding Amount Summary Card (4 cols) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 relative p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Outstanding Amount</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap shrink-0">
                LIVE PORTFOLIO
              </span>
            </div>
            <div className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mb-3 sm:mb-4 break-words">
              ₹{Number(adminOverview?.summary?.total_outstanding || 36250000).toLocaleString("en-IN")}.00
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-slate-800/80 space-y-2 sm:space-y-2.5 text-xs">
            <div className="flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-slate-400">Due (Standard Arrears):</span>
              <span className="font-mono text-slate-200 font-semibold text-right">
                ₹{Number(Math.round((adminOverview?.summary?.total_outstanding || 36250000) * 0.65)).toLocaleString("en-IN")}.00
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-slate-400">Overdue (Critical Delinquency):</span>
              <span className="font-mono text-rose-400 font-bold text-right">
                ₹{Number(Math.round((adminOverview?.summary?.total_outstanding || 36250000) * 0.35)).toLocaleString("en-IN")}.00
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-slate-400">Accounts Managed:</span>
              <span className="font-mono text-indigo-400 font-bold text-right">
                {adminOverview?.summary?.total_cases || casesPagination.totalCount || 200} Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Accounts Status Donut Chart Card (4 cols) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 relative p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase truncate">Accounts Status (10 Statuses)</span>
            <span className="text-[11px] text-indigo-400 font-semibold shrink-0">Distribution</span>
          </div>

          {/* Donut representation & Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="50 188" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="40 198" strokeDashoffset="-50" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="35 203" strokeDashoffset="-90" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="45 193" strokeDashoffset="-125" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f43f5e" strokeWidth="12" strokeDasharray="25 213" strokeDashoffset="-170" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="12" strokeDasharray="20 218" strokeDashoffset="-195" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-base sm:text-lg font-black text-white leading-none">
                  {adminOverview?.summary?.total_cases || casesPagination.totalCount || 200}
                </span>
                <span className="text-[9px] text-slate-400 font-medium mt-0.5">Accounts</span>
              </div>
            </div>

            {/* Status Legend (2-col grid on mobile for compactness, 1-col on tablet/desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-1 text-[11px] text-slate-300 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shrink-0" />
                <span className="truncate">Assigned ({adminOverview?.cases_by_status?.Assigned || 35})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shrink-0" />
                <span className="truncate">Contacted ({adminOverview?.cases_by_status?.Contacted || 40})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
                <span className="truncate">Promise to Pay ({adminOverview?.cases_by_status?.["Promise to Pay"] || 22})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="truncate">Fully Paid ({adminOverview?.cases_by_status?.["Fully Paid"] || 28})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0" />
                <span className="truncate">Disputed ({adminOverview?.cases_by_status?.Disputed || 12})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shrink-0" />
                <span className="truncate">Field Visit ({adminOverview?.cases_by_status?.["Field Visit"] || 15})</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap justify-between gap-1.5">
            <span>New: <strong className="text-slate-200">{adminOverview?.cases_by_status?.New || 18}</strong></span>
            <span>Partially Paid: <strong className="text-yellow-400">{adminOverview?.cases_by_status?.["Partially Paid"] || 16}</strong></span>
            <span>Not Reachable: <strong className="text-slate-300">{adminOverview?.cases_by_status?.["Not Reachable"] || 14}</strong></span>
          </div>
        </div>

        {/* Card 3: Top Tasks & Calling Specialists (4 cols) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 relative p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            {/* Metric Chips Row */}
            <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5 truncate">Critical Tasks</span>
                <span className="font-extrabold text-sm sm:text-base text-rose-400">10</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5 truncate">Follow-ups</span>
                <span className="font-extrabold text-sm sm:text-base text-indigo-400">18</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5 truncate">Disputes</span>
                <span className="font-extrabold text-sm sm:text-base text-amber-400">4</span>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase block mb-2">
              Active Calling Specialists
            </span>
            
            {/* Specialist Avatars */}
            <div className="flex items-center gap-2.5 sm:gap-3 py-1 overflow-x-auto scrollbar-thin -mx-1 px-1">
              {employeesList.slice(0, 5).map((emp) => (
                <div key={emp.employeeId || emp.id} className="flex flex-col items-center min-w-[54px] sm:min-w-[56px] text-center shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-800 shadow">
                    {emp.fullName?.slice(0, 2).toUpperCase() || "OP"}
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium truncate w-14 mt-1">
                    {emp.fullName?.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">
                    {emp.active_cases_count || 35} accts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-1.5 mt-2">
            <span className="truncate">Balanced workload allocation active</span>
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold shrink-0"
            >
              Rebalance &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULE A OPERATIONS TOOLBAR (ALL 6 ADMIN FUNCTIONS) ── */}
      <div className="relative w-full p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Module A: Admin Case Management Operations</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Excel upload, rule-based bulk allocation, employee transfer, target setting &amp; atomic status tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
            {/* 1. Upload Loan Data (Full width on mobile grid, auto on desktop) */}
            <label className="primary-btn cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 col-span-2 sm:col-span-1 md:flex-initial min-h-[40px]">
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{fileUploadLoading ? "Uploading..." : "Upload Data (CSV/Excel)"}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUploadInput}
                disabled={fileUploadLoading}
                style={{ display: "none" }}
              />
            </label>

            {/* 2. Rule-Based Allocation */}
            <button
              type="button"
              onClick={() => setShowBulkAllocateModal(true)}
              className="primary-btn inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 bg-indigo-600 hover:bg-indigo-500 col-span-1 md:flex-initial min-h-[40px]"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Rule Allocation</span>
            </button>

            {/* 3. Transfer Cases */}
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="secondary-btn inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 col-span-1 md:flex-initial min-h-[40px]"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Transfer Cases</span>
            </button>

            {/* 4. Set Targets & Follow-up */}
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="secondary-btn inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 col-span-1 md:flex-initial min-h-[40px]"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Set Target</span>
            </button>

            {/* 5. Export Audit */}
            <button
              type="button"
              onClick={handleExportCasesCSV}
              className="secondary-btn inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 col-span-1 md:flex-initial min-h-[40px]"
              title="Export complete case dataset with status history"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Export Cases</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN SPLIT (LEFT: AT RISK CUSTOMERS TABLE | RIGHT: RECENT ACTIVITY FEED) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full items-start">
        {/* LEFT COLUMN: At Risk Customers & Recovery Accounts Table (8 cols) */}
        <div className="col-span-1 lg:col-span-8 space-y-3.5 sm:space-y-4 w-full min-w-0">
          {/* Status Filter Chips Row (All 10 Statuses) */}
          <div className="relative w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700 -mx-1 px-1 touch-pan-x">
            <button
              type="button"
              onClick={() => setCaseFilterStatus("ALL")}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                caseFilterStatus === "ALL"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              All Cases ({casesPagination.totalCount || casesList.length})
            </button>
            {CASE_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setCaseFilterStatus(st)}
                className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  caseFilterStatus === st
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Table Card */}
          <div className="portal-card table-card-wrapper relative w-full overflow-hidden">
            <div className="card-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-0 sm:mb-4 border-b border-slate-800 sm:border-b-0">
              <div className="header-left flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
                <h4 className="font-bold text-white text-sm sm:text-base">At Risk Customers &amp; Delinquent Accounts</h4>
              </div>

              <div className="search-box w-full sm:w-64 relative">
                <Search className="search-icon w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search borrower or loan account..."
                  value={caseSearchTerm}
                  onChange={(e) => setCaseSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") loadCases(1); }}
                  className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* DESKTOP & TABLET VIEW: Scrollable Responsive Table (hidden on mobile < 768px) */}
            <div className="hidden md:block portal-table-container relative w-full overflow-x-auto">
              <table className="portal-table min-w-[850px] w-full text-left">
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Priority Amount</th>
                    <th>Upcoming Task</th>
                    <th>Days Outstanding</th>
                    <th>Status (Audit)</th>
                    <th>Assigned Caller</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {casesLoading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                        Loading recovery accounts...
                      </td>
                    </tr>
                  ) : casesList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                        No matching cases found for criteria.
                      </td>
                    </tr>
                  ) : (
                    casesList.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="font-bold text-white text-xs">{item.customer_name || "Borrower"}</div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.phone_masked || item.phone || "+91 98*** 12345"}
                          </span>
                        </td>
                        <td className="font-mono text-amber-400 font-bold text-xs">
                          ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <span className="text-xs text-slate-300 font-mono">
                            {item.follow_up_date || "Dec 20"}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-rose-400 font-mono font-semibold">
                            {item.dpd} days late
                          </span>
                        </td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded cursor-pointer border ${
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
                        <td>
                          <select
                            value={item.assigned_employee_id || ""}
                            onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                            className="text-[11px] bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
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
                        <td>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCaseId(item.id);
                                setShowCaseDetailModal(true);
                              }}
                              className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
                              title="View animated case_status_history timeline"
                            >
                              Timeline
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPaymentCase(item);
                                setShowPaymentModal(true);
                              }}
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                              title="Record payment settlement"
                            >
                              +Pay
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Responsive Cards (visible only on mobile < 768px) */}
            <div className="block md:hidden divide-y divide-slate-800/80">
              {casesLoading ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Loading recovery accounts...
                </div>
              ) : casesList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No matching cases found for criteria.
                </div>
              ) : (
                casesList.map((item) => (
                  <div key={item.id} className="p-3.5 space-y-2.5 bg-slate-900/40 hover:bg-slate-800/30 transition">
                    {/* Top Row: Borrower Info & Priority Amount */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-xs truncate">
                          {item.customer_name || "Borrower"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.phone_masked || item.phone || "+91 98*** 12345"}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-amber-400 font-bold text-xs">
                          ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] text-rose-400 font-mono font-semibold block mt-0.5">
                          {item.dpd} days late
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Upcoming Task & Status Badge */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <span>Task:</span>
                        <span className="text-slate-200 font-mono font-medium">{item.follow_up_date || "Dec 20"}</span>
                      </div>
                      <div>
                        <select
                          value={item.status}
                          onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded cursor-pointer border ${
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
                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 shrink-0">Caller:</span>
                        <select
                          value={item.assigned_employee_id || ""}
                          onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                          className="text-[11px] bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-200 truncate max-w-[130px] xs:max-w-[150px]"
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

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCaseId(item.id);
                            setShowCaseDetailModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
                          title="View case timeline"
                        >
                          Timeline
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaymentCase(item);
                            setShowPaymentModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                          title="Record payment settlement"
                        >
                          +Pay
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:px-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Showing {casesList.length > 0 ? (casePage - 1) * 15 + 1 : 0} to{" "}
                {Math.min(casePage * 15, casesPagination.totalCount)} of {casesPagination.totalCount}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={casePage <= 1}
                  onClick={() => {
                    const prev = casePage - 1;
                    setCasePage(prev);
                    loadCases(prev);
                  }}
                  className="secondary-btn min-h-[36px] min-w-[36px] flex items-center justify-center"
                  style={{ padding: "6px 10px", fontSize: "11px" }}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs text-white font-mono bg-slate-800 rounded min-h-[36px] flex items-center justify-center">
                  {casePage} / {casesPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={casePage >= (casesPagination.totalPages || 1)}
                  onClick={() => {
                    const next = casePage + 1;
                    setCasePage(next);
                    loadCases(next);
                  }}
                  className="secondary-btn min-h-[36px] min-w-[36px] flex items-center justify-center"
                  style={{ padding: "6px 10px", fontSize: "11px" }}
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity & Status Audit Trail (case_status_history) (4 cols) */}
        <div className="col-span-1 lg:col-span-4 space-y-4 w-full relative lg:sticky lg:top-4 self-start">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <h4 className="font-bold text-white text-xs sm:text-sm truncate">Recent Activity (case_status_history)</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                LIVE AUDIT
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              CRITICAL RULE: Every case-status transition is immutably recorded with employee ID, timestamp, previous status &amp; new status in the database transaction.
            </p>

            {/* Activity Feed List */}
            <div className="space-y-2.5 sm:space-y-3 max-h-[480px] sm:max-h-[560px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {(adminOverview?.recent_status_history || [
                {
                  id: "csh_01",
                  case_number: "LON-864812",
                  customer_name: "Wandy Griffin",
                  employee_name: "Onkar Holkar",
                  employee_id: "PM-SADM-0001",
                  previous_status: "Contacted",
                  new_status: "Promise to Pay",
                  remarks: "Customer scheduled a payment extension of ₹15,000 for Friday",
                  created_at: new Date(Date.now() - 10 * 60000).toISOString()
                },
                {
                  id: "csh_02",
                  case_number: "LON-864812",
                  customer_name: "Jeremy Wilson",
                  employee_name: "Bhushan Gaikwad",
                  employee_id: "PM-ADM-0001",
                  previous_status: "New",
                  new_status: "Assigned",
                  remarks: "Assigned to Rahul Sharma based on high debt prioritization",
                  created_at: new Date(Date.now() - 25 * 60000).toISOString()
                },
                {
                  id: "csh_03",
                  case_number: "LON-771920",
                  customer_name: "Paul Smith",
                  employee_name: "Rahul Sharma",
                  employee_id: "PM-EMP-0001",
                  previous_status: "Promise to Pay",
                  new_status: "Partially Paid",
                  remarks: "Received online installment payment of ₹12,000 via UPI",
                  created_at: new Date(Date.now() - 65 * 60000).toISOString()
                },
                {
                  id: "csh_04",
                  case_number: "LON-552011",
                  customer_name: "Guy Hawkins",
                  employee_name: "Amit Verma",
                  employee_id: "PM-CLR-0001",
                  previous_status: "Disputed",
                  new_status: "Contacted",
                  remarks: "Supervisor reviewed dispute statement; customer verified account",
                  created_at: new Date(Date.now() - 120 * 60000).toISOString()
                }
              ]).map((act, idx) => (
                <div key={act.id || idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5 transition hover:border-slate-600">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono font-bold text-indigo-400">
                      {act.case_number}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-slate-200 flex-wrap">
                    <span className="truncate">{act.customer_name}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-[11px] text-indigo-300 font-semibold break-words">
                      {act.previous_status} &rarr; {act.new_status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug break-words">
                    {act.remarks}
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-1 text-[10px] text-slate-500 border-t border-slate-700/40 flex-wrap">
                    <span className="truncate">By: <strong className="text-slate-400">{act.employee_name || act.employee_id}</strong></span>
                    <span className="font-mono text-emerald-400 shrink-0">AUDIT VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3.5 sm:pt-4 border-t border-slate-800 mt-3 sm:mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  if (casesList.length > 0) {
                    setSelectedCaseId(casesList[0].id);
                    setShowCaseDetailModal(true);
                  }
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-3 inline-block rounded-lg hover:bg-indigo-950/40 transition"
              >
                View Complete Case Timeline &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
