import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  FileText,
  Sparkles,
  Moon,
  Sun
} from "lucide-react";

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

  // Default to Bhushan Gaikwad / ADMIN as shown in primary reference screenshot
  const userName = user?.fullName || "Bhushan Gaikwad";
  const userRole = user?.role || "ADMIN";
  const userEmail = user?.email || "infopaymagic@gmail.com";
  const userInitials = "PT";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#01081f]/95 backdrop-blur-md transition-colors shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setTopNav("home")}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-md shadow-blue-500/20 bg-blue-600/20 border border-blue-500/30 p-0.5">
              <img
                src="/logo.png"
                alt="PayMagic Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/favicon.png";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                PayMagic
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  Recovery
                </span>
              </span>
              <span className="text-[11px] text-slate-400 leading-none">
                Enterprise Portfolio Desk
              </span>
            </div>
          </div>

          {/* Top Navigation Links: 1. Home | 2. Allocation | 3. Agent | 4. More */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => {
                setTopNav("home");
                setMoreDropdownOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                topNav === "home"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setTopNav("allocation");
                setMoreDropdownOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                topNav === "allocation"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Allocation
            </button>

            <button
              onClick={() => {
                setTopNav("agent");
                setMoreDropdownOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                topNav === "agent"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Agent
            </button>

            {/* 4. More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  topNav.startsWith("more_")
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {moreDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-white/[0.1] bg-[#051336] p-1.5 shadow-xl shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setMoreDropdownOpen(false)}
                >
                  <button
                    onClick={() => setTopNav("more_reports")}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/[0.08] transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. Report</span>
                    </span>
                    <span className="text-[10px] text-slate-400">5 categories</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_score")}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/[0.08] transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Score</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Yucollect</span>
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              presenceOnline
                ? "bg-[#042617] border-[#0d5936] text-[#22c55e] hover:bg-[#073822]"
                : "bg-rose-950/40 border-rose-800/40 text-rose-400 hover:bg-rose-950/60"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${presenceOnline ? "bg-[#22c55e] animate-pulse" : "bg-rose-500"}`} />
            <span>{presenceOnline ? "Online" : "Offline"}</span>
          </button>

          {/* Active Allocation Badge */}
          <div
            title={`Active Working Allocation: ${activeAllocationName}`}
            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1639] border border-blue-900/40 text-xs text-slate-300 max-w-[260px] truncate"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{activeAllocationName}</span>
          </div>

          {/* Light / Dark Theme Pill Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0a1639] border border-blue-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{theme === "light" ? "LIGHT" : "DARK"}</span>
          </button>

          {/* Profile Photo / Avatar with Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-white/[0.05] border border-blue-900/30 transition-colors cursor-pointer"
              aria-label="User Profile"
            >
              <div className="relative w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                <span>{userInitials}</span>
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#01081f] ${presenceOnline ? "bg-emerald-400" : "bg-rose-500"}`} />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider leading-none mt-0.5">
                  {userRole}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.1] bg-[#051336] p-2 shadow-2xl shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-white/[0.08] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shrink-0">
                    <span>{userInitials}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate">
                      {userName}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {userEmail}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${presenceOnline ? "bg-emerald-400" : "bg-rose-500"}`} />
                      <span className="text-[10px] font-semibold text-slate-400">
                        Status: {presenceOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs rounded-lg bg-white/[0.04] text-slate-300">
                    <div className="font-semibold text-white mb-0.5">Assigned Allocation</div>
                    <div className="truncate text-[11px] text-blue-400 font-mono">
                      {activeAllocationName}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
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
