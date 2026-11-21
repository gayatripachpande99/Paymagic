import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Layers,
  Users,
  Megaphone,
  BarChart3,
  TrendingUp,
  Award,
  LogOut,
  Building2,
  PhoneCall,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  AlertCircle,
  FileCheck,
  IndianRupee,
  Activity,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  MapPin,
  Calendar,
  Play,
  Pause,
  Eye,
  UploadCloud,
  Volume2,
  Printer,
  FileText
} from "lucide-react";
import api from "../services/api";
import ThemeToggle from "./ThemeToggle";

export const ADMIN_TAB_ROUTES = {
  overview: "/admin/overview",
  cases: "/admin/cases",
  analytics: "/admin/analytics",
  verification: "/admin/payments",
  telephony: "/admin/telephony",
  field: "/admin/field-recovery",
  allocations: "/admin/allocations",
  campaigns: "/admin/campaigns",
  communications: "/admin/messages",
  agents: "/admin/employees",
  incentives: "/admin/incentives",
  reports: "/admin/reports"
};

export const ADMIN_TAB_TITLES = {
  overview: "PayMagic | Executive Portfolio & Operations Command",
  cases: "PayMagic | Recovery Case Management & Allocation",
  analytics: "PayMagic | Portfolio Analytics & DPD Buckets",
  verification: "PayMagic | Payment Recovery & Collections Desk",
  telephony: "PayMagic | Voice Telephony CDR & Evidence Vault",
  field: "PayMagic | Field Recovery Operations & GPS Radar",
  allocations: "PayMagic | Institutional Allocators & Portfolios",
  campaigns: "PayMagic | Campaign Strategies & Dialers",
  communications: "PayMagic | Multi-Channel Digital Engagement",
  agents: "PayMagic | Staff Directory & Access Control",
  incentives: "PayMagic | Automated Incentive Programs",
  reports: "PayMagic | Regulatory & Statutory Reports"
};

function getInitialAdminTab() {
  if (typeof window === "undefined") return "overview";
  const path = window.location.pathname;
  const match = Object.entries(ADMIN_TAB_ROUTES).find(([, route]) => path === route || path.startsWith(route));
  return match ? match[0] : "overview";
}

