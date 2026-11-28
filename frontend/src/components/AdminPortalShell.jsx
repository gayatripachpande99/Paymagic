import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminNavbar from "./admin/AdminNavbar";
import HomePortfolioView, { INITIAL_ALLOCATORS, INITIAL_PORTFOLIOS } from "./admin/HomePortfolioView";
import HomeCallMonitoringView from "./admin/HomeCallMonitoringView";
import HomeCRMView from "./admin/HomeCRMView";
import HomeFieldMonitoringView from "./admin/HomeFieldMonitoringView";
import AllocationView from "./admin/AllocationView";
import AgentDirectoryView from "./admin/AgentDirectoryView";
import MoreViews from "./admin/MoreViews";
import AgentPresenceDialerWidget from "./common/AgentPresenceDialerWidget";
import { verifyHeadsetHardware } from "../services/headsetDetector";
import {
  Layers,
  PhoneCall,
  UserCheck,
  Compass,
  ChevronRight,
  TrendingUp,
  Activity,
  Headphones,
  ShieldAlert,
  Landmark,
  X,
  Plus
} from "lucide-react";

// Determine topNav based on active URL
function getInitialTopNav() {
  if (typeof window === "undefined") return "home";
  const p = window.location.pathname.toLowerCase();
  if (p.includes("allocation")) return "allocation";
  if (p.includes("agent") || p.includes("employee")) return "agent";
  if (p.includes("report")) return "more_reports";
  if (p.includes("score")) return "more_score";
  if (p.includes("analytics")) return "more_analytics";
  if (p.includes("telephony")) return "more_telephony";
  if (p.includes("incentive")) return "more_incentives";
  if (p.includes("campaign")) return "more_campaigns";
  return "home";
}

function getInitialHomeSidebarTab() {
  if (typeof window === "undefined") return "portfolio";
  const p = window.location.pathname.toLowerCase();
  if (p.includes("call-monitoring") || p.includes("call_monitoring")) return "call_monitoring";
  if (p.includes("crm")) return "crm";
  if (p.includes("field-monitoring") || p.includes("field_monitoring")) return "field_monitoring";
  return "portfolio";
}

const TAB_TITLES = {
  home: "PayMagic | Portfolio Performance",
  call_monitoring: "PayMagic | Call Agent Monitoring",
  crm: "PayMagic | CRM",
  field_monitoring: "PayMagic | Field Agent Monitoring",
  allocation: "PayMagic | Allocation Management",
  agent: "PayMagic | Staff Directory & Agent Grouping",
  more_reports: "PayMagic | Regulatory & Statutory Reports",
  more_score: "PayMagic | Yucollect Propensity Score",
  more_analytics: "PayMagic | DPD Buckets & Liquidation Analytics",
  more_telephony: "PayMagic | Voice Telephony CDR & Audio Vault"
};

