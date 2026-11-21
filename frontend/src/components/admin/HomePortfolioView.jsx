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
  ExternalLink,
  Landmark,
  Plus,
  X,
  ShieldCheck
} from "lucide-react";

// ── INITIAL ALLOCATORS (ASSIGNED BANKS / CLIENTS) ──
export const INITIAL_ALLOCATORS = [
  {
    id: "alloc_bajaj",
    name: "Bajaj Finserve",
    code: "BAJAJ",
    type: "NBFC",
    company: "PayMagic PVT LTD",
    badge: "B",
    badgeColor: "bg-blue-600"
  },
  {
    id: "alloc_punewala",
    name: "Punewala (Poonawalla Fincorp)",
    code: "PUNEWALA",
    type: "NBFC",
    company: "PayMagic PVT LTD",
    badge: "P",
    badgeColor: "bg-purple-600"
  }
];

// ── ALLOCATIONS SCOPED BY ALLOCATOR ID ──
export const INITIAL_PORTFOLIOS = [
  // ── 1. BAJAJ FINSERVE ALLOCATIONS (4 EXACT ALLOCATIONS) ──
  {
    id: "bajaj_nov_18",
    allocatorId: "alloc_bajaj",
    allocatorName: "Bajaj Finserve",
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
    allocatorId: "alloc_bajaj",
    allocatorName: "Bajaj Finserve",
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
    allocatorId: "alloc_bajaj",
    allocatorName: "Bajaj Finserve",
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
    allocatorId: "alloc_bajaj",
    allocatorName: "Bajaj Finserve",
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
  },

  // ── 2. PUNEWALA ALLOCATIONS (ISOLATED EXCLUSIVELY TO PUNEWALA) ──
  {
    id: "punewala_nov_16",
    allocatorId: "alloc_punewala",
    allocatorName: "Punewala (Poonawalla Fincorp)",
    name: "PUNEWALA_Personal Loan_Writeoff_2026-11-16_14:20",
    company: "PayMagic PVT LTD",
    badge: "P",
    badgeColor: "bg-purple-600",
    channel: "Call",
    statusText: "Ends in 22 days",
    isExpired: false,
    accounts: 85,
    collectedPct: "0.00%",
    outstanding: "₹2.40 Cr",
    collectedAmount: "₹0 / ₹2.40 Cr",
    collectable: "₹1.55 Cr",
    product: "Personal Loan",
    bucket: "Writeoff",
    date: "2026-11-16"
  },
  {
    id: "punewala_nov_10",
    allocatorId: "alloc_punewala",
    allocatorName: "Punewala (Poonawalla Fincorp)",
    name: "PUNEWALA_Business Loan_Writeoff_2026-11-10_11:15",
    company: "PayMagic PVT LTD",
    badge: "P",
    badgeColor: "bg-purple-600",
    channel: "Call",
    statusText: "Ends in 14 days",
    isExpired: false,
    accounts: 64,
    collectedPct: "0.00%",
    outstanding: "₹1.85 Cr",
    collectedAmount: "₹0 / ₹1.85 Cr",
    collectable: "₹1.10 Cr",
    product: "Business Loan",
    bucket: "Writeoff",
    date: "2026-11-10"
  }
];

export const PORTFOLIOS = INITIAL_PORTFOLIOS;

