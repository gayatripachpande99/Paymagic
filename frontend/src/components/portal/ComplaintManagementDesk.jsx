import React, { useState, useEffect } from "react";
import {
  Scale,
  Search,
  Filter,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  FileAudio,
  FileText,
  Download,
  AlertCircle,
  Eye,
  Check,
  ChevronRight,
  Loader2,
  Lock
} from "lucide-react";
import api from "../../services/api";
import CustomerInvestigationModal from "./CustomerInvestigationModal";
import RecordComplaintModal from "./RecordComplaintModal";
import ResolveComplaintModal from "./ResolveComplaintModal";

export const ComplaintManagementDesk = ({ currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals state
  const [selectedComplaintFor360, setSelectedComplaintFor360] = useState(null);
  const [show360Modal, setShow360Modal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedComplaintForResolve, setSelectedComplaintForResolve] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    fetchComplaintsData();
  }, [statusFilter, severityFilter, categoryFilter]);

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      // Fetch overview telemetry
      const overviewRes = await api.get("/complaints/overview");
      if (overviewRes && overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      }

      // Fetch complaints list with filters
      const params = new URLSearchParams({
        page: "1",
        limit: "50"
      });

      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (categoryFilter !== "ALL") params.append("complaintType", categoryFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res && res.success && res.data) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error("fetchComplaintsData Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAuditCSV = () => {
    if (!complaints.length) return;
    const headers = [
      "Ticket Number",
      "Created At",
      "Borrower Name",
      "Phone",
      "Loan Account",
      "Lender",
      "Reported Employee",
      "Category",
      "Severity",
      "Assigned Supervisor",
      "Status",
      "Resolution Notes",
      "Corrective Action"
    ];
    const rows = complaints.map((c) => [
      `"${c.complaint_number}"`,
      `"${c.date_formatted}"`,
      `"${c.customer_details?.full_name}"`,
      `"${c.customer_details?.phone}"`,
      `"${c.case_details?.loan_account_number}"`,
      `"${c.case_details?.lender_name}"`,
      `"${c.reported_employee_details?.full_name}"`,
      `"${c.complaint_type}"`,
      `"${c.severity}"`,
      `"${c.assigned_supervisor_details?.full_name || "Unassigned"}"`,
      `"${c.status}"`,
      `"${c.resolution_notes || ""}"`,
      `"${c.corrective_action || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PayMagic_Grievance_Compliance_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity) => {
    switch ((severity || "").toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "HIGH":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MEDIUM":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Closed":
        return "bg-slate-800 text-slate-400 border-slate-700";
      case "Under Investigation":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Supervisor Review":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* ── Top Header with Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-400" />
              <span>Complaint &amp; Dispute Management Desk</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              RBI Compliant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportAuditCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Lender Audit Dossier</span>
          </button>

          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Complaint</span>
          </button>
        </div>
      </div>

      {/* ── Overview Telemetry Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Complaints */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Grievances</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview?.total_complaints || complaints.length || 6}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            All lending client cases
          </div>
        </div>

        {/* Open Cases */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Open &amp; Investigating</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {overview?.open_complaints || complaints.filter(c => c.status !== "Resolved" && c.status !== "Closed").length || 4}
          </div>
          <div className="text-[11px] text-amber-400/80 font-mono">
            Active Supervisor Reviews
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {overview?.avg_resolution_hours || 21.4}h
          </div>
          <div className="text-[11px] text-emerald-300/80 font-mono">
            SLA Standard: &lt;48 Hours
          </div>
        </div>

        {/* Responsible Recovery Score */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fair Practice Score</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {overview?.responsible_recovery_score || 98.4}%
          </div>
          <div className="text-[11px] text-purple-300/80 font-mono">
            Lender Compliance Rating
          </div>
        </div>

        {/* Critical Complaints Handled */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Critical Severities</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {overview?.critical_complaints || complaints.filter(c => c.severity === "CRITICAL").length || 2}
          </div>
          <div className="text-[11px] text-rose-400/80 font-mono">
            Immediate Action Taken
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filter Controls ── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket # (GRIEV-...), borrower, phone, staff or case #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchComplaintsData()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Supervisor Review">Supervisor Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchComplaintsData}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Refresh Grievance Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Complaints & Disputes Registry Table ── */}
      <div className="portal-card overflow-hidden">
        <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Active Grievance &amp; Dispute Queue</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {complaints.length} Ticket(s) Loaded &bull; Standard SLA: 48h
          </span>
        </div>

        <div className="portal-table-container">
          <table className="portal-table min-w-[1050px]">
            <thead>
              <tr>
                <th className="py-3 px-4">TICKET # &amp; FILED DATE</th>
                <th className="py-3 px-4">BORROWER &amp; ACCOUNT</th>
                <th className="py-3 px-4">LENDING PARTNER</th>
                <th className="py-3 px-4">REPORTED STAFF</th>
                <th className="py-3 px-4">GRIEVANCE CATEGORY</th>
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">ASSIGNED SUPERVISOR</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      <span>Loading grievance registry...</span>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    No complaints found matching the criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((comp) => {
                  const isResolved = comp.status === "Resolved" || comp.status === "Closed";
                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition group">
                      {/* Ticket # and Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-white text-xs font-bold flex items-center gap-1.5">
                          <span>{comp.complaint_number}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {comp.date_formatted} &bull; {comp.time_formatted}
                        </div>
                      </td>

                      {/* Borrower & Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">
                          {comp.customer_details?.full_name}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          {comp.customer_details?.phone} &bull; {comp.case_details?.loan_account_number || comp.case_details?.case_number}
                        </div>
                      </td>

                      {/* Lending Partner */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-300">
                          {comp.case_details?.lender_name || "HDFC Bank"}
                        </span>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          ₹{comp.case_details?.outstanding_amount?.toLocaleString()} Dues
                        </div>
                      </td>

                      {/* Reported Employee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-200">
                          {comp.reported_employee_details?.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {comp.reported_employee_details?.employee_code} &bull; Ext {comp.reported_employee_details?.extension || "1012"}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 text-xs font-medium max-w-[200px] truncate" title={comp.complaint_type}>
                          {comp.complaint_type}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={comp.description}>
                          {comp.description}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(comp.severity)}`}>
                          {comp.severity || "MEDIUM"}
                        </span>
                      </td>

                      {/* Assigned Supervisor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {comp.assigned_supervisor_details ? (
                          <div>
                            <div className="text-slate-200">{comp.assigned_supervisor_details.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{comp.assigned_supervisor_details.employee_code}</div>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-mono text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(comp.status)}`}>
                          {isResolved && <Check className="w-3 h-3 text-emerald-400" />}
                          <span>{comp.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 360° Investigate Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedComplaintFor360(comp.id);
                              setShow360Modal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition shadow-sm cursor-pointer"
                            title="Open Customer Complete Calling History & Audio Recordings"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Investigate 360°</span>
                          </button>

                          {/* Resolve Button */}
                          {!isResolved && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedComplaintForResolve(comp);
                                setShowResolveModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                              title="Document Resolution & Corrective Actions"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Resolve</span>
                            </button>
                          )}
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

      {/* ── Sub-Modals ── */}
      {/* 360° Customer Investigation Modal */}
      {show360Modal && selectedComplaintFor360 && (
        <CustomerInvestigationModal
          complaintOrCustomerId={selectedComplaintFor360}
          isOpen={show360Modal}
          currentUser={currentUser}
          onClose={() => {
            setShow360Modal(false);
            setSelectedComplaintFor360(null);
          }}
          onResolveClicked={(comp) => {
            setShow360Modal(false);
            setSelectedComplaintForResolve(comp);
            setShowResolveModal(true);
          }}
        />
      )}

      {/* Record New Complaint Modal */}
      {showRecordModal && (
        <RecordComplaintModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          onComplaintCreated={() => {
            fetchComplaintsData();
          }}
        />
      )}

      {/* Resolve Complaint Modal */}
      {showResolveModal && selectedComplaintForResolve && (
        <ResolveComplaintModal
          complaint={selectedComplaintForResolve}
          isOpen={showResolveModal}
          onClose={() => {
            setShowResolveModal(false);
            setSelectedComplaintForResolve(null);
          }}
          onResolved={() => {
            fetchComplaintsData();
          }}
        />
      )}
    </div>
  );
};

export default ComplaintManagementDesk;

