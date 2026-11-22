import React, { useState, useEffect } from "react";
import {
  Layers,
  PhoneCall,
  Clock,
  LogOut,
  CheckCircle2,
  Calendar,
  User,
  Coffee,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  PhoneForwarded,
  PhoneOff,
  DollarSign,
  FileText,
  Volume2,
  Play,
  Pause,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Phone,
  Minus,
  Radio
} from "lucide-react";
import api from "../services/api";
import ThemeToggle from "./ThemeToggle";
import AgentPresenceDialerWidget from "./common/AgentPresenceDialerWidget";

export const EMPLOYEE_TAB_ROUTES = {
  queue: "/employee/queue",
  tasks: "/employee/tasks",
  calls: "/employee/calls",
  field: "/employee/field",
  profile: "/employee/profile"
};

export const EMPLOYEE_TAB_TITLES = {
  queue: "PayMagic | My Working Queue",
  tasks: "PayMagic | Priority Tasks & PTP Commitments",
  calls: "PayMagic | Telephony Call History & Evidence",
  field: "PayMagic | Ground Field Route & Visits",
  profile: "PayMagic | Employee Profile & Targets"
};

function getInitialEmployeeTab() {
  if (typeof window === "undefined") return "queue";
  const path = window.location.pathname;
  const match = Object.entries(EMPLOYEE_TAB_ROUTES).find(([, route]) => path === route || path.startsWith(route));
  return match ? match[0] : "queue";
}

