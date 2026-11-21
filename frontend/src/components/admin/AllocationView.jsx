import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";

export default function AllocationView({ onOpenPortfolioDashboard }) {
  const [allocationSubTab, setAllocationSubTab] = useState("list"); // 'list' | 'upload' | 'history'
  const [filterPill, setFilterPill] = useState("all"); // 'all' | 'unallocated' | '100' | 'partially' | 'expiring' | 'closed'
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Modals
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [showAddAccountsModal, setShowAddAccountsModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  // Upload New File Form State
  const [selectedProduct, setSelectedProduct] = useState("Personal Loan");
  const [selectedBucket, setSelectedBucket] = useState("Writeoff");
  const [tosAmount, setTosAmount] = useState("");
  const [startDate, setStartDate] = useState("2026-11-18");
  const [endDate, setEndDate] = useState("2026-12-06");
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const allocationsData = [
    {
      id: "bajaj_nov_18",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 117,
      collectable: "₹2.81 Cr",
      outstanding: "₹4.74 Cr",
      allocatedStatus: "Partially Allocated",
      expiry: "Ends in 18 days"
    },
    {
      id: "bajaj_nov_13",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-13_10:13",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 117,
      collectable: "₹2.81 Cr",
      outstanding: "₹4.74 Cr",
      allocatedStatus: "100% Allocated",
      expiry: "Ends in 18 days"
    },
    {
      id: "bajaj_nov_04_13",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_13:45",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 293,
      collectable: "₹3.85 Cr",
      outstanding: "₹6.11 Cr",
      allocatedStatus: "100% Allocated",
      expiry: "Ends in 18 days"
    },
    {
      id: "bajaj_nov_04_11",
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_11:31",
      product: "Personal Loan",
      bucket: "Writeoff",
      accounts: 4,
      collectable: "₹14.20 Lakh",
      outstanding: "₹22.08 Lakh",
      allocatedStatus: "Closed",
      expiry: "Expired"
    }
  ];

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,Account_Number,Borrower_Name,Phone_Number,Outstanding_Amount,Product,Bucket,State,City\n" +
      "1002345678,Ramesh Sharma,9876543210,125000,Personal Loan,Writeoff,Maharashtra,Pune\n" +
      "1002345679,Pooja Verma,9876543211,85000,Auto Loan,Bucket 3,Karnataka,Bangalore\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "PayMagic_Sample_Allocation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Allocation Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The Allocation Summary gives you a complete view of all institutional portfolios and channels
          </p>
        </div>

        {/* 1. Allocation List | 2. Upload New File | 3. Upload History */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setAllocationSubTab("list")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              allocationSubTab === "list"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Allocation List
          </button>
          <button
            onClick={() => setAllocationSubTab("upload")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              allocationSubTab === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload New File
          </button>
          <button
            onClick={() => setAllocationSubTab("history")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              allocationSubTab === "history"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload History
          </button>
        </div>
      </div>

      {/* ── 1. ALLOCATION LIST SUB-TAB ── */}
      {allocationSubTab === "list" && (
        <div className="space-y-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            <button
              onClick={() => setFilterPill("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPill === "all" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Allocations (4)
            </button>
            <button
              onClick={() => setFilterPill("unallocated")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPill === "unallocated" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Unallocated (0)
            </button>
            <button
              onClick={() => setFilterPill("100")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPill === "100" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              100% Allocated (2)
            </button>
            <button
              onClick={() => setFilterPill("partially")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPill === "partially" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Partially Allocated (1)
            </button>
            <button
              onClick={() => setFilterPill("expiring")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPill === "expiring" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Expiring in 5 days (0)
            </button>
            <button
              onClick={() => setFilterPill("closed")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPill === "closed" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Closed (1)
            </button>
          </div>

          {/* Allocation Table */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Allocation Name</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Bucket</th>
                    <th className="p-3">Total Accounts</th>
                    <th className="p-3">Collectable</th>
                    <th className="p-3">Outstanding</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allocationsData.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate max-w-sm">{item.name}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.product}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {item.bucket}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-foreground">{item.accounts}</td>
                      <td className="p-3 font-bold text-emerald-500">{item.collectable}</td>
                      <td className="p-3 font-mono text-muted-foreground">{item.outstanding}</td>
                      <td className="p-3">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {item.allocatedStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Three-dot dropdown menu */}
                        {actionMenuOpen === item.id && (
                          <div
                            className="absolute right-0 mt-1 w-48 rounded-xl bg-card border border-border p-1 shadow-xl z-50 text-left animate-in fade-in zoom-in-95"
                            onClick={() => setActionMenuOpen(null)}
                          >
                            <button
                              onClick={() => onOpenPortfolioDashboard(item.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>View Dashboard</span>
                            </button>
                            <button
                              onClick={() => setShowUnsubscribeModal(true)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg"
                            >
                              <X className="w-3.5 h-3.5 text-amber-500" />
                              <span>Unsubscribe Accounts</span>
                            </button>
                            <button
                              onClick={handleDownloadSample}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Download Allocation</span>
                            </button>
                            <button
                              onClick={() => setShowAddAccountsModal(true)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5 text-blue-500" />
                              <span>Add Accounts</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmModal(true)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg"
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

      {/* ── 2. UPLOAD NEW FILE SUB-TAB ── */}
      {allocationSubTab === "upload" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Upload New File</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload a new allocation file here to begin planning and assignment to channels
                </p>
              </div>
              <button
                onClick={() => setAllocationSubTab("list")}
                className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors"
              >
                View Allocation List
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div className="border-2 border-dashed border-border hover:border-blue-500/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-muted/20">
              <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-sm text-foreground">Drag &amp; drop files or Browse</div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: <strong className="text-foreground">.xls, .xlsx, .xlsb, .csv</strong>
              </p>
            </div>

            {/* Form Fields: Product, Bucket, Outstanding (TOS), Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Product (15 options) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Product</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {PRODUCTS.map((prod) => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* Bucket (16 options) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Bucket</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {BUCKETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Outstanding (TOS) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Outstanding (TOS)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹4,74,00,000"
                  value={tosAmount}
                  onChange={(e) => setTosAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Duration: Start & End Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Duration</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Template Download & Proceed Actions */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Allocation File</span>
                </button>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Use this template for correctly formatted, smooth processing.
                </p>
              </div>

              <button
                onClick={() => setUploadSuccess(true)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
              >
                Upload &amp; Proceed
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Allocation file validated and successfully queued for channel assignment!</span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 3. UPLOAD HISTORY SUB-TAB ── */}
      {allocationSubTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-lg font-bold text-foreground">Upload History File</h3>

            <div className="border-2 border-dashed border-border hover:border-blue-500/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-muted/20">
              <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-sm text-foreground">Drag &amp; drop files or Browse</div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: .xls, .xlsx, .xlsb, .csv
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleDownloadSample}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample</span>
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Proceed
              </button>
            </div>

            <div className="overflow-x-auto pt-4 border-t border-border">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">File Name</th>
                    <th className="p-2.5">Uploaded By</th>
                    <th className="p-2.5">Records Processed</th>
                    <th className="p-2.5">Date &amp; Time</th>
                    <th className="p-2.5">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/40">
                    <td className="p-2.5 font-mono font-semibold text-foreground">BAJAJ_NOV_FINAL.xlsx</td>
                    <td className="p-2.5">Priya Talekar</td>
                    <td className="p-2.5 font-bold text-foreground">117 accounts</td>
                    <td className="p-2.5 text-muted-foreground font-mono">2026-11-18 16:32:00</td>
                    <td className="p-2.5 text-emerald-500 font-bold">100% Ingested</td>
                  </tr>
                  <tr className="hover:bg-muted/40">
                    <td className="p-2.5 font-mono font-semibold text-foreground">URBAN_BAJAJ_WRITE_OFF.csv</td>
                    <td className="p-2.5">Priya Talekar</td>
                    <td className="p-2.5 font-bold text-foreground">293 accounts</td>
                    <td className="p-2.5 text-muted-foreground font-mono">2026-11-04 13:45:10</td>
                    <td className="p-2.5 text-emerald-500 font-bold">100% Ingested</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── UNSUBSCRIBE ACCOUNTS POPUP ── */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-foreground">Unsubscribe Accounts</h4>
              <button onClick={() => setShowUnsubscribeModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload account list to instantly pause recovery contact and mark institutional resolution.
            </p>
            <div className="border border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
              <UploadCloud className="w-8 h-8 mx-auto text-blue-500 mb-1" />
              <div className="text-xs font-semibold text-foreground">Drag &amp; drop accounts file</div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUnsubscribeModal(false)} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-bold text-foreground">
                Cancel
              </button>
              <button onClick={() => setShowUnsubscribeModal(false)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white">
                Process Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD ACCOUNTS POPUP ── */}
      {showAddAccountsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-foreground">Upload New Allocation File</h4>
              <button onClick={() => setShowAddAccountsModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Append new debtor cases into this existing institutional portfolio bucket.
            </p>
            <div className="border border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
              <UploadCloud className="w-8 h-8 mx-auto text-blue-500 mb-1" />
              <div className="text-xs font-semibold text-foreground">Drop .csv, .xlsx to append accounts</div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddAccountsModal(false)} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-bold text-foreground">
                Cancel
              </button>
              <button onClick={() => setShowAddAccountsModal(false)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white">
                Upload &amp; Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ALLOCATION POPUP ── */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Confirm Portfolio Deletion</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this allocation? This will unlink active dials and ground tasks.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteConfirmModal(false)} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-bold text-foreground">
                Cancel
              </button>
              <button onClick={() => setDeleteConfirmModal(false)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
