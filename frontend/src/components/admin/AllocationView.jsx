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
    <div className="allocation-page space-y-4 animate-in fade-in duration-200">

      {/* ── UNIFIED ALLOCATION MANAGEMENT HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-b border-white/[0.06] pb-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Allocation Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            The Allocation Summary gives you a complete view of all institutional portfolios and channels
          </p>
        </div>

        {/* Sub-navigation tabs: Allocation List | Upload New File | Upload History */}
        <div className="flex items-center gap-5 shrink-0 self-start md:self-center">
          <button
            onClick={() => setCurrentView("list")}
            className={`text-xs cursor-pointer pb-0.5 transition-colors ${
              currentView === "list"
                ? "font-bold text-white border-b-2 border-white"
                : "font-medium text-slate-400 hover:text-white"
            }`}
          >
            Allocation List
          </button>
          <button
            onClick={() => setCurrentView("upload")}
            className={`text-xs cursor-pointer pb-0.5 transition-colors ${
              currentView === "upload"
                ? "font-bold text-white border-b-2 border-white"
                : "font-medium text-slate-400 hover:text-white"
            }`}
          >
            Upload New File
          </button>
          <button
            onClick={() => setCurrentView("history")}
            className={`text-xs cursor-pointer pb-0.5 transition-colors ${
              currentView === "history"
                ? "font-bold text-white border-b-2 border-white"
                : "font-medium text-slate-400 hover:text-white"
            }`}
          >
            Upload History
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. ALLOCATION LIST VIEW (MATCHES REFERENCE SCREENSHOT 100%)
      ───────────────────────────────────────────────────────────── */}
      {currentView === "list" && (
        <div className="space-y-3">
          
          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-[#0a1535] border border-slate-700/60 text-slate-300 hover:text-white font-medium"
              }`}
            >
              All Allocations ({allocations.length})
            </button>
            <button
              onClick={() => setActiveFilter("unallocated")}
              className={`px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                activeFilter === "unallocated"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-[#0a1535] border border-slate-700/60 text-slate-300 hover:text-white font-medium"
              }`}
            >
              Unallocated ({allocations.filter((a) => a.statusType === "unallocated").length})
            </button>
            <button
              onClick={() => setActiveFilter("100")}
              className={`px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                activeFilter === "100"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-[#0a1535] border border-slate-700/60 text-slate-300 hover:text-white font-medium"
              }`}
            >
              100% Allocated ({allocations.filter((a) => a.statusType === "100").length})
            </button>
            <button
              onClick={() => setActiveFilter("partially")}
              className={`px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                activeFilter === "partially"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-[#0a1535] border border-slate-700/60 text-slate-300 hover:text-white font-medium"
              }`}
            >
              Partially Allocated ({allocations.filter((a) => a.statusType === "partially").length})
            </button>
            <button
              onClick={() => setActiveFilter("expiring")}
              className={`px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                activeFilter === "expiring"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-[#0a1535] border border-slate-700/60 text-slate-300 hover:text-white font-medium"
              }`}
            >
              Expiring in 5 days (0)
            </button>
            <button
              onClick={() => setActiveFilter("closed")}
              className={`px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                activeFilter === "closed"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-[#0a1535] border border-slate-700/60 text-slate-300 hover:text-white font-medium"
              }`}
            >
              Closed ({allocations.filter((a) => a.statusType === "closed").length})
            </button>
          </div>

          {/* Allocation Table - Direct on canvas matching screenshot */}
          <div className="w-full overflow-x-auto pt-1">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="border-b border-white/[0.08] text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 pl-1 pr-4">ALLOCATION NAME</th>
                  <th className="py-3 px-4">PRODUCT</th>
                  <th className="py-3 px-4">BUCKET</th>
                  <th className="py-3 px-4">TOTAL ACCOUNTS</th>
                  <th className="py-3 px-4">COLLECTABLE</th>
                  <th className="py-3 px-4">OUTSTANDING</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 pl-4 pr-1 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredAllocations.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-1 pr-4 font-semibold text-white flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate max-w-md" title={item.name}>{item.name}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">{item.product}</td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-500">
                        {item.bucket}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">{item.accounts}</td>

                    <td className="py-3.5 px-4 font-bold text-white">{item.collectable}</td>

                    <td className="py-3.5 px-4 text-slate-400 font-normal">{item.outstanding}</td>

                    <td className="py-3.5 px-4 text-slate-300">{item.status}</td>

                    <td className="py-3.5 pl-4 pr-1 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Three-dot dropdown menu */}
                      {activeMenuId === item.id && (
                        <div
                          className="absolute right-0 mt-1 w-52 rounded-xl bg-[#051336] border border-white/[0.1] p-1.5 shadow-2xl z-50 text-left animate-in fade-in zoom-in-95"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => onOpenPortfolioDashboard && onOpenPortfolioDashboard(item.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>View Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetAllocation(item);
                              setShowAddAccountsModal(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] rounded-lg cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Add Accounts</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetAllocation(item);
                              setShowUnsubscribeModal(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] rounded-lg cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-amber-400" />
                            <span>Unsubscribe Accounts</span>
                          </button>

                          <button
                            onClick={handleDownloadSample}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] rounded-lg cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                            <span>Download Allocation</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetAllocation(item);
                              setShowDeleteModal(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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
        <div className="space-y-6 animate-in fade-in duration-150 pt-2">
          
          {/* Form Card */}
          <form onSubmit={handleUploadSubmit} className="p-6 rounded-2xl bg-[#051336] border border-white/[0.08] space-y-6 shadow-sm">
            
            {/* Drag & Drop File Zone */}
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-white/[0.15] hover:border-blue-500/60 rounded-2xl p-8 text-center transition-all cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,.xlsb,.csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <UploadCloud className="w-12 h-12 mx-auto text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm text-white">
                {selectedFile ? selectedFile.name : "Drag & drop files or Browse"}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: <strong className="text-slate-200">.xls, .xlsx, .xlsb, .csv</strong>
              </p>
            </div>

            {/* Inputs Grid: Product, Bucket, Outstanding (TOS), Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Product: 15 exact products */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Product:</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a1639] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  {PRODUCTS.map((prod) => (
                    <option key={prod} value={prod} className="bg-[#051336] text-white">{prod}</option>
                  ))}
                </select>
              </div>

              {/* Bucket: 16 exact buckets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Bucket:</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a1639] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  {BUCKETS.map((b) => (
                    <option key={b} value={b} className="bg-[#051336] text-white">{b}</option>
                  ))}
                </select>
              </div>

              {/* Outstanding: * TOS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Outstanding:</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="TOS (e.g. ₹4.74 Cr)"
                  value={tosAmount}
                  onChange={(e) => setTosAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a1639] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Duration: Start date, End date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Duration:</span>
                  <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#0a1639] border border-white/[0.1] text-xs text-white focus:outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#0a1639] border border-white/[0.1] text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Template Download & Upload / Proceed Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Allocation File</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
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
        <div className="space-y-6 animate-in fade-in duration-150 pt-2">
          
          {/* History Table */}
          <div className="p-5 rounded-2xl bg-[#051336] border border-white/[0.08] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white">Processed Allocation Batches</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="p-3 rounded-l-lg">File Name</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Records Ingested</th>
                    <th className="p-3">Date &amp; Time</th>
                    <th className="p-3 text-right rounded-r-lg">Ingestion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {historyLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{log.fileName}</span>
                      </td>
                      <td className="p-3 text-slate-300">{log.uploadedBy}</td>
                      <td className="p-3 font-bold text-white">{log.records} accounts</td>
                      <td className="p-3 font-mono text-slate-400">{log.dateTime}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#051336] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-white">Unsubscribe Accounts</h4>
                <p className="text-xs text-slate-400 truncate max-w-xs">{targetAllocation.name}</p>
              </div>
              <button onClick={() => setShowUnsubscribeModal(false)} className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upload account list to instantly pause recovery contacts and mark institutional resolution.
            </p>

            <div className="border border-dashed border-white/[0.15] rounded-xl p-6 text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 mx-auto text-blue-400 mb-1" />
              <div className="text-xs font-semibold text-white">Drag &amp; drop accounts file or browse</div>
              <span className="text-[10px] text-slate-400">Supported: .csv, .xlsx</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#051336] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-white">Upload New Allocation File</h4>
                <p className="text-xs text-slate-400 truncate max-w-xs">{targetAllocation.name}</p>
              </div>
              <button onClick={() => setShowAddAccountsModal(false)} className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Append new debtor cases into this existing institutional portfolio bucket.
            </p>

            <div className="border border-dashed border-white/[0.15] rounded-xl p-6 text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
              <div className="text-xs font-semibold text-white">Drop .csv, .xlsx to append accounts</div>
              <span className="text-[10px] text-slate-400">Accounts auto-deduplicated</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddAccountsModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#051336] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Confirm Portfolio Deletion</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{targetAllocation.name}</strong>? This will unlink active dials and ground tasks permanently.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
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
