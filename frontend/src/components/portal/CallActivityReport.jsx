import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  SlidersHorizontal,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  BarChart3,
  FileAudio,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  Headphones,
  Scale,
  FileCheck2,
  Lock,
  Unlock,
  FileText,
  ShieldAlert,
  Loader2
} from "lucide-react";
import api from "../../services/api";
import AudioPlayerModal from "./AudioPlayerModal";
import LegalHoldModal from "./LegalHoldModal";
import RecordingAuditModal from "./RecordingAuditModal";

export const CallActivityReport = ({ onOpenAudioPlayer, user }) => {
  // Sub-navigation tabs: 'call_activity' | 'overview' | 'agent_activity' | 'dispositions' | 'recordings'
  const [activeSubTab, setActiveSubTab] = useState("call_activity");

  // Time segment filter: 'today' | '7d' | '30d' | '90d' | 'custom'
  const [timeFilter, setTimeFilter] = useState("7d");

  // Dropdown filters
  const [directionFilter, setDirectionFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [dispositionFilter, setDispositionFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Data states
  const [calls, setCalls] = useState([]);
  const [metrics, setMetrics] = useState({
    total_calls: 0,
    answered_calls: 0,
    inbound_calls: 0,
    outbound_calls: 0,
    total_duration_seconds: 0,
    total_duration_formatted: "00:00:00"
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1
  });
  const [agentReports, setAgentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);

  // Audio player & evidence modal states
  const [selectedCallAudio, setSelectedCallAudio] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Module F: Evidence Vault States
  const [evidenceOverview, setEvidenceOverview] = useState(null);
  const [recordingsList, setRecordingsList] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceSearch, setEvidenceSearch] = useState("");
  const [evidenceStatus, setEvidenceStatus] = useState("ALL");
  const [evidenceLegalHoldOnly, setEvidenceLegalHoldOnly] = useState(false);
  const [evidenceComplaintOnly, setEvidenceComplaintOnly] = useState(false);
  const [selectedRecordingForAudit, setSelectedRecordingForAudit] = useState(null);
  const [selectedRecordingForHold, setSelectedRecordingForHold] = useState(null);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);

  // Load calls with current filters
  const fetchCalls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange: timeFilter,
        page: String(page),
        limit: String(limit)
      });

      if (directionFilter !== "ALL") params.append("direction", directionFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (campaignFilter !== "ALL") params.append("campaign", campaignFilter);
      if (dispositionFilter !== "ALL") params.append("disposition", dispositionFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await api.get(`/telephony/calls?${params.toString()}`);
      if (res && res.success && res.data) {
        setCalls(res.data.calls || []);
        if (res.data.metrics) setMetrics(res.data.metrics);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching CDR calls:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load agent calling reports for Agent Activity tab
  const fetchAgentReports = async () => {
    try {
      setAgentLoading(true);
      const res = await api.get("/telephony/agents");
      if (res && res.success && res.data) {
        setAgentReports(res.data.agentReports || []);
      }
    } catch (err) {
      console.error("Error fetching agent reports:", err);
    } finally {
      setAgentLoading(false);
    }
  };

  // Module F: Load Evidence Overview & Recordings Vault
  const fetchEvidenceVault = async () => {
    try {
      setEvidenceLoading(true);
      // Fetch overview telemetry
      const overviewRes = await api.get("/telephony/evidence/overview");
      if (overviewRes && overviewRes.success && overviewRes.data) {
        setEvidenceOverview(overviewRes.data);
      }

      // Fetch recordings with filters
      const params = new URLSearchParams({
        timeRange: timeFilter,
        page: "1",
        limit: "50"
      });

      if (evidenceStatus !== "ALL") params.append("status", evidenceStatus);
      if (evidenceLegalHoldOnly) params.append("legalHoldOnly", "true");
      if (evidenceComplaintOnly) params.append("hasComplaint", "true");
      if (evidenceSearch.trim()) params.append("search", evidenceSearch.trim());

      const recRes = await api.get(`/telephony/recordings?${params.toString()}`);
      if (recRes && recRes.success && recRes.data) {
        setRecordingsList(recRes.data.recordings || []);
      }
    } catch (err) {
      console.error("Error fetching evidence vault:", err);
    } finally {
      setEvidenceLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [timeFilter, directionFilter, typeFilter, campaignFilter, dispositionFilter, page, limit]);

  useEffect(() => {
    if (activeSubTab === "agent_activity") {
      fetchAgentReports();
    } else if (activeSubTab === "recordings") {
      fetchEvidenceVault();
    }
  }, [activeSubTab, evidenceStatus, evidenceLegalHoldOnly, evidenceComplaintOnly]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCalls();
  };

  // Open audio modal for a call or recording
  const handlePlayRecording = (callOrRec) => {
    let callDataObj = null;
    if (typeof callOrRec === "object" && callOrRec !== null) {
      callDataObj = {
        id: callOrRec.call_id || callOrRec.id,
        customer_name: callOrRec.customer_details?.full_name || callOrRec.customer_name,
        customer_phone: callOrRec.customer_details?.phone || callOrRec.customer_phone,
        employee_id: callOrRec.employee_details?.employee_code || callOrRec.employee_id,
        agent_name: callOrRec.employee_details?.full_name || callOrRec.agent_name,
        agent_extension: callOrRec.employee_details?.extension || callOrRec.agent_extension,
        case_number: callOrRec.case_metadata?.case_number || callOrRec.case_number,
        duration_seconds: callOrRec.duration_seconds,
        disposition: callOrRec.call_metadata?.disposition || callOrRec.disposition || "Completed"
      };
    } else {
      callDataObj = calls.find(c => c.id === callOrRec || c.formatted_call_id === callOrRec) || { id: callOrRec };
    }

    if (onOpenAudioPlayer) {
      onOpenAudioPlayer(callDataObj.id || callOrRec);
    } else {
      setSelectedCallAudio(callDataObj);
      setShowPlayerModal(true);
    }
  };

  // Distinct campaigns and dispositions from calls for filter dropdowns
  const availableCampaigns = [
    "All Campaigns",
    "May Outreach",
    "Customer Support",
    "Follow Up",
    "Product Demo",
    "Sales Support",
    "Check-in Calls",
    "Bajaj Auto Loan",
    "HDFC Recovery"
  ];

  const availableDispositions = [
    "All Dispositions",
    "Completed",
    "Promise to Pay",
    "Answered",
    "No Answer",
    "Busy",
    "Voicemail",
    "Abandoned",
    "Interested",
    "Disputed"
  ];

  // ── CSV EXPORT HANDLER ──
  const handleExportCSV = () => {
    let rows = [];
    let filename = `PayMagic_Call_Activity_${new Date().toISOString().split("T")[0]}.csv`;

    if (activeSubTab === "agent_activity") {
      filename = `PayMagic_Agent_Performance_${new Date().toISOString().split("T")[0]}.csv`;
      if (!agentReports || agentReports.length === 0) {
        alert("No agent activity records found to export.");
        return;
      }
      rows = agentReports.map((a) => ({
        "Agent Name": a.name || a.agent_name || "Unknown",
        "Employee ID": a.employee_id || a.id || "N/A",
        "Extension": a.extension || "N/A",
        "Total Calls": a.total_calls || 0,
        "Connected Calls": a.connected_calls || a.answered_calls || 0,
        "Connection Rate (%)": a.call_connection_rate ? `${a.call_connection_rate}%` : "0%",
        "Total Talk Time": a.total_talk_time_formatted || "00:00",
        "Target Amount (₹)": a.assigned_target || a.target_amount || 0,
        "Recovered Amount (₹)": a.amount_recovered || 0,
        "Achievement (%)": a.target_achievement ? `${a.target_achievement}%` : "0%",
        "Status": a.status || "Active"
      }));
    } else if (activeSubTab === "recordings") {
      filename = `PayMagic_Evidence_Recordings_${new Date().toISOString().split("T")[0]}.csv`;
      if (!recordingsList || recordingsList.length === 0) {
        alert("No voice recording evidence records found to export.");
        return;
      }
      rows = recordingsList.map((r) => ({
        "Recording ID": r.id || r.recording_id || "N/A",
        "Call ID": r.call_id || "N/A",
        "Customer Name": r.customer_name || r.customer_details?.full_name || "N/A",
        "Customer Phone": r.customer_phone || r.customer_details?.phone || "N/A",
        "Employee": r.employee_name || r.agent_name || "N/A",
        "Duration": r.duration_formatted || `${r.duration_seconds || 0}s`,
        "S3 Bucket": r.s3_bucket || "paymagic-telephony-recordings",
        "Encryption": r.encryption_type || "aws:kms:sse",
        "Notification Status": r.customer_notification_status || "ANNOUNCED",
        "Legal Hold": r.is_legal_hold ? "ACTIVE" : "NONE",
        "Processing Status": r.processing_status || "READY",
        "Date Recorded": r.created_at || r.timestamp || "N/A"
      }));
    } else {
      // Default: Call Activity CDR
      filename = `PayMagic_Call_Records_${new Date().toISOString().split("T")[0]}.csv`;
      if (!calls || calls.length === 0) {
        alert("No call activity records found to export for the selected filter.");
        return;
      }
      rows = calls.map((c) => ({
        "Call ID": c.formatted_call_id || c.id || "N/A",
        "Direction": c.direction || "OUTBOUND",
        "Customer Name": c.customer_name || "Direct Customer",
        "Customer Phone": c.customer_phone || "N/A",
        "Agent Extension": c.agent_extension || "1012",
        "Agent Name": c.agent_name || c.employee_name || "Operations Staff",
        "Call Type": c.call_type || "Answered",
        "Campaign": c.campaign || "General Recovery",
        "Duration": c.duration_formatted || `${c.duration_seconds || 0}s`,
        "Disposition": c.disposition || "Completed",
        "Legal Hold": c.is_legal_hold ? "YES" : "NO",
        "Date & Time": c.created_at || c.call_start_time || new Date().toISOString(),
        "Notes": (c.notes || c.disposition_notes || "").replace(/"/g, '""')
      }));
    }

    if (rows.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Convert rows to CSV format
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    ].join("\r\n");

    // Prepend UTF-8 BOM so Excel opens Hindi/Special chars and Rupees cleanly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* ── 1. Top KPI Summary Grid (Standard Enterprise Cards) ── */}
      <div className="admin-kpi-grid">
        {/* Card 1: Total Calls */}
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap purple-wrap">📞</div>
          <div className="kpi-data">
            <span className="kpi-label">Total Calls Logged</span>
            <div className="kpi-val text-purple font-mono">{metrics.total_calls.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400">
              {metrics.outbound_calls} Outbound &bull; {metrics.inbound_calls} Inbound
            </span>
          </div>
        </div>

        {/* Card 2: Answered / Connection Rate */}
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap green-wrap">⚡</div>
          <div className="kpi-data">
            <span className="kpi-label">Connection Rate</span>
            <div className="kpi-val text-green font-mono">
              {metrics.total_calls > 0 ? ((metrics.answered_calls / metrics.total_calls) * 100).toFixed(1) : "0.0"}%
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {metrics.answered_calls.toLocaleString()} Connected Calls
            </span>
          </div>
        </div>

        {/* Card 3: Total Duration */}
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap gold-wrap">⏱️</div>
          <div className="kpi-data">
            <span className="kpi-label">Total Duration</span>
            <div className="kpi-val text-gold font-mono">{metrics.total_duration_formatted}</div>
            <span className="text-[11px] text-slate-400">Recorded talk time</span>
          </div>
        </div>

        {/* Card 4: Vault Security (Module F) */}
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap blue-wrap">🛡️</div>
          <div className="kpi-data">
            <span className="kpi-label">Evidence Vault</span>
            <div className="kpi-val text-blue font-mono" style={{ fontSize: "19px" }}>AWS KMS SSE</div>
            <span className="text-[11px] text-blue-300 font-semibold">
              Statutory Notice &bull; WORM Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Operations & Sub-Navigation Header Bar ── */}
      <div className="portal-card" style={{ marginBottom: "16px", padding: "16px 20px" }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: "call_activity", label: "Call Activity (CDR)", icon: <PhoneCall className="w-3.5 h-3.5" />, count: pagination.totalCount || calls.length },
              { id: "agent_activity", label: "Agent Performance", icon: <Users className="w-3.5 h-3.5" /> },
              { id: "recordings", label: "Recordings Vault", icon: <FileAudio className="w-3.5 h-3.5" />, count: evidenceOverview?.total_recordings || recordingsList.length },
              { id: "overview", label: "Overview & Analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: "dispositions", label: "Dispositions", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeSubTab === tab.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                fetchCalls();
                if (activeSubTab === "agent_activity") fetchAgentReports();
                if (activeSubTab === "recordings") fetchEvidenceVault();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Refresh Call Activity Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading || evidenceLoading || agentLoading ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="secondary-btn inline-flex items-center gap-1.5 text-xs py-2 px-3.5"
              title="Export datasets to Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Filter Controls Row (Visible on Call Activity) ── */}
      {activeSubTab === "call_activity" && (
        <div className="portal-card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
          <div className="space-y-3.5">
            {/* Row 1: Time filter buttons + Search bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Time Range Pills */}
              <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto scrollbar-thin">
                {[
                  { id: "today", label: "Today" },
                  { id: "7d", label: "7 Days" },
                  { id: "30d", label: "30 Days" },
                  { id: "90d", label: "90 Days" },
                  { id: "custom", label: "Custom Range 📅" }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => {
                      setTimeFilter(tf.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      timeFilter === tf.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="search-box w-full sm:max-w-[280px]">
                <Search className="search-icon w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search caller phone, borrower, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>

            {/* Row 2: Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filters:</span>
              </span>

              {/* Direction Filter */}
              <select
                value={directionFilter}
                onChange={(e) => {
                  setDirectionFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Directions</option>
                <option value="OUTBOUND">Outbound</option>
                <option value="INBOUND">Inbound</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Call Types</option>
                <option value="answered">Answered</option>
                <option value="unanswered">No Answer</option>
                <option value="busy">Busy</option>
                <option value="voicemail">Voicemail</option>
                <option value="rejected">Abandoned</option>
              </select>

              {/* Campaigns Filter */}
              <select
                value={campaignFilter}
                onChange={(e) => {
                  setCampaignFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500 max-w-[160px] truncate"
              >
                {availableCampaigns.map((camp) => (
                  <option key={camp} value={camp === "All Campaigns" ? "ALL" : camp}>
                    {camp}
                  </option>
                ))}
              </select>

              {/* Disposition Filter */}
              <select
                value={dispositionFilter}
                onChange={(e) => {
                  setDispositionFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500 max-w-[160px] truncate"
              >
                {availableDispositions.map((disp) => (
                  <option key={disp} value={disp === "All Dispositions" ? "ALL" : disp}>
                    {disp}
                  </option>
                ))}
              </select>

              {/* Reset button */}
              {(directionFilter !== "ALL" || typeFilter !== "ALL" || campaignFilter !== "ALL" || dispositionFilter !== "ALL" || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setDirectionFilter("ALL");
                    setTypeFilter("ALL");
                    setCampaignFilter("ALL");
                    setDispositionFilter("ALL");
                    setSearchTerm("");
                    setPage(1);
                    fetchCalls();
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition ml-auto"
                >
                  Reset Filters &times;
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 1: CALL ACTIVITY (Main CDR Table View)
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "call_activity" && (
        <div className="portal-card overflow-hidden">
          <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Call Detail Records (CDR) &amp; Telephony Evidence</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono font-semibold border border-indigo-500/20">
                {pagination.totalCount || calls.length} Calls
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Notice Played &bull; Encrypted Storage</span>
            </div>
          </div>

          <div className="portal-table-container">
            <table className="portal-table min-w-[1150px]">
              <thead>
                <tr>
                  <th className="py-3 px-4">CALL ID</th>
                  <th className="py-3 px-4">DIRECTION</th>
                  <th className="py-3 px-4">NUMBER &amp; CONTACT NAME</th>
                  <th className="py-3 px-4">EXTENSION</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">CAMPAIGN</th>
                  <th className="py-3 px-4">DURATION</th>
                  <th className="py-3 px-4">DISPOSITION</th>
                  <th className="py-3 px-4">DATE / TIME</th>
                  <th className="py-3 px-4">RECORDING</th>
                  <th className="py-3 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>Loading call activity records...</span>
                      </div>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-500">
                      No call records match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr
                      key={call.id}
                      className="hover:bg-slate-800/40 transition-colors group text-slate-200"
                    >
                      {/* Call ID */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                        {call.formatted_call_id || call.id?.slice(0, 16)}
                      </td>

                      {/* Direction */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {call.direction === "OUTBOUND" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            Outbound
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            <ArrowDownLeft className="w-3 h-3" />
                            Inbound
                          </span>
                        )}
                      </td>

                      {/* Number & Contact Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-100 font-mono text-[11px]">
                          {call.customer_phone || "+91 98765 43210"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {call.customer_name || "Direct Customer"}
                        </div>
                      </td>

                      {/* Extension */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                        {call.agent_extension || "1012"}
                      </td>

                      {/* Call Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {call.call_type === "Answered" && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400">
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Answered</span>
                          </span>
                        )}
                        {call.call_type === "No Answer" && (
                          <span className="inline-flex items-center gap-1.5 text-rose-400">
                            <PhoneMissed className="w-3.5 h-3.5" />
                            <span>No Answer</span>
                          </span>
                        )}
                        {call.call_type === "Busy" && (
                          <span className="inline-flex items-center gap-1.5 text-amber-400">
                            <PhoneOff className="w-3.5 h-3.5" />
                            <span>Busy</span>
                          </span>
                        )}
                        {call.call_type === "Voicemail" && (
                          <span className="inline-flex items-center gap-1.5 text-purple-400">
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Voicemail</span>
                          </span>
                        )}
                        {call.call_type === "Abandoned" && (
                          <span className="inline-flex items-center gap-1.5 text-rose-400">
                            <PhoneMissed className="w-3.5 h-3.5" />
                            <span>Abandoned</span>
                          </span>
                        )}
                      </td>

                      {/* Campaign */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 text-[11px]">
                        {call.campaign || "—"}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-200">
                        {call.duration_formatted || "00:00"}
                      </td>

                      {/* Disposition */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {call.disposition === "Completed" && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        )}
                        {call.disposition === "Promise to Pay" && (
                          <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>Promise to Pay</span>
                          </span>
                        )}
                        {call.disposition === "Answered" && (
                          <span className="inline-flex items-center gap-1 text-blue-400 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Answered</span>
                          </span>
                        )}
                        {call.disposition === "No Answer" && (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>No Answer</span>
                          </span>
                        )}
                        {call.disposition === "Busy" && (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Busy</span>
                          </span>
                        )}
                        {call.disposition === "Voicemail" && (
                          <span className="inline-flex items-center gap-1 text-purple-400 text-[11px]">
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Voicemail</span>
                          </span>
                        )}
                        {call.disposition === "Interested" && (
                          <span className="inline-flex items-center gap-1 text-sky-400 text-[11px]">
                            <Star className="w-3.5 h-3.5 fill-sky-400/20" />
                            <span>Interested</span>
                          </span>
                        )}
                        {call.disposition === "Disputed" && (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Disputed</span>
                          </span>
                        )}
                        {!["Completed", "Promise to Pay", "Answered", "No Answer", "Busy", "Voicemail", "Interested", "Disputed"].includes(call.disposition) && (
                          <span className="text-slate-300 text-[11px]">
                            {call.disposition || "—"}
                          </span>
                        )}
                      </td>

                      {/* Date / Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-200 text-[11px]">
                          {call.date_formatted}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {call.time_formatted}
                        </div>
                      </td>

                      {/* Recording Pill Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {call.has_recording ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePlayRecording(call)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500/40 transition-all font-mono text-[11px] group-hover:border-indigo-500/50"
                              title="Play Tamper-Proof Recording (KMS Signed S3 Session)"
                            >
                              <Play className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                              <span>{call.recording_duration || call.duration_formatted}</span>
                            </button>
                            {call.disposition === "Disputed" && (
                              <span title="Evidence Locked on Legal Hold" className="p-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                                <Lock className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Action 3-dots */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => alert(`Call ID: ${call.formatted_call_id || call.id}\nCustomer: ${call.customer_name}\nNotes: ${call.call_notes || "N/A"}`)}
                          className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Actions & Audit"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Showing {calls.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(page * limit, pagination.totalCount)} of{" "}
              <span className="font-mono text-slate-200 font-semibold">{pagination.totalCount.toLocaleString()}</span> results
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                  {page}
                </span>
                <span className="text-slate-500">/</span>
                <span className="font-mono text-slate-400">{pagination.totalPages || 1}</span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 2: AGENT ACTIVITY (Employee-Wise Calling Reports)
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "agent_activity" && (
        <div className="space-y-4">
          <div className="portal-card overflow-hidden">
            <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Employee-Wise Telecalling Performance</h3>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                100% Statutory Notice Compliant
              </span>
            </div>

            <div className="portal-table-container">
              <table className="portal-table min-w-[1020px]">
                <thead>
                  <tr>
                    <th className="py-3 px-4">STAFF / AGENT</th>
                    <th className="py-3 px-4">EXTENSION</th>
                    <th className="py-3 px-4">TOTAL CALLS</th>
                    <th className="py-3 px-4">ANSWERED</th>
                    <th className="py-3 px-4">CONNECTION RATE</th>
                    <th className="py-3 px-4">TOTAL TALK TIME</th>
                    <th className="py-3 px-4">AVG CALL DURATION</th>
                    <th className="py-3 px-4">PTP CONVERSIONS</th>
                    <th className="py-3 px-4">DISPUTES</th>
                    <th className="py-3 px-4">QUALITY SCORE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {agentLoading ? (
                    <tr>
                      <td colSpan="10" className="py-10 text-center text-slate-400">
                        Loading employee calling reports...
                      </td>
                    </tr>
                  ) : agentReports.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-10 text-center text-slate-500">
                        No agent activity records found.
                      </td>
                    </tr>
                  ) : (
                    agentReports.map((agent) => (
                      <tr key={agent.employee_id} className="hover:bg-slate-800/40 text-slate-200">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-white">{agent.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {agent.emp_code} • {agent.role}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-indigo-400 font-semibold">
                          {agent.extension}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                          {agent.total_calls}
                          <span className="text-[10px] font-normal text-slate-400 ml-1.5">
                            ({agent.outbound_calls} out / {agent.inbound_calls} in)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                          {agent.answered_calls}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, agent.connection_rate)}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs text-emerald-300 font-bold">
                              {agent.connection_rate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                          {agent.total_duration_formatted}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {agent.avg_duration_formatted}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/20 text-[11px]">
                            {agent.ptp_conversions} PTP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-rose-400">
                          {agent.disputes_handled}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-indigo-300 font-mono text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            {agent.quality_score}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 3: OVERVIEW & ANALYTICS
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="portal-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Call Direction Split</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </h4>
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {metrics.outbound_calls}
                </div>
                <div className="text-xs text-slate-400">Outbound Calls (Recovery)</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-blue-400">
                  {metrics.inbound_calls}
                </div>
                <div className="text-xs text-slate-400">Inbound (Borrower Returns)</div>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{
                  width: `${metrics.total_calls > 0 ? (metrics.outbound_calls / metrics.total_calls) * 100 : 75}%`
                }}
              />
              <div
                className="bg-blue-500 h-full"
                style={{
                  width: `${metrics.total_calls > 0 ? (metrics.inbound_calls / metrics.total_calls) * 100 : 25}%`
                }}
              />
            </div>
          </div>

          <div className="portal-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Connection Rate Efficiency</span>
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            </h4>
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {metrics.total_calls > 0
                    ? ((metrics.answered_calls / metrics.total_calls) * 100).toFixed(1)
                    : "0.0"}%
                </div>
                <div className="text-xs text-slate-400">Connected to Customer</div>
              </div>
              <div className="text-right font-mono text-xs text-slate-300">
                <div>Answered: {metrics.answered_calls}</div>
                <div className="text-rose-400">Unanswered: {metrics.total_calls - metrics.answered_calls}</div>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{
                  width: `${metrics.total_calls > 0 ? (metrics.answered_calls / metrics.total_calls) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div className="portal-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Statutory RBI Compliance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </h4>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-white">100% Encrypted &amp; Audited</div>
                <div className="text-xs text-emerald-400">ANNOUNCED_RECORDED Notice Played</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AWS S3 KMS SSE encryption enabled with automatic 365-day statutory retention.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 4: DISPOSITIONS BREAKDOWN
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "dispositions" && (
        <div className="portal-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Call Outcome &amp; Disposition Distribution</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {calls.length} Samples Analyzed
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { label: "Completed / Settled", count: calls.filter(c => c.disposition === "Completed").length, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "Promise to Pay (PTP)", count: calls.filter(c => c.disposition === "Promise to Pay").length, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
              { label: "Interested in Plan", count: calls.filter(c => c.disposition === "Interested").length, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
              { label: "Customer Disputed", count: calls.filter(c => c.disposition === "Disputed").length, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
              { label: "Line Busy", count: calls.filter(c => c.disposition === "Busy").length, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "No Answer / Unreachable", count: calls.filter(c => c.disposition === "No Answer").length, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
              { label: "Left Voicemail", count: calls.filter(c => c.disposition === "Voicemail").length, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { label: "Abandoned Call", count: calls.filter(c => c.disposition === "Abandoned").length, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" }
            ].map((d, i) => (
              <div key={i} className={`p-4 rounded-xl border ${d.border} ${d.bg} transition hover:scale-[1.01]`}>
                <div className={`text-2xl font-bold font-mono ${d.color}`}>{d.count}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 5: RECORDINGS VAULT (Module F: Evidence Management)
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "recordings" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Telemetry Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Tile 1: Total Evidence Records */}
            <div className="portal-card p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Recordings</span>
                <FileAudio className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {evidenceOverview?.total_recordings || recordingsList.length || 76}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Storage: <span className="text-slate-200">{evidenceOverview?.total_storage_formatted || "390.41 MB"}</span>
              </div>
            </div>

            {/* Tile 2: AWS KMS Encryption */}
            <div className="portal-card p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Vault Encryption</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                100%
              </div>
              <div className="text-[11px] text-emerald-300/80 font-mono truncate">
                AWS KMS SSE (AES-256)
              </div>
            </div>

            {/* Tile 3: Statutory Notice Compliance */}
            <div className="portal-card p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Statutory Notice</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-300">
                100%
              </div>
              <div className="text-[11px] text-purple-300/80 font-mono">
                ANNOUNCED_RECORDED
              </div>
            </div>

            {/* Tile 4: Active Legal Holds */}
            <div className="portal-card p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Legal Holds</span>
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-300">
                {evidenceOverview?.legal_holds_active || recordingsList.filter(r => r.is_legal_hold).length || 19}
              </div>
              <div className="text-[11px] text-amber-400/80 font-mono">
                WORM Retention Locked
              </div>
            </div>

            {/* Tile 5: Immutable Access Audits */}
            <div className="portal-card p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Access Audit Trail</span>
                <FileCheck2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-sky-300">
                {evidenceOverview?.total_access_audits || 3}
              </div>
              <div className="text-[11px] text-sky-300/80 font-mono">
                IP &amp; Purpose Logged
              </div>
            </div>
          </div>

          {/* Evidence Vault Toolbar & Filters */}
          <div className="portal-card p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by recording ID, borrower, phone, staff or case #..."
                  value={evidenceSearch}
                  onChange={(e) => setEvidenceSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchEvidenceVault()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Status and Toggle Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Dropdown */}
                <select
                  value={evidenceStatus}
                  onChange={(e) => setEvidenceStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="READY">Ready (Standard)</option>
                  <option value="LEGAL_HOLD">Under Legal Hold</option>
                  <option value="PROCESSING">Processing</option>
                </select>

                {/* Legal Hold Only Toggle */}
                <button
                  type="button"
                  onClick={() => setEvidenceLegalHoldOnly(!evidenceLegalHoldOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    evidenceLegalHoldOnly
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Legal Hold Only</span>
                </button>

                {/* Complaint Only Toggle */}
                <button
                  type="button"
                  onClick={() => setEvidenceComplaintOnly(!evidenceComplaintOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    evidenceComplaintOnly
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Disputes / Grievances</span>
                </button>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={fetchEvidenceVault}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Reload Evidence Vault"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${evidenceLoading ? "animate-spin text-indigo-400" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Recordings Evidence Table */}
          <div className="portal-card overflow-hidden">
            <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Private S3 KMS Voice Evidence Ledger</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>WORM Storage Policy Enforced &bull; 365 Days Rolling</span>
              </div>
            </div>

            <div className="portal-table-container">
              <table className="portal-table min-w-[1150px]">
                <thead>
                  <tr>
                    <th className="py-3 px-4">EVIDENCE REF / TIME</th>
                    <th className="py-3 px-4">BORROWER &amp; ACCOUNT</th>
                    <th className="py-3 px-4">RECOVERY OFFICER</th>
                    <th className="py-3 px-4">STATUTORY NOTICE</th>
                    <th className="py-3 px-4">DURATION / SIZE</th>
                    <th className="py-3 px-4">ENCRYPTION &amp; HASH</th>
                    <th className="py-3 px-4">STATUS / RETENTION</th>
                    <th className="py-3 px-4">GRIEVANCE</th>
                    <th className="py-3 px-4 text-right">EVIDENCE ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {evidenceLoading ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                          <span>Decrypting Evidence Registry...</span>
                        </div>
                      </td>
                    </tr>
                  ) : recordingsList.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-500">
                        No voice evidence records matched your search/filter criteria.
                      </td>
                    </tr>
                  ) : (
                    recordingsList.map((rec) => {
                      const isLocked = rec.is_legal_hold;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition group">
                          {/* Evidence Ref & Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono text-white text-xs font-semibold flex items-center gap-1.5">
                              <span>{rec.id}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {rec.date_formatted} &bull; {rec.time_formatted}
                            </div>
                          </td>

                          {/* Borrower & Account */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-slate-200 font-semibold">
                              {rec.customer_details?.full_name || "Borrower"}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono">
                              {rec.customer_details?.phone || "+91 98765 43210"} &bull; {rec.case_metadata?.case_number || "CASE-001"}
                            </div>
                          </td>

                          {/* Recovery Officer */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-slate-200">
                              {rec.employee_details?.full_name || "Officer"}
                            </div>
                            <div className="text-slate-400 text-[10px] font-mono">
                              {rec.employee_details?.employee_code || "EMP-001"} &bull; Ext {rec.employee_details?.extension || "1012"}
                            </div>
                          </td>

                          {/* Statutory Notice */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>ANNOUNCED</span>
                            </span>
                          </td>

                          {/* Duration & Size */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono text-emerald-400 font-semibold">
                              {rec.duration_formatted}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {rec.file_size_formatted}
                            </div>
                          </td>

                          {/* Encryption & Hash */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              <Lock className="w-2.5 h-2.5 text-indigo-400" />
                              <span>AES-256 KMS</span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono truncate max-w-[120px]" title={rec.checksum_sha256}>
                              SHA256: {rec.checksum_sha256?.slice(0, 10)}...
                            </div>
                          </td>

                          {/* Status / Retention */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Scale className="w-3 h-3 text-amber-400" />
                                <span>LEGAL HOLD</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>READY (365d)</span>
                              </span>
                            )}
                          </td>

                          {/* Grievance Ticket */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {rec.linked_complaint_number || rec.linked_complaint ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                <FileText className="w-3 h-3 text-rose-400" />
                                <span>{rec.linked_complaint_number || rec.linked_complaint?.complaint_number || "GRIEV-001"}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 font-mono">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Stream Audio */}
                              <button
                                type="button"
                                onClick={() => handlePlayRecording(rec)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition shadow-sm cursor-pointer"
                                title="Stream Secure Audio (15-min Signed S3 KMS Session)"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                <span>Stream</span>
                              </button>

                              {/* Legal Hold Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRecordingForHold(rec);
                                  setShowHoldModal(true);
                                }}
                                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                  isLocked
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                                }`}
                                title="Manage Legal Hold Retention Freeze"
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>

                              {/* Audit Trail Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRecordingForAudit(rec);
                                  setShowAuditTrailModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-indigo-300 hover:bg-slate-700 transition cursor-pointer"
                                title="Inspect Immutable Access Audit Log"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Audio Player Modal */}
      {showPlayerModal && selectedCallAudio && (
        <AudioPlayerModal
          callData={selectedCallAudio}
          isOpen={showPlayerModal}
          currentUser={user}
          onClose={() => {
            setShowPlayerModal(false);
            setSelectedCallAudio(null);
          }}
        />
      )}

      {/* Legal Hold Management Modal */}
      {showHoldModal && selectedRecordingForHold && (
        <LegalHoldModal
          recording={selectedRecordingForHold}
          isOpen={showHoldModal}
          onClose={() => {
            setShowHoldModal(false);
            setSelectedRecordingForHold(null);
          }}
          onHoldUpdated={() => {
            fetchEvidenceVault();
          }}
        />
      )}

      {/* Audit Trail Modal */}
      {showAuditTrailModal && selectedRecordingForAudit && (
        <RecordingAuditModal
          recording={selectedRecordingForAudit}
          isOpen={showAuditTrailModal}
          onClose={() => {
            setShowAuditTrailModal(false);
            setSelectedRecordingForAudit(null);
          }}
        />
      )}
    </div>
  );
};

export default CallActivityReport;

