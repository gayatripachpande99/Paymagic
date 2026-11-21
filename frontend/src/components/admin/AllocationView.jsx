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

export default function AllocationView({ onOpenPortfolioDashboard }) {
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

  // Initial allocations list
  const [allocations, setAllocations] = useState([
    {
      id: "bajaj_nov_18",
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
    const newName = `BAJAJ FINSERVE_${selectedProduct}_${selectedBucket}_${new Date().toISOString().slice(0, 10)}`;
    const newAlloc = {
      id: `alloc_${Date.now()}`,
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

  // Filter allocations
  const filteredAllocations = allocations.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unallocated" && item.statusType === "unallocated") ||
      (activeFilter === "100" && item.statusType === "100") ||
      (activeFilter === "partially" && item.statusType === "partially") ||
      (activeFilter === "closed" && item.statusType === "closed");

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bucket.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="allocation-page space-y-6 animate-in fade-in duration-200">

      {/* ─────────────────────────────────────────────────────────────
          1. ALLOCATION LIST VIEW
      ───────────────────────────────────────────────────────────── */}
      {currentView === "list" && (
        <div className="space-y-6">
          
          {/* Top Header Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Allocation list</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                The Allocation Summary gives you a complete view of all allocations, and shows how files are performing across channels.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setCurrentView("upload")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload New File</span>
              </button>

              <button
                onClick={() => setCurrentView("history")}
                className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center gap-1.5 border border-border transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-blue-500" />
                <span>Upload History</span>
              </button>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              All Allocations ({allocations.length})
            </button>
            <button
              onClick={() => setActiveFilter("unallocated")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "unallocated"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Unallocated ({allocations.filter((a) => a.statusType === "unallocated").length})
            </button>
            <button
              onClick={() => setActiveFilter("100")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "100"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              100% Allocated ({allocations.filter((a) => a.statusType === "100").length})
            </button>
            <button
              onClick={() => setActiveFilter("partially")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "partially"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Partially Allocated ({allocations.filter((a) => a.statusType === "partially").length})
            </button>
            <button
              onClick={() => setActiveFilter("expiring")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "expiring"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Expiring in 5 days (0)
            </button>
            <button
              onClick={() => setActiveFilter("closed")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "closed"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Closed ({allocations.filter((a) => a.statusType === "closed").length})
            </button>
          </div>

          {/* Allocation Table Section */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
            
            {/* Table Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Active Loan Portfolios</h3>
                <p className="text-xs text-muted-foreground">Showing {filteredAllocations.length} records</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by allocation name, product, bucket..."
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-lg">Allocation Name</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Bucket</th>
                    <th className="p-3">Total Accounts</th>
                    <th className="p-3">Collectable</th>
                    <th className="p-3">Outstanding</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAllocations.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-sm" title={item.name}>{item.name}</span>
                      </td>

                      <td className="p-3 text-muted-foreground">{item.product}</td>

                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {item.bucket}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-foreground">{item.accounts} accounts</td>

                      <td className="p-3 font-bold text-emerald-500">{item.collectable}</td>

                      <td className="p-3 font-mono font-semibold text-muted-foreground">{item.outstanding}</td>

                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          item.statusType === "100"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : item.statusType === "partially"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Three-dot dropdown menu */}
                        {activeMenuId === item.id && (
                          <div
                            className="absolute right-0 mt-1 w-52 rounded-xl bg-card border border-border p-1.5 shadow-2xl z-50 text-left animate-in fade-in zoom-in-95"
                            onClick={() => setActiveMenuId(null)}
                          >
                            <button
                              onClick={() => onOpenPortfolioDashboard && onOpenPortfolioDashboard(item.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>View Dashboard</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetAllocation(item);
                                setShowAddAccountsModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Add Accounts</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetAllocation(item);
                                setShowUnsubscribeModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 text-amber-500" />
                              <span>Unsubscribe Accounts</span>
                            </button>

                            <button
                              onClick={handleDownloadSample}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-500" />
                              <span>Download Allocation</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetAllocation(item);
                                setShowDeleteModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. UPLOAD NEW FILE VIEW
      ───────────────────────────────────────────────────────────── */}
      {currentView === "upload" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Upload New File</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                Upload a new allocation file here to begin planning and assignment to channels
              </p>
            </div>

            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors border border-border flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Allocation List</span>
            </button>
          </div>

          {/* Form Card */}
          <form onSubmit={handleUploadSubmit} className="p-6 rounded-2xl bg-card border border-border space-y-6 shadow-sm">
            
            {/* Drag & Drop File Zone */}
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-border hover:border-blue-500/60 rounded-2xl p-8 text-center transition-all cursor-pointer bg-muted/20 hover:bg-muted/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,.xlsb,.csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm text-foreground">
                {selectedFile ? selectedFile.name : "Drag & drop files or Browse"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: <strong className="text-foreground">.xls, .xlsx, .xlsb, .csv</strong>
              </p>
            </div>

            {/* Inputs Grid: Product, Bucket, Outstanding (TOS), Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Product: 15 exact products */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Product:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  {PRODUCTS.map((prod) => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* Bucket: 16 exact buckets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Bucket:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  {BUCKETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Outstanding: * TOS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Outstanding:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="TOS (e.g. ₹4.74 Cr)"
                  value={tosAmount}
                  onChange={(e) => setTosAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Duration: Start date, End date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Duration:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Template Download & Upload / Proceed Buttons */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Allocation File</span>
                </button>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Use this template for correctly formatted, smooth processing.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
              >
                Upload &amp; Proceed
              </button>
            </div>

            {uploadMessage && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                uploadMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
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
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Upload History File</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Audit logs of previously uploaded institutional debtor files and batch validation statuses
              </p>
            </div>

            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors border border-border flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Allocation List</span>
            </button>
          </div>

          {/* Cloud Upload Box */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
            <div className="border-2 border-dashed border-border hover:border-blue-500/50 rounded-2xl p-8 text-center transition-colors bg-muted/20">
              <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-sm text-foreground">Drag &amp; drop files or Browse</div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: .xls, .xlsx, .xlsb, .csv
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleDownloadSample}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center gap-1.5 border border-border cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Download Sample</span>
              </button>

              <button
                onClick={() => setCurrentView("upload")}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Processed Allocation Batches</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-lg">File Name</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Records Ingested</th>
                    <th className="p-3">Date &amp; Time</th>
                    <th className="p-3 text-right rounded-r-lg">Ingestion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historyLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{log.fileName}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.uploadedBy}</td>
                      <td className="p-3 font-bold text-foreground">{log.records} accounts</td>
                      <td className="p-3 font-mono text-muted-foreground">{log.dateTime}</td>
                      <td className="p-3 text-right font-bold text-emerald-500">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-foreground">Unsubscribe Accounts</h4>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{targetAllocation.name}</p>
              </div>
              <button onClick={() => setShowUnsubscribeModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload account list to instantly pause recovery contacts and mark institutional resolution.
            </p>

            <div className="border border-dashed border-border rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 mx-auto text-blue-500 mb-1" />
              <div className="text-xs font-semibold text-foreground">Drag &amp; drop accounts file or browse</div>
              <span className="text-[10px] text-muted-foreground">Supported: .csv, .xlsx</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-xs font-bold text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Process Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Accounts Modal (Upload New Allocation File) */}
      {showAddAccountsModal && targetAllocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-foreground">Upload New Allocation File</h4>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{targetAllocation.name}</p>
              </div>
              <button onClick={() => setShowAddAccountsModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Append new debtor cases into this existing institutional portfolio bucket.
            </p>

            <div className="border border-dashed border-border rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
              <div className="text-xs font-semibold text-foreground">Drop .csv, .xlsx to append accounts</div>
              <span className="text-[10px] text-muted-foreground">Accounts auto-deduplicated</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddAccountsModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-xs font-bold text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddAccountsModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Upload &amp; Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Allocation Confirmation Modal */}
      {showDeleteModal && targetAllocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Confirm Portfolio Deletion</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{targetAllocation.name}</strong>? This will unlink active dials and ground tasks permanently.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-xs font-bold text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAllocations(allocations.filter((a) => a.id !== targetAllocation.id));
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm cursor-pointer"
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
