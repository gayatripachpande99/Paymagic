import { useState } from "react";
import { Calendar, Clock, MapPin, ShieldCheck, UserCheck, AlertCircle, X, ChevronRight } from "lucide-react";
import api from "../../services/api";

const TIME_SLOTS = [
  { value: "08:00 - 11:00 AM", label: "08:00 AM - 11:00 AM (Morning)" },
  { value: "11:00 - 02:00 PM", label: "11:00 AM - 02:00 PM (Midday)" },
  { value: "02:00 - 05:00 PM", label: "02:00 PM - 05:00 PM (Afternoon)" },
  { value: "05:00 - 07:00 PM", label: "05:00 PM - 07:00 PM (Evening Closing)" }
];

const ZONES = [
  "Pune Metro",
  "Pune East",
  "Pune West",
  "Hadapsar",
  "Kothrud",
  "Viman Nagar",
  "Pimpri Chinchwad",
  "Mumbai Suburbs",
  "Thane District"
];

export default function ScheduleFieldVisitModal({
  isOpen,
  onClose,
  cases = [],
  preselectedCase = null,
  onSuccess
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCase?.id || (cases[0]?.id || ""));
  const [agentId, setAgentId] = useState("usr_field_1");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("11:00 - 02:00 PM");
  const [priority, setPriority] = useState("HIGH");
  const [zone, setZone] = useState("Pune Metro");
  const [instructions, setInstructions] = useState("On-site physical borrower interaction, demand notice service, and spot payment recovery.");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCase = cases.find(c => c.id === selectedCaseId) || preselectedCase;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) {
      setErrorMsg("Please select a loan case for this field visit.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post("/field/schedule", {
        case_id: selectedCaseId,
        field_agent_id: agentId,
        scheduled_date: scheduledDate,
        time_slot: timeSlot,
        priority,
        geographic_zone: zone,
        visit_instructions: instructions
      });

      if (res && res.success) {
        onSuccess(res.message || "Field recovery visit scheduled successfully!");
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to schedule field visit.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Schedule Field Recovery Visit</h3>
              <p className="text-[11px] text-slate-400">Dispatch field enforcement agent to borrower location</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Case Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Loan Case</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              required
            >
              {cases.length === 0 && preselectedCase && (
                <option value={preselectedCase.id}>
                  {preselectedCase.customer_name} ({preselectedCase.loan_account_no}) — ₹{Number(preselectedCase.outstanding_amount).toLocaleString("en-IN")}
                </option>
              )}
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name} ({c.loan_account_no}) — ₹{Number(c.outstanding_amount).toLocaleString("en-IN")} [{c.dpd_bucket || c.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Selected Case Quick Brief */}
          {selectedCase && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[10px] block">Customer:</span>
                <span className="font-bold text-white">{selectedCase.customer_name}</span>
                <span className="text-slate-400 text-[10px] block truncate">{selectedCase.customer_address || "Pune Metro"}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Outstanding Debt:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  ₹{Number(selectedCase.outstanding_amount || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-slate-400 text-[10px] block">{selectedCase.lender_name}</span>
              </div>
            </div>
          )}

          {/* Field Agent & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Field Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="usr_field_1">Vikram Singh (PM-FLD-0001)</option>
                <option value="usr_supervisor">Aarav Mehta (Supervisor)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Visit Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                required
              />
            </div>
          </div>

          {/* Time Slot & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot (RBI Hours)</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                {TIME_SLOTS.map((ts) => (
                  <option key={ts.value} value={ts.value}>
                    {ts.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="URGENT">URGENT (Action Today)</option>
                <option value="HIGH">HIGH Priority</option>
                <option value="NORMAL">NORMAL Routine</option>
              </select>
            </div>
          </div>

          {/* Zone Cluster */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Geographic Zone Cluster</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Instructions / Objective</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              placeholder="e.g. Serve demand notice, verify collateral vehicle/property, collect spot settlement..."
            />
          </div>

          {/* RBI Statutory Compliance Callout */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-[11px] text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>RBI Fair Practices Code:</strong> Field visits must occur strictly between 07:00 AM and 07:00 PM IST. The agent must display their official PayMagic ID badge upon arrival and maintain polite, respectful communication.
            </div>
          </div>

          {/* Form Actions */}
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
              className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition"
            >
              {loading ? "Scheduling Visit..." : "Dispatch & Schedule Visit"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
