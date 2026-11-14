import React, { useState } from "react";
import {
  Target,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

export const SetTargetModal = ({
  employees = [],
  cases = [],
  isOpen,
  onClose,
  onSuccess
}) => {
  const [modalMode, setModalMode] = useState("TARGET"); // 'TARGET' | 'FOLLOWUP'
  
  // Target state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.employeeId || employees[0]?.id || "");
  const [targetAmount, setTargetAmount] = useState("100000");
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

  // Follow-up state
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || "");
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");

      if (modalMode === "TARGET") {
        const payload = {
          employeeId: selectedEmpId,
          month: parseInt(targetMonth, 10),
          year: parseInt(targetYear, 10),
          target_amount: parseFloat(targetAmount) || 100000
        };

        const res = await api.post("/cases/targets", payload);
        if (res && res.success) {
          if (onSuccess) onSuccess(res.message || "Monthly recovery target set successfully!");
          onClose();
        } else {
          setErrorMsg(res?.message || "Failed to set target.");
        }
      } else {
        // Follow-up date mode
        const res = await api.patch(`/cases/${selectedCaseId}/follow-up`, {
          follow_up_date: followUpDate
        });
        if (res && res.success) {
          if (onSuccess) onSuccess(`Follow-up date scheduled for ${followUpDate}!`);
          onClose();
        } else {
          setErrorMsg(res?.message || "Failed to schedule follow-up date.");
        }
      }
    } catch (err) {
      console.error("Target / Follow-up error:", err);
      setErrorMsg(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              {modalMode === "TARGET" ? <Target className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                {modalMode === "TARGET" ? "Set Recovery Target" : "Schedule Follow-up Date"}
              </h3>
              <p className="text-xs text-slate-400">Operations performance &amp; timeline control</p>
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
          
          {/* Mode Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setModalMode("TARGET")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                modalMode === "TARGET" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Set Recovery Target
            </button>
            <button
              type="button"
              onClick={() => setModalMode("FOLLOWUP")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                modalMode === "FOLLOWUP" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Schedule Follow-up
            </button>
          </div>

          {modalMode === "TARGET" ? (
            /* Target Mode Inputs */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Staff Member / Specialist
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL" className="font-semibold text-emerald-400">
                    &bull; All Active Recovery Specialists (Team-wide Target)
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                      {emp.fullName || emp.full_name} ({emp.employeeId || emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monthly Recovery Target Amount (₹) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="100000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Month</label>
                  <select
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2026, i, 1).toLocaleString("en-US", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Year</label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Follow-up Mode Inputs */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Case
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} &bull; {c.customer_name || "Borrower"} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Follow-up Due Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{modalMode === "TARGET" ? "Set Recovery Target" : "Confirm Schedule"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetTargetModal;

