import React, { useState } from "react";
import AdminNavbar from "./admin/AdminNavbar";
import HomePortfolioView from "./admin/HomePortfolioView";
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

export default function AdminPortalShell({
  user,
  onLogout,
  onBackToHome,
  theme = "dark",
  toggleTheme
}) {
  // Top Navbar State: 'home' | 'allocation' | 'agent' | 'more_analytics' | 'more_telephony' | etc.
  const [topNav, setTopNav] = useState("home");

  // Home Sidebar State: 'portfolio' | 'call_monitoring' | 'crm' | 'field_monitoring'
  const [homeSidebar, setHomeSidebar] = useState("portfolio");

  // Selected portfolio for One View deep dive
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);

  // Agent Online / Offline Presence State
  const [presenceOnline, setPresenceOnline] = useState(true);

  // Active working allocation name
  const activeAllocationName = "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32";

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
    <div className={`min-h-screen bg-background text-foreground flex flex-col theme-${theme}`} data-theme={theme}>
      
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
      />

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* WHEN TOP NAV IS "HOME" */}
        {topNav === "home" && (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Home Sidebar */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0">
              <div className="sticky top-24 rounded-2xl bg-card border border-border p-3 space-y-1.5 shadow-sm">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-2">
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
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                          : "text-foreground hover:bg-muted font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/10 text-white" : "bg-muted text-muted-foreground"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{item.label}</div>
                          <div className={`text-[10px] truncate ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Home Main Content Area */}
            <main className="flex-1 min-w-0">
              {homeSidebar === "portfolio" && (
                <HomePortfolioView
                  selectedPortfolioId={selectedPortfolioId}
                  setSelectedPortfolioId={setSelectedPortfolioId}
                  onNavigateToCallMonitoring={() => setHomeSidebar("call_monitoring")}
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
