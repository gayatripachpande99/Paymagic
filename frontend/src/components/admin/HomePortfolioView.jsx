import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  PhoneCall,
  Users,
  IndianRupee,
  Activity,
  Layers,
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  TrendingUp,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export const PORTFOLIOS = [
  {
    id: "bajaj_nov_18",
    name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32",
    company: "PayMagic PVT LTD",
    badge: "B",
    badgeColor: "bg-blue-600",
    channel: "Call",
    statusText: "Ends in 18 days",
    isExpired: false,
    accounts: 117,
    collectedPct: "0.00%",
    outstanding: "₹4.74 Cr",
    collectedAmount: "₹0 / ₹4.74 Cr",
    collectable: "₹2.81 Cr",
    product: "Personal Loan",
    bucket: "Writeoff",
    date: "2026-11-18"
  },
  {
    id: "bajaj_nov_13",
    name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-13_10:13",
    company: "PayMagic PVT LTD",
    badge: "B",
    badgeColor: "bg-blue-600",
    channel: "Call",
    statusText: "Ends in 18 days",
    isExpired: false,
    accounts: 117,
    collectedPct: "0.00%",
    outstanding: "₹4.74 Cr",
    collectedAmount: "₹0 / ₹4.74 Cr",
    collectable: "₹2.81 Cr",
    product: "Personal Loan",
    bucket: "Writeoff",
    date: "2026-11-13"
  },
  {
    id: "bajaj_nov_04_13",
    name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_13:45",
    company: "PayMagic PVT LTD",
    badge: "B",
    badgeColor: "bg-blue-600",
    channel: "Call",
    statusText: "Ends in 18 days",
    isExpired: false,
    accounts: 293,
    collectedPct: "0.00%",
    outstanding: "₹6.11 Cr",
    collectedAmount: "₹0 / ₹6.11 Cr",
    collectable: "₹3.85 Cr",
    product: "Personal Loan",
    bucket: "Writeoff",
    date: "2026-11-04"
  },
  {
    id: "bajaj_nov_04_11",
    name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_11:31",
    company: "PayMagic PVT LTD",
    badge: "B",
    badgeColor: "bg-amber-600",
    channel: "Call",
    statusText: "Expired",
    isExpired: true,
    accounts: 4,
    collectedPct: "0.00%",
    outstanding: "₹22.08 Lakh",
    collectedAmount: "₹0 / ₹22.08 Lakh",
    collectable: "₹14.20 Lakh",
    product: "Personal Loan",
    bucket: "Writeoff",
    date: "2026-11-04"
  }
];

