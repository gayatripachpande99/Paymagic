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

const TAB_TITLES = {
  home: "PayMagic | Operations Command & Portfolios",
  allocation: "PayMagic | Institutional Recovery Allocation Management",
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

  // Home Sidebar State: 'portfolio' | 'call_monitoring' | 'crm' | 'field_monitoring'
  const [homeSidebar, setHomeSidebar] = useState("portfolio");

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
      document.title = TAB_TITLES[current] || "PayMagic Administration";
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [topNav]);

  // Sidebar navigation options for Home
  const homeSidebarItems = [
    {
      id: "portfolio",
      label: "A. Portfolio Performance",
      shortLabel: "Portfolio Performance",
      icon: TrendingUp,
      desc: "All portfolios, One View & channel breakdown"
    },
    {
      id: "call_monitoring",
      label: "B. Call Agent Monitoring",
      shortLabel: "Call Monitoring",
      icon: Headphones,
      desc: "Live dialer monitoring & agent performance"
    },
    {
      id: "crm",
      label: "C. CRM",
      shortLabel: "CRM Desk",
      icon: PhoneCall,
      desc: "Supervisor & Agent view, queue & priorities"
    },
    {
      id: "field_monitoring",
      label: "D. Field Agent Monitoring",
      shortLabel: "Field Monitoring",
      icon: Compass,
      desc: "GPS radar, live tracking & deviation audits"
    }
  ];

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
        
        {/* WHEN TOP NAV IS "HOME" */}
        {topNav === "home" && (
          <div
            className="flex flex-col md:flex-row gap-6"
            style={{ display: "flex", gap: "24px", flexDirection: "row" }}
          >
            
            {/* Left Home Sidebar */}
            <aside
              className="w-full md:w-64 lg:w-72 shrink-0"
              style={{ width: "270px", flexShrink: 0 }}
            >
              <div
                style={{
                  position: "sticky",
                  top: "80px",
                  borderRadius: "16px",
                  backgroundColor: theme === "light" ? "#ffffff" : "#041030",
                  border: theme === "light" ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: theme === "light" ? "#64748b" : "#94a3b8",
                    borderBottom: theme === "light" ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                    marginBottom: "6px"
                  }}
                >
                  Operations Command
                </div>

                {homeSidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = homeSidebar === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setHomeSidebar(item.id);
                        if (item.id !== "portfolio") {
                          setSelectedPortfolioId(null);
                        }
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        textAlign: "left",
                        backgroundColor: isActive
                          ? "#1d4ed8"
                          : theme === "light"
                          ? "transparent"
                          : "transparent",
                        color: isActive
                          ? "#ffffff"
                          : theme === "light"
                          ? "#1e293b"
                          : "#cbd5e1",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: isActive ? "0 2px 6px rgba(29, 78, 216, 0.4)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div
                          style={{
                            padding: "6px",
                            borderRadius: "8px",
                            backgroundColor: isActive
                              ? "rgba(255, 255, 255, 0.15)"
                              : theme === "light"
                              ? "#f1f5f9"
                              : "rgba(255, 255, 255, 0.05)",
                            color: isActive
                              ? "#ffffff"
                              : theme === "light"
                              ? "#64748b"
                              : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: isActive ? 700 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.label}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-3.5 h-3.5"
                        style={{
                          flexShrink: 0,
                          color: isActive ? "#ffffff" : theme === "light" ? "#94a3b8" : "#64748b"
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Home Main Content Area */}
            <main className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
              {homeSidebar === "portfolio" && (
                <HomePortfolioView
                  selectedPortfolioId={selectedPortfolioId}
                  setSelectedPortfolioId={setSelectedPortfolioId}
                  onNavigateToCallMonitoring={() => setHomeSidebar("call_monitoring")}
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

              {homeSidebar === "call_monitoring" && (
                <HomeCallMonitoringView />
              )}

              {homeSidebar === "crm" && (
                <HomeCRMView />
              )}

              {homeSidebar === "field_monitoring" && (
                <HomeFieldMonitoringView />
              )}
            </main>

          </div>
        )}

        {/* WHEN TOP NAV IS "ALLOCATION" */}
        {topNav === "allocation" && (
          <main className="w-full">
            <AllocationView
              onOpenPortfolioDashboard={(portfolioId) => {
                setTopNav("home");
                setHomeSidebar("portfolio");
                setSelectedPortfolioId(portfolioId);
              }}
              selectedAllocatorId={selectedAllocatorId}
              allocators={allocators}
            />
          </main>
        )}

        {/* WHEN TOP NAV IS "AGENT" */}
        {topNav === "agent" && (
          <main className="w-full">
            <AgentDirectoryView />
          </main>
        )}

        {/* WHEN TOP NAV IS UNDER "MORE" */}
        {topNav.startsWith("more_") && (
          <main className="w-full">
            <MoreViews activeTab={topNav} />
          </main>
        )}

      </div>
    </div>
  );
}
