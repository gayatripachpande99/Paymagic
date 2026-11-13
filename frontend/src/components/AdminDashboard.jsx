import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import api from "../services/api";
import {
  BarChart3,
  TrendingUp,
  PhoneCall,
  IndianRupee,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Download,
  Search,
  Filter,
  ArrowRightLeft,
  Play,
  FileAudio,
  Plus,
  RefreshCw,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  ExternalLink,
  Activity,
  QrCode,
  Receipt,
  Building2,
  Compass,
  Radio,
  Scale,
  Bell
} from "lucide-react";

import CaseDetailModal from "./portal/CaseDetailModal";
import AudioPlayerModal from "./portal/AudioPlayerModal";
import PaymentModal from "./portal/PaymentModal";
import BulkAllocateModal from "./portal/BulkAllocateModal";
import TransferCasesModal from "./portal/TransferCasesModal";
import SetTargetModal from "./portal/SetTargetModal";
import CallActivityReport from "./portal/CallActivityReport";
import WebPhoneDialer from "./portal/WebPhoneDialer";
import CallingModal from "./portal/CallingModal";
import PerformanceDashboard from "./portal/PerformanceDashboard";
import ScheduleFieldVisitModal from "./portal/ScheduleFieldVisitModal";
import DigitalReceiptModal from "./portal/DigitalReceiptModal";
import ComplaintManagementDesk from "./portal/ComplaintManagementDesk";
import NotificationBell from "./portal/NotificationBell";
import NotificationHub from "./portal/NotificationHub";

import {
  ManagementAnalyticsPage,
  CaseAllocationPage,
  CallRecordsAudioPage,
  PaymentRecoveryPage,
  TeamPerformancePage,
  LiveAttendancePage,
  StaffDirectoryPage,
  FieldRecoveryVisitsPage,
  LeaveApprovalsPage,
  GrievanceDisputesPage,
  RemindersQueuePage
} from "../panels/admin/pages";

const CASE_STATUSES = [
  "New",
  "Assigned",
  "Contacted",
  "Promise to Pay",
  "Partially Paid",
  "Fully Paid",
  "Disputed",
  "Not Reachable",
  "Field Visit",
  "Closed"
];

const STATUS_PILL_CLASSES = {
  New: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  Assigned: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Contacted: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  "Promise to Pay": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "Partially Paid": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  "Fully Paid": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Disputed: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  "Not Reachable": "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  "Field Visit": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Closed: "bg-teal-500/10 text-teal-400 border border-teal-500/20"
};

