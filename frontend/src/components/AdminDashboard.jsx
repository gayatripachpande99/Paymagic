import { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    present: 0,
    working: 0,
    completed: 0,
    notMarked: 0,
    onLeave: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);


  // Show/Hide password states
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Modal State for Adding New Employee
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "Operations",
    designation: "Executive",
    password: "Emp@123",
    joiningDate: new Date().toISOString().split("T")[0]
  });

  // Sample pending leave requests for HR / Admin approval
  const [leaveApprovals, setLeaveApprovals] = useState([
    {
      id: "LV-204",
      employeeId: "PM-EMP-0001",
      employeeName: "Rahul Sharma",
      department: "Operations",
      type: "Casual Leave",
      fromDate: "2026-10-02",
      toDate: "2026-10-03",
      days: 2,
      reason: "Family emergency",
      status: "PENDING"
    }
  ]);

  // Record Management & Allocation State
  const [recordsData, setRecordsData] = useState([]);
  const [recordsSummary, setRecordsSummary] = useState({
    totalRecords: 0,
    assignedRecords: 0,
    unassignedRecords: 0,
    breakdown: {}
  });
  const [selectedAssignEmp, setSelectedAssignEmp] = useState("PM-EMP-0001");
  const [startRangeNum, setStartRangeNum] = useState("1");
  const [endRangeNum, setEndRangeNum] = useState("100");
  const [assignLoading, setAssignLoading] = useState(false);
  const [recordSearchTerm, setRecordSearchTerm] = useState("");
  const [recordFilterEmp, setRecordFilterEmp] = useState("ALL");
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  const loadAdminRecords = async () => {
    try {
      const res = await api.get("/admin/records");
      if (res && res.success) {
        setRecordsData(res.records || []);
        setRecordsSummary(res.summary || {});
      }
    } catch (err) {
      console.error("Admin records fetch error:", err);
    }
  };

  const loadAdminAttendance = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [attRes, empRes] = await Promise.allSettled([
        api.get("/admin/attendance/today"),
        api.get("/admin/employees")
      ]);

      if (attRes.status === "fulfilled" && attRes.value.success) {
        setSummary(attRes.value.summary || {});
        setAttendanceData(attRes.value.attendance || []);
      }

      if (empRes.status === "fulfilled" && empRes.value.success) {
        setEmployeesList(empRes.value.employees || []);
      }

      await loadAdminRecords();
    } catch (err) {
      console.error("Admin data fetch error:", err);
      setErrorMsg(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminAttendance();
  }, []);

  const handleAssignRangeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignEmp || !startRangeNum || !endRangeNum) {
      setErrorMsg("Please select an employee and enter valid start and end record numbers.");
      return;
    }

    try {
      setAssignLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/admin/records/assign", {
        employeeId: selectedAssignEmp,
        startRecordNum: parseInt(startRangeNum, 10),
        endRecordNum: parseInt(endRangeNum, 10)
      });

      if (res.success) {
        setSuccessMsg(res.message);
        await loadAdminRecords();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to assign records range.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleQuickPresetAssign = async (empId, startNum, endNum) => {
    setSelectedAssignEmp(empId);
    setStartRangeNum(String(startNum));
    setEndRangeNum(String(endNum));

    try {
      setAssignLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/admin/records/assign", {
        employeeId: empId,
        startRecordNum: startNum,
        endRecordNum: endNum
      });

      if (res.success) {
        setSuccessMsg(res.message);
        await loadAdminRecords();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to assign preset range.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleFileUploadInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploadLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        let parsedRecords = [];

        if (file.name.endsWith(".json")) {
          parsedRecords = JSON.parse(content);
        } else {
          // Parse CSV or Text lines
          const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          parsedRecords = lines.map((line, idx) => {
            const cols = line.split(",");
            return {
              title: cols[0] || `Uploaded Item #${idx + 1}`,
              customerName: cols[1] || `Customer #${idx + 1}`,
              amount: cols[2] || `₹${(2000 + idx * 100).toLocaleString("en-IN")}`,
              category: cols[3] || "Uploaded File Batch"
            };
          });
        }

        if (parsedRecords.length === 0) {
          setErrorMsg("File contains no valid record entries.");
          return;
        }

        const res = await api.post("/admin/records/upload", { records: parsedRecords });
        if (res.success) {
          setSuccessMsg(`File '${file.name}' uploaded successfully! ${res.message}`);
          await loadAdminRecords();
        }
      } catch (err) {
        setErrorMsg("Failed to upload/parse file: " + err.message);
      } finally {
        setFileUploadLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateDefaultBatch = async () => {
    try {
      setFileUploadLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const defaultRecords = Array.from({ length: 200 }, (_, i) => ({
        title: `Payment Settlement Transaction #${1000 + i + 1}`,
        customerName: `Client ${String.fromCharCode(65 + ((i + 1) % 26))}${i + 1}`,
        amount: `₹${(2500 + (i + 1) * 175).toLocaleString("en-IN")}`,
        category: (i + 1) % 3 === 0 ? "Vendor Settlement" : (i + 1) % 2 === 0 ? "Corporate Payroll" : "Merchant Payout"
      }));

      const res = await api.post("/admin/records/upload", { records: defaultRecords, mode: "replace" });
      if (res.success) {
        setSuccessMsg("Generated and stored 200 standard records in database successfully!");
        await loadAdminRecords();
      }
    } catch (err) {
      setErrorMsg("Failed to generate default batch: " + err.message);
    } finally {
      setFileUploadLoading(false);
    }
  };


  const togglePasswordVisibility = (empId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  const copyToClipboard = (text, idKey) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleCreateEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmployeeForm.fullName.trim()) {
      setModalError("Employee full name is required.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      const res = await api.post("/admin/employees", newEmployeeForm);
      if (res.success) {
        setSuccessMsg(
          `Employee ${res.employee.fullName} registered successfully! ID: ${res.employee.employeeId} | Password: ${res.employee.initialPassword}`
        );
        setShowAddModal(false);
        setNewEmployeeForm({
          fullName: "",
          employeeId: "",
          email: "",
          phone: "",
          department: "Operations",
          designation: "Executive",
          password: "Emp@123",
          joiningDate: new Date().toISOString().split("T")[0]
        });
        loadAdminAttendance();
      }
    } catch (err) {
      setModalError(err.message || "Failed to create employee.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleApproveLeave = (id) => {
    setLeaveApprovals(
      leaveApprovals.map((req) =>
        req.id === id ? { ...req, status: "APPROVED" } : req
      )
    );
  };

  const handleRejectLeave = (id) => {
    setLeaveApprovals(
      leaveApprovals.map((req) =>
        req.id === id ? { ...req, status: "REJECTED" } : req
      )
    );
  };

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatMinutes = (mins) => {
    if (mins === null || mins === undefined) return "--";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Filter attendance records
  const filteredRecords = attendanceData.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : item.status === statusFilter;

    const matchesDept =
      deptFilter === "ALL" ? true : item.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const departments = Array.from(
    new Set(attendanceData.map((d) => d.department).filter(Boolean))
  );

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
            <span className="portal-tag-pill admin-pill">ADMIN</span>
          </div>
        </div>

        <div className="sidebar-user-card admin-user-card">
          <div className="user-avatar-circle admin-avatar-circle">
            {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="user-meta">
            <h4>{user?.fullName || "System Admin"}</h4>
            <p>{user?.employeeId || "PM-ADMIN-0001"}</p>
            <span className="user-role-tag admin-tag">{user?.role || "ADMINISTRATOR"}</span>
          </div>
        </div>

        <nav className="portal-nav">
          <button
            className={`portal-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveTab("attendance"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Live Attendance</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => { setActiveTab("employees"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Staff Directory &amp; Passwords</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "records" ? "active" : ""}`}
            onClick={() => { setActiveTab("records"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <span>Record Upload &amp; Allocation</span>
          </button>

          <button
            className={`portal-nav-item ${activeTab === "leave-approvals" ? "active" : ""}`}
            onClick={() => { setActiveTab("leave-approvals"); setErrorMsg(""); setMobileSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Leave Approvals</span>
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
                Admin Command Center · <span className="gradient-text">Staff &amp; Credentials</span>
              </h2>
              <p className="topbar-subtitle">
                Live Employee Operations, Biometric Attendance &amp; Credential Management
              </p>
            </div>
          </div>


          <div className="topbar-right">
            {/* Prominent Add Employee Button */}
            <button
              className="primary-btn add-emp-btn"
              onClick={() => { setShowAddModal(true); setModalError(""); }}
            >
              <span>Add New Employee</span>

            </button>

            <button className="refresh-btn" onClick={loadAdminAttendance} title="Refresh Live Data" disabled={loading}>
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
              <span>Refresh</span>
            </button>
          </div>
        </header>

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

        {/* ── TAB 1: LIVE ATTENDANCE MONITORING ── */}
        {activeTab === "attendance" && (
          <div className="portal-tab-content">
            {/* KPI Summary Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap blue-wrap">👥</div>
                <div className="kpi-data">
                  <span className="kpi-label">Total Staff</span>
                  <div className="kpi-val">{summary.totalEmployees}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap green-wrap">⚡</div>
                <div className="kpi-data">
                  <span className="kpi-label">Present Today</span>
                  <div className="kpi-val text-green">{summary.present}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap purple-wrap">💼</div>
                <div className="kpi-data">
                  <span className="kpi-label">Currently Working</span>
                  <div className="kpi-val text-purple">{summary.working}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap teal-wrap">✓</div>
                <div className="kpi-data">
                  <span className="kpi-label">Shift Completed</span>
                  <div className="kpi-val text-teal">{summary.completed}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap gold-wrap">⏳</div>
                <div className="kpi-data">
                  <span className="kpi-label">Not Marked Yet</span>
                  <div className="kpi-val text-gold">{summary.notMarked}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap red-wrap">🌴</div>
                <div className="kpi-data">
                  <span className="kpi-label">On Leave</span>
                  <div className="kpi-val text-red">{summary.onLeave}</div>
                </div>
              </div>
            </div>

            {/* Attendance Table & Filters */}
            <div className="portal-table-container">
              <div className="table-header-row table-filter-bar">
                <div className="search-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, ID or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filter-dropdowns">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="WORKING">Working (In Progress)</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="NOT_MARKED">Not Marked</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>

                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((item) => (
                      <tr key={item.employeeMongoId}>
                        <td>
                          <div className="table-emp-cell">
                            <div className="table-avatar">
                              {item.name ? item.name.slice(0, 2).toUpperCase() : "EM"}
                            </div>
                            <div>
                              <strong>{item.name}</strong>
                              <span className="font-mono text-muted" style={{ display: "block", fontSize: "11.5px" }}>
                                {item.employeeId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{item.department || "Operations"}</td>
                        <td>{item.designation || "Staff"}</td>
                        <td className="font-mono">{formatTime(item.checkIn)}</td>
                        <td className="font-mono">{formatTime(item.checkOut)}</td>
                        <td><strong>{formatMinutes(item.totalWorkMinutes)}</strong></td>
                        <td>
                          <span
                            className={`status-pill pill-${
                              item.status === "WORKING"
                                ? "green pulse-pill"
                                : item.status === "COMPLETED"
                                ? "blue"
                                : item.status === "NOT_MARKED"
                                ? "gold"
                                : "red"
                            }`}
                          >
                            {item.status === "WORKING"
                              ? "● Working"
                              : item.status === "COMPLETED"
                              ? "Completed"
                              : item.status === "NOT_MARKED"
                              ? "Not Marked"
                              : item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table-cell">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: RECORD UPLOAD & RANGE ALLOCATION ── */}
        {activeTab === "records" && (
          <div className="portal-tab-content">
            {/* KPI Summary Banner */}
            <div className="admin-kpi-grid records-kpi-grid" style={{ marginBottom: "20px" }}>
              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap blue-wrap">📁</div>
                <div className="kpi-data">
                  <span className="kpi-label">Total Stored Records</span>
                  <div className="kpi-val">{recordsSummary.totalRecords || recordsData.length}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap green-wrap">⚡</div>
                <div className="kpi-data">
                  <span className="kpi-label">Assigned Records</span>
                  <div className="kpi-val text-green">{recordsSummary.assignedRecords || 0}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap gold-wrap">⏳</div>
                <div className="kpi-data">
                  <span className="kpi-label">Unassigned Records</span>
                  <div className="kpi-val text-gold">{recordsSummary.unassignedRecords || 0}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap purple-wrap">👥</div>
                <div className="kpi-data">
                  <span className="kpi-label">Staff Accounts</span>
                  <div className="kpi-val text-purple">{employeesList.filter((e) => e.role === "EMPLOYEE").length}</div>
                </div>
              </div>
            </div>

            {/* Workflow Step Cards Grid */}
            <div className="admin-workflow-grid" style={{ marginBottom: "24px" }}>

              {/* Card 1: File Upload & Records Import */}
              <div className="leave-form-card" style={{ background: "rgba(15, 23, 42, 0.7)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "12px" }}>
                  <span className="user-role-tag admin-tag">ADMIN ACCESS</span>
                </div>
                <h3 style={{ color: "white", fontSize: "18px" }}>Upload Records File</h3>
                <p className="side-card-sub" style={{ fontSize: "13px" }}>
                  Upload CSV, JSON, or text file containing batch data records to store in database.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
                  <div className="file-upload-dropzone">
                    <input
                      type="file"
                      accept=".csv, .json, .txt"
                      onChange={handleFileUploadInput}
                      id="record-file-input"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="record-file-input" className="file-drop-label">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div>
                        <strong>{fileUploadLoading ? "Uploading & Storing Records..." : "Click to Upload File (.CSV / .JSON / .TXT)"}</strong>
                        <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>Automated sequential index numbering &amp; record ID generation</p>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ width: "100%", justifyContent: "center", fontSize: "13px", padding: "10px 14px" }}
                      onClick={handleGenerateDefaultBatch}
                      disabled={fileUploadLoading}
                    >
                      ⚡ Load Standard 200 Records Batch
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Range Assignment Tool */}
              <div className="leave-form-card" style={{ background: "rgba(15, 23, 42, 0.7)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "12px" }}>
                  <span className="user-role-tag" style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                    {recordsSummary.assignedRecords || 0} Assigned
                  </span>
                </div>
                <h3 style={{ color: "white", fontSize: "18px" }}>Assign Record Ranges to Employee</h3>
                <p className="side-card-sub" style={{ fontSize: "13px" }}>
                  Specify start and end record numbers to assign in bulk to any employee account.
                </p>

                <form onSubmit={handleAssignRangeSubmit} className="leave-form" style={{ marginTop: "16px" }}>
                  <div className="form-group">
                    <label>Select Target Employee Account *</label>
                    <select
                      value={selectedAssignEmp}
                      onChange={(e) => setSelectedAssignEmp(e.target.value)}
                      className="custom-select"
                      required
                    >
                      {employeesList
                        .filter((u) => u.role === "EMPLOYEE")
                        .map((emp) => (
                          <option key={emp.id} value={emp.employeeId}>
                            {emp.fullName} ({emp.employeeId}) — {emp.department}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>From Record #</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={startRangeNum}
                        onChange={(e) => setStartRangeNum(e.target.value)}
                        className="custom-input font-mono"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>To Record #</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="100"
                        value={endRangeNum}
                        onChange={(e) => setEndRangeNum(e.target.value)}
                        className="custom-input font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="primary-btn"
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={assignLoading}
                  >
                    {assignLoading
                      ? "Assigning Range..."
                      : `Assign Records ${startRangeNum || 1} to ${endRangeNum || 100} → ${selectedAssignEmp}`}
                  </button>
                </form>
              </div>

            </div>

            {/* Live Database Records Table */}
            <div className="portal-table-container">
              <div className="table-header-row table-filter-bar">
                <div>
                  <h3>Stored Records Master Database ({recordsData.length})</h3>
                  <p>Real-time dataset stored in backend database, showing range assignment &amp; status</p>
                </div>

                <div className="search-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by record #, ID, customer name..."
                    value={recordSearchTerm}
                    onChange={(e) => setRecordSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filter-dropdowns">
                  <select
                    value={recordFilterEmp}
                    onChange={(e) => setRecordFilterEmp(e.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Employees</option>
                    <option value="PM-EMP-0001">PM-EMP-0001 (Rahul Sharma)</option>
                    <option value="PM-EMP-0002">PM-EMP-0002 (Priya Patel)</option>
                    <option value="UNASSIGNED">Unassigned Records Only</option>
                  </select>
                </div>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Record # &amp; ID</th>
                      <th>Record Title / Transaction</th>
                      <th>Customer / Client</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Assigned Employee</th>
                      <th>Assigned By &amp; Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsData
                      .filter((rec) => {
                        const searchLower = recordSearchTerm.toLowerCase();
                        const matchesSearch =
                          String(rec.recordNumber).includes(searchLower) ||
                          rec.id?.toLowerCase().includes(searchLower) ||
                          rec.title?.toLowerCase().includes(searchLower) ||
                          rec.customerName?.toLowerCase().includes(searchLower) ||
                          rec.assignedTo?.toLowerCase().includes(searchLower) ||
                          rec.assignedToName?.toLowerCase().includes(searchLower);

                        const matchesEmp =
                          recordFilterEmp === "ALL"
                            ? true
                            : recordFilterEmp === "UNASSIGNED"
                            ? !rec.assignedTo
                            : rec.assignedTo === recordFilterEmp;

                        return matchesSearch && matchesEmp;
                      })
                      .slice(0, 100)
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
                            {rec.assignedTo ? (
                              <div>
                                <strong style={{ color: "#34d399", fontSize: "13px" }}>{rec.assignedToName}</strong>
                                <span className="font-mono" style={{ display: "block", fontSize: "11.5px", color: "#94a3b8" }}>
                                  {rec.assignedTo}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: "#f59e0b", fontSize: "12px", fontStyle: "italic" }}>
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "#cbd5e1", display: "block" }}>
                              {rec.assignedBy || "PM-ADMIN-0001"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {rec.assignedAt || "—"}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill pill-${rec.assignedTo ? "green" : "gold"}`}>
                              {rec.assignedTo ? "ASSIGNED" : "UNASSIGNED"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {recordsData.length === 0 && (
                      <tr>
                        <td colSpan="8" className="empty-table-cell">
                          No records stored in database yet. Click "Load Standard 200 Records Batch" or upload a file above!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: EMPLOYEES DIRECTORY & PASSWORDS ── */}
        {activeTab === "employees" && (
          <div className="portal-tab-content">
            <div className="portal-table-container">
              <div className="table-header-row">
                <div>
                  <h3>Staff Credentials &amp; Directory</h3>
                  <p>View all employee names, unique employee IDs, and access passwords for system login</p>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    className="toggle-pass-btn"
                    onClick={() => setShowAllPasswords(!showAllPasswords)}
                  >
                    {showAllPasswords ? "🙈 Hide Passwords" : "👁️ Reveal All Passwords"}
                  </button>

                  <button
                    className="primary-btn add-emp-btn"
                    onClick={() => { setShowAddModal(true); setModalError(""); }}
                  >
                    Add New Employee

                  </button>
                </div>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table credential-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Employee ID</th>
                      <th>Password</th>
                      <th>Department &amp; Role</th>
                      <th>Contact Info</th>
                      <th>Quick Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeesList.map((emp) => {
                      const isRevealed = showAllPasswords || visiblePasswords[emp.id];
                      const isCopied = copiedId === emp.id;

                      return (
                        <tr key={emp.id}>
                          {/* Name */}
                          <td>
                            <div className="table-emp-cell">
                              <div className={`table-avatar ${emp.role === "ADMIN" ? "admin-avatar-circle" : ""}`}>
                                {emp.fullName ? emp.fullName.slice(0, 2).toUpperCase() : "EM"}
                              </div>
                              <div>
                                <strong style={{ color: "white", fontSize: "14px" }}>{emp.fullName}</strong>
                                <span className={`portal-tag-pill ${emp.role === "ADMIN" ? "admin-pill" : ""}`} style={{ display: "block", marginTop: "4px" }}>
                                  {emp.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Employee ID */}
                          <td>
                            <div className="id-copy-cell">
                              <span className="font-mono credential-badge">{emp.employeeId}</span>
                              <button
                                className="inline-copy-btn"
                                onClick={() => copyToClipboard(emp.employeeId, `${emp.id}-id`)}
                                title="Copy Employee ID"
                              >
                                {copiedId === `${emp.id}-id` ? "✓" : "📋"}
                              </button>
                            </div>
                          </td>

                          {/* Password */}
                          <td>
                            <div className="password-cell">
                              <span className="font-mono password-badge">
                                {isRevealed ? emp.password || "Emp@123" : "••••••••"}
                              </span>
                              <button
                                className="inline-eye-btn"
                                onClick={() => togglePasswordVisibility(emp.id)}
                                title={isRevealed ? "Hide Password" : "Show Password"}
                              >
                                {isRevealed ? "🙈" : "👁️"}
                              </button>
                              <button
                                className="inline-copy-btn"
                                onClick={() => copyToClipboard(emp.password || "Emp@123", `${emp.id}-pass`)}
                                title="Copy Password"
                              >
                                {copiedId === `${emp.id}-pass` ? "✓" : "📋"}
                              </button>
                            </div>
                          </td>

                          {/* Department & Role */}
                          <td>
                            <strong style={{ color: "#e2e8f0" }}>{emp.department || "Operations"}</strong>
                            <span style={{ display: "block", fontSize: "12px", color: "#94a3b8" }}>
                              {emp.designation || "Executive"}
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td>
                            <span style={{ display: "block", fontSize: "12.5px", color: "#cbd5e1" }}>
                              {emp.email || "—"}
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                              {emp.phone || "—"}
                            </span>
                          </td>

                          {/* Copy Full Credentials */}
                          <td>
                            <button
                              className="copy-creds-btn"
                              onClick={() => {
                                const creds = `PayMagic Login Credentials:\nName: ${emp.fullName}\nEmployee ID: ${emp.employeeId}\nPassword: ${emp.password || "Emp@123"}\nLogin URL: https://paymagic-48er.vercel.app/`;
                                copyToClipboard(creds, emp.id);
                              }}
                            >
                              {isCopied ? "✓ Copied!" : "Copy Details"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {employeesList.length === 0 && (
                      <tr>
                        <td colSpan="6" className="empty-table-cell">
                          No staff registered yet. Click "+ Add New Employee" to create credentials.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: LEAVE APPROVALS ── */}
        {activeTab === "leave-approvals" && (
          <div className="portal-tab-content">
            <div className="portal-table-container">
              <div className="table-header-row">
                <div>
                  <h3>Pending Leave Requests</h3>
                  <p>Review and act on employee leave applications</p>
                </div>
              </div>

              <div className="custom-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveApprovals.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.employeeName}</strong>
                          <span className="font-mono text-muted" style={{ display: "block" }}>
                            {req.employeeId}
                          </span>
                        </td>
                        <td>{req.department}</td>
                        <td><strong>{req.type}</strong></td>
                        <td>{req.fromDate} to {req.toDate} ({req.days} days)</td>
                        <td>{req.reason}</td>
                        <td>
                          {req.status === "PENDING" ? (
                            <div className="table-action-btns">
                              <button
                                className="action-btn-approve"
                                onClick={() => handleApproveLeave(req.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="action-btn-reject"
                                onClick={() => handleRejectLeave(req.id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`status-pill pill-${req.status === "APPROVED" ? "green" : "red"}`}>
                              {req.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: ADD NEW EMPLOYEE ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container add-emp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddModal(false)} aria-label="Close">✕</button>

            <div className="login-header">
              <p className="portal-badge admin-badge">STAFF ONBOARDING</p>
              <h2>Add New Employee</h2>
              <p>Create credentials &amp; profile in MongoDB Atlas database</p>
            </div>

            {modalError && (
              <div className="portal-banner banner-error" style={{ marginBottom: "16px" }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployeeSubmit} className="login-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amit Jadhav"
                    value={newEmployeeForm.fullName}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, fullName: e.target.value })}
                    className="custom-input"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Employee ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank (e.g. PM-EMP-0004)"
                    value={newEmployeeForm.employeeId}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, employeeId: e.target.value })}
                    className="custom-input font-mono"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Corporate Email</label>
                  <input
                    type="email"
                    placeholder="amit.jadhav@paymagic.in"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                    className="custom-input"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                    className="custom-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={newEmployeeForm.department}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                    className="custom-select"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Engineering">Engineering / Tech</option>
                    <option value="Finance">Finance &amp; Accounts</option>
                    <option value="HR">Human Resources</option>
                    <option value="Marketing">Marketing &amp; Growth</option>
                    <option value="Sales">Corporate Sales</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Operations Executive"
                    value={newEmployeeForm.designation}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, designation: e.target.value })}
                    className="custom-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Initial Password</label>
                  <input
                    type="text"
                    value={newEmployeeForm.password}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, password: e.target.value })}
                    className="custom-input font-mono"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    value={newEmployeeForm.joiningDate}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, joiningDate: e.target.value })}
                    className="custom-input"
                  />
                </div>
              </div>

              <div className="modal-form-actions" style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Creating Account..." : "Create Employee Account"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
