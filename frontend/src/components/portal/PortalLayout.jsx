import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  FileSpreadsheet,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Scale,
  Users,
  Clock,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Menu,
  X
} from "lucide-react";

export const PortalLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shiftStatus, setShiftStatus] = useState("ON_SHIFT");

  const role = user?.role || "CALLER";

  // Build role-specific sidebar navigation
  const getNavLinks = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { name: "Super Admin Command", path: "/portal/super-admin", icon: <LayoutDashboard size={20} /> },
          { name: "Case & Loan Portfolios", path: "/portal/admin", icon: <FileSpreadsheet size={20} /> },
          { name: "System Audit & Vault", path: "/portal/admin", icon: <ShieldCheck size={20} /> },
          { name: "Executive Analytics", path: "/portal/admin", icon: <BarChart3 size={20} /> }
        ];
      case "ADMIN":
        return [
          { name: "Operations Command", path: "/portal/admin", icon: <LayoutDashboard size={20} /> },
          { name: "Case Allocation & Ingestion", path: "/portal/admin", icon: <FileSpreadsheet size={20} /> },
          { name: "Voice Telephony Monitor", path: "/portal/admin", icon: <PhoneCall size={20} /> },
          { name: "Ground Field Recovery", path: "/portal/admin", icon: <MapPin size={20} /> },
          { name: "Complaints & Disputes", path: "/portal/admin", icon: <Scale size={20} /> },
          { name: "Attendance & Shifts", path: "/portal/admin", icon: <Clock size={20} /> },
          { name: "Management Reports", path: "/portal/admin", icon: <BarChart3 size={20} /> }
        ];
      case "SUPERVISOR":
        return [
          { name: "Team Supervisor Hub", path: "/portal/supervisor", icon: <LayoutDashboard size={20} /> },
          { name: "Case Re-allocations", path: "/portal/supervisor", icon: <FileSpreadsheet size={20} /> },
          { name: "Call Quality & Audits", path: "/portal/supervisor", icon: <PhoneCall size={20} /> },
          { name: "Team Leaderboard", path: "/portal/supervisor", icon: <BarChart3 size={20} /> },
          { name: "Escalated Grievances", path: "/portal/supervisor", icon: <Scale size={20} /> },
          { name: "Leave Approvals", path: "/portal/supervisor", icon: <Clock size={20} /> }
        ];
      case "CALLER":
        return [
          { name: "Telecaller Workstation", path: "/portal/caller", icon: <LayoutDashboard size={20} /> },
          { name: "My Assigned Worklist", path: "/portal/caller", icon: <FileSpreadsheet size={20} /> },
          { name: "Click-to-Call Dialer", path: "/portal/caller", icon: <PhoneCall size={20} /> },
          { name: "Follow-ups & PTPs", path: "/portal/caller", icon: <Clock size={20} /> },
          { name: "Productivity Metrics", path: "/portal/caller", icon: <BarChart3 size={20} /> }
        ];
      case "FIELD_AGENT":
        return [
          { name: "Field Agent Dashboard", path: "/portal/field-agent", icon: <LayoutDashboard size={20} /> },
          { name: "Assigned Premises Visits", path: "/portal/field-agent", icon: <MapPin size={20} /> },
          { name: "Cash / UPI Collections", path: "/portal/field-agent", icon: <FileText size={20} /> },
          { name: "Daily Route & GPS Log", path: "/portal/field-agent", icon: <Clock size={20} /> }
        ];
      default:
        return [
          { name: "Dashboard", path: "/portal/caller", icon: <LayoutDashboard size={20} /> }
        ];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "SUPERVISOR":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CALLER":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "FIELD_AGENT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const sampleNotifications = [
    { id: 1, title: "Calling Hours Active", text: "Fair Practice window active: 08:00 to 19:00 IST.", time: "Just now" },
    { id: 2, title: "PTP Follow-up Due", text: "Customer Rohit Jadhav promised ₹15,000 payment today.", time: "30m ago" },
    { id: 3, title: "Supervisor Quality Review", text: "Monthly connection rate target at 85%.", time: "2h ago" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-bold text-xs text-indigo-400">
                PM
              </div>
            </div>
            <span className="font-bold text-base tracking-tight text-white hidden sm:inline">
              PayMagic Ops
            </span>
          </Link>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Active Role Badge */}
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(role)}`}>
            {role.replace("_", " ")}
          </div>

          {/* Shift Status Pill */}
          <button
            onClick={() => setShiftStatus(shiftStatus === "ON_SHIFT" ? "ON_BREAK" : "ON_SHIFT")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              shiftStatus === "ON_SHIFT"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${shiftStatus === "ON_SHIFT" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
            <span>{shiftStatus === "ON_SHIFT" ? "Shift Active" : "On Break"}</span>
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {/* Calling Hours Notice */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={13} className="text-indigo-400" />
            <span>Permissible Window: 08:00 - 19:00 IST</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 relative"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Reminders</span>
                  <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer">Mark read</span>
                </div>
                <div className="py-2 divide-y divide-slate-800/60">
                  {sampleNotifications.map((notif) => (
                    <div key={notif.id} className="py-2.5 text-xs space-y-1">
                      <div className="font-semibold text-slate-200">{notif.title}</div>
                      <div className="text-slate-400 text-[11px]">{notif.text}</div>
                      <div className="text-[10px] text-slate-500">{notif.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user?.fullName || "Employee"}</div>
              <div className="text-[10px] text-slate-400">{user?.employeeId || "PM-0001"}</div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-slate-800"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside
          className={`hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950 transition-all duration-300 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Collapse Toggle */}
          <div className="p-3 flex justify-end border-b border-slate-800/60">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1.5 flex-1">
            {navLinks.map((item, idx) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.name : ""}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Employee Work Summary footer */}
          {!collapsed && user && (
            <div className="p-4 border-t border-slate-800/80 m-3 bg-slate-900/60 rounded-2xl text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Active Session
              </div>
              <div className="text-slate-300 font-medium">{user.department}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Encrypted Telephony Link</span>
              </div>
            </div>
          )}
        </aside>

        {/* Workspace Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>}
              {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;