export default function HomePortfolioView({
  selectedPortfolioId,
  setSelectedPortfolioId,
  onNavigateToCallMonitoring
}) {
  const [detailTab, setDetailTab] = useState("one_view"); // one_view, call, field, digital
  const [digitalSubTab, setDigitalSubTab] = useState("sms"); // sms, ivr, bot
  const [fieldSearch, setFieldSearch] = useState("");

  const activePortfolio = PORTFOLIOS.find((p) => p.id === selectedPortfolioId);

  // If a portfolio is clicked, render the detailed portfolio breakdown
  if (activePortfolio) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Detail Top Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "20px",
            borderRadius: "16px",
            backgroundColor: "#041030",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSelectedPortfolioId(null)}
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Back to All Portfolios"
            >
              <ArrowLeft style={{ width: "16px", height: "16px" }} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff" }}>
                  {activePortfolio.name}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.3)"
                  }}
                >
                  {activePortfolio.bucket}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "rgba(37, 99, 235, 0.15)",
                    color: "#60a5fa",
                    border: "1px solid rgba(37, 99, 235, 0.3)"
                  }}
                >
                  {activePortfolio.product}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px", margin: 0 }}>
                PayMagic Recovery Portfolio Performance &amp; Multi-Channel Breakdown
              </p>
            </div>
          </div>

          {/* Sub-Tabs: 1. One View | 2. Call | 3. Field | 4. Digital */}
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
            {[
              { id: "one_view", label: "1. One View" },
              { id: "call", label: "2. Call" },
              { id: "field", label: "3. Field" },
              { id: "digital", label: "4. Digital" }
            ].map((tab) => {
              const isActive = detailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? "#1d4ed8" : "transparent",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isActive ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none"
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 1. ONE VIEW CONTENT ── */}
        {detailTab === "one_view" && (
          <div className="space-y-6">
            
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Total Accounts</span>
                <div className="text-2xl font-black text-foreground mt-1">117</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span>Unsubscribed: <strong className="text-foreground">0</strong></span>
                  <span>•</span>
                  <span>0 Resolution</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Total Outstanding</span>
                <div className="text-2xl font-black text-foreground mt-1">₹4.74 Cr</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span>Unsubscribed: <strong className="text-foreground">₹0</strong></span>
                  <span>•</span>
                  <span>0 Engagement</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Collectable Amount</span>
                <div className="text-2xl font-black text-emerald-500 mt-1">₹2.81 Cr</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span>Collected: <strong className="text-foreground">₹0</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Collection Realization</span>
                <div className="text-2xl font-black text-blue-500 mt-1">0.00%</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span>Target: 18.5% recovery rate</span>
                </div>
              </div>
            </div>

            {/* Dispositions Pools: Positive Pool vs Difficult Pool */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <h4 className="text-sm font-bold text-foreground">Dispositions Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Positive Pool */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    Positive Pool
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Paid</span>
                      <div className="text-sm font-bold text-foreground">0.0%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹0</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">PTP</span>
                      <div className="text-sm font-bold text-foreground">0.0%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹0</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Callback</span>
                      <div className="text-sm font-bold text-foreground">0.0%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹0</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Settlement</span>
                      <div className="text-sm font-bold text-foreground">0.0%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹0</div>
                    </div>
                  </div>
                </div>

                {/* Difficult Pool */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Difficult Pool
                  </span>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Dispute</span>
                      <div className="text-sm font-bold text-foreground">0.0%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹0</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">NC (No Contact)</span>
                      <div className="text-sm font-bold text-foreground">29.9%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹90.2 Lakh</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">RTP (Refused)</span>
                      <div className="text-sm font-bold text-foreground">0.0%</div>
                      <div className="text-[11px] text-muted-foreground font-mono">₹0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Allocated Count & Effort Metric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Agent Allocated Count */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-sm font-bold text-foreground">Agent Allocated Count</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Total Allocated Agents</span>
                    <span className="font-bold text-foreground">4/116 Accounts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Call Allocated Agents</span>
                    <span className="font-bold text-blue-500">4/116 Accounts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Field Allocated Agents</span>
                    <span className="font-bold text-foreground">0/0 Accounts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Unallocated Agents</span>
                    <span className="font-bold text-foreground">0/0 Accounts</span>
                  </div>
                </div>
              </div>

              {/* Effort Metric */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-sm font-bold text-foreground">Effort Metric</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Total Attempts</span>
                    <span className="font-bold text-foreground">173/35</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Call Attempts</span>
                    <span className="font-bold text-blue-500">173/35</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Field Visits</span>
                    <span className="font-bold text-foreground">0/0</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Digital Attempts</span>
                    <span className="font-bold text-foreground">0/0</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Untouched</span>
                    <span className="font-bold text-amber-500">0/82</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── 2. CALL TAB CONTENT ── */}
        {detailTab === "call" && (
          <div className="space-y-6">
            
            {/* Top Bar with "Agent Monitoring" Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
              <div>
                <h4 className="font-bold text-base text-foreground">Overall Call Summary</h4>
                <p className="text-xs text-muted-foreground">
                  Voice telephony outreach status & live telecaller statistics
                </p>
              </div>
              <button
                onClick={onNavigateToCallMonitoring}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
              >
                <span>Agent Monitoring</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Call Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs text-muted-foreground">Total Accounts</span>
                <div className="text-2xl font-bold text-foreground mt-1">116</div>
                <div className="text-[11px] text-muted-foreground mt-1">Unsubscribed: 0 • 0 Resolution</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs text-muted-foreground">Call Outstanding</span>
                <div className="text-2xl font-bold text-foreground mt-1">₹4.71 Cr</div>
                <div className="text-[11px] text-muted-foreground mt-1">Unsubscribed: ₹0 • 0 Engagement</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs text-muted-foreground">Collectable</span>
                <div className="text-2xl font-bold text-emerald-500 mt-1">₹2.79 Cr</div>
                <div className="text-[11px] text-muted-foreground mt-1">Collected: ₹0</div>
              </div>
            </div>

            {/* Dispositions */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <h4 className="text-sm font-bold text-foreground">Dispositions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs font-bold text-emerald-500">Positive Pool</span>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-center text-xs">
                    <div>Paid: <strong className="text-foreground">0.0%</strong> (₹0)</div>
                    <div>PTP: <strong className="text-foreground">0.0%</strong> (₹0)</div>
                    <div>Callback: <strong className="text-foreground">0.0%</strong> (₹0)</div>
                    <div>Settlement: <strong className="text-foreground">0.0%</strong> (₹0)</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs font-bold text-amber-500">Difficult Pool</span>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                    <div>Dispute: <strong className="text-foreground">0.0%</strong> (₹0)</div>
                    <div>NC: <strong className="text-foreground">30.2%</strong> (₹90.2 L)</div>
                    <div>RTP: <strong className="text-foreground">0.0%</strong> (₹0)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Allocated Count & Effort Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
                <div className="font-bold text-foreground mb-1">Agent Allocated Count</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Call Allocated Agents</span>
                  <span className="font-bold text-foreground">4/116 Accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unallocated Agents</span>
                  <span className="font-bold text-foreground">0/0 Accounts</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
                <div className="font-bold text-foreground mb-1">Effort Metric</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Attempts</span>
                  <span className="font-bold text-foreground">173/116</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Call Attempts</span>
                  <span className="font-bold text-foreground">173/35</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Untouched</span>
                  <span className="font-bold text-amber-500">0/81</span>
                </div>
              </div>
            </div>

            {/* Agent Summary: Agents List Table */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Agent Summary</h4>
                  <p className="text-xs text-muted-foreground">Agents assigned to this allocation portfolio</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Agent</th>
                      <th className="p-3">Team Leader</th>
                      <th className="p-3">Total Calls</th>
                      <th className="p-3">Total Connected Call</th>
                      <th className="p-3">Total Non Connected Call</th>
                      <th className="p-3">Login Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Manisha Shete</td>
                      <td className="p-3 text-muted-foreground">Priya Talekar</td>
                      <td className="p-3 font-bold text-foreground">133</td>
                      <td className="p-3 text-emerald-500 font-bold">83</td>
                      <td className="p-3 text-rose-500 font-bold">50</td>
                      <td className="p-3 text-muted-foreground font-mono">08:59:15</td>
                    </tr>
                    <tr className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Priya Talekar</td>
                      <td className="p-3 text-muted-foreground">Priya Talekar</td>
                      <td className="p-3 font-bold text-foreground">52</td>
                      <td className="p-3 text-emerald-500 font-bold">26</td>
                      <td className="p-3 text-rose-500 font-bold">26</td>
                      <td className="p-3 text-muted-foreground font-mono">08:55:14</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── 3. FIELD TAB CONTENT ── */}
        {detailTab === "field" && (
          <div className="space-y-6">
            
            {/* Overall Field Summary */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <h4 className="text-sm font-bold text-foreground">Overall Field Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Total Accounts</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">0</div>
                  <div className="text-[10px] text-muted-foreground">Unsubscribed: 0 • 0 Resolution</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Field Outstanding</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">₹0</div>
                  <div className="text-[10px] text-muted-foreground">Unsubscribed: ₹0 • 0 Engagement</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Collectable</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">₹0</div>
                  <div className="text-[10px] text-muted-foreground">Collected: ₹0</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Collections %</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">0.00%</div>
                  <div className="text-[10px] text-muted-foreground">Target: ₹0</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-2.5 rounded bg-muted/30">Assigned Vs Unassigned: <strong>0 Total Accounts</strong></div>
                <div className="p-2.5 rounded bg-muted/30">Visited Vs Non Visited: <strong>0 Total Accounts</strong></div>
                <div className="p-2.5 rounded bg-muted/30">Total Visits: <strong>0</strong></div>
                <div className="p-2.5 rounded bg-muted/30">Unique Visits: <strong>0</strong></div>
              </div>
            </div>

            {/* Agent Wise Reports Table */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Agent Wise Report</h4>
                  <p className="text-xs text-muted-foreground">Field agent allocation, visits, DRR and collection ratios</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search account number..."
                    className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none">
                    <option>Sort By: Agent Name</option>
                    <option>Sort By: Collection%</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5">Agent Name</th>
                      <th className="p-2.5">Yucollect ID</th>
                      <th className="p-2.5">Amount Allocated</th>
                      <th className="p-2.5">Amount Collected</th>
                      <th className="p-2.5">Collection%</th>
                      <th className="p-2.5">Allocation Count</th>
                      <th className="p-2.5">Total Visits</th>
                      <th className="p-2.5">Unique Visits</th>
                      <th className="p-2.5">DRR (Visit/Day)</th>
                      <th className="p-2.5">Intensity</th>
                      <th className="p-2.5">Dispositions Form Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td colSpan="11" className="p-6 text-center text-muted-foreground">
                        No field recovery records allocated for this portfolio.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Day Wise Visit Report */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-foreground">Day Wise Visit Report</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search by Agent name..."
                    className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <select className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none">
                    <option>Sort By: Date</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5">Agent Name</th>
                      <th className="p-2.5">YuCollect ID</th>
                      <th className="p-2.5">Disposition</th>
                      <th className="p-2.5">Sub Disposition</th>
                      <th className="p-2.5">Disposition Date</th>
                      <th className="p-2.5">Disposition Time</th>
                      <th className="p-2.5">Distance from address</th>
                      <th className="p-2.5">Borrower Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-muted-foreground">
                        No visit activity logged for today.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom 2 Field Tables: Agents with Visit% <70 & Agents with Collection% <20 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-sm font-bold text-foreground">Agents with Visit% &lt; 70</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="p-2">Agent Name</th>
                        <th className="p-2">Yucollect ID</th>
                        <th className="p-2">Visit %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="3" className="p-4 text-center text-muted-foreground">
                          No underperforming field agents recorded.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-sm font-bold text-foreground">Agents with Collection% &lt; 20</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="p-2">Agent Name</th>
                        <th className="p-2">Yucollect ID</th>
                        <th className="p-2">Collection%</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="3" className="p-4 text-center text-muted-foreground">
                          No low collection agents recorded.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── 4. DIGITAL TAB CONTENT ── */}
        {detailTab === "digital" && (
          <div className="space-y-6">
            
            {/* Overall Digital Summary */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <h4 className="text-sm font-bold text-foreground">Overall Digital Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Total Accounts</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">0</div>
                  <div className="text-[10px] text-muted-foreground">Unsubscribed: 0 • 0 Engagement</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Outstanding</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">₹0</div>
                  <div className="text-[10px] text-muted-foreground">Unsubscribed: ₹0 • 0 Engagement</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Collectable</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">₹0</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Collected</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">₹0</div>
                </div>
              </div>
            </div>

            {/* Digital Engagement Summary (SMS, IVR, BOT) */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-foreground">Digital Engagement Summary</h4>
                <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setDigitalSubTab("sms")}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      digitalSubTab === "sms" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    onClick={() => setDigitalSubTab("ivr")}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      digitalSubTab === "ivr" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    IVR
                  </button>
                  <button
                    onClick={() => setDigitalSubTab("bot")}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      digitalSubTab === "bot" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    BOT
                  </button>
                </div>
              </div>

              {/* Choose Plan & Metrics */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-foreground">Choose Plan: 7 day high intensity</span>
                  <div className="text-xs text-muted-foreground">Start Date: <strong>2026-11-18</strong> | End Date: <strong>2026-11-25</strong></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
                  <div className="p-2 rounded bg-card border border-border text-center">
                    <span className="text-[10px] text-muted-foreground">Contacted</span>
                    <div className="font-bold text-foreground mt-0.5">N/A</div>
                  </div>
                  <div className="p-2 rounded bg-card border border-border text-center">
                    <span className="text-[10px] text-muted-foreground">Total Attempts</span>
                    <div className="font-bold text-foreground mt-0.5">N/A</div>
                  </div>
                  <div className="p-2 rounded bg-card border border-border text-center">
                    <span className="text-[10px] text-muted-foreground">Total Intensity</span>
                    <div className="font-bold text-foreground mt-0.5">N/A</div>
                  </div>
                  <div className="p-2 rounded bg-card border border-border text-center">
                    <span className="text-[10px] text-muted-foreground">Avg Intensity</span>
                    <div className="font-bold text-foreground mt-0.5">N/A</div>
                  </div>
                  <div className="p-2 rounded bg-card border border-border text-center">
                    <span className="text-[10px] text-muted-foreground">Total Accounts</span>
                    <div className="font-bold text-foreground mt-0.5">N/A</div>
                  </div>
                </div>
              </div>

              {/* Dispositions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="font-bold text-emerald-500">Positive Pool</span>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                    <div>Paid: 0.0% (₹0)</div>
                    <div>PTP: 0.0% (₹0)</div>
                    <div>Callback: 0.0% (₹0)</div>
                    <div>Settlement: 0.0% (₹0)</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="font-bold text-amber-500">Difficult Pool</span>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                    <div>Dispute: 0.0% (₹0)</div>
                    <div>NC: 0.0% (₹0)</div>
                    <div>RTP: 0.0% (₹0)</div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-card border border-border flex justify-between">
                  <span className="text-muted-foreground">Engagement by Accounts</span>
                  <span className="font-bold text-foreground">0</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border flex justify-between">
                  <span className="text-muted-foreground">Engagement by Outstanding</span>
                  <span className="font-bold text-foreground">₹0</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    );
  }

  // ── DEFAULT: RENDER 4 PORTFOLIO CARDS ──
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>All Portfolios</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
              PayMagic PVT LTD
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional recovery allocations assigned for omnichannel collections
          </p>
        </div>
      </div>

      {/* 4 Portfolio Boxes Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "20px"
        }}
      >
        {PORTFOLIOS.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPortfolioId(item.id)}
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(29, 78, 216, 0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {/* Top Row: Badge, Name, Status, Channel */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: item.badgeColor === "bg-amber-600" ? "#d97706" : "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {item.badge}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#ffffff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      margin: 0
                    }}
                  >
                    {item.name}
                  </h3>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    {item.company}
                  </div>
                </div>
              </div>

              {/* Status & Channel */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    backgroundColor: item.isExpired ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: item.isExpired ? "#fb7185" : "#34d399",
                    border: item.isExpired ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)"
                  }}
                >
                  {item.statusText}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(37, 99, 235, 0.15)",
                    color: "#60a5fa",
                    border: "1px solid rgba(37, 99, 235, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <PhoneCall style={{ width: "10px", height: "10px" }} />
                  {item.channel}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginTop: "18px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Total Accounts</span>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{item.accounts}</div>
                <div style={{ fontSize: "10px", color: "#34d399", fontWeight: 600, marginTop: "2px" }}>{item.collectedPct} Collected</div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Outstanding</span>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{item.outstanding}</div>
                <div style={{ fontSize: "10px", color: "#34d399", fontWeight: 600, marginTop: "2px" }}>{item.collectedPct} Collected</div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Collected Amount</span>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.collectedAmount}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>Target TOS</div>
              </div>
            </div>

            {/* Bottom Arrow Indicator */}
            <div
              style={{
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                fontWeight: 600,
                color: "#60a5fa"
              }}
            >
              <span>Click to view detailed One View &amp; Dashboards</span>
              <ChevronRight style={{ width: "16px", height: "16px" }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
