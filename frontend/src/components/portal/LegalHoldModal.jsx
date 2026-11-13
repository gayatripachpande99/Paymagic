import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  Scale
} from "lucide-react";
import api from "../../services/api";

export const LegalHoldModal = ({
  recording,
  isOpen,
  onClose,
  onHoldUpdated
}) => {
  if (!isOpen || !recording) return null;

  const isCurrentlyLocked = Boolean(recording.is_legal_hold);
  const [reason, setReason] = useState(recording.legal_hold_reason || "");
  const [reference, setReference] = useState(
    recording.legal_hold_reference || `OMBUDS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (actionType) => {
    setLoading(true);
    setError(null);
    try {
      const isLocking = actionType === "lock";
      if (isLocking && !reason.trim()) {
        setError("A formal legal or audit justification is required to place evidence under Legal Hold.");
        setLoading(false);
        return;
      }

      const res = await api.patch(`/telephony/recordings/${recording.id}/legal-hold`, {
        is_legal_hold: isLocking,
        reason: isLocking ? reason.trim() : "Dispute resolved / Tribunal clearance",
        reference: isLocking ? reference.trim() : null
      });

      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onHoldUpdated) onHoldUpdated(res.data);
          onClose();
        }, 1200);
      } else {
        setError(res?.message || "Failed to update legal hold status.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update legal hold.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCurrentlyLocked ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"}`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                {isCurrentlyLocked ? "Evidence Under Legal Hold" : "Place Evidence on Legal Hold"}
              </h3>
              <p className="text-xs text-slate-400">
                Recording: <span className="font-mono text-indigo-300">{recording.id}</span>
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Status Alert Banner */}
          {isCurrentlyLocked ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>EVIDENCE CURRENTLY FROZEN UNDER LEGAL HOLD</span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Automated 365-day statutory retention purge is locked indefinitely. Original audio is preserved for regulatory inspection or court proceedings.
              </p>
              <div className="text-[11px] font-mono text-amber-200 pt-1">
                Ref: {recording.legal_hold_reference || "N/A"}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>Statutory Dispute / Litigation Protection</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Placing this call recording under Legal Hold will immediately freeze retention lifecycle rules, preventing automated archiving or purging under RBI Fair Practice Code guidelines.
              </p>
            </div>
          )}

          {/* Call Metadata Pill */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Borrower:</span>
              <span className="font-semibold text-white">{recording.customer_details?.full_name || "Borrower"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Case Account:</span>
              <span className="font-mono text-slate-200">{recording.case_metadata?.case_number || "CASE-001"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">S3 Vault Location:</span>
              <span className="font-mono text-slate-400 text-[10px] truncate max-w-[260px]">{recording.s3_key}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Encryption:</span>
              <span className="text-emerald-400 font-mono font-semibold">AWS KMS SSE (AES-256)</span>
            </div>
          </div>

          {/* Form Inputs (if locking) */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tribunal / Dispute Reference Number:
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. OMBUDS-2026-8812 or ARB-MUM-901"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Legal Hold Justification &amp; Purpose:
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the formal reason (e.g. Borrower filed formal dispute with Banking Ombudsman regarding interest rate calculations; evidence preserved for tribunal hearing)."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Legal hold status updated successfully. Audit entry logged.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            {isCurrentlyLocked ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("unlock")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Release Legal Hold</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("lock")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-900/30 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Freeze Under Legal Hold</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalHoldModal;