export default function AdminPortalShell({
  user,
  onLogout,
  onBackToHome,
  theme = "dark",
  toggleTheme
}) {
  // Top Navbar State initialized from URL
  const [topNav, setTopNavState] = useState(getInitialTopNav);

  // Home Page Left Sidebar Tab State: 'portfolio' | 'call_monitoring' | 'crm' | 'field_monitoring'
  const [homeSidebarTab, setHomeSidebarTab] = useState(getInitialHomeSidebarTab);

  // Selected portfolio for One View deep dive
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);

  // Agent Online / Offline Presence State (starts OFFLINE by default on login)
  const [presenceOnline, setPresenceOnline] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState("OFFLINE");
  const [activeBreakType, setActiveBreakType] = useState(null);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [isHeadsetConnected, setIsHeadsetConnected] = useState(false);
  const [isDialerWidgetOpen, setIsDialerWidgetOpen] = useState(false);

  // Sync presenceOnline with presenceStatus
  const updatePresenceStatus = (status) => {
    setPresenceStatus(status);
    setPresenceOnline(status === "ONLINE");
  };
  const togglePresenceOnline = async (val) => {
    if (val) {
      // Automatically verify headset port connection before turning online
      const check = await verifyHeadsetHardware();
      if (!check.connected || !check.isExternalHeadset) {
        setIsHeadsetConnected(false);
        setIsDialerWidgetOpen(true);
        return;
      }
      setIsHeadsetConnected(true);
      setPresenceOnline(true);
      setPresenceStatus("ONLINE");
    } else {
      setPresenceOnline(false);
      setPresenceStatus("OFFLINE");
      setActiveBreakType(null);
    }
  };

  // Institutional Allocator State (Single selection with database persistence and localStorage sync)
  const [allocators, setAllocators] = useState(() => {
    try {
      const saved = localStorage.getItem("paymagic_allocators");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ALLOCATORS;
  });

  const [selectedAllocatorId, setSelectedAllocatorId] = useState(() => {
    try {
      const saved = localStorage.getItem("paymagic_selected_allocator_id");
      if (saved) return saved;
    } catch (e) {}
    return "alloc_bajaj";
  });

  const [portfolios, setPortfolios] = useState(INITIAL_PORTFOLIOS);
  const [showCreateAllocatorModal, setShowCreateAllocatorModal] = useState(false);

  // Sync selectedAllocatorId to localStorage
  useEffect(() => {
    if (selectedAllocatorId) {
      localStorage.setItem("paymagic_selected_allocator_id", selectedAllocatorId);
    }
  }, [selectedAllocatorId]);

  // Fetch live allocators from backend database on load/reload
  useEffect(() => {
    let isMounted = true;
    const fetchAllocatorsFromDb = async () => {
      try {
        const res = await api.get("/admin/allocators");
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const live = res.data.map(a => ({
            id: a.id,
            name: a.name,
            code: a.code,
            type: a.client_type || a.type || "NBFC",
            company: a.company || "PayMagic PVT LTD",
            badge: (a.name || "A").charAt(0).toUpperCase(),
            badgeColor: a.badgeColor || (a.id === "alloc_punewala" ? "bg-amber-600" : a.id === "alloc_hdfc" ? "bg-indigo-600" : "bg-blue-600")
          }));
          setAllocators(live);
          localStorage.setItem("paymagic_allocators", JSON.stringify(live));
        }
      } catch (err) {
        console.error("fetchAllocatorsFromDb error:", err);
      }
    };
    fetchAllocatorsFromDb();
    return () => { isMounted = false; };
  }, []);

  // Global Create Allocator Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    code: "",
    type: "NBFC",
    initialAllocation: ""
  });
  const [createError, setCreateError] = useState("");
  const [isCreatingAllocator, setIsCreatingAllocator] = useState(false);

  const handleCreateAllocator = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!createForm.name.trim() || !createForm.code.trim()) {
      setCreateError("Please provide both Allocator / Bank Name and Bank Code.");
      return;
    }

    setIsCreatingAllocator(true);
    setCreateError("");
    try {
      const res = await api.post("/admin/allocators", {
        name: createForm.name.trim(),
        code: createForm.code.trim().toUpperCase(),
        type: createForm.type
      });

      const serverAlloc = res.data || res;
      const cleanCode = createForm.code.trim().toUpperCase();
      const newId = serverAlloc.id || `alloc_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const newBadge = createForm.name.trim().charAt(0).toUpperCase();

      const newAlloc = {
        id: newId,
        name: createForm.name.trim(),
        code: cleanCode,
        type: createForm.type,
        company: "PayMagic PVT LTD",
        badge: newBadge,
        badgeColor: "bg-emerald-600"
      };

      const updatedAllocators = [newAlloc, ...allocators.filter(a => a.id !== newId)];
      setAllocators(updatedAllocators);
      setSelectedAllocatorId(newId);
      localStorage.setItem("paymagic_allocators", JSON.stringify(updatedAllocators));
      localStorage.setItem("paymagic_selected_allocator_id", newId);

      // If initial allocation was given
      if (createForm.initialAllocation.trim()) {
        const newPortfolio = {
          id: `port_${Date.now()}`,
          allocatorId: newId,
          allocatorName: newAlloc.name,
          name: createForm.initialAllocation.trim(),
          company: "PayMagic PVT LTD",
          badge: newBadge,
          badgeColor: "bg-emerald-600",
          channel: "Call",
          statusText: "Ends in 30 days",
          isExpired: false,
          accounts: 25,
          collectedPct: "0.00%",
          outstanding: "₹50.00 Lakh",
          collectedAmount: "₹0 / ₹50.00 Lakh",
          collectable: "₹32.50 Lakh",
          product: "Personal Loan",
          bucket: "Writeoff",
          date: new Date().toISOString().slice(0, 10)
        };
        setPortfolios(prev => [newPortfolio, ...prev]);
      }

      setShowCreateAllocatorModal(false);
      setCreateForm({ name: "", code: "", type: "NBFC", initialAllocation: "" });
      setCreateError("");
    } catch (apiErr) {
      setCreateError(apiErr?.message || "Failed to create allocator in database.");
    } finally {
      setIsCreatingAllocator(false);
    }
  };

  // Active working allocation name
  const activeAllocationName = "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32";

  const setTopNav = (newTab) => {
    setTopNavState(newTab);
    let targetPath = "/admin/overview";
    if (newTab === "allocation") targetPath = "/admin/allocations";
    else if (newTab === "agent") targetPath = "/admin/employees";
    else if (newTab === "more_reports") targetPath = "/admin/reports";
    else if (newTab === "more_score") targetPath = "/admin/score";

    window.history.pushState(null, "", targetPath);
    document.title = TAB_TITLES[newTab] || "PayMagic Administration";
  };

  useEffect(() => {
    document.title = TAB_TITLES[topNav] || "PayMagic Administration";
    const onPop = () => {
      const current = getInitialTopNav();
      setTopNavState(current);
      setHomeSidebarTab(getInitialHomeSidebarTab());
      document.title = TAB_TITLES[current] || "PayMagic Administration";
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [topNav]);

  return (
    <div
      className={`min-h-screen bg-background text-foreground flex flex-col theme-${theme} admin-portal-root`}
      data-theme={theme}
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "light" ? "#f8fafc" : "#01081f",
        color: theme === "light" ? "#0f172a" : "#f8fafc",
        display: "flex",
        flexDirection: "column"
      }}
    >
      
      {/* ── TOP NAVBAR ── */}
      <AdminNavbar
        user={user}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        topNav={topNav}
        setTopNav={setTopNav}
        presenceOnline={presenceOnline}
        setPresenceOnline={togglePresenceOnline}
        activeAllocationName={activeAllocationName}
        allocators={allocators}
        selectedAllocatorId={selectedAllocatorId}
        setSelectedAllocatorId={setSelectedAllocatorId}
        portfolios={portfolios}
        onOpenCreateAllocatorModal={() => setShowCreateAllocatorModal(true)}
      />

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div
        className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-4"
        style={{
          flex: 1,
          maxWidth: "1440px",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "16px",
          paddingBottom: "24px"
        }}
      >
        
        {/* 1. HOME PAGE (WITH LEFT SIDEBAR: A. PORTFOLIO, B. CALL MONITORING, C. CRM, D. FIELD MONITORING) */}
        {topNav === "home" && (
          <div
            className="home-page-layout"
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
              width: "100%"
            }}
          >
            {/* Left Sidebar for Home Page */}
            <aside
              className="home-sidebar"
              style={{
                width: "240px",
                flexShrink: 0,
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}
            >
              {[
                { id: "portfolio", label: "Portfolio Performance", icon: Layers },
                { id: "call_monitoring", label: "Call Agent Monitoring", icon: PhoneCall },
                { id: "crm", label: "CRM", icon: UserCheck },
                { id: "field_monitoring", label: "Field Agent Monitoring", icon: Compass }
              ].map((item) => {
                const isActive = homeSidebarTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setHomeSidebarTab(item.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? "#1d4ed8" : "transparent",
                      color: isActive ? "#ffffff" : "#cbd5e1",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon style={{ width: "16px", height: "16px", flexShrink: 0, color: isActive ? "#ffffff" : "#94a3b8" }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                  </button>
                );
              })}
            </aside>

            {/* Right Sub-View for Home Page */}
            <main style={{ flex: 1, minWidth: 0, width: "100%" }}>
              {homeSidebarTab === "portfolio" && (
                <HomePortfolioView
                  selectedPortfolioId={selectedPortfolioId}
                  setSelectedPortfolioId={setSelectedPortfolioId}
                  onNavigateToCallMonitoring={() => setHomeSidebarTab("call_monitoring")}
                  onNavigateToAllocation={() => setTopNav("allocation")}
                  allocators={allocators}
                  setAllocators={setAllocators}
                  selectedAllocatorId={selectedAllocatorId}
                  setSelectedAllocatorId={setSelectedAllocatorId}
                  portfolios={portfolios}
                  setPortfolios={setPortfolios}
                  showCreateModal={showCreateAllocatorModal}
                  setShowCreateModal={setShowCreateAllocatorModal}
                />
              )}

              {homeSidebarTab === "call_monitoring" && (
                <HomeCallMonitoringView />
              )}

              {homeSidebarTab === "crm" && (
                <HomeCRMView />
              )}

              {homeSidebarTab === "field_monitoring" && (
                <HomeFieldMonitoringView />
              )}
            </main>
          </div>
        )}

        {/* 2. ALLOCATION MANAGEMENT PAGE */}
        {topNav === "allocation" && (
          <main className="w-full">
            <AllocationView
              onOpenPortfolioDashboard={(portfolioId) => {
                setTopNav("home");
                setHomeSidebarTab("portfolio");
                setSelectedPortfolioId(portfolioId);
              }}
              selectedAllocatorId={selectedAllocatorId}
              allocators={allocators}
            />
          </main>
        )}

        {/* 6. STAFF DIRECTORY & AGENT PAGE */}
        {topNav === "agent" && (
          <main className="w-full">
            <AgentDirectoryView />
          </main>
        )}

        {/* 7. MORE VIEWS */}
        {topNav.startsWith("more_") && (
          <main className="w-full">
            <MoreViews activeTab={topNav} />
          </main>
        )}

      </div>

      {/* ── AGENT & CALLER FLOATING PRESENCE DIALER WIDGET ── */}
      <AgentPresenceDialerWidget
        presenceStatus={presenceStatus}
        setPresenceStatus={updatePresenceStatus}
        activeBreakType={activeBreakType}
        setActiveBreakType={setActiveBreakType}
        breakSeconds={breakSeconds}
        setBreakSeconds={setBreakSeconds}
        isHeadsetConnected={isHeadsetConnected}
        setIsHeadsetConnected={setIsHeadsetConnected}
        user={user}
        isOpen={isDialerWidgetOpen}
        setIsOpen={setIsDialerWidgetOpen}
        onPresenceChange={updatePresenceStatus}
      />

      {/* ── GLOBAL CREATE ALLOCATOR MODAL (AVAILABLE ACROSS ALL PAGES) ── */}
      {showCreateAllocatorModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowCreateAllocatorModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(37, 99, 235, 0.2)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Landmark style={{ width: "18px", height: "18px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Create New Allocator
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAllocatorModal(false)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {createError && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fb7185",
                  fontSize: "11px"
                }}
              >
                {createError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateAllocator} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                  Allocator / Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unity Small Finance Bank, Tata Capital"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                    Bank Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UNITY"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                      textTransform: "uppercase"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                    Client Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="NBFC">NBFC</option>
                    <option value="SCHEDULED_COMMERCIAL_BANK">Scheduled Bank</option>
                    <option value="FINTECH">Fintech Lender</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                  Initial Portfolio Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UNITY_Personal Loan_Writeoff_2026-11-28"
                  value={createForm.initialAllocation}
                  onChange={(e) => setCreateForm({ ...createForm, initialAllocation: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateAllocatorModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAllocator}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: isCreatingAllocator ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 4px rgba(29, 78, 216, 0.4)"
                  }}
                >
                  {isCreatingAllocator ? "Creating..." : "Save Allocator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
