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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Transfer Cases Between Staff</h3>
              <p className="text-xs text-slate-400">Reassign accounts with atomic audit history</p>
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Transfer Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setTransferMode("BULK")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                transferMode === "BULK" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Bulk Team Transfer
            </button>
            <button
              type="button"
              onClick={() => setTransferMode("SINGLE")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                transferMode === "SINGLE" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Single Case Reassign
            </button>
          </div>

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
              className="w-1/3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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

