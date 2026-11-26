import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Users,
  Search,
  Calendar,
  PhoneCall,
  Clock,
  CheckCircle2,
  PhoneOff,
  UserCheck,
  Star,
  Activity,
  Filter
} from "lucide-react";

export default function HomeCallMonitoringView() {
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'performance'
  const [searchLive, setSearchLive] = useState("");
  const [searchPerf, setSearchPerf] = useState("");
  const [startDate, setStartDate] = useState("2026-11-18");
  const [endDate, setEndDate] = useState("2026-11-18");
  const [telephonyStats, setTelephonyStats] = useState(null);
  const [backendAgents, setBackendAgents] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTelephony = async () => {
      try {
        const [telRes, overRes] = await Promise.allSettled([
          api.get("/admin/telephony"),
          api.get("/admin/overview")
        ]);
        if (isMounted) {
          if (telRes.status === "fulfilled" && telRes.value?.data) {
            setTelephonyStats(telRes.value.data.metrics || null);
          }
        }
      } catch (e) {
        // Fallback maintained
      }
    };
    fetchTelephony();
    return () => { isMounted = false; };
  }, []);

  // Live agents data
  const liveAgents = [
    {
      agent: "Manisha Shete",
      allocationFile: "-",
      campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA",
      supervisor: "Priya Talekar",
      status: "Logout",
      duration: "04:56:45",
      statusBg: "rgba(245, 158, 11, 0.12)",
      statusColor: "#fbbf24",
      statusBorder: "rgba(245, 158, 11, 0.3)"
    },
    {
      agent: "Akshaya Ganji",
      allocationFile: "-",
      campaign: "-",
      supervisor: "Priya Talekar",
      status: "Offline",
      duration: "00:00:00",
      statusBg: "rgba(148, 163, 184, 0.12)",
      statusColor: "#94a3b8",
      statusBorder: "rgba(148, 163, 184, 0.25)"
    },
    {
      agent: "Bhushan Gaikwad",
      allocationFile: "-",
      campaign: "URBAN BAJAJ-NOV-2026",
      supervisor: "Priya Talekar",
      status: "Offline",
      duration: "00:00:00",
      statusBg: "rgba(148, 163, 184, 0.12)",
      statusColor: "#94a3b8",
      statusBorder: "rgba(148, 163, 184, 0.25)"
    },
    {
      agent: "Priya Talekar",
      allocationFile: "-",
      campaign: "New URBAN BAJAJ-NOV-2026",
      supervisor: "Priya Talekar",
      status: "Offline",
      duration: "00:00:00",
      statusBg: "rgba(148, 163, 184, 0.12)",
      statusColor: "#94a3b8",
      statusBorder: "rgba(148, 163, 184, 0.25)"
    }
  ];

  // Agent performance records
  const perfAgents = [
    {
      agent: "Manisha Shete",
      teamLeader: "Priya Talekar",
      totalCalls: 133,
      connectedCalls: 83,
      notConnectedCalls: 50,
      loginTime: "2026-11-18 08:59:15",
      logoutTime: "2026-11-18 18:01:04",
      totalLoginHours: "06:34:09",
      idealDuration: "00:00:00",
      callDuration: "00:43:06",
      totalBreak: "00:01:06",
      nonProductiveAux: "00:00:00",
      email: "manishashete549@gmail.com",
      rating: 3.1
    },
    {
      agent: "Priya Talekar",
      teamLeader: "Priya Talekar",
      totalCalls: 52,
      connectedCalls: 26,
      notConnectedCalls: 26,
      loginTime: "2026-11-18 08:55:14",
      logoutTime: "2026-11-18 18:07:05",
      totalLoginHours: "04:37:13",
      idealDuration: "00:00:00",
      callDuration: "01:06:16",
      totalBreak: "01:00:21",
      nonProductiveAux: "00:00:00",
      email: "infopaymagic@gmail.com",
      rating: 2.5
    }
  ];

  const filteredLive = liveAgents.filter((a) =>
    a.agent.toLowerCase().includes(searchLive.toLowerCase()) ||
    a.campaign.toLowerCase().includes(searchLive.toLowerCase()) ||
    a.status.toLowerCase().includes(searchLive.toLowerCase())
  );

  const filteredPerf = perfAgents.filter((a) =>
    a.agent.toLowerCase().includes(searchPerf.toLowerCase()) ||
    a.email.toLowerCase().includes(searchPerf.toLowerCase())
  );

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
              backgroundColor: "rgba(29, 78, 216, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa"
            }}
          >
            <Activity style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
              All Agents Performance
            </h2>
          </div>
        </div>

        {/* 1. Live Monitoring | 2. Agent Performance */}
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
            onClick={() => setActiveTab("performance")}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: activeTab === "performance" ? 700 : 500,
              backgroundColor: activeTab === "performance" ? "#1d4ed8" : "transparent",
              color: activeTab === "performance" ? "#ffffff" : "#94a3b8",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: activeTab === "performance" ? "0 2px 6px rgba(29, 78, 216, 0.35)" : "none"
            }}
          >
            2. Agent Performance
          </button>
        </div>
      </div>

      {/* ── 1. LIVE MONITORING TAB ── */}
      {activeTab === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* KPI Cards: All Agents (4), Live Agents (0 / 0.0%), Dormant (1), Offline (3) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px"
            }}
          >
            {/* All Agents */}
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
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>All Agents</span>
                <Users style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>4</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>Total provisioned</div>
            </div>

            {/* Live Agents */}
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
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Live Agents</span>
                <PhoneCall style={{ width: "16px", height: "16px", color: "#34d399" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#34d399", lineHeight: 1.2 }}>0</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#34d399" }}>0.0% Available on dialer</div>
            </div>

            {/* Dormant */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                backgroundColor: "#051336",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Dormant</span>
                <Clock style={{ width: "16px", height: "16px", color: "#fbbf24" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#fbbf24", lineHeight: 1.2 }}>1</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>In aux / break</div>
            </div>

            {/* Offline */}
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
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Offline</span>
                <PhoneOff style={{ width: "16px", height: "16px", color: "#fb7185" }} />
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#fb7185", lineHeight: 1.2 }}>3</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>Logged off / inactive</div>
            </div>
          </div>

          {/* Agents List Card & Table */}
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
                  Agents List{" "}
                  <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: "12px" }}>
                    ({filteredLive.length} of 4 agents)
                  </span>
                </h3>
              </div>
              <div style={{ position: "relative", minWidth: "260px" }}>
                <Search
                  style={{
                    width: "14px",
                    height: "14px",
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b"
                  }}
                />
                <input
                  type="text"
                  value={searchLive}
                  onChange={(e) => setSearchLive(e.target.value)}
                  placeholder="Search agents, campaigns, status..."
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    fontSize: "12px",
                    color: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

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
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Allocation File Name</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Campaign Name</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Supervisor</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLive.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "#ffffff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(37, 99, 235, 0.15)",
                              border: "1px solid rgba(37, 99, 235, 0.3)",
                              color: "#60a5fa",
                              fontWeight: 700,
                              fontSize: "11px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {row.agent.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{row.agent}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748b", fontFamily: "monospace" }}>{row.allocationFile}</td>
                      <td style={{ padding: "14px 16px", color: "#cbd5e1", fontWeight: 500 }}>{row.campaign}</td>
                      <td style={{ padding: "14px 16px", color: "#94a3b8" }}>{row.supervisor}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: row.statusBg,
                            color: row.statusColor,
                            border: `1px solid ${row.statusBorder}`
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#94a3b8" }}>{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── 2. AGENT PERFORMANCE TAB ── */}
      {activeTab === "performance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Filters & KPI Cards */}
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
            {/* Date Pickers */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Start Date:</span>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>End Date:</span>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                paddingTop: "4px"
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Total Agents</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>4</div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Total Accounts</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>826</div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Untouched Accounts</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#fbbf24" }}>381</div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Total Calls</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>1119</div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Connected Calls</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#34d399" }}>98</div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#34d399" }}>8.76%</div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(244, 63, 94, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Non Connected</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#fb7185" }}>1021</div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#fb7185" }}>91.24%</div>
              </div>
            </div>
          </div>

          {/* Performance Details Table */}
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
                  Performance Details
                </h3>
              </div>
              <div style={{ position: "relative", minWidth: "240px" }}>
                <Search
                  style={{
                    width: "14px",
                    height: "14px",
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b"
                  }}
                />
                <input
                  type="text"
                  value={searchPerf}
                  onChange={(e) => setSearchPerf(e.target.value)}
                  placeholder="Search by agent name..."
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    fontSize: "12px",
                    color: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

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
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team Leader</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Calls</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Connected Calls</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Not Connected Calls</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Login Time</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Logout Time</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Login Hours</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ideal Duration</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Call Duration</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Break</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Non Productive Aux</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                    <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerf.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#ffffff" }}>{row.agent}</td>
                      <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.teamLeader}</td>
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#ffffff" }}>{row.totalCalls}</td>
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#34d399" }}>{row.connectedCalls}</td>
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#fb7185" }}>{row.notConnectedCalls}</td>
                      <td style={{ padding: "14px 14px", color: "#94a3b8", fontFamily: "monospace" }}>{row.loginTime}</td>
                      <td style={{ padding: "14px 14px", color: "#94a3b8", fontFamily: "monospace" }}>{row.logoutTime}</td>
                      <td style={{ padding: "14px 14px", fontFamily: "monospace", fontWeight: 600, color: "#ffffff" }}>{row.totalLoginHours}</td>
                      <td style={{ padding: "14px 14px", fontFamily: "monospace", color: "#64748b" }}>{row.idealDuration}</td>
                      <td style={{ padding: "14px 14px", fontFamily: "monospace", fontWeight: 600, color: "#60a5fa" }}>{row.callDuration}</td>
                      <td style={{ padding: "14px 14px", fontFamily: "monospace", color: "#94a3b8" }}>{row.totalBreak}</td>
                      <td style={{ padding: "14px 14px", fontFamily: "monospace", color: "#64748b" }}>{row.nonProductiveAux}</td>
                      <td style={{ padding: "14px 14px", color: "#94a3b8", fontFamily: "monospace" }}>{row.email}</td>
                      <td style={{ padding: "14px 14px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(245, 158, 11, 0.12)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            color: "#fbbf24",
                            fontWeight: 700,
                            fontSize: "11px"
                          }}
                        >
                          <Star style={{ width: "12px", height: "12px", fill: "#fbbf24", color: "#fbbf24" }} />
                          <span>{row.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
