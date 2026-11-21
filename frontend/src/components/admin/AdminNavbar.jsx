import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";

export default function AdminNavbar({
  user,
  onLogout,
  theme,
  toggleTheme,
  topNav,
  setTopNav,
  presenceOnline,
  setPresenceOnline,
  activeAllocationName = "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32"
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const userName = user?.fullName || "Priya Talekar";
  const userRole = user?.role || "SUPERVISOR";
  const userEmail = user?.email || "infopaymagic@gmail.com";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setTopNav("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-foreground flex items-center gap-1.5">
                PayMagic
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Recovery
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground leading-none">
                Enterprise Portfolio Desk
              </span>
            </div>
          </div>

          {/* Top Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => {
                setTopNav("home");
                setMoreDropdownOpen(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                topNav === "home"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setTopNav("allocation");
                setMoreDropdownOpen(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                topNav === "allocation"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Allocation
            </button>

            <button
              onClick={() => {
                setTopNav("agent");
                setMoreDropdownOpen(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                topNav === "agent"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Agent
            </button>

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  topNav.startsWith("more_")
                    ? "bg-blue-600/10 text-blue-500 border border-blue-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {moreDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/20 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setMoreDropdownOpen(false)}
                >
                  <button
                    onClick={() => setTopNav("more_analytics")}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>Analytics & DPD Buckets</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_telephony")}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>Voice Telephony CDR</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_incentives")}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>Automated Incentives</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_reports")}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>Regulatory & Statutory</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_campaigns")}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>Campaign Strategies</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_payments")}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>Payment Verification</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section: Online/Offline, Active Allocation, Theme, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Online / Offline Presence Pill */}
          <button
            onClick={() => setPresenceOnline(!presenceOnline)}
            title="Click to toggle agent availability"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              presenceOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${presenceOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span>{presenceOnline ? "Online" : "Offline"}</span>
          </button>

          {/* Active Allocation Badge */}
          <div
            title={`Active Working Allocation: ${activeAllocationName}`}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-medium text-foreground max-w-[240px] truncate"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{activeAllocationName}</span>
          </div>

          {/* Light / Dark Theme Toggle */}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {/* Profile Photo / Avatar with Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-muted border border-border/80 transition-colors"
              aria-label="User Profile"
            >
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                <span>PT</span>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${presenceOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none">
                  {userRole}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/20 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-border/70 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    <span>PT</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-foreground truncate">
                      {userName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {userEmail}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${presenceOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Status: {presenceOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs rounded-lg bg-muted/50 text-muted-foreground">
                    <div className="font-semibold text-foreground mb-0.5">Assigned Allocation</div>
                    <div className="truncate text-[11px] text-blue-500 font-mono">
                      {activeAllocationName}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of PayMagic</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
