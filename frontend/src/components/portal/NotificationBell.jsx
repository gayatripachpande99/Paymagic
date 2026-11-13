import React, { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  X,
  Radio
} from "lucide-react";
import api from "../../services/api";

export const NotificationBell = ({ onNavigateToHub, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL | UNREAD
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  // When dropdown opens, fetch latest notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      if (res && res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Silently fail if not authenticated
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications?limit=10");
      if (res && res.success && res.data) {
        setNotifications(res.data);
        if (res.telemetry?.unreadCount !== undefined) {
          setUnreadCount(res.telemetry.unreadCount);
        }
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.warn("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch("/notifications/read-all");
      if (res && res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
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

  const formatTimeAgo = (isoString) => {
    if (!isoString) return "just now";
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredList =
    activeFilter === "UNREAD"
      ? notifications.filter((n) => n.status === "UNREAD")
      : notifications;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition shadow-sm cursor-pointer flex items-center justify-center focus:outline-none"
        title="Notifications & Reminders"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-900/40 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Reminders &amp; Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("UNREAD")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === "UNREAD"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              Unread ({notifications.filter((n) => n.status === "UNREAD").length})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-500">No unread automated reminders right now.</p>
              </div>
            ) : (
              filteredList.map((n) => {
                const isUnread = n.status === "UNREAD";
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(n.id);
                    }}
                    className={`p-3.5 transition flex gap-3 cursor-pointer ${
                      isUnread ? "bg-slate-800/40 hover:bg-slate-800/70" : "hover:bg-slate-800/20 opacity-80"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-semibold text-xs text-slate-200 truncate pr-1">
                          {n.title}
                        </h5>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {formatTimeAgo(n.dispatched_at || n.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            n.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : n.severity === "WARNING"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          }`}
                        >
                          {n.severity}
                        </span>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToHub) onNavigateToHub();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center gap-1.5 w-full cursor-pointer transition"
            >
              <span>View Full Automated Reminders &amp; Scheduler Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