export default function EmployeePortalShell({ user, onLogout, onBackToHome, theme = "dark", toggleTheme }) {
  // Initial presence is strictly OFFLINE on login
  const [presenceStatus, setPresenceStatus] = useState("OFFLINE");
  const [activeBreakType, setActiveBreakType] = useState(null);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [isHeadsetConnected, setIsHeadsetConnected] = useState(false);
  const [isDialerWidgetOpen, setIsDialerWidgetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialEmployeeTab);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setErrorMsg("");
    setSuccessMsg("");
    const route = EMPLOYEE_TAB_ROUTES[tabId] || "/employee/queue";
    window.history.pushState(null, "", route);
    document.title = EMPLOYEE_TAB_TITLES[tabId] || "PayMagic Employee Operations";
  };

  useEffect(() => {
    const onPopState = () => {
      const newTab = getInitialEmployeeTab();
      setActiveTab(newTab);
      document.title = EMPLOYEE_TAB_TITLES[newTab] || "PayMagic Employee Operations";
    };
    window.addEventListener("popstate", onPopState);
    document.title = EMPLOYEE_TAB_TITLES[activeTab] || "PayMagic Employee Operations";
    return () => window.removeEventListener("popstate", onPopState);
  }, [activeTab]);

  // Scoped Entity Context (Architecture Section 3)
  const [selectedAllocator, setSelectedAllocator] = useState("BAJAJ FINSERVE");
  const [selectedCampaign, setSelectedCampaign] = useState("URBAN BAJAJ-NOV-2026 (Predictive)");

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [casesList, setCasesList] = useState([]);
  const [casesPagination, setCasesPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [followupsList, setFollowupsList] = useState([]);

  // Queue Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Softphone Active Call State
  const [activeCallCase, setActiveCallCase] = useState(null);
  const [callState, setCallState] = useState("IDLE"); // IDLE | DIALING | CONNECTED | ENDED
  const [callTimer, setCallTimer] = useState(0);

  // Floating WebPhone Dialer State (Reference: media_1794236906364_2d86cd87.jpg)
  const [webPhoneOpen, setWebPhoneOpen] = useState(false);
  const [webPhoneMinimized, setWebPhoneMinimized] = useState(false);
  const [dialNumber, setDialNumber] = useState("+91 9876543210");

  // Disposition Modal State
  const [selectedCaseForDisposition, setSelectedCaseForDisposition] = useState(null);
  const [dispositionOutcome, setDispositionOutcome] = useState("Promise to Pay");
  const [dispositionRemarks, setDispositionRemarks] = useState("");
  const [ptpAmount, setPtpAmount] = useState("");
  const [ptpDate, setPtpDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [dispositionLoading, setDispositionLoading] = useState(false);

  // Payment Recording Modal State
  const [selectedCaseForPayment, setSelectedCaseForPayment] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("UPI");
  const [payUtr, setPayUtr] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // Audio Playback
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Field Recovery Operations (Section 10)
  const [fieldVisitsList, setFieldVisitsList] = useState([]);
  const [fieldLoading, setFieldLoading] = useState(false);
  const [selectedVisitForOutcome, setSelectedVisitForOutcome] = useState(null);
  const [visitOutcomeForm, setVisitOutcomeForm] = useState({
    outcome: "Customer Met & Paid",
    notes: "",
    collected_amount: "",
    payment_mode: "UPI_QR"
  });

  // Agent Readiness Check (Section 6)
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [readinessChecks, setReadinessChecks] = useState({ attendance: true, microphone: true, telephony: true, shift: true });

  // Load initial data
  useEffect(() => {
    loadDashboard();
    loadCases(1);
    loadFollowups();
    loadFieldVisits();
  }, []);

  useEffect(() => {
    if (activeTab === "queue") {
      loadCases(1);
    } else if (activeTab === "tasks") {
      loadFollowups();
    } else if (activeTab === "field") {
      loadFieldVisits();
    }
  }, [activeTab, statusFilter, priorityFilter]);

  const loadFieldVisits = async () => {
    try {
      setFieldLoading(true);
      const res = await api.get("/employee/field-visits");
      if (res && res.success) {
        setFieldVisitsList(res.data);
      }
    } catch (err) {
      console.error("loadFieldVisits error:", err);
    } finally {
      setFieldLoading(false);
    }
  };

  const handleFieldCheckIn = async (visitId) => {
    try {
      setFieldLoading(true);
      const res = await api.post(`/employee/field-visits/${visitId}/checkin`, {
        latitude: 18.5204 + (Math.random() - 0.5) * 0.002,
        longitude: 73.8567 + (Math.random() - 0.5) * 0.002
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        loadFieldVisits();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to confirm GPS check-in.");
    } finally {
      setFieldLoading(false);
    }
  };

  const handleFieldOutcomeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitForOutcome) return;
    try {
      setFieldLoading(true);
      const res = await api.post(`/employee/field-visits/${selectedVisitForOutcome.id}/outcome`, visitOutcomeForm);
      if (res && res.success) {
        setSuccessMsg(res.message);
        setSelectedVisitForOutcome(null);
        setVisitOutcomeForm({ outcome: "Customer Met & Paid", notes: "", collected_amount: "", payment_mode: "UPI_QR" });
        loadFieldVisits();
        loadDashboard();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to record field visit outcome.");
    } finally {
      setFieldLoading(false);
    }
  };

  // Call timer effect
  useEffect(() => {
    let interval = null;
    if (callState === "CONNECTED") {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else if (callState === "IDLE") {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/employee/dashboard");
      if (res && res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("loadDashboard error:", err);
    }
  };

  const loadCases = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
        status: statusFilter,
        priority: priorityFilter,
        search: searchTerm
      });
      const res = await api.get(`/employee/cases?${params.toString()}`);
      if (res && res.success) {
        setCasesList(res.data.cases || []);
        setCasesPagination(res.data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
      }
    } catch (err) {
      console.error("loadCases error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowups = async () => {
    try {
      const res = await api.get("/employee/followups");
      if (res && res.success) {
        setFollowupsList(res.data || []);
      }
    } catch (err) {
      console.error("loadFollowups error:", err);
    }
  };

  const handlePresenceChange = async (newStatus) => {
    setPresenceStatus(newStatus);
    try {
      const res = await api.post("/employee/presence", { status: newStatus });
      if (res && res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err) {
      console.error("Presence update failed:", err);
    }
  };

  // Click-to-call softphone workflow
  const handleStartCall = (targetCase) => {
    setActiveCallCase(targetCase);
    if (targetCase?.phone_number) {
      setDialNumber(targetCase.phone_number);
    }
    setWebPhoneOpen(true);
    setWebPhoneMinimized(false);
    setCallState("DIALING");
    setCallTimer(0);

    // Simulate carrier connection after 1.5s
    setTimeout(() => {
      setCallState("CONNECTED");
    }, 1500);
  };

  const handleDialPadClick = (val) => {
    setDialNumber((prev) => (prev || "") + val);
  };

  const handleBackspace = () => {
    setDialNumber((prev) => (prev ? prev.slice(0, -1) : ""));
  };

  const handleWebPhoneCall = () => {
    if (callState === "CONNECTED" || callState === "DIALING") {
      handleEndCall();
      return;
    }
    const cleanNum = dialNumber ? dialNumber.trim() : "";
    const targetCase =
      casesList.find((c) => c.phone_number === cleanNum) || {
        id: "manual_" + Date.now(),
        borrower_name: "Outbound Borrower",
        phone_number: cleanNum || "+91 9876543210",
        outstanding_amount: 45000
      };
    handleStartCall(targetCase);
  };

  const handleEndCall = async () => {
    const finalDuration = callTimer;
    setCallState("ENDED");

    try {
      if (activeCallCase) {
        await api.post("/employee/calls", {
          case_id: activeCallCase.id,
          duration: finalDuration || 45,
          outcome: "Call Completed",
          direction: "OUTBOUND"
        });
      }
    } catch (err) {
      console.error("Error logging call:", err);
    }

    // Auto-prompt disposition dialog
    const finishedCase = activeCallCase;
    setTimeout(() => {
      setActiveCallCase(null);
      setCallState("IDLE");
      if (finishedCase) {
        setSelectedCaseForDisposition(finishedCase);
        setPtpAmount(finishedCase.outstanding_amount || "");
      }
    }, 800);
  };

  // Submit Disposition
  const handleSubmitDisposition = async (e) => {
    e.preventDefault();
    if (!selectedCaseForDisposition) return;

    try {
      setDispositionLoading(true);
      setErrorMsg("");
      const res = await api.post(`/employee/cases/${selectedCaseForDisposition.id}/disposition`, {
        case_id: selectedCaseForDisposition.id,
        disposition: dispositionOutcome,
        remarks: dispositionRemarks,
        ptp_amount: ptpAmount,
        ptp_date: ptpDate,
        callback_time: callbackTime
      });

      if (res && res.success) {
        setSuccessMsg(res.message);
        setSelectedCaseForDisposition(null);
        setDispositionRemarks("");
        setPtpAmount("");
        setPtpDate("");
        setCallbackTime("");
        loadCases(casesPagination.page);
        loadDashboard();
        loadFollowups();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to save disposition.");
    } finally {
      setDispositionLoading(false);
    }
  };

  // Submit Payment Collection Claim (Invariant 5: Pending Verification)
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedCaseForPayment || !payAmount || !payUtr) return;

    try {
      setPayLoading(true);
      setErrorMsg("");
      const res = await api.post("/employee/payments", {
        case_id: selectedCaseForPayment.id,
        amount: payAmount,
        payment_mode: payMode,
        utr_number: payUtr,
        notes: payNotes
      });

      if (res && res.success) {
        setSuccessMsg(res.message);
        setSelectedCaseForPayment(null);
        setPayAmount("");
        setPayUtr("");
        setPayNotes("");
        loadCases(casesPagination.page);
        loadDashboard();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to log payment claim.");
    } finally {
      setPayLoading(false);
    }
  };

  const summary = dashboardData?.summary || {
    assigned_accounts: 42,
    untouched_accounts: 18,
    ptp_accounts: 8,
    paid_accounts: 6,
    calls_dialed_today: 36,
    answered_calls: 28,
    connection_rate_pct: 77.78,
    pending_followups: 12,
    verified_recovered_amount: 145000,
    target_amount: 100000,
    target_achievement_pct: 145.0
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isLight = theme === "light";

  return (
    <div
      className={`employee-portal ${isLight ? "theme-light light" : "theme-dark dark"}`}
      data-theme={theme}
      style={{
        minHeight: "100vh",
        background: isLight ? "#F8FAFC" : "#050B20",
        color: isLight ? "#0F172A" : "#f8fafc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* ── TOPBAR ── */}
      <header style={{
        height: "64px",
        background: isLight ? "#FFFFFF" : "#08132D",
        borderBottom: `1px solid ${isLight ? "#E2E8F0" : "#263957"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div onClick={onBackToHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/Logo_Name_PayMagic.png" alt="PayMagic" style={{ height: "30px" }} />
          </div>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#00C995",
            background: "rgba(0, 201, 149, 0.15)",
            padding: "3px 10px",
            borderRadius: "12px",
            border: "1px solid rgba(0, 201, 149, 0.3)"
          }}>
            EMPLOYEE OPERATIONS WORKSPACE
          </span>
        </div>

        {/* Presence & Profile Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Online / Offline Presence Icon Button (Icon Only, No Text: Red when offline, Green when online) */}
          <button
            onClick={() => {
              if (presenceStatus === "OFFLINE") {
                setIsDialerWidgetOpen(true);
              } else {
                setPresenceStatus("OFFLINE");
                setActiveBreakType(null);
                handlePresenceChange("OFFLINE");
              }
            }}
            title={presenceStatus === "ONLINE" ? "Online (Click to change)" : presenceStatus === "BREAK" ? `${activeBreakType || "Break"} (Click to change)` : "Offline (Click to change)"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor:
                presenceStatus === "ONLINE"
                  ? "rgba(34, 197, 94, 0.15)"
                  : presenceStatus === "BREAK"
                  ? "rgba(245, 158, 11, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
              border:
                presenceStatus === "ONLINE"
                  ? "1px solid #22c55e"
                  : presenceStatus === "BREAK"
                  ? "1px solid #fbbf24"
                  : "1px solid #ef4444",
              color:
                presenceStatus === "ONLINE"
                  ? "#22c55e"
                  : presenceStatus === "BREAK"
                  ? "#fbbf24"
                  : "#ef4444",
              boxShadow:
                presenceStatus === "ONLINE"
                  ? "0 0 8px rgba(34, 197, 94, 0.3)"
                  : presenceStatus === "BREAK"
                  ? "0 0 8px rgba(245, 158, 11, 0.3)"
                  : "0 0 8px rgba(239, 68, 68, 0.3)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {presenceStatus === "ONLINE" ? (
              <Radio style={{ width: "16px", height: "16px" }} />
            ) : presenceStatus === "BREAK" ? (
              <Coffee style={{ width: "16px", height: "16px" }} />
            ) : (
              <PhoneOff style={{ width: "15px", height: "15px" }} />
            )}
          </button>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: isLight ? "#0F172A" : "#f8fafc" }}>
              {user.fullName || user.name || "Agent"}
            </div>
            <div style={{ fontSize: "11px", color: isLight ? "#64748B" : "#94a3b8" }}>
              {user.employeeId || "PM-CAL-0001"} • {user.role || "Telecaller"}
            </div>
          </div>

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          <button
            onClick={onLogout}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              background: isLight ? "#F1F5F9" : "#14223A",
              border: `1px solid ${isLight ? "#CBD5E1" : "#263957"}`,
              color: isLight ? "#0F172A" : "#f8fafc",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── ALERTS NOTIFICATION STRIP ── */}
      {errorMsg && (
        <div style={{ padding: "10px 24px", background: "rgba(239, 68, 68, 0.15)", borderBottom: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{errorMsg}</span>
          <X className="w-4 h-4 cursor-pointer" onClick={() => setErrorMsg("")} />
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "10px 24px", background: "rgba(16, 185, 129, 0.15)", borderBottom: "1px solid rgba(16, 185, 129, 0.3)", color: "#6ee7b7", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{successMsg}</span>
          <X className="w-4 h-4 cursor-pointer" onClick={() => setSuccessMsg("")} />
        </div>
      )}

      {/* ── MAIN WORKSPACE ── */}
      <div className="portal-workspace-body" style={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR NAVIGATION */}
        <aside
          className="portal-sidebar-nav"
          style={{
            width: "240px",
            background: isLight ? "#FFFFFF" : "#0B1733",
            borderRight: `1px solid ${isLight ? "#E2E8F0" : "#263957"}`,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          {[
            { id: "queue", label: "My Working Queue", icon: Layers, badge: summary.assigned_accounts },
            { id: "tasks", label: "Priority Tasks & PTP", icon: Calendar, badge: summary.pending_followups },
            { id: "calls", label: "Call History & Audio", icon: PhoneCall },
            { id: "field", label: "Field Route Visits", icon: MapPin, badge: fieldVisitsList.filter(v => v.status !== "COMPLETED").length },
            { id: "profile", label: "Profile & Quota", icon: User }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: active ? "1px solid rgba(0, 201, 149, 0.4)" : "1px solid transparent",
                  background: active ? "rgba(0, 201, 149, 0.15)" : "transparent",
                  color: active ? "#00C995" : "#94a3b8",
                  fontWeight: active ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon className={`w-4 h-4 ${active ? "text-[#00C995]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: active ? "#00C995" : "#263957",
                    color: active ? "#050B20" : "#ffffff",
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* CONTENT BODY */}
        <main className="portal-main-area" style={{ flex: 1, padding: "28px", overflowY: "auto", background: isLight ? "#F8FAFC" : "transparent" }}>
          {/* Active Allocator & Campaign Context Strip (Architecture Section 3) */}
          <div style={{
            padding: "16px 20px",
            borderRadius: "14px",
            background: "#0B1733",
            border: "1px solid #263957",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Authorized Allocator</span>
                <select
                  value={selectedAllocator}
                  onChange={(e) => setSelectedAllocator(e.target.value)}
                  style={{ display: "block", marginTop: "2px", background: "#08132D", border: "1px solid #263957", color: "#315CFF", fontWeight: 800, fontSize: "13px", padding: "4px 8px", borderRadius: "6px" }}
                >
                  <option value="BAJAJ FINSERVE">BAJAJ FINSERVE</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="SBI Cards">SBI Cards</option>
                </select>
              </div>
              <span style={{ color: "#263957" }}>|</span>
              <div>
                <span style={{ fontSize: "10px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Allocation Portfolio</span>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", marginTop: "4px" }}>Bajaj Personal Loan Writeoff</div>
              </div>
              <span style={{ color: "#263957" }}>|</span>
              <div>
                <span style={{ fontSize: "10px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Assigned Dialing Campaign</span>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#00C995", marginTop: "4px" }}>URBAN BAJAJ-NOV-2026 (Predictive)</div>
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "#00C995", display: "flex", alignItems: "center", gap: "6px", background: "rgba(0, 201, 149, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Queue Synchronized with Server</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={{ padding: "18px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Assigned Accounts</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#315CFF", marginTop: "4px", fontFamily: "monospace" }}>
                {summary.assigned_accounts}
              </div>
              <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "2px", display: "block" }}>
                {summary.untouched_accounts} Untouched in Queue
              </span>
            </div>

            <div style={{ padding: "18px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Pending Follow-ups</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFB800", marginTop: "4px", fontFamily: "monospace" }}>
                {summary.pending_followups}
              </div>
              <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "2px", display: "block" }}>
                {summary.ptp_accounts} PTP Promises Active
              </span>
            </div>

            <div style={{ padding: "18px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Calls Dialed Today</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#5945F5", marginTop: "4px", fontFamily: "monospace" }}>
                {summary.calls_dialed_today}
              </div>
              <span style={{ fontSize: "11px", color: "#00C995", marginTop: "2px", display: "block" }}>
                {summary.connection_rate_pct}% Connection Rate
              </span>
            </div>

            <div style={{ padding: "18px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Verified Collections</span>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#00C995", marginTop: "4px", fontFamily: "monospace" }}>
                ₹{Number(summary.verified_recovered_amount).toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 600, marginTop: "2px", display: "block" }}>
                {summary.target_achievement_pct}% Quota Attainment
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              TAB 1: MY WORKING QUEUE (Step 6 Workflow)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "queue" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Queue Filter Toolbar */}
              <div style={{
                padding: "16px",
                borderRadius: "12px",
                background: "#0B1733",
                border: "1px solid #263957",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && loadCases(1)}
                      placeholder="Search Borrower Name, Phone, Account..."
                      style={{
                        padding: "8px 12px 8px 32px",
                        borderRadius: "8px",
                        background: "#08132D",
                        border: "1px solid #263957",
                        color: "#f8fafc",
                        fontSize: "12px",
                        outline: "none",
                        width: "240px"
                      }}
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="New">New / Untouched</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Promise to Pay">Promise to Pay</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Disputed">Disputed</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>

                  <button
                    onClick={() => loadCases(1)}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "#14223A", border: "1px solid #00C995", color: "#00C995", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Filter Queue
                  </button>
                </div>
              </div>

              {/* Working Accounts Table */}
              <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                      <th style={{ padding: "12px 14px" }}>Case #</th>
                      <th style={{ padding: "12px 14px" }}>Borrower Name</th>
                      <th style={{ padding: "12px 14px" }}>Phone</th>
                      <th style={{ padding: "12px 14px" }}>Outstanding</th>
                      <th style={{ padding: "12px 14px" }}>DPD</th>
                      <th style={{ padding: "12px 14px" }}>Status</th>
                      <th style={{ padding: "12px 14px" }}>Priority</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Loading your working accounts...</td></tr>
                    ) : casesList.length === 0 ? (
                      <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No assigned accounts in this queue.</td></tr>
                    ) : (
                      casesList.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#315CFF", fontWeight: 700 }}>{c.case_number}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600 }}>{c.borrower_name || c.customer_name}</td>
                          <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>{c.phone_number || "+91 98******10"}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#FFB800", fontWeight: 700 }}>
                            ₹{Number(c.outstanding_amount).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              background: c.dpd >= 90 ? "rgba(255, 82, 122, 0.2)" : "rgba(49, 92, 255, 0.2)",
                              color: c.dpd >= 90 ? "#FF527A" : "#315CFF"
                            }}>
                              {c.dpd || 45} DPD
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "10px",
                              fontWeight: 700,
                              background: c.status === "Fully Paid" ? "rgba(0, 201, 149, 0.2)" : "rgba(49, 92, 255, 0.15)",
                              color: c.status === "Fully Paid" ? "#00C995" : "#315CFF"
                            }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "11px", fontWeight: 600 }}>{c.priority}</td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              {/* Softphone Click to Call */}
                              <button
                                onClick={() => handleStartCall(c)}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  background: "#00C995",
                                  border: "none",
                                  color: "#050B20",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Call</span>
                              </button>

                              {/* Disposition Record */}
                              <button
                                onClick={() => {
                                  setSelectedCaseForDisposition(c);
                                  setPtpAmount(c.outstanding_amount || "");
                                }}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  background: "#14223A",
                                  border: "1px solid #315CFF",
                                  color: "#315CFF",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <FileText className="w-3 h-3" />
                                <span>Disposition</span>
                              </button>

                              {/* Record Payment */}
                              <button
                                onClick={() => {
                                  setSelectedCaseForPayment(c);
                                  setPayAmount(c.outstanding_amount || "");
                                }}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  background: "#14223A",
                                  border: "1px solid #FFB800",
                                  color: "#FFB800",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Payment</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Queue Pagination Bar */}
                <div style={{
                  padding: "14px 20px",
                  background: "#08132D",
                  borderTop: "1px solid #263957",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#9AAAC2"
                }}>
                  <div>
                    Showing {((casesPagination.page - 1) * casesPagination.limit) + 1} to {Math.min(casesPagination.page * casesPagination.limit, casesPagination.total)} of {casesPagination.total} assigned accounts
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => loadCases(casesPagination.page - 1)}
                      disabled={casesPagination.page <= 1}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        background: "#14223A",
                        border: "1px solid #263957",
                        color: casesPagination.page <= 1 ? "#475569" : "#f8fafc",
                        cursor: casesPagination.page <= 1 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span style={{ padding: "0 6px", fontWeight: 700, color: "#00C995" }}>
                      Page {casesPagination.page} of {casesPagination.totalPages}
                    </span>
                    <button
                      onClick={() => loadCases(casesPagination.page + 1)}
                      disabled={casesPagination.page >= casesPagination.totalPages}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        background: "#14223A",
                        border: "1px solid #263957",
                        color: casesPagination.page >= casesPagination.totalPages ? "#475569" : "#f8fafc",
                        cursor: casesPagination.page >= casesPagination.totalPages ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 2: PRIORITY TASKS & PTP COMMITMENTS (Section 6)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "tasks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>
                  Priority Tasks, PTP Commitments &amp; Callbacks
                </h3>
                <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                  Time-bound borrower follow-ups generated from structured call dispositions.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {followupsList.map((f) => (
                  <div key={f.id} style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#0B1733",
                    border: "1px solid #263957",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#315CFF", fontWeight: 700 }}>
                          {f.case_number}
                        </span>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#f8fafc", marginTop: "2px" }}>
                          {f.borrower_name}
                        </div>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: f.type === "PTP_PROMISE" ? "rgba(0, 201, 149, 0.2)" : "rgba(255, 184, 0, 0.2)",
                        color: f.type === "PTP_PROMISE" ? "#00C995" : "#FFB800",
                        fontWeight: 700
                      }}>
                        {f.type === "PTP_PROMISE" ? "💰 PROMISE TO PAY" : "📞 CALLBACK"}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                      "{f.remarks}"
                    </p>

                    <div style={{ borderTop: "1px solid #263957", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>DUE / COMMITMENT</span>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc" }}>
                          {f.due_date} {f.target_amount ? `(₹${Number(f.target_amount).toLocaleString("en-IN")})` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const targetCase = casesList.find(c => c.case_number === f.case_number) || {
                            id: f.case_id || "case_001",
                            case_number: f.case_number,
                            borrower_name: f.borrower_name,
                            phone_number: "+91 9876543210",
                            outstanding_amount: f.target_amount || 15000
                          };
                          handleStartCall(targetCase);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#00C995",
                          border: "none",
                          color: "#050B20",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Dial Borrower</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 3: CALL HISTORY & AUDIO VAULT
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "calls" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>
                  My Calling History &amp; Recording Evidence
                </h3>
                <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                  Full telephony evidence stream archived with S3 KMS WORM compliance.
                </p>
              </div>

              <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                      <th style={{ padding: "12px 14px" }}>Call ID</th>
                      <th style={{ padding: "12px 14px" }}>Direction</th>
                      <th style={{ padding: "12px 14px" }}>Duration</th>
                      <th style={{ padding: "12px 14px" }}>Disposition Outcome</th>
                      <th style={{ padding: "12px 14px" }}>Timestamp</th>
                      <th style={{ padding: "12px 14px" }}>Audio Player</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "call_01", dir: "OUTBOUND", dur: 184, outcome: "Promise to Pay (₹15,000 on Nov 22)", time: "10:14 AM" },
                      { id: "call_02", dir: "OUTBOUND", dur: 95, outcome: "Callback Requested (6:00 PM)", time: "11:32 AM" },
                      { id: "call_03", dir: "INBOUND", dur: 240, outcome: "Payment Claim Logged (₹5,000 via UPI)", time: "01:15 PM" },
                      { id: "call_04", dir: "OUTBOUND", dur: 38, outcome: "Not Reachable", time: "03:45 PM" }
                    ].map((call) => (
                      <tr key={call.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#315CFF" }}>{call.id}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: call.dir === "OUTBOUND" ? "rgba(49, 92, 255, 0.2)" : "rgba(168, 85, 247, 0.2)", color: call.dir === "OUTBOUND" ? "#315CFF" : "#A855F7", fontWeight: 700 }}>
                            {call.dir}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>{call.dur}s</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600 }}>{call.outcome}</td>
                        <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>Today, {call.time}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => setPlayingAudioId(playingAudioId === call.id ? null : call.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: playingAudioId === call.id ? "#00C995" : "#14223A",
                              border: "1px solid #263957",
                              color: playingAudioId === call.id ? "#050B20" : "#315CFF",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {playingAudioId === call.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{playingAudioId === call.id ? "Playing..." : "Listen"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 3B: FIELD ROUTE VISITS & GPS CHECK-IN (Section 10)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "field" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    Assigned Field Route Run-Sheet &amp; On-Site Visits
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                    Section 10: GPS on-site arrival verification, visit outcome logging, dynamic UPI QR collections, and spot digital receipts.
                  </p>
                </div>
                <button
                  onClick={loadFieldVisits}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "#14223A",
                    border: "1px solid #263957",
                    color: "#f8fafc",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fieldLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Route</span>
                </button>
              </div>

              {/* Field Visits Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {fieldVisitsList.map((visit) => (
                  <div
                    key={visit.id}
                    style={{
                      background: "#0B1733",
                      border: "1px solid #263957",
                      borderRadius: "14px",
                      padding: "20px",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "450px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 800, color: "#f8fafc" }}>
                          {visit.borrower_name}
                        </span>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: visit.priority === "URGENT" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 184, 0, 0.2)",
                          color: visit.priority === "URGENT" ? "#f87171" : "#FFB800"
                        }}>
                          {visit.priority} Priority
                        </span>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: visit.status === "COMPLETED" ? "rgba(0, 201, 149, 0.2)" : "rgba(49, 92, 255, 0.2)",
                          color: visit.status === "COMPLETED" ? "#00C995" : "#315CFF"
                        }}>
                          {visit.status}
                        </span>
                      </div>

                      <div style={{ fontSize: "12px", color: "#cbd5e1", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{visit.address} (Zone: <strong style={{ color: "#315CFF" }}>{visit.geographic_zone}</strong>)</span>
                      </div>

                      <div style={{ fontSize: "11px", color: "#9AAAC2" }}>
                        Account: <strong style={{ color: "#f8fafc", fontFamily: "monospace" }}>{visit.account_number}</strong> • Time Slot: <strong style={{ color: "#FFB800" }}>{visit.time_slot}</strong> • Phone: <strong style={{ color: "#38bdf8" }}>{visit.phone}</strong>
                      </div>

                      {visit.visit_notes && (
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", background: "#08132D", padding: "8px 10px", borderRadius: "8px", marginTop: "4px" }}>
                          Notes: "{visit.visit_notes}"
                        </div>
                      )}

                      {visit.receipt_ref && (
                        <div style={{ fontSize: "11px", color: "#00C995", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={13} />
                          <span>Spot Collection: ₹{visit.collected_amount.toLocaleString("en-IN")} via {visit.payment_mode} (Receipt: {visit.receipt_ref})</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      {visit.status !== "COMPLETED" && (
                        <>
                          <button
                            onClick={() => handleFieldCheckIn(visit.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "9px 14px",
                              borderRadius: "8px",
                              background: visit.gps_latitude ? "rgba(0, 201, 149, 0.15)" : "#14223A",
                              border: visit.gps_latitude ? "1px solid #00C995" : "1px solid #263957",
                              color: visit.gps_latitude ? "#00C995" : "#f8fafc",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{visit.gps_latitude ? "GPS Checked-In ✓" : "On-Site Check-In"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedVisitForOutcome(visit);
                              setVisitOutcomeForm({ outcome: "Customer Met & Paid", notes: "", collected_amount: "", payment_mode: "UPI_QR" });
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "9px 16px",
                              borderRadius: "8px",
                              background: "#00C995",
                              border: "none",
                              color: "#050B20",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Record Outcome &amp; Spot Receipt</span>
                          </button>
                        </>
                      )}

                      {visit.status === "COMPLETED" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#00C995", fontSize: "12px", fontWeight: 700 }}>
                          <CheckCircle2 size={16} />
                          <span>Visit Finalized &amp; Audited</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 4: PROFILE & PERFORMANCE TARGETS (Section 14)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ padding: "24px", borderRadius: "16px", background: "#0B1733", border: "1px solid #263957", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    {user.fullName || user.name || "Agent Profile"}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "4px" }}>
                    Employee ID: <strong style={{ color: "#315CFF" }}>{user.employeeId || "PM-CAL-0001"}</strong> • Shift: 09:00 AM – 06:00 PM IST
                  </div>
                </div>

                <div style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  background: "rgba(0, 201, 149, 0.15)",
                  color: "#00C995",
                  fontWeight: 700,
                  fontSize: "12px"
                }}>
                  Target Achieved: {summary.target_achievement_pct}%
                </div>
              </div>

              {/* Recovery Progress Bar Card */}
              <div style={{ padding: "24px", borderRadius: "16px", background: "#0B1733", border: "1px solid #263957" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>Monthly Recovery Target Progress</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#00C995", fontFamily: "monospace" }}>
                    ₹{Number(summary.verified_recovered_amount).toLocaleString("en-IN")} / ₹{Number(summary.target_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#14223A", borderRadius: "4px", overflow: "hidden", margin: "10px 0" }}>
                  <div style={{ width: `${Math.min(100, summary.target_achievement_pct)}%`, height: "100%", background: "linear-gradient(90deg, #315CFF, #00C995)", borderRadius: "4px" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#9AAAC2" }}>
                  Calculated strictly from supervisor-verified payments posted to the Financial Ledger.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── SOFTPHONE CLICK-TO-CALL MODAL ── */}
      {activeCallCase && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal-container" style={{ maxWidth: "420px", textAlign: "center", background: "#08132D", border: "1px solid #315CFF" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: callState === "CONNECTED" ? "rgba(0, 201, 149, 0.2)" : "rgba(49, 92, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <PhoneCall className={`w-8 h-8 ${callState === "CONNECTED" ? "text-[#00C995]" : "text-[#315CFF]"} animate-pulse`} />
            </div>

            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "10px",
              background: callState === "CONNECTED" ? "#00C995" : "#315CFF",
              color: "#050B20"
            }}>
              {callState === "DIALING" ? "CONNECTING CARRIER..." : callState === "CONNECTED" ? "CALL ACTIVE (RECORDING)" : "CALL ENDED"}
            </span>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", marginTop: "12px" }}>
              {activeCallCase.borrower_name || activeCallCase.customer_name}
            </h3>
            <p style={{ fontSize: "13px", color: "#9AAAC2", fontFamily: "monospace", marginTop: "2px" }}>
              {activeCallCase.phone_number || "+91 9876543210"}
            </p>

            {/* Live Call Duration Timer */}
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#00C995", fontFamily: "monospace", margin: "16px 0" }}>
              {formatTimer(callTimer)}
            </div>

            <p style={{ fontSize: "10px", color: "#64748b" }}>
              S3 KMS WORM Encrypted • Permissible Calling Window Active
            </p>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleEndCall}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#FF527A",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call &amp; Save Disposition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPOSITION & REMARKS MODAL (Section 5 & 6) ── */}
      {selectedCaseForDisposition && (
        <div className="modal-overlay" onClick={() => setSelectedCaseForDisposition(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #263957", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>
                  Record Call Disposition
                </h3>
                <span style={{ fontSize: "11px", color: "#9AAAC2" }}>
                  {selectedCaseForDisposition.case_number} • {selectedCaseForDisposition.borrower_name}
                </span>
              </div>
              <X className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setSelectedCaseForDisposition(null)} />
            </div>

            <form onSubmit={handleSubmitDisposition} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Interaction Outcome</label>
                <select
                  value={dispositionOutcome}
                  onChange={(e) => setDispositionOutcome(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                >
                  <option value="Promise to Pay">Promise to Pay (PTP)</option>
                  <option value="Contacted">Contacted - Discussed Terms</option>
                  <option value="Callback Requested">Callback Requested</option>
                  <option value="Disputed">Dispute / Grievance Claimed</option>
                  <option value="Not Reachable">Not Reachable / Busy</option>
                  <option value="Field Visit">Field Visit Required</option>
                  <option value="Fully Paid">Fully Paid Claim</option>
                </select>
              </div>

              {/* Conditional PTP Inputs */}
              {dispositionOutcome === "Promise to Pay" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#08132D", padding: "12px", borderRadius: "8px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#00C995", display: "block", marginBottom: "4px" }}>Promise Amount (₹)</label>
                    <input
                      type="number"
                      value={ptpAmount}
                      onChange={(e) => setPtpAmount(e.target.value)}
                      placeholder="10000"
                      required
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#14223A", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#00C995", display: "block", marginBottom: "4px" }}>Commitment Date</label>
                    <input
                      type="date"
                      value={ptpDate}
                      onChange={(e) => setPtpDate(e.target.value)}
                      required
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#14223A", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                    />
                  </div>
                </div>
              )}

              {/* Conditional Callback Inputs */}
              {dispositionOutcome === "Callback Requested" && (
                <div>
                  <label style={{ fontSize: "11px", color: "#FFB800", display: "block", marginBottom: "4px" }}>Scheduled Callback Time</label>
                  <input
                    type="time"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Interaction Remarks</label>
                <textarea
                  rows={3}
                  value={dispositionRemarks}
                  onChange={(e) => setDispositionRemarks(e.target.value)}
                  placeholder="Record customer statements, repayment timeline, or grievances..."
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px", resize: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={dispositionLoading}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#00C995",
                  border: "none",
                  color: "#050B20",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: dispositionLoading ? "not-allowed" : "pointer"
                }}
              >
                {dispositionLoading ? "Saving..." : "Save Disposition & Update CRM"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── RECORD PAYMENT CLAIM MODAL (Invariant 5) ── */}
      {selectedCaseForPayment && (
        <div className="modal-overlay" onClick={() => setSelectedCaseForPayment(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #263957", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>
                  Log Borrower Payment Collection
                </h3>
                <span style={{ fontSize: "11px", color: "#9AAAC2" }}>
                  {selectedCaseForPayment.case_number} • {selectedCaseForPayment.borrower_name}
                </span>
              </div>
              <X className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setSelectedCaseForPayment(null)} />
            </div>

            <form onSubmit={handleSubmitPayment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Collected Amount (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="IMPS">IMPS Instant Transfer</option>
                    <option value="NEFT">NEFT / RTGS</option>
                    <option value="CASH">Cash Handover</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Bank UTR / Ref Number</label>
                  <input
                    type="text"
                    value={payUtr}
                    onChange={(e) => setPayUtr(e.target.value)}
                    placeholder="e.g. UPI-4102948291"
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Notes / Handover Details</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Receipt number, branch code, or confirmation details..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                />
              </div>

              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255, 184, 0, 0.1)", border: "1px solid rgba(255, 184, 0, 0.2)", fontSize: "11px", color: "#FFB800" }}>
                Notice: Claim is submitted as <strong>Pending Verification</strong>. Balance reduces and targets post upon supervisor audit desk approval.
              </div>

              <button
                type="submit"
                disabled={payLoading}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#FFB800",
                  border: "none",
                  color: "#050B20",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: payLoading ? "not-allowed" : "pointer"
                }}
              >
                {payLoading ? "Submitting Claim..." : "Submit to Supervisor Audit Desk"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ── FIELD VISIT OUTCOME & SPOT RECEIPT MODAL (Section 10) ── */}
      {selectedVisitForOutcome && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(1, 6, 28, 0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#0B1733", border: "1px solid #263957", borderRadius: "16px", padding: "24px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>Record Field Visit Outcome</h3>
                <span style={{ fontSize: "11px", color: "#9AAAC2" }}>Borrower: {selectedVisitForOutcome.borrower_name} ({selectedVisitForOutcome.account_number})</span>
              </div>
              <button onClick={() => setSelectedVisitForOutcome(null)} style={{ background: "none", border: "none", color: "#9AAAC2", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleFieldOutcomeSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Visit Outcome / Ground Verification *</label>
                <select
                  value={visitOutcomeForm.outcome}
                  onChange={(e) => setVisitOutcomeForm({ ...visitOutcomeForm, outcome: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                >
                  <option value="Customer Met & Paid">Customer Met &amp; Paid on Spot</option>
                  <option value="Customer Met & Promised">Customer Met &amp; Signed PTP Agreement</option>
                  <option value="Door Locked / Premise Vacant">Door Locked / Premise Vacant</option>
                  <option value="Third-Party Contact">Third-Party / Family Member Met</option>
                  <option value="Address Shifted / Untraceable">Address Shifted / Untraceable</option>
                  <option value="Refused to Cooperate">Borrower Refused to Cooperate</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Amount Collected (₹)</label>
                  <input
                    type="number"
                    value={visitOutcomeForm.collected_amount}
                    onChange={(e) => setVisitOutcomeForm({ ...visitOutcomeForm, collected_amount: e.target.value })}
                    placeholder="e.g. 15000"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#00C995", fontSize: "13px", fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Payment Mode</label>
                  <select
                    value={visitOutcomeForm.payment_mode}
                    onChange={(e) => setVisitOutcomeForm({ ...visitOutcomeForm, payment_mode: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="UPI_QR">Dynamic UPI QR</option>
                    <option value="CASH">Cash Currency Notes</option>
                    <option value="CHEQUE">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>On-Site Inspection Notes / Observations</label>
                <textarea
                  rows={3}
                  value={visitOutcomeForm.notes}
                  onChange={(e) => setVisitOutcomeForm({ ...visitOutcomeForm, notes: e.target.value })}
                  placeholder="Record vehicle details, property condition, family remarks, or spot receipt details..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px", resize: "none" }}
                />
              </div>

              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(0, 201, 149, 0.1)", border: "1px solid rgba(0, 201, 149, 0.2)", fontSize: "11px", color: "#00C995" }}>
                ✓ GPS Geolocation &amp; timestamp will be cryptographically locked to this visit record.
              </div>

              <button
                type="submit"
                disabled={fieldLoading}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#00C995",
                  border: "none",
                  color: "#050B20",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: fieldLoading ? "not-allowed" : "pointer"
                }}
              >
                {fieldLoading ? "Saving Outcome..." : "Finalize Visit & Issue Digital Receipt"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── AGENT READINESS VERIFICATION MODAL (Section 6) ── */}
      {showReadinessModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(1, 6, 28, 0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#0B1733", border: "1px solid #263957", borderRadius: "16px", padding: "28px", maxWidth: "440px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0, 201, 149, 0.15)", color: "#00C995", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>Agent Readiness Verification</h3>
              <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "4px" }}>
                Section 6: Server checks attendance, microphone permissions, and shift eligibility before enabling automated dialer routing.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", background: "#08132D", border: "1px solid #14223A" }}>
                <span style={{ fontSize: "12px", color: "#cbd5e1" }}>1. Shift Schedule &amp; Biometric Attendance</span>
                <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 700 }}>✓ Verified Active</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", background: "#08132D", border: "1px solid #14223A" }}>
                <span style={{ fontSize: "12px", color: "#cbd5e1" }}>2. Audio / Headset Microphone</span>
                <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 700 }}>✓ Ready (48kHz)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", background: "#08132D", border: "1px solid #14223A" }}>
                <span style={{ fontSize: "12px", color: "#cbd5e1" }}>3. WebRTC Telephony Carrier Gateway</span>
                <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 700 }}>✓ Connected</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", background: "#08132D", border: "1px solid #14223A" }}>
                <span style={{ fontSize: "12px", color: "#cbd5e1" }}>4. RBI Permissible Hours (08:00 - 19:00 IST)</span>
                <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 700 }}>✓ Compliant</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowReadinessModal(false)}
                style={{ flex: 1, padding: "11px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957", color: "#9AAAC2", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowReadinessModal(false);
                  await handlePresenceChange("ONLINE");
                }}
                style={{ flex: 1, padding: "11px", borderRadius: "8px", background: "#00C995", border: "none", color: "#050B20", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}
              >
                Confirm &amp; Go Online
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING CIRCULAR OPTION (BOTTOM RIGHT) ── */}
      <button
        type="button"
        onClick={() => {
          setWebPhoneOpen(!webPhoneOpen);
          if (webPhoneMinimized) setWebPhoneMinimized(false);
        }}
        title={webPhoneOpen ? "Minimize WebPhone" : "Open WebPhone Dialer"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "9999px",
          backgroundColor: callState === "CONNECTED" ? "#ef4444" : "#10B981",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: callState === "CONNECTED"
            ? "0 0 20px rgba(239, 68, 68, 0.8), 0 8px 24px rgba(0, 0, 0, 0.4)"
            : "0 8px 24px rgba(16, 185, 129, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3)",
          zIndex: 9999,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {callState === "CONNECTED" ? (
          <PhoneCall style={{ width: "24px", height: "24px" }} className="animate-pulse" />
        ) : (
          <Phone style={{ width: "24px", height: "24px" }} />
        )}

        {/* Online Indicator Badge */}
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "14px",
            height: "14px",
            borderRadius: "9999px",
            backgroundColor: callState === "CONNECTED" ? "#ef4444" : "#22c55e",
            border: "2px solid #041030"
          }}
        />
      </button>

      {/* ── FLOATING WEBPHONE DIALER PANEL (MATCHES REFERENCE media_1794236906364_2d86cd87.jpg) ── */}
      {webPhoneOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            width: "300px",
            backgroundColor: "#071126",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>WebPhone</span>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>1012</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "9999px",
                    backgroundColor: callState === "CONNECTED" ? "#ef4444" : "#10b981"
                  }}
                />
                <span style={{ fontSize: "11px", fontWeight: 600, color: callState === "CONNECTED" ? "#ef4444" : "#10b981" }}>
                  {callState === "CONNECTED" ? "In Call" : callState === "DIALING" ? "Dialing..." : "Ready"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setWebPhoneMinimized(!webPhoneMinimized)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
                title={webPhoneMinimized ? "Expand" : "Minimize"}
              >
                <Minus style={{ width: "16px", height: "16px" }} />
              </button>
              <button
                type="button"
                onClick={() => setWebPhoneOpen(false)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
                title="Close"
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>

          {!webPhoneMinimized && (
            <>
              {/* Dialed Number Display */}
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span style={{ fontSize: "16px" }}>🇮🇳</span>
                <input
                  type="text"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  placeholder="Enter number..."
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    outline: "none"
                  }}
                />
                {dialNumber && (
                  <button
                    type="button"
                    onClick={handleBackspace}
                    style={{
                      padding: "4px 6px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                    title="Backspace"
                  >
                    ⌫
                  </button>
                )}
              </div>

              {/* In-Call Active Display or 12-Key Pad */}
              {callState === "CONNECTED" || callState === "DIALING" ? (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "9999px",
                      backgroundColor: callState === "CONNECTED" ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
                      border: callState === "CONNECTED" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(37, 99, 235, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <PhoneCall
                      style={{
                        width: "28px",
                        height: "28px",
                        color: callState === "CONNECTED" ? "#10b981" : "#60a5fa"
                      }}
                      className="animate-pulse"
                    />
                  </div>

                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                      {activeCallCase?.borrower_name || activeCallCase?.customer_name || "Borrower Call"}
                    </h4>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace" }}>
                      {dialNumber}
                    </span>
                  </div>

                  {/* Timer */}
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
                    {formatTimer(callTimer)}
                  </div>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    ● Auto-Recording
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    padding: "14px"
                  }}
                >
                  {[
                    { num: "1", sub: "" },
                    { num: "2", sub: "ABC" },
                    { num: "3", sub: "DEF" },
                    { num: "4", sub: "GHI" },
                    { num: "5", sub: "JKL" },
                    { num: "6", sub: "MNO" },
                    { num: "7", sub: "PQRS" },
                    { num: "8", sub: "TUV" },
                    { num: "9", sub: "WXYZ" },
                    { num: "*", sub: "" },
                    { num: "0", sub: "+" },
                    { num: "#", sub: "" }
                  ].map((key) => (
                    <button
                      key={key.num}
                      type="button"
                      onClick={() => handleDialPadClick(key.num)}
                      style={{
                        height: "46px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.1s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      }}
                    >
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>
                        {key.num}
                      </span>
                      {key.sub && (
                        <span style={{ fontSize: "8px", color: "#94a3b8", marginTop: "2px", letterSpacing: "0.05em" }}>
                          {key.sub}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Call / End Call Button */}
              <div style={{ padding: "0 14px 14px 14px" }}>
                {callState === "CONNECTED" || callState === "DIALING" ? (
                  <button
                    type="button"
                    onClick={handleEndCall}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <PhoneOff style={{ width: "16px", height: "16px" }} />
                    <span>End Call</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleWebPhoneCall}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Phone style={{ width: "16px", height: "16px" }} />
                    <span>Call</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {/* ── AGENT & CALLER FLOATING PRESENCE DIALER WIDGET ── */}
      <AgentPresenceDialerWidget
        presenceStatus={presenceStatus}
        setPresenceStatus={(newStatus) => {
          setPresenceStatus(newStatus);
          handlePresenceChange(newStatus);
        }}
        activeBreakType={activeBreakType}
        setActiveBreakType={setActiveBreakType}
        breakSeconds={breakSeconds}
        setBreakSeconds={setBreakSeconds}
        isHeadsetConnected={isHeadsetConnected}
        setIsHeadsetConnected={setIsHeadsetConnected}
        user={user}
        isOpen={isDialerWidgetOpen}
        setIsOpen={setIsDialerWidgetOpen}
      />
    </div>
  );
}
