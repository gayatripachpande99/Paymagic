import React, { useState } from "react";
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

  // Live agents data
  const liveAgents = [
    {
      agent: "Manisha Shete",
      allocationFile: "-",
      campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA",
      supervisor: "Priya Talekar",
      status: "Logout",
      duration: "04:56:45",
      statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    },
    {
      agent: "Akshaya Ganji",
      allocationFile: "-",
      campaign: "-",
      supervisor: "Priya Talekar",
      status: "Offline",
      duration: "00:00:00",
      statusColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    },
    {
      agent: "Bhushan Gaikwad",
      allocationFile: "-",
      campaign: "URBAN BAJAJ-NOV-2026",
      supervisor: "Priya Talekar",
      status: "Offline",
      duration: "00:00:00",
      statusColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    },
    {
      agent: "Priya Talekar",
      allocationFile: "-",
      campaign: "New URBAN BAJAJ-NOV-2026",
      supervisor: "Priya Talekar",
      status: "Offline",
      duration: "00:00:00",
      statusColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
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
    <div className="space-y-6">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">All Agents Performance</h2>
        </div>

        {/* 1. Live Monitoring | 2. Agent Performance */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "live"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1. Live Monitoring
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "performance"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2. Agent Performance
          </button>
        </div>
      </div>

      {/* ── 1. LIVE MONITORING TAB ── */}
      {activeTab === "live" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* KPI Cards: All Agents (4), Live Agents (0 / 0.0%), Dormant (1), Offline (3) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">All Agents</span>
              <div className="text-2xl font-black text-foreground mt-1">4</div>
              <div className="text-[11px] text-muted-foreground mt-1">Total provisioned</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Live Agents</span>
              <div className="text-2xl font-black text-emerald-500 mt-1">0</div>
              <div className="text-[11px] text-emerald-500 mt-1">0.0% Available on dialer</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Dormant</span>
              <div className="text-2xl font-black text-amber-500 mt-1">1</div>
              <div className="text-[11px] text-muted-foreground mt-1">In aux / break</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Offline</span>
              <div className="text-2xl font-black text-rose-500 mt-1">3</div>
              <div className="text-[11px] text-muted-foreground mt-1">Logged off / inactive</div>
            </div>
          </div>

          {/* Agents List Card & Table */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Agents List <span className="text-muted-foreground font-normal">({filteredLive.length} of 4 agents)</span>
                </h3>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchLive}
                  onChange={(e) => setSearchLive(e.target.value)}
                  placeholder="Search agents, campaigns, status..."
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Agent</th>
                    <th className="p-3">Allocation File Name</th>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Supervisor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLive.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 font-bold text-[10px] flex items-center justify-center">
                          {row.agent.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{row.agent}</span>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">{row.allocationFile}</td>
                      <td className="p-3 text-foreground font-medium">{row.campaign}</td>
                      <td className="p-3 text-muted-foreground">{row.supervisor}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{row.duration}</td>
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
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Filters & KPI Cards */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">Start Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">End Date:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Total Agents</span>
                <div className="text-xl font-bold text-foreground mt-0.5">4</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Total Accounts</span>
                <div className="text-xl font-bold text-foreground mt-0.5">826</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Untouched Accounts</span>
                <div className="text-xl font-bold text-amber-500 mt-0.5">381</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Total Calls</span>
                <div className="text-xl font-bold text-foreground mt-0.5">1119</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Connected Calls</span>
                <div className="text-xl font-bold text-emerald-500 mt-0.5">98</div>
                <div className="text-[10px] text-emerald-500 font-semibold">8.76%</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Non Connected</span>
                <div className="text-xl font-bold text-rose-500 mt-0.5">1021</div>
                <div className="text-[10px] text-rose-500 font-semibold">91.24%</div>
              </div>
            </div>
          </div>

          {/* Performance Details Table */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Performance Details</h3>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchPerf}
                  onChange={(e) => setSearchPerf(e.target.value)}
                  placeholder="Search by agent name..."
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Agent</th>
                    <th className="p-3">Team Leader</th>
                    <th className="p-3">Total Calls</th>
                    <th className="p-3">Connected Calls</th>
                    <th className="p-3">Not Connected Calls</th>
                    <th className="p-3">Login Time</th>
                    <th className="p-3">Logout Time</th>
                    <th className="p-3">Total Login Hours</th>
                    <th className="p-3">Ideal Duration</th>
                    <th className="p-3">Call Duration</th>
                    <th className="p-3">Total Break</th>
                    <th className="p-3">Non Productive Aux</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPerf.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{row.agent}</td>
                      <td className="p-3 text-muted-foreground">{row.teamLeader}</td>
                      <td className="p-3 font-bold text-foreground">{row.totalCalls}</td>
                      <td className="p-3 text-emerald-500 font-bold">{row.connectedCalls}</td>
                      <td className="p-3 text-rose-500 font-bold">{row.notConnectedCalls}</td>
                      <td className="p-3 text-muted-foreground font-mono">{row.loginTime}</td>
                      <td className="p-3 text-muted-foreground font-mono">{row.logoutTime}</td>
                      <td className="p-3 font-mono font-semibold text-foreground">{row.totalLoginHours}</td>
                      <td className="p-3 font-mono text-muted-foreground">{row.idealDuration}</td>
                      <td className="p-3 font-mono text-blue-500 font-semibold">{row.callDuration}</td>
                      <td className="p-3 font-mono text-muted-foreground">{row.totalBreak}</td>
                      <td className="p-3 font-mono text-muted-foreground">{row.nonProductiveAux}</td>
                      <td className="p-3 text-muted-foreground font-mono">{row.email}</td>
                      <td className="p-3 font-bold text-amber-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{row.rating}</span>
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
