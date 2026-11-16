import React, { useState, useEffect } from "react";
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
  RotateCcw,
  Clock,
  Check,
  ChevronDown
} from "lucide-react";
import api from "../../services/api";

export const BulkAllocateModal = ({
  employees = [],
  isOpen,
  onClose,
  onSuccess
}) => {
  const [staffList, setStaffList] = useState(employees);
  const [allocationRule, setAllocationRule] = useState("AMOUNT_BALANCED");
  const [batchSize, setBatchSize] = useState("25");
  const [targetCity, setTargetCity] = useState("Mumbai");
  const [shiftAwareOnly, setShiftAwareOnly] = useState(false);
  const [selectedStaffScope, setSelectedStaffScope] = useState("ALL_ELIGIBLE"); // "ALL_ELIGIBLE" | "SINGLE"
  const [singleEmployeeId, setSingleEmployeeId] = useState(employees[0]?.id || employees[0]?.employeeId || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync staff or fetch eligible if passed list is empty
  useEffect(() => {
    if (employees && employees.length > 0) {
      setStaffList(employees);
      if (!singleEmployeeId) {
        setSingleEmployeeId(employees[0]?.id || employees[0]?.employeeId || "");
      }
    } else if (isOpen) {
      api.get("/allocation/eligible-employees")
        .then((res) => {
          if (res?.success && res.employees && res.employees.length > 0) {
            setStaffList(res.employees);
            if (!singleEmployeeId) {
              setSingleEmployeeId(res.employees[0]?.id || res.employees[0]?.employeeId || "");
            }
          }
        })
        .catch(() => {});
    }
  }, [employees, isOpen]);

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
        shiftAware: shiftAwareOnly || allocationRule === "SHIFT_AWARE",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">Rule-Based Case Allocation Engine</h3>
              <p className="text-xs text-slate-400">
                {step === "CONFIG" ? "Configure portfolio distribution criteria, capacity guards & strategy" : "Review proposed allocation before executing"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === "CONFIG" ? (
          <form onSubmit={handleGeneratePreview} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Rule Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-200 tracking-wide uppercase">
                  Allocation Strategy <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Select distribution algorithm</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Balanced Portfolio Amount */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("AMOUNT_BALANCED")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "AMOUNT_BALANCED"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-3.5 h-3.5" />
                      </div>
                      <span>Balanced Portfolio Amount</span>
                    </div>
                    {allocationRule === "AMOUNT_BALANCED" && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                    Evenly balances high, medium &amp; low debt amounts across all specialists
                  </p>
                </button>

                {/* 2. Workload Capacity First */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("WORKLOAD_BASED")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "WORKLOAD_BASED"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span>Workload Capacity First</span>
                    </div>
                    {allocationRule === "WORKLOAD_BASED" && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                    Prioritizes agents with lowest current active cases to prevent burnout
                  </p>
                </button>

                {/* 3. Geographical / City Geo */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("LOCATION")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "LOCATION"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Geographical / City Geo</span>
                    </div>
                    {allocationRule === "LOCATION" && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                    Clusters borrowers by city for localized recovery outreach
                  </p>
                </button>

                {/* 4. Equal Round-Robin */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("EQUAL")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "EQUAL"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span>Equal Round-Robin</span>
                    </div>
                    {allocationRule === "EQUAL" && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                    Strictly equal number of cases distributed cyclically across staff
                  </p>
                </button>

                {/* 5. Priority & Risk-Weighted */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("PRIORITY_BASED")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "PRIORITY_BASED"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <span>Priority &amp; Risk-Weighted</span>
                    </div>
                    {allocationRule === "PRIORITY_BASED" && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                    Critical and High severity overdue accounts allocated first
                  </p>
                </button>

                {/* 6. Overdue Bucket / DPD Stage */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("OVERDUE_BUCKET")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "OVERDUE_BUCKET"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span>Overdue Bucket / DPD Stage</span>
                    </div>
                    {allocationRule === "OVERDUE_BUCKET" && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                    Distributes by delinquency stage from 90+ DPD (NPA) to early buckets
                  </p>
                </button>

                {/* 7. Shift-Aware Active Staff (Full 2-Column Span for visual balance) */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("SHIFT_AWARE")}
                  className={`sm:col-span-2 p-3.5 rounded-xl border text-left transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer relative ${
                    allocationRule === "SHIFT_AWARE"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">Shift-Aware Active Staff</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          LIVE ATTENDANCE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                        Allocates strictly to specialists who are currently marked ON_SHIFT or PRESENT today
                      </p>
                    </div>
                  </div>
                  {allocationRule === "SHIFT_AWARE" && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 self-end sm:self-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>

              </div>
            </div>

            {/* Interactive Shift Restriction Switch */}
            <div
              onClick={() => setShiftAwareOnly(!shiftAwareOnly)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${shiftAwareOnly ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-slate-700/40 text-slate-400"}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Strict Shift &amp; Leave Guard</div>
                  <p className="text-[11px] text-slate-400">Exclude staff whose shift is OFF_SHIFT or on approved leave</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${shiftAwareOnly ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
              </div>
            </div>

            {/* City Field if Location Rule */}
            {allocationRule === "LOCATION" && (
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Target City / Territory
                </label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Delhi, Bangalore"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>
            )}

            {/* Target Scope */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Staff Allocation Scope
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffScope("ALL_ELIGIBLE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedStaffScope === "ALL_ELIGIBLE"
                      ? "bg-indigo-600/25 border-indigo-500 text-white shadow-sm"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${staffList.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  <span>All Eligible Active Staff ({staffList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaffScope("SINGLE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    selectedStaffScope === "SINGLE"
                      ? "bg-indigo-600/25 border-indigo-500 text-white shadow-sm"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  Specific Staff Member
                </button>
              </div>

              {selectedStaffScope === "SINGLE" && (
                <div className="relative">
                  <select
                    value={singleEmployeeId}
                    onChange={(e) => setSingleEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer shadow-inner"
                  >
                    {staffList.map((emp) => (
                      <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId} className="bg-slate-900 text-white">
                        {emp.fullName || emp.name} ({emp.employeeId || emp.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Maximum Cases to Allocate
              </label>
              <div className="relative">
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer shadow-inner"
                >
                  <option value="10" className="bg-slate-900 text-white">10 Cases</option>
                  <option value="25" className="bg-slate-900 text-white">25 Cases (Standard Batch)</option>
                  <option value="50" className="bg-slate-900 text-white">50 Cases</option>
                  <option value="100" className="bg-slate-900 text-white">100 Cases (Full Portfolio)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-98"
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

            {/* Unallocated Cases Warning if any */}
            {previewData?.unallocated_cases_count > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{previewData.unallocated_cases_count} Case(s) could not be allocated</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  {previewData.unallocated_cases[0]?.reason || "Staff capacity or portfolio limits reached."}
                </p>
              </div>
            )}

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
                      <th className="py-2 px-3 text-center">Cap. Usage</th>
                      <th className="py-2 px-3 text-right">Allocated Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewData?.allocations?.map((alloc) => (
                      <tr key={alloc.user_id || alloc.employee_id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{alloc.employee_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{alloc.employee_id} • {alloc.city || 'HQ'}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {alloc.current_active_cases}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-400">
                          +{alloc.proposed_cases_count}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            (alloc.capacity_utilization_pct || 0) > 90 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {alloc.capacity_utilization_pct || Math.round((alloc.current_active_cases + alloc.proposed_cases_count) / (alloc.max_workload_capacity || 150) * 100)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                          ₹{Number(alloc.proposed_portfolio_amount || 0).toLocaleString("en-IN")}
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
