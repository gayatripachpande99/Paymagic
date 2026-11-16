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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B20]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col bg-[#0B1733] border border-[#263957] rounded-2xl shadow-2xl overflow-hidden text-[#F4F7FF]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#263957] bg-[#08132D] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1733] border border-[#315CFF]/30 text-[#315CFF] flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-[#818CF8]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F4F7FF] text-base tracking-tight">Rule-Based Case Allocation Engine</h3>
              <p className="text-xs text-[#9AAAC2]">
                {step === "CONFIG" ? "Configure allocation criteria & strategy" : "Review proposed allocation before executing"}
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

        {/* Modal Body */}
        {step === "CONFIG" ? (
          <form onSubmit={handleGeneratePreview} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Rule Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FF] tracking-wide mb-2">
                Allocation Strategy <span className="text-[#FF527A]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Balanced Portfolio Amount */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("AMOUNT_BALANCED")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "AMOUNT_BALANCED"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <TrendingDown className="w-4 h-4 text-[#FFB800] shrink-0" />
                    <span>Balanced Portfolio Amount</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Evenly balances high, medium &amp; low debt amounts across all specialists
                  </p>
                </button>

                {/* 2. Workload Capacity First */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("WORKLOAD_BASED")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "WORKLOAD_BASED"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <Users className="w-4 h-4 text-[#00C995] shrink-0" />
                    <span>Workload Capacity First</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Prioritizes agents with lowest current active cases to prevent overload
                  </p>
                </button>

                {/* 3. Geographical / City Geo */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("LOCATION")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "LOCATION"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <Building2 className="w-4 h-4 text-[#315CFF] shrink-0" />
                    <span>Geographical / City Geo</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Clusters borrowers by city for targeted recovery outreach
                  </p>
                </button>

                {/* 4. Equal Round-Robin */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("EQUAL")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "EQUAL"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <Layers className="w-4 h-4 text-[#A855F7] shrink-0" />
                    <span>Equal Round-Robin</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Strictly equal number of cases distributed across team members
                  </p>
                </button>

                {/* 5. Priority & Risk-Weighted */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("PRIORITY_BASED")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "PRIORITY_BASED"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <AlertTriangle className="w-4 h-4 text-[#FF527A] shrink-0" />
                    <span>Priority &amp; Risk-Weighted</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Critical and High severity overdue accounts allocated first
                  </p>
                </button>

                {/* 6. Overdue Bucket / DPD Stage */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("OVERDUE_BUCKET")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "OVERDUE_BUCKET"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <ShieldCheck className="w-4 h-4 text-[#06C7E8] shrink-0" />
                    <span>Overdue Bucket / DPD Stage</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Distributes by delinquency stage from 90+ DPD (NPA) to B1
                  </p>
                </button>

                {/* 7. Shift-Aware Active Staff */}
                <button
                  type="button"
                  onClick={() => setAllocationRule("SHIFT_AWARE")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                    allocationRule === "SHIFT_AWARE"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-lg shadow-[#5945F5]/20"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:bg-[#0B1733] hover:border-[#5945F5]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#F4F7FF]">
                    <Sparkles className="w-4 h-4 text-[#06C7E8] shrink-0" />
                    <span>Shift-Aware Active Staff</span>
                  </div>
                  <p className="text-[11px] text-[#9AAAC2] leading-relaxed">
                    Allocates strictly to agents who are currently marked ON_SHIFT or PRESENT today
                  </p>
                </button>

              </div>
            </div>

            {/* Strict Shift Restriction Checkbox Bar */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#08132D] border border-[#263957]">
              <input
                type="checkbox"
                id="strictShiftRestriction"
                checked={shiftAwareOnly}
                onChange={(e) => setShiftAwareOnly(e.target.checked)}
                className="w-4 h-4 rounded border-[#263957] bg-[#050B20] text-[#315CFF] focus:ring-0 cursor-pointer accent-[#315CFF]"
              />
              <label htmlFor="strictShiftRestriction" className="text-xs text-[#CBD5E1] cursor-pointer select-none">
                Strict Shift Restriction: Exclude staff whose shift is OFF_SHIFT or on approved leave
              </label>
            </div>

            {/* City Field if Location Rule */}
            {allocationRule === "LOCATION" && (
              <div className="p-3.5 rounded-xl bg-[#08132D] border border-[#263957] space-y-1.5">
                <label className="block text-xs font-semibold text-[#F4F7FF]">
                  Target City / Territory
                </label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Delhi, Bangalore"
                  className="w-full px-3.5 py-2.5 bg-[#050B20] border border-[#263957] rounded-xl text-xs text-[#F4F7FF] focus:outline-none focus:border-[#5945F5] shadow-inner"
                />
              </div>
            )}

            {/* Target Scope */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FF] mb-1.5">
                Staff Allocation Scope
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffScope("ALL_ELIGIBLE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedStaffScope === "ALL_ELIGIBLE"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-sm"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:border-[#5945F5]/40"
                  }`}
                >
                  <span>All Eligible Active Staff ({staffList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaffScope("SINGLE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    selectedStaffScope === "SINGLE"
                      ? "bg-[#0B1733] border-2 border-[#5945F5] text-[#F4F7FF] shadow-sm"
                      : "bg-[#08132D] border border-[#263957] text-[#9AAAC2] hover:border-[#5945F5]/40"
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
                    className="w-full px-3.5 py-2.5 bg-[#08132D] border border-[#263957] rounded-xl text-xs text-[#F4F7FF] focus:outline-none focus:border-[#5945F5] appearance-none pr-10 cursor-pointer shadow-inner"
                  >
                    {staffList.map((emp) => (
                      <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId} className="bg-[#0B1733] text-[#F4F7FF]">
                        {emp.fullName || emp.name} ({emp.employeeId || emp.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#9AAAC2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FF] mb-1.5">
                Maximum Cases to Allocate
              </label>
              <div className="relative">
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#08132D] border border-[#263957] rounded-xl text-xs text-[#F4F7FF] focus:outline-none focus:border-[#5945F5] appearance-none pr-10 cursor-pointer shadow-inner"
                >
                  <option value="10" className="bg-[#0B1733] text-[#F4F7FF]">10 Cases</option>
                  <option value="25" className="bg-[#0B1733] text-[#F4F7FF]">25 Cases (Standard Batch)</option>
                  <option value="50" className="bg-[#0B1733] text-[#F4F7FF]">50 Cases</option>
                  <option value="100" className="bg-[#0B1733] text-[#F4F7FF]">100 Cases (Full Portfolio)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#9AAAC2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FF527A]/15 border border-[#FF527A]/30 text-[#FF527A] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF527A]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#263957]/60 flex items-center justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 text-xs font-medium text-[#9AAAC2] hover:text-[#F4F7FF] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#5945F5] to-[#315CFF] hover:from-[#4c36e8] hover:to-[#264ce0] rounded-xl shadow-lg shadow-[#5945F5]/30 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
                <span>Preview Allocation</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: PREVIEW & CONFIRMATION */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="p-3.5 rounded-xl bg-[#14223A] border border-[#263957] text-xs space-y-1">
              <div className="flex justify-between items-center text-[#315CFF] font-semibold">
                <span>Total Cases Selected:</span>
                <span className="font-mono text-[#F4F7FF] text-sm">{previewData?.total_cases_selected} Cases</span>
              </div>
              <div className="flex justify-between items-center text-[#9AAAC2]">
                <span>Total Portfolio Debt:</span>
                <span className="font-mono text-[#FFB800] font-semibold">
                  ₹{Number(previewData?.total_outstanding_amount || 0).toLocaleString("en-IN")}.00
                </span>
              </div>
              <div className="flex justify-between items-center text-[#9AAAC2]">
                <span>Strategy Applied:</span>
                <span className="font-mono text-[#00C995] font-semibold">{previewData?.strategy}</span>
              </div>
            </div>

            {/* Unallocated Cases Warning if any */}
            {previewData?.unallocated_cases_count > 0 && (
              <div className="p-3.5 rounded-xl bg-[#FFB800]/15 border border-[#FFB800]/30 text-[#FFB800] text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-[#FFB800] shrink-0" />
                  <span>{previewData.unallocated_cases_count} Case(s) could not be allocated</span>
                </div>
                <p className="text-[11px] text-[#FFB800]/80">
                  {previewData.unallocated_cases[0]?.reason || "Staff capacity or portfolio limits reached."}
                </p>
              </div>
            )}

            {/* Employee Breakdown Table */}
            <div>
              <h4 className="text-xs font-semibold text-[#F4F7FF] mb-2">
                Proposed Staff Distribution ({previewData?.allocations?.length} Specialists)
              </h4>
              <div className="rounded-xl border border-[#263957] overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08132D] border-b border-[#263957] text-[#9AAAC2]">
                    <tr>
                      <th className="py-2 px-3">Specialist</th>
                      <th className="py-2 px-3 text-center">Active</th>
                      <th className="py-2 px-3 text-center">Proposed +</th>
                      <th className="py-2 px-3 text-center">Cap. Usage</th>
                      <th className="py-2 px-3 text-right">Allocated Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263957]/60 bg-[#0B1733]">
                    {previewData?.allocations?.map((alloc) => (
                      <tr key={alloc.user_id || alloc.employee_id} className="hover:bg-[#14223A]">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#F4F7FF]">{alloc.employee_name}</div>
                          <div className="text-[10px] text-[#9AAAC2] font-mono">{alloc.employee_id} • {alloc.city || 'HQ'}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-[#9AAAC2] font-mono">
                          {alloc.current_active_cases}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#315CFF]">
                          +{alloc.proposed_cases_count}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            (alloc.capacity_utilization_pct || 0) > 90 ? 'bg-[#FF527A]/20 text-[#FF527A]' : 'bg-[#00C995]/20 text-[#00C995]'
                          }`}>
                            {alloc.capacity_utilization_pct || Math.round((alloc.current_active_cases + alloc.proposed_cases_count) / (alloc.max_workload_capacity || 150) * 100)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#FFB800]">
                          ₹{Number(alloc.proposed_portfolio_amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FF527A]/15 border border-[#FF527A]/30 text-[#FF527A] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="pt-3 border-t border-[#263957] flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep("CONFIG")}
                className="px-3.5 py-2 text-xs font-semibold text-[#9AAAC2] hover:text-[#F4F7FF] rounded-xl hover:bg-[#14223A] border border-[#263957] flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Rules</span>
              </button>
              <button
                type="button"
                onClick={handleExecuteAllocation}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-[#F4F7FF] bg-gradient-to-r from-[#00C995] to-[#06C7E8] hover:from-[#00b384] hover:to-[#05b2d0] rounded-xl shadow-md shadow-[#00C995]/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer font-bold"
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
