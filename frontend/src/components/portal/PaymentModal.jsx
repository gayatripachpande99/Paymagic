import React, { useState } from "react";
import {
  IndianRupee,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  X,
  Loader2,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

const PAYMENT_MODES = ["UPI", "NetBanking", "NEFT", "Cash", "Cheque", "DebitCard"];

export const PaymentModal = ({
  caseData,
  isOpen,
  onClose,
  onPaymentRecorded
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !caseData) return null;

  const outstanding = Number(caseData.outstanding_amount || caseData.assignedAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid recovery payment amount.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        amount: numAmount,
        payment_mode: paymentMode,
        transaction_ref: transactionRef || `TXN-PM-${Date.now().toString().slice(-8)}`,
        notes: notes || `Direct settlement recorded for ${caseData.customer_name || 'Borrower'}`
      };

      const res = await api.post(`/cases/${caseData.id}/payments`, payload);

      if (res && res.success) {
        if (onPaymentRecorded) {
          onPaymentRecorded(res.data);
        }
        onClose();
      } else {
        setErrorMsg(res?.message || "Failed to record payment.");
      }
    } catch (err) {
      console.error("Payment recording error:", err);
      setErrorMsg(err.message || "Failed to record payment.");
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Record Recovery Payment</h3>
              <p className="text-xs text-slate-400">
                Case #{caseData.case_number} &bull; {caseData.lender_name || "Lending Bank"}
              </p>
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
          
          {/* Case Info Summary */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Borrower:</span>
              <strong className="text-white">{caseData.customer_name || caseData.borrowerName || "Borrower"}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Loan Account:</span>
              <strong className="text-slate-300 font-mono">{caseData.loan_account_no || "LON-99210"}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Outstanding:</span>
              <strong className="text-amber-400 font-semibold text-sm">
                ₹{outstanding.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(String(Math.round(outstanding * 0.25)))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
              >
                25% (₹{Math.round(outstanding * 0.25).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setAmount(String(Math.round(outstanding * 0.5)))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
              >
                50% (₹{Math.round(outstanding * 0.5).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setAmount(String(outstanding))}
                className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[11px] text-emerald-400 font-medium"
              >
                Full Settle (₹{outstanding.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Payment Mode & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Receipt / Ref No.
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="TXN-2026-001"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Settlement Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Settlement Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Borrower paid through UPI QR code during outreach conversation..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Atomic Transaction Notice */}
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Atomic Transaction: Automatically reduces outstanding balance, adjusts case status (Partially Paid or Fully Paid), and generates an audit log entry in <strong>case_status_history</strong>.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Submit Buttons */}
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
              className="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Reconcile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