export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  // Navigation: analytics | cases | calls | payments | performance | attendance | employees | leave-approvals
  const [activeTab, setActiveTab] = useState("analytics");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── 1. MANAGEMENT ANALYTICS & REPORTS STATE (Feature 7 & 5) ──
  const [reportsData, setReportsData] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  // ── 2. RECOVERY CASES STATE (Feature 3) ──
  const [casesList, setCasesList] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casePage, setCasePage] = useState(1);
  const [casesPagination, setCasesPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });
  const [caseFilterStatus, setCaseFilterStatus] = useState("ALL");
  const [caseFilterPriority, setCaseFilterPriority] = useState("ALL");
  const [caseFilterLender, setCaseFilterLender] = useState("ALL");
  const [caseSearchTerm, setCaseSearchTerm] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseDetailModal, setShowCaseDetailModal] = useState(false);

  // Legacy Range Allocation & Upload state (preserved)
  const [recordsData, setRecordsData] = useState([]);
  const [recordColumns, setRecordColumns] = useState([]);
  const [recordsSummary, setRecordsSummary] = useState({ totalRecords: 0, assignedRecords: 0, unassignedRecords: 0, breakdown: {} });
  const [selectedAssignEmp, setSelectedAssignEmp] = useState("PM-EMP-0001");
  const [startRangeNum, setStartRangeNum] = useState("1");
  const [endRangeNum, setEndRangeNum] = useState("100");
  const [assignLoading, setAssignLoading] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  // ── 3. CALL RECORDS & EVIDENCE STATE (Feature 1 & 4) ──
  const [callsList, setCallsList] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callFilterStatus, setCallFilterStatus] = useState("ALL");
  const [callSearchTerm, setCallSearchTerm] = useState("");
  const [selectedCallAudio, setSelectedCallAudio] = useState(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [adminCallingCase, setAdminCallingCase] = useState(null);
  const [showAdminCallingModal, setShowAdminCallingModal] = useState(false);

  // ── 4. PAYMENT & COLLECTIONS TRACKING STATE (Feature 5) ──
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsSummary, setPaymentsSummary] = useState({ total_count: 0, total_collected: 0 });
  const [selectedPaymentCase, setSelectedPaymentCase] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── 5. PERFORMANCE & LEADERBOARD STATE (Feature 6) ──
  const [teamDashboard, setTeamDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all");

  // ── 6. ATTENDANCE & SHIFTS STATE (Feature 2) ──
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ totalEmployees: 0, present: 0, working: 0, completed: 0, notMarked: 0, onLeave: 0 });
  const [attSearchTerm, setAttSearchTerm] = useState("");
  const [attStatusFilter, setAttStatusFilter] = useState("ALL");
  const [attDeptFilter, setAttDeptFilter] = useState("ALL");

  // ── 7. STAFF DIRECTORY & PASSWORDS STATE ──
  const [employeesList, setEmployeesList] = useState([]);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "Operations",
    designation: "Executive",
    password: "Emp@123",
    joiningDate: new Date().toISOString().split("T")[0]
  });

  // ── 8. LEAVE APPROVALS & SUPERVISOR DESK STATE (Module D) ──
  const [leaveApprovals, setLeaveApprovals] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);

  // ── 9. FIELD RECOVERY MANAGEMENT STATE (Module E) ──
  const [fieldVisitsList, setFieldVisitsList] = useState([]);
  const [fieldVisitsLoading, setFieldVisitsLoading] = useState(false);
  const [fieldOverviewData, setFieldOverviewData] = useState(null);
  const [cashHandoversList, setCashHandoversList] = useState([]);
  const [cashHandoversLoading, setCashHandoversLoading] = useState(false);
  const [fieldSubTab, setFieldSubTab] = useState("visits"); // "visits" | "overview" | "handovers"
  const [fieldFilterStatus, setFieldFilterStatus] = useState("ALL");
  const [fieldFilterZone, setFieldFilterZone] = useState("ALL");
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");
  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  const [selectedReceiptRef, setSelectedReceiptRef] = useState(null);
  const [showDigitalReceiptModal, setShowDigitalReceiptModal] = useState(false);

  // Bulk Allocate Modal
  const [showBulkAllocateModal, setShowBulkAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // ── DATA FETCHERS ──

  const loadManagementReports = async () => {
    try {
      setReportsLoading(true);
      const [reportsRes, overviewRes] = await Promise.allSettled([
        api.get("/dashboard/reports"),
        api.get("/dashboard/admin-overview")
      ]);

      if (reportsRes.status === "fulfilled" && reportsRes.value.success) {
        setReportsData(reportsRes.value.data);
      }
      if (overviewRes.status === "fulfilled" && overviewRes.value.success) {
        setAdminOverview(overviewRes.value.data);
      }
    } catch (err) {
      console.error("Management reports fetch error:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadCases = async (page = casePage) => {
    try {
      setCasesLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: "15"
      });
      if (caseFilterStatus !== "ALL") queryParams.append("status", caseFilterStatus);
      if (caseFilterPriority !== "ALL") queryParams.append("priority", caseFilterPriority);
      if (caseFilterLender !== "ALL") queryParams.append("lender", caseFilterLender);
      if (caseSearchTerm.trim()) queryParams.append("search", caseSearchTerm.trim());

      const res = await api.get(`/cases?${queryParams.toString()}`);
      if (res && res.success && res.data) {
        setCasesList(res.data.cases || []);
        setCasesPagination(res.data.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Cases fetch error:", err);
    } finally {
      setCasesLoading(false);
    }
  };

  const loadCalls = async () => {
    try {
      setCallsLoading(true);
      const res = await api.get("/telephony/calls?limit=50");
      if (res && res.success && res.data) {
        setCallsList(res.data.calls || []);
      }
    } catch (err) {
      console.error("Calls fetch error:", err);
    } finally {
      setCallsLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await api.get("/cases/payments/all?limit=50");
      if (res && res.success && res.data) {
        setPaymentsList(res.data.payments || []);
        setPaymentsSummary(res.data.summary || { total_count: 0, total_collected: 0 });
      }
    } catch (err) {
      console.error("Payments fetch error:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadTeamPerformance = async () => {
    try {
      const [teamRes, leaderRes] = await Promise.allSettled([
        api.get("/dashboard/team"),
        api.get(`/dashboard/leaderboard?period=${leaderboardPeriod}`)
      ]);
      if (teamRes.status === "fulfilled" && teamRes.value.success) {
        setTeamDashboard(teamRes.value.data);
      }
      if (leaderRes.status === "fulfilled" && leaderRes.value.success) {
        setLeaderboard(leaderRes.value.data.leaderboard || []);
      }
    } catch (err) {
      console.error("Performance fetch error:", err);
    }
  };

  const loadAdminAttendance = async () => {
    try {
      setLoading(true);
      const [attRes, empRes] = await Promise.allSettled([
        api.get("/admin/attendance/today"),
        api.get("/admin/employees")
      ]);

      if (attRes.status === "fulfilled" && attRes.value.success) {
        setAttendanceSummary(attRes.value.summary || {});
        setAttendanceData(attRes.value.attendance || []);
      }

      if (empRes.status === "fulfilled" && empRes.value.success) {
        setEmployeesList(empRes.value.employees || []);
      }

      await loadAdminRecords();
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setErrorMsg(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminRecords = async () => {
    try {
      const res = await api.get("/admin/records");
      if (res && res.success) {
        setRecordsData(res.records || []);
        setRecordsSummary(res.summary || {});
        setRecordColumns(res.columns || []);
      }
    } catch (err) {
      console.error("Admin records fetch error:", err);
    }
  };

  const loadLeaveApprovals = async () => {
    try {
      setLeaveLoading(true);
      const res = await api.get("/attendance/leave/all");
      if (res && res.success && res.leaveRequests) {
        setLeaveApprovals(res.leaveRequests);
      }
    } catch (err) {
      console.warn("Leave approvals fetch warning:", err);
    } finally {
      setLeaveLoading(false);
    }
  };

  const loadFieldVisits = async () => {
    try {
      setFieldVisitsLoading(true);
      const res = await api.get("/field/visits");
      if (res && res.success && res.visits) {
        setFieldVisitsList(res.visits);
      }
    } catch (err) {
      console.warn("Field visits fetch warning:", err);
    } finally {
      setFieldVisitsLoading(false);
    }
  };

  const loadFieldOverview = async () => {
    try {
      const res = await api.get("/field/overview");
      if (res && res.success && res.data) {
        setFieldOverviewData(res.data);
      }
    } catch (err) {
      console.warn("Field overview fetch warning:", err);
    }
  };

  const loadCashHandovers = async () => {
    try {
      setCashHandoversLoading(true);
      const res = await api.get("/field/cash-handovers");
      if (res && res.success && res.handovers) {
        setCashHandoversList(res.handovers);
      }
    } catch (err) {
      console.warn("Cash handovers fetch warning:", err);
    } finally {
      setCashHandoversLoading(false);
    }
  };

  const handleReconcileCash = async (id, status) => {
    try {
      const res = await api.patch(`/field/cash-handover/${id}/reconcile`, {
        status,
        remarks: `Reconciliation ${status.toLowerCase()} by Operations Administrator.`
      });
      if (res && res.success) {
        setSuccessMsg(res.message || `Cash handover ${status.toLowerCase()} successfully!`);
        await loadCashHandovers();
        await loadFieldOverview();
      }
    } catch (err) {
      setErrorMsg("Failed to reconcile cash handover: " + err.message);
    }
  };

  // Initial load
  useEffect(() => {
    loadManagementReports();
    loadCases(1);
    loadCalls();
    loadPayments();
    loadTeamPerformance();
    loadAdminAttendance();
    loadLeaveApprovals();
    loadFieldVisits();
    loadFieldOverview();
    loadCashHandovers();
  }, []);

  // Reload cases when filters change
  useEffect(() => {
    loadCases(1);
  }, [caseFilterStatus, caseFilterPriority, caseFilterLender]);

  // Reload leaderboard when period changes
  useEffect(() => {
    loadTeamPerformance();
  }, [leaderboardPeriod]);

  // ── CSV EXPORTERS ──

  const handleExportReportsCSV = () => {
    if (!reportsData) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: DPD Aging
    const dpdRows = (reportsData.dpd_aging || []).map((b) => ({
      "DPD Bucket": b.bucket,
      "Case Count": b.case_count,
      "Outstanding Debt (₹)": b.outstanding_amount,
      "Recovered Debt (₹)": b.recovered_amount,
      "Recovery Rate (%)": `${b.recovery_rate}%`
    }));
    const ws1 = XLSX.utils.json_to_sheet(dpdRows);
    XLSX.utils.book_append_sheet(wb, ws1, "DPD Aging Analysis");

    // Sheet 2: Lender Breakdown
    const lenderRows = (reportsData.lender_breakdown || []).map((l) => ({
      "Lending Partner": l.lender,
      "Total Cases": l.cases_count,
      "Principal Amount (₹)": l.principal_amount,
      "Outstanding (₹)": l.outstanding_amount,
      "Recovered (₹)": l.recovered_amount,
      "Recovery Rate (%)": `${l.recovery_rate}%`
    }));
    const ws2 = XLSX.utils.json_to_sheet(lenderRows);
    XLSX.utils.book_append_sheet(wb, ws2, "Lender Portfolio");

    XLSX.writeFile(wb, `PayMagic_Management_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportCasesCSV = () => {
    if (!casesList || casesList.length === 0) return;
    const rows = casesList.map((c) => ({
      "Case Number": c.case_number,
      "Customer Name": c.customer_name,
      "Loan Account": c.loan_account_no,
      "Lender": c.lender_name,
      "Outstanding Amount (₹)": c.outstanding_amount,
      "Recovered Amount (₹)": c.recovered_amount || 0,
      "Status": c.status,
      "Priority": c.priority,
      "DPD": c.dpd,
      "Assigned Employee": c.assigned_employee_id || "Unassigned",
      "Follow-up Date": c.follow_up_date || "N/A"
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recovery Cases");
    XLSX.writeFile(wb, `PayMagic_Recovery_Cases_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ── LEGACY HANDLERS PRESERVED ──

  const handleInlineAssign = async (caseId, empId) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const res = await api.post("/cases/assign", { caseId, employeeId: empId });
      if (res && res.success) {
        setSuccessMsg(res.message || "Case assigned successfully!");
        await loadCases(casePage);
        await loadManagementReports();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to assign case.");
    }
  };

  const handleQuickStatusChange = async (caseId, newStatus) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const res = await api.patch(`/cases/${caseId}/status`, {
        newStatus,
        remarks: `Quick status transition to ${newStatus} from Case Allocation desk`
      });
      if (res && res.success) {
        setSuccessMsg(`Status updated to '${newStatus}' with atomic entry in case_status_history!`);
        await loadCases(casePage);
        await loadManagementReports();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update case status.");
    }
  };

  const handleAssignRangeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignEmp || !startRangeNum || !endRangeNum) {
      setErrorMsg("Please select an employee and enter valid start and end record numbers.");
      return;
    }

    try {
      setAssignLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/admin/records/assign", {
        employeeId: selectedAssignEmp,
        startRecordNum: parseInt(startRangeNum, 10),
        endRecordNum: parseInt(endRangeNum, 10)
      });

      if (res.success) {
        setSuccessMsg(res.message);
        await loadAdminRecords();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to assign records range.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleQuickPresetAssign = async (empId, startNum, endNum) => {
    setSelectedAssignEmp(empId);
    setStartRangeNum(String(startNum));
    setEndRangeNum(String(endNum));

    try {
      setAssignLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/admin/records/assign", {
        employeeId: empId,
        startRecordNum: startNum,
        endRecordNum: endNum
      });

      if (res.success) {
        setSuccessMsg(res.message);
        await loadAdminRecords();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to assign preset range.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleFileUploadInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploadLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          setErrorMsg("The uploaded workbook has no sheets.");
          setFileUploadLoading(false);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawRows || rawRows.length < 2) {
          setErrorMsg("The uploaded file must contain at least a header row and data rows.");
          setFileUploadLoading(false);
          return;
        }

        const firstRow = rawRows[0] || [];
        let lastValidHeaderIdx = -1;
        for (let i = 0; i < firstRow.length; i++) {
          if (firstRow[i] !== undefined && firstRow[i] !== null && String(firstRow[i]).trim() !== "") {
            lastValidHeaderIdx = i;
          }
        }

        if (lastValidHeaderIdx === -1) {
          setErrorMsg("Could not detect any column headers in the first row of this file.");
          setFileUploadLoading(false);
          return;
        }

        const headers = firstRow.slice(0, lastValidHeaderIdx + 1).map((h, idx) => {
          const val = h !== undefined && h !== null ? String(h).trim() : "";
          return val || `Column ${idx + 1}`;
        });

        const parsedRecords = [];
        for (let r = 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || !row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== "")) {
            continue;
          }
          const rowData = {};
          headers.forEach((header, colIdx) => {
            rowData[header] = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]) : "";
          });
          parsedRecords.push({ data: rowData });
        }

        if (parsedRecords.length === 0) {
          setErrorMsg("No data rows found below the header row in this file.");
          setFileUploadLoading(false);
          return;
        }

        const res = await api.post("/admin/records/upload", {
          records: parsedRecords,
          columns: headers,
          mode: "replace"
        });

        if (res.success) {
          setSuccessMsg("Uploaded customer loan data successfully!");
          await loadAdminRecords();
          await loadCases(1);
        }
      } catch (err) {
        setErrorMsg("Failed to upload/parse file: " + err.message);
      } finally {
        setFileUploadLoading(false);
        e.target.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const togglePasswordVisibility = (empId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  const copyToClipboard = (text, idKey) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleCreateEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmployeeForm.fullName.trim()) {
      setModalError("Employee full name is required.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      const res = await api.post("/admin/employees", newEmployeeForm);
      if (res.success) {
        setSuccessMsg(
          `Employee ${res.employee.fullName} registered successfully! ID: ${res.employee.employeeId} | Password: ${res.employee.initialPassword}`
        );
        setShowAddModal(false);
        setNewEmployeeForm({
          fullName: "",
          employeeId: "",
          email: "",
          phone: "",
          department: "Operations",
          designation: "Executive",
          password: "Emp@123",
          joiningDate: new Date().toISOString().split("T")[0]
        });
        loadAdminAttendance();
      }
    } catch (err) {
      setModalError(err.message || "Failed to create employee.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleApproveLeave = async (id) => {
    try {
      const res = await api.patch(`/attendance/leave/${id}/status`, {
        status: "APPROVED",
        remarks: "Approved by Operations Administrator"
      });
      if (res && res.success) {
        setSuccessMsg(`Leave request ${id} approved successfully!`);
        await loadLeaveApprovals();
      }
    } catch (err) {
      setErrorMsg("Failed to approve leave: " + err.message);
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      const res = await api.patch(`/attendance/leave/${id}/status`, {
        status: "REJECTED",
        remarks: "Rejected by Operations Administrator"
      });
      if (res && res.success) {
        setSuccessMsg(`Leave request ${id} rejected.`);
        await loadLeaveApprovals();
      }
    } catch (err) {
      setErrorMsg("Failed to reject leave: " + err.message);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatMinutes = (mins) => {
    if (mins === null || mins === undefined) return "--";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const formatDurationSeconds = (sec) => {
    if (!sec || sec <= 0) return "0s";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Filter attendance records
  const filteredAttendance = attendanceData.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(attSearchTerm.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(attSearchTerm.toLowerCase()) ||
      item.department?.toLowerCase().includes(attSearchTerm.toLowerCase());
    const matchesStatus = attStatusFilter === "ALL" ? true : item.status === attStatusFilter;
    const matchesDept = attDeptFilter === "ALL" ? true : item.department === attDeptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const departments = Array.from(new Set(attendanceData.map((d) => d.department).filter(Boolean)));

  // Filter calls
  const filteredCalls = callsList.filter((call) => {
    const matchesStatus = callFilterStatus === "ALL" ? true : call.status === callFilterStatus;
    const term = callSearchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      call.customer_name?.toLowerCase().includes(term) ||
      call.case_number?.toLowerCase().includes(term) ||
      call.employee_id?.toLowerCase().includes(term) ||
      call.call_outcome?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="portal-layout">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div className="portal-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`portal-sidebar ${mobileSidebarOpen ? "mobile-drawer-open" : ""}`}>
        <div className="portal-sidebar-brand" onClick={onBackToHome} role="button" tabIndex={0}>
          <div className="brand-icon">
            <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="logo-img" />
          </div>
          <div className="brand-text">
            <span>Pay<strong>Magic</strong></span>
            <span className="portal-tag-pill admin-pill">ADMIN</span>
          </div>
        </div>

        <div className="sidebar-user-card admin-user-card">
          <div className="user-avatar-circle admin-avatar-circle">
            {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="user-meta">
            <h4>{user?.fullName || "System Admin"}</h4>
            <p>{user?.employeeId || "PM-ADMIN-0001"}</p>
            <span className="user-role-tag admin-tag">{user?.role || "ADMINISTRATOR"}</span>
          </div>
        </div>

        <nav className="portal-nav">
          {/* Feature 7 & 5: Management Analytics & Reports */}
          <button
            className={`portal-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => { setActiveTab("analytics"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            <span>Management Analytics</span>
          </button>

          {/* Feature 3: Recovery Case Allocation */}
          <button
            className={`portal-nav-item ${activeTab === "cases" ? "active" : ""}`}
            onClick={() => { setActiveTab("cases"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span>Recovery Case Allocation</span>
          </button>

          {/* Feature 1 & 4: Call History & Audio Evidence */}
          <button
            className={`portal-nav-item ${activeTab === "calls" ? "active" : ""}`}
            onClick={() => { setActiveTab("calls"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <PhoneCall className="w-5 h-5 shrink-0" />
            <span>Call Records &amp; Audio</span>
          </button>

          {/* Feature 5: Recovery Amount & Payments */}
          <button
            className={`portal-nav-item ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => { setActiveTab("payments"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <IndianRupee className="w-5 h-5 shrink-0" />
            <span>Payment &amp; Recovery</span>
          </button>

          {/* Feature 6: Performance & Leaderboard */}
          <button
            className={`portal-nav-item ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => { setActiveTab("performance"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <TrendingUp className="w-5 h-5 shrink-0" />
            <span>Team Performance</span>
          </button>

          {/* Feature 2: Live Attendance & Shifts */}
          <button
            className={`portal-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveTab("attendance"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span>Live Attendance</span>
          </button>

          {/* Module D: Field Recovery Visits with GPS Audit */}
          <button
            className={`portal-nav-item ${activeTab === "field-visits" ? "active" : ""}`}
            onClick={() => { setActiveTab("field-visits"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Field Recovery Visits</span>
          </button>

          {/* Staff Directory & Passwords */}
          <button
            className={`portal-nav-item ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => { setActiveTab("employees"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span>Staff Directory</span>
          </button>

          {/* Leave Approvals */}
          <button
            className={`portal-nav-item ${activeTab === "leave-approvals" ? "active" : ""}`}
            onClick={() => { setActiveTab("leave-approvals"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span>Leave Approvals</span>
          </button>

          {/* Module G: Grievances & Disputes */}
          <button
            className={`portal-nav-item ${activeTab === "complaints" ? "active" : ""}`}
            onClick={() => { setActiveTab("complaints"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <Scale className="w-5 h-5 shrink-0" />
            <span>Grievance &amp; Disputes</span>
          </button>

          {/* Module H: Automated Reminders & Notifications */}
          <button
            className={`portal-nav-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => { setActiveTab("notifications"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <Bell className="w-5 h-5 shrink-0" />
            <span>Reminders &amp; Queue</span>
          </button>
        </nav>

        <div className="portal-sidebar-footer">
          <button className="portal-logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="portal-main">
        {/* Top Header */}
        <header className="portal-topbar">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              className="portal-mobile-toggle-btn shrink-0"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="topbar-title-wrap min-w-0">
              <h2>
                {activeTab === "analytics" && "Management Reports & Analytics"}
                {activeTab === "cases" && "Recovery Case Management & Allocation"}
                {activeTab === "calls" && "Call History & Audio Evidence"}
                {activeTab === "payments" && "Recovery Amount & Payment Tracking"}
                {activeTab === "performance" && "Employee Performance & Leaderboards"}
                {activeTab === "attendance" && "Live Staff Attendance Roster"}
                {activeTab === "employees" && "Staff Directory & Security Passwords"}
                {activeTab === "leave-approvals" && "HR Leave Approval Desk"}
                {activeTab === "field-visits" && "Field Recovery Operations Hub"}
                {activeTab === "complaints" && "Grievance & Dispute Management Desk"}
                {activeTab === "notifications" && "Automated Reminders, Notifications & Queue Hub"}
              </h2>
            </div>
          </div>

          <div className="topbar-actions flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Topbar Notification Bell for Module H */}
            <NotificationBell
              currentUser={user}
              onNavigateToHub={() => {
                setActiveTab("notifications");
                setErrorMsg("");
              }}
            />

            <button
              className="refresh-btn"
              onClick={() => {
                loadManagementReports();
                loadCases(casePage);
                loadCalls();
                loadPayments();
                loadTeamPerformance();
                loadAdminAttendance();
              }}
              title="Refresh Platform Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="portal-alert-bar alert-error" style={{ margin: "16px 24px 0" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="portal-alert-bar alert-success" style={{ margin: "16px 24px 0" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 1: MANAGEMENT ANALYTICS & REPORTS (Feature 7 & 5)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <ManagementAnalyticsPage
            adminOverview={adminOverview}
            reportsLoading={reportsLoading}
            reportsData={reportsData}
            handleExportCSV={handleExportCSV}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: CASE ALLOCATION & OPERATIONS (Feature 3 & Module A)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "cases" && (
          <CaseAllocationPage
            adminOverview={adminOverview}
            casesPagination={casesPagination}
            employeesList={employeesList}
            fileUploadLoading={fileUploadLoading}
            handleFileUploadInput={handleFileUploadInput}
            setShowBulkAllocateModal={setShowBulkAllocateModal}
            setShowTransferModal={setShowTransferModal}
            setShowTargetModal={setShowTargetModal}
            handleExportCasesCSV={handleExportCasesCSV}
            caseFilterStatus={caseFilterStatus}
            setCaseFilterStatus={setCaseFilterStatus}
            CASE_STATUSES={CASE_STATUSES}
            STATUS_PILL_CLASSES={STATUS_PILL_CLASSES}
            caseSearchTerm={caseSearchTerm}
            setCaseSearchTerm={setCaseSearchTerm}
            loadCases={loadCases}
            casesLoading={casesLoading}
            casesList={casesList}
            handleQuickStatusChange={handleQuickStatusChange}
            handleInlineAssign={handleInlineAssign}
            setSelectedCaseId={setSelectedCaseId}
            setShowCaseDetailModal={setShowCaseDetailModal}
            setSelectedPaymentCase={setSelectedPaymentCase}
            setShowPaymentModal={setShowPaymentModal}
            casePage={casePage}
            setCasePage={setCasePage}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: CALL ACTIVITY REPORT & CDR AUDIO EVIDENCE (Feature 1 & 4)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "calls" && (
          <CallRecordsAudioPage
            user={user}
            setSelectedCallAudio={setSelectedCallAudio}
            setShowAudioModal={setShowAudioModal}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 4: PAYMENT & RECOVERY TRACKING (Feature 5)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "payments" && (
          <PaymentRecoveryPage
            paymentsSummary={paymentsSummary}
            paymentsList={paymentsList}
            paymentsLoading={paymentsLoading}
            casesList={casesList}
            setSelectedPaymentCase={setSelectedPaymentCase}
            setShowPaymentModal={setShowPaymentModal}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 5: PERFORMANCE & LEADERBOARD (Feature 6 & Module C)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "performance" && (
          <TeamPerformancePage />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 6: LIVE ATTENDANCE (Feature 2)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <LiveAttendancePage
            attendanceSummary={attendanceSummary}
            attSearchTerm={attSearchTerm}
            setAttSearchTerm={setAttSearchTerm}
            attStatusFilter={attStatusFilter}
            setAttStatusFilter={setAttStatusFilter}
            attDeptFilter={attDeptFilter}
            setAttDeptFilter={setAttDeptFilter}
            departments={departments}
            filteredAttendance={filteredAttendance}
            formatTime={formatTime}
            formatMinutes={formatMinutes}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 7: STAFF DIRECTORY & PASSWORDS
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "employees" && (
          <StaffDirectoryPage
            employeesList={employeesList}
            setShowAddModal={setShowAddModal}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 8: MODULE E — FIELD RECOVERY OPERATIONS HUB
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "field-visits" && (
          <FieldRecoveryVisitsPage
            setShowScheduleVisitModal={setShowScheduleVisitModal}
            loadFieldVisits={loadFieldVisits}
            loadFieldOverview={loadFieldOverview}
            loadCashHandovers={loadCashHandovers}
            fieldOverviewData={fieldOverviewData}
            fieldVisitsList={fieldVisitsList}
            fieldVisitsLoading={fieldVisitsLoading}
            cashHandoversList={cashHandoversList}
            cashHandoversLoading={cashHandoversLoading}
            setSelectedReceiptRef={setSelectedReceiptRef}
            setShowDigitalReceiptModal={setShowDigitalReceiptModal}
            handleReconcileCash={handleReconcileCash}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 9: LEAVE APPROVALS & SUPERVISOR DESK (Module D)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "leave-approvals" && (
          <LeaveApprovalsPage
            leaveApprovals={leaveApprovals}
            leaveLoading={leaveLoading}
            loadLeaveApprovals={loadLeaveApprovals}
            handleApproveLeave={handleApproveLeave}
            handleRejectLeave={handleRejectLeave}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 10: COMPLAINT & DISPUTE MANAGEMENT DESK (Module G)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "complaints" && (
          <GrievanceDisputesPage user={user} />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 11: AUTOMATED REMINDERS & NOTIFICATION QUEUE (Module H)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <RemindersQueuePage
            user={user}
            setSelectedCaseId={setSelectedCaseId}
            setShowCaseDetailModal={setShowCaseDetailModal}
          />
        )}
      </main>

      {/* ── MODALS ── */}

      {/* Case Detail & Status History Modal */}
      {showCaseDetailModal && selectedCaseId && (
        <CaseDetailModal
          caseId={selectedCaseId}
          isOpen={showCaseDetailModal}
          onClose={() => {
            setShowCaseDetailModal(false);
            setSelectedCaseId(null);
          }}
          onUpdate={() => {
            loadCases(casePage);
            loadManagementReports();
          }}
        />
      )}

      {/* Audio Player Modal */}
      {showAudioModal && selectedCallAudio && (
        <AudioPlayerModal
          callData={selectedCallAudio}
          isOpen={showAudioModal}
          currentUser={user}
          onClose={() => {
            setShowAudioModal(false);
            setSelectedCallAudio(null);
          }}
        />
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedPaymentCase && (
        <PaymentModal
          caseData={selectedPaymentCase}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPaymentCase(null);
          }}
          onPaymentRecorded={(data) => {
            setSuccessMsg(`Payment of ₹${data.payment?.amount?.toLocaleString()} recorded successfully!`);
            loadPayments();
            loadCases(casePage);
            loadManagementReports();
          }}
        />
      )}

      {/* Bulk Allocation Modal */}
      {showBulkAllocateModal && (
        <BulkAllocateModal
          employees={employeesList}
          isOpen={showBulkAllocateModal}
          onClose={() => setShowBulkAllocateModal(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            loadCases(1);
            loadManagementReports();
          }}
        />
      )}

      {/* Transfer Cases Modal */}
      {showTransferModal && (
        <TransferCasesModal
          employees={employeesList}
          cases={casesList}
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            loadCases(casePage);
            loadManagementReports();
          }}
        />
      )}

      {/* Set Target & Follow-up Modal */}
      {showTargetModal && (
        <SetTargetModal
          employees={employeesList}
          cases={casesList}
          isOpen={showTargetModal}
          onClose={() => setShowTargetModal(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            loadCases(casePage);
            loadManagementReports();
          }}
        />
      )}

      {/* Add Employee Modal (Preserved) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100">
            <h3 className="font-bold text-lg text-white mb-4">Register New Operations Staff</h3>
            {modalError && <div className="portal-alert-bar alert-error mb-4">{modalError}</div>}
            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmployeeForm.fullName}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={newEmployeeForm.employeeId}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newEmployeeForm.designation}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  {modalLoading ? "Saving..." : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Schedule Field Recovery Visit Modal (Module E) */}
      {showScheduleVisitModal && (
        <ScheduleFieldVisitModal
          isOpen={showScheduleVisitModal}
          cases={casesList}
          onClose={() => setShowScheduleVisitModal(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            loadFieldVisits();
            loadFieldOverview();
            loadCases(casePage);
          }}
        />
      )}

      {/* Digital Receipt Modal (Module E) */}
      {showDigitalReceiptModal && selectedReceiptRef && (
        <DigitalReceiptModal
          receiptNumber={selectedReceiptRef}
          isOpen={showDigitalReceiptModal}
          onClose={() => {
            setShowDigitalReceiptModal(false);
            setSelectedReceiptRef(null);
          }}
        />
      )}

      {/* Floating WebPhone Dialer Widget */}
      <WebPhoneDialer
        user={user}
        cases={casesList}
        onCallCase={(loanCase) => {
          setAdminCallingCase(loanCase);
          setShowAdminCallingModal(true);
        }}
      />

      {/* Calling Voice Bridge Modal for WebPhone / Click-to-Call */}
      {showAdminCallingModal && adminCallingCase && (
        <CallingModal
          caseData={adminCallingCase}
          isOpen={showAdminCallingModal}
          onClose={() => {
            setShowAdminCallingModal(false);
            setAdminCallingCase(null);
          }}
          onCallCompleted={() => {
            setShowAdminCallingModal(false);
            setAdminCallingCase(null);
            loadCases(casePage);
            loadManagementReports();
          }}
        />
      )}
    </div>
  );
}
