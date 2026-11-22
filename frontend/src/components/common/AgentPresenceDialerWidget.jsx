import React, { useState, useEffect } from "react";
import {
  Headphones,
  PhoneCall,
  PhoneOff,
  MoreVertical,
  X,
  Coffee,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  LogOut,
  Radio,
  Wifi,
  WifiOff
} from "lucide-react";

export const BREAK_OPTIONS = [
  { id: "lunch", name: "Lunch Break", icon: "🥪" },
  { id: "tea", name: "Tea Break", icon: "☕" },
  { id: "meeting", name: "Meeting", icon: "👥" },
  { id: "mobile", name: "Mobile Break", icon: "📱" },
  { id: "bio", name: "Bio Break", icon: "🚻" }
];

export default function AgentPresenceDialerWidget({
  presenceStatus = "OFFLINE", // 'OFFLINE' | 'ONLINE' | 'BREAK'
  setPresenceStatus,
  activeBreakType = null,
  setActiveBreakType,
  breakSeconds = 0,
  setBreakSeconds,
  isHeadsetConnected = false,
  setIsHeadsetConnected,
  user,
  isOpen = false,
  setIsOpen
}) {
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBreakSelector, setShowBreakSelector] = useState(false);
  const [headsetAlert, setHeadsetAlert] = useState("");

  // Break timer effect
  useEffect(() => {
    let interval = null;
    if (presenceStatus === "BREAK") {
      interval = setInterval(() => {
        setBreakSeconds((prev) => (prev || 0) + 1);
      }, 1000);
    } else {
      setBreakSeconds(0);
    }
    return () => clearInterval(interval);
  }, [presenceStatus, setBreakSeconds]);

  // Handle unload / tab close: set offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      setPresenceStatus("OFFLINE");
      setActiveBreakType(null);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [setPresenceStatus, setActiveBreakType]);

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSeconds = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Turn Online handler (checks headset connection)
  const handleConnectToOnline = () => {
    if (!isHeadsetConnected) {
      setHeadsetAlert("Please connect your headset or headphone to join online.");
      return;
    }
    setHeadsetAlert("");
    setPresenceStatus("ONLINE");
    setActiveBreakType(null);
    setShowThreeDotsMenu(false);
    setShowBreakSelector(false);
  };

  // Turn Offline handler
  const handleTurnOffline = () => {
    setPresenceStatus("OFFLINE");
    setActiveBreakType(null);
    setShowThreeDotsMenu(false);
    setShowBreakSelector(false);
  };

  // Start a specific break
  const handleStartBreak = (breakName) => {
    setActiveBreakType(breakName);
    setPresenceStatus("BREAK");
    setBreakSeconds(0);
    setShowThreeDotsMenu(false);
    setShowBreakSelector(false);
  };

  // Turn off break time and go online
  const handleEndBreakToGoOnline = () => {
    setPresenceStatus("ONLINE");
    setActiveBreakType(null);
    setBreakSeconds(0);
    setShowThreeDotsMenu(false);
  };

  // Turn off break time and go offline
  const handleEndBreakToGoOffline = () => {
    setPresenceStatus("OFFLINE");
    setActiveBreakType(null);
    setBreakSeconds(0);
    setShowThreeDotsMenu(false);
  };

  return (
    <>
      {/* ── 1. BOTTOM-RIGHT CIRCULAR CALLER BUTTON ── */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowThreeDotsMenu(false);
          setHeadsetAlert("");
        }}
        title="Agent Dialer & Presence"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor:
            presenceStatus === "ONLINE"
              ? "#16a34a"
              : presenceStatus === "BREAK"
              ? "#d97706"
              : "#dc2626",
          color: "#ffffff",
          border: `2px solid ${
            presenceStatus === "ONLINE"
              ? "#22c55e"
              : presenceStatus === "BREAK"
              ? "#fbbf24"
              : "#f87171"
          }`,
          boxShadow:
            presenceStatus === "ONLINE"
              ? "0 0 16px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)"
              : presenceStatus === "BREAK"
              ? "0 0 16px rgba(245, 158, 11, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)"
              : "0 0 16px rgba(239, 68, 68, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        {presenceStatus === "ONLINE" ? (
          <Headphones style={{ width: "24px", height: "24px" }} />
        ) : presenceStatus === "BREAK" ? (
          <Coffee style={{ width: "24px", height: "24px" }} />
        ) : (
          <PhoneCall style={{ width: "24px", height: "24px" }} />
        )}

        {/* Small Corner Status Dot */}
        <span
          style={{
            position: "absolute",
            bottom: "2px",
            right: "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor:
              presenceStatus === "ONLINE"
                ? "#22c55e"
                : presenceStatus === "BREAK"
                ? "#fbbf24"
                : "#ef4444",
            border: "2px solid #051336"
          }}
        />
      </button>

      {/* ── 2. POPUP CARD (Appears above the circular button) ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 9999,
            width: "330px",
            backgroundColor: "#051336",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Popup Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#020921"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor:
                    presenceStatus === "ONLINE"
                      ? "rgba(34, 197, 94, 0.2)"
                      : presenceStatus === "BREAK"
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(239, 68, 68, 0.2)",
                  color:
                    presenceStatus === "ONLINE"
                      ? "#34d399"
                      : presenceStatus === "BREAK"
                      ? "#fbbf24"
                      : "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <PhoneCall style={{ width: "14px", height: "14px" }} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Caller &amp; Presence
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {presenceStatus === "ONLINE"
                    ? "Online & Available"
                    : presenceStatus === "BREAK"
                    ? activeBreakType || "On Break"
                    : "Offline"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
              {/* Three dots button (only shown when ONLINE or on BREAK) */}
              {(presenceStatus === "ONLINE" || presenceStatus === "BREAK") && (
                <button
                  onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    backgroundColor: showThreeDotsMenu ? "rgba(255, 255, 255, 0.12)" : "transparent",
                    border: "none",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Options"
                >
                  <MoreVertical style={{ width: "16px", height: "16px" }} />
                </button>
              )}

              {/* Close (X) button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>

              {/* ── 3-DOTS DROPDOWN MENU ── */}
              {showThreeDotsMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "32px",
                    right: "0",
                    width: "160px",
                    backgroundColor: "#0a1639",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "10px",
                    padding: "4px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                    zIndex: 10000,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  {/* When in BREAK: Options are Online, Offline, Profile */}
                  {presenceStatus === "BREAK" ? (
                    <>
                      <button
                        onClick={handleEndBreakToGoOnline}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: "transparent",
                          color: "#34d399",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }} />
                        <span>Online</span>
                      </button>
                      <button
                        onClick={handleEndBreakToGoOffline}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: "transparent",
                          color: "#fb7185",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#fb7185" }} />
                        <span>Offline</span>
                      </button>
                    </>
                  ) : (
                    /* When ONLINE: Options are Break and Profile */
                    <button
                      onClick={() => {
                        setShowBreakSelector(true);
                        setShowThreeDotsMenu(false);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: "transparent",
                        color: "#fbbf24",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <Coffee style={{ width: "14px", height: "14px" }} />
                      <span>Break</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowThreeDotsMenu(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: "transparent",
                      color: "#cbd5e1",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <User style={{ width: "14px", height: "14px" }} />
                    <span>Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Popup Content */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* ── CASE 1: OFFLINE STATUS ── */}
            {presenceStatus === "OFFLINE" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Status Indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.25)"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#f87171" }}>
                    Status: Offline
                  </span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                </div>

                {/* Headset / Headphone Requirement */}
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Headphones style={{ width: "16px", height: "16px", color: isHeadsetConnected ? "#34d399" : "#94a3b8" }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>
                        Headset Connection
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsHeadsetConnected(!isHeadsetConnected);
                        setHeadsetAlert("");
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: isHeadsetConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                        color: isHeadsetConnected ? "#34d399" : "#cbd5e1",
                        border: `1px solid ${isHeadsetConnected ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.15)"}`,
                        cursor: "pointer"
                      }}
                    >
                      {isHeadsetConnected ? "Connected ✓" : "Connect Headset"}
                    </button>
                  </div>
                  <div style={{ fontSize: "11px", color: isHeadsetConnected ? "#34d399" : "#94a3b8" }}>
                    {isHeadsetConnected
                      ? "Headphone joined and active."
                      : "Headset of headphone must be connected to go online."}
                  </div>
                </div>

                {headsetAlert && (
                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <AlertCircle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                    <span>{headsetAlert}</span>
                  </div>
                )}

                {/* Connect to Online Button */}
                <button
                  onClick={handleConnectToOnline}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: "#16a34a",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
                    transition: "all 0.15s ease"
                  }}
                >
                  Connect to Online
                </button>
              </div>
            )}

            {/* ── CASE 2: ONLINE STATUS ── */}
            {presenceStatus === "ONLINE" && !showBreakSelector && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Status Indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>
                    Status: Online &amp; Ready
                  </span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                </div>

                {/* Headset Joined Card */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    Headset joined. Dialer ready for calls.
                  </span>
                </div>

                {/* Quick Break Button */}
                <button
                  onClick={() => setShowBreakSelector(true)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fbbf24",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Coffee style={{ width: "14px", height: "14px" }} />
                  <span>Take Break</span>
                </button>

                {/* Turn Offline Button */}
                <button
                  onClick={handleTurnOffline}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Turn Offline
                </button>
              </div>
            )}

            {/* ── BREAK SELECTOR (When user clicks Break) ── */}
            {presenceStatus === "ONLINE" && showBreakSelector && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>
                    Select Break Type
                  </span>
                  <button
                    onClick={() => setShowBreakSelector(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    Back
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {BREAK_OPTIONS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleStartBreak(b.name)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#020921")}
                    >
                      <span>{b.icon}</span>
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CASE 3: ACTIVE BREAK (e.g. Lunch Break, 00:00:05, Go Online) ── */}
            {presenceStatus === "BREAK" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                
                {/* Break Name */}
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#fbbf24" }}>
                  {activeBreakType || "Lunch Break"}
                </div>

                {/* Sub-label: Break time taken */}
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Break time taken
                </div>

                {/* Digital Running Timer */}
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "#ffffff",
                    padding: "6px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    letterSpacing: "0.08em"
                  }}
                >
                  {formatTimer(breakSeconds)}
                </div>

                {/* Primary Button: Go Online */}
                <button
                  onClick={handleEndBreakToGoOnline}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: "#16a34a",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
                  }}
                >
                  Go Online
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 3. PROFILE MODAL (Triggered via 3-dots Profile click) ── */}
      {showProfileModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User style={{ width: "18px", height: "18px", color: "#60a5fa" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Agent Profile
                </h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "#020921",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Name:</span>
                <span style={{ fontWeight: 700, color: "#ffffff" }}>{user?.fullName || user?.name || "Priya Talekar"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Employee ID:</span>
                <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>{user?.employeeId || "PM-CAL-0001"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Role:</span>
                <span style={{ fontWeight: 600, color: "#cbd5e1" }}>{user?.role || "CALLER"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Status:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      presenceStatus === "ONLINE"
                        ? "#34d399"
                        : presenceStatus === "BREAK"
                        ? "#fbbf24"
                        : "#f87171"
                  }}
                >
                  {presenceStatus}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
