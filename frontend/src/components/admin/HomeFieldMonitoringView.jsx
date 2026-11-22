import React, { useState } from "react";
import {
  MapPin,
  List,
  Map as MapIcon,
  AlertTriangle,
  UserCheck,
  Radio,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Compass,
  CheckCircle2
} from "lucide-react";

export default function HomeFieldMonitoringView() {
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'deviation'
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Top Header & Sub-Tab Switcher */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "18px 24px",
          borderRadius: "16px",
          backgroundColor: "#051336",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa"
            }}
          >
            <Compass style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
              Field Agent Monitoring
            </h2>
          </div>
        </div>

        {/* 1. Live Monitoring | 2. Deviation Monitoring */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px",
            backgroundColor: "#020921",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)"
          }}
        >
          <button
            onClick={() => setActiveTab("live")}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: activeTab === "live" ? 700 : 500,
              backgroundColor: activeTab === "live" ? "#1d4ed8" : "transparent",
              color: activeTab === "live" ? "#ffffff" : "#94a3b8",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: activeTab === "live" ? "0 2px 6px rgba(29, 78, 216, 0.35)" : "none"
            }}
          >
            1. Live Monitoring
          </button>
          <button
            onClick={() => setActiveTab("deviation")}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: activeTab === "deviation" ? 700 : 500,
              backgroundColor: activeTab === "deviation" ? "#1d4ed8" : "transparent",
              color: activeTab === "deviation" ? "#ffffff" : "#94a3b8",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: activeTab === "deviation" ? "0 2px 6px rgba(29, 78, 216, 0.35)" : "none"
            }}
          >
            2. Deviation Monitoring
          </button>
        </div>
      </div>

      {/* ── 1. LIVE MONITORING TAB ── */}
      {activeTab === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* KPI Cards: Total Agents: 0, Online Agents: 0, Offline Agents: 0 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px"
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                backgroundColor: "#051336",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Total Agents</span>
                <UserCheck style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>0</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>Allocated to field visits</div>
            </div>

            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                backgroundColor: "#051336",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Online Agents</span>
                <Radio style={{ width: "16px", height: "16px", color: "#34d399" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#34d399", lineHeight: 1.2 }}>0</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#34d399" }}>Active on field radar</div>
            </div>

            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                backgroundColor: "#051336",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Offline Agents</span>
                <Clock style={{ width: "16px", height: "16px", color: "#fb7185" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#fb7185", lineHeight: 1.2 }}>0</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>No active GPS signal</div>
            </div>
          </div>

          {/* Table / Map Section */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: "16px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Field Agent Live Radar
                </h3>
              </div>

              {/* Toggle Map / List */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px",
                  backgroundColor: "#020921",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: viewMode === "list" ? 700 : 500,
                    backgroundColor: viewMode === "list" ? "#1d4ed8" : "transparent",
                    color: viewMode === "list" ? "#ffffff" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <List style={{ width: "14px", height: "14px" }} />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: viewMode === "map" ? 700 : 500,
                    backgroundColor: viewMode === "map" ? "#1d4ed8" : "transparent",
                    color: viewMode === "map" ? "#ffffff" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <MapIcon style={{ width: "14px", height: "14px" }} />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent Name</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent ID</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Check in Time</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Check out Time</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Accounts Deviation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        <Compass style={{ width: "32px", height: "32px", margin: "0 auto 8px auto", color: "rgba(255, 255, 255, 0.2)" }} />
                        <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "13px" }}>No field recovery agents currently active on ground.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  height: "260px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px dashed rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  textAlign: "center"
                }}
              >
                <MapPin style={{ width: "36px", height: "36px", color: "rgba(255, 255, 255, 0.3)", marginBottom: "8px" }} />
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Live GPS Radar Map</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  Interactive coordinates render when field agents check in with active mobile credentials.
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── 2. DEVIATION MONITORING TAB ── */}
      {activeTab === "deviation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* KPI Cards: Total Deviation: 0, Deviation > 100M: 0 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px"
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                backgroundColor: "#051336",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Total Deviation</span>
                <AlertTriangle style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>0</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>Audited geolocation records</div>
            </div>

            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                backgroundColor: "#051336",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Deviation &gt; 100M</span>
                <ShieldAlert style={{ width: "16px", height: "16px", color: "#fb7185" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#fb7185", lineHeight: 1.2 }}>0</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#fb7185" }}>Visits marked beyond 100m geofence</div>
            </div>
          </div>

          {/* Table / Map Section */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: "16px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Geofence Compliance Log
                </h3>
              </div>

              {/* Toggle Map / List */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px",
                  backgroundColor: "#020921",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: viewMode === "list" ? 700 : 500,
                    backgroundColor: viewMode === "list" ? "#1d4ed8" : "transparent",
                    color: viewMode === "list" ? "#ffffff" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <List style={{ width: "14px", height: "14px" }} />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: viewMode === "map" ? 700 : 500,
                    backgroundColor: viewMode === "map" ? "#1d4ed8" : "transparent",
                    color: viewMode === "map" ? "#ffffff" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <MapIcon style={{ width: "14px", height: "14px" }} />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent Name</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Borrower Name</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Number</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deviation Distance</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visit Date &amp; Time</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        <CheckCircle2 style={{ width: "32px", height: "32px", margin: "0 auto 8px auto", color: "#34d399" }} />
                        <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "13px" }}>Zero compliance deviations detected. All marked visits verified within authorized geofences.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  height: "260px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px dashed rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  textAlign: "center"
                }}
              >
                <ShieldAlert style={{ width: "36px", height: "36px", color: "#34d399", marginBottom: "8px" }} />
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>No Geofence Violations</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  Audit logs indicate 100% adherence to institutional recovery perimeter thresholds.
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