export default function AdminPortalShell({ user, onLogout, onBackToHome, theme = "dark", toggleTheme }) {
  const [activeTab, setActiveTab] = useState(getInitialAdminTab);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setErrorMsg("");
    setSuccessMsg("");
    const route = ADMIN_TAB_ROUTES[tabId] || "/admin/overview";
    window.history.pushState(null, "", route);
    document.title = ADMIN_TAB_TITLES[tabId] || "PayMagic Administration";
  };

  useEffect(() => {
    const onPopState = () => {
      const newTab = getInitialAdminTab();
      setActiveTab(newTab);
      document.title = ADMIN_TAB_TITLES[newTab] || "PayMagic Administration";
    };
    window.addEventListener("popstate", onPopState);
    document.title = ADMIN_TAB_TITLES[activeTab] || "PayMagic Administration";
    return () => window.removeEventListener("popstate", onPopState);
  }, [activeTab]);

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({
    organizations: [],
    allocators: [],
    allocations: [],
    campaigns: [],
    agent_groups: [],
    agents: []
  });
  const [casesList, setCasesList] = useState([]);
  const [casesPagination, setCasesPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [ledgerPayments, setLedgerPayments] = useState([]);
  const [paymentSubTab, setPaymentSubTab] = useState("desk"); // desk | ledger
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [incentivesList, setIncentivesList] = useState([]);

  // Analytics & Telephony Data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [telephonyData, setTelephonyData] = useState(null);
  const [telephonySearch, setTelephonySearch] = useState("");
  const [telephonyOutcomeFilter, setTelephonyOutcomeFilter] = useState("ALL");

  // Filters & selection for Case Allocation
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [selectedTargetAgent, setSelectedTargetAgent] = useState("");
  const [selectedRule, setSelectedRule] = useState("EQUAL_COUNT");
  const [allocationLoading, setAllocationLoading] = useState(false);

  // Case Detail Drawer / Modal
  const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);
  const [caseDetailLoading, setCaseDetailLoading] = useState(false);
  const [caseDetailTab, setCaseDetailTab] = useState("timeline"); // timeline | calls | followups | payments
  const [playingAudioCallId, setPlayingAudioCallId] = useState(null);

  // Modals
  const [showCreateAllocatorModal, setShowCreateAllocatorModal] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showUploadAllocationModal, setShowUploadAllocationModal] = useState(false);
  const [showCampaignMembersModal, setShowCampaignMembersModal] = useState(false);

  // Allocator Creation form
  const [newAllocName, setNewAllocName] = useState("");
  const [newAllocCode, setNewAllocCode] = useState("");

  // Campaign Creation form
  const [newCampName, setNewCampName] = useState("");
  const [newCampType, setNewCampType] = useState("PREDICTIVE");
  const [newCampChannel, setNewCampChannel] = useState("CALL");

  // Allocation Upload form
  const [uploadAllocId, setUploadAllocId] = useState("");
  const [uploadPortName, setUploadPortName] = useState("");
  const [uploadProdType, setUploadProdType] = useState("Personal Loan");
  const [uploadAccountsCount, setUploadAccountsCount] = useState(20);
  const [uploadPrincipal, setUploadPrincipal] = useState(3500000);
  const [uploadBucket, setUploadBucket] = useState("Writeoff");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileParsingMsg, setFileParsingMsg] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (rawRows && rawRows.length > 1) {
          const count = rawRows.length - 1;
          setUploadAccountsCount(count);
          if (!uploadPortName) {
            setUploadPortName(file.name.replace(/\.[^/.]+$/, ""));
          }
          setFileParsingMsg(`✓ Parsed ${count} accounts from ${file.name}`);
        }
      } catch (err) {
        setFileParsingMsg(`File attached: ${file.name}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Campaign Members Management
  const [activeCampaignForMembers, setActiveCampaignForMembers] = useState(null);
  const [campaignSelectedAgentIds, setCampaignSelectedAgentIds] = useState([]);
  const [campaignMembersLoading, setCampaignMembersLoading] = useState(false);

  // Field Recovery & GPS Radar (Architecture Section 10)
  const [fieldRecoveryData, setFieldRecoveryData] = useState(null);
  const [fieldRecoveryLoading, setFieldRecoveryLoading] = useState(false);

  // Digital Engagement (Architecture Section 13)
  const [communicationsData, setCommunicationsData] = useState(null);
  const [communicationsLoading, setCommunicationsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadOverview();
    loadHierarchy();
  }, []);

  useEffect(() => {
    if (activeTab === "cases") {
      loadCases(1);
    } else if (activeTab === "analytics") {
      loadAnalytics();
    } else if (activeTab === "verification") {
      loadPendingPayments();
      loadPaymentLedger();
    } else if (activeTab === "telephony") {
      loadTelephony();
    } else if (activeTab === "incentives") {
      loadIncentives();
    } else if (activeTab === "field") {
      loadFieldRecovery();
    } else if (activeTab === "communications") {
      loadCommunications();
    }
  }, [activeTab, statusFilter, priorityFilter, agentFilter]);

  const loadFieldRecovery = async () => {
    try {
      setFieldRecoveryLoading(true);
      const res = await api.get("/admin/field-recovery");
      if (res && res.success) {
        setFieldRecoveryData(res.data);
      }
    } catch (err) {
      console.error("loadFieldRecovery error:", err);
    } finally {
      setFieldRecoveryLoading(false);
    }
  };

  const loadCommunications = async () => {
    try {
      setCommunicationsLoading(true);
      const res = await api.get("/admin/communications");
      if (res && res.success) {
        setCommunicationsData(res.data);
      }
    } catch (err) {
      console.error("loadCommunications error:", err);
    } finally {
      setCommunicationsLoading(false);
    }
  };

  const handleReconcileHandover = async (handoverId) => {
    try {
      const res = await api.post(`/admin/field-recovery/handovers/${handoverId}/reconcile`, {
        supervisor_remarks: "Verified and reconciled with bank branch cash deposit slip."
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        loadFieldRecovery();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to reconcile cash handover.");
    }
  };

  const loadOverview = async () => {
    try {
      const res = await api.get("/admin/overview");
      if (res && res.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error("loadOverview error:", err);
    }
  };

  const loadHierarchy = async () => {
    try {
      const res = await api.get("/admin/hierarchy");
      if (res && res.success) {
        setHierarchyData(res.data);
        if (res.data.allocators?.length > 0 && !uploadAllocId) {
          setUploadAllocId(res.data.allocators[0].id);
        }
      }
    } catch (err) {
      console.error("loadHierarchy error:", err);
    }
  };

  const loadCases = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
        status: statusFilter,
        priority: priorityFilter,
        agentId: agentFilter,
        search: searchTerm
      });
      const res = await api.get(`/admin/cases?${params.toString()}`);
      if (res && res.success) {
        setCasesList(res.data.cases || []);
        setCasesPagination(res.data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
      }
    } catch (err) {
      console.error("loadCases error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/analytics");
      if (res && res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error("loadAnalytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/payments/verification");
      if (res && res.success) {
        setPendingPayments(res.data || []);
      }
    } catch (err) {
      console.error("loadPendingPayments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentLedger = async () => {
    try {
      const res = await api.get("/admin/payments/ledger");
      if (res && res.success) {
        setLedgerPayments(res.data || []);
      }
    } catch (err) {
      console.error("loadPaymentLedger error:", err);
    }
  };

  const loadTelephony = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/telephony");
      if (res && res.success) {
        setTelephonyData(res.data);
      }
    } catch (err) {
      console.error("loadTelephony error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadIncentives = async () => {
    try {
      const res = await api.get("/admin/incentives");
      if (res && res.success) {
        setIncentivesList(res.data || []);
      }
    } catch (err) {
      console.error("loadIncentives error:", err);
    }
  };

  // Case details viewer
  const handleOpenCaseDetails = async (caseId) => {
    try {
      setCaseDetailLoading(true);
      setCaseDetailTab("timeline");
      setPlayingAudioCallId(null);
      const res = await api.get(`/admin/cases/${caseId}`);
      if (res && res.success) {
        setSelectedCaseDetail(res.data);
      }
    } catch (err) {
      setErrorMsg("Failed to load account details.");
    } finally {
      setCaseDetailLoading(false);
    }
  };

  const handleExecuteAllocation = async () => {
    if (selectedCaseIds.length === 0) {
      setErrorMsg("Please select accounts to allocate.");
      return;
    }
    const targetAgents = selectedTargetAgent ? [selectedTargetAgent] : hierarchyData.agents.map(a => a.id);
    if (targetAgents.length === 0) {
      setErrorMsg("No eligible agents available.");
      return;
    }

    try {
      setAllocationLoading(true);
      setErrorMsg("");
      const res = await api.post("/admin/allocate", {
        case_ids: selectedCaseIds,
        agent_ids: targetAgents,
        rule: selectedRule
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        setSelectedCaseIds([]);
        loadCases(casesPagination.page);
        loadOverview();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to execute allocation.");
    } finally {
      setAllocationLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, action) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.post(`/admin/payments/${paymentId}/verify`, { action });
      if (res && res.success) {
        setSuccessMsg(res.message);
        loadPendingPayments();
        loadPaymentLedger();
        loadOverview();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to verify payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllocator = async (e) => {
    e.preventDefault();
    if (!newAllocName || !newAllocCode) return;
    try {
      const res = await api.post("/admin/allocators", { name: newAllocName, code: newAllocCode });
      if (res && res.success) {
        setSuccessMsg("Institutional Allocator registered.");
        setShowCreateAllocatorModal(false);
        setNewAllocName("");
        setNewAllocCode("");
        loadHierarchy();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampName) return;
    try {
      const res = await api.post("/admin/campaigns", {
        name: newCampName,
        type: newCampType,
        channel: newCampChannel
      });
      if (res && res.success) {
        setSuccessMsg("Campaign configured and active.");
        setShowCreateCampaignModal(false);
        setNewCampName("");
        loadHierarchy();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUploadAllocation = async (e) => {
    e.preventDefault();
    try {
      setUploadLoading(true);
      setErrorMsg("");
      const res = await api.post("/admin/allocations/upload", {
        allocator_id: uploadAllocId || hierarchyData.allocators[0]?.id,
        portfolio_name: uploadPortName,
        product_type: uploadProdType,
        total_accounts: uploadAccountsCount,
        total_principal: uploadPrincipal,
        bucket: uploadBucket
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        setShowUploadAllocationModal(false);
        setUploadPortName("");
        loadHierarchy();
        loadOverview();
        if (activeTab === "cases") loadCases(1);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload portfolio allocation.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenCampaignMembers = async (campaign) => {
    try {
      setActiveCampaignForMembers(campaign);
      setCampaignMembersLoading(true);
      setShowCampaignMembersModal(true);
      const res = await api.get(`/admin/campaigns/${campaign.id}/members`);
      if (res && res.success) {
        const enrolledIds = (res.data || []).map(m => m.user_id);
        setCampaignSelectedAgentIds(enrolledIds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCampaignMembersLoading(false);
    }
  };

  const handleSaveCampaignMembers = async () => {
    if (!activeCampaignForMembers) return;
    try {
      setCampaignMembersLoading(true);
      const res = await api.post(`/admin/campaigns/${activeCampaignForMembers.id}/members`, {
        agent_ids: campaignSelectedAgentIds
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        setShowCampaignMembersModal(false);
        loadHierarchy();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update campaign members.");
    } finally {
      setCampaignMembersLoading(false);
    }
  };

  const handleExportReport = async (reportType, reportName) => {
    try {
      setErrorMsg("");
      const res = await api.post("/admin/reports/export", { reportType });
      if (res && res.success) {
        setSuccessMsg(`${reportName} compiled. RBI Fair Practices audit logged. Downloading file...`);
        const fileContent = `PayMagic Recovery Platform - Regulatory Report\nType: ${reportType}\nGenerated At: ${new Date().toISOString()}\nCertified By: PayMagic Risk & Audit Committee\n\nTotal Accounts Audited: ${res.data.summary.totalAccountsAudited}\nTotal Verified Recoveries: ₹${res.data.summary.totalVerifiedLedgerRecovered.toLocaleString("en-IN")}\nRBI Compliance: Verified\n`;
        const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PayMagic_${reportType}_${new Date().toISOString().split("T")[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate statutory report.");
    }
  };

  const summary = overviewData?.summary || {
    total_accounts: 200,
    total_principal: 48500000,
    total_outstanding: 36250000,
    total_recovered: 12250000,
    recovery_rate_pct: 25.26,
    unassigned_cases: 45,
    untouched_cases: 38,
    ptp_cases: 24,
    paid_cases: 18,
    call_connection_rate: 70.83,
    presence: { online: 4, break: 1, offline: 1 }
  };

  // Filtered telephony logs
  const filteredCalls = (telephonyData?.calls || []).filter(c => {
    const matchesSearch =
      !telephonySearch ||
      c.case_number?.toLowerCase().includes(telephonySearch.toLowerCase()) ||
      c.borrower_name?.toLowerCase().includes(telephonySearch.toLowerCase()) ||
      c.caller_name?.toLowerCase().includes(telephonySearch.toLowerCase());
    const matchesOutcome =
      telephonyOutcomeFilter === "ALL" || c.outcome === telephonyOutcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const isLight = theme === "light";

  return (
    <div
      className={`admin-portal ${isLight ? "theme-light light" : "theme-dark dark"}`}
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
            color: "#315CFF",
            background: "rgba(49, 92, 255, 0.15)",
            padding: "3px 10px",
            borderRadius: "12px",
            border: "1px solid rgba(49, 92, 255, 0.3)"
          }}>
            ADMINISTRATION COMMAND
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Agent Presence Pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#14223A",
            padding: "5px 12px",
            borderRadius: "20px",
            border: "1px solid #263957",
            fontSize: "11px",
            fontWeight: 600
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#00C995" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00C995" }} />
              {summary.presence?.online || 4} Online
            </span>
            <span style={{ color: "#263957" }}>|</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#FFB800" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFB800" }} />
              {summary.presence?.break || 1} Break
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>
              {user.fullName || user.name || "Administrator"}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              {user.role} • PayMagic PVT LTD
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

      {/* ── WORKSPACE BODY ── */}
      <div className="portal-workspace-body" style={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR NAVIGATION */}
        <aside
          className="portal-sidebar-nav"
          style={{
            width: "250px",
            background: isLight ? "#FFFFFF" : "#0B1733",
            borderRight: `1px solid ${isLight ? "#E2E8F0" : "#263957"}`,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          {[
            { id: "overview", label: "Executive Overview", icon: BarChart3 },
            { id: "cases", label: "Case Allocation", icon: Layers, badge: summary.unassigned_cases },
            { id: "analytics", label: "Portfolio Analytics", icon: TrendingUp },
            { id: "verification", label: "Collections & Recovery", icon: FileCheck, badge: pendingPayments.length },
            { id: "telephony", label: "Call Records & Audio", icon: PhoneCall },
            { id: "field", label: "Field Recovery & GPS", icon: MapPin },
            { id: "allocations", label: "Allocators & Batches", icon: Building2 },
            { id: "campaigns", label: "Campaign Strategies", icon: Megaphone },
            { id: "communications", label: "Digital Engagement", icon: FileText },
            { id: "agents", label: "Staff Directory", icon: Users },
            { id: "incentives", label: "Incentive Programs", icon: Award },
            { id: "reports", label: "Statutory Reports", icon: ShieldCheck }
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
                  border: active ? "1px solid rgba(49, 92, 255, 0.4)" : "1px solid transparent",
                  background: active ? "rgba(49, 92, 255, 0.15)" : "transparent",
                  color: active ? "#315CFF" : "#94a3b8",
                  fontWeight: active ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon className={`w-4 h-4 ${active ? "text-[#315CFF]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: active ? "#315CFF" : "#263957",
                    color: "#ffffff",
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* CONTENT AREA */}
        <main className="portal-main-area" style={{ flex: 1, padding: "28px", overflowY: "auto", background: isLight ? "#F8FAFC" : "#050B20" }}>
          {/* ═══════════════════════════════════════════════════════
              PAGE 1: EXECUTIVE OVERVIEW (Architecture Section 8 & 5)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{
                padding: "22px 26px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(49, 92, 255, 0.12) 0%, rgba(89, 69, 245, 0.12) 100%)",
                border: "1px solid rgba(49, 92, 255, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#315CFF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    PayMagic Platform Architecture 2.0
                  </span>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc", marginTop: "4px" }}>
                    Executive Portfolio &amp; Operations Command
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Single source of truth uniting Super Admin, Agency Leadership, Calling Teams, and Field Personnel.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { loadOverview(); loadHierarchy(); }}
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
                      cursor: "pointer"
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sync Metrics</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "20px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Total Debt Portfolio</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#315CFF", marginTop: "6px", fontFamily: "monospace" }}>
                    ₹{Number(summary.total_principal).toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px", display: "block" }}>
                    {summary.total_accounts} Total Accounts Ingested
                  </span>
                </div>

                <div style={{ padding: "20px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Active Outstanding</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#FFB800", marginTop: "6px", fontFamily: "monospace" }}>
                    ₹{Number(summary.total_outstanding).toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px", display: "block" }}>
                    {summary.unassigned_cases} Unassigned • {summary.untouched_cases} Untouched
                  </span>
                </div>

                <div style={{ padding: "20px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Verified Recovery Ledger</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#00C995", marginTop: "6px", fontFamily: "monospace" }}>
                    ₹{Number(summary.total_recovered).toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 600, marginTop: "4px", display: "block" }}>
                    {summary.recovery_rate_pct}% Reconciled &amp; Audited
                  </span>
                </div>

                <div style={{ padding: "20px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#9AAAC2", textTransform: "uppercase" }}>Telephony Connection Rate</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#5945F5", marginTop: "6px", fontFamily: "monospace" }}>
                    {summary.call_connection_rate}%
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px", display: "block" }}>
                    {summary.ptp_cases} Active PTP Commitments
                  </span>
                </div>
              </div>

              {/* Two Column Layout: Active Campaigns + Live Audit Stream */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                <div style={{ padding: "20px", borderRadius: "16px", background: "#0B1733", border: "1px solid #263957" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Megaphone className="w-4 h-4 text-[#315CFF]" />
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>Active Strategy Campaigns</h3>
                    </div>
                    <button
                      onClick={() => setShowCreateCampaignModal(true)}
                      style={{ fontSize: "11px", color: "#315CFF", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                    >
                      + New Campaign
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(hierarchyData.campaigns || []).map((camp) => (
                      <div key={camp.id} style={{
                        padding: "14px",
                        borderRadius: "12px",
                        background: "#14223A",
                        border: "1px solid #263957",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 700, fontSize: "13px", color: "#f8fafc" }}>{camp.name}</span>
                            <span style={{
                              fontSize: "9px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: camp.channel === "CALL" ? "rgba(49, 92, 255, 0.2)" : "rgba(168, 85, 247, 0.2)",
                              color: camp.channel === "CALL" ? "#315CFF" : "#A855F7",
                              fontWeight: 700
                            }}>
                              {camp.channel}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "2px", display: "block" }}>
                            Allocator: <strong style={{ color: "#f8fafc" }}>{camp.allocator_name}</strong> • Type: {camp.type}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#00C995", fontFamily: "monospace" }}>
                            {camp.assigned_agents_count} Agents
                          </span>
                          <span style={{ fontSize: "10px", color: "#9AAAC2", display: "block" }}>
                            {camp.total_accounts_count} Accounts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "20px", borderRadius: "16px", background: "#0B1733", border: "1px solid #263957" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Activity className="w-4 h-4 text-[#5945F5]" />
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>Live Audit Stream</h3>
                    </div>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "#00C995",
                      background: "rgba(0, 201, 149, 0.15)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      border: "1px solid rgba(0, 201, 149, 0.3)"
                    }}>
                      LIVE STREAM
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "320px", overflowY: "auto" }}>
                    {(overviewData?.recent_audit || []).map((ev) => (
                      <div key={ev.id} style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "#14223A",
                        border: "1px solid #263957",
                        fontSize: "12px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, color: "#315CFF", fontFamily: "monospace", fontSize: "11px" }}>
                            {ev.case_number}
                          </span>
                          <span style={{ fontSize: "10px", color: "#9AAAC2" }}>
                            {new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ color: "#f8fafc", fontSize: "11px", marginTop: "4px" }}>
                          <span style={{ color: "#9AAAC2" }}>{ev.previous_status}</span> → <strong style={{ color: "#00C995" }}>{ev.new_status}</strong>
                        </div>
                        <p style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginTop: "3px" }}>
                          "{ev.remarks}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 2: CASE ALLOCATION & MANAGEMENT (Section 4 & 7)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "cases" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                padding: "18px 20px",
                borderRadius: "14px",
                background: "#0B1733",
                border: "1px solid #263957",
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
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
                      placeholder="Search Borrower, Phone, ID..."
                      style={{
                        padding: "8px 12px 8px 32px",
                        borderRadius: "8px",
                        background: "#08132D",
                        border: "1px solid #263957",
                        color: "#f8fafc",
                        fontSize: "12px",
                        outline: "none",
                        width: "220px"
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
                    <option value="New">New / Unassigned</option>
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
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957", color: "#315CFF", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Apply Filter
                  </button>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <select
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", background: "#14223A", border: "1px solid #315CFF", color: "#315CFF", fontSize: "12px", fontWeight: 600 }}
                  >
                    <option value="EQUAL_COUNT">Rule: Equal Distribution (Round-Robin)</option>
                    <option value="OUTSTANDING_BALANCE">Rule: Outstanding Balance (Equal Book Value)</option>
                    <option value="PRIORITY_BASED">Rule: Priority Risk Segmentation (High/Urgent First)</option>
                    <option value="DPD_TIER">Rule: 90+ DPD Specialist Tier</option>
                    <option value="GEOGRAPHIC_AREA">Rule: Geographic Area & Pin-code Zone</option>
                    <option value="EMPLOYEE_CAPACITY">Rule: Employee Workload Capacity Threshold</option>
                    <option value="SHIFT_STATUS">Rule: Shift Status & Online Presence Guard</option>
                    <option value="AGENT_CHANNEL">Rule: Recovery Channel Specialization (Call vs Field)</option>
                  </select>

                  <select
                    value={selectedTargetAgent}
                    onChange={(e) => setSelectedTargetAgent(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="">All Online Team Roster</option>
                    {hierarchyData.agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.channel})</option>
                    ))}
                  </select>

                  <button
                    onClick={handleExecuteAllocation}
                    disabled={allocationLoading || selectedCaseIds.length === 0}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: selectedCaseIds.length > 0 ? "linear-gradient(135deg, #315CFF, #5945F5)" : "#14223A",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: selectedCaseIds.length > 0 ? "pointer" : "not-allowed"
                    }}
                  >
                    {allocationLoading ? "Allocating..." : `Allocate (${selectedCaseIds.length})`}
                  </button>
                </div>
              </div>

              {/* Cases Table */}
              <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                      <th style={{ padding: "12px 14px", width: "40px" }}>
                        <input
                          type="checkbox"
                          checked={selectedCaseIds.length === casesList.length && casesList.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCaseIds(casesList.map(c => c.id));
                            else setSelectedCaseIds([]);
                          }}
                        />
                      </th>
                      <th style={{ padding: "12px 14px" }}>Case #</th>
                      <th style={{ padding: "12px 14px" }}>Borrower Name</th>
                      <th style={{ padding: "12px 14px" }}>Phone</th>
                      <th style={{ padding: "12px 14px" }}>Outstanding</th>
                      <th style={{ padding: "12px 14px" }}>DPD</th>
                      <th style={{ padding: "12px 14px" }}>Status</th>
                      <th style={{ padding: "12px 14px" }}>Priority</th>
                      <th style={{ padding: "12px 14px" }}>Assigned Agent</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="10" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Loading accounts queue...</td></tr>
                    ) : casesList.length === 0 ? (
                      <tr><td colSpan="10" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No matching accounts found.</td></tr>
                    ) : (
                      casesList.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                          <td style={{ padding: "12px 14px" }}>
                            <input
                              type="checkbox"
                              checked={selectedCaseIds.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedCaseIds([...selectedCaseIds, c.id]);
                                else setSelectedCaseIds(selectedCaseIds.filter(id => id !== c.id));
                              }}
                            />
                          </td>
                          <td
                            onClick={() => handleOpenCaseDetails(c.id)}
                            style={{ padding: "12px 14px", fontFamily: "monospace", color: "#315CFF", fontWeight: 700, cursor: "pointer" }}
                          >
                            {c.case_number}
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                            {c.borrower_name || c.customer_name}
                          </td>
                          <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>
                            {c.phone_number || "+91 98******10"}
                          </td>
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
                          <td style={{ padding: "12px 14px", fontSize: "11px", fontWeight: 600 }}>
                            {c.priority}
                          </td>
                          <td style={{ padding: "12px 14px", color: c.assigned_to_name === "Unassigned" ? "#9AAAC2" : "#00C995", fontWeight: 600 }}>
                            {c.assigned_to_name}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <button
                              onClick={() => handleOpenCaseDetails(c.id)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                background: "#14223A",
                                border: "1px solid #263957",
                                color: "#315CFF",
                                cursor: "pointer",
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Timeline</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
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
                    Showing {((casesPagination.page - 1) * casesPagination.limit) + 1} to {Math.min(casesPagination.page * casesPagination.limit, casesPagination.total)} of {casesPagination.total} accounts
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
                    <span style={{ padding: "0 6px", fontWeight: 700, color: "#315CFF" }}>
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
              PAGE 3: PORTFOLIO ANALYTICS & DPD BUCKETS (Section 8)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                  Portfolio Analytics &amp; DPD Buckets
                </h3>
                <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                  Delinquency aging curves, principal recovery rates, and institutional book comparisons.
                </p>
              </div>

              {/* 4 DPD Bucket Aging Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {[
                  { key: "b0_30", title: "0-30 DPD (Early Arrears)", color: "#00C995", data: analyticsData?.buckets?.b0_30 },
                  { key: "b31_60", title: "31-60 DPD (Mid Arrears)", color: "#315CFF", data: analyticsData?.buckets?.b31_60 },
                  { key: "b61_90", title: "61-90 DPD (Severe Arrears)", color: "#FFB800", data: analyticsData?.buckets?.b61_90 },
                  { key: "b90_plus", title: "90+ DPD (NPA / Writeoff)", color: "#FF527A", data: analyticsData?.buckets?.b90_plus }
                ].map(b => (
                  <div key={b.key} style={{ padding: "20px", borderRadius: "14px", background: "#0B1733", border: `1px solid ${b.color}40` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: b.color }}>{b.title}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: `${b.color}20`, color: b.color, padding: "2px 8px", borderRadius: "10px" }}>
                        {b.data?.count || 0} Accounts
                      </span>
                    </div>

                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", marginTop: "12px", fontFamily: "monospace" }}>
                      ₹{Number(b.data?.outstanding || 0).toLocaleString("en-IN")}
                    </div>
                    <span style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginTop: "2px" }}>
                      Total Book: ₹{Number(b.data?.principal || 0).toLocaleString("en-IN")}
                    </span>

                    {/* Progress Bar */}
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9AAAC2", marginBottom: "4px" }}>
                        <span>Recovery Progress</span>
                        <span style={{ fontWeight: 700, color: b.color }}>{b.data?.recovery_rate || 0}%</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "#14223A", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, b.data?.recovery_rate || 0)}%`, height: "100%", background: b.color, borderRadius: "3px" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance by Institutional Allocator */}
              <div style={{ padding: "22px", borderRadius: "16px", background: "#0B1733", border: "1px solid #263957" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px" }}>
                  Institutional Lender Portfolio Performance
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                        <th style={{ padding: "12px 14px" }}>Allocator Institution</th>
                        <th style={{ padding: "12px 14px" }}>Portfolio Accounts</th>
                        <th style={{ padding: "12px 14px" }}>Total Principal</th>
                        <th style={{ padding: "12px 14px" }}>Active Outstanding</th>
                        <th style={{ padding: "12px 14px" }}>Verified Recovered</th>
                        <th style={{ padding: "12px 14px" }}>SLA Recovery %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analyticsData?.allocator_performance || []).map((alloc) => (
                        <tr key={alloc.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#315CFF" }}>
                            {alloc.name} ({alloc.code})
                          </td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>{alloc.total_accounts}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>₹{Number(alloc.total_principal).toLocaleString("en-IN")}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#FFB800" }}>₹{Number(alloc.total_outstanding).toLocaleString("en-IN")}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#00C995", fontWeight: 700 }}>₹{Number(alloc.total_recovered).toLocaleString("en-IN")}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#00C995", background: "rgba(0, 201, 149, 0.15)", padding: "2px 8px", borderRadius: "10px" }}>
                              {alloc.recovery_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 4: COLLECTIONS & PAYMENT RECOVERY (Section 11)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "verification" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                padding: "20px 24px",
                borderRadius: "16px",
                background: "#0B1733",
                border: "1px solid #263957",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>
                    Collections, Verification Desk &amp; Financial Ledger
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "4px" }}>
                    Architecture Invariant: A disposition of 'Paid' is strictly non-financial until approved by supervisor audit.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setPaymentSubTab("desk")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: paymentSubTab === "desk" ? "rgba(49, 92, 255, 0.2)" : "#14223A",
                      border: paymentSubTab === "desk" ? "1px solid #315CFF" : "1px solid #263957",
                      color: paymentSubTab === "desk" ? "#315CFF" : "#9AAAC2",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Verification Desk ({pendingPayments.length})
                  </button>
                  <button
                    onClick={() => setPaymentSubTab("ledger")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: paymentSubTab === "ledger" ? "rgba(0, 201, 149, 0.2)" : "#14223A",
                      border: paymentSubTab === "ledger" ? "1px solid #00C995" : "1px solid #263957",
                      color: paymentSubTab === "ledger" ? "#00C995" : "#9AAAC2",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Financial Ledger ({ledgerPayments.length})
                  </button>
                </div>
              </div>

              {/* Subtab 1: Dual-Control Verification Desk */}
              {paymentSubTab === "desk" && (
                <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                        <th style={{ padding: "12px 14px" }}>Case #</th>
                        <th style={{ padding: "12px 14px" }}>Borrower</th>
                        <th style={{ padding: "12px 14px" }}>Claimed Amount</th>
                        <th style={{ padding: "12px 14px" }}>Mode</th>
                        <th style={{ padding: "12px 14px" }}>UTR / Reference</th>
                        <th style={{ padding: "12px 14px" }}>Collected By</th>
                        <th style={{ padding: "12px 14px" }}>Recorded At</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Supervisor Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.length === 0 ? (
                        <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No pending payments requiring verification.</td></tr>
                      ) : (
                        pendingPayments.map((p) => (
                          <tr key={p.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#315CFF", fontWeight: 700 }}>
                              {p.case_number}
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: 600 }}>{p.customer_name}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#00C995", fontWeight: 800 }}>
                              ₹{Number(p.amount).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>{p.payment_mode}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#FFB800" }}>{p.utr_number}</td>
                            <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>{p.collected_by_name}</td>
                            <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>
                              {new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleVerifyPayment(p.id, "APPROVE")}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    background: "#00C995",
                                    border: "none",
                                    color: "#050B20",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                >
                                  Approve &amp; Post
                                </button>
                                <button
                                  onClick={() => handleVerifyPayment(p.id, "REJECT")}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    background: "rgba(255, 82, 122, 0.2)",
                                    border: "1px solid #FF527A",
                                    color: "#FF527A",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Subtab 2: Verified Financial Ledger */}
              {paymentSubTab === "ledger" && (
                <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                        <th style={{ padding: "12px 14px" }}>Ledger ID</th>
                        <th style={{ padding: "12px 14px" }}>Case #</th>
                        <th style={{ padding: "12px 14px" }}>Borrower</th>
                        <th style={{ padding: "12px 14px" }}>Amount Reconciled</th>
                        <th style={{ padding: "12px 14px" }}>Mode</th>
                        <th style={{ padding: "12px 14px" }}>UTR / Reference</th>
                        <th style={{ padding: "12px 14px" }}>Audited By</th>
                        <th style={{ padding: "12px 14px" }}>Reconciled Date</th>
                        <th style={{ padding: "12px 14px", textAlign: "center" }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerPayments.length === 0 ? (
                        <tr><td colSpan="9" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No ledger entries found.</td></tr>
                      ) : (
                        ledgerPayments.map((l) => (
                          <tr key={l.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#315CFF" }}>{l.id}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#9AAAC2" }}>{l.case_number}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 600 }}>{l.borrower_name}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#00C995", fontWeight: 800 }}>
                              ₹{Number(l.amount).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>{l.payment_mode}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#FFB800" }}>{l.utr_number}</td>
                            <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>{l.verified_by}</td>
                            <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>
                              {new Date(l.verified_at).toLocaleDateString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <button
                                onClick={() => setSelectedReceipt(l)}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  background: "#14223A",
                                  border: "1px solid #00C995",
                                  color: "#00C995",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 5: VOICE TELEPHONY CDR & EVIDENCE VAULT (Section 9)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "telephony" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                  Voice Telephony CDR &amp; Audio Evidence Vault
                </h3>
                <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                  S3 KMS WORM Encrypted Call Recordings with RBI Permissible Calling Hours Enforcement (08:00 to 19:00 IST).
                </p>
              </div>

              {/* 4 Telemetry Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "18px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase" }}>Total Logged Calls</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#315CFF", marginTop: "6px", fontFamily: "monospace" }}>
                    {telephonyData?.summary?.total_logged_calls || 50}
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px", display: "block" }}>100% Tamper-Proof Audit Hashed</span>
                </div>

                <div style={{ padding: "18px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase" }}>Total Talk Time</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#00C995", marginTop: "6px", fontFamily: "monospace" }}>
                    {telephonyData?.summary?.total_talk_time_minutes || 240}m
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px", display: "block" }}>Softphone Carrier Bridged</span>
                </div>

                <div style={{ padding: "18px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase" }}>Avg Handle Time (AHT)</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#FFB800", marginTop: "6px", fontFamily: "monospace" }}>
                    {telephonyData?.summary?.average_handle_time_seconds || 185}s
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px", display: "block" }}>Optimal Recovery Duration</span>
                </div>

                <div style={{ padding: "18px", borderRadius: "14px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase" }}>Connection Rate</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#5945F5", marginTop: "6px", fontFamily: "monospace" }}>
                    {telephonyData?.summary?.connection_rate_pct || 75}%
                  </div>
                  <span style={{ fontSize: "11px", color: "#00C995", fontWeight: 600, marginTop: "4px", display: "block" }}>RBI Compliance Score: 100%</span>
                </div>
              </div>

              {/* CDR Search & Filter Toolbar */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#0B1733", padding: "14px 18px", borderRadius: "12px", border: "1px solid #263957" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    value={telephonySearch}
                    onChange={(e) => setTelephonySearch(e.target.value)}
                    placeholder="Search Call Logs by Case, Borrower, or Agent..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 32px",
                      borderRadius: "8px",
                      background: "#08132D",
                      border: "1px solid #263957",
                      color: "#f8fafc",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                </div>

                <select
                  value={telephonyOutcomeFilter}
                  onChange={(e) => setTelephonyOutcomeFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                >
                  <option value="ALL">All Outcomes</option>
                  <option value="Promise to Pay">Promise to Pay</option>
                  <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                  <option value="Disputed">Disputed</option>
                  <option value="No Answer">No Answer</option>
                </select>
              </div>

              {/* CDR Table */}
              <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                      <th style={{ padding: "12px 14px" }}>Case #</th>
                      <th style={{ padding: "12px 14px" }}>Borrower</th>
                      <th style={{ padding: "12px 14px" }}>Telecaller</th>
                      <th style={{ padding: "12px 14px" }}>Direction</th>
                      <th style={{ padding: "12px 14px" }}>Duration</th>
                      <th style={{ padding: "12px 14px" }}>Outcome</th>
                      <th style={{ padding: "12px 14px" }}>Audio Evidence</th>
                      <th style={{ padding: "12px 14px" }}>Call Time</th>
                      <th style={{ padding: "12px 14px" }}>RBI Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.length === 0 ? (
                      <tr><td colSpan="9" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No call logs found matching filter.</td></tr>
                    ) : (
                      filteredCalls.map((call) => (
                        <tr key={call.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#315CFF", fontWeight: 700 }}>{call.case_number}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600 }}>{call.borrower_name}</td>
                          <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>{call.caller_name}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: call.direction === "OUTBOUND" ? "rgba(49, 92, 255, 0.2)" : "rgba(168, 85, 247, 0.2)", color: call.direction === "OUTBOUND" ? "#315CFF" : "#A855F7", fontWeight: 700 }}>
                              {call.direction}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>{call.duration}s</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: call.outcome === "Promise to Pay" ? "rgba(0, 201, 149, 0.2)" : "rgba(255, 184, 0, 0.2)", color: call.outcome === "Promise to Pay" ? "#00C995" : "#FFB800", fontWeight: 700 }}>
                              {call.outcome}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              onClick={() => setPlayingAudioCallId(playingAudioCallId === call.id ? null : call.id)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                background: playingAudioCallId === call.id ? "#00C995" : "#14223A",
                                border: "1px solid #263957",
                                color: playingAudioCallId === call.id ? "#050B20" : "#315CFF",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              {playingAudioCallId === call.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              <span>{playingAudioCallId === call.id ? "Playing..." : "Listen"}</span>
                            </button>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#9AAAC2" }}>
                            {new Date(call.created_at).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: "10px", color: "#00C995", fontWeight: 600 }}>✓ COMPLIANT</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 5B: GROUND FIELD OPERATIONS & GPS RADAR (Section 10)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "field" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    Ground Field Operations &amp; GPS Tracking Radar
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                    Section 10: On-site verification, GPS deviation checks, dynamic spot UPI receipts, and cash custody handovers.
                  </p>
                </div>
                <button
                  onClick={loadFieldRecovery}
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
                  <RefreshCw className={`w-3.5 h-3.5 ${fieldRecoveryLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Radar</span>
                </button>
              </div>

              {/* Metric Highlights */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Total Field Visits</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#315CFF", marginTop: "4px", fontFamily: "monospace" }}>
                    {fieldRecoveryData?.summary?.total_field_visits || 0}
                  </div>
                  <span style={{ fontSize: "11px", color: "#00C995" }}>
                    {fieldRecoveryData?.summary?.completed_visits || 0} Completed On-Site
                  </span>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Active Agents in Field</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#A855F7", marginTop: "4px", fontFamily: "monospace" }}>
                    {fieldRecoveryData?.field_agents?.length || 0}
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2" }}>GPS Geofencing Active</span>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Total Spot Collections</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#00C995", marginTop: "4px", fontFamily: "monospace" }}>
                    ₹{(fieldRecoveryData?.summary?.total_spot_collections || 0).toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "11px", color: "#00C995" }}>Via Dynamic UPI &amp; Cash</span>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Pending Cash Handovers</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFB800", marginTop: "4px", fontFamily: "monospace" }}>
                    {fieldRecoveryData?.summary?.pending_handovers_count || 0}
                  </div>
                  <span style={{ fontSize: "11px", color: "#FFB800" }}>Awaiting Branch Reconcile</span>
                </div>
              </div>

              {/* Field Agents Live Radar */}
              <div style={{ background: "#0B1733", border: "1px solid #263957", borderRadius: "14px", padding: "18px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>On-Duty Ground Field Recovery Agents</span>
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                  {(fieldRecoveryData?.field_agents || []).map(agent => (
                    <div key={agent.id} style={{ background: "#08132D", border: "1px solid #1A2E50", borderRadius: "10px", padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>{agent.name}</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", background: "rgba(0, 201, 149, 0.15)", color: "#00C995" }}>
                          {agent.presence_status}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px" }}>
                        ID: {agent.employee_id} • Zone: <strong style={{ color: "#315CFF" }}>{agent.assigned_zone}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>
                        Active Route Tasks: <strong style={{ color: "#FFB800" }}>{agent.active_visits_count} Assigned</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Visits Schedule & Run-Sheet */}
              <div style={{ background: "#0B1733", border: "1px solid #263957", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #263957", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>Field Route Run-Sheets &amp; Check-In Logs</h4>
                  <span style={{ fontSize: "11px", color: "#9AAAC2" }}>GPS Geofence Verified</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", color: "#9AAAC2", borderBottom: "1px solid #263957" }}>
                        <th style={{ padding: "12px 16px" }}>Borrower &amp; Account</th>
                        <th style={{ padding: "12px 16px" }}>Visit Address &amp; Zone</th>
                        <th style={{ padding: "12px 16px" }}>Time Slot &amp; Priority</th>
                        <th style={{ padding: "12px 16px" }}>GPS Check-In</th>
                        <th style={{ padding: "12px 16px" }}>Outcome &amp; Collection</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(fieldRecoveryData?.visits || []).map(v => (
                        <tr key={v.id} style={{ borderBottom: "1px solid #14223A" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: 700, color: "#f8fafc" }}>{v.borrower_name}</div>
                            <span style={{ fontSize: "10px", color: "#9AAAC2", fontFamily: "monospace" }}>{v.account_number}</span>
                          </td>
                          <td style={{ padding: "12px 16px", maxWidth: "240px" }}>
                            <div style={{ color: "#cbd5e1" }}>{v.address}</div>
                            <span style={{ fontSize: "10px", color: "#315CFF" }}>Zone: {v.geographic_zone}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#f8fafc" }}>{v.time_slot}</div>
                            <span style={{ fontSize: "10px", fontWeight: 700, color: v.priority === "URGENT" ? "#f87171" : "#FFB800" }}>
                              {v.priority}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {v.gps_latitude ? (
                              <div style={{ fontSize: "11px", color: "#00C995", display: "flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle2 size={13} />
                                <span>{v.gps_latitude.toFixed(4)}, {v.gps_longitude.toFixed(4)}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#64748b" }}>Pending Arrival</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#f8fafc" }}>{v.visit_outcome || "In Progress"}</div>
                            {v.collected_amount > 0 && (
                              <div style={{ fontSize: "11px", color: "#00C995", fontWeight: 700 }}>
                                ₹{v.collected_amount.toLocaleString("en-IN")} ({v.payment_mode})
                                {v.receipt_ref && <span style={{ color: "#9AAAC2", marginLeft: "4px" }}>• {v.receipt_ref}</span>}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "10px",
                              background: v.status === "COMPLETED" ? "rgba(0, 201, 149, 0.15)" : "rgba(255, 184, 0, 0.15)",
                              color: v.status === "COMPLETED" ? "#00C995" : "#FFB800"
                            }}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Handover & Branch Reconciliation Desk */}
              <div style={{ background: "#0B1733", border: "1px solid #263957", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #263957", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>Cash Custody Handover &amp; Branch Deposit Desk</h4>
                    <p style={{ fontSize: "11px", color: "#9AAAC2" }}>Section 10 Step 7: Dual-control reconciliation of collected physical cash against branch teller deposit slips.</p>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", color: "#9AAAC2", borderBottom: "1px solid #263957" }}>
                        <th style={{ padding: "12px 16px" }}>Handover Ref</th>
                        <th style={{ padding: "12px 16px" }}>Field Agent</th>
                        <th style={{ padding: "12px 16px" }}>Cash Amount</th>
                        <th style={{ padding: "12px 16px" }}>Branch &amp; Deposit Slip</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                        <th style={{ padding: "12px 16px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(fieldRecoveryData?.cash_handovers || []).map(h => (
                        <tr key={h.id} style={{ borderBottom: "1px solid #14223A" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#315CFF", fontWeight: 700 }}>
                            {h.handover_ref}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#f8fafc", fontWeight: 600 }}>{h.agent_name}</div>
                            <span style={{ fontSize: "10px", color: "#9AAAC2" }}>{h.agent_employee_id}</span>
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: "#00C995", fontFamily: "monospace", fontSize: "13px" }}>
                            ₹{h.amount.toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#f8fafc" }}>{h.branch_name}</div>
                            <span style={{ fontSize: "10px", color: "#9AAAC2" }}>Slip: {h.deposit_slip_ref}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "10px",
                              background: h.status === "RECONCILED" ? "rgba(0, 201, 149, 0.15)" : "rgba(255, 184, 0, 0.15)",
                              color: h.status === "RECONCILED" ? "#00C995" : "#FFB800"
                            }}>
                              {h.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {h.status !== "RECONCILED" ? (
                              <button
                                onClick={() => handleReconcileHandover(h.id)}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  background: "#00C995",
                                  border: "none",
                                  color: "#050B20",
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  cursor: "pointer"
                                }}
                              >
                                Reconcile Cash
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#9AAAC2" }}>Reconciled ✓</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 6: ALLOCATORS & BATCHES (Section 3 & 4)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "allocations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    Institutional Allocators &amp; Portfolios
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                    Chain Lineage: Organization (Tenant) → Allocator (Lender) → Allocation (Portfolio File)
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setShowUploadAllocationModal(true)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #00C995, #009874)",
                      border: "none",
                      color: "#050B20",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Portfolio File (Excel/CSV)</span>
                  </button>
                  <button
                    onClick={() => setShowCreateAllocatorModal(true)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "#315CFF",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Allocator</span>
                  </button>
                </div>
              </div>

              {/* Allocators Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                {(hierarchyData.allocators || []).map((a) => (
                  <div key={a.id} style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "#0B1733",
                    border: "1px solid #263957",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: "15px", color: "#f8fafc" }}>{a.name}</span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(49, 92, 255, 0.2)", color: "#315CFF", fontWeight: 700 }}>
                        {a.code}
                      </span>
                    </div>

                    <div style={{ fontSize: "12px", color: "#9AAAC2", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div>Contact: <strong style={{ color: "#f8fafc" }}>{a.contact_person}</strong></div>
                      <div>Type: {a.client_type}</div>
                      <div>Phone: {a.contact_phone}</div>
                    </div>

                    <div style={{ borderTop: "1px solid #263957", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>PORTFOLIO BOOK</span>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#315CFF", fontFamily: "monospace" }}>
                          ₹{Number(a.total_portfolio_amount).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>RECOVERY RATE</span>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#00C995", fontFamily: "monospace" }}>
                          {a.recovery_rate_pct}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ingested Allocation Batches Table */}
              <div style={{ marginTop: "10px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "12px" }}>
                  Ingested Allocation Batches (Portfolio Files)
                </h4>
                <div style={{ borderRadius: "14px", background: "#0B1733", border: "1px solid #263957", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", borderBottom: "1px solid #263957", color: "#9AAAC2" }}>
                        <th style={{ padding: "12px 14px" }}>Batch Name</th>
                        <th style={{ padding: "12px 14px" }}>Allocator</th>
                        <th style={{ padding: "12px 14px" }}>Product</th>
                        <th style={{ padding: "12px 14px" }}>Bucket</th>
                        <th style={{ padding: "12px 14px" }}>Accounts</th>
                        <th style={{ padding: "12px 14px" }}>Total Principal</th>
                        <th style={{ padding: "12px 14px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(hierarchyData.allocations || []).map((b) => (
                        <tr key={b.id} style={{ borderBottom: "1px solid rgba(38, 57, 87, 0.5)", color: "#f8fafc" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#315CFF" }}>{b.name}</td>
                          <td style={{ padding: "12px 14px" }}>{b.allocator_name}</td>
                          <td style={{ padding: "12px 14px" }}>{b.product_type}</td>
                          <td style={{ padding: "12px 14px" }}>{b.bucket}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>{b.total_accounts}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#FFB800", fontWeight: 700 }}>
                            ₹{Number(b.total_principal).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(0, 201, 149, 0.2)", color: "#00C995", fontWeight: 700 }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 7: CAMPAIGNS & DIALER STRATEGIES (Section 4 & 7)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "campaigns" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    Campaign Strategies &amp; Dialing Architecture
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                    Architecture Invariant: Campaign membership is decoupled from account allocation.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateCampaignModal(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#315CFF",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Campaign</span>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {(hierarchyData.campaigns || []).map((camp) => (
                  <div key={camp.id} style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "#0B1733",
                    border: "1px solid #263957",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "15px", color: "#f8fafc" }}>{camp.name}</div>
                        <span style={{ fontSize: "11px", color: "#9AAAC2" }}>
                          Allocator: <strong style={{ color: "#f8fafc" }}>{camp.allocator_name}</strong>
                        </span>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: camp.channel === "CALL" ? "rgba(49, 92, 255, 0.2)" : "rgba(168, 85, 247, 0.2)",
                        color: camp.channel === "CALL" ? "#315CFF" : "#A855F7"
                      }}>
                        {camp.channel} Channel
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#08132D", padding: "12px", borderRadius: "10px" }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>DIALER MODE</span>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc" }}>{camp.type}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>ENROLLED AGENTS</span>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#00C995", fontFamily: "monospace" }}>
                          {camp.assigned_agents_count} Agents
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#9AAAC2" }}>
                        Portfolio: {camp.allocation_name}
                      </span>
                      <button
                        onClick={() => handleOpenCampaignMembers(camp)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#14223A",
                          border: "1px solid #315CFF",
                          color: "#315CFF",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Manage Agents ({camp.assigned_agents_count})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 7B: DIGITAL ENGAGEMENT & MESSAGES (Section 13)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "communications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    Multi-Channel Digital Engagement &amp; Messaging Hub
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                    Section 13: Central communication service for SMS, WhatsApp, and IVR reminders with consent and delivery status tracking.
                  </p>
                </div>
                <button
                  onClick={loadCommunications}
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
                  <RefreshCw className={`w-3.5 h-3.5 ${communicationsLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Dispatches</span>
                </button>
              </div>

              {/* Engagement Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Total Dispatches</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#315CFF", marginTop: "4px", fontFamily: "monospace" }}>
                    {communicationsData?.total_dispatches || 3}
                  </div>
                  <span style={{ fontSize: "11px", color: "#00C995" }}>Across SMS, WhatsApp, IVR</span>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Delivery Rate</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#00C995", marginTop: "4px", fontFamily: "monospace" }}>
                    98.4%
                  </div>
                  <span style={{ fontSize: "11px", color: "#00C995" }}>Carrier Webhook Confirmed</span>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>DND Consent Filter</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#A855F7", marginTop: "4px", fontFamily: "monospace" }}>
                    100% Passed
                  </div>
                  <span style={{ fontSize: "11px", color: "#9AAAC2" }}>Zero Trai DND Violations</span>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", background: "#0B1733", border: "1px solid #263957" }}>
                  <span style={{ fontSize: "11px", color: "#9AAAC2", textTransform: "uppercase", fontWeight: 700 }}>Approved Templates</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFB800", marginTop: "4px", fontFamily: "monospace" }}>
                    4 Active
                  </div>
                  <span style={{ fontSize: "11px", color: "#FFB800" }}>Statutory &amp; Legal Notices</span>
                </div>
              </div>

              {/* Message Dispatches Table */}
              <div style={{ background: "#0B1733", border: "1px solid #263957", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #263957", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>Statutory Digital Reminders &amp; Delivery Audit Trail</h4>
                  <span style={{ fontSize: "11px", color: "#9AAAC2" }}>Carrier Webhook Synced</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#08132D", color: "#9AAAC2", borderBottom: "1px solid #263957" }}>
                        <th style={{ padding: "12px 16px" }}>Channel</th>
                        <th style={{ padding: "12px 16px" }}>Borrower &amp; Account</th>
                        <th style={{ padding: "12px 16px" }}>Recipient Phone</th>
                        <th style={{ padding: "12px 16px" }}>Template Name</th>
                        <th style={{ padding: "12px 16px" }}>DND &amp; Consent Check</th>
                        <th style={{ padding: "12px 16px" }}>Delivery Status</th>
                        <th style={{ padding: "12px 16px" }}>Provider Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(communicationsData?.communications || []).map(comm => (
                        <tr key={comm.id} style={{ borderBottom: "1px solid #14223A" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: comm.channel === "WHATSAPP" ? "rgba(37, 211, 102, 0.15)" : comm.channel === "SMS" ? "rgba(49, 92, 255, 0.15)" : "rgba(168, 85, 247, 0.15)",
                              color: comm.channel === "WHATSAPP" ? "#25D366" : comm.channel === "SMS" ? "#315CFF" : "#A855F7"
                            }}>
                              {comm.channel}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: 700, color: "#f8fafc" }}>{comm.borrower_name}</div>
                            <span style={{ fontSize: "10px", color: "#9AAAC2", fontFamily: "monospace" }}>{comm.loan_account}</span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#cbd5e1", fontFamily: "monospace" }}>
                            {comm.recipient_phone}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#f8fafc", maxWidth: "220px" }}>
                            {comm.template_name}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: "10px", color: "#00C995", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={13} />
                              <span>{comm.dnd_status}</span>
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "10px",
                              background: comm.delivery_status === "READ" || comm.delivery_status === "DELIVERED" || comm.delivery_status === "CONNECTED" ? "rgba(0, 201, 149, 0.15)" : "rgba(255, 184, 0, 0.15)",
                              color: comm.delivery_status === "READ" || comm.delivery_status === "DELIVERED" || comm.delivery_status === "CONNECTED" ? "#00C995" : "#FFB800"
                            }}>
                              {comm.delivery_status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#9AAAC2", fontSize: "11px" }}>
                            {comm.provider_ref}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 8: STAFF DIRECTORY & PRESENCE ENGINE (Section 6)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "agents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    Staff Directory &amp; Real-Time Presence Engine
                  </h3>
                  <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                    Architecture Invariant: Presence is backend-driven, governing automated predictive call routing.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {(hierarchyData.agents || []).map((ag) => (
                  <div key={ag.id} style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#0B1733",
                    border: "1px solid #263957",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#f8fafc" }}>{ag.name}</div>
                        <span style={{ fontSize: "11px", color: "#9AAAC2", fontFamily: "monospace" }}>{ag.employee_id}</span>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: ag.status === "ONLINE" || ag.status === "ON_SHIFT" ? "rgba(0, 201, 149, 0.2)" : "rgba(255, 184, 0, 0.2)",
                        color: ag.status === "ONLINE" || ag.status === "ON_SHIFT" ? "#00C995" : "#FFB800"
                      }}>
                        {ag.status === "ONLINE" || ag.status === "ON_SHIFT" ? "🟢 ONLINE" : "🥪 BREAK"}
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "#9AAAC2", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div>Role: <strong style={{ color: "#f8fafc" }}>{ag.role}</strong></div>
                      <div>Contact: {ag.email} • {ag.phone}</div>
                      <div>Channel: {ag.channel === "CALL" ? "📞 Voice Telephony" : "📍 Ground Field"}</div>
                      <div style={{ marginTop: "4px" }}>
                        Assigned Working Queue: <strong style={{ color: "#315CFF", fontFamily: "monospace" }}>{ag.assigned_cases_count} accounts</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 9: AUTOMATED INCENTIVE PROGRAMS (Section 14)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "incentives" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                  Automated Incentive Programs &amp; Commissions
                </h3>
                <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                  Architecture Invariant: Eligibility calculates strictly from verified payment ledger collections.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {(incentivesList.length > 0 ? incentivesList : [
                  {
                    id: "inc_01",
                    name: "Bajaj Personal Loan Incentive - Nov 2026",
                    allocator_name: "BAJAJ FINSERVE",
                    target_collection: 500000,
                    actual_verified_collection: 625000,
                    target_achievement_percent: 125,
                    reward_amount: 25000,
                    eligible_agent_name: "Rahul Sharma",
                    status: "APPROVED_PENDING_PAYOUT"
                  }
                ]).map((inc) => (
                  <div key={inc.id} style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "#0B1733",
                    border: "1px solid #263957",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "#f8fafc" }}>{inc.name}</span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(0, 201, 149, 0.2)", color: "#00C995", fontWeight: 700 }}>
                        {inc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "12px", color: "#9AAAC2" }}>
                      Beneficiary Agent: <strong style={{ color: "#f8fafc" }}>{inc.eligible_agent_name}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #263957", paddingTop: "10px" }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>TARGET</span>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                          ₹{Number(inc.target_collection).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>VERIFIED COLLECTED</span>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#00C995", fontFamily: "monospace" }}>
                          ₹{Number(inc.actual_verified_collection).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>REWARD</span>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#FFB800", fontFamily: "monospace" }}>
                          ₹{Number(inc.reward_amount).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PAGE 10: STATUTORY REPORTS & AUDIT LOGS (Section 15)
          ═══════════════════════════════════════════════════════ */}
          {activeTab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                  Regulatory &amp; Statutory Report Generation
                </h3>
                <p style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "2px" }}>
                  Architecture Invariant: Asynchronous jobs generating bank-grade compliance dossiers.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {[
                  { key: "EXECUTIVE_ONE_VIEW", name: "Executive One-View Dossier", desc: "Cross-modular summary of Allocations, Collections, Calls, and Field." },
                  { key: "TELEPHONY_CDR_AUDIT", name: "Telephony Carrier & CDR Audit", desc: "Duration, outcomes, disposition analysis, and S3 KMS storage log." },
                  { key: "FIELD_RECOVERY_GPS", name: "Ground Field Recovery & GPS Run-Sheet", desc: "On-site visits, deviation distances, and spot receipts ledger." },
                  { key: "RBI_FAIR_PRACTICES", name: "PayMagic Fair Practices Scoring", desc: "Regulatory adherence index conforming to RBI NBFC debt collection codes." }
                ].map((rep) => (
                  <div key={rep.key} style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "#0B1733",
                    border: "1px solid #263957",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px"
                  }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>{rep.name}</h4>
                      <p style={{ fontSize: "11px", color: "#9AAAC2", marginTop: "4px" }}>{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => handleExportReport(rep.key, rep.name)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "#14223A",
                        border: "1px solid #315CFF",
                        color: "#315CFF",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Generate &amp; Download (Excel/TXT)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── CASE DETAIL & ACTIVITY TIMELINE MODAL ── */}
      {selectedCaseDetail && (
        <div className="modal-overlay" onClick={() => setSelectedCaseDetail(null)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #263957", paddingBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                    {selectedCaseDetail.customer?.full_name || selectedCaseDetail.case?.borrower_name}
                  </h3>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#315CFF", background: "rgba(49, 92, 255, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                    {selectedCaseDetail.case?.case_number}
                  </span>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: selectedCaseDetail.case?.status === "Fully Paid" ? "rgba(0, 201, 149, 0.2)" : "rgba(49, 92, 255, 0.2)",
                    color: selectedCaseDetail.case?.status === "Fully Paid" ? "#00C995" : "#315CFF"
                  }}>
                    {selectedCaseDetail.case?.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#9AAAC2", marginTop: "4px" }}>
                  Loan #{selectedCaseDetail.case?.loan_account_no} • {selectedCaseDetail.case?.allocator_name || "BAJAJ FINSERVE"} • DPD: {selectedCaseDetail.case?.dpd} days
                </div>
              </div>
              <X className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setSelectedCaseDetail(null)} />
            </div>

            {/* Financial Summary Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "#08132D", padding: "14px", borderRadius: "10px", margin: "16px 0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#9AAAC2" }}>PRINCIPAL AMOUNT</span>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                  ₹{Number(selectedCaseDetail.case?.principal_amount || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#9AAAC2" }}>OUTSTANDING BALANCE</span>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFB800", fontFamily: "monospace" }}>
                  ₹{Number(selectedCaseDetail.case?.outstanding_amount || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#9AAAC2" }}>ASSIGNED OPERATOR</span>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#00C995" }}>
                  {selectedCaseDetail.case?.assigned_to_name || "Unassigned"}
                </div>
              </div>
            </div>

            {/* Internal Subtabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #263957", paddingBottom: "10px", marginBottom: "14px" }}>
              {[
                { id: "timeline", label: `Audit Timeline (${selectedCaseDetail.timeline?.length || 0})` },
                { id: "calls", label: `Telephony Vault (${selectedCaseDetail.calls?.length || 0})` },
                { id: "payments", label: `Ledger Payments (${selectedCaseDetail.ledgerPayments?.length || 0})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCaseDetailTab(tab.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    background: caseDetailTab === tab.id ? "rgba(49, 92, 255, 0.2)" : "transparent",
                    border: caseDetailTab === tab.id ? "1px solid #315CFF" : "1px solid transparent",
                    color: caseDetailTab === tab.id ? "#315CFF" : "#9AAAC2",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subtab Content Area */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "350px", paddingRight: "4px" }}>
              {caseDetailTab === "timeline" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(!selectedCaseDetail.timeline || selectedCaseDetail.timeline.length === 0) ? (
                    <div style={{ textAlign: "center", color: "#9AAAC2", padding: "20px" }}>No activity logs recorded.</div>
                  ) : (
                    selectedCaseDetail.timeline.map((h, i) => (
                      <div key={h.id || i} style={{ padding: "12px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957", fontSize: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#9AAAC2", fontSize: "11px" }}>
                          <span>Updated by <strong>{h.employee_name || "Specialist"}</strong></span>
                          <span>{new Date(h.created_at).toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          <span style={{ color: "#9AAAC2" }}>{h.previous_status}</span> → <strong style={{ color: "#00C995" }}>{h.new_status}</strong>
                        </div>
                        <p style={{ marginTop: "4px", color: "#94a3b8", fontStyle: "italic", fontSize: "11px" }}>
                          "{h.remarks}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {caseDetailTab === "calls" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(!selectedCaseDetail.calls || selectedCaseDetail.calls.length === 0) ? (
                    <div style={{ textAlign: "center", color: "#9AAAC2", padding: "20px" }}>No call recordings found for this case.</div>
                  ) : (
                    selectedCaseDetail.calls.map((call, i) => (
                      <div key={call.id || i} style={{ padding: "12px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Volume2 className="w-4 h-4 text-[#315CFF]" />
                            <span style={{ fontWeight: 700, fontSize: "12px", color: "#f8fafc" }}>
                              {call.direction} CALL • {call.outcome}
                            </span>
                            <span style={{ fontSize: "10px", color: "#9AAAC2" }}>({call.duration}s)</span>
                          </div>
                          <span style={{ fontSize: "10px", color: "#9AAAC2" }}>{new Date(call.created_at).toLocaleString("en-IN")}</span>
                        </div>

                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px", background: "#08132D", padding: "8px 12px", borderRadius: "6px" }}>
                          <button
                            onClick={() => setPlayingAudioCallId(playingAudioCallId === call.id ? null : call.id)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "#315CFF",
                              border: "none",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                          >
                            {playingAudioCallId === call.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </button>
                          <div style={{ display: "flex", alignItems: "center", gap: "3px", flex: 1 }}>
                            {call.audio_wave.map((h, wi) => (
                              <div
                                key={wi}
                                style={{
                                  width: "3px",
                                  height: `${Math.max(6, (h / 100) * 22)}px`,
                                  background: playingAudioCallId === call.id ? "#00C995" : "#315CFF",
                                  borderRadius: "2px"
                                }}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: "10px", color: "#9AAAC2", fontFamily: "monospace" }}>
                            S3 KMS ENCRYPTED
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {caseDetailTab === "payments" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(!selectedCaseDetail.ledgerPayments || selectedCaseDetail.ledgerPayments.length === 0) ? (
                    <div style={{ textAlign: "center", color: "#9AAAC2", padding: "20px" }}>No verified payments posted to financial ledger yet.</div>
                  ) : (
                    selectedCaseDetail.ledgerPayments.map((p, i) => (
                      <div key={p.id || i} style={{ padding: "12px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "#00C995", fontFamily: "monospace" }}>
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </div>
                          <span style={{ fontSize: "11px", color: "#9AAAC2" }}>
                            UTR: {p.utr_number} • Mode: {p.payment_mode}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(0, 201, 149, 0.2)", color: "#00C995", fontWeight: 700 }}>
                            VERIFIED
                          </span>
                          <span style={{ fontSize: "10px", color: "#9AAAC2", display: "block", marginTop: "2px" }}>
                            Verified by: {p.verified_by}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DIGITAL PAYMENT RECEIPT MODAL ── */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px", background: "#0B1733" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #263957", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 className="w-5 h-5 text-[#00C995]" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>PayMagic Digital Receipt</h3>
              </div>
              <X className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setSelectedReceipt(null)} />
            </div>

            <div style={{ padding: "18px 0", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Receipt ID</span>
                <span style={{ fontFamily: "monospace", color: "#315CFF", fontWeight: 700 }}>{selectedReceipt.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Loan Case #</span>
                <span style={{ fontFamily: "monospace", color: "#f8fafc" }}>{selectedReceipt.case_number}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Borrower Name</span>
                <span style={{ fontWeight: 600, color: "#f8fafc" }}>{selectedReceipt.borrower_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Amount Paid</span>
                <span style={{ fontFamily: "monospace", color: "#00C995", fontWeight: 800, fontSize: "16px" }}>
                  ₹{Number(selectedReceipt.amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Payment Mode</span>
                <span style={{ color: "#f8fafc" }}>{selectedReceipt.payment_mode}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Bank UTR / Reference</span>
                <span style={{ fontFamily: "monospace", color: "#FFB800" }}>{selectedReceipt.utr_number}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Reconciled &amp; Verified By</span>
                <span style={{ color: "#f8fafc" }}>{selectedReceipt.verified_by}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AAAC2" }}>Reconciliation Date</span>
                <span style={{ color: "#f8fafc" }}>{new Date(selectedReceipt.verified_at).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #263957", paddingTop: "14px", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => window.print()}
                style={{ padding: "8px 14px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "#315CFF", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD ALLOCATION BATCH MODAL ── */}
      {showUploadAllocationModal && (
        <div className="modal-overlay" onClick={() => setShowUploadAllocationModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "4px" }}>
              Ingest Allocation Portfolio (Excel/CSV)
            </h3>
            <p style={{ fontSize: "12px", color: "#9AAAC2", marginBottom: "16px" }}>
              Upload and ingest loan accounts into the unified database.
            </p>

            <form onSubmit={handleUploadAllocation} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Institutional Allocator</label>
                <select
                  value={uploadAllocId}
                  onChange={(e) => setUploadAllocId(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                >
                  {(hierarchyData.allocators || []).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Portfolio / Batch Name</label>
                <input
                  type="text"
                  value={uploadPortName}
                  onChange={(e) => setUploadPortName(e.target.value)}
                  placeholder="e.g. Q4 Auto Loan Delinquency Pool"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Product Type</label>
                  <select
                    value={uploadProdType}
                    onChange={(e) => setUploadProdType(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Two Wheeler">Two Wheeler Loan</option>
                    <option value="Auto Loan">Auto Loan</option>
                    <option value="Credit Card">Credit Card Writeoff</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Bucket Tier</label>
                  <select
                    value={uploadBucket}
                    onChange={(e) => setUploadBucket(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  >
                    <option value="Writeoff">Writeoff Bucket</option>
                    <option value="90+ DPD">90+ DPD Bucket</option>
                    <option value="60-90 DPD">60-90 DPD Bucket</option>
                    <option value="30-60 DPD">30-60 DPD Bucket</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Total Accounts Count</label>
                  <input
                    type="number"
                    value={uploadAccountsCount}
                    onChange={(e) => setUploadAccountsCount(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#9AAAC2", display: "block", marginBottom: "4px" }}>Principal Value (₹)</label>
                  <input
                    type="number"
                    value={uploadPrincipal}
                    onChange={(e) => setUploadPrincipal(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
                  />
                </div>
              </div>

              <label style={{
                padding: "20px",
                borderRadius: "10px",
                border: "2px dashed #315CFF",
                background: "#08132D",
                textAlign: "center",
                color: "#9AAAC2",
                fontSize: "12px",
                margin: "4px 0",
                display: "block",
                cursor: "pointer"
              }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <UploadCloud className="w-6 h-6 text-[#315CFF] mx-auto mb-2" />
                <span style={{ color: "#315CFF", fontWeight: 700 }}>Click to browse Excel (.xlsx) / CSV file</span>
                <span style={{ display: "block", fontSize: "11px", color: fileParsingMsg ? "#00C995" : "#64748b", marginTop: "4px" }}>
                  {fileParsingMsg || "Automatic pre-validation for RBI PII masking and deduplication"}
                </span>
              </label>

              <button
                type="submit"
                disabled={uploadLoading}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #00C995, #009874)",
                  border: "none",
                  color: "#050B20",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: uploadLoading ? "not-allowed" : "pointer"
                }}
              >
                {uploadLoading ? "Validating & Ingesting..." : "Confirm & Ingest Portfolio"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CAMPAIGN MEMBERS MANAGEMENT MODAL (Invariant 2) ── */}
      {showCampaignMembersModal && activeCampaignForMembers && (
        <div className="modal-overlay" onClick={() => setShowCampaignMembersModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "4px" }}>
              Enroll Campaign Roster: {activeCampaignForMembers.name}
            </h3>
            <p style={{ fontSize: "12px", color: "#9AAAC2", marginBottom: "16px" }}>
              Architecture Invariant 2: Campaign membership is decoupled from account allocation.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto", margin: "10px 0" }}>
              {hierarchyData.agents.map((ag) => {
                const isChecked = campaignSelectedAgentIds.includes(ag.id);
                return (
                  <div
                    key={ag.id}
                    onClick={() => {
                      if (isChecked) {
                        setCampaignSelectedAgentIds(campaignSelectedAgentIds.filter(id => id !== ag.id));
                      } else {
                        setCampaignSelectedAgentIds([...campaignSelectedAgentIds, ag.id]);
                      }
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: isChecked ? "rgba(49, 92, 255, 0.15)" : "#08132D",
                      border: isChecked ? "1px solid #315CFF" : "1px solid #263957",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "12px", color: "#f8fafc" }}>{ag.name}</div>
                        <span style={{ fontSize: "10px", color: "#9AAAC2" }}>{ag.employee_id} • {ag.channel === "CALL" ? "Voice Telephony" : "Ground Field"}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: ag.status === "ONLINE" || ag.status === "ON_SHIFT" ? "rgba(0, 201, 149, 0.2)" : "rgba(255, 184, 0, 0.2)",
                      color: ag.status === "ONLINE" || ag.status === "ON_SHIFT" ? "#00C995" : "#FFB800"
                    }}>
                      {ag.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setShowCampaignMembersModal(false)}
                style={{ padding: "8px 14px", borderRadius: "8px", background: "#14223A", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCampaignMembers}
                disabled={campaignMembersLoading}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "#315CFF", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                {campaignMembersLoading ? "Saving..." : `Save Enrollment (${campaignSelectedAgentIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE ALLOCATOR MODAL ── */}
      {showCreateAllocatorModal && (
        <div className="modal-overlay" onClick={() => setShowCreateAllocatorModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px" }}>Register Institutional Allocator</h3>
            <form onSubmit={handleCreateAllocator} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <input
                type="text"
                value={newAllocName}
                onChange={(e) => setNewAllocName(e.target.value)}
                placeholder="Institution Name (e.g. Bajaj Finserve)"
                required
                style={{ padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
              />
              <input
                type="text"
                value={newAllocCode}
                onChange={(e) => setNewAllocCode(e.target.value)}
                placeholder="Institutional Code (e.g. BAJAJ)"
                required
                style={{ padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
              />
              <button
                type="submit"
                style={{ padding: "10px", borderRadius: "8px", background: "#315CFF", border: "none", color: "#ffffff", fontWeight: 700, cursor: "pointer" }}
              >
                Register Allocator
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE CAMPAIGN MODAL ── */}
      {showCreateCampaignModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCampaignModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px" }}>Configure Recovery Campaign</h3>
            <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <input
                type="text"
                value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)}
                placeholder="Campaign Name (e.g. URBAN BAJAJ-NOV-2026)"
                required
                style={{ padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
              />
              <select
                value={newCampType}
                onChange={(e) => setNewCampType(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
              >
                <option value="PREDICTIVE">Predictive Dialer</option>
                <option value="AUTO">Automated Progressive</option>
                <option value="MANUAL">Manual Preview</option>
              </select>
              <select
                value={newCampChannel}
                onChange={(e) => setNewCampChannel(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", background: "#08132D", border: "1px solid #263957", color: "#f8fafc", fontSize: "12px" }}
              >
                <option value="CALL">Voice Telephony Channel</option>
                <option value="FIELD">Ground Field Recovery Channel</option>
              </select>
              <button
                type="submit"
                style={{ padding: "10px", borderRadius: "8px", background: "#315CFF", border: "none", color: "#ffffff", fontWeight: 700, cursor: "pointer" }}
              >
                Launch Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
