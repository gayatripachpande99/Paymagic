import { useState, useEffect } from "react";
import api from "../services/api";

export default function EmployeeDashboard({ user, onLogout, onBackToHome }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(user || null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [liveWorkingTime, setLiveWorkingTime] = useState("");

  // Leave management local state
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "LV-102",
      type: "Casual Leave",
      fromDate: "2026-09-15",
      toDate: "2026-09-16",
      days: 2,
      reason: "Family event",
      status: "APPROVED",
      appliedOn: "2026-09-10"
    }
  ]);

  // Employee Assigned Records State
  const [myAssignedRecords, setMyAssignedRecords] = useState([]);
  const [empRecordSearch, setEmpRecordSearch] = useState("");

  const loadEmployeeAssignedRecords = async () => {
    try {
      const res = await api.get("/employee/records");
      if (res && res.success) {
        setMyAssignedRecords(res.records || []);
      }
    } catch (err) {
      console.error("Failed to load employee assigned records:", err);
    }
  };

  const handleToggleRecordStatus = async (recordId, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const res = await api.post(`/employee/records/${recordId}/status`, { recordStatus: nextStatus });
      if (res && res.success) {
        setSuccessMsg(`Record ${recordId} updated to ${nextStatus}!`);
        await loadEmployeeAssignedRecords();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update record status.");
    }
  };

  // Fetch initial profile, today attendance, and history
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [profileRes, todayRes, historyRes] = await Promise.allSettled([
        api.get("/employee/me"),
        api.get("/attendance/today"),
        api.get("/attendance/history")
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.success) {
        setProfile(profileRes.value.employee);
      }
      if (todayRes.status === "fulfilled" && todayRes.value.success) {
        setTodayAttendance(todayRes.value.attendance);
      }
      if (historyRes.status === "fulfilled" && historyRes.value.success) {
        setHistory(historyRes.value.attendance || []);
      }

      await loadEmployeeAssignedRecords();
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setErrorMsg("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  // Live timer ticker for active working session
  useEffect(() => {
    let interval = null;
    if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
      const updateTimer = () => {
        const checkInTime = new Date(todayAttendance.checkIn).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - checkInTime);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setLiveWorkingTime(
          `${hours.toString().padStart(2, "0")}h ${minutes
            .toString()
            .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
        );
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setLiveWorkingTime("");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayAttendance]);

  // Check-In Action
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/attendance/check-in", {});
      if (res.success) {
        setTodayAttendance(res.attendance);
        setSuccessMsg("Attendance marked successfully! Have a productive day.");
        // Refresh history
        const hist = await api.get("/attendance/history");
        if (hist.success) setHistory(hist.attendance || []);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to mark attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  // Check-Out Action
  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/attendance/check-out", {});
      if (res.success) {
        setTodayAttendance(res.attendance);
        setSuccessMsg("Checked out successfully! Great work today.");
        // Refresh history
        const hist = await api.get("/attendance/history");
        if (hist.success) setHistory(hist.attendance || []);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to check out.");
    } finally {
      setActionLoading(false);
    }
  };

  // Apply Leave Action
  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !leaveReason) {
      setErrorMsg("Please provide from date, to date, and reason.");
      return;
    }

    const newReq = {
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      type: leaveType,
      fromDate,
      toDate,
      days: Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1),
      reason: leaveReason,
      status: "PENDING",
      appliedOn: new Date().toISOString().split("T")[0]
    };

    setLeaveRequests([newReq, ...leaveRequests]);
    setSuccessMsg("Leave application submitted successfully for Admin review.");
    setFromDate("");
    setToDate("");
    setLeaveReason("");
  };

  // Format Helper functions
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "--";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatMinutes = (mins) => {
    if (mins === null || mins === undefined) return "--";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getAttendanceStatus = () => {
    if (!todayAttendance) return { label: "Not Marked", color: "gray", isWorking: false, isDone: false };
    if (todayAttendance.checkOut) return { label: "Completed", color: "blue", isWorking: false, isDone: true };
    if (todayAttendance.checkIn) return { label: "Working / Present", color: "green", isWorking: true, isDone: false };
    return { label: todayAttendance.status || "Present", color: "green", isWorking: false, isDone: false };
  };

  const statusInfo = getAttendanceStatus();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="portal-layout">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="portal-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`portal-sidebar ${mobileSidebarOpen ? "mobile-drawer-open" : ""}`}>
        <div className="portal-sidebar-brand" onClick={onBackToHome} role="button" tabIndex={0}>
          <div className="brand-icon">
            <img src="/logo.jpg" alt="PayMagic Logo" className="logo-img" />
          </div>
          <div className="brand-text">
            <span>Pay<strong>Magic</strong></span>
            <span className="portal-tag-pill">EMPLOYEE</span>
          </div>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar-circle">
            {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : "EM"}
          </div>
          <div className="user-meta">
            <h4>{profile?.fullName || "Employee"}</h4>
            <p>{profile?.employeeId || "PM-EMP-0001"}</p>
            <span className="user-role-tag">{profile?.designation || "Executive"}</span>
          </div>
        </div>

        <nav className="portal-nav">
          <button
            className={`portal-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => { setActiveTab("dashboard"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>My Profile</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveTab("attendance"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Attendance Log</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "leave" ? "active" : ""}`}
            onClick={() => { setActiveTab("leave"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Leave Requests</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "records" ? "active" : ""}`}
            onClick={() => { setActiveTab("records"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Assigned Records ({myAssignedRecords.length})</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => { setActiveTab("documents"); setErrorMsg(""); setSuccessMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Documents &amp; Payslips</span>
          </button>
        </nav>

        <div className="portal-sidebar-footer">
          <button className="portal-back-btn" onClick={onBackToHome}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Public Website</span>
          </button>
          <button className="portal-logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="portal-main">
        {/* Top Header */}
        <header className="portal-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="portal-mobile-toggle-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="topbar-welcome">
              <h2>
                Good Day, <span className="gradient-text">{profile?.fullName?.split(" ")[0] || "Employee"}</span> 👋
              </h2>
              <p className="topbar-subtitle">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            </div>
          </div>

          <div className="topbar-right">

            <div className="live-status-pill">
              <span className={`status-indicator-dot ${statusInfo.color}`} />
              <span>Status: <strong>{statusInfo.label}</strong></span>
            </div>
            <button className="refresh-btn" onClick={loadDashboardData} title="Refresh Data" disabled={loading}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={loading ? "spin-icon" : ""}
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Notifications & Alerts */}
        {errorMsg && (
          <div className="portal-banner banner-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="portal-banner banner-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
        {activeTab === "dashboard" && (
          <div className="portal-tab-content">
            {/* Core Attendance Punch Card */}
            <div className="attendance-punch-card">
              <div className="punch-card-glow" />
              <div className="punch-card-header">
                <div>
                  <span className="punch-tag">BIOMETRIC / TIME TRACKER</span>
                  <h3>Today's Attendance</h3>
                </div>
                <div className={`status-badge-lg badge-${statusInfo.color}`}>
                  <span className="pulse-dot" />
                  {statusInfo.label}
                </div>
              </div>

              <div className="punch-metrics-grid">
                <div className="punch-metric">
                  <span className="metric-title">Check-In Time</span>
                  <div className="metric-val">
                    {todayAttendance?.checkIn ? formatTime(todayAttendance.checkIn) : "--:--"}
                  </div>
                  <span className="metric-sub">
                    {todayAttendance?.checkIn ? "Server Timestamp Verified" : "Not recorded yet"}
                  </span>
                </div>

                <div className="punch-metric">
                  <span className="metric-title">Check-Out Time</span>
                  <div className="metric-val">
                    {todayAttendance?.checkOut ? formatTime(todayAttendance.checkOut) : "--:--"}
                  </div>
                  <span className="metric-sub">
                    {todayAttendance?.checkOut ? "End of Shift" : statusInfo.isWorking ? "Shift in Progress" : "Pending"}
                  </span>
                </div>

                <div className="punch-metric">
                  <span className="metric-title">Hours Worked</span>
                  <div className="metric-val highlight-val">
                    {statusInfo.isWorking
                      ? liveWorkingTime || "Calculating..."
                      : todayAttendance?.totalWorkMinutes !== null && todayAttendance?.totalWorkMinutes !== undefined
                      ? formatMinutes(todayAttendance.totalWorkMinutes)
                      : "--"}
                  </div>
                  <span className="metric-sub">
                    {statusInfo.isWorking ? "● Live Working Timer" : "Shift Total"}
                  </span>
                </div>
              </div>

              <div className="punch-action-bar">
                {!todayAttendance && (
                  <button
                    className="punch-btn check-in-btn"
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{actionLoading ? "Recording Check-In..." : "MARK ATTENDANCE (CHECK IN)"}</span>
                  </button>
                )}

                {todayAttendance && !todayAttendance.checkOut && (
                  <button
                    className="punch-btn check-out-btn"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                    <span>{actionLoading ? "Calculating Work Hours..." : "CHECK OUT & END SHIFT"}</span>
                  </button>
                )}

                {todayAttendance && todayAttendance.checkOut && (
                  <div className="completed-shift-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>You have completed today's attendance cycle ({formatMinutes(todayAttendance.totalWorkMinutes)} recorded).</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="portal-stats-row">
              <div className="portal-stat-card">
                <div className="stat-icon-wrap blue-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Department</span>
                  <div className="stat-value">{profile?.department || "Operations"}</div>
                  <span className="stat-hint">{profile?.designation || "Executive"}</span>
                </div>
              </div>

              <div className="portal-stat-card">
                <div className="stat-icon-wrap green-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Days Logged</span>
                  <div className="stat-value">{history.length}</div>
                  <span className="stat-hint">Active History Logs</span>
                </div>
              </div>

              <div className="portal-stat-card">
                <div className="stat-icon-wrap purple-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Payroll Status</span>
                  <div className="stat-value text-green">On Schedule</div>
                  <span className="stat-hint">T+0 Automated Payout</span>
                </div>
              </div>
            </div>

            {/* Recent History Preview */}
            <div className="portal-table-container">
              <div className="table-header-row">
                <div>
                  <h3>Recent Attendance Activity</h3>
                  <p>Verified timestamps recorded directly by backend server</p>
                </div>
                <button className="view-all-btn" onClick={() => setActiveTab("attendance")}>
                  View Full History →
                </button>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Total Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 5).map((rec) => (
                      <tr key={rec._id}>
                        <td><strong>{formatDate(rec.attendanceDate)}</strong></td>
                        <td>{formatTime(rec.checkIn)}</td>
                        <td>{formatTime(rec.checkOut)}</td>
                        <td>{formatMinutes(rec.totalWorkMinutes)}</td>
                        <td>
                          <span className={`status-pill pill-${rec.checkOut ? "green" : "blue"}`}>
                            {rec.checkOut ? "Completed" : rec.checkIn ? "Working" : rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-table-cell">
                          No attendance records found yet. Mark today's attendance above to create your first record!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY PROFILE ── */}
        {activeTab === "profile" && (
          <div className="portal-tab-content">
            <div className="profile-grid">
              <div className="profile-card profile-main-card">
                <div className="profile-header-banner">
                  <div className="profile-large-avatar">
                    {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : "EM"}
                  </div>
                  <div className="profile-title-area">
                    <h3>{profile?.fullName}</h3>
                    <p>{profile?.designation} · {profile?.department}</p>
                    <span className="badge-active">ACTIVE EMPLOYEE</span>
                  </div>
                </div>

                <div className="profile-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Employee ID</span>
                    <span className="detail-val font-mono">{profile?.employeeId}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Corporate Email</span>
                    <span className="detail-val">{profile?.email || "employee@paymagic.in"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Contact Phone</span>
                    <span className="detail-val">{profile?.phone || "+91 9876543211"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Department</span>
                    <span className="detail-val">{profile?.department || "Operations"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Designation</span>
                    <span className="detail-val">{profile?.designation || "Executive"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Joining Date</span>
                    <span className="detail-val">
                      {profile?.joiningDate ? formatDate(profile.joiningDate) : "01 Sep 2026"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">System Role</span>
                    <span className="detail-val">{profile?.role || "EMPLOYEE"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Verification Status</span>
                    <span className="detail-val text-green">✓ KYC Verified</span>
                  </div>
                </div>
              </div>

              <div className="profile-card profile-side-card">
                <h3>Security &amp; Account</h3>
                <p className="side-card-sub">Manage your security preferences and active sessions.</p>
                <div className="security-actions">
                  <div className="security-row">
                    <div>
                      <strong>Authentication Token</strong>
                      <p>Active 24h JWT Session</p>
                    </div>
                    <span className="status-pill pill-green">Valid</span>
                  </div>
                  <div className="security-row">
                    <div>
                      <strong>Password Protection</strong>
                      <p>Encrypted with bcrypt (10 rounds)</p>
                    </div>
                    <span className="status-pill pill-blue">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ATTENDANCE HISTORY ── */}
        {activeTab === "attendance" && (
          <div className="portal-tab-content">
            <div className="portal-table-container">
              <div className="table-header-row">
                <div>
                  <h3>Full Attendance Log</h3>
                  <p>Comprehensive record of all employee check-ins and check-outs</p>
                </div>
                <div className="record-count-badge">{history.length} Total Records</div>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Total Working Time</th>
                      <th>Status</th>
                      <th>Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((rec) => (
                      <tr key={rec._id}>
                        <td><strong>{formatDate(rec.attendanceDate)}</strong></td>
                        <td className="font-mono">{formatTime(rec.checkIn)}</td>
                        <td className="font-mono">{formatTime(rec.checkOut)}</td>
                        <td><strong>{formatMinutes(rec.totalWorkMinutes)}</strong></td>
                        <td>
                          <span className={`status-pill pill-${rec.checkOut ? "green" : "blue"}`}>
                            {rec.checkOut ? "Completed" : rec.checkIn ? "Working" : rec.status}
                          </span>
                        </td>
                        <td>
                          <span className="audit-tag">✓ Server Verified</span>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan="6" className="empty-table-cell">
                          No history records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: LEAVE MANAGEMENT ── */}
        {activeTab === "leave" && (
          <div className="portal-tab-content">
            <div className="leave-grid">
              <div className="leave-form-card">
                <h3>Apply for Leave</h3>
                <p className="side-card-sub">Submit a formal leave request for HR and Admin approval.</p>

                <form onSubmit={handleApplyLeave} className="leave-form">
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="custom-select"
                    >
                      <option value="Casual Leave">Casual Leave (CL)</option>
                      <option value="Sick Leave">Sick Leave (SL)</option>
                      <option value="Paid Leave">Paid Privilege Leave (PL)</option>
                      <option value="Comp Off">Compensatory Off</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="custom-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="custom-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Reason for Leave</label>
                    <textarea
                      rows="3"
                      placeholder="Briefly describe the reason for your leave request..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="custom-textarea"
                      required
                    />
                  </div>

                  <button type="submit" className="primary-btn submit-leave-btn">
                    Submit Leave Application
                  </button>
                </form>
              </div>

              <div className="leave-balance-card">
                <h3>Leave Balances</h3>
                <div className="balance-tiles">
                  <div className="balance-tile">
                    <span className="balance-val">12</span>
                    <span className="balance-label">Casual Leaves</span>
                  </div>
                  <div className="balance-tile">
                    <span className="balance-val">08</span>
                    <span className="balance-label">Sick Leaves</span>
                  </div>
                  <div className="balance-tile">
                    <span className="balance-val">15</span>
                    <span className="balance-label">Paid Leaves</span>
                  </div>
                </div>

                <h4 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "15px", color: "white" }}>
                  My Leave Applications
                </h4>
                <div className="leave-requests-list">
                  {leaveRequests.map((req) => (
                    <div className="leave-req-item" key={req.id}>
                      <div className="leave-req-top">
                        <strong>{req.type}</strong>
                        <span className={`status-pill pill-${req.status === "APPROVED" ? "green" : "gold"}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="leave-req-dates">
                        {req.fromDate} to {req.toDate} ({req.days} days)
                      </p>
                      <p className="leave-req-reason">{req.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ASSIGNED RECORDS ── */}
        {activeTab === "records" && (
          <div className="portal-tab-content">
            {/* KPI Summary Header Cards */}
            <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap blue-wrap">📑</div>
                <div className="kpi-data">
                  <span className="kpi-label">Total Assigned Records</span>
                  <div className="kpi-val">{myAssignedRecords.length}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap green-wrap">✓</div>
                <div className="kpi-data">
                  <span className="kpi-label">Completed Records</span>
                  <div className="kpi-val text-green">
                    {myAssignedRecords.filter((r) => r.recordStatus === "COMPLETED").length}
                  </div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap gold-wrap">⏳</div>
                <div className="kpi-data">
                  <span className="kpi-label">Pending Processing</span>
                  <div className="kpi-val text-gold">
                    {myAssignedRecords.filter((r) => r.recordStatus !== "COMPLETED").length}
                  </div>
                </div>
              </div>
            </div>

            {/* Records List Table */}
            <div className="portal-table-container">
              <div className="table-header-row table-filter-bar">
                <div>
                  <h3>My Assigned Work Records</h3>
                  <p>
                    Records assigned by Administrator ({user?.employeeId || profile?.employeeId})
                  </p>
                </div>

                <div className="search-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Filter my assigned records..."
                    value={empRecordSearch}
                    onChange={(e) => setEmpRecordSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Record # &amp; ID</th>
                      <th>Record Title / Transaction</th>
                      <th>Customer / Client Name</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Assigned Date</th>
                      <th>Processing Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAssignedRecords
                      .filter((rec) => {
                        const q = empRecordSearch.toLowerCase();
                        return (
                          String(rec.recordNumber).includes(q) ||
                          rec.id?.toLowerCase().includes(q) ||
                          rec.title?.toLowerCase().includes(q) ||
                          rec.customerName?.toLowerCase().includes(q)
                        );
                      })
                      .map((rec) => (
                        <tr key={rec.id}>
                          <td>
                            <strong className="font-mono text-green">#{rec.recordNumber}</strong>
                            <span className="font-mono text-muted" style={{ display: "block", fontSize: "11px" }}>
                              {rec.id}
                            </span>
                          </td>
                          <td>
                            <strong>{rec.title}</strong>
                          </td>
                          <td>{rec.customerName}</td>
                          <td className="font-mono" style={{ fontWeight: 700, color: "#60a5fa" }}>
                            {rec.amount}
                          </td>
                          <td>
                            <span className="service-tag" style={{ margin: 0 }}>{rec.category}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{rec.assignedAt || "Today"}</span>
                          </td>
                          <td>
                            <span
                              className={`status-pill pill-${rec.recordStatus === "COMPLETED" ? "green" : "gold"}`}
                            >
                              {rec.recordStatus || "PENDING"}
                            </span>
                          </td>
                          <td>
                            <button
                              className={rec.recordStatus === "COMPLETED" ? "toggle-pass-btn" : "action-btn-approve"}
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                              onClick={() => handleToggleRecordStatus(rec.id, rec.recordStatus)}
                            >
                              {rec.recordStatus === "COMPLETED" ? "Undo" : "Mark Completed"}
                            </button>
                          </td>
                        </tr>
                      ))}

                    {myAssignedRecords.length === 0 && (
                      <tr>
                        <td colSpan="8" className="empty-table-cell">
                          No records have been assigned to your account ({user?.employeeId || "Employee"}) yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: DOCUMENTS ── */}
        {activeTab === "documents" && (
          <div className="portal-tab-content">
            <div className="portal-table-container">
              <div className="table-header-row">
                <div>
                  <h3>Official Documents &amp; Payslips</h3>
                  <p>Download and inspect corporate agreements and monthly salary slips</p>
                </div>
              </div>

              <div className="docs-grid">
                <div className="doc-card">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <h4>Employment Agreement</h4>
                    <p>Signed on 01 Sep 2026 · PDF (1.2 MB)</p>
                  </div>
                  <button className="doc-action-btn" onClick={() => alert("Downloading Employment Agreement...")}>
                    Download
                  </button>
                </div>

                <div className="doc-card">
                  <div className="doc-icon">💼</div>
                  <div className="doc-info">
                    <h4>Salary Slip — August 2026</h4>
                    <p>Disbursed via PayMagic T+0 Payout · PDF (340 KB)</p>
                  </div>
                  <button className="doc-action-btn" onClick={() => alert("Downloading Payslip...")}>
                    Download
                  </button>
                </div>

                <div className="doc-card">
                  <div className="doc-icon">🛡️</div>
                  <div className="doc-info">
                    <h4>Non-Disclosure Agreement (NDA)</h4>
                    <p>Corporate Compliance Document · PDF (850 KB)</p>
                  </div>
                  <button className="doc-action-btn" onClick={() => alert("Downloading NDA...")}>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
