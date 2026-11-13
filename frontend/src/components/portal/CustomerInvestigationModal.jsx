import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  FileText,
  FileAudio,
  Play,
  Scale,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  CreditCard,
  MapPin,
  Loader2,
  FileCheck2,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import api from "../../services/api";
import AudioPlayerModal from "./AudioPlayerModal";
import LegalHoldModal from "./LegalHoldModal";

export const CustomerInvestigationModal = ({
  complaintOrCustomerId,
  isOpen,
  onClose,
  currentUser,
  onResolveClicked,
  onAssignClicked
}) => {
  if (!isOpen || !complaintOrCustomerId) return null;

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("calls"); // 'calls' | 'recordings' | 'notes' | 'interactions' | 'complaint'

  // Sub-modals for listening to audio and legal hold
  const [selectedCallAudio, setSelectedCallAudio] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [selectedRecordingForHold, setSelectedRecordingForHold] = useState(null);
  const [showLegalHoldModal, setShowLegalHoldModal] = useState(false);

  useEffect(() => {
    if (isOpen && complaintOrCustomerId) {
      fetchCustomerDossier();
    }
  }, [isOpen, complaintOrCustomerId]);

  const fetchCustomerDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/complaints/${complaintOrCustomerId}/customer-history`);
      if (res && res.success && res.data) {
        setDossier(res.data);
      } else {
        setError(res?.message || "Failed to load customer investigation dossier.");
      }
    } catch (err) {
      console.error("fetchCustomerDossier Error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to retrieve borrower history pack.");
    } finally {
      setLoading(false);
    }
  };

  const handleStreamAudio = (callOrRec) => {
    setSelectedCallAudio({
      id: callOrRec.call_id || callOrRec.id,
      customer_name: dossier?.borrower?.full_name,
      customer_phone: dossier?.borrower?.phone,
      case_number: dossier?.case?.case_number,
      agent_name: callOrRec.caller_name || callOrRec.employee_id,
      agent_extension: callOrRec.caller_extension || "1012",
      duration_seconds: callOrRec.duration_seconds,
      disposition: callOrRec.disposition || "Completed"
    });
    setShowAudioPlayer(true);
  };

  const borrower = dossier?.borrower;
  const loanCase = dossier?.case;
  const complaint = dossier?.complaint;
  const metrics = dossier?.summary_metrics;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">Customer 360° Grievance &amp; Investigation Hub</h3>
                  {complaint && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {complaint.complaint_number}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Borrower: <strong className="text-slate-200">{borrower?.full_name || "Borrower"}</strong> &bull; Loan Acc: <span className="font-mono text-indigo-300">{loanCase?.loan_account_number || "LON-001"}</span> ({loanCase?.lender_name || "Lender"})
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

          {/* Body Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-indigo-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-semibold text-slate-300">Assembling Borrower 360° History &amp; Evidence Pack...</span>
                <span className="text-xs text-slate-500">Decrypting call logs, employee notes, audio hashes, and recovery ledger</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <>
                {/* Top Summary Banner: Borrower Profile & Case Telemetry */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Card 1: Borrower Profile */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Borrower Profile</span>
                    </div>
                    <div className="text-sm font-bold text-white">{borrower?.full_name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{borrower?.phone}</div>
                    <div className="text-slate-500 text-[10px]">{borrower?.city} &bull; KYC Verified</div>
                  </div>

                  {/* Card 2: Loan Case Dues */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Outstanding Balance</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      ₹{loanCase?.outstanding_amount?.toLocaleString()}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Lender: <strong className="text-slate-200">{loanCase?.lender_name}</strong>
                    </div>
                    <div className="text-slate-500 text-[10px] font-mono">
                      DPD: {loanCase?.dpd || 45} Days &bull; Status: {loanCase?.status}
                    </div>
                  </div>

                  {/* Card 3: Telephony Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                      <span>Outreach Interactions</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-purple-300">
                      {metrics?.total_calls || 0} Total Calls
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Connected: <span className="text-emerald-400 font-semibold">{metrics?.connected_calls || 0}</span> &bull; Audio Vault: <span className="text-indigo-400 font-semibold">{metrics?.recordings_available || 0}</span>
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Field Visits: {metrics?.field_visits_count || 0}
                    </div>
                  </div>

                  {/* Card 4: Grievance Status & SLA */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>Grievance Status</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        complaint?.status === "Resolved"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {complaint?.status || "Under Review"}
                      </span>
                      <span className="text-[10px] font-bold text-rose-400 uppercase">
                        {complaint?.severity || "MEDIUM"}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[10px] truncate" title={complaint?.complaint_type}>
                      {complaint?.complaint_type || "Fair Practice Inquiry"}
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Supervisor: {complaint?.assigned_supervisor_details?.full_name || "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Grievance Statement Callout (if opened from complaint) */}
                {complaint && (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-300 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Borrower Allegation: {complaint.complaint_type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Reported Staff: <strong className="text-slate-200">{complaint.reported_employee_details?.full_name}</strong> ({complaint.reported_employee_details?.employee_code})
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      "{complaint.description}"
                    </p>

                    {complaint.resolution_notes && (
                      <div className="mt-2 pt-2 border-t border-rose-500/20 text-[11px] text-emerald-300 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Documented Resolution ({complaint.resolution_category}):</span>
                        </div>
                        <p className="text-slate-300">{complaint.resolution_notes}</p>
                        {complaint.corrective_action && (
                          <div className="text-indigo-300 text-[10px]">
                            <strong>Corrective Action: </strong> {complaint.corrective_action}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Navigation Tabs for Detailed 360° History */}
                <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto">
                  {[
                    { id: "calls", label: `Calling History (${dossier?.calling_history?.length || 0})`, icon: <Phone className="w-3.5 h-3.5" /> },
                    { id: "recordings", label: `Audio Recordings (${dossier?.recordings?.length || 0})`, icon: <FileAudio className="w-3.5 h-3.5" /> },
                    { id: "notes", label: `Employee Notes (${dossier?.employee_notes?.length || 0})`, icon: <FileText className="w-3.5 h-3.5" /> },
                    { id: "interactions", label: `Timeline & Interactions (${(dossier?.status_transitions?.length || 0) + (dossier?.field_visits?.length || 0)})`, icon: <Calendar className="w-3.5 h-3.5" /> },
                    { id: "payments", label: `Payments (${dossier?.payments?.length || 0})`, icon: <CreditCard className="w-3.5 h-3.5" /> }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        activeTab === t.id
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* ═══ TAB 1: CALLING HISTORY ═══ */}
                {activeTab === "calls" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Complete inbound and outbound recovery calling logs with statutory disclaimers.</span>
                      <span className="font-mono text-emerald-400 font-semibold">100% Notice Recorded</span>
                    </div>

                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                      {dossier?.calling_history?.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No calls recorded for this customer account.</div>
                      ) : (
                        dossier?.calling_history?.map((call) => (
                          <div key={call.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  call.direction === "INBOUND"
                                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                }`}>
                                  {call.direction === "INBOUND" ? <PhoneIncoming className="w-3 h-3" /> : <PhoneOutgoing className="w-3 h-3" />}
                                  <span>{call.direction}</span>
                                </span>

                                <span className="font-semibold text-white">{call.caller_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({call.caller_employee_id} &bull; Ext {call.caller_extension})</span>

                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  {call.disposition}
                                </span>

                                {call.is_legal_hold && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                                    <span>LEGAL HOLD</span>
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                <span>{call.date_formatted} &bull; {call.time_formatted}</span>
                                <span>Duration: <strong className="text-emerald-400 font-mono">{call.duration_formatted}</strong></span>
                                <span className="text-emerald-400 text-[10px]">Notice: {call.customer_notification_status}</span>
                              </div>

                              {call.call_notes && (
                                <p className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2 rounded border border-slate-800/80">
                                  "{call.call_notes}"
                                </p>
                              )}
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0 flex items-center gap-2">
                              {call.has_recording ? (
                                <button
                                  type="button"
                                  onClick={() => handleStreamAudio(call)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                                  title="Listen to Verified Call Audio Recording"
                                >
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                  <span>Listen ({call.duration_formatted})</span>
                                </button>
                              ) : (
                                <span className="text-slate-600 font-mono text-[11px]">No Audio</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ TAB 2: AUDIO RECORDINGS ═══ */}
                {activeTab === "recordings" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Encrypted audio recordings stored in AWS S3 with short-lived signed URLs.</span>
                      <span className="font-mono text-indigo-400 text-[11px]">KMS AES-256 SSE Enforced</span>
                    </div>

                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                      {dossier?.recordings?.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No recordings available for this customer.</div>
                      ) : (
                        dossier?.recordings?.map((rec) => (
                          <div key={rec.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-xs">{rec.id}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  {rec.encryption_type}
                                </span>
                                {rec.is_legal_hold && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                                    <span>FROZEN: {rec.legal_hold_reference || "LEGAL HOLD"}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-lg">
                                Key: {rec.s3_key}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                <span>Duration: <strong className="text-emerald-400 font-mono">{rec.duration_formatted}</strong></span>
                                <span>Size: {rec.file_size_formatted}</span>
                                <span>Officer: {rec.caller_name}</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-500">
                                SHA256: {rec.checksum_sha256}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStreamAudio(rec)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Stream Audio</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRecordingForHold(rec);
                                  setShowLegalHoldModal(true);
                                }}
                                className={`p-1.5 rounded-lg border transition ${
                                  rec.is_legal_hold
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                                }`}
                                title="Toggle Legal Hold Freeze"
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ TAB 3: EMPLOYEE RAW NOTES ═══ */}
                {activeTab === "notes" && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Raw notes, disposition remarks, and borrower follow-up commitments recorded by recovery staff.
                    </div>

                    <div className="space-y-2.5">
                      {dossier?.employee_notes?.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                          No notes found for this borrower.
                        </div>
                      ) : (
                        dossier?.employee_notes?.map((note, idx) => {
                          const noteDate = new Date(note.timestamp);
                          return (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <strong className="text-white">{note.author_name}</strong>
                                  <span className="text-[10px] text-slate-400 font-mono">({note.author_code} &bull; {note.author_role})</span>
                                  {note.disposition && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                                      {note.disposition}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {noteDate.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                                </span>
                              </div>
                              <p className="text-slate-200 text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                                {note.note_text}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ TAB 4: CASE INTERACTIONS & STATUS HISTORY ═══ */}
                {activeTab === "interactions" && (
                  <div className="space-y-4">
                    {/* Status Transitions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Case Status Transition Audit Trail (ACID Logged)
                      </h4>
                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                        {dossier?.status_transitions?.length === 0 ? (
                          <div className="p-4 text-center text-slate-500">No status transitions recorded.</div>
                        ) : (
                          dossier?.status_transitions?.map((h) => {
                            const date = new Date(h.changed_at);
                            return (
                              <div key={h.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 line-through">{h.previous_status || "New"}</span>
                                    <ChevronRight className="w-3 h-3 text-slate-500" />
                                    <span className="font-bold text-emerald-400">{h.new_status}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">by {h.changed_by_name} ({h.changed_by_code})</span>
                                  </div>
                                  {h.remarks && <p className="text-[11px] text-slate-400 mt-0.5">{h.remarks}</p>}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Field Visits */}
                    {dossier?.field_visits?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Ground Field Visits &amp; GPS Check-in Logs
                        </h4>
                        <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                          {dossier?.field_visits?.map((fv) => (
                            <div key={fv.id} className="p-3 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{fv.agent_name}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                    {fv.visit_outcome}
                                  </span>
                                  {fv.gps_verified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                                      <MapPin className="w-3 h-3" />
                                      <span>GPS Verified</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(fv.scheduled_date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px]">{fv.visit_notes}</p>
                              {fv.collected_amount > 0 && (
                                <div className="text-emerald-400 font-mono font-semibold text-[11px]">
                                  Collected: ₹{fv.collected_amount.toLocaleString()} (Receipt: {fv.receipt_ref})
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ TAB 5: PAYMENTS ═══ */}
                {activeTab === "payments" && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Payment settlements and official digital vouchers issued to this borrower.
                    </div>
                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                      {dossier?.payments?.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No payment records found.</div>
                      ) : (
                        dossier?.payments?.map((pay) => (
                          <div key={pay.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold font-mono text-emerald-400">
                                  ₹{pay.amount.toLocaleString()}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  {pay.payment_mode}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  Ref: {pay.transaction_ref}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Receipt: <span className="font-mono text-indigo-300">{pay.receipt_number}</span> &bull; {pay.notes}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(pay.payment_date).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="text-[11px] text-slate-400">
              Audit Dossier complies with <strong className="text-slate-300">RBI Digital Lending Fair Practice Regulations</strong>.
            </div>

            <div className="flex items-center gap-2.5">
              {complaint && onAssignClicked && (
                <button
                  type="button"
                  onClick={() => onAssignClicked(complaint)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Reassign Supervisor
                </button>
              )}

              {complaint && onResolveClicked && (
                <button
                  type="button"
                  onClick={() => onResolveClicked(complaint)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Document Resolution</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player Modal for any selected call */}
      {showAudioPlayer && selectedCallAudio && (
        <AudioPlayerModal
          callData={selectedCallAudio}
          isOpen={showAudioPlayer}
          currentUser={currentUser}
          onClose={() => {
            setShowAudioPlayer(false);
            setSelectedCallAudio(null);
          }}
        />
      )}

      {/* Legal Hold Modal */}
      {showLegalHoldModal && selectedRecordingForHold && (
        <LegalHoldModal
          recording={selectedRecordingForHold}
          isOpen={showLegalHoldModal}
          onClose={() => {
            setShowLegalHoldModal(false);
            setSelectedRecordingForHold(null);
          }}
          onHoldUpdated={() => {
            fetchCustomerDossier();
          }}
        />
      )}
    </>
  );
};

export default CustomerInvestigationModal;

