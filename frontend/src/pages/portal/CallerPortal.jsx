import React, { useState, useEffect } from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import CaseDetailModal from "../../components/portal/CaseDetailModal";
import AnimatedCounter from "../../components/common/AnimatedCounter";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Volume2,
  Calendar,
  Send,
  UserCheck,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export const CallerPortal = () => {
  const { user } = useAuth();

  // Data states
  const [cases, setCases] = useState([]);
  const [calls, setCalls] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailCaseId, setDetailCaseId] = useState(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Active call state
  const [callState, setCallState] = useState("IDLE"); // IDLE, DIALING, IN_CALL, OUTCOME_PENDING
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // Outcome form state
  const [outcomeData, setOutcomeData] = useState({
    callOutcome: "Promise to Pay",
    callNotes: "",
    nextFollowUpDate: "",
    newCaseStatus: "Promise to Pay"
  });
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Audio player state
  const [playingCallId, setPlayingCallId] = useState(null);

  // Load caller data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, kpiRes, callsRes] = await Promise.all([
        api.get("/cases?limit=100"),
        api.get("/dashboard/employee"),
        api.get("/telephony/calls?limit=25")
      ]);

      if (casesRes.success && casesRes.data) {
        setCases(casesRes.data.cases || []);
      }
      if (kpiRes.success && kpiRes.data) {
        setKpi(kpiRes.data);
      }
      if (callsRes.success && callsRes.data) {
        setCalls(callsRes.data.calls || []);
      }
    } catch (err) {
      console.error("Failed to load caller data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer;
    if (callState === "IN_CALL") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Click-to-call: initiates telephony call
  const handleInitiateCall = async (c) => {
    setSelectedCase(c);
    setCallState("DIALING");
    setActionError("");
    setActionSuccess("");

    try {
      // Simulate real cloud telephony connect
      const res = await api.post("/telephony/simulate", { caseId: c.id });
      if (res.success && res.data) {
        setActiveCall(res.data.call);
        setCallState("IN_CALL");
        setCallDuration(0);
      } else {
        throw new Error(res.message || "Failed to bridge telephony channel.");
      }
    } catch (err) {
      setActionError(err.message || "Could not connect call.");
      setCallState("IDLE");
    }
  };

  // End call & transition to outcome form
  const handleEndCall = () => {
    setCallState("OUTCOME_PENDING");
  };

  // Submit Call Outcome
  const handleSubmitOutcome = async (e) => {
    e.preventDefault();
    if (!activeCall) return;

    setSubmittingOutcome(true);
    setActionError("");

    try {
      const res = await api.post("/telephony/outcome", {
        callId: activeCall.id,
        callOutcome: outcomeData.callOutcome,
        callNotes: outcomeData.callNotes,
        nextFollowUpDate: outcomeData.nextFollowUpDate,
        newCaseStatus: outcomeData.newCaseStatus
      });

      if (res.success) {
        setActionSuccess("Call outcome recorded and case status updated!");
        setCallState("IDLE");
        setActiveCall(null);
        setSelectedCase(null);
        setOutcomeData({
          callOutcome: "Promise to Pay",
          callNotes: "",
          nextFollowUpDate: "",
          newCaseStatus: "Promise to Pay"
        });
        // Refresh cases and KPIs
        await fetchData();
      } else {
        throw new Error(res.message || "Failed to submit outcome.");
      }
    } catch (err) {
      setActionError(err.message || "Failed to save call outcome.");
    } finally {
      setSubmittingOutcome(false);
    }
  };

  // Filter cases for the worklist
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.loan_account_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "New":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      case "Assigned":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Contacted":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "Promise to Pay":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Partially Paid":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Fully Paid":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Disputed":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "Not Reachable":
        return "bg-slate-600/20 text-slate-400 border-slate-600/30";
      case "Field Visit":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Closed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "HIGH":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "MEDIUM":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "LOW":
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <PortalLayout
      title="Telecaller Workstation & Voice Dialer"
      subtitle="Single-click telephony bridge, mandatory audio disclosure, post-call outcome workflow, and real-time KPIs."
    >
      <div className="space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Assigned Cases
            </span>
            <div className="text-2xl font-extrabold text-white">
              <AnimatedCounter value={kpi?.assigned_cases ?? cases.length} />
            </div>
            <span className="text-[10px] text-slate-500">Active Worklist</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Total Calls
            </span>
            <div className="text-2xl font-extrabold text-white">
              <AnimatedCounter value={kpi?.total_calls ?? calls.length} />
            </div>
            <span className="text-[10px] text-indigo-400">Recorded Sessions</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Connected Calls
            </span>
            <div className="text-2xl font-extrabold text-emerald-400">
              <AnimatedCounter value={kpi?.connected_calls ?? 0} />
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">
              {kpi?.call_connection_rate ?? 0}% Conn. Rate
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Talk Time
            </span>
            <div className="text-2xl font-extrabold text-white">
              {kpi ? `${Math.floor(kpi.total_talk_time_seconds / 60)}m` : "45m"}
            </div>
            <span className="text-[10px] text-slate-500">Dual-Channel</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Promises to Pay
            </span>
            <div className="text-2xl font-extrabold text-amber-400">
              <AnimatedCounter value={kpi?.promises_to_pay ?? 0} />
            </div>
            <span className="text-[10px] text-amber-500 font-semibold">PTP Tracked</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Recovered
            </span>
            <div className="text-2xl font-extrabold text-emerald-400">
              <AnimatedCounter prefix="₹" value={kpi?.amount_recovered ?? 85000} />
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              {kpi?.target_achievement ?? 85}% Target
            </span>
          </div>
        </div>

        {/* Action notifications */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}

        {/* ACTIVE CALL CONTROL BANNER */}
        {callState !== "IDLE" && (
          <div className="glass-panel p-6 rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left call info */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    callState === "IN_CALL"
                      ? "bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30"
                      : callState === "DIALING"
                      ? "bg-amber-500/20 text-amber-400 animate-bounce border border-amber-500/30"
                      : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  <PhoneCall size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                      {callState === "DIALING"
                        ? "Bridging Telephony Channel..."
                        : callState === "IN_CALL"
                        ? "Call in Progress (Dual Recording Active)"
                        : "Call Ended — Outcome Required"}
                    </span>
                    {callState === "IN_CALL" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Case {selectedCase?.case_number} ({selectedCase?.lender_name})
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>
                      Dues: <strong className="text-white">₹{selectedCase?.outstanding_amount?.toLocaleString("en-IN")}</strong>
                    </span>
                    <span>•</span>
                    <span>Account: {selectedCase?.loan_account_no}</span>
                  </div>
                </div>
              </div>

              {/* Call timer & statutory notice */}
              <div className="flex flex-col items-center">
                <div className="text-3xl font-mono font-bold text-white tracking-widest">
                  {formatTimer(callDuration)}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={13} />
                  <span>Recording Disclosure Announced</span>
                </div>
              </div>

              {/* Action button */}
              {callState === "IN_CALL" && (
                <button
                  onClick={handleEndCall}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all"
                >
                  <PhoneOff size={18} />
                  <span>Disconnect Call</span>
                </button>
              )}
            </div>

            {/* MANDATORY POST-CALL OUTCOME FORM */}
            {callState === "OUTCOME_PENDING" && (
              <form
                onSubmit={handleSubmitOutcome}
                className="mt-6 pt-6 border-t border-slate-800 space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <AlertCircle size={15} />
                  <span>Mandatory Step: Log Call Outcome & Next Action</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Call Outcome *
                    </label>
                    <select
                      value={outcomeData.callOutcome}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOutcomeData({
                          ...outcomeData,
                          callOutcome: val,
                          newCaseStatus:
                            val === "Promise to Pay"
                              ? "Promise to Pay"
                              : val === "Disputed dues"
                              ? "Disputed"
                              : val === "Not reachable"
                              ? "Not Reachable"
                              : val === "Payment confirmed"
                              ? "Fully Paid"
                              : "Contacted"
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Promise to Pay">Promise to Pay (PTP)</option>
                      <option value="Call back later">Call back later</option>
                      <option value="Disputed dues">Disputed dues</option>
                      <option value="Not reachable">Not reachable</option>
                      <option value="Refused">Refused to pay</option>
                      <option value="Payment confirmed">Payment confirmed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Next Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={outcomeData.nextFollowUpDate}
                      onChange={(e) =>
                        setOutcomeData({ ...outcomeData, nextFollowUpDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Update Case Status
                    </label>
                    <select
                      value={outcomeData.newCaseStatus}
                      onChange={(e) =>
                        setOutcomeData({ ...outcomeData, newCaseStatus: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Contacted">Contacted</option>
                      <option value="Promise to Pay">Promise to Pay</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Fully Paid">Fully Paid</option>
                      <option value="Disputed">Disputed</option>
                      <option value="Not Reachable">Not Reachable</option>
                      <option value="Field Visit">Field Visit</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Interaction Notes & Remarks *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={outcomeData.callNotes}
                    onChange={(e) =>
                      setOutcomeData({ ...outcomeData, callNotes: e.target.value })
                    }
                    placeholder="Enter customer response, agreed commitment amount, or dispute specifics..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submittingOutcome}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                  >
                    {submittingOutcome ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Commit Outcome & Save Transaction</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* WORKLIST SECTION */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Assigned Loan Recovery Worklist</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click the call button to initiate a recorded compliant outreach.
              </p>
            </div>

            {/* Search & filter */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search case or account..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Assigned">Assigned</option>
                <option value="Contacted">Contacted</option>
                <option value="Promise to Pay">Promise to Pay</option>
                <option value="Not Reachable">Not Reachable</option>
                <option value="Disputed">Disputed</option>
                <option value="Field Visit">Field Visit</option>
              </select>
            </div>
          </div>

          {/* Cases table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Lender / Account</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">DPD</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4 text-center">Dial Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredCases.slice(0, 15).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setDetailCaseId(c.id)}
                        className="font-bold text-indigo-400 hover:underline"
                      >
                        {c.case_number}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.lender_name}</div>
                      <div className="text-[11px] text-slate-500">{c.loan_account_no}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{c.loan_type}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{c.outstanding_amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-400">{c.dpd} DPD</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityClass(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.follow_up_date || "Not set"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        disabled={callState !== "IDLE"}
                        onClick={() => handleInitiateCall(c)}
                        title="Click to Call"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all"
                      >
                        <PhoneCall size={13} />
                        <span>Call</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CALL HISTORY TABLE */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">My Recent Calling Log & Recording Evidence</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Call ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Notice Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-center">Audio Vault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {calls.slice(0, 10).map((call) => (
                  <tr key={call.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-mono text-indigo-400">{call.telephony_call_id}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          call.status === "answered"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white font-mono">
                      {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {call.call_outcome || "Pending outcome"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Announced</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {call.call_notes || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(call.started_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {call.status === "answered" ? (
                        <button
                          onClick={() =>
                            setPlayingCallId(playingCallId === call.id ? null : call.id)
                          }
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white"
                          title="Play Encrypted Audio"
                        >
                          {playingCallId === call.id ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">No audio</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      {detailCaseId && (
        <CaseDetailModal caseId={detailCaseId} onClose={() => setDetailCaseId(null)} />
      )}
    </PortalLayout>
  );
};

export default CallerPortal;
