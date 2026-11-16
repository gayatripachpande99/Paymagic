import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  Check
} from "lucide-react";
import api, { API_URL } from "../../services/api";

export const ImportLoansModal = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState("UPLOAD"); // "UPLOAD" | "PREVIEW" | "RESULT"
  const [importResult, setImportResult] = useState(null);

  // Preview filtering & search
  const [previewTab, setPreviewTab] = useState("VALID"); // "VALID" | "DUPLICATES" | "REJECTED"
  const [searchQuery, setSearchQuery] = useState("");
  const [previewPage, setPreviewPage] = useState(1);
  const pageSize = 8;

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File exceeds the maximum allowable limit of 10 MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File exceeds the maximum allowable limit of 10 MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleDownloadTemplate = (format = "xlsx") => {
    const token = localStorage.getItem("paymagic_token");
    const downloadUrl = `${API_URL}/upload/template?format=${format}`;

    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to download template");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PayMagic_Loan_Import_Template.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Template download error:", err);
        setErrorMsg("Failed to download import template.");
      });
  };

  const handleAnalyzeFile = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select an Excel (.xlsx) or CSV (.csv) file up to 10 MB.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("paymagic_token");
      const res = await fetch(`${API_URL}/upload/preview`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const json = await res.json();

      if (json && json.success) {
        setPreviewData(json.data);
        setStep("PREVIEW");
        setPreviewTab(json.data.valid_records > 0 ? "VALID" : (json.data.duplicate_records > 0 ? "DUPLICATES" : "REJECTED"));
        setPreviewPage(1);
      } else {
        setErrorMsg(json?.message || "File pre-validation failed. Ensure 16 standard columns and valid data types.");
      }
    } catch (err) {
      console.error("File preview error:", err);
      setErrorMsg(err.message || "Failed to analyze uploaded file.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData?.preview_batch_id) return;
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post(`/upload/${previewData.preview_batch_id}/confirm`, {
        preview_batch_id: previewData.preview_batch_id
      });

      if (res && res.success) {
        setImportResult(res.data);
        setStep("RESULT");
        if (onSuccess) {
          onSuccess(res.message || `Successfully imported ${res.data.success_count} cases.`);
        }
      } else {
        setErrorMsg(res?.message || "Failed to confirm import.");
      }
    } catch (err) {
      console.error("Confirm import error:", err);
      setErrorMsg(err.message || "Failed to import loan cases.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadErrors = (format = "csv") => {
    if (!previewData?.preview_batch_id) return;
    const token = localStorage.getItem("paymagic_token");
    const downloadUrl = `${API_URL}/upload/errors/${previewData.preview_batch_id}?format=${format}`;

    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to download error records");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `import_rejected_records_${previewData.preview_batch_id}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Error download error:", err);
        setErrorMsg("Failed to download rejected records.");
      });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setStep("UPLOAD");
    setErrorMsg("");
    setSearchQuery("");
    onClose();
  };

  // Filter preview list based on active tab and search query
  const displayedItems = useMemo(() => {
    if (!previewData) return [];
    let items = [];
    if (previewTab === "VALID") items = previewData.sample_valid || [];
    else if (previewTab === "DUPLICATES") items = previewData.duplicate_records || [];
    else if (previewTab === "REJECTED") items = previewData.rejected_records || [];

    if (!searchQuery.trim()) return items;

    const q = searchQuery.toLowerCase().trim();
    return items.filter(item => {
      const name = (item.customer_name || "").toLowerCase();
      const code = (item.customer_code || "").toLowerCase();
      const acct = (item.loan_account_no || "").toLowerCase();
      const lender = (item.lender_name || "").toLowerCase();
      return name.includes(q) || code.includes(q) || acct.includes(q) || lender.includes(q);
    });
  }, [previewData, previewTab, searchQuery]);

  const totalPages = Math.ceil(displayedItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (previewPage - 1) * pageSize;
    return displayedItems.slice(start, start + pageSize);
  }, [displayedItems, previewPage, pageSize]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B20]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0B1733] border border-[#263957] rounded-2xl shadow-2xl overflow-hidden text-[#F4F7FF]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#263957] bg-[#08132D] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14223A] border border-[#315CFF]/30 text-[#315CFF] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[#06C7E8]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F4F7FF] text-base tracking-tight flex items-center gap-2">
                <span>Import Loan Customer Data</span>
              </h3>
              <p className="text-xs text-[#9AAAC2]">
                {step === "UPLOAD" && "Upload standard 16-column Excel or CSV portfolio dataset (Max 10 MB)"}
                {step === "PREVIEW" && `Audit Batch: ${previewData?.preview_batch_id || "Active Session"} • Read-only preview`}
                {step === "RESULT" && "Import execution complete & committed to PostgreSQL"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#9AAAC2] hover:text-[#F4F7FF] rounded-lg hover:bg-[#14223A] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {step === "UPLOAD" && (
          <form onSubmit={handleAnalyzeFile} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Download Template Banner */}
            <div className="p-4 rounded-xl bg-[#14223A] border border-[#263957] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00C995]/15 text-[#00C995] flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#F4F7FF] font-semibold block">Official 16-Column Template</span>
                  <span className="text-[#9AAAC2] text-[11px]">Download formatted sample template matching PostgreSQL schema</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("xlsx")}
                  className="px-3 py-1.5 rounded-lg bg-[#00C995]/15 hover:bg-[#00C995]/25 text-[#00C995] border border-[#00C995]/30 font-semibold flex items-center gap-1.5 transition text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("csv")}
                  className="px-3 py-1.5 rounded-lg bg-[#08132D] hover:bg-[#14223A] text-[#F4F7FF] border border-[#263957] font-semibold flex items-center gap-1.5 transition text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#9AAAC2]" />
                  <span>CSV (.csv)</span>
                </button>
              </div>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-[#9AAAC2] mb-2">
                Select Spreadsheet File (.xlsx, .csv) <span className="text-[#FF527A]">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-7 text-center transition cursor-pointer ${
                  isDragging
                    ? "border-[#315CFF] bg-[#315CFF]/15"
                    : selectedFile
                    ? "border-[#00C995]/60 bg-[#00C995]/10"
                    : "border-[#263957] hover:border-[#315CFF]/60 bg-[#14223A]/50"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#08132D] border border-[#263957] mx-auto flex items-center justify-center mb-3">
                  <Upload className={`w-6 h-6 ${selectedFile ? "text-[#00C995]" : "text-[#315CFF]"}`} />
                </div>
                <p className="text-sm text-[#F4F7FF] font-semibold mb-1">
                  {selectedFile ? selectedFile.name : "Drag and drop loan portfolio file here"}
                </p>
                <p className="text-xs text-[#9AAAC2] mb-3">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for schema validation`
                    : "Supports Microsoft Excel (.xlsx) and CSV (.csv) up to 10 MB"}
                </p>
                <input
                  type="file"
                  id="loan-import-file-input"
                  accept=".xlsx, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="loan-import-file-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#08132D] hover:bg-[#14223A] text-[#F4F7FF] font-semibold text-xs border border-[#263957] cursor-pointer transition shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#315CFF]" />
                  <span>Browse From Computer</span>
                </label>
              </div>
            </div>

            {/* Schema Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block text-xs">Standard 16 Business Fields Enforced:</span>
              <p className="leading-relaxed">
                Borrower Name, Customer Code, Phone, Alternate Phone, Email, Address, City, State, Pincode, Lender Name, Loan Account No, Loan Type, Principal Amount, Outstanding Amount, DPD, Priority.
              </p>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Formula injection protected
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Magic-byte verified
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Atomic rollback guaranteed
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#FF527A]/15 border border-[#FF527A]/30 text-[#FF527A] text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#FF527A] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-[#263957] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-[#9AAAC2] hover:text-[#F4F7FF] rounded-xl hover:bg-[#14223A] border border-[#263957] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-5 py-2 text-xs font-semibold text-[#F4F7FF] bg-gradient-to-r from-[#315CFF] to-[#5945F5] hover:from-[#2a50e0] hover:to-[#4e3cd4] rounded-xl shadow-lg shadow-[#315CFF]/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                <span>Pre-Validate &amp; Generate Preview</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PREVIEW SCREEN */}
        {step === "PREVIEW" && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Stat KPI Cards */}
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Total Rows</span>
                <span className="text-xl font-bold font-mono text-white">{previewData?.total_records}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-semibold block uppercase tracking-wider">Valid Records</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{previewData?.valid_records}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 font-semibold block uppercase tracking-wider">Duplicates</span>
                <span className="text-xl font-bold font-mono text-amber-400">{previewData?.duplicate_records}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] text-rose-400 font-semibold block uppercase tracking-wider">Rejected</span>
                <span className="text-xl font-bold font-mono text-rose-400">{previewData?.rejected_records}</span>
              </div>
            </div>

            {/* Checksum and Session Info */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">SHA-256:</span>
                <span className="font-mono text-[10px] text-slate-300">
                  {previewData?.file_checksum ? `${previewData.file_checksum.slice(0, 16)}...` : "Verified"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Session TTL:</span>
                <span className="text-amber-400 font-medium">30 minutes</span>
              </div>
            </div>

            {/* Navigation Tabs and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setPreviewTab("VALID"); setPreviewPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    previewTab === "VALID"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Valid Cases ({previewData?.valid_records || 0})
                </button>
                <button
                  type="button"
                  onClick={() => { setPreviewTab("DUPLICATES"); setPreviewPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    previewTab === "DUPLICATES"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Duplicates ({previewData?.duplicate_records || 0})
                </button>
                <button
                  type="button"
                  onClick={() => { setPreviewTab("REJECTED"); setPreviewPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    previewTab === "REJECTED"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Rejected ({previewData?.rejected_records || 0})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, code, account #..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPreviewPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Preview Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden min-h-[180px]">
              {previewTab === "VALID" && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Borrower Name</th>
                      <th className="py-2.5 px-3">Customer Code</th>
                      <th className="py-2.5 px-3">Loan Account #</th>
                      <th className="py-2.5 px-3">Lender</th>
                      <th className="py-2.5 px-3 text-right">Principal</th>
                      <th className="py-2.5 px-3 text-right">Outstanding</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                          No valid records found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-semibold text-white">{row.customer_name}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{row.customer_code}</td>
                          <td className="py-2 px-3 font-mono text-cyan-400 font-medium">{row.loan_account_no}</td>
                          <td className="py-2 px-3 text-slate-300">{row.lender_name}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">
                            ₹{Number(row.principal_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                            ₹{Number(row.outstanding_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              row.priority === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                              row.priority === "HIGH" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {row.priority}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {(previewTab === "DUPLICATES" || previewTab === "REJECTED") && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Row</th>
                      <th className="py-2.5 px-3">Borrower</th>
                      <th className="py-2.5 px-3">Account Number</th>
                      <th className="py-2.5 px-3">Reason / Audit Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                          No {previewTab.toLowerCase()} records in this file.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((err, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono text-slate-400">Row {err.row}</td>
                          <td className="py-2 px-3 font-medium text-slate-200">{err.customer_name || "N/A"}</td>
                          <td className="py-2 px-3 font-mono text-cyan-400">{err.loan_account_no || "N/A"}</td>
                          <td className="py-2 px-3 text-[11px] text-rose-300">{err.reason}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing {Math.min(displayedItems.length, (previewPage - 1) * pageSize + 1)}–{Math.min(displayedItems.length, previewPage * pageSize)} of {displayedItems.length} records
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={previewPage === 1}
                    onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
                  >
                    Prev
                  </button>
                  <span className="px-2 font-mono">{previewPage} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={previewPage >= totalPages}
                    onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Error report export banner if duplicates or rejected exist */}
            {(previewData?.duplicate_records > 0 || previewData?.rejected_records > 0) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {(previewData?.duplicate_records || 0) + (previewData?.rejected_records || 0)} rows will be skipped during atomic database insertion.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadErrors("csv")}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rejection Report (.csv)</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep("UPLOAD")}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Choose Another File</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={loading || previewData?.valid_records === 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm &amp; Import ({previewData?.valid_records || 0} Cases)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT SCREEN */}
        {step === "RESULT" && (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-in zoom-in-75 duration-300">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-1">Portfolio Ingestion Successful!</h4>
              <p className="text-xs text-slate-400">
                All valid customer accounts have been transactionally committed to PostgreSQL with initial intake status 'New'.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-center">
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Imported Cases</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{importResult?.success_count}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Duplicates Skipped</span>
                <span className="text-2xl font-bold font-mono text-amber-400">{importResult?.skipped_duplicates}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rejected Rows</span>
                <span className="text-2xl font-bold font-mono text-rose-400">{importResult?.rejected_count}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 max-w-lg mx-auto text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Batch Reference ID:</span>
                <span className="font-mono text-cyan-400">{importResult?.batch_id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Target Status:</span>
                <span className="text-emerald-400 font-semibold">New (Rule-allocatable)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Audit Trail:</span>
                <span className="text-slate-300">case_status_history intake entry logged</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                View Updated Portfolio Cases
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportLoansModal;
