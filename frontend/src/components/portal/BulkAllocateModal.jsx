import React, { useState } from "react";
import {
  Sparkles,
  Users,
  Building2,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import api from "../../services/api";

export const BulkAllocateModal = ({
  employees = [],
  isOpen,
  onClose,
  onSuccess
}) => {
  const [allocationRule, setAllocationRule] = useState("AMOUNT_BALANCED");
  const [batchSize, setBatchSize] = useState("25");
  const [targetCity, setTargetCity] = useState("Mumbai");
  const [selectedStaffScope, setSelectedStaffScope] = useState("ALL_ELIGIBLE"); // "ALL_ELIGIBLE" | "SINGLE"
  const [singleEmployeeId, setSingleEmployeeId] = useState(employees[0]?.id || employees[0]?.employeeId || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState("CONFIG"); // "CONFIG" | "PREVIEW"

  if (!isOpen) return null;

  const handleGeneratePreview = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        strategy: allocationRule,
        limit: parseInt(batchSize, 10) || 25,
        targetEmployeeIds: selectedStaffScope === "SINGLE" && singleEmployeeId ? [singleEmployeeId] : [],
        rules: {
          city: allocationRule === "LOCATION" ? targetCity : undefined,
          priority: allocationRule === "PRIORITY_CRITICAL" ? ["CRITICAL", "HIGH"] : undefined
        }
      };

      const res = await api.post("/cases/allocate/preview", payload);

      if (res && res.success) {
        setPreviewData(res.data);
        setStep("PREVIEW");
      } else {
        setErrorMsg(res?.message || "Failed to generate allocation preview.");
      }
    } catch (err) {
      console.error("Allocation preview error:", err);
      setErrorMsg(err.message || "Failed to generate allocation preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAllocation = async () => {
    if (!previewData?.preview_id) return;
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post("/cases/allocate/execute", {
        preview_id: previewData.preview_id
      });

      if (res && res.success) {
        if (onSuccess) {
          onSuccess(res.message || `Successfully allocated ${previewData.total_cases_selected} cases.`);
        }
        handleClose();
      } else {
        setErrorMsg(res?.message || "Failed to execute allocation.");
      }
    } catch (err) {
      console.error("Allocation execution error:", err);
      setErrorMsg(err.message || "Failed to execute allocation.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("CONFIG");
    setPreviewData(null);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Rule-Based Case Allocation Engine</h3>
              <p className="text-xs text-slate-400">
                {step === "CONFIG" ? "Configure allocation criteria & strategy" : "Review proposed allocation before executing"}
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

        {/* Modal Body */}
        {step === "CONFIG" ? (
          <form onSubmit={handleGeneratePreview} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Rule Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Allocation Strategy <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                <button
                  type="button"
                  onClick={() => setAllocationRule("AMOUNT_BALANCED")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    allocationRule === "AMOUNT_BALANCED"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <span>Balanced Portfolio Amount</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Evenly balances high, medium &amp; low debt amounts across all specialists
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAllocationRule("WORKLOAD_BASED")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    allocationRule === "WORKLOAD_BASED"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Workload Capacity First</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Prioritizes agents with lowest current active cases to prevent overload
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAllocationRule("LOCATION")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    allocationRule === "LOCATION"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Geographical / City Geo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Clusters borrowers by city for targeted recovery outreach
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAllocationRule("EQUAL")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    allocationRule === "EQUAL"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Equal Round-Robin</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Strictly equal number of cases distributed across team members
                  </p>
                </button>
              </div>
            </div>

            {/* City Field if Location Rule */}
            {allocationRule === "LOCATION" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target City / Territory
                </label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Delhi, Bangalore"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Target Scope */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Allocation Scope
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffScope("ALL_ELIGIBLE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                    selectedStaffScope === "ALL_ELIGIBLE"
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  All Eligible Active Staff ({employees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaffScope("SINGLE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                    selectedStaffScope === "SINGLE"
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  Specific Staff Member
                </button>
              </div>

              {selectedStaffScope === "SINGLE" && (
                <select
                  value={singleEmployeeId}
                  onChange={(e) => setSingleEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId}>
                      {emp.fullName || emp.name} ({emp.employeeId || emp.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maximum Cases to Allocate
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="10">10 Cases</option>
                <option value="25">25 Cases (Standard Batch)</option>
                <option value="50">50 Cases</option>
                <option value="100">100 Cases (Full Portfolio)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Buttons */}
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
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                <span>Preview Allocation</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: PREVIEW & CONFIRMATION */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
              <div className="flex justify-between items-center text-indigo-300 font-semibold">
                <span>Total Cases Selected:</span>
                <span className="font-mono text-white text-sm">{previewData?.total_cases_selected} Cases</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Total Portfolio Debt:</span>
                <span className="font-mono text-amber-400 font-semibold">
                  ₹{Number(previewData?.total_outstanding_amount || 0).toLocaleString("en-IN")}.00
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Strategy Applied:</span>
                <span className="font-mono text-emerald-400">{previewData?.strategy}</span>
              </div>
            </div>

            {/* Employee Breakdown Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">
                Proposed Staff Distribution ({previewData?.allocations?.length} Specialists)
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2 px-3">Specialist</th>
                      <th className="py-2 px-3 text-center">Active</th>
                      <th className="py-2 px-3 text-center">Proposed +</th>
                      <th className="py-2 px-3 text-right">Allocated Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewData?.allocations?.map((alloc) => (
                      <tr key={alloc.user_id || alloc.employee_id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{alloc.employee_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{alloc.employee_id}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {alloc.current_active_cases}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-400">
                          +{alloc.proposed_cases_count}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                          ₹{Number(alloc.proposed_outstanding_amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                onClick={() => setStep("CONFIG")}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Rules</span>
              </button>
              <button
                type="button"
                onClick={handleExecuteAllocation}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm &amp; Execute Allocation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAllocateModal;
