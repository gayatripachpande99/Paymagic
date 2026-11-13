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
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

export const BulkAllocateModal = ({
  employees = [],
  isOpen,
  onClose,
  onSuccess
}) => {
  const [allocationRule, setAllocationRule] = useState("AMOUNT_DESC");
  const [targetEmployeeId, setTargetEmployeeId] = useState(employees[0]?.employeeId || "PM-EMP-0001");
  const [batchSize, setBatchSize] = useState("25");
  const [targetCity, setTargetCity] = useState("Mumbai");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        rule: allocationRule,
        targetEmployeeId,
        limit: parseInt(batchSize, 10) || 25,
        city: allocationRule === "LOCATION" ? targetCity : undefined
      };

      const res = await api.post("/cases/bulk-assign", payload);

      if (res && res.success) {
        if (onSuccess) {
          onSuccess(res.message || `Successfully allocated ${batchSize} cases.`);
        }
        onClose();
      } else {
        setErrorMsg(res?.message || "Failed to bulk allocate cases.");
      }
    } catch (err) {
      console.error("Bulk allocation error:", err);
      setErrorMsg(err.message || "Failed to bulk allocate cases.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Rule-Based Bulk Case Allocation</h3>
              <p className="text-xs text-slate-400">Algorithmic debt distribution engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAllocate} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Rule Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Allocation Algorithm / Strategy <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              <button
                type="button"
                onClick={() => setAllocationRule("AMOUNT_DESC")}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  allocationRule === "AMOUNT_DESC"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                  <span>By Outstanding Debt</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Prioritizes largest outstanding amounts to senior specialists
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAllocationRule("WORKLOAD_BALANCED")}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  allocationRule === "WORKLOAD_BALANCED"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Workload Balanced</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Distributes equally across active callers to prevent overload
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
                  <span>Location / City Geo</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Clusters borrowers by geographical region for field and phone recovery
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAllocationRule("PRIORITY_CRITICAL")}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  allocationRule === "PRIORITY_CRITICAL"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Critical Priority First</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Targets 90+ DPD accounts nearing legal action or write-off
                </p>
              </button>
            </div>
          </div>

          {/* Conditional City Input if Location Selected */}
          {allocationRule === "LOCATION" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target City / Region
              </label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Mumbai">Mumbai Metropolitan Region</option>
                <option value="Pune">Pune &amp; PCMC</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru Urban</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          )}

          {/* Target Employee & Batch Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assign To Staff Member
              </label>
              <select
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                    {emp.fullName || emp.full_name} ({emp.employeeId || emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Number of Cases
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="10">10 Cases</option>
                <option value="25">25 Cases</option>
                <option value="50">50 Cases</option>
                <option value="100">100 Cases</option>
              </select>
            </div>
          </div>

          {/* Atomic Transaction Notice */}
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Transactions: Every re-assigned case status change is recorded with administrator ID, timestamp, and audit trail inside the database.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Allocating Cases...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Bulk Allocation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAllocateModal;

