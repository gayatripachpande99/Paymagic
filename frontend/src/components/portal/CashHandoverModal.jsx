import { useState } from "react";
import { IndianRupee, Building2, FileCheck2, AlertCircle, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

const BRANCHES = [
  "Pune FC Road Branch (HQ Collection Counter)",
  "Pune Hadapsar Branch",
  "Pune Camp / MG Road Branch",
  "Pune Viman Nagar Branch",
  "Pimpri Chinchwad Branch",
  "Mumbai Andheri East Branch",
  "Thane West Collection Branch"
];

export default function CashHandoverModal({
  isOpen,
  onClose,
  cashInHand = 8500,
  onSuccess
}) {
  const [amount, setAmount] = useState(String(cashInHand || 8500));
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [depositSlip, setDepositSlip] = useState(`SLIP-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState("End of day physical currency collection settlement at branch.");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) {
      setErrorMsg("Please enter a valid cash amount to handover.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post("/field/cash-handover", {
        amount: val,
        branch_name: branch,
        deposit_slip_ref: depositSlip,
        notes
      });

      if (res && res.success) {
        onSuccess(res.message || "Cash handover submitted successfully!");
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit cash handover.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cash Collection Handover</h3>
              <p className="text-[11px] text-slate-400">Daily physical currency deposit to branch teller</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Cash in Hand Banner */}
        <div className="my-4 p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Active Cash-in-Hand
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              ₹{Number(cashInHand || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(cashInHand || 0))}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition"
          >
            Deposit All
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Handover Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Branch / Cash Counter</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Deposit Slip / CMS Receipt #</label>
            <input
              type="text"
              value={depositSlip}
              onChange={(e) => setDepositSlip(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs"
              placeholder="e.g. SLIP-ICICI-99214"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Settlement Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong>Audit Record:</strong> This submission generates an immutable transaction log. Once the branch cashier or supervisor verifies physical currency, your cash-in-hand ledger is reconciled.
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Submitting..." : "Submit for Reconciliation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
