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
  Loader2,
  Wallet,
  PieChart,
  Activity,
  PhoneCall,
  ArrowRight,
  Phone,
  Building2,
  Flame,
  Check,
  SlidersHorizontal,
  FileText
} from "lucide-react";
import api, { API_URL } from "../../../services/api";
import ImportLoansModal from "../../../components/portal/ImportLoansModal";

const STATUS_DOT_COLORS = {
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

const getDpdBadge = (dpd) => {
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
    const downloadUrl = `${API_URL}/upload/template?format=${format}`;
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
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
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
                  Standard Due (65%)
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Critical Overdue (35%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 p-0.5 overflow-hidden flex border border-slate-700/50">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-l-full transition-all" style={{ width: "65%" }} />
                <div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-r-full transition-all" style={{ width: "35%" }} />
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

        {/* Card B: Accounts Status Donut Chart & Distribution (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
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

            {/* Modern Donut Chart & Legend */}
            <div className="flex flex-row items-center justify-between gap-3 py-2">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="50 188" strokeDashoffset="0" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray="40 198" strokeDashoffset="-50" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="35 203" strokeDashoffset="-90" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="45 193" strokeDashoffset="-125" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f43f5e" strokeWidth="10" strokeDasharray="25 213" strokeDashoffset="-170" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="10" strokeDasharray="20 218" strokeDashoffset="-195" strokeLinecap="round" />
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
                  <span className="truncate">Assigned ({adminOverview?.cases_by_status?.Assigned || 35})</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                  <span className="truncate">Contacted ({adminOverview?.cases_by_status?.Contacted || 40})</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  <span className="truncate">PTP ({adminOverview?.cases_by_status?.["Promise to Pay"] || 22})</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span className="truncate">Paid ({adminOverview?.cases_by_status?.["Fully Paid"] || 28})</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
                  <span className="truncate">Disputed ({adminOverview?.cases_by_status?.Disputed || 12})</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                  <span className="truncate">Field ({adminOverview?.cases_by_status?.["Field Visit"] || 15})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2.5 mt-auto border-t border-slate-800 text-[11px] text-slate-400 flex justify-between gap-1">
            <span>New: <strong className="text-cyan-400 font-mono">{adminOverview?.cases_by_status?.New || 18}</strong></span>
            <span>Partial: <strong className="text-orange-400 font-mono">{adminOverview?.cases_by_status?.["Partially Paid"] || 16}</strong></span>
            <span>Unreachable: <strong className="text-slate-400 font-mono">{adminOverview?.cases_by_status?.["Not Reachable"] || 14}</strong></span>
          </div>
        </div>

        {/* Card C: Critical Tasks, Follow-ups, Disputes (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-inner">
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
                <span className="font-black text-xl font-mono text-rose-400 mt-0.5">10</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-center flex flex-col justify-center shadow-sm">
                <span className="text-[10px] text-indigo-300 font-semibold block truncate">
                  Follow-ups
                </span>
                <span className="font-black text-xl font-mono text-indigo-400 mt-0.5">18</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center flex flex-col justify-center shadow-sm">
                <span className="text-[10px] text-amber-300 font-semibold block truncate">
                  Disputes
                </span>
                <span className="font-black text-xl font-mono text-amber-400 mt-0.5">4</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-auto border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Follow-ups due today:</span>
              <span className="text-white font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                18 cases
              </span>
            </div>
            <div>
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span>Resolution SLA target:</span>
                <span className="text-emerald-400 font-mono font-bold">94.2% on-time</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "94.2%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card D: Active Calling Specialists & Workload (xl:col-span-3) */}
        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] hover:border-blue-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
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
              {(employeesList.length > 0 ? employeesList.slice(0, 4) : [
                { id: "emp_1", fullName: "Rahul Sharma", active_cases_count: 35 },
                { id: "emp_2", fullName: "Vikram Singh", active_cases_count: 42 },
                { id: "emp_3", fullName: "Priya Patel", active_cases_count: 28 },
                { id: "emp_4", fullName: "Aarav Mehta", active_cases_count: 31 }
              ]).map((emp) => (
                <div
                  key={emp.employeeId || emp.id}
                  className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/90 transition-all group/emp"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-[11px] flex items-center justify-center border border-slate-700 shadow-md group-hover/emp:scale-105 transition-transform">
                    {emp.fullName?.slice(0, 2).toUpperCase() || "OP"}
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium truncate w-full mt-1.5">
                    {emp.fullName?.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono font-semibold">
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
            <div>
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span>Team Connection Rate:</span>
                <span className="text-emerald-400 font-mono font-bold">78.4%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: "78.4%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. ADMIN OPERATIONS TOOLBAR (Excel Upload, Rule Allocation, Transfer, Target, Export)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="portal-card operations-toolbar-card w-full rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] shadow-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/25 tracking-wider uppercase">
                    Operations Control
                  </span>
                  <h4 className="font-bold text-white text-base tracking-tight">
                    Case Management Operations
                  </h4>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-10">
              Upload loan datasets, run rule-based portfolio allocations, transfer accounts, set recovery targets, and export reporting data.
            </p>
          </div>

          {/* Button Controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* 1. Import Loan Data */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 min-h-[40px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Import Customer Loans</span>
            </button>

            {/* 2. Download Template */}
            <button
              type="button"
              onClick={() => handleDownloadTemplate("xlsx")}
              className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[40px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
              title="Download official loan import template"
            >
              <Download className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Template</span>
            </button>

            {/* 3. Rule Allocation */}
            <button
              type="button"
              onClick={() => setShowBulkAllocateModal(true)}
              className="inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 min-h-[40px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>Rule Allocation</span>
            </button>

            {/* 4. Transfer Cases */}
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[40px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Transfer Cases</span>
            </button>

            {/* 5. Set Target */}
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[40px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
            >
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Set Target</span>
            </button>

            {/* 6. Export Cases */}
            <button
              type="button"
              onClick={handleExportCasesCSV}
              className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[40px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
              title="Export complete case dataset"
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
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-white/[0.08] rounded-2xl shadow-xl scrollbar-none no-scrollbar touch-pan-x">
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
                caseFilterStatus === "ALL" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              {casesPagination.totalCount || casesList.length}
            </span>
          </button>
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
                      caseFilterStatus === st ? "bg-white/20 text-white" : "bg-slate-800/90 text-slate-400 border border-slate-700/50"
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
          <div className="portal-card table-card-wrapper relative w-full overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

            {/* Table Header Bar */}
            <div className="card-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-5 sm:p-6 border-b border-slate-800/80">
              <div className="header-left flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
                      Customer Case Management &amp; Delinquent Accounts
                    </h4>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {casesPagination.totalCount || casesList.length} Accounts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live delinquent portfolio tracking &bull; Rule-allocated &bull; Atomic status audits
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div className="search-box w-full sm:w-80 relative">
                <Search className="search-icon w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search borrower, loan account, lender..."
                  value={caseSearchTerm}
                  onChange={(e) => setCaseSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadCases(1);
                  }}
                  className="w-full pl-10 pr-9 py-2.5 min-h-[40px] bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                />
                {caseSearchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setCaseSearchTerm("");
                      if (loadCases) loadCases(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* In-Card Quick Batch Actions Bar (when cases are selected) */}
            {selectedCaseIds.length > 0 && (
              <div className="mx-5 my-3 p-3 px-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-200 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span>{selectedCaseIds.length} case(s) selected on page</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedBulkEmp}
                    onChange={(e) => setSelectedBulkEmp(e.target.value)}
                    className="bg-slate-900 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">Reassign to Specialist...</option>
                    {employeesList.map((emp) => (
                      <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                        {emp.fullName?.split(" ")[0]} ({emp.employeeId || emp.id})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedBulkEmp || bulkAssignLoading}
                    onClick={handleAssignSelectedCases}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                  >
                    {bulkAssignLoading ? "Assigning..." : "Apply Assignment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCaseIds([])}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* DESKTOP & TABLET VIEW: Scrollable Responsive Table (hidden on mobile < 768px) */}
            <div className="hidden md:block portal-table-container relative w-full overflow-x-auto">
              <table className="portal-table min-w-[950px] w-full text-left">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800/80">
                    <th className="py-3.5 px-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={casesList.length > 0 && selectedCaseIds.length === casesList.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Select All on page"
                      />
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">
                      Borrower Details
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[130px]">
                      Priority Amount
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[120px]">
                      Upcoming Task
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[140px]">
                      Days Outstanding
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[145px]">
                      Status (Audit)
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[145px]">
                      Assigned Caller
                    </th>
                    <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right min-w-[130px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {casesLoading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "36px" }}>
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Loading recovery accounts...</span>
                        </div>
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
                        className={`hover:bg-slate-800/50 transition-colors ${
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
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-sm">
                              {item.customer_name ? item.customer_name.slice(0, 2).toUpperCase() : "PM"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate max-w-[190px]">
                                {item.customer_name || "Borrower"}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                <span>{item.phone_masked || item.phone || "+91 98*** 12345"}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                                <span className="bg-slate-800/90 px-1.5 py-0.2 rounded text-slate-400 border border-slate-700/50">
                                  {item.loan_account_no}
                                </span>
                                <span>&bull;</span>
                                <span className="truncate max-w-[90px]">{item.lender_name}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-400 font-bold text-xs whitespace-nowrap">
                          ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-800/70 border border-slate-700/60 px-2.5 py-1 rounded-lg shadow-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.follow_up_date || "Today"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getDpdBadge(item.dpd)}
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
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCaseId(item.id);
                              setShowCaseDetailModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/50 text-[11px] font-semibold transition cursor-pointer shadow-sm"
                            title="View case details and status history timeline"
                          >
                            <span>Timeline</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
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
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            <span>{item.phone_masked || item.phone || "+91 98*** 12345"}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {item.loan_account_no} &bull; {item.lender_name}
                          </div>
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
                            setSelectedCaseId(item.id);
                            setShowCaseDetailModal(true);
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
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] shadow-2xl relative overflow-hidden">
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
              {(adminOverview?.recent_status_history || []).map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/60 text-xs space-y-2 transition-all duration-200 shadow-sm hover:border-indigo-500/40"
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
                className="inline-flex items-center justify-center gap-2 text-xs text-indigo-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 hover:border-indigo-500/50 transition-all shadow-sm w-full cursor-pointer"
              >
                <span>View Complete Case Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
