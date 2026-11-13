import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  Loader2,
  Scale
} from "lucide-react";
import api from "../../services/api";

const RESOLUTION_CATEGORIES = [
  { id: "AGENT_CORRECTIVE_ACTION", label: "Agent Corrective Action (Counseling / Reprimand / Reassignment)" },
  { id: "BORROWER_CLARIFICATION", label: "Borrower Clarification (Legitimate dues explained & verified)" },
  { id: "STATEMENT_RECONCILED", label: "Statement Reconciled (Missing payment or bank credit adjusted)" },
  { id: "UNSUBSTANTIATED", label: "Unsubstantiated / Cleared (Audio recordings confirm fair practice)" }
];

export const ResolveComplaintModal = ({
  complaint,
  isOpen,
  onClose,
  onResolved
}) => {
  if (!isOpen || !complaint) return null;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Resolved");
  const [category, setCategory] = useState("AGENT_CORRECTIVE_ACTION");
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes || "");
  const [correctiveAction, setCorrectiveAction] = useState(complaint.corrective_action || "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError("Please enter detailed findings and investigation notes.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/complaints/${complaint.id}/resolve`, {
        status,
        resolution_category: category,
        resolution_notes: resolutionNotes.trim(),
        corrective_action: correctiveAction.trim()
      });

      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onResolved) onResolved(res.data.complaint);
          onClose();
        }, 1200);
      } else {
        setError(res?.message || "Failed to document resolution.");
      }
    } catch (err) {
      console.error("resolveComplaint error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to resolve complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Document Grievance Resolution</h3>
              <p className="text-xs text-slate-400">
                Ticket: <span className="font-mono text-indigo-300">{complaint.complaint_number}</span> &bull; {complaint.customer_details?.full_name || "Borrower"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Complaint Context Card */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span>Category:</span>
              <strong className="text-white">{complaint.complaint_type}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Reported Staff:</span>
              <span className="text-slate-200">{complaint.reported_employee_details?.full_name} ({complaint.reported_employee_details?.employee_code})</span>
            </div>
            <p className="text-slate-300 text-[11px] italic pt-1 border-t border-slate-800">
              "{complaint.description}"
            </p>
          </div>

          {/* Resolution Outcome Status & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Resolution State:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="Resolved">Resolved (Corrective Actions Applied)</option>
                <option value="Closed">Closed (Concluded &amp; Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Resolution Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {RESOLUTION_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Investigation Findings Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Supervisory Investigation Findings &amp; Analysis:
            </label>
            <textarea
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="State the findings after reviewing calling logs, recordings, and staff notes (e.g. Listened to recording TEL-10042; confirmed call ended at 6:48 PM IST before cutoff; explained installment breakdown to borrower; customer confirmed satisfaction)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Corrective Action Taken */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Corrective / Preventive Action Implemented:
            </label>
            <textarea
              rows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="e.g. Agent attended Fair Practice refresher; Account statement re-sent via email; Call audio sealed under legal hold for lending partner review..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
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
              <span>Grievance resolution documented. Audit action ledger permanently updated.</span>
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

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Save Resolution &amp; Close</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveComplaintModal;

