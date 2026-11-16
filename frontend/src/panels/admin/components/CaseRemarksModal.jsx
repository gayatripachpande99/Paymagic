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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B20]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remarks-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#0B1733] border border-[#263957] rounded-2xl shadow-2xl p-5 sm:p-6 text-[#F4F7FF] space-y-4">
        <div className="flex items-center justify-between border-b border-[#263957] pb-3">
          <div className="flex items-center gap-2 text-[#FFB800]">
            <AlertTriangle className="w-5 h-5" />
            <h3 id="remarks-modal-title" className="font-bold text-sm sm:text-base text-[#F4F7FF]">
              Mandatory Audit Remarks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9AAAC2] hover:text-[#F4F7FF] p-1 rounded-lg hover:bg-[#14223A] transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#9AAAC2] leading-relaxed">
          Per regulatory compliance, transitioning to <strong className="text-[#F4F7FF]">"{pendingStatusValue}"</strong> requires recorded remarks for audit history.
        </p>

        <form onSubmit={handleConfirmRemarksStatusChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9AAAC2] mb-1.5">
              Reason / Remarks <span className="text-[#FF527A]">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Borrower verified, dispute details logged..."
              value={statusRemarksInput}
              onChange={(e) => setStatusRemarksInput(e.target.value)}
              className="w-full p-3 bg-[#14223A] border border-[#263957] rounded-xl text-xs text-[#F4F7FF] placeholder-[#9AAAC2]/60 focus:outline-none focus:border-[#315CFF]"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#9AAAC2] hover:text-[#F4F7FF] rounded-xl hover:bg-[#14223A] border border-[#263957] cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!statusRemarksInput.trim()}
              className="px-4 py-2 text-xs font-semibold text-[#F4F7FF] bg-gradient-to-r from-[#315CFF] to-[#5945F5] hover:from-[#2a50e0] hover:to-[#4e3cd4] rounded-xl disabled:opacity-50 cursor-pointer shadow-md shadow-[#315CFF]/30 transition"
            >
              Confirm Transition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
