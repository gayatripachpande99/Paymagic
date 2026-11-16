import React, { useState } from "react";
import {
  ArrowRightLeft,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  Layers
} from "lucide-react";
import api from "../../services/api";

export const TransferCasesModal = ({
  employees = [],
  cases = [],
  isOpen,
  onClose,
  onSuccess
}) => {
  const [transferMode, setTransferMode] = useState("BULK"); // 'BULK' | 'SINGLE'
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || "");
  const [fromEmployeeId, setFromEmployeeId] = useState(employees[0]?.employeeId || employees[0]?.id || "");
  const [toEmployeeId, setToEmployeeId] = useState(employees[1]?.employeeId || employees[1]?.id || "");
  const [transferCount, setTransferCount] = useState("10");
  const [reason, setReason] = useState("Operations workload rebalancing & skill-based allocation");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [rebalanceLoading, setRebalanceLoading] = useState(false);
  const [rebalanceRecommendations, setRebalanceRecommendations] = useState(null);

  if (!isOpen) return null;

  const handleFetchRebalance = async () => {
    try {
      setRebalanceLoading(true);
      setErrorMsg("");
      const res = await api.post("/allocation/rebalance/preview", {});
      if (res && res.success) {
        setRebalanceRecommendations(res.data);
        if (res.data.recommendations && res.data.recommendations.length > 0) {
          const first = res.data.recommendations[0];
          setFromEmployeeId(first.from_employee_id);
          setToEmployeeId(first.to_employee_id);
          setReason(first.reason);
        }
      } else {
        setErrorMsg(res?.message || "No rebalance recommendations available.");
      }
    } catch (err) {
      console.error("Rebalance error:", err);
      setErrorMsg(err.message || "Failed to load rebalancing recommendations.");
    } finally {
      setRebalanceLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fromEmployeeId === toEmployeeId) {
      setErrorMsg("Target employee must be different from source employee.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        toEmployeeId,
        reason: reason || "Administrative case transfer",
        ...(transferMode === "SINGLE"
          ? { caseId: selectedCaseId }
          : { fromEmployeeId, count: parseInt(transferCount, 10) || 10 })
      };

      const res = await api.post("/cases/transfer", payload);

      if (res && res.success) {
        if (onSuccess) {
          onSuccess(res.message || "Cases transferred successfully!");
        }
        onClose();
      } else {
        setErrorMsg(res?.message || "Failed to transfer case(s).");
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setErrorMsg(err.message || "Failed to transfer case(s).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B20]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0B1733] border border-[#263957] rounded-2xl shadow-2xl overflow-hidden text-[#F4F7FF]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#263957] bg-[#08132D] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14223A] border border-[#315CFF]/30 text-[#315CFF] flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F4F7FF] text-sm sm:text-base">Transfer Cases Between Staff</h3>
              <p className="text-xs text-[#9AAAC2]">Reassign accounts with atomic audit history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9AAAC2] hover:text-[#F4F7FF] rounded-lg hover:bg-[#14223A] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Transfer Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-[#08132D] border border-[#263957]">
            <button
              type="button"
              onClick={() => setTransferMode("BULK")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                transferMode === "BULK" ? "bg-gradient-to-r from-[#315CFF] to-[#5945F5] text-white shadow" : "text-[#9AAAC2] hover:text-white"
              }`}
            >
              Bulk Team Transfer
            </button>
            <button
              type="button"
              onClick={() => setTransferMode("SINGLE")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                transferMode === "SINGLE" ? "bg-gradient-to-r from-[#315CFF] to-[#5945F5] text-white shadow" : "text-[#9AAAC2] hover:text-white"
              }`}
            >
              Single Case Reassign
            </button>
          </div>

          {/* Automated Rebalancing Suggestion Button */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14223A] border border-[#263957] text-xs">
            <span className="text-[#315CFF] font-medium">Intelligent Workload Balancing:</span>
            <button
              type="button"
              onClick={handleFetchRebalance}
              disabled={rebalanceLoading}
              className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              {rebalanceLoading ? "Analyzing Workloads..." : "Suggest Rebalance"}
            </button>
          </div>

          {rebalanceRecommendations && (
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1 text-slate-300">
              <div className="font-semibold text-emerald-400">
                {rebalanceRecommendations.rebalance_required
                  ? `Identified ${rebalanceRecommendations.total_proposed_transfers} potential transfer(s) from overloaded staff.`
                  : "All active staff workloads are currently balanced."}
              </div>
            </div>
          )}

          {/* Single Case Mode */}
          {transferMode === "SINGLE" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Recovery Case <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} &bull; {c.customer_name || "Borrower"} &bull; ₹{Number(c.outstanding_amount || 0).toLocaleString()} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Bulk Mode */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Transfer From Staff
                  </label>
                  <select
                    value={fromEmployeeId}
                    onChange={(e) => setFromEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    Number of Active Cases
                  </label>
                  <select
                    value={transferCount}
                    onChange={(e) => setTransferCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="5">5 Cases</option>
                    <option value="10">10 Cases</option>
                    <option value="25">25 Cases</option>
                    <option value="50">50 Cases</option>
                    <option value="100">All Active Cases</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Target Employee */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reassign / Transfer To <span className="text-rose-400">*</span>
            </label>
            <select
              value={toEmployeeId}
              onChange={(e) => setToEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                  {emp.fullName || emp.full_name} ({emp.employeeId || emp.id}) - {emp.designation || "Executive"}
                </option>
              ))}
            </select>
          </div>

          {/* Reason / Transfer Remark */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason / Transfer Remark <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Workload rebalance, caller on leave, or escalation to field team..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Audit Rule Notice */}
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              CRITICAL RULE ENFORCED: Every reassigned case automatically creates an audit entry in <strong>case_status_history</strong> with timestamp, administrator ID, previous assigned staff, and new assigned staff.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-2.5 px-4 rounded-xl bg-[#14223A] hover:bg-[#1b2e4f] text-[#9AAAC2] hover:text-[#F4F7FF] border border-[#263957] text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#315CFF] to-[#5945F5] hover:from-[#2a50e0] hover:to-[#4e3cd4] disabled:opacity-50 text-[#F4F7FF] text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#315CFF]/30 transition transform active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#00C995]" />
                  <span>Confirm Case Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferCasesModal;

