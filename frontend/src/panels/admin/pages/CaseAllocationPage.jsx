import React, { useState, useMemo } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import api, { API_URL } from "../../../services/api";
import ImportLoansModal from "../../../components/portal/ImportLoansModal";
import {
  CaseKpiDashboard,
  CaseOperationsToolbar,
  CaseStatusTabs,
  CaseTable,
  CaseAuditFeed,
  CaseBatchBar,
  CaseRemarksModal
} from "../components";

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

  // Live Portfolio KPI Calculations
  const totalOutstanding = adminOverview?.summary?.total_outstanding ?? 0;
  const criticalOverdue = adminOverview?.summary?.critical_overdue ?? (
    adminOverview?.cases_by_priority?.CRITICAL 
      ? Math.round(totalOutstanding * (adminOverview.cases_by_priority.CRITICAL / (adminOverview?.summary?.total_cases || 1)))
      : 0
  );
  const standardDue = adminOverview?.summary?.standard_due ?? Math.max(0, totalOutstanding - criticalOverdue);
  const totalCasesCount = adminOverview?.summary?.total_cases ?? casesPagination.totalCount ?? casesList.length ?? 0;

  const standardPct = totalOutstanding > 0 ? Math.round((standardDue / totalOutstanding) * 100) : 0;
  const criticalPct = totalOutstanding > 0 ? (100 - standardPct) : 0;

  // Real operational priorities
  const criticalCount = adminOverview?.summary?.critical_cases_count ?? adminOverview?.cases_by_priority?.CRITICAL ?? 0;
  const followUpsDueCount = adminOverview?.summary?.follow_ups_due_today ?? 0;
  const disputesTotal = adminOverview?.summary?.disputes_count ?? adminOverview?.cases_by_status?.Disputed ?? 0;
  const recoveryRate = adminOverview?.summary?.overall_recovery_rate ?? 0;

  // Real calling specialists & metrics
  const avgHandlingTime = adminOverview?.summary?.avg_handling_time_formatted || "—";
  const connectionRate = adminOverview?.summary?.call_connection_rate ?? 0;
  const activeSpecialists = employeesList.filter((e) => e.role === "EMPLOYEE" || e.role === "CALLER");
  const displaySpecialists = activeSpecialists.length > 0 ? activeSpecialists.slice(0, 4) : employeesList.slice(0, 4);

  // Dynamic Donut SVG Segments based on real cases_by_status
  const donutSegments = useMemo(() => {
    const statusMap = adminOverview?.cases_by_status || {};
    const statusColors = {
      "Assigned": "#3b82f6",
      "Contacted": "#6366f1",
      "Promise to Pay": "#f59e0b",
      "Fully Paid": "#10b981",
      "Partially Paid": "#f97316",
      "Disputed": "#f43f5e",
      "Field Visit": "#a855f7",
      "New": "#06b6d4",
      "Not Reachable": "#64748b",
      "Closed": "#71717a"
    };
    const circumference = 238.76; // 2 * PI * 38
    let currentOffset = 0;
    const segments = [];
    const total = totalCasesCount || 1;

    Object.entries(statusMap).forEach(([st, cnt]) => {
      const num = Number(cnt || 0);
      if (num > 0) {
        const segLen = (num / total) * circumference;
        segments.push({
          status: st,
          stroke: statusColors[st] || "#3b82f6",
          dashArray: `${segLen.toFixed(1)} ${(circumference - segLen).toFixed(1)}`,
          dashOffset: -currentOffset
        });
        currentOffset += segLen;
      }
    });
    return segments;
  }, [adminOverview, totalCasesCount]);

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
    <div className="portal-tab-content case-allocation-page relative w-full space-y-5 pb-12">
      {/* ── Action Notifications ── */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg("")} className="text-emerald-400 hover:text-white cursor-pointer">
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
          <button onClick={() => setActionErrorMsg("")} className="text-rose-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          1. TOP SUMMARY DASHBOARD (4-CARD BALANCED ENTERPRISE COMPOSITION)
      ══════════════════════════════════════════════════════════════════ */}
      <CaseKpiDashboard
        totalOutstanding={totalOutstanding}
        standardDue={standardDue}
        criticalOverdue={criticalOverdue}
        standardPct={standardPct}
        criticalPct={criticalPct}
        totalCasesCount={totalCasesCount}
        donutSegments={donutSegments}
        adminOverview={adminOverview}
        criticalCount={criticalCount}
        followUpsDueCount={followUpsDueCount}
        disputesTotal={disputesTotal}
        recoveryRate={recoveryRate}
        displaySpecialists={displaySpecialists}
        avgHandlingTime={avgHandlingTime}
        connectionRate={connectionRate}
      />

      {/* ══════════════════════════════════════════════════════════════════
          2. ADMIN OPERATIONS TOOLBAR (Excel Upload, Rule Allocation, Transfer, Target, Export)
      ══════════════════════════════════════════════════════════════════ */}
      <CaseOperationsToolbar
        fileUploadLoading={fileUploadLoading}
        setShowImportModal={setShowImportModal}
        handleDownloadTemplate={handleDownloadTemplate}
        setShowBulkAllocateModal={setShowBulkAllocateModal}
        setShowTransferModal={setShowTransferModal}
        setShowTargetModal={setShowTargetModal}
        handleExportCasesCSV={handleExportCasesCSV}
      />

      {/* ══════════════════════════════════════════════════════════════════
          3. CASE STATUS NAVIGATION TABS (ALL 10 STATUSES + ALL CASES)
      ══════════════════════════════════════════════════════════════════ */}
      <CaseStatusTabs
        caseFilterStatus={caseFilterStatus}
        setCaseFilterStatus={setCaseFilterStatus}
        CASE_STATUSES={CASE_STATUSES}
        adminOverview={adminOverview}
        totalCasesCount={totalCasesCount}
      />

      {/* ══════════════════════════════════════════════════════════════════
          4. 2-COLUMN SPLIT (LEFT: CASE MANAGEMENT TABLE | RIGHT: RECENT ACTIVITY)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start my-2">
        {/* LEFT COLUMN: Customer Case Management Table (8 cols) */}
        <div className="col-span-1 lg:col-span-8 space-y-4 w-full min-w-0">
          <CaseTable
            casesList={casesList}
            casesLoading={casesLoading}
            casesPagination={casesPagination}
            casePage={casePage}
            setCasePage={setCasePage}
            loadCases={loadCases}
            caseSearchTerm={caseSearchTerm}
            setCaseSearchTerm={setCaseSearchTerm}
            selectedCaseIds={selectedCaseIds}
            handleToggleSelectAll={handleToggleSelectAll}
            handleToggleSelectCase={handleToggleSelectCase}
            CASE_STATUSES={CASE_STATUSES}
            STATUS_PILL_CLASSES={STATUS_PILL_CLASSES}
            onStatusSelectChange={onStatusSelectChange}
            handleInlineAssign={handleInlineAssign}
            employeesList={employeesList}
            setSelectedCaseId={setSelectedCaseId}
            setShowCaseDetailModal={setShowCaseDetailModal}
          />
        </div>

        {/* RIGHT COLUMN: RECENT ACTIVITY & AUDIT TRAIL (4 cols) */}
        <div className="col-span-1 lg:col-span-4 space-y-4 w-full relative lg:sticky lg:top-4 self-start">
          <CaseAuditFeed
            recentStatusHistory={adminOverview?.recent_status_history || []}
            casesList={casesList}
            setSelectedCaseId={setSelectedCaseId}
            setShowCaseDetailModal={setShowCaseDetailModal}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          5. FLOATING BATCH SELECTION ACTION BAR (when cases are selected)
      ══════════════════════════════════════════════════════════════════ */}
      <CaseBatchBar
        selectedCaseIds={selectedCaseIds}
        setSelectedCaseIds={setSelectedCaseIds}
        selectedBulkEmp={selectedBulkEmp}
        setSelectedBulkEmp={setSelectedBulkEmp}
        employeesList={employeesList}
        handleAssignSelectedCases={handleAssignSelectedCases}
        bulkAssignLoading={bulkAssignLoading}
      />

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
      <CaseRemarksModal
        isOpen={remarksModalOpen}
        onClose={() => setRemarksModalOpen(false)}
        pendingStatusValue={pendingStatusValue}
        statusRemarksInput={statusRemarksInput}
        setStatusRemarksInput={setStatusRemarksInput}
        handleConfirmRemarksStatusChange={handleConfirmRemarksStatusChange}
      />
    </div>
  );
}
