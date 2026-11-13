import React, { useState, useEffect, useCallback, useRef } from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import CaseDetailModal from "../../components/portal/CaseDetailModal";
import { useAuth } from "../../context/AuthContext";
import AnimatedCounter from "../../components/common/AnimatedCounter";
import api, { API_URL } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FileSpreadsheet,
  Users,
  Database,
  PhoneCall,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  UploadCloud,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  Loader2,
  AlertCircle,
  X,
  Play,
  ArrowUpDown,
  RefreshCw,
  Download,
  FileText,
  Construction,
  IndianRupee,
} from "lucide-react";

/* ─── CONSTANTS ─── */
const STATUS_COLORS = {
  New: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Contacted: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Promise to Pay": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Partially Paid": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Fully Paid": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Disputed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Not Reachable": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Field Visit": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Closed: "bg-green-500/10 text-green-400 border-green-500/20",
};

const PRIORITY_COLORS = {
  LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CRITICAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const CALL_STATUS_COLORS = {
  answered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  busy: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  unanswered: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "no-answer": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const ALL_STATUSES = [
  "New", "Assigned", "Contacted", "Promise to Pay",
  "Partially Paid", "Fully Paid", "Disputed",
  "Not Reachable", "Field Visit", "Closed",
];

const ALL_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899", "#14b8a6"];

const formatCurrency = (val) => {
  if (val == null) return "₹0";
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

/* ─── CUSTOM CHART TOOLTIP ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color || entry.fill }} className="font-medium">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString("en-IN") : entry.value}
        </p>
      ))}
    </div>
  );
};

/* ─── OVERVIEW TAB ─── */
const OverviewTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/dashboard/admin-overview");
        if (res.success) {
          setData(res.data || res);
        }
      } catch {
        // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const overview = data || {};
  const totalCases = overview.totalCases ?? 200;
  const outstanding = overview.totalOutstanding ?? 21450000;
  const recovered = overview.totalRecovered ?? 8640000;
  const connectionRate = overview.connectionRate ?? 91.4;

  const statusDistribution = overview.statusDistribution || [
    { status: "New", count: 32 },
    { status: "Assigned", count: 45 },
    { status: "Contacted", count: 38 },
    { status: "Promise to Pay", count: 28 },
    { status: "Partially Paid", count: 18 },
    { status: "Fully Paid", count: 15 },
    { status: "Disputed", count: 8 },
    { status: "Not Reachable", count: 12 },
    { status: "Closed", count: 4 },
  ];

  const lenderDistribution = overview.lenderDistribution || [
    { name: "HDFC Bank", value: 45 },
    { name: "ICICI Bank", value: 38 },
    { name: "SBI", value: 32 },
    { name: "Axis Bank", value: 28 },
    { name: "Kotak Mahindra", value: 35 },
    { name: "Bajaj Finance", value: 22 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Recovery Cases</span>
            <FileSpreadsheet size={18} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            <AnimatedCounter value={totalCases} />
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">100% Ingested & Indexed</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dues Outstanding</span>
            <Database size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            <AnimatedCounter prefix="₹" value={outstanding} />
          </div>
          <div className="text-xs text-slate-400 mt-2">Across All Banking Partners</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Recoveries</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            <AnimatedCounter prefix="₹" value={recovered} />
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">
            {outstanding > 0 ? `${((recovered / outstanding) * 100).toFixed(1)}% Recovery Rate` : "—"}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Call Connection Rate</span>
            <PhoneCall size={18} className="text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            <AnimatedCounter value={connectionRate} suffix="%" />
          </div>
          <div className="text-xs text-indigo-400 mt-2 font-medium">Optimal Window Routing</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">Cases by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="status"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={{ stroke: "#334155" }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lender Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">Cases by Lender</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={lenderDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: "#475569", strokeWidth: 1 }}
              >
                {lenderDistribution.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ─── CASES TAB ─── */
const CasesTab = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("case_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      params.append("page", page);
      params.append("limit", limit);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await api.get(`/cases?${params.toString()}`);
      if (res.success) {
        setCases(res.data?.cases || res.cases || res.data || []);
        setTotalPages(res.data?.totalPages || res.totalPages || 1);
        setTotalCount(res.data?.total || res.total || 0);
      }
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchCases(), 300);
    return () => clearTimeout(debounce);
  }, [fetchCases]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ col }) => (
    <ArrowUpDown
      size={12}
      className={`inline ml-1 ${sortBy === col ? "text-indigo-400" : "text-slate-600"}`}
    />
  );

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or case number..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priority</option>
          {ALL_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={fetchCases}
          className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Results count */}
      <div className="text-xs text-slate-500">
        Showing page {page} of {totalPages} ({totalCount} total cases)
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("case_number")}>
                  Case # <SortIcon col="case_number" />
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("customer_name")}>
                  Customer <SortIcon col="customer_name" />
                </th>
                <th className="py-3 px-4">Lender</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("outstanding_amount")}>
                  Outstanding <SortIcon col="outstanding_amount" />
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("dpd")}>
                  DPD <SortIcon col="dpd" />
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("priority")}>
                  Priority <SortIcon col="priority" />
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("status")}>
                  Status <SortIcon col="status" />
                </th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 size={24} className="mx-auto text-indigo-400 animate-spin" />
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No cases found matching your filters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const caseNum = c.caseNumber || c.case_number || "—";
                  const customerName = c.customer?.name || c.customerName || c.customer_name || "—";
                  const lender = c.lenderName || c.lender || "—";
                  const outstandingAmt = c.outstandingAmount || c.outstanding_amount || 0;
                  const dpd = c.dpd ?? c.daysOverdue ?? "—";
                  const priority = c.priority || "MEDIUM";
                  const status = c.status || "New";
                  const assigned = c.assignedTo?.fullName || c.assignedEmployee || c.assigned_employee || "Unassigned";
                  const id = c.id || c._id;

                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-900/40 cursor-pointer transition-colors"
                      onClick={() => { setSelectedCaseId(id); setModalOpen(true); }}
                    >
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{caseNum}</td>
                      <td className="py-3.5 px-4 text-white font-medium">{customerName}</td>
                      <td className="py-3.5 px-4">{lender}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{formatCurrency(outstandingAmt)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${Number(dpd) > 90 ? "text-rose-400" : Number(dpd) > 30 ? "text-amber-400" : "text-slate-300"}`}>
                          {dpd}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM}`}>
                          {priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[status] || STATUS_COLORS.New}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{assigned}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setSelectedCaseId(id); setModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedCaseId(id); setModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors"
                            title="Assign"
                          >
                            <UserCheck size={14} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 rounded-lg border border-slate-700"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      page === pageNum
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:bg-slate-900 border border-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 rounded-lg border border-slate-700"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseId={selectedCaseId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={fetchCases}
      />
    </div>
  );
};

