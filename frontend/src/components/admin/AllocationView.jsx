import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  MoreVertical,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  UserPlus,
  Eye,
  X,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Clock,
  History,
  FileCheck,
  ChevronDown
} from "lucide-react";

export default function AllocationView({
  onOpenPortfolioDashboard,
  selectedAllocatorId = "alloc_bajaj",
  allocators = []
}) {
  // Main view state: 'list' | 'upload' | 'history'
  const [currentView, setCurrentView] = useState("list");

  // Filter pills state
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Three dots menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals state
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [showAddAccountsModal, setShowAddAccountsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetAllocation, setTargetAllocation] = useState(null);

  // Upload form state
  const [selectedProduct, setSelectedProduct] = useState("Personal Loan");
  const [selectedBucket, setSelectedBucket] = useState("Writeoff");
  const [tosAmount, setTosAmount] = useState("");
  const [startDate, setStartDate] = useState("2026-11-18");
  const [endDate, setEndDate] = useState("2026-12-06");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const fileInputRef = useRef(null);

  // 15 Products requested by user
  const PRODUCTS = [
    "Agri Loan",
    "Auto Loan",
    "Business Loan",
    "CASA",
    "Commercial Business",
    "Commercial Vehicle",
    "Credit Card",
    "Gold Loan",
    "Home Loan",
    "Mortgage",
    "Personal Loan",
    "Tractor",
    "Two Wheeler",
    "Consumer Durable"
  ];

  // 16 Buckets requested by user
  const BUCKETS = [
    "Post Due",
    "Pre Due",
    "Bucket 1",
    "Bucket 2",
    "Bucket 3",
    "Bucket 4",
    "Bucket 5",
    "Bucket 6",
    "Sup",
    "NPA",
    "NILPOS",
    "PDM",
    "Live",
    "Recovery",
    "ODBC",
    "Writeoff"
  ];

  // Initial allocations list scoped by institutional allocator
  const [allocations, setAllocations] = useState([
    // ── 1. BAJAJ FINSERVE ALLOCATIONS (4 EXACT ALLOCATIONS) ──
    {
      id: "bajaj_nov_18",
      allocatorId: "alloc_bajaj",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 117,
      collectable: "₹2.81 Cr",
      outstanding: "₹4.74 Cr",
      status: "Partially Allocated",
      statusType: "partially",
      duration: "Ends in 18 days",
      uploadedOn: "2026-11-18 16:32"
    },
    {
      id: "bajaj_nov_13",
      allocatorId: "alloc_bajaj",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-13_10:13",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 117,
      collectable: "₹2.81 Cr",
      outstanding: "₹4.74 Cr",
      status: "100% Allocated",
      statusType: "100",
      duration: "Ends in 18 days",
      uploadedOn: "2026-11-13 10:13"
    },
    {
      id: "bajaj_nov_04_13",
      allocatorId: "alloc_bajaj",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_13:45",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 293,
      collectable: "₹3.85 Cr",
      outstanding: "₹6.11 Cr",
      status: "100% Allocated",
      statusType: "100",
      duration: "Ends in 18 days",
      uploadedOn: "2026-11-04 13:45"
    },
    {
      id: "bajaj_nov_04_11",
      allocatorId: "alloc_bajaj",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_11:31",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 4,
      collectable: "₹14.20 Lakh",
      outstanding: "₹22.08 Lakh",
      status: "Closed",
      statusType: "closed",
      duration: "Expired",
      uploadedOn: "2026-11-04 11:31"
    },
    // ── 2. PUNEWALA ALLOCATIONS (ISOLATED TO PUNEWALA) ──
    {
      id: "punewala_nov_16",
      allocatorId: "alloc_punewala",
      name: "PUNEWALA_Personal Loan_Writeoff_2026-11-16_14:20",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 85,
      collectable: "₹1.55 Cr",
      outstanding: "₹2.40 Cr",
      status: "100% Allocated",
      statusType: "100",
      duration: "Ends in 22 days",
      uploadedOn: "2026-11-16 14:20"
    },
    {
      id: "punewala_nov_10",
      allocatorId: "alloc_punewala",
      name: "PUNEWALA_Business Loan_Writeoff_2026-11-10_11:15",
      product: "Business Loan",
      bucket: "Writeoff",
      accounts: 64,
      collectable: "₹1.10 Cr",
      outstanding: "₹1.85 Cr",
      status: "Partially Allocated",
      statusType: "partially",
      duration: "Ends in 14 days",
      uploadedOn: "2026-11-10 11:15"
    }
  ]);

  // Upload History Logs
  const [historyLogs, setHistoryLogs] = useState([
    {
      fileName: "BAJAJ_FINSERVE_PL_Writeoff_18Nov.xlsx",
      uploadedBy: "Priya Talekar",
      records: 117,
      dateTime: "2026-11-18 16:32:00",
      status: "Ingested (100%)",
      statusClass: "text-emerald-500"
    },
    {
      fileName: "BAJAJ_FINSERVE_PL_13Nov_Batch.xlsx",
      uploadedBy: "Priya Talekar",
      records: 117,
      dateTime: "2026-11-13 10:13:00",
      status: "Ingested (100%)",
      statusClass: "text-emerald-500"
    },
    {
      fileName: "URBAN_BAJAJ_NOV_04_WRITE_OFF.csv",
      uploadedBy: "Priya Talekar",
      records: 293,
      dateTime: "2026-11-04 13:45:00",
      status: "Ingested (100%)",
      statusClass: "text-emerald-500"
    },
    {
      fileName: "BAJAJ_SAMPLE_4ACCOUNTS.csv",
      uploadedBy: "Priya Talekar",
      records: 4,
      dateTime: "2026-11-04 11:31:00",
      status: "Closed (Expired)",
      statusClass: "text-muted-foreground"
    }
  ]);

  // Download Sample Allocation File
  const handleDownloadSample = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Account_Number,Borrower_Name,Phone_Number,Outstanding_Amount,Product,Bucket,Area,Base_Pincode\n" +
      "1002345678,Ramesh Sharma,9876543210,125000,Personal Loan,Writeoff,Pune,400063\n" +
      "1002345679,Pooja Verma,9876543211,85000,Auto Loan,Bucket 3,Mumbai,400001\n" +
      "1002345680,Amol Barangule,9876543212,289000,Consumer Durable,Writeoff,Nashik,422001\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "PayMagic_Sample_Allocation_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Upload Submission
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!tosAmount && !selectedFile) {
      setUploadMessage({ type: "error", text: "Please enter Outstanding (TOS) and attach an allocation file." });
      return;
    }
    const activeAllocObj = allocators.find((a) => a.id === selectedAllocatorId) || { name: "BAJAJ FINSERVE", code: "BAJAJ" };
    const prefix = (activeAllocObj.code || activeAllocObj.name || "BAJAJ").toUpperCase().replace(/\s+/g, "_");
    const newName = `${prefix}_${selectedProduct}_${selectedBucket}_${new Date().toISOString().slice(0, 10)}`;
    const newAlloc = {
      id: `alloc_${Date.now()}`,
      allocatorId: selectedAllocatorId,
      name: newName,
      product: selectedProduct,
      bucket: selectedBucket,
      accounts: 15,
      collectable: "₹18.50 Lakh",
      outstanding: tosAmount || "₹25.00 Lakh",
      status: "Unallocated",
      statusType: "unallocated",
      duration: "Ends in 30 days",
      uploadedOn: new Date().toISOString().slice(0, 16).replace("T", " ")
    };
    setAllocations([newAlloc, ...allocations]);
    setHistoryLogs([
      {
        fileName: selectedFile ? selectedFile.name : `${newName}.csv`,
        uploadedBy: "Priya Talekar",
        records: 15,
        dateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
        status: "Ingested (100%)",
        statusClass: "text-emerald-500"
      },
      ...historyLogs
    ]);
    setUploadMessage({ type: "success", text: "Allocation file uploaded and queued for channel assignment!" });
    setTimeout(() => {
      setUploadMessage(null);
      setCurrentView("list");
    }, 1500);
  };

  // Filter allocations scoped to selected allocator
  const scopedAllocations = allocations.filter(
    (item) => !item.allocatorId || item.allocatorId === selectedAllocatorId
  );

  const filteredAllocations = scopedAllocations.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unallocated" && item.statusType === "unallocated") ||
      (activeFilter === "100" && item.statusType === "100") ||
      (activeFilter === "partially" && item.statusType === "partially") ||
      (activeFilter === "expiring" && item.statusType === "expiring") ||
      (activeFilter === "closed" && item.statusType === "closed");

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bucket.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div
      className="allocation-page"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "transparent",
        color: "#f8fafc",
        width: "100%"
      }}
    >

      {/* ── UNIFIED ALLOCATION MANAGEMENT HEADER ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingTop: "4px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "12px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
            Allocation Management
          </h1>
        </div>

        {/* Sub-navigation tabs: Allocation List | Upload New File | Upload History */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
          <button
            onClick={() => setCurrentView("list")}
            style={{
              fontSize: "12px",
              fontWeight: currentView === "list" ? 700 : 500,
              color: currentView === "list" ? "#ffffff" : "#94a3b8",
              borderBottom: currentView === "list" ? "2px solid #ffffff" : "2px solid transparent",
              paddingBottom: "2px",
              background: "none",
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Allocation List
          </button>
          <button
            onClick={() => setCurrentView("upload")}
            style={{
              fontSize: "12px",
              fontWeight: currentView === "upload" ? 700 : 500,
              color: currentView === "upload" ? "#ffffff" : "#94a3b8",
              borderBottom: currentView === "upload" ? "2px solid #ffffff" : "2px solid transparent",
              paddingBottom: "2px",
              background: "none",
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Upload New File
          </button>
          <button
            onClick={() => setCurrentView("history")}
            style={{
              fontSize: "12px",
              fontWeight: currentView === "history" ? 700 : 500,
              color: currentView === "history" ? "#ffffff" : "#94a3b8",
              borderBottom: currentView === "history" ? "2px solid #ffffff" : "2px solid transparent",
              paddingBottom: "2px",
              background: "none",
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Upload History
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. ALLOCATION LIST VIEW (MATCHES REFERENCE SCREENSHOT 100%)
      ───────────────────────────────────────────────────────────── */}
      {currentView === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Filter Pills Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              paddingTop: "4px",
              paddingBottom: "4px",
              fontSize: "12px"
            }}
          >
            <button
              onClick={() => setActiveFilter("all")}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "12px",
                fontWeight: activeFilter === "all" ? 600 : 500,
                backgroundColor: activeFilter === "all" ? "#1d4ed8" : "#0a1535",
                color: activeFilter === "all" ? "#ffffff" : "#cbd5e1",
                border: activeFilter === "all" ? "1px solid #1d4ed8" : "1px solid rgba(51, 65, 85, 0.6)",
                boxShadow: activeFilter === "all" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              All Allocations ({scopedAllocations.length})
            </button>
            <button
              onClick={() => setActiveFilter("unallocated")}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "12px",
                fontWeight: activeFilter === "unallocated" ? 600 : 500,
                backgroundColor: activeFilter === "unallocated" ? "#1d4ed8" : "#0a1535",
                color: activeFilter === "unallocated" ? "#ffffff" : "#cbd5e1",
                border: activeFilter === "unallocated" ? "1px solid #1d4ed8" : "1px solid rgba(51, 65, 85, 0.6)",
                boxShadow: activeFilter === "unallocated" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Unallocated ({scopedAllocations.filter((a) => a.statusType === "unallocated").length})
            </button>
            <button
              onClick={() => setActiveFilter("100")}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "12px",
                fontWeight: activeFilter === "100" ? 600 : 500,
                backgroundColor: activeFilter === "100" ? "#1d4ed8" : "#0a1535",
                color: activeFilter === "100" ? "#ffffff" : "#cbd5e1",
                border: activeFilter === "100" ? "1px solid #1d4ed8" : "1px solid rgba(51, 65, 85, 0.6)",
                boxShadow: activeFilter === "100" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              100% Allocated ({scopedAllocations.filter((a) => a.statusType === "100").length})
            </button>
            <button
              onClick={() => setActiveFilter("partially")}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "12px",
                fontWeight: activeFilter === "partially" ? 600 : 500,
                backgroundColor: activeFilter === "partially" ? "#1d4ed8" : "#0a1535",
                color: activeFilter === "partially" ? "#ffffff" : "#cbd5e1",
                border: activeFilter === "partially" ? "1px solid #1d4ed8" : "1px solid rgba(51, 65, 85, 0.6)",
                boxShadow: activeFilter === "partially" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Partially Allocated ({scopedAllocations.filter((a) => a.statusType === "partially").length})
            </button>
            <button
              onClick={() => setActiveFilter("expiring")}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "12px",
                fontWeight: activeFilter === "expiring" ? 600 : 500,
                backgroundColor: activeFilter === "expiring" ? "#1d4ed8" : "#0a1535",
                color: activeFilter === "expiring" ? "#ffffff" : "#cbd5e1",
                border: activeFilter === "expiring" ? "1px solid #1d4ed8" : "1px solid rgba(51, 65, 85, 0.6)",
                boxShadow: activeFilter === "expiring" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Expiring in 5 days ({scopedAllocations.filter((a) => a.statusType === "expiring").length})
            </button>
            <button
              onClick={() => setActiveFilter("closed")}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "12px",
                fontWeight: activeFilter === "closed" ? 600 : 500,
                backgroundColor: activeFilter === "closed" ? "#1d4ed8" : "#0a1535",
                color: activeFilter === "closed" ? "#ffffff" : "#cbd5e1",
                border: activeFilter === "closed" ? "1px solid #1d4ed8" : "1px solid rgba(51, 65, 85, 0.6)",
                boxShadow: activeFilter === "closed" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Closed ({allocations.filter((a) => a.statusType === "closed").length})
            </button>
          </div>

          {/* Allocation Table - Direct on canvas matching screenshot */}
          <div style={{ width: "100%", overflowX: "auto", paddingTop: "4px" }}>
            <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
              <thead style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <tr>
                  <th style={{ padding: "12px 16px 12px 4px" }}>ALLOCATION NAME</th>
                  <th style={{ padding: "12px 16px" }}>PRODUCT</th>
                  <th style={{ padding: "12px 16px" }}>BUCKET</th>
                  <th style={{ padding: "12px 16px" }}>TOTAL ACCOUNTS</th>
                  <th style={{ padding: "12px 16px" }}>COLLECTABLE</th>
                  <th style={{ padding: "12px 16px" }}>OUTSTANDING</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 4px 12px 16px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td style={{ padding: "14px 16px 14px 4px", fontWeight: 600, color: "#ffffff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileSpreadsheet style={{ width: "16px", height: "16px", color: "#3b82f6", flexShrink: 0 }} />
                        <span style={{ maxWidth: "480px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px", color: "#cbd5e1" }}>{item.product}</td>

                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontWeight: 700, color: "#f59e0b" }}>
                        {item.bucket}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>{item.accounts}</td>

                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>{item.collectable}</td>

                    <td style={{ padding: "14px 16px", color: "#94a3b8", fontWeight: 400 }}>{item.outstanding}</td>

                    <td style={{ padding: "14px 16px", color: "#cbd5e1" }}>{item.status}</td>

                    <td style={{ padding: "14px 4px 14px 16px", textAlign: "right", position: "relative" }}>
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        style={{
                          padding: "4px",
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer"
                        }}
                        title="Actions"
                      >
                        <MoreVertical style={{ width: "16px", height: "16px" }} />
                      </button>

                      {/* Three-dot dropdown menu */}
                      {activeMenuId === item.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            marginTop: "4px",
                            width: "208px",
                            borderRadius: "12px",
                            backgroundColor: "#051336",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            padding: "6px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                            zIndex: 50,
                            textAlign: "left"
                          }}
                          onClick={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => onOpenPortfolioDashboard && onOpenPortfolioDashboard(item.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#e2e8f0",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <Eye style={{ width: "14px", height: "14px", color: "#60a5fa" }} />
                            <span>View Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetAllocation(item);
                              setShowAddAccountsModal(true);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#e2e8f0",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <Plus style={{ width: "14px", height: "14px", color: "#34d399" }} />
                            <span>Add Accounts</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetAllocation(item);
                              setShowUnsubscribeModal(true);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#e2e8f0",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <X style={{ width: "14px", height: "14px", color: "#fbbf24" }} />
                            <span>Unsubscribe Accounts</span>
                          </button>

                          <button
                            onClick={handleDownloadSample}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#e2e8f0",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <Download style={{ width: "14px", height: "14px", color: "#60a5fa" }} />
                            <span>Download Allocation</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetAllocation(item);
                              setShowDeleteModal(true);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#f87171",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <Trash2 style={{ width: "14px", height: "14px", color: "#f87171" }} />
                            <span>Delete Allocation</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. UPLOAD NEW FILE VIEW
      ───────────────────────────────────────────────────────────── */}
      {currentView === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "8px" }}>
          
          {/* Form Card */}
          <form
            onSubmit={handleUploadSubmit}
            style={{
              padding: "24px",
              borderRadius: "16px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
            }}
          >
            
            {/* Drag & Drop File Zone */}
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                border: "2px dashed rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                transition: "all 0.15s ease"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,.xlsb,.csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: "none" }}
              />
              <UploadCloud style={{ width: "48px", height: "48px", margin: "0 auto 8px auto", color: "#60a5fa" }} />
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>
                {selectedFile ? selectedFile.name : "Drag & drop files or Browse"}
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                Supported formats: <strong style={{ color: "#e2e8f0" }}>.xls, .xlsx, .xlsb, .csv</strong>
              </p>
            </div>

            {/* Inputs Grid: Product, Bucket, Outstanding (TOS), Duration */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              
              {/* Product: 15 exact products */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Product:</span>
                  <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    backgroundColor: "#0a1639",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                    color: "#ffffff",
                    outline: "none",
                    cursor: "pointer"
                  }}
                  required
                >
                  {PRODUCTS.map((prod) => (
                    <option key={prod} value={prod} style={{ backgroundColor: "#051336", color: "#ffffff" }}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* Bucket: 16 exact buckets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Bucket:</span>
                  <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    backgroundColor: "#0a1639",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                    color: "#ffffff",
                    outline: "none",
                    cursor: "pointer"
                  }}
                  required
                >
                  {BUCKETS.map((b) => (
                    <option key={b} value={b} style={{ backgroundColor: "#051336", color: "#ffffff" }}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Outstanding: * TOS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Outstanding:</span>
                  <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="TOS (e.g. ₹4.74 Cr)"
                  value={tosAmount}
                  onChange={(e) => setTosAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    backgroundColor: "#0a1639",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                    color: "#ffffff",
                    outline: "none"
                  }}
                  required
                />
              </div>

              {/* Duration: Start date, End date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Duration:</span>
                  <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "12px",
                      backgroundColor: "#0a1639",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                    required
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "12px",
                      backgroundColor: "#0a1639",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none"
                    }}
                    required
                  />
                </div>
              </div>

            </div>

            {/* Template Download & Upload / Proceed Buttons */}
            <div
              style={{
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#60a5fa",
                    backgroundColor: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                >
                  <Download style={{ width: "14px", height: "14px" }} />
                  <span>Download Sample Allocation File</span>
                </button>
              </div>

              <button
                type="submit"
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)"
                }}
              >
                Upload &amp; Proceed
              </button>
            </div>

            {uploadMessage && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: uploadMessage.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: uploadMessage.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                  color: uploadMessage.type === "success" ? "#34d399" : "#fb7185"
                }}
              >
                <CheckCircle2 style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span>{uploadMessage.text}</span>
              </div>
            )}

          </form>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. UPLOAD HISTORY VIEW
      ───────────────────────────────────────────────────────────── */}
      {currentView === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "8px" }}>
          
          {/* History Table */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Processed Allocation Batches</h3>
            
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
                <thead style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", fontSize: "11px" }}>
                  <tr>
                    <th style={{ padding: "12px" }}>File Name</th>
                    <th style={{ padding: "12px" }}>Uploaded By</th>
                    <th style={{ padding: "12px" }}>Records Ingested</th>
                    <th style={{ padding: "12px" }}>Date &amp; Time</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Ingestion Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLogs.map((log, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <td style={{ padding: "12px", fontWeight: 600, color: "#ffffff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FileSpreadsheet style={{ width: "16px", height: "16px", color: "#3b82f6", flexShrink: 0 }} />
                          <span>{log.fileName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "#cbd5e1" }}>{log.uploadedBy}</td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>{log.records} accounts</td>
                      <td style={{ padding: "12px", fontFamily: "monospace", color: "#94a3b8" }}>{log.dateTime}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#34d399" }}>
                        {log.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS: UNSUBSCRIBE, ADD ACCOUNTS, DELETE ALLOCATION
      ───────────────────────────────────────────────────────────── */}

      {/* Unsubscribe Accounts Modal */}
      {showUnsubscribeModal && targetAllocation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
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
              maxWidth: "448px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff", margin: 0 }}>Unsubscribe Accounts</h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "4px 0 0 0" }}>
                  {targetAllocation.name}
                </p>
              </div>
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                style={{ padding: "4px", borderRadius: "8px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>
              Upload account list to instantly pause recovery contacts and mark institutional resolution.
            </p>

            <div
              style={{
                border: "1px dashed rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                cursor: "pointer"
              }}
            >
              <UploadCloud style={{ width: "32px", height: "32px", margin: "0 auto 4px auto", color: "#60a5fa" }} />
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>Drag &amp; drop accounts file or browse</div>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Supported: .csv, .xlsx</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#cbd5e1",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#2563eb",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
                  cursor: "pointer"
                }}
              >
                Process Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Accounts Modal (Upload New Allocation File) */}
      {showAddAccountsModal && targetAllocation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
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
              maxWidth: "448px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff", margin: 0 }}>Upload New Allocation File</h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "4px 0 0 0" }}>
                  {targetAllocation.name}
                </p>
              </div>
              <button
                onClick={() => setShowAddAccountsModal(false)}
                style={{ padding: "4px", borderRadius: "8px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>
              Append new debtor cases into this existing institutional portfolio bucket.
            </p>

            <div
              style={{
                border: "1px dashed rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                cursor: "pointer"
              }}
            >
              <UploadCloud style={{ width: "32px", height: "32px", margin: "0 auto 4px auto", color: "#34d399" }} />
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>Drop .csv, .xlsx to append accounts</div>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Accounts auto-deduplicated</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
              <button
                onClick={() => setShowAddAccountsModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#cbd5e1",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddAccountsModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#059669",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)",
                  cursor: "pointer"
                }}
              >
                Upload &amp; Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Allocation Confirmation Modal */}
      {showDeleteModal && targetAllocation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
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
              maxWidth: "384px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontWeight: 700, fontSize: "16px" }}>
              <Trash2 style={{ width: "20px", height: "20px" }} />
              <span>Confirm Portfolio Deletion</span>
            </div>

            <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to delete <strong style={{ color: "#ffffff" }}>{targetAllocation.name}</strong>? This will unlink active dials and ground tasks permanently.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#cbd5e1",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAllocations(allocations.filter((a) => a.id !== targetAllocation.id));
                  setShowDeleteModal(false);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#e11d48",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(225, 29, 72, 0.2)",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
