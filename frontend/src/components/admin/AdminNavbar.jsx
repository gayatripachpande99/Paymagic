import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Radio,
  PhoneOff,
  PhoneCall,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  FileText,
  Sparkles,
  Moon,
  Sun,
  Landmark,
  Plus
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
  activeAllocationName = "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32",
  allocators = [],
  selectedAllocatorId = "alloc_bajaj",
  setSelectedAllocatorId,
  portfolios = [],
  onOpenCreateAllocatorModal
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [allocatorDropdownOpen, setAllocatorDropdownOpen] = useState(false);

  // Active allocator object
  const activeAllocator = allocators.find((a) => a.id === selectedAllocatorId) || allocators[0];

  // Dynamic user data matching logged in credentials with Bhushan Gaikwad as default fallback
  const userName = user?.fullName || user?.full_name || user?.name || "Bhushan Gaikwad";
  const userRole = user?.role ? user.role.replace("_", " ") : "ADMIN";
  const userEmail = user?.email || (userName.toLowerCase().includes("onkar") ? "onkarholkar19@gmail.com" : "admin@paymagic.in");
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "BG";

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: "rgba(1, 8, 31, 0.98)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)"
      }}
    >
      <div
        className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4"
        style={{
          maxWidth: "1440px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "24px",
          paddingRight: "24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}
      >
        
        {/* Left: Brand & Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            onClick={() => setTopNav("home")}
            className="cursor-pointer group select-none"
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none", flexShrink: 0 }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "2px",
                boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)"
              }}
            >
              <img
                src="/logo.png"
                alt="PayMagic Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                onError={(e) => {
                  e.currentTarget.src = "/favicon.png";
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "18px", lineHeight: 1, color: "#ffffff", letterSpacing: "-0.01em" }}>
                PayMagic
              </span>
            </div>
          </div>

          {/* Top Navigation Links: 
              1. Home | 2. Allocation | 3. Agent | 4. More */}
          <nav className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "nowrap" }}>
            <button
              onClick={() => {
                setTopNav("home");
                setMoreDropdownOpen(false);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: topNav === "home" ? 700 : 500,
                backgroundColor: topNav === "home" ? "#1d4ed8" : "transparent",
                color: topNav === "home" ? "#ffffff" : "#cbd5e1",
                border: "none",
                cursor: "pointer",
                boxShadow: topNav === "home" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
              }}
            >
              Home
            </button>

            <button
              onClick={() => {
                setTopNav("allocation");
                setMoreDropdownOpen(false);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: topNav === "allocation" ? 700 : 500,
                backgroundColor: topNav === "allocation" ? "#1d4ed8" : "transparent",
                color: topNav === "allocation" ? "#ffffff" : "#cbd5e1",
                border: "none",
                cursor: "pointer",
                boxShadow: topNav === "allocation" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
              }}
            >
              Allocation
            </button>

            <button
              onClick={() => {
                setTopNav("agent");
                setMoreDropdownOpen(false);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: topNav === "agent" ? 700 : 500,
                backgroundColor: topNav === "agent" ? "#1d4ed8" : "transparent",
                color: topNav === "agent" ? "#ffffff" : "#cbd5e1",
                border: "none",
                cursor: "pointer",
                boxShadow: topNav === "agent" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
              }}
            >
              Agent
            </button>

            {/* More Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: topNav.startsWith("more_") ? 700 : 500,
                  backgroundColor: topNav.startsWith("more_") ? "#1d4ed8" : "transparent",
                  color: topNav.startsWith("more_") ? "#ffffff" : "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {moreDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    marginTop: "8px",
                    width: "224px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    backgroundColor: "#051336",
                    padding: "6px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                    zIndex: 50
                  }}
                  onClick={() => setMoreDropdownOpen(false)}
                >
                  <button
                    onClick={() => setTopNav("more_reports")}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      backgroundColor: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. Report</span>
                    </span>
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>5 categories</span>
                  </button>
                  <button
                    onClick={() => setTopNav("more_score")}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      backgroundColor: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Score</span>
                    </span>
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>Yucollect</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section: Online/Offline, Active Allocation, Theme, Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          
          {/* Online / Offline Presence Icon Button (Icon Only, No Text: Red when offline, Green when online) */}
          <button
            onClick={() => setPresenceOnline(!presenceOnline)}
            title={presenceOnline ? "Online (Click to change)" : "Offline (Click to change)"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: presenceOnline ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: presenceOnline ? "1px solid #22c55e" : "1px solid #ef4444",
              color: presenceOnline ? "#22c55e" : "#ef4444",
              boxShadow: presenceOnline ? "0 0 8px rgba(34, 197, 94, 0.3)" : "0 0 8px rgba(239, 68, 68, 0.3)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {presenceOnline ? (
              <Radio style={{ width: "16px", height: "16px" }} />
            ) : (
              <PhoneOff style={{ width: "15px", height: "15px" }} />
            )}
          </button>

          {/* Active Allocator Dropdown Pill */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setAllocatorDropdownOpen(!allocatorDropdownOpen)}
              title="Select Institutional Allocator"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "9999px",
                backgroundColor: "#0a1639",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                transition: "all 0.15s ease"
              }}
            >
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "9999px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                {activeAllocator?.badge || "B"}
              </span>
              <span style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeAllocator?.name || "Bajaj Finserve"}
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 text-blue-400"
                style={{
                  transform: allocatorDropdownOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s ease"
                }}
              />
            </button>

            {allocatorDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "8px",
                  width: "280px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backgroundColor: "#051336",
                  padding: "8px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
                  zIndex: 60
                }}
              >
                <div
                  style={{
                    padding: "6px 10px 8px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#94a3b8",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>Select Allocator</span>
                  <span style={{ fontSize: "10px", color: "#60a5fa" }}>Isolated Scope</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {allocators.map((alloc) => {
                    const isSelected = alloc.id === selectedAllocatorId;
                    const allocPortfoliosCount = portfolios.filter((p) => p.allocatorId === alloc.id).length;
                    return (
                      <button
                        key={alloc.id}
                        onClick={() => {
                          if (setSelectedAllocatorId) setSelectedAllocatorId(alloc.id);
                          setAllocatorDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          backgroundColor: isSelected ? "rgba(37, 99, 235, 0.25)" : "transparent",
                          border: isSelected ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid transparent",
                          color: isSelected ? "#ffffff" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <span
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "9999px",
                              backgroundColor: isSelected ? "#2563eb" : "rgba(255, 255, 255, 0.1)",
                              color: "#ffffff",
                              fontSize: "11px",
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            {alloc.badge}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {alloc.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "9999px",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              color: "#94a3b8"
                            }}
                          >
                            {allocPortfoliosCount}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    marginTop: "6px",
                    paddingTop: "6px"
                  }}
                >
                  <button
                    onClick={() => {
                      setAllocatorDropdownOpen(false);
                      if (onOpenCreateAllocatorModal) onOpenCreateAllocatorModal();
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(37, 99, 235, 0.15)",
                      border: "1px dashed rgba(59, 130, 246, 0.4)",
                      color: "#60a5fa",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Allocator</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Theme Pill Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "#0a1639",
              border: "1px solid rgba(30, 58, 138, 0.4)",
              color: "#cbd5e1",
              cursor: "pointer"
            }}
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
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User Profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 8px 4px 6px",
                borderRadius: "9999px",
                backgroundColor: "rgba(10, 22, 57, 0.5)",
                border: "1px solid rgba(30, 58, 138, 0.3)",
                cursor: "pointer"
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "32px",
                  height: "32px",
                  borderRadius: "9999px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <span>{userInitials}</span>
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    border: "1px solid #01081f",
                    backgroundColor: presenceOnline ? "#34d399" : "#f43f5e"
                  }}
                />
              </div>
              <div className="hidden sm:flex" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", lineHeight: 1.1, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName}
                </span>
                <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1, marginTop: "2px" }}>
                  {userRole}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "8px",
                  width: "256px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backgroundColor: "#051336",
                  padding: "8px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
                  zIndex: 50
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "9999px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <span>{userInitials}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {userName}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {userEmail}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "9999px",
                          backgroundColor: presenceOnline ? "#34d399" : "#f43f5e"
                        }}
                      />
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8" }}>
                        Status: {presenceOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "8px 0 0 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ padding: "8px 12px", fontSize: "12px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.04)", color: "#cbd5e1" }}>
                    <div style={{ fontWeight: 600, color: "#ffffff", marginBottom: "2px" }}>Assigned Allocation</div>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "11px", color: "#60a5fa", fontFamily: "monospace" }}>
                      {activeAllocationName}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#fb7185",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "12px",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
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
