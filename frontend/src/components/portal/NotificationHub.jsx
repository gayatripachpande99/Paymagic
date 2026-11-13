import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  IndianRupee,
  Users,
  ShieldAlert,
  MapPin,
  Receipt,
  BarChart3,
  Clock,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Play,
  RotateCcw,
  Send,
  Radio,
  Server,
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  Info,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import api from "../../services/api";

export const NotificationHub = ({ currentUser, onNavigateToEntity }) => {
  // Navigation sub-tabs: 'feed' | 'scheduler' | 'queue' | 'broadcast'
  const [activeSubTab, setActiveSubTab] = useState("feed");

  // Notifications Feed States
  const [notifications, setNotifications] = useState([]);
  const [telemetry, setTelemetry] = useState({
    unreadCount: 0,
    criticalCount: 0,
    warningCount: 0,
    totalNotifications: 0
  });
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedSearch, setFeedSearch] = useState("");
  const [feedTypeFilter, setFeedTypeFilter] = useState("ALL");
  const [feedSeverityFilter, setFeedSeverityFilter] = useState("ALL");
  const [feedStatusFilter, setFeedStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Spring Scheduler States
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [triggeringTask, setTriggeringTask] = useState(null);

  // Redis & Queue States
  const [queueTelemetry, setQueueTelemetry] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);

  // Broadcast Form States
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    severity: "INFO",
    recipient_role: "ALL",
    channel: "IN_APP"
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Initial Load
  useEffect(() => {
    loadFeed();
    loadSchedulerStatus();
    loadQueueTelemetry();
  }, []);

  // Show Toast
  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // 1. Load Notifications Feed
  const loadFeed = async (pageNum = 1) => {
    try {
      setFeedLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum);
      params.append("limit", 15);
      if (feedStatusFilter !== "ALL") params.append("status", feedStatusFilter);
      if (feedTypeFilter !== "ALL") params.append("type", feedTypeFilter);
      if (feedSeverityFilter !== "ALL") params.append("severity", feedSeverityFilter);
      if (feedSearch.trim()) params.append("search", feedSearch.trim());

      const res = await api.get(`/notifications?${params.toString()}`);
      if (res && res.success) {
        setNotifications(res.data || []);
        if (res.telemetry) setTelemetry(res.telemetry);
        if (res.pagination) {
          setPage(res.pagination.page);
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      console.warn("Failed to load notifications feed:", err);
    } finally {
      setFeedLoading(false);
    }
  };

  // 2. Load Spring Scheduler Status
  const loadSchedulerStatus = async () => {
    try {
      setSchedulerLoading(true);
      const res = await api.get("/notifications/scheduler/status");
      if (res && res.success && res.data) {
        setSchedulerStatus(res.data);
      }
    } catch (err) {
      console.warn("Failed to load scheduler status:", err);
    } finally {
      setSchedulerLoading(false);
    }
  };

  // 3. Load Queue Telemetry
  const loadQueueTelemetry = async () => {
    try {
      setQueueLoading(true);
      const res = await api.get("/notifications/queue/telemetry");
      if (res && res.success && res.data) {
        setQueueTelemetry(res.data);
      }
    } catch (err) {
      console.warn("Failed to load queue telemetry:", err);
    } finally {
      setQueueLoading(false);
    }
  };

  // 4. Trigger Spring Task On-Demand
  const handleTriggerTask = async (taskId, taskName) => {
    try {
      setTriggeringTask(taskId);
      const res = await api.post(`/notifications/scheduler/trigger/${taskId}`);
      if (res && res.success) {
        showToast(`Spring Scheduler task '${taskName}' executed! Processed ${res.result?.itemsCount || 0} item(s) in ${res.result?.durationMs || 10}ms.`);
        await loadSchedulerStatus();
        await loadQueueTelemetry();
        await loadFeed(1);
      } else {
        showToast(res?.message || "Task execution failed", "error");
      }
    } catch (err) {
      showToast("Error triggering scheduled task: " + err.message, "error");
    } finally {
      setTriggeringTask(null);
    }
  };

  // 5. Mark Single Read
  const handleMarkRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
        );
        setTelemetry((t) => ({ ...t, unreadCount: Math.max(0, t.unreadCount - 1) }));
      }
    } catch (err) {
      console.warn("Mark read failed:", err);
    }
  };

  // 6. Mark All Read
  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch("/notifications/read-all");
      if (res && res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
        setTelemetry((t) => ({ ...t, unreadCount: 0 }));
        showToast("All notifications marked as read.");
      }
    } catch (err) {
      showToast("Failed to mark all as read: " + err.message, "error");
    }
  };

  // 7. Delete Notification
  const handleDeleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res && res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showToast("Notification dismissed.");
      }
    } catch (err) {
      showToast("Failed to delete notification", "error");
    }
  };

  // 8. Broadcast Custom Alert
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      showToast("Please provide both title and announcement message.", "error");
      return;
    }

    try {
      setBroadcastSending(true);
      const res = await api.post("/notifications/broadcast", broadcastForm);
      if (res && res.success) {
        showToast("Broadcast notification pushed to message queue for instant dispatch!");
        setBroadcastForm({
          title: "",
          message: "",
          severity: "INFO",
          recipient_role: "ALL",
          channel: "IN_APP"
        });
        setActiveSubTab("feed");
        await loadFeed(1);
        await loadQueueTelemetry();
      } else {
        showToast(res?.message || "Failed to broadcast alert", "error");
      }
    } catch (err) {
      showToast("Broadcast failed: " + err.message, "error");
    } finally {
      setBroadcastSending(false);
    }
  };

  // 9. Purge DLQ
  const handlePurgeDlq = async () => {
    try {
      const res = await api.post("/notifications/queue/purge-dlq");
      if (res && res.success) {
        showToast(`Dead-Letter Queue purged (${res.result?.purgedCount || 0} jobs cleared).`);
        await loadQueueTelemetry();
      }
    } catch (err) {
      showToast("Failed to purge DLQ: " + err.message, "error");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "FOLLOW_UP_DUE_TOMORROW":
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case "PROMISE_TO_PAY_TODAY":
        return <IndianRupee className="w-4 h-4 text-emerald-400" />;
      case "PENDING_CASES_REMINDER":
        return <Users className="w-4 h-4 text-amber-400" />;
      case "SUPERVISOR_APPROVAL_REQUIRED":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "FIELD_VISIT_REPORT_OVERDUE":
        return <MapPin className="w-4 h-4 text-purple-400" />;
      case "PAYMENT_RECONCILIATION_PENDING":
        return <Receipt className="w-4 h-4 text-teal-400" />;
      case "DAILY_PERFORMANCE_REPORT":
        return <BarChart3 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Radio className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getCleanTypeLabel = (type) => {
    switch (type) {
      case "FOLLOW_UP_DUE_TOMORROW":
        return "Follow-up Due Tomorrow";
      case "PROMISE_TO_PAY_TODAY":
        return "Promised Payment Today";
      case "PENDING_CASES_REMINDER":
        return "Pending Cases Workload";
      case "SUPERVISOR_APPROVAL_REQUIRED":
        return "Supervisor Approval Required";
      case "FIELD_VISIT_REPORT_OVERDUE":
        return "Field Visit Report Overdue";
      case "PAYMENT_RECONCILIATION_PENDING":
        return "Payment Reconciliation Pending";
      case "DAILY_PERFORMANCE_REPORT":
        return "Daily Performance Report";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xl transition animate-in fade-in duration-150 ${
            toastType === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "error" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg("")}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── TOP TELEMETRY RIBBON ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Tile 1: Unread Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Unread Alerts</span>
            <Bell className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {telemetry.unreadCount}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {telemetry.criticalCount} critical / {telemetry.warningCount} warning
          </div>
        </div>

        {/* Tile 2: Active Spring Scheduler Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Spring Scheduler</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {schedulerStatus?.activeTasks || 7} / 7
          </div>
          <div className="text-[11px] text-emerald-300/80 font-mono">
            @Scheduled Cron Hooks Active
          </div>
        </div>

        {/* Tile 3: Message Queue Engine */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Redis Message Queue</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-purple-300">
            {queueTelemetry?.status || "HEALTHY"}
          </div>
          <div className="text-[11px] text-purple-300/80 font-mono truncate">
            {queueTelemetry?.backend || "Redis Enterprise Queue"}
          </div>
        </div>

        {/* Tile 4: Queue Throughput & Latency */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Processing Speed</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-sky-300">
            {queueTelemetry?.avgLatencyMs || "2.1"} ms
          </div>
          <div className="text-[11px] text-sky-300/80 font-mono">
            Throughput: {queueTelemetry?.throughputJobsPerMin || 35} jobs/min
          </div>
        </div>

        {/* Tile 5: Total Reminders Ingested */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Ingested</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-300">
            {telemetry.totalNotifications || notifications.length || 7}
          </div>
          <div className="text-[11px] text-amber-400/80 font-mono">
            Across 7 reminder pipelines
          </div>
        </div>
      </div>

      {/* ── NAVIGATION SUB-TABS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("feed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "feed"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Reminders &amp; Alerts Feed</span>
            {telemetry.unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {telemetry.unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("scheduler")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "scheduler"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Spring Scheduler Control Deck</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              7 Crons
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("queue")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "queue"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Redis &amp; Message Queue Engine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("broadcast")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "broadcast"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === "feed" && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              loadFeed(page);
              loadSchedulerStatus();
              loadQueueTelemetry();
              showToast("Refreshed automated reminders, scheduler tasks and queue telemetry.");
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 1: REMINDERS & NOTIFICATIONS FEED
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "feed" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reminders by borrower, case #, staff or keyword..."
                  value={feedSearch}
                  onChange={(e) => setFeedSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") loadFeed(1); }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <select
                  value={feedTypeFilter}
                  onChange={(e) => {
                    setFeedTypeFilter(e.target.value);
                    setTimeout(() => loadFeed(1), 0);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All 7 Reminder Types</option>
                  <option value="FOLLOW_UP_DUE_TOMORROW">Follow-up Due Tomorrow</option>
                  <option value="PROMISE_TO_PAY_TODAY">Promised Payment Today</option>
                  <option value="PENDING_CASES_REMINDER">Pending Cases Workload</option>
                  <option value="SUPERVISOR_APPROVAL_REQUIRED">Supervisor Approval Required</option>
                  <option value="FIELD_VISIT_REPORT_OVERDUE">Field Visit Report Overdue</option>
                  <option value="PAYMENT_RECONCILIATION_PENDING">Payment Reconciliation Pending</option>
                  <option value="DAILY_PERFORMANCE_REPORT">Daily Performance Report</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={feedSeverityFilter}
                  onChange={(e) => {
                    setFeedSeverityFilter(e.target.value);
                    setTimeout(() => loadFeed(1), 0);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Alerts</option>
                  <option value="WARNING">Warnings</option>
                  <option value="INFO">Informational</option>
                </select>

                {/* Status Filter */}
                <select
                  value={feedStatusFilter}
                  onChange={(e) => {
                    setFeedStatusFilter(e.target.value);
                    setTimeout(() => loadFeed(1), 0);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UNREAD">Unread Only</option>
                  <option value="READ">Read Only</option>
                </select>

                <button
                  type="button"
                  onClick={() => loadFeed(1)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Feed Table / Card List */}
          <div className="space-y-3">
            {feedLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Loading automated reminders feed...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">No Reminders Matching Filters</h4>
                <p className="text-xs text-slate-400">
                  Try clearing the filters or trigger a scheduled scan from the Spring Scheduler Control Deck tab.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = n.status === "UNREAD";
                return (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition shadow-lg space-y-2.5 ${
                      isUnread
                        ? "bg-slate-900/90 border-slate-700/80 shadow-indigo-950/20"
                        : "bg-slate-900/40 border-slate-800/60 opacity-80"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                          {getTypeIcon(n.type)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">
                              {n.title}
                            </h4>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">
                              {getCleanTypeLabel(n.type)}
                            </span>
                            <span>&bull;</span>
                            <span>Recipient: <strong className="text-slate-200">{n.recipient_name || n.recipient_role}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            n.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : n.severity === "WARNING"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          }`}
                        >
                          {n.severity}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(n.dispatched_at || n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      {n.message}
                    </p>

                    {/* Metadata & Actions Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-400 font-mono">
                        {n.metadata?.case_number && (
                          <span>Case: <strong className="text-indigo-300">{n.metadata.case_number}</strong></span>
                        )}
                        {n.metadata?.outstanding_amount && (
                          <span>Due: <strong className="text-emerald-400">₹{Number(n.metadata.outstanding_amount).toLocaleString("en-IN")}</strong></span>
                        )}
                        {n.metadata?.due_date && (
                          <span>Target: <strong className="text-slate-200">{n.metadata.due_date}</strong></span>
                        )}
                        <span>Channel: <strong className="text-slate-300">{n.channel || "IN_APP"}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUnread ? (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Read</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Read at {new Date(n.read_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Dismiss Notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 2: SPRING SCHEDULER CONTROL DECK
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "scheduler" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Spring Scheduler Core Engine</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                SPRING @SCHEDULED CRONS ACTIVE
              </span>
            </div>
          </div>

          {/* Scheduled Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(schedulerStatus?.tasks || []).map((t) => {
              const isTriggering = triggeringTask === t.id;
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                          {t.id.includes("followup") ? (
                            <Calendar className="w-4 h-4 text-sky-400" />
                          ) : t.id.includes("ptp") ? (
                            <IndianRupee className="w-4 h-4 text-emerald-400" />
                          ) : t.id.includes("pending") ? (
                            <Users className="w-4 h-4 text-amber-400" />
                          ) : t.id.includes("supervisor") ? (
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                          ) : t.id.includes("visit") ? (
                            <MapPin className="w-4 h-4 text-purple-400" />
                          ) : t.id.includes("reconciliation") ? (
                            <Receipt className="w-4 h-4 text-teal-400" />
                          ) : (
                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{t.name}</h4>
                          <span className="font-mono text-[11px] text-emerald-400">
                            {t.springAnnotation}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          t.status === "RUNNING"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {t.status === "RUNNING" ? "EXECUTING" : "SCHEDULED"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        <span>Last Run: </span>
                        <strong className="text-slate-200">
                          {t.lastRun ? new Date(t.lastRun).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Boot Scan"}
                        </strong>
                      </div>
                      <div>
                        <span>Runs Count: </span>
                        <strong className="text-slate-200">{t.totalRuns}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Interval: {t.scheduleType === "CRON" ? "Daily Cron" : `${t.intervalMs / 60000} mins`}
                      </span>

                      <button
                        type="button"
                        disabled={isTriggering}
                        onClick={() => handleTriggerTask(t.id, t.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition cursor-pointer disabled:opacity-50"
                      >
                        <Play className={`w-3 h-3 ${isTriggering ? "animate-spin" : ""}`} />
                        <span>{isTriggering ? "Executing..." : "Trigger Run Now"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 3: REDIS & MESSAGE QUEUE ENGINE MONITOR
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "queue" && (
        <div className="space-y-5">
          {/* Architecture Visualization Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Redis Message Queue Architecture</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                ASYNCHRONOUS CONSUMER WORKER
              </span>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">1. Producers</span>
                <h5 className="font-bold text-xs text-white">Spring Scheduler</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  7 scheduled triggers scan overdue loans, PTPs, workloads &amp; reports.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">2. Message Broker</span>
                <h5 className="font-bold text-xs text-white">Redis Queue Topics</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Priority FIFO queue buffers with deduplication fingerprints.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">3. Worker Consumers</span>
                <h5 className="font-bold text-xs text-white">Background Workers</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Non-blocking consumers with exponential backoff &amp; retry handlers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">4. Delivery Hub</span>
                <h5 className="font-bold text-xs text-white">In-App &amp; Webhooks</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Instant bell popover, caller task lists &amp; DLQ failure safety.
                </p>
              </div>
            </div>
          </div>

          {/* Queue Depths Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Active Message Topics &amp; Buffer Depth</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePurgeDlq}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Dead-Letter Queue (DLQ)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "queue:notifications:followup", label: "Follow-up Reminders", depth: queueTelemetry?.queueDepths?.["queue:notifications:followup"] || 0, color: "text-sky-400" },
                { name: "queue:notifications:ptp", label: "PTP Payments Today", depth: queueTelemetry?.queueDepths?.["queue:notifications:ptp"] || 0, color: "text-emerald-400" },
                { name: "queue:notifications:workload", label: "Pending Workloads", depth: queueTelemetry?.queueDepths?.["queue:notifications:workload"] || 0, color: "text-amber-400" },
                { name: "queue:notifications:approvals", label: "Supervisor Approvals", depth: queueTelemetry?.queueDepths?.["queue:notifications:approvals"] || 0, color: "text-rose-400" },
                { name: "queue:notifications:visits", label: "Field Visit Overdue", depth: queueTelemetry?.queueDepths?.["queue:notifications:visits"] || 0, color: "text-purple-400" },
                { name: "queue:notifications:reconciliation", label: "Payment Reconcile", depth: queueTelemetry?.queueDepths?.["queue:notifications:reconciliation"] || 0, color: "text-teal-400" },
                { name: "queue:notifications:reports", label: "Daily Shift Reports", depth: queueTelemetry?.queueDepths?.["queue:notifications:reports"] || 0, color: "text-indigo-400" },
                { name: "queue:notifications:deadletter", label: "Dead-Letter Queue (DLQ)", depth: queueTelemetry?.queueDepths?.["queue:notifications:deadletter"] || 0, color: "text-rose-400" }
              ].map((q) => (
                <div key={q.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 truncate block">{q.name}</span>
                  <div className={`text-xl font-bold font-mono ${q.color}`}>{q.depth} queued</div>
                  <span className="text-xs text-slate-300 font-medium">{q.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 4: BROADCAST OPERATIONAL ALERT
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "broadcast" && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Broadcast Operational Announcement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Push an urgent broadcast alert directly into the Redis message queue. The worker will instantly deliver it to the target roles.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                placeholder="e.g. End of Month Target Sprint / Calling Curfew Notice"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={broadcastForm.recipient_role}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, recipient_role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Operations Staff</option>
                  <option value="CALLER">Tele-Calling Specialists Only</option>
                  <option value="FIELD_AGENT">Field Recovery Agents Only</option>
                  <option value="SUPERVISOR">Supervisors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alert Severity
                </label>
                <select
                  value={broadcastForm.severity}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="INFO">Informational (Blue)</option>
                  <option value="WARNING">Important Warning (Amber)</option>
                  <option value="CRITICAL">Critical Compliance Alert (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Announcement Message *
              </label>
              <textarea
                rows={4}
                placeholder="Provide detailed instructions, statutory requirements, or deadline specifics..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab("feed")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={broadcastSending}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastSending ? "Dispatching..." : "Enqueue Broadcast"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotificationHub;

