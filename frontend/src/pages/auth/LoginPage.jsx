import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
  PhoneCall,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const LoginPage = () => {
  const { login, getPortalRouteForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@paymagic.in");
  const [password, setPassword] = useState("Admin@123");
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const demoAccounts = [
    {
      role: "SUPER_ADMIN",
      title: "Super Admin",
      name: "Onkar Holkar",
      email: "superadmin@paymagic.in",
      pass: "Admin@123",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      desc: "Full organization governance & system config"
    },
    {
      role: "ADMIN",
      title: "Admin",
      name: "Bhushan Gaikwad",
      email: "admin@paymagic.in",
      pass: "Admin@123",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      desc: "Loan file upload, case allocation & reporting"
    },
    {
      role: "SUPERVISOR",
      title: "Supervisor",
      name: "Aarav Mehta",
      email: "supervisor@paymagic.in",
      pass: "Emp@123",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      desc: "Team monitoring, approvals & disputes"
    },
    {
      role: "CALLER",
      title: "Telecaller",
      name: "Rahul Sharma",
      email: "caller@paymagic.in",
      pass: "Emp@123",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Click-to-call, customer notes & PTP tracking"
    },
    {
      role: "FIELD_AGENT",
      title: "Field Agent",
      name: "Vikram Singh",
      email: "field@paymagic.in",
      pass: "Emp@123",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      desc: "Physical visits, GPS check-in & cash recovery"
    }
  ];

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword(account.pass);
    setSelectedRole(account.role);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      const destination = location.state?.from?.pathname || getPortalRouteForRole(loggedUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please verify email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 mx-auto mb-4 shadow-xl shadow-indigo-600/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-xl text-indigo-400">
            PM
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Sign In to PayMagic
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Role-Based Access for Telecallers, Field Agents & Management
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Quick Demo Credentials Switcher */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserCheck size={14} className="text-indigo-400" />
              One-Click Role Switcher (Demo Mode)
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Click to populate</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoAccounts.map((account) => {
              const isSelected = selectedRole === account.role;
              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleSelectDemo(account)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-600/20 text-white shadow-md shadow-indigo-500/20"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{account.title}</span>
                    {isSelected && <CheckCircle2 size={12} className="text-indigo-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{account.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Employee Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="name@paymagic.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember">Remember this workstation</label>
              </div>
              <span className="text-indigo-400 hover:underline cursor-pointer">
                Calling Hours: 08:00 - 19:00 IST
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {selectedRole.replace("_", " ")} Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security & Compliance Banner */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              PCI-DSS & ISO 27001 Auth
            </span>
            <span>256-Bit SSL Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

