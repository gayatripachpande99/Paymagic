import React, { useState, useEffect } from "react";
import api from "../../services/api";
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
  ShieldCheck,
  Eye
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
  onNavigateToCallMonitoring,
  onNavigateToAllocation,
  allocators: propAllocators,
  setAllocators: propSetAllocators,
  selectedAllocatorId: propSelectedAllocatorId,
  setSelectedAllocatorId: propSetSelectedAllocatorId,
  portfolios: propPortfolios,
  setPortfolios: propSetPortfolios,
  showCreateModal: propShowCreateModal,
  setShowCreateModal: propSetShowCreateModal
}) {
  const [localAllocators, setLocalAllocators] = useState(INITIAL_ALLOCATORS);
  const [localSelectedAllocatorId, setLocalSelectedAllocatorId] = useState("alloc_bajaj");
  const [localPortfolios, setLocalPortfolios] = useState(INITIAL_PORTFOLIOS);
  const [localShowCreateModal, setLocalShowCreateModal] = useState(false);
  const [backendOverview, setBackendOverview] = useState(null);
  const [selectedAssignAllocId, setSelectedAssignAllocId] = useState("");

  const allocators = propAllocators || localAllocators;
  const setAllocators = propSetAllocators || setLocalAllocators;
  const selectedAllocatorId = propSelectedAllocatorId || localSelectedAllocatorId;
  const setSelectedAllocatorId = propSetSelectedAllocatorId || setLocalSelectedAllocatorId;
  const portfolios = propPortfolios || localPortfolios;
  const setPortfolios = propSetPortfolios || setLocalPortfolios;
  const showCreateModal = propShowCreateModal !== undefined ? propShowCreateModal : localShowCreateModal;
  const setShowCreateModal = propSetShowCreateModal || setLocalShowCreateModal;

  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const [overviewRes, hierarchyRes, allocRes] = await Promise.allSettled([
          api.get("/admin/overview"),
          api.get("/admin/hierarchy"),
          api.get("/admin/allocations")
        ]);

        if (isMounted) {
          if (overviewRes.status === "fulfilled" && overviewRes.value?.data) {
            setBackendOverview(overviewRes.value.data);
          }
          if (hierarchyRes.status === "fulfilled" && hierarchyRes.value?.data) {
            const h = hierarchyRes.value.data;
            if (h.allocators && h.allocators.length > 0) {
              setAllocators(h.allocators.map(a => ({
                id: a.id || `alloc_${a.code?.toLowerCase()}`,
                name: a.name || a.allocator_name,
                code: a.code || "ALLOC",
                type: a.type || "NBFC",
                company: "PayMagic PVT LTD",
                badge: (a.name || "B").charAt(0).toUpperCase(),
                badgeColor: "bg-blue-600"
              })));
            }
          }
          if (allocRes.status === "fulfilled" && Array.isArray(allocRes.value?.data) && allocRes.value.data.length > 0) {
            const liveAllocPortfolios = allocRes.value.data.map(a => ({
              id: a.id,
              allocatorId: a.allocatorId || "alloc_bajaj",
              allocatorName: a.uploader || a.allocatorName || "Institutional Bank",
              name: a.name,
              company: "PayMagic PVT LTD",
              badge: (a.name || "B").charAt(0).toUpperCase(),
              badgeColor: a.allocatorId === "alloc_punewala" ? "bg-amber-600" : a.allocatorId === "alloc_hdfc" ? "bg-indigo-600" : "bg-blue-600",
              channel: "Call",
              statusText: a.allocStatus || "Ends in 30 days",
              isExpired: a.allocStatus === "Closed",
              accounts: a.caseCounts || a.accounts || 15,
              collectedPct: a.collectionPct || "0.00%",
              outstanding: a.sumOfOutstanding || "₹0.00",
              collectedAmount: `₹0 / ${a.sumOfOutstanding || "₹0.00"}`,
              collectable: a.collectable || a.sumOfOutstanding || "₹0.00",
              product: a.product || "Personal Loan",
              bucket: a.bucket || "Writeoff",
              date: a.createdOn ? a.createdOn.slice(0, 10) : new Date().toISOString().slice(0, 10)
            }));
            setPortfolios(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newItems = liveAllocPortfolios.filter(l => !existingIds.has(l.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (err) {
        // Fallback maintained
      }
    };
    fetchBackendData();
    return () => { isMounted = false; };
  }, []);

  const [detailTab, setDetailTab] = useState("one_view"); // one_view, call, field, digital
  const [digitalSubTab, setDigitalSubTab] = useState("sms"); // sms, ivr, bot
  const [fieldSearch, setFieldSearch] = useState("");

  const allAvailableAllocations = React.useMemo(() => {
    const map = new Map();
    portfolios.forEach(p => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    INITIAL_PORTFOLIOS.forEach(p => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [portfolios]);

  const activePortfolio = portfolios.find((p) => p.id === selectedPortfolioId) || PORTFOLIOS.find((p) => p.id === selectedPortfolioId);
  const selectedAllocator = allocators.find((a) => a.id === selectedAllocatorId) || (selectedAllocatorId === "all" ? { name: "All Allocations" } : allocators[0]);
  const filteredPortfolios = selectedAllocatorId === "all"
    ? portfolios
    : portfolios.filter((p) => p.allocatorId === selectedAllocatorId);

  const handleAssignAllocation = async (allocationId) => {
    if (!allocationId) return;
    const targetAlloc = allAvailableAllocations.find(a => a.id === allocationId) || portfolios.find(p => p.id === allocationId);
    if (!targetAlloc) return;

    try {
      await api.post("/admin/allocations/assign", {
        allocationId: targetAlloc.id,
        allocatorId: selectedAllocatorId !== "all" ? selectedAllocatorId : targetAlloc.allocatorId
      });
    } catch (e) {
      console.error("Assign allocation error:", e);
    }

    const currentAlloc = allocators.find(a => a.id === selectedAllocatorId) || { name: "Unity", id: selectedAllocatorId };
    const updatedTarget = {
      ...targetAlloc,
      id: targetAlloc.id.includes(selectedAllocatorId) ? targetAlloc.id : `${targetAlloc.id}_${selectedAllocatorId}`,
      allocatorId: selectedAllocatorId !== "all" ? selectedAllocatorId : targetAlloc.allocatorId,
      allocatorName: currentAlloc.name
    };

    setPortfolios(prev => {
      const exists = prev.some(p => p.id === updatedTarget.id || (p.name === updatedTarget.name && p.allocatorId === updatedTarget.allocatorId));
      if (exists) {
        return prev.map(p => (p.id === updatedTarget.id || (p.name === updatedTarget.name && p.allocatorId === updatedTarget.allocatorId)) ? updatedTarget : p);
      }
      return [updatedTarget, ...prev];
    });

    setSelectedAssignAllocId("");
  };

  // If a portfolio is clicked, render the detailed portfolio breakdown
  if (activePortfolio) {
    const isBajajSample = activePortfolio.id === "bajaj_nov_13";
    const portfolioAccounts = Number(activePortfolio.accounts) || 0;
    const portfolioOutstanding = activePortfolio.outstanding || "₹0.00";
    const portfolioCollectable = activePortfolio.collectable || activePortfolio.outstanding || "₹0.00";
    const portfolioCollectedPct = activePortfolio.collectedPct || "0.00%";

    // Derived dynamic allocation & metrics
    const totalAllocatedAgents = isBajajSample ? 4 : (portfolioAccounts > 0 ? Math.min(4, portfolioAccounts) : 0);
    const allocatedAccounts = isBajajSample ? 116 : portfolioAccounts;
    const unallocatedAccounts = isBajajSample ? 0 : Math.max(0, portfolioAccounts - allocatedAccounts);

    const totalAttempts = isBajajSample ? "173/35" : (portfolioAccounts > 0 ? `${portfolioAccounts * 2}/0` : "0/0");
    const callAttempts = isBajajSample ? "173/35" : (portfolioAccounts > 0 ? `${portfolioAccounts * 2}/0` : "0/0");
    const untouchedAccounts = isBajajSample ? "0/82" : `0/${portfolioAccounts}`;

    // Dispositions pool dynamic values
    const ncPercentage = isBajajSample ? "29.9%" : "0.0%";
    const ncAmt = isBajajSample ? "₹90.2 Lakh" : "₹0";

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
              { id: "field", label: "3. Field Dashboard" },
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* KPI Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Total Accounts</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {portfolioAccounts}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                  <span>Unsubscribed: <strong style={{ color: "#ffffff" }}>0</strong></span>
                  <span>•</span>
                  <span>0 Resolution</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Total Outstanding</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {portfolioOutstanding}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                  <span>Unsubscribed: <strong style={{ color: "#ffffff" }}>₹0</strong></span>
                  <span>•</span>
                  <span>0 Engagement</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Collectable Amount</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
                  {portfolioCollectable}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                  <span>Collected: <strong style={{ color: "#ffffff" }}>₹0</strong></span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Collection Realization</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#60a5fa", marginTop: "4px" }}>
                  {portfolioCollectedPct}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                  <span>Target: 18.5% recovery rate</span>
                </div>
              </div>
            </div>

            {/* Dispositions Pools: Positive Pool vs Difficult Pool */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Dispositions Breakdown
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                
                {/* Positive Pool */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(16, 185, 129, 0.04)",
                    border: "1px solid rgba(16, 185, 129, 0.2)"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Positive Pool
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: "10px", marginTop: "12px" }}>
                    {[
                      { label: "Paid", pct: "0.0%", amt: "₹0" },
                      { label: "PTP", pct: "0.0%", amt: "₹0" },
                      { label: "Callback", pct: "0.0%", amt: "₹0" },
                      { label: "Settlement", pct: "0.0%", amt: "₹0" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#020921",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          textAlign: "center"
                        }}
                      >
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{item.label}</span>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{item.pct}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficult Pool */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(245, 158, 11, 0.04)",
                    border: "1px solid rgba(245, 158, 11, 0.2)"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Difficult Pool
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "10px", marginTop: "12px" }}>
                    {[
                      { label: "Dispute", pct: "0.0%", amt: "₹0" },
                      { label: "NC (No Contact)", pct: ncPercentage, amt: ncAmt },
                      { label: "RTP (Refused)", pct: "0.0%", amt: "₹0" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#020921",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          textAlign: "center"
                        }}
                      >
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{item.label}</span>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{item.pct}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Allocated Count & Effort Metric */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              
              {/* Agent Allocated Count */}
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Agent Allocated Count
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Total Allocated Agents</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>
                      {totalAllocatedAgents}/{allocatedAccounts} Accounts
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Call Allocated Agents</span>
                    <span style={{ fontWeight: 700, color: "#60a5fa" }}>
                      {totalAllocatedAgents}/{allocatedAccounts} Accounts
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Field Allocated Agents</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>0/0 Accounts</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Unallocated Agents</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>
                      {unallocatedAccounts}/{portfolioAccounts} Accounts
                    </span>
                  </div>
                </div>
              </div>

              {/* Effort Metric */}
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Effort Metric
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Total Attempts</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>{totalAttempts}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Call Attempts</span>
                    <span style={{ fontWeight: 700, color: "#60a5fa" }}>{callAttempts}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Field Visits</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>0/0</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Digital Attempts</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>0/0</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>Untouched</span>
                    <span style={{ fontWeight: 700, color: "#f59e0b" }}>{untouchedAccounts}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── 2. CALL TAB CONTENT ── */}
        {detailTab === "call" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Top Bar with "Agent Monitoring" Button */}
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
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Overall Call Summary</h4>
              </div>
              <button
                onClick={onNavigateToCallMonitoring}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#1d4ed8",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <span>Call Agent Monitoring</span>
                <ExternalLink style={{ width: "14px", height: "14px" }} />
              </button>
            </div>

            {/* Call Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Total Accounts</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {portfolioAccounts}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
                  Unsubscribed: 0 • 0 Resolution
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Call Outstanding</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {portfolioOutstanding}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
                  Unsubscribed: ₹0 • 0 Engagement
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Collectable</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
                  {portfolioCollectable}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
                  Collected: ₹0
                </div>
              </div>
            </div>

            {/* Dispositions */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Dispositions</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(16, 185, 129, 0.04)",
                    border: "1px solid rgba(16, 185, 129, 0.2)"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>Positive Pool</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px", textAlign: "center", fontSize: "12px" }}>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>Paid</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>PTP</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>Callback</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>Settlement</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(245, 158, 11, 0.04)",
                    border: "1px solid rgba(245, 158, 11, 0.2)"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" }}>Difficult Pool</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px", textAlign: "center", fontSize: "12px" }}>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>Dispute</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>NC</span><div style={{ fontWeight: 700, color: "#ffffff" }}>{ncPercentage}</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>({ncAmt})</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "11px" }}>RTP</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Allocated Count & Effort Metric */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "12px"
                }}
              >
                <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Agent Allocated Count</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#020921" }}>
                  <span style={{ color: "#94a3b8" }}>Call Allocated Agents</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>{totalAllocatedAgents}/{allocatedAccounts} Accounts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#020921" }}>
                  <span style={{ color: "#94a3b8" }}>Unallocated Agents</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>{unallocatedAccounts}/{portfolioAccounts} Accounts</span>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "12px"
                }}
              >
                <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Effort Metric</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#020921" }}>
                  <span style={{ color: "#94a3b8" }}>Total Attempts</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>{totalAttempts}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#020921" }}>
                  <span style={{ color: "#94a3b8" }}>Call Attempts</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>{callAttempts}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#020921" }}>
                  <span style={{ color: "#94a3b8" }}>Untouched</span>
                  <span style={{ fontWeight: 700, color: "#f59e0b" }}>{untouchedAccounts}</span>
                </div>
              </div>
            </div>

            {/* Agent Summary: Agents List Table */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Agent Summary</h4>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#020921", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "12px 14px" }}>Agent</th>
                      <th style={{ padding: "12px 14px" }}>Team Leader</th>
                      <th style={{ padding: "12px 14px" }}>Total Calls</th>
                      <th style={{ padding: "12px 14px" }}>Total Connected Call</th>
                      <th style={{ padding: "12px 14px" }}>Total Non Connected Call</th>
                      <th style={{ padding: "12px 14px" }}>Login Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isBajajSample ? (
                      <>
                        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#ffffff" }}>Manisha Shete</td>
                          <td style={{ padding: "12px 14px", color: "#94a3b8" }}>Priya Talekar</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#ffffff" }}>133</td>
                          <td style={{ padding: "12px 14px", color: "#34d399", fontWeight: 700 }}>83</td>
                          <td style={{ padding: "12px 14px", color: "#fb7185", fontWeight: 700 }}>50</td>
                          <td style={{ padding: "12px 14px", color: "#94a3b8", fontFamily: "monospace" }}>08:59:15</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#ffffff" }}>Priya Talekar</td>
                          <td style={{ padding: "12px 14px", color: "#94a3b8" }}>Priya Talekar</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#ffffff" }}>52</td>
                          <td style={{ padding: "12px 14px", color: "#34d399", fontWeight: 700 }}>26</td>
                          <td style={{ padding: "12px 14px", color: "#fb7185", fontWeight: 700 }}>26</td>
                          <td style={{ padding: "12px 14px", color: "#94a3b8", fontFamily: "monospace" }}>08:55:14</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                          No calling agent activity recorded for this portfolio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── 3. FIELD TAB CONTENT ── */}
        {detailTab === "field" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Overall Field Summary */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Overall Field Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", fontSize: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Total Accounts</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>0</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Unsubscribed: 0 • 0 Resolution</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Field Outstanding</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>₹0</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Unsubscribed: ₹0 • 0 Engagement</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Collectable</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>₹0</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Collected: ₹0</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Collections %</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>0.00%</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Target: ₹0</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "11px", paddingTop: "8px" }}>
                <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)", color: "#94a3b8" }}>
                  Assigned Vs Unassigned: <strong style={{ color: "#ffffff" }}>0 Total Accounts</strong>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)", color: "#94a3b8" }}>
                  Visited Vs Non Visited: <strong style={{ color: "#ffffff" }}>0 Total Accounts</strong>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)", color: "#94a3b8" }}>
                  Total Visits: <strong style={{ color: "#ffffff" }}>0</strong>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)", color: "#94a3b8" }}>
                  Unique Visits: <strong style={{ color: "#ffffff" }}>0</strong>
                </div>
              </div>
            </div>

            {/* Agent Wise Reports Table */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Agent Wise Report</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Search account number..."
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                  <select
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  >
                    <option style={{ backgroundColor: "#041030", color: "#ffffff" }}>Sort By: Agent Name</option>
                    <option style={{ backgroundColor: "#041030", color: "#ffffff" }}>Sort By: Collection%</option>
                  </select>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#020921", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "10px 12px" }}>Agent Name</th>
                      <th style={{ padding: "10px 12px" }}>Yucollect ID</th>
                      <th style={{ padding: "10px 12px" }}>Amount Allocated</th>
                      <th style={{ padding: "10px 12px" }}>Amount Collected</th>
                      <th style={{ padding: "10px 12px" }}>Collection%</th>
                      <th style={{ padding: "10px 12px" }}>Allocation Count</th>
                      <th style={{ padding: "10px 12px" }}>Total Visits</th>
                      <th style={{ padding: "10px 12px" }}>Unique Visits</th>
                      <th style={{ padding: "10px 12px" }}>DRR (Visit/Day)</th>
                      <th style={{ padding: "10px 12px" }}>Intensity</th>
                      <th style={{ padding: "10px 12px" }}>Dispositions Form Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} style={{ padding: "28px", textAlign: "center", color: "#94a3b8" }}>
                        No field recovery records allocated for this portfolio.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Day Wise Visit Report */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Day Wise Visit Report</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Search by Agent name..."
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                  <select
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  >
                    <option style={{ backgroundColor: "#041030", color: "#ffffff" }}>Sort By: Date</option>
                  </select>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#020921", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "10px 12px" }}>Agent Name</th>
                      <th style={{ padding: "10px 12px" }}>YuCollect ID</th>
                      <th style={{ padding: "10px 12px" }}>Disposition</th>
                      <th style={{ padding: "10px 12px" }}>Sub Disposition</th>
                      <th style={{ padding: "10px 12px" }}>Disposition Date</th>
                      <th style={{ padding: "10px 12px" }}>Disposition Time</th>
                      <th style={{ padding: "10px 12px" }}>Distance from address</th>
                      <th style={{ padding: "10px 12px" }}>Borrower Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={8} style={{ padding: "28px", textAlign: "center", color: "#94a3b8" }}>
                        No visit activity logged for today.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom 2 Field Tables: Agents with Visit% <70 & Agents with Collection% <20 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Agents with Visit% &lt; 70</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#020921", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <th style={{ padding: "8px 10px" }}>Agent Name</th>
                        <th style={{ padding: "8px 10px" }}>Yucollect ID</th>
                        <th style={{ padding: "8px 10px" }}>Visit %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                          No underperforming field agents recorded.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#041030",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Agents with Collection% &lt; 20</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#020921", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <th style={{ padding: "8px 10px" }}>Agent Name</th>
                        <th style={{ padding: "8px 10px" }}>Yucollect ID</th>
                        <th style={{ padding: "8px 10px" }}>Collection%</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Overall Digital Summary */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Overall Digital Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", fontSize: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Total Accounts</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>0</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Unsubscribed: 0 • 0 Engagement</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Outstanding</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>₹0</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Unsubscribed: ₹0 • 0 Engagement</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Collectable</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>₹0</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <span style={{ color: "#94a3b8" }}>Collected</span>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>₹0</div>
                </div>
              </div>
            </div>

            {/* Digital Engagement Summary (SMS, IVR, BOT) */}
            <div
              style={{
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Digital Engagement Summary</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px", backgroundColor: "#020921", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  {["sms", "ivr", "bot"].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setDigitalSubTab(sub)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor: digitalSubTab === sub ? "#1d4ed8" : "transparent",
                        color: digitalSubTab === sub ? "#ffffff" : "#94a3b8",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choose Plan & Metrics */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Choose Plan: 7 day high intensity</span>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Start Date: <strong style={{ color: "#ffffff" }}>2026-11-18</strong> | End Date: <strong style={{ color: "#ffffff" }}>2026-11-25</strong></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px", fontSize: "12px", paddingTop: "6px" }}>
                  {[
                    { label: "Contacted", val: "N/A" },
                    { label: "Total Attempts", val: "N/A" },
                    { label: "Total Intensity", val: "N/A" },
                    { label: "Avg Intensity", val: "N/A" },
                    { label: "Total Accounts", val: "N/A" }
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "#041030",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        textAlign: "center"
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{m.label}</span>
                      <div style={{ fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispositions */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", fontSize: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <span style={{ fontWeight: 700, color: "#34d399", textTransform: "uppercase", fontSize: "11px" }}>Positive Pool</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "8px", textAlign: "center" }}>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>Paid</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>PTP</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>Callback</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>Settlement</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                  </div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", backgroundColor: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <span style={{ fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", fontSize: "11px" }}>Difficult Pool</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "8px", textAlign: "center" }}>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>Dispute</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>NC</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                    <div><span style={{ color: "#94a3b8", fontSize: "10px" }}>RTP</span><div style={{ fontWeight: 700, color: "#ffffff" }}>0.0%</div><span style={{ fontSize: "10px", color: "#94a3b8" }}>(₹0)</span></div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", fontSize: "12px" }}>
                <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Engagement by Accounts</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>0</span>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.04)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Engagement by Outstanding</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>₹0</span>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <span>All Portfolios</span>
          </h2>

          {/* Quick Allocator Selector */}
          <select
            value={selectedAllocatorId}
            onChange={(e) => setSelectedAllocatorId(e.target.value)}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              color: "#60a5fa",
              border: "1px solid rgba(37, 99, 235, 0.4)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all" style={{ backgroundColor: "#041030", color: "#ffffff" }}>
              All Allocators ({portfolios.length})
            </option>
            {allocators.map((alloc) => {
              const count = portfolios.filter(p => p.allocatorId === alloc.id).length;
              return (
                <option key={alloc.id} value={alloc.id} style={{ backgroundColor: "#041030", color: "#ffffff" }}>
                  {alloc.name} ({count})
                </option>
              );
            })}
          </select>

          {/* Quick Allocation Selection Dropdown */}
          <select
            value={selectedAssignAllocId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedAssignAllocId(val);
              if (val) {
                handleAssignAllocation(val);
              }
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              color: "#cbd5e1",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
              maxWidth: "260px"
            }}
          >
            <option value="" style={{ backgroundColor: "#041030", color: "#94a3b8" }}>
              Select Allocation...
            </option>
            {allAvailableAllocations.map((alloc) => (
              <option key={alloc.id} value={alloc.id} style={{ backgroundColor: "#041030", color: "#ffffff" }}>
                {alloc.name}
              </option>
            ))}
          </select>
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

      {/* ── 2. ISOLATED PORTFOLIO BOXES GRID ── */}
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

              {/* Bottom Action: One View Button */}
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPortfolioId(item.id);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(29, 78, 216, 0.3)",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }}
                >
                  <Eye style={{ width: "14px", height: "14px" }} />
                  <span>One View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "40px 24px",
            borderRadius: "16px",
            backgroundColor: "#041030",
            border: "1px dashed rgba(255, 255, 255, 0.15)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px"
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
            No Allocations for {selectedAllocator?.name || "this allocator"}
          </h3>

          <div
            style={{
              marginTop: "8px",
              width: "100%",
              maxWidth: "460px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center"
            }}
          >
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>
                Select Existing Allocation
              </label>
              <select
                value={selectedAssignAllocId}
                onChange={(e) => {
                  const allocId = e.target.value;
                  setSelectedAssignAllocId(allocId);
                  if (allocId) {
                    handleAssignAllocation(allocId);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 500,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="" style={{ backgroundColor: "#041030", color: "#94a3b8" }}>
                  -- Select Allocation to View / Assign --
                </option>
                {allAvailableAllocations.map((alloc) => (
                  <option key={alloc.id} value={alloc.id} style={{ backgroundColor: "#041030", color: "#ffffff" }}>
                    {alloc.name} ({alloc.accounts} accounts • {alloc.outstanding})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "center", flexWrap: "wrap", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  if (selectedAssignAllocId) {
                    handleAssignAllocation(selectedAssignAllocId);
                  }
                }}
                disabled={!selectedAssignAllocId}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  backgroundColor: selectedAssignAllocId ? "#1d4ed8" : "rgba(255, 255, 255, 0.1)",
                  color: selectedAssignAllocId ? "#ffffff" : "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "none",
                  cursor: selectedAssignAllocId ? "pointer" : "not-allowed",
                  boxShadow: selectedAssignAllocId ? "0 2px 6px rgba(29, 78, 216, 0.4)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                Assign &amp; Show Allocation
              </button>

              <button
                type="button"
                onClick={() => setSelectedAllocatorId("all")}
                style={{
                  padding: "9px 16px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                Show All System Allocations
              </button>

              {onNavigateToAllocation && (
                <button
                  type="button"
                  onClick={onNavigateToAllocation}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#cbd5e1",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  Upload New File
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
