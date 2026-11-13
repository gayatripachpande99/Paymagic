import { useState, useEffect } from "react";
import api from "../services/api";
import {
  TrendingUp,
  PhoneCall,
  IndianRupee,
  Clock,
  Layers,
  Calendar,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  MapPin,
  Activity,
  Navigation,
  QrCode,
  Receipt,
  Building2,
  Radio,
  Compass,
  ExternalLink
} from "lucide-react";

import CallingModal from "./portal/CallingModal";
import AudioPlayerModal from "./portal/AudioPlayerModal";
import PaymentModal from "./portal/PaymentModal";
import CaseDetailModal from "./portal/CaseDetailModal";
import WebPhoneDialer from "./portal/WebPhoneDialer";
import CallActivityReport from "./portal/CallActivityReport";
import PerformanceDashboard from "./portal/PerformanceDashboard";
import FieldVisitModal from "./portal/FieldVisitModal";
import CashHandoverModal from "./portal/CashHandoverModal";
import DigitalReceiptModal from "./portal/DigitalReceiptModal";

import {
  EmployeePerformancePage,
  MyRecoveryCasesPage,
  FieldVisitsAgentPage,
  MyCallHistoryPage,
  DailyAttendancePage,
  LeaveManagementPage,
  MyProfilePage,
  RegulatorySopPage
} from "../panels/employee/pages";

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

