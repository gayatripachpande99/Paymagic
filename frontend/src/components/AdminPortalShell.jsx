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
  if (p.includes("call-monitoring") || p.includes("call_monitoring")) return "call_monitoring";
  if (p.includes("crm")) return "crm";
  if (p.includes("field-monitoring") || p.includes("field_monitoring")) return "field_monitoring";
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
    if (newTab === "call_monitoring") targetPath = "/admin/call-monitoring";
    else if (newTab === "crm") targetPath = "/admin/crm";
    else if (newTab === "field_monitoring") targetPath = "/admin/field-monitoring";
    else if (newTab === "allocation") targetPath = "/admin/allocations";
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
        
        {/* 1. PORTFOLIO PERFORMANCE PAGE (OVERVIEW - CLEAN FULL-WIDTH, NO SIDEBAR) */}
        {topNav === "home" && (
          <main className="w-full">
            <HomePortfolioView
              selectedPortfolioId={selectedPortfolioId}
              setSelectedPortfolioId={setSelectedPortfolioId}
              onNavigateToCallMonitoring={() => setTopNav("call_monitoring")}
              allocators={allocators}
              setAllocators={setAllocators}
              selectedAllocatorId={selectedAllocatorId}
              setSelectedAllocatorId={setSelectedAllocatorId}
              portfolios={portfolios}
              setPortfolios={setPortfolios}
              showCreateModal={showCreateAllocatorModal}
              setShowCreateModal={setShowCreateAllocatorModal}
            />
          </main>
        )}

        {/* 2. CALL AGENT MONITORING PAGE */}
        {topNav === "call_monitoring" && (
          <main className="w-full">
            <HomeCallMonitoringView />
          </main>
        )}

        {/* 3. CRM PAGE */}
        {topNav === "crm" && (
          <main className="w-full">
            <HomeCRMView />
          </main>
        )}

        {/* 4. FIELD AGENT MONITORING PAGE */}
        {topNav === "field_monitoring" && (
          <main className="w-full">
            <HomeFieldMonitoringView />
          </main>
        )}

        {/* 5. ALLOCATION MANAGEMENT PAGE */}
        {topNav === "allocation" && (
          <main className="w-full">
            <AllocationView
              onOpenPortfolioDashboard={(portfolioId) => {
                setTopNav("home");
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