export default function HomePortfolioView({
  selectedPortfolioId,
  setSelectedPortfolioId,
  onNavigateToCallMonitoring
}) {
  const [allocators, setAllocators] = useState(INITIAL_ALLOCATORS);
  const [selectedAllocatorId, setSelectedAllocatorId] = useState("alloc_bajaj");
  const [portfolios, setPortfolios] = useState(INITIAL_PORTFOLIOS);

  // Create Allocator Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    code: "",
    type: "NBFC",
    initialAllocation: ""
  });
  const [createError, setCreateError] = useState("");

  const [detailTab, setDetailTab] = useState("one_view"); // one_view, call, field, digital
  const [digitalSubTab, setDigitalSubTab] = useState("sms"); // sms, ivr, bot
  const [fieldSearch, setFieldSearch] = useState("");

  const activePortfolio = portfolios.find((p) => p.id === selectedPortfolioId) || PORTFOLIOS.find((p) => p.id === selectedPortfolioId);
  const selectedAllocator = allocators.find((a) => a.id === selectedAllocatorId) || allocators[0];
  const filteredPortfolios = portfolios.filter((p) => p.allocatorId === selectedAllocatorId);

  const handleCreateAllocator = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!createForm.name.trim() || !createForm.code.trim()) {
      setCreateError("Please provide both Allocator / Bank Name and Bank Code.");
      return;
    }

    const newId = `alloc_${createForm.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString().slice(-4)}`;
    const newBadge = createForm.name.trim().charAt(0).toUpperCase();

    const newAlloc = {
      id: newId,
      name: createForm.name.trim(),
      code: createForm.code.trim().toUpperCase(),
      type: createForm.type,
      company: "PayMagic PVT LTD",
      badge: newBadge,
      badgeColor: "bg-emerald-600"
    };

    setAllocators([...allocators, newAlloc]);
    setSelectedAllocatorId(newId);

    // Optional initial allocation under this new allocator
    if (createForm.initialAllocation.trim()) {
      const newPortfolio = {
        id: `port_${Date.now()}`,
        allocatorId: newId,
        allocatorName: newAlloc.name,
        name: createForm.initialAllocation.trim(),
        company: "PayMagic PVT LTD",
        badge: newBadge,
        badgeColor: "bg-emerald-600",
        channel: "Call",
        statusText: "Ends in 30 days",
        isExpired: false,
        accounts: 25,
        collectedPct: "0.00%",
        outstanding: "₹50.00 Lakh",
        collectedAmount: "₹0 / ₹50.00 Lakh",
        collectable: "₹32.50 Lakh",
        product: "Personal Loan",
        bucket: "Writeoff",
        date: new Date().toISOString().slice(0, 10)
      };
      setPortfolios([newPortfolio, ...portfolios]);
    }

    setShowCreateModal(false);
    setCreateForm({ name: "", code: "", type: "NBFC", initialAllocation: "" });
    setCreateError("");
  };

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

  // ── DEFAULT: RENDER ALLOCATOR SELECTOR & ISOLATED PORTFOLIO CARDS ──
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* ── 1. HEADER ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "20px",
          borderRadius: "16px",
          backgroundColor: "#041030",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <span>All Portfolios</span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: "rgba(37, 99, 235, 0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(37, 99, 235, 0.3)",
                fontFamily: "monospace"
              }}
            >
              PayMagic PVT LTD
            </span>
          </h2>
        </div>

        {/* Create Allocator Action Button */}
        <button
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            backgroundColor: "#1d4ed8",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)",
            transition: "all 0.15s ease"
          }}
        >
          <Plus style={{ width: "16px", height: "16px" }} />
          <span>Create Allocator</span>
        </button>
      </div>

      {/* ── 2. ASSIGNED BANKS / ALLOCATORS SELECTOR (STRICT ISOLATION) ── */}
      <div
        style={{
          padding: "18px 20px",
          borderRadius: "16px",
          backgroundColor: "#041030",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(37, 99, 235, 0.15)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Landmark style={{ width: "18px", height: "18px" }} />
            </div>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                Assigned Banks &amp; Institutional Allocators:
              </span>
            </div>
          </div>
        </div>

        {/* Allocator Pills (Single Selection at a time) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {allocators.map((alloc) => {
            const isSelected = selectedAllocatorId === alloc.id;
            const count = portfolios.filter((p) => p.allocatorId === alloc.id).length;
            return (
              <button
                key={alloc.id}
                onClick={() => setSelectedAllocatorId(alloc.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? "#1d4ed8" : "#0a1535",
                  color: isSelected ? "#ffffff" : "#cbd5e1",
                  border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(51, 65, 85, 0.6)",
                  boxShadow: isSelected ? "0 2px 8px rgba(29, 78, 216, 0.4)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "9999px",
                    backgroundColor: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.15)",
                    color: isSelected ? "#1d4ed8" : "#ffffff",
                    fontSize: "10px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {alloc.badge}
                </span>
                <span>{alloc.name}</span>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    backgroundColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.08)",
                    color: isSelected ? "#ffffff" : "#94a3b8"
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Institutional Isolation Notice */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: "#020921",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            fontSize: "11px",
            color: "#34d399",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <ShieldCheck style={{ width: "14px", height: "14px", flexShrink: 0 }} />
          <span>
            Active Allocator: <strong style={{ color: "#ffffff" }}>{selectedAllocator.name}</strong> ({filteredPortfolios.length} Allocations). Institutional data isolation active — allocations from other banks are hidden.
          </span>
        </div>
      </div>

      {/* ── 3. ISOLATED PORTFOLIO BOXES GRID ── */}
      {filteredPortfolios.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: "20px"
          }}
        >
          {filteredPortfolios.map((item) => (
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
                      backgroundColor: item.badgeColor === "bg-amber-600" ? "#d97706" : item.badgeColor === "bg-purple-600" ? "#7c3aed" : "#2563eb",
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
                      title={item.name}
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
      ) : (
        <div
          style={{
            padding: "48px 24px",
            borderRadius: "16px",
            backgroundColor: "#041030",
            border: "1px dashed rgba(255, 255, 255, 0.15)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Landmark style={{ width: "24px", height: "24px" }} />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            No Allocations for {selectedAllocator.name}
          </h3>
          <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "420px", margin: 0 }}>
            There are currently no recovery portfolios uploaded for this assigned bank. Go to the Allocation tab to upload an allocation file.
          </p>
        </div>
      )}

      {/* ── 4. CREATE ALLOCATOR MODAL ── */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(37, 99, 235, 0.2)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Landmark style={{ width: "18px", height: "18px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Create New Allocator
                  </h3>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Add an assigned bank or institutional lender
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {createError && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fb7185",
                  fontSize: "11px"
                }}
              >
                {createError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateAllocator} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                  Allocator / Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Capital, IDFC First Bank"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                    Bank Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TATACAP"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                      textTransform: "uppercase"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                    Client Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="NBFC">NBFC</option>
                    <option value="SCHEDULED_COMMERCIAL_BANK">Scheduled Bank</option>
                    <option value="FINTECH">Fintech Lender</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, marginBottom: "4px" }}>
                  Initial Portfolio Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TATA_Personal Loan_Writeoff_2026-11-20"
                  value={createForm.initialAllocation}
                  onChange={(e) => setCreateForm({ ...createForm, initialAllocation: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)"
                  }}
                >
                  Save Allocator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