export default function EmployeeDashboard({ user, onLogout, onBackToHome }) {
  // Navigation tabs: dashboard | cases | calls | attendance | leave | profile | documents
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(user || null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [liveWorkingTime, setLiveWorkingTime] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── 1. EMPLOYEE PERFORMANCE KPIS (Feature 6) ──
  const [kpiData, setKpiData] = useState({
    assigned_cases: 150,
    total_calls: 120,
    connected_calls: 85,
    unanswered_calls: 35,
    total_talk_time_formatted: "4h 20m",
    follow_ups_pending: 18,
    promises_to_pay: 12,
    amount_recovered: 85000,
    target_amount: 100000,
    total_outstanding: 650000,
    call_connection_rate: 70.83,
    recovery_percentage: 13.08,
    target_achievement: 85.0
  });

  const [dashboardMode, setDashboardMode] = useState("scorecard"); // "scorecard" | "team-analytics"

  // ── 2. MY ASSIGNED RECOVERY CASES (Feature 3) ──
  const [myCases, setMyCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [caseFilterStatus, setCaseFilterStatus] = useState("ALL");
  const [caseSearchTerm, setCaseSearchTerm] = useState("");

  // ── 3. MY CALL HISTORY (Feature 4) ──
  const [myCalls, setMyCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);

  // ── 4. FIELD VISITS & GPS TRACKING (Module D & Module E) ──
  const [fieldVisits, setFieldVisits] = useState([]);
  const [fieldVisitsLoading, setFieldVisitsLoading] = useState(false);
  const [fieldVisitCase, setFieldVisitCase] = useState(null);
  const [showFieldVisitModal, setShowFieldVisitModal] = useState(false);
  const [myRouteData, setMyRouteData] = useState(null);
  const [showCashHandoverModal, setShowCashHandoverModal] = useState(false);
  const [selectedReceiptRef, setSelectedReceiptRef] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // ── 5. DAILY PRODUCTIVITY (Module D) ──
  const [productivityData, setProductivityData] = useState(null);

  // ── 6. LEAVE MANAGEMENT (Feature 2) ──
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "LV-102",
      type: "Casual Leave",
      fromDate: "2026-09-15",
      toDate: "2026-09-16",
      days: 2,
      reason: "Family event",
      status: "APPROVED",
      appliedOn: "2026-09-10"
    }
  ]);

  // ── MODALS STATE ──
  // Click-to-call modal
  const [callingCase, setCallingCase] = useState(null);
  const [showCallingModal, setShowCallingModal] = useState(false);

  // Payment recording modal
  const [paymentCase, setPaymentCase] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Audio player modal
  const [audioCall, setAudioCall] = useState(null);
  const [showAudioModal, setShowAudioModal] = useState(false);

  // Case details timeline modal
  const [timelineCaseId, setTimelineCaseId] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  // ── DATA FETCHERS ──

  const loadEmployeeDashboard = async () => {
    try {
      const res = await api.get("/dashboard/employee");
      if (res && res.success && res.data) {
        if (res.data.kpis) {
          setKpiData(res.data.kpis);
        }
        if (res.data.employee) {
          setProfile((prev) => ({ ...prev, ...res.data.employee }));
        }
      }
    } catch (err) {
      console.warn("Employee KPI fetch warning:", err.message);
    }
  };

  const loadMyCases = async () => {
    try {
      setCasesLoading(true);
      const res = await api.get("/cases?limit=100");
      if (res && res.success && res.data) {
        setMyCases(res.data.cases || []);
      }
    } catch (err) {
      console.error("My cases fetch error:", err);
    } finally {
      setCasesLoading(false);
    }
  };

  const loadMyCalls = async () => {
    try {
      setCallsLoading(true);
      const res = await api.get("/telephony/calls?limit=50");
      if (res && res.success && res.data) {
        setMyCalls(res.data.calls || []);
      }
    } catch (err) {
      console.error("My calls fetch error:", err);
    } finally {
      setCallsLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const [todayRes, historyRes, meRes] = await Promise.allSettled([
        api.get("/attendance/today"),
        api.get("/attendance/history"),
        api.get("/employee/me")
      ]);

      if (todayRes.status === "fulfilled" && todayRes.value.success) {
        setTodayAttendance(todayRes.value.attendance);
      }
      if (historyRes.status === "fulfilled" && historyRes.value.success) {
        setHistory(historyRes.value.attendance || []);
      }
      if (meRes.status === "fulfilled" && meRes.value.success) {
        setProfile(meRes.value.employee);
      }
    } catch (err) {
      console.warn("Attendance load warning:", err.message);
    }
  };

  const loadFieldVisits = async () => {
    try {
      setFieldVisitsLoading(true);
      const res = await api.get("/cases/field-visits");
      if (res && res.success) {
        setFieldVisits(res.visits || []);
      }
    } catch (err) {
      console.warn("Field visits fetch error:", err.message);
    } finally {
      setFieldVisitsLoading(false);
    }
  };

  const loadProductivity = async () => {
    try {
      const res = await api.get("/attendance/productivity");
      if (res && res.success) {
        setProductivityData(res.productivity);
      }
    } catch (err) {
      console.warn("Productivity fetch error:", err.message);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const res = await api.get("/attendance/leave");
      if (res && res.success && res.leaveRequests?.length) {
        setLeaveRequests(res.leaveRequests);
      }
    } catch (err) {
      console.warn("Leave requests fetch error:", err.message);
    }
  };

  const loadMyRoute = async () => {
    try {
      const res = await api.get("/field/my-route");
      if (res && res.success) {
        setMyRouteData(res);
      }
    } catch (err) {
      console.warn("Route fetch error:", err);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmployeeDashboard(),
        loadMyCases(),
        loadMyCalls(),
        loadAttendanceData(),
        loadFieldVisits(),
        loadProductivity(),
        loadLeaveRequests(),
        loadMyRoute()
      ]);
    } catch (err) {
      console.error("Dashboard initial load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Live timer ticker for active working session
  useEffect(() => {
    let interval = null;
    if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
      const updateTimer = () => {
        const checkInTime = new Date(todayAttendance.checkIn).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - checkInTime);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setLiveWorkingTime(
          `${hours.toString().padStart(2, "0")}h ${minutes
            .toString()
            .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
        );
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setLiveWorkingTime("");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayAttendance]);

  // Attendance Actions
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/attendance/check-in", {});
      if (res.success) {
        setTodayAttendance(res.attendance);
        setSuccessMsg("Attendance marked successfully! Have a productive recovery shift.");
        const hist = await api.get("/attendance/history");
        if (hist.success) setHistory(hist.attendance || []);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to mark attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/attendance/check-out", {});
      if (res.success) {
        setTodayAttendance(res.attendance);
        setSuccessMsg("Shift completed and checked out successfully! Great recovery work today.");
        const hist = await api.get("/attendance/history");
        if (hist.success) setHistory(hist.attendance || []);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to check out.");
    } finally {
      setActionLoading(false);
    }
  };

  // Leave Action
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !leaveReason) {
      setErrorMsg("Please provide from date, to date, and reason.");
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg("");
      const res = await api.post("/attendance/leave", {
        type: leaveType,
        fromDate,
        toDate,
        reason: leaveReason
      });

      if (res && res.success) {
        setLeaveRequests((prev) => [res.leave, ...prev]);
        setSuccessMsg("Leave application submitted successfully for supervisor review.");
      } else {
        const newReq = {
          id: `LV-${Math.floor(100 + Math.random() * 900)}`,
          type: leaveType,
          fromDate,
          toDate,
          days: Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1),
          reason: leaveReason,
          status: "PENDING",
          appliedOn: new Date().toISOString().split("T")[0]
        };
        setLeaveRequests((prev) => [newReq, ...prev]);
        setSuccessMsg("Leave application submitted successfully for supervisor review.");
      }
      setFromDate("");
      setToDate("");
      setLeaveReason("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit leave application.");
    } finally {
      setActionLoading(false);
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

  // Filter assigned cases
  const filteredCases = myCases.filter((item) => {
    const matchesStatus = caseFilterStatus === "ALL" ? true : item.status === caseFilterStatus;
    const term = caseSearchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      item.customer_name?.toLowerCase().includes(term) ||
      item.loan_account_no?.toLowerCase().includes(term) ||
      item.case_number?.toLowerCase().includes(term) ||
      item.lender_name?.toLowerCase().includes(term);
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
            <span className="portal-tag-pill">EMPLOYEE</span>
          </div>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar-circle">
            {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : "EM"}
          </div>
          <div className="user-meta">
            <h4>{profile?.fullName || "Operations Executive"}</h4>
            <p>{profile?.employeeId || "PM-EMP-0001"}</p>
            <span className="user-role-tag">{profile?.designation || "Recovery Caller"}</span>
          </div>
        </div>

        <nav className="portal-nav">
          {/* Feature 6: Employee Performance Dashboard */}
          <button
            className={`portal-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => { setActiveTab("dashboard"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <TrendingUp className="w-5 h-5 shrink-0" />
            <span>Performance Dashboard</span>
          </button>

          {/* Feature 3: Recovery Cases & Click-to-call */}
          <button
            className={`portal-nav-item ${activeTab === "cases" ? "active" : ""}`}
            onClick={() => { setActiveTab("cases"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span>My Recovery Cases</span>
          </button>

          {/* Module D: Field Recovery Visits */}
          <button
            className={`portal-nav-item ${activeTab === "field-visits" ? "active" : ""}`}
            onClick={() => { setActiveTab("field-visits"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Field Visits &amp; GPS</span>
          </button>

          {/* Feature 4: Call History & Audio */}
          <button
            className={`portal-nav-item ${activeTab === "calls" ? "active" : ""}`}
            onClick={() => { setActiveTab("calls"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <PhoneCall className="w-5 h-5 shrink-0" />
            <span>My Call History</span>
          </button>

          {/* Feature 2: Attendance & Shifts */}
          <button
            className={`portal-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveTab("attendance"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span>Attendance &amp; Shifts</span>
          </button>

          {/* Feature 2: Leave Management */}
          <button
            className={`portal-nav-item ${activeTab === "leave" ? "active" : ""}`}
            onClick={() => { setActiveTab("leave"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span>Leave Management</span>
          </button>

          {/* Profile */}
          <button
            className={`portal-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <User className="w-5 h-5 shrink-0" />
            <span>My Profile</span>
          </button>

          {/* Documents */}
          <button
            className={`portal-nav-item ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => { setActiveTab("documents"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span>Regulatory &amp; SOP</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="portal-mobile-toggle-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="topbar-title-wrap">
              <h2>
                {activeTab === "dashboard" && "Employee Recovery Performance"}
                {activeTab === "cases" && "My Assigned Loan Recovery Cases"}
                {activeTab === "field-visits" && "Authorized Field Recovery Visits & On-Site Collections"}
                {activeTab === "calls" && "My Outbound Call Records"}
                {activeTab === "attendance" && "Daily Shift Attendance & Productivity"}
                {activeTab === "leave" && "Employee Leave Portal"}
                {activeTab === "profile" && "My Profile & Employment Details"}
                {activeTab === "documents" && "Regulatory Guidelines & Training"}
              </h2>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="refresh-btn"
              onClick={loadAll}
              title="Refresh My Workspace"
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
            TAB 1: PERFORMANCE DASHBOARD (Feature 6)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <EmployeePerformancePage
            todayAttendance={todayAttendance}
            liveWorkingTime={liveWorkingTime}
            handleCheckIn={handleCheckIn}
            handleCheckOut={handleCheckOut}
            actionLoading={actionLoading}
            formatTime={formatTime}
            formatMinutes={formatMinutes}
            dashboardMode={dashboardMode}
            setDashboardMode={setDashboardMode}
            kpiData={kpiData}
            myCases={myCases}
            setActiveTab={setActiveTab}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: MY ASSIGNED RECOVERY CASES (Feature 3 & 1)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "cases" && (
          <MyRecoveryCasesPage
            caseSearchTerm={caseSearchTerm}
            setCaseSearchTerm={setCaseSearchTerm}
            caseFilterStatus={caseFilterStatus}
            setCaseFilterStatus={setCaseFilterStatus}
            CASE_STATUSES={CASE_STATUSES}
            STATUS_PILL_CLASSES={STATUS_PILL_CLASSES}
            filteredCases={filteredCases}
            casesLoading={casesLoading}
            setCallingCase={setCallingCase}
            setShowCallingModal={setShowCallingModal}
            setPaymentCase={setPaymentCase}
            setShowPaymentModal={setShowPaymentModal}
            setFieldVisitCase={setFieldVisitCase}
            setShowFieldVisitModal={setShowFieldVisitModal}
            setTimelineCaseId={setTimelineCaseId}
            setShowTimelineModal={setShowTimelineModal}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: FIELD VISITS & GROUND ROUTE (Module D & Module E)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "field-visits" && (
          <FieldVisitsAgentPage
            myRouteData={myRouteData}
            setShowCashHandoverModal={setShowCashHandoverModal}
            myCases={myCases}
            setFieldVisitCase={setFieldVisitCase}
            setShowFieldVisitModal={setShowFieldVisitModal}
            setErrorMsg={setErrorMsg}
            fieldVisits={fieldVisits}
            fieldVisitsLoading={fieldVisitsLoading}
            formatTime={formatTime}
            setSelectedReceiptRef={setSelectedReceiptRef}
            setShowReceiptModal={setShowReceiptModal}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 4: MY CALL ACTIVITY & AUDIO EVIDENCE (Feature 1 & 4)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "calls" && (
          <MyCallHistoryPage
            user={user}
            setAudioCall={setAudioCall}
            setShowAudioModal={setShowAudioModal}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 5: ATTENDANCE & SHIFTS (Feature 2 & Module D)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <DailyAttendancePage
            productivityData={productivityData}
            todayAttendance={todayAttendance}
            liveWorkingTime={liveWorkingTime}
            handleCheckIn={handleCheckIn}
            handleCheckOut={handleCheckOut}
            actionLoading={actionLoading}
            history={history}
            formatTime={formatTime}
            formatMinutes={formatMinutes}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 6: LEAVE MANAGEMENT (Feature 2)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "leave" && (
          <LeaveManagementPage
            handleApplyLeave={handleApplyLeave}
            leaveType={leaveType}
            setLeaveType={setLeaveType}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            leaveReason={leaveReason}
            setLeaveReason={setLeaveReason}
            leaveRequests={leaveRequests}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 7: PROFILE
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <MyProfilePage profile={profile} kpiData={kpiData} />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 8: DOCUMENTS & SOP
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "documents" && (
          <RegulatorySopPage />
        )}
      </main>

      {/* ── MODALS ── */}

      {/* Feature 1: Calling Modal with Live Timer & Mandatory Outcome */}
      {showCallingModal && callingCase && (
        <CallingModal
          caseData={callingCase}
          isOpen={showCallingModal}
          onClose={() => {
            setShowCallingModal(false);
            setCallingCase(null);
          }}
          onCallCompleted={(outcomeResult) => {
            setSuccessMsg("Call outcome saved & case status updated in transaction audit trail!");
            loadMyCases();
            loadMyCalls();
            loadEmployeeDashboard();
          }}
        />
      )}

      {/* Feature 5: Record Recovery Payment Modal */}
      {showPaymentModal && paymentCase && (
        <PaymentModal
          caseData={paymentCase}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentCase(null);
          }}
          onPaymentRecorded={(data) => {
            setSuccessMsg(`Payment of ₹${data.payment?.amount?.toLocaleString()} recorded successfully!`);
            loadMyCases();
            loadEmployeeDashboard();
          }}
        />
      )}

      {/* Feature 4: Audio Evidence Player Modal */}
      {showAudioModal && audioCall && (
        <AudioPlayerModal
          callData={audioCall}
          isOpen={showAudioModal}
          currentUser={user}
          onClose={() => {
            setShowAudioModal(false);
            setAudioCall(null);
          }}
        />
      )}

      {/* Feature 3: Case Details & Status History Modal */}
      {showTimelineModal && timelineCaseId && (
        <CaseDetailModal
          caseId={timelineCaseId}
          isOpen={showTimelineModal}
          onClose={() => {
            setShowTimelineModal(false);
            setTimelineCaseId(null);
          }}
          onUpdate={() => {
            loadMyCases();
            loadEmployeeDashboard();
          }}
        />
      )}

      {/* Module D: Authorized Field Visit & GPS Modal */}
      {showFieldVisitModal && fieldVisitCase && (
        <FieldVisitModal
          loanCase={fieldVisitCase}
          onClose={() => {
            setShowFieldVisitModal(false);
            setFieldVisitCase(null);
          }}
          onSuccess={() => {
            setSuccessMsg("Field visit and outcome recorded with verified GPS coordinates!");
            loadFieldVisits();
            loadMyRoute();
            loadMyCases();
            loadProductivity();
            loadEmployeeDashboard();
          }}
        />
      )}

      {/* Module E: Cash Handover Modal */}
      {showCashHandoverModal && (
        <CashHandoverModal
          isOpen={showCashHandoverModal}
          cashInHand={myRouteData?.agent?.cash_in_hand || 8500}
          onClose={() => setShowCashHandoverModal(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            loadMyRoute();
            loadFieldVisits();
          }}
        />
      )}

      {/* Module E: Digital Receipt Modal */}
      {showReceiptModal && selectedReceiptRef && (
        <DigitalReceiptModal
          isOpen={showReceiptModal}
          receiptNumber={selectedReceiptRef}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceiptRef(null);
          }}
        />
      )}

      {/* Floating WebPhone Dialer for Telecaller Voice Recovery */}
      <WebPhoneDialer
        user={user}
        cases={myCases}
        onCallCase={(loanCase) => {
          setCallingCase(loanCase);
          setShowCallingModal(true);
        }}
      />
    </div>
  );
}
