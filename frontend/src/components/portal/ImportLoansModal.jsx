import React, { useState } from "react";
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
  FileCheck
} from "lucide-react";
import api, { API_URL } from "../../services/api";

export const ImportLoansModal = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState("UPLOAD"); // "UPLOAD" | "PREVIEW"

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleDownloadTemplate = (format = "xlsx") => {
    const token = localStorage.getItem("paymagic_token");
    const downloadUrl = `${API_URL}/upload/template?format=${format}`;
    
    // Trigger download with browser
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
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select an Excel (.xlsx, .xls) or CSV file.");
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
      } else {
        setErrorMsg(json?.message || "File pre-validation failed.");
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

      const res = await api.post("/upload/confirm", {
        preview_batch_id: previewData.preview_batch_id
      });

      if (res && res.success) {
        if (onSuccess) {
          onSuccess(res.message || `Successfully imported ${res.data.success_count} cases.`);
        }
        handleClose();
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
        a.download = `import_rejected_records.${format}`;
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
    setStep("UPLOAD");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Import Customer Loan Records</h3>
              <p className="text-xs text-slate-400">
                {step === "UPLOAD" ? "Upload Excel (.xlsx, .xls) or CSV dataset" : "Pre-validation summary & schema audit"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {step === "UPLOAD" ? (
          <form onSubmit={handleAnalyzeFile} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Download Template Banner */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Need the official schema format before importing?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("xlsx")}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 transition text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Template (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("csv")}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold flex items-center gap-1 transition text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Template (.csv)</span>
                </button>
              </div>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Spreadsheet File (.xlsx, .xls, .csv) <span className="text-rose-400">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-950/40 transition">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300 mb-1 font-medium">
                  {selectedFile ? selectedFile.name : "Click to select or drag and drop loan file"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Supports Excel (.xlsx, .xls) and CSV up to 15MB"}
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Suggested Fields Information */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Required Header Columns:</span>
              <p>Customer Name, Customer Mobile Number, Loan Account Number, Bank / Financial Institution, Total Loan Amount</p>
              <span className="font-semibold text-slate-300 block pt-1">Optional Columns:</span>
              <p>Loan ID, Loan Type, Outstanding Amount, Overdue Amount, EMI Amount, Days Past Due (DPD), Customer Address, City, State, PIN Code, Priority, Follow-up Date, Recovery Target</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                <span>Validate &amp; Preview Records</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: VALIDATION RESULTS & CONFIRMATION */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Stat Counters */}
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Rows</span>
                <span className="text-lg font-bold font-mono text-white">{previewData?.total_records}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-semibold block">Valid Records</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{previewData?.valid_records}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 font-semibold block">Duplicates</span>
                <span className="text-lg font-bold font-mono text-amber-400">{previewData?.duplicate_records}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] text-rose-400 font-semibold block">Rejected</span>
                <span className="text-lg font-bold font-mono text-rose-400">{previewData?.rejected_records}</span>
              </div>
            </div>

            {/* Error Actions if Any */}
            {(previewData?.duplicate_records > 0 || previewData?.rejected_records > 0) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {previewData?.duplicate_records + previewData?.rejected_records} rows will be skipped during import.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadErrors("csv")}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 self-start sm:self-auto transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rejected Rows (.csv)</span>
                </button>
              </div>
            )}

            {/* Sample Valid Records Preview */}
            {previewData?.sample_valid?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1.5">
                  Sample Valid Cases Preview (Showing {previewData.sample_valid.length})
                </h4>
                <div className="rounded-xl border border-slate-800 overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Borrower</th>
                        <th className="py-2 px-3">Account #</th>
                        <th className="py-2 px-3">Lender</th>
                        <th className="py-2 px-3 text-right">Principal</th>
                        <th className="py-2 px-3 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {previewData.sample_valid.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-medium text-white">{row.customer_name}</td>
                          <td className="py-2 px-3 font-mono text-indigo-400">{row.loan_account_no}</td>
                          <td className="py-2 px-3 text-slate-300">{row.lender_name}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-200">
                            ₹{Number(row.principal_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                            ₹{Number(row.outstanding_amount || row.principal_amount || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Rows Table if Any */}
            {previewData?.error_records?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-rose-300 mb-1.5">
                  Validation &amp; Duplicate Audit Log
                </h4>
                <div className="rounded-xl border border-rose-950/40 bg-rose-950/10 overflow-hidden max-h-36 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950/70 border-b border-rose-900/30 text-rose-300 font-semibold">
                      <tr>
                        <th className="py-1.5 px-3">Row</th>
                        <th className="py-1.5 px-3">Account #</th>
                        <th className="py-1.5 px-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-900/20 text-rose-200">
                      {previewData.error_records.map((err, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-3 font-mono font-semibold">Row {err.row}</td>
                          <td className="py-1.5 px-3 font-mono">{err.loan_account_no}</td>
                          <td className="py-1.5 px-3">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep("UPLOAD")}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Another File</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={loading || previewData?.valid_records === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm &amp; Import ({previewData?.valid_records || 0} Cases)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportLoansModal;
