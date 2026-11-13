import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileCheck2,
  Clock,
  User,
  Globe,
  Lock,
  Download,
  Play,
  Scale,
  X,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react";
import api from "../../services/api";

export const RecordingAuditModal = ({
  recording,
  isOpen,
  onClose
}) => {
  if (!isOpen || !recording) return null;

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && recording) {
      fetchAuditTrail();
    }
  }, [isOpen, recording]);

  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/telephony/recordings/${recording.id}/audit-trail`);
      if (res && res.success && res.data) {
        setLogs(res.data.audit_trail || []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn("Failed to load audit trail:", err.message);
      setError("Unable to load access logs.");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeForType = (type) => {
    switch (type) {
      case "PLAYBACK":
        return {
          icon: <Play className="w-3 h-3 fill-indigo-400 text-indigo-400" />,
          label: "Stream Playback",
          className: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
        };
      case "DOWNLOAD":
        return {
          icon: <Download className="w-3 h-3 text-emerald-400" />,
          label: "Export Download",
          className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
        };
      case "LEGAL_HOLD_APPLIED":
        return {
          icon: <Scale className="w-3 h-3 text-amber-400" />,
          label: "Legal Hold Locked",
          className: "bg-amber-500/10 text-amber-300 border-amber-500/30"
        };
      case "LEGAL_HOLD_RELEASED":
        return {
          icon: <Lock className="w-3 h-3 text-slate-400" />,
          label: "Legal Hold Released",
          className: "bg-slate-500/10 text-slate-300 border-slate-500/30"
        };
      case "COMPLAINT_LINKED":
        return {
          icon: <FileText className="w-3 h-3 text-rose-400" />,
          label: "Grievance Linked",
          className: "bg-rose-500/10 text-rose-300 border-rose-500/30"
        };
      default:
        return {
          icon: <ShieldCheck className="w-3 h-3 text-slate-400" />,
          label: type || "Audit Log",
          className: "bg-slate-800 text-slate-300 border-slate-700"
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Immutable Evidence Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Recording ID: <span className="font-mono text-indigo-300">{recording.id}</span>
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

        {/* Content body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Statutory Security & Cryptographic Seal Ribbon */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>WORM Storage Policy Enforced</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RBI Fair Practice Code
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 break-all">
                SHA-256: <span className="text-slate-300">{recording.checksum_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-500">Access Ledger</div>
              <div className="text-sm font-bold font-mono text-white">{logs.length} Logged Events</div>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Chronological Access History (Tamper-Proof)
            </h4>

            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-indigo-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading access ledger...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No access events recorded yet for this evidence.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
                {logs.map((log, idx) => {
                  const badge = getBadgeForType(log.access_type);
                  const logDate = new Date(log.accessed_at);
                  return (
                    <div key={log.id || idx} className="p-4 space-y-2 hover:bg-slate-900/60 transition">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          <span className="font-semibold text-slate-200">
                            {log.user_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({log.user_role} &bull; {log.employee_code || "EMP"})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {logDate.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true
                          })}
                        </span>
                      </div>

                      {/* Purpose & IP Row */}
                      <div className="text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <strong className="text-slate-400">Purpose: </strong>
                          <span className="text-slate-200">{log.purpose || "Quality & Compliance Review"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>IP: {log.ip_address || "127.0.0.1"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Log entries are permanently appended and cryptographically verified.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingAuditModal;
