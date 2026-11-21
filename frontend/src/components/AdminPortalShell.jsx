import React, { useState, useEffect } from "react";
import AdminNavbar from "./admin/AdminNavbar";
import HomePortfolioView, { INITIAL_ALLOCATORS, INITIAL_PORTFOLIOS } from "./admin/HomePortfolioView";
import HomeCallMonitoringView from "./admin/HomeCallMonitoringView";
import HomeCRMView from "./admin/HomeCRMView";
import HomeFieldMonitoringView from "./admin/HomeFieldMonitoringView";
import AllocationView from "./admin/AllocationView";
import AgentDirectoryView from "./admin/AgentDirectoryView";
import MoreViews from "./admin/MoreViews";
import {
  Layers,
  PhoneCall,
  UserCheck,
  Compass,
  ChevronRight,
  TrendingUp,
  Activity,
  Headphones,
  ShieldAlert
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

  // Agent Online / Offline Presence State
  const [presenceOnline, setPresenceOnline] = useState(true);

  // Institutional Allocator State (Single selection with strict isolation)
  const [allocators, setAllocators] = useState(INITIAL_ALLOCATORS);
  const [selectedAllocatorId, setSelectedAllocatorId] = useState("alloc_bajaj");
  const [portfolios, setPortfolios] = useState(INITIAL_PORTFOLIOS);
  const [showCreateAllocatorModal, setShowCreateAllocatorModal] = useState(false);

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
        setPresenceOnline={setPresenceOnline}
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
                { id: "portfolio", label: "A. Portfolio Performance", icon: Layers },
                { id: "call_monitoring", label: "B. Call Agent Monitoring", icon: PhoneCall },
                { id: "crm", label: "C. CRM", icon: UserCheck },
                { id: "field_monitoring", label: "D. Field Agent Monitoring", icon: Compass }
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
    </div>
  );
}