/* ─── UPLOAD TAB ─── */
const UploadTab = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/upload/history");
      if (res.success) {
        setImportHistory(res.data?.history || res.history || res.data || []);
      }
    } catch {
      setImportHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!validTypes.includes(file.type) && !["xlsx", "csv", "xls"].includes(ext)) {
      alert("Please upload a .xlsx or .csv file");
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);

    // Parse CSV preview
    if (ext === "csv" || file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split("\n").filter((l) => l.trim());
        const headers = lines[0]?.split(",").map((h) => h.trim().replace(/"/g, ""));
        const rows = lines.slice(1, 6).map((line) => {
          const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          const row = {};
          headers?.forEach((h, i) => { row[h] = vals[i] || ""; });
          return row;
        });
        setPreviewRows(rows);
      };
      reader.readAsText(file);
    } else {
      // For xlsx, show a placeholder preview
      setPreviewRows([{ note: "Excel preview available after upload" }]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("paymagic_token");
      const res = await fetch(`${API_URL}/upload/import`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await res.json();
      setUploadResult(data);
      if (data.success) {
        fetchHistory();
      }
    } catch (err) {
      setUploadResult({ success: false, message: err.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const previewHeaders = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center ${
          dragActive
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-900/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <UploadCloud size={48} className={`mx-auto mb-4 ${dragActive ? "text-indigo-400" : "text-slate-500"}`} />
        <p className="text-sm font-semibold text-white mb-1">
          {selectedFile ? selectedFile.name : "Drag & drop your Excel or CSV file here"}
        </p>
        <p className="text-xs text-slate-400">
          {selectedFile
            ? `${(selectedFile.size / 1024).toFixed(1)} KB — Click to change`
            : "Supports .xlsx and .csv formats"}
        </p>
      </div>

      {/* Preview */}
      {selectedFile && previewRows.length > 0 && previewHeaders[0] !== "note" && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">Preview (First {previewRows.length} rows)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  {previewHeaders.map((h) => (
                    <th key={h} className="py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    {previewHeaders.map((h) => (
                      <td key={h} className="py-2 px-3 max-w-[150px] truncate">{row[h] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {uploading ? "Uploading..." : "Upload & Import"}
          </button>
          <button
            onClick={() => { setSelectedFile(null); setPreviewRows([]); setUploadResult(null); }}
            className="text-slate-400 hover:text-white text-xs"
          >
            Clear
          </button>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div
          className={`glass-panel p-5 rounded-2xl border ${
            uploadResult.success
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-rose-500/20 bg-rose-500/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {uploadResult.success ? (
              <CheckCircle2 size={20} className="text-emerald-400" />
            ) : (
              <AlertCircle size={20} className="text-rose-400" />
            )}
            <span className={`text-sm font-bold ${uploadResult.success ? "text-emerald-400" : "text-rose-400"}`}>
              {uploadResult.success ? "Import Successful" : "Import Failed"}
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-2">{uploadResult.message || ""}</p>
          {uploadResult.success && (
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-white">
                  {uploadResult.data?.total ?? uploadResult.total ?? "—"}
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-emerald-400">
                  {uploadResult.data?.successful ?? uploadResult.successful ?? "—"}
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-rose-400">
                  {uploadResult.data?.failed ?? uploadResult.failed ?? "—"}
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Failed</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import History */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <History size={16} className="text-indigo-400" />
          Import History
        </h3>
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="text-indigo-400 animate-spin" />
          </div>
        ) : importHistory.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No import history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Imported</th>
                  <th className="py-3 px-4">Failed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {importHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{item.fileName || item.file_name || "—"}</td>
                    <td className="py-3 px-4">{item.totalRecords ?? item.total ?? "—"}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{item.successCount ?? item.successful ?? "—"}</td>
                    <td className="py-3 px-4 text-rose-400 font-semibold">{item.failureCount ?? item.failed ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${
                        item.status === "completed" || item.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.status === "failed"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {item.status || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.uploadedBy?.fullName || item.uploadedBy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── TELEPHONY TAB ─── */
const TelephonyTab = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [playingCallId, setPlayingCallId] = useState(null);

  useEffect(() => {
    fetchCalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/telephony/calls?page=${page}&limit=20`);
      if (res.success) {
        setCalls(res.data?.calls || res.calls || res.data || []);
      }
    } catch {
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRecording = (callId) => {
    setPlayingCallId(playingCallId === callId ? null : callId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Recent Calls Across All Agents</h3>
        <button
          onClick={fetchCalls}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Call Status</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 size={24} className="mx-auto text-indigo-400 animate-spin" />
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No call records found.
                  </td>
                </tr>
              ) : (
                calls.map((call, idx) => {
                  const callId = call.id || call._id || idx;
                  const statusClass = CALL_STATUS_COLORS[call.callStatus] || CALL_STATUS_COLORS.unanswered;
                  return (
                    <React.Fragment key={callId}>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-3 px-4">
                          {call.createdAt || call.callDate
                            ? new Date(call.createdAt || call.callDate).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {call.agent?.fullName || call.employeeName || call.agentName || "—"}
                        </td>
                        <td className="py-3 px-4 text-indigo-400 font-semibold">
                          {call.caseNumber || call.case_number || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {call.customerName || call.customer?.name || "—"}
                        </td>
                        <td className="py-3 px-4">{call.duration || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusClass}`}>
                            {call.callStatus || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4">{call.callOutcome || "—"}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handlePlayRecording(callId)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors"
                            title="Play Recording"
                          >
                            <Play size={14} />
                          </button>
                        </td>
                      </tr>
                      {/* Mock Audio Player */}
                      {playingCallId === callId && (
                        <tr>
                          <td colSpan={8} className="px-4 py-3 bg-slate-900/60">
                            <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-700">
                              <button
                                onClick={() => setPlayingCallId(null)}
                                className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors"
                              >
                                <Play size={14} />
                              </button>
                              <div className="flex-1">
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full w-1/3 animate-pulse" />
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {call.duration || "0:00"} / {call.duration || "0:00"}
                              </span>
                              <button
                                onClick={() => setPlayingCallId(null)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── PLACEHOLDER TAB ─── */
const PlaceholderTab = ({ title, description }) => (
  <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center">
    <Construction size={48} className="mx-auto text-slate-600 mb-4" />
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>
    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
      <Clock size={12} />
      Coming in Phase 3
    </div>
  </div>
);

/* ─── MAIN ADMIN PORTAL ─── */
export const AdminPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Operations Overview" },
    { id: "cases", label: "Loan Cases" },
    { id: "upload", label: "Upload Excel / CSV" },
    { id: "telephony", label: "Telephony & Recordings" },
    { id: "disputes", label: "Disputes & Complaints" },
    { id: "reports", label: "Management Reports" },
  ];

  return (
    <PortalLayout
      title="Operations Command & Case Management"
      subtitle="Portfolio file ingestion, case allocation, telecaller workloads, and real-time recovery metrics."
    >
      <div className="space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "cases" && <CasesTab />}
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "telephony" && <TelephonyTab />}
        {activeTab === "disputes" && (
          <PlaceholderTab
            title="Disputes & Complaints Management"
            description="Customer dispute filing, investigation workflows, regulatory response tracking, and ombudsman escalation management will be available here."
          />
        )}
        {activeTab === "reports" && (
          <PlaceholderTab
            title="Management Reports"
            description="Recovery analytics, portfolio performance, agent productivity reports, compliance audits, and custom report builder will be available here."
          />
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminPortal;
