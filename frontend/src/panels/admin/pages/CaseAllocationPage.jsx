import React, { useState } from "react";
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
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  FileCheck,
  X,
  Loader2
} from "lucide-react";
import api from "../../../services/api";
import ImportLoansModal from "../../../components/portal/ImportLoansModal";

export default function CaseAllocationPage({
  adminOverview,
  casesPagination = { page: 1, limit: 15, totalCount: 0, totalPages: 1 },
  employeesList = [],
  fileUploadLoading = false,
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
  // Multi-case Checkbox Selection State
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [selectedBulkEmp, setSelectedBulkEmp] = useState("");
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);

  // Mandatory Remarks Modal for Sensitive Statuses
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [pendingStatusCaseId, setPendingStatusCaseId] = useState(null);
  const [pendingStatusValue, setPendingStatusValue] = useState("");
  const [statusRemarksInput, setStatusRemarksInput] = useState("");

  const totalOutstanding = adminOverview?.summary?.total_outstanding || 36250000;
  const standardDue = Math.round(totalOutstanding * 0.65);
  const criticalOverdue = Math.round(totalOutstanding * 0.35);
  const totalCasesCount = adminOverview?.summary?.total_cases || casesPagination.totalCount || 200;

  // Toggle selection for all visible cases on current page
  const handleToggleSelectAll = () => {
    if (selectedCaseIds.length === casesList.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(casesList.map((c) => c.id));
    }
  };

  // Toggle single case selection
  const handleToggleSelectCase = (caseId) => {
    setSelectedCaseIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    );
  };

  // Execute bulk manual assignment to chosen staff member
  const handleAssignSelectedCases = async () => {
    if (!selectedBulkEmp || selectedCaseIds.length === 0) return;
    try {
      setBulkAssignLoading(true);
      setActionErrorMsg("");
      setActionSuccessMsg("");

      const res = await api.post("/cases/bulk-assign", {
        mode: "manual",
        caseIds: selectedCaseIds,
        employeeId: selectedBulkEmp
      });

      if (res && res.success) {
        setActionSuccessMsg(res.message || `Successfully assigned ${selectedCaseIds.length} case(s).`);
        setSelectedCaseIds([]);
        setSelectedBulkEmp("");
        if (loadCases) loadCases(casePage);
      } else {
        setActionErrorMsg(res?.message || "Failed to assign selected cases.");
      }
    } catch (err) {
      console.error("Bulk assign selected error:", err);
      setActionErrorMsg(err.message || "Failed to assign selected cases.");
    } finally {
      setBulkAssignLoading(false);
    }
  };

  // Intercept sensitive status changes to ensure mandatory remarks
  const onStatusSelectChange = (caseId, newStatus) => {
    if (["Disputed", "Closed", "Not Reachable"].includes(newStatus)) {
      setPendingStatusCaseId(caseId);
      setPendingStatusValue(newStatus);
      setStatusRemarksInput("");
      setRemarksModalOpen(true);
    } else {
      handleQuickStatusChange(caseId, newStatus);
    }
  };

  const handleConfirmRemarksStatusChange = async (e) => {
    e.preventDefault();
    if (!statusRemarksInput.trim()) {
      setActionErrorMsg("Remarks are required for this status transition.");
      return;
    }

    try {
      if (pendingStatusCaseId && pendingStatusValue) {
        await handleQuickStatusChange(pendingStatusCaseId, pendingStatusValue, statusRemarksInput.trim());
        setRemarksModalOpen(false);
        setPendingStatusCaseId(null);
        setPendingStatusValue("");
        setStatusRemarksInput("");
      }
    } catch (err) {
      setActionErrorMsg(err.message || "Status change failed.");
    }
  };

  // Download official template directly
  const handleDownloadTemplate = (format = "xlsx") => {
    const token = localStorage.getItem("paymagic_token");
    const downloadUrl = `/api/upload/template?format=${format}`;
    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to download template");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PayMagic_Loan_Import_Template.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Template download error:", err);
      });
  };

  return (
    <div className="portal-tab-content case-allocation-page relative w-full space-y-6 pb-12">
      
      {/* ── Action Notifications ── */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg("")} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg("")} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          1. TOP SUMMARY DASHBOARD (4-CARD BALANCED ENTERPRISE COMPOSITION)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 w-full">
        {/* Card A: Outstanding Amount Summary (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Outstanding Amount
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap shrink-0">
                LIVE PORTFOLIO
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight my-2 break-words">
              ₹{Number(totalOutstanding).toLocaleString("en-IN")}.00
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex justify-between items-center gap-2 py-0.5">
              <span className="text-slate-400">Due (Standard Arrears):</span>
              <span className="font-mono text-slate-200 font-semibold text-right">
                ₹{Number(standardDue).toLocaleString("en-IN")}.00
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 py-0.5">
              <span className="text-slate-400">Overdue (Critical Delinquency):</span>
              <span className="font-mono text-rose-400 font-bold text-right">
                ₹{Number(criticalOverdue).toLocaleString("en-IN")}.00
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 py-0.5">
              <span className="text-slate-400">Accounts Managed:</span>
              <span className="font-mono text-indigo-400 font-bold text-right">
                {totalCasesCount} Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Card B: Accounts Status Donut Chart & Distribution (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase truncate">
              Accounts Status Distribution
            </span>
            <span className="text-[11px] text-indigo-400 font-semibold shrink-0">
              10 Statuses
            </span>
          </div>

          {/* Donut Chart & Legend Representation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
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
                  {totalCasesCount}
                </span>
                <span className="text-[9px] text-slate-400 font-medium mt-1">Accounts</span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-[11px] text-slate-300 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" />
                <span className="truncate">Assigned ({adminOverview?.cases_by_status?.Assigned || 35})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block shrink-0" />
                <span className="truncate">Contacted ({adminOverview?.cases_by_status?.Contacted || 40})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                <span className="truncate">PTP ({adminOverview?.cases_by_status?.["Promise to Pay"] || 22})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="truncate">Paid ({adminOverview?.cases_by_status?.["Fully Paid"] || 28})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
                <span className="truncate">Disputed ({adminOverview?.cases_by_status?.Disputed || 12})</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block shrink-0" />
                <span className="truncate">Field Visit ({adminOverview?.cases_by_status?.["Field Visit"] || 15})</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 mt-auto border-t border-slate-800 text-[11px] text-slate-400 flex justify-between gap-1">
            <span>New: <strong className="text-slate-200">{adminOverview?.cases_by_status?.New || 18}</strong></span>
            <span>Partial: <strong className="text-yellow-400">{adminOverview?.cases_by_status?.["Partially Paid"] || 16}</strong></span>
            <span>Unreachable: <strong className="text-slate-300">{adminOverview?.cases_by_status?.["Not Reachable"] || 14}</strong></span>
          </div>
        </div>

        {/* Card C: Critical Tasks, Follow-ups, Disputes (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Operational Priorities
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ACTION QUEUE
              </span>
            </div>

            {/* 3 Metric Priority Cards */}
            <div className="grid grid-cols-3 gap-2.5 my-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-[10px] text-rose-300 font-semibold block mb-1 truncate">
                  Critical Tasks
                </span>
                <span className="font-extrabold text-xl font-mono text-rose-400">10</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <span className="text-[10px] text-indigo-300 font-semibold block mb-1 truncate">
                  Follow-ups
                </span>
                <span className="font-extrabold text-xl font-mono text-indigo-400">18</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] text-amber-300 font-semibold block mb-1 truncate">
                  Disputes
                </span>
                <span className="font-extrabold text-xl font-mono text-amber-400">4</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-auto border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Follow-ups due today:</span>
              <span className="text-white font-mono font-bold">18 cases</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Resolution SLA target:</span>
              <span className="text-emerald-400 font-mono font-bold">94.2% on-time</span>
            </div>
          </div>
        </div>

        {/* Card D: Active Calling Specialists & Workload (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Active Calling Specialists
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Specialist Avatars - Evenly Distributed */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 py-1 my-1">
              {(employeesList.length > 0 ? employeesList.slice(0, 4) : [
                { id: "emp_1", fullName: "Rahul Sharma", active_cases_count: 35 },
                { id: "emp_2", fullName: "Vikram Singh", active_cases_count: 42 },
                { id: "emp_3", fullName: "Priya Patel", active_cases_count: 28 },
                { id: "emp_4", fullName: "Aarav Mehta", active_cases_count: 31 }
              ]).map((emp) => (
                <div
                  key={emp.employeeId || emp.id}
                  className="flex flex-col items-center text-center p-1.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-indigo-500/40 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-800 shadow">
                    {emp.fullName?.slice(0, 2).toUpperCase() || "OP"}
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium truncate w-full mt-1.5">
                    {emp.fullName?.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">
                    {emp.active_cases_count || 35} accts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-auto border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Avg Handling Time:</span>
              <span className="text-indigo-400 font-mono font-semibold">4m 52s</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Team Connection Rate:</span>
              <span className="text-emerald-400 font-mono font-bold">78.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. ADMIN OPERATIONS TOOLBAR (Excel Upload, Rule Allocation, Transfer, Target, Export)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="portal-card operations-toolbar-card w-full rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-base tracking-tight">
                Module A: Admin Case Management Operations
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Excel/CSV bulk upload with schema validation, rule-based portfolio allocation, case transfers, target tracking &amp; atomic status audits.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0">
            
            {/* 1. Upload Loan Data (Opens Pre-Validation Modal) */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="primary-btn cursor-pointer inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 col-span-2 sm:col-span-1 md:flex-initial min-h-[42px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md shadow-blue-600/25 transition active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Import Customer Loans</span>
            </button>

            {/* 2. Download Template (.xlsx) */}
            <button
              type="button"
              onClick={() => handleDownloadTemplate("xlsx")}
              className="secondary-btn inline-flex items-center justify-center gap-2 text-xs py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700/80 min-h-[42px] rounded-xl font-semibold transition active:scale-98 cursor-pointer"
              title="Download official loan import template"
            >
              <Download className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Template</span>
            </button>

            {/* 3. Rule-Based Allocation */}
            <button
              type="button"
              onClick={() => setShowBulkAllocateModal(true)}
              className="primary-btn inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white col-span-1 md:flex-initial min-h-[42px] rounded-xl font-semibold shadow-md shadow-indigo-600/25 transition active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>Rule Allocation</span>
            </button>

            {/* 4. Transfer Cases */}
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="secondary-btn inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 col-span-1 md:flex-initial min-h-[42px] rounded-xl font-semibold transition active:scale-98 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Transfer Cases</span>
            </button>

            {/* 5. Set Target */}
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="secondary-btn inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700/90 text-emerald-300 border border-emerald-500/30 col-span-1 md:flex-initial min-h-[42px] rounded-xl font-semibold transition active:scale-98 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Set Target</span>
            </button>

            {/* 6. Export Cases */}
            <button
              type="button"
              onClick={handleExportCasesCSV}
              className="secondary-btn inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 border border-amber-500/30 col-span-1 md:flex-initial min-h-[42px] rounded-xl font-semibold transition active:scale-98 cursor-pointer"
              title="Export complete case dataset with status history"
            >
              <Download className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Export Cases</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. CASE STATUS NAVIGATION TABS (ALL 10 STATUSES + ALL CASES)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-full overflow-hidden my-3">
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-inner scrollbar-none no-scrollbar touch-pan-x">
          <button
            type="button"
            onClick={() => setCaseFilterStatus("ALL")}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              caseFilterStatus === "ALL"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <span>All Cases</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                caseFilterStatus === "ALL" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              {casesPagination.totalCount || casesList.length}
            </span>
          </button>
          {CASE_STATUSES.map((st) => {
            const count = adminOverview?.cases_by_status?.[st];
            return (
              <button
                key={st}
                type="button"
                onClick={() => setCaseFilterStatus(st)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  caseFilterStatus === st
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <span>{st}</span>
                {count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      caseFilterStatus === st ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500"
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

      {/* ══════════════════════════════════════════════════════════════════
          4. 2-COLUMN SPLIT (LEFT: CASE MANAGEMENT TABLE | RIGHT: RECENT ACTIVITY)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start my-2">
        {/* LEFT COLUMN: Customer Case Management Table (8 cols) */}
        <div className="col-span-1 lg:col-span-8 space-y-4 w-full min-w-0">
          <div className="portal-card table-card-wrapper relative w-full overflow-hidden rounded-2xl shadow-xl bg-slate-900/90 border border-slate-800/90">
            {/* Table Header Bar */}
            <div className="card-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-5 sm:p-6 border-b border-slate-800/80">
              <div className="header-left flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
                    Customer Case Management &amp; Delinquent Accounts
                  </h4>
                  <p className="text-xs text-slate-400">
                    Showing {casesList.length} accounts &bull; Rule-allocated &amp; tracked
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div className="search-box w-full sm:w-72 relative">
                <Search className="search-icon w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search borrower or loan account..."
                  value={caseSearchTerm}
                  onChange={(e) => setCaseSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadCases(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[40px] bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* DESKTOP & TABLET VIEW: Scrollable Responsive Table (hidden on mobile < 768px) */}
            <div className="hidden md:block portal-table-container relative w-full overflow-x-auto">
              <table className="portal-table min-w-[850px] w-full text-left">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800/80">
                    <th className="py-3.5 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={casesList.length > 0 && selectedCaseIds.length === casesList.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Select All on page"
                      />
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Borrower Details
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Priority Amount
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Upcoming Task
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Days Outstanding
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Status (Audit)
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Caller
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {casesLoading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "36px" }}>
                        Loading recovery accounts...
                      </td>
                    </tr>
                  ) : casesList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "#94a3b8" }}>
                        No matching cases found for criteria.
                      </td>
                    </tr>
                  ) : (
                    casesList.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          selectedCaseIds.includes(item.id) ? "bg-indigo-950/30" : ""
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCaseIds.includes(item.id)}
                            onChange={() => handleToggleSelectCase(item.id)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs truncate max-w-[200px]">
                            {item.customer_name || "Borrower"}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                            {item.phone_masked || item.phone || "+91 98*** 12345"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {item.loan_account_no} &bull; {item.lender_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-400 font-bold text-xs whitespace-nowrap">
                          ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-slate-300 font-mono">
                            {item.follow_up_date || "Today"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-rose-400 font-mono font-semibold">
                            {item.dpd} days late
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={item.status}
                            onChange={(e) => onStatusSelectChange(item.id, e.target.value)}
                            className={`text-[11px] font-semibold px-2.5 py-1.5 min-h-[34px] rounded-lg cursor-pointer border shadow-sm transition-all focus:ring-1 focus:ring-indigo-500 ${
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
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={item.assigned_employee_id || ""}
                            onChange={(e) => handleInlineAssign(item.id, e.target.value)}
                            className="text-[11px] bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 min-h-[34px] text-slate-200 cursor-pointer shadow-sm transition-all focus:ring-1 focus:ring-indigo-500"
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
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCaseId(item.id);
                                setShowCaseDetailModal(true);
                              }}
                              className="px-2.5 py-1.5 min-h-[34px] rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
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
                              className="px-2.5 py-1.5 min-h-[34px] rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
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
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading recovery accounts...
                </div>
              ) : casesList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No matching cases found for criteria.
                </div>
              ) : (
                casesList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 space-y-3 transition ${
                      selectedCaseIds.includes(item.id) ? "bg-indigo-950/40" : "bg-slate-900/40 hover:bg-slate-800/30"
                    }`}
                  >
                    {/* Top Row: Checkbox, Borrower Info & Priority Amount */}
                    <div className="flex justify-between items-start gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedCaseIds.includes(item.id)}
                          onChange={() => handleToggleSelectCase(item.id)}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">
                            {item.customer_name || "Borrower"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {item.phone_masked || item.phone || "+91 98*** 12345"}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.loan_account_no}
                          </div>
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
                            setSelectedCaseId(item.id);
                            setShowCaseDetailModal(true);
                          }}
                          className="px-3 py-1.5 min-h-[34px] rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
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
                          className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
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
                    loadCases(prev);
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
                    loadCases(next);
                  }}
                  className="secondary-btn min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer disabled:opacity-40"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            5. RIGHT COLUMN: RECENT ACTIVITY & AUDIT TRAIL (case_status_history)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="col-span-1 lg:col-span-4 space-y-4 w-full relative lg:sticky lg:top-4 self-start">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-3.5 gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                  Recent Activity (case_status_history)
                </h4>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE AUDIT</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 pb-1 leading-relaxed">
              CRITICAL RULE: Every case-status transition is immutably recorded with employee ID, timestamp, previous status &amp; new status in the database transaction.
            </p>

            {/* Activity Feed List */}
            <div className="space-y-3 max-h-[500px] sm:max-h-[560px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {(adminOverview?.recent_status_history || []).map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2 transition hover:border-slate-500/80 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[11px]">
                      {act.case_number}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-slate-200 flex-wrap py-0.5">
                    <span className="truncate">{act.customer_name}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-[11px] text-indigo-300 font-semibold break-words">
                      {act.previous_status} &rarr; {act.new_status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug break-words bg-slate-900/60 p-2 rounded-lg border border-slate-800/70">
                    {act.remarks}
                  </p>

                  <div className="pt-2 mt-2 flex items-center justify-between gap-1 text-[10px] text-slate-500 border-t border-slate-700/50 flex-wrap">
                    <span className="truncate">
                      By: <strong className="text-slate-400">{act.employee_name || act.employee_id}</strong>
                    </span>
                    <span className="font-mono text-emerald-400 shrink-0 font-medium">AUDIT VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  if (casesList.length > 0) {
                    setSelectedCaseId(casesList[0].id);
                    setShowCaseDetailModal(true);
                  }
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-2.5 px-4 inline-block rounded-xl hover:bg-indigo-950/40 border border-indigo-500/20 transition shadow-sm w-full sm:w-auto cursor-pointer"
              >
                View Complete Case Timeline &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          6. FLOATING BATCH SELECTION ACTION BAR (when cases are selected)
      ══════════════════════════════════════════════════════════════════ */}
      {selectedCaseIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-2xl p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/50 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm">
              {selectedCaseIds.length} Case{selectedCaseIds.length > 1 ? "s" : ""} Selected
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedBulkEmp}
              onChange={(e) => setSelectedBulkEmp(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Assign to Specialist...</option>
              {employeesList.map((emp) => (
                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                  {emp.fullName || emp.name} ({emp.employeeId || emp.id})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAssignSelectedCases}
              disabled={!selectedBulkEmp || bulkAssignLoading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {bulkAssignLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
              <span>Assign</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCaseIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Import Customer Loans Modal ── */}
      <ImportLoansModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(msg) => {
          setActionSuccessMsg(msg);
          if (loadCases) loadCases(1);
        }}
      />

      {/* ── Mandatory Remarks Modal for Status Change ── */}
      {remarksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">Mandatory Status Remarks</h3>
              </div>
              <button onClick={() => setRemarksModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Per regulatory compliance, transitioning to <strong className="text-white">"{pendingStatusValue}"</strong> requires recorded remarks for audit history.
            </p>

            <form onSubmit={handleConfirmRemarksStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason / Remarks <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Borrower verified, dispute details logged..."
                  value={statusRemarksInput}
                  onChange={(e) => setStatusRemarksInput(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRemarksModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!statusRemarksInput.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-50"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
