import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function CaseRemarksModal({
  isOpen = false,
  onClose,
  pendingStatusValue = "",
  statusRemarksInput = "",
  setStatusRemarksInput,
  handleConfirmRemarksStatusChange
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base">Mandatory Status Remarks</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Per regulatory compliance, transitioning to <strong className="text-white">"{pendingStatusValue}"</strong> requires recorded remarks for audit history.
        </p>

        <form onSubmit={handleConfirmRemarksStatusChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason / Remarks <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Borrower verified, dispute details logged..."
              value={statusRemarksInput}
              onChange={(e) => setStatusRemarksInput(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!statusRemarksInput.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Confirm Transition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

