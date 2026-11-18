import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export const LoginPage = () => {
  const { login, getPortalRouteForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSessionExpired = new URLSearchParams(location.search).get("session_expired") === "true";

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
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#050B20] text-[#F4F7FF] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#315CFF]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#315CFF] to-[#00C995] p-0.5 mx-auto mb-4 shadow-xl shadow-[#315CFF]/30">
          <div className="w-full h-full bg-[#050B20] rounded-[14px] flex items-center justify-center font-bold text-xl text-[#315CFF]">
            PM
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#F4F7FF]">
          Sign In to PayMagic
        </h2>
        <p className="mt-2 text-sm text-[#9AAAC2]">
          Authorized Workstation Access for Telecallers, Field Agents &amp; Operations
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Login Form Box */}
        <div className="bg-[#0B1733] border border-[#263957] rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#315CFF] to-transparent pointer-events-none" />

          {isSessionExpired && !error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-start gap-3 text-[#FFB800] text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#FFB800]" />
              <div>
                <p className="font-semibold">Session Expired</p>
                <p className="text-xs text-[#FFB800]/90 mt-0.5">Your security token expired. Please sign in again to continue.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FF527A]/10 border border-[#FF527A]/30 flex items-start gap-3 text-[#FF527A] text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FF] uppercase tracking-wider mb-2">
                Employee Email or Workstation ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AAAC2]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#08132D] border border-[#263957] rounded-xl text-[#F4F7FF] placeholder-[#9AAAC2]/60 text-sm focus:outline-none focus:border-[#315CFF] transition-all shadow-inner"
                  placeholder="e.g. caller@paymagic.in or staff@paymagic.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F4F7FF] uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AAAC2]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#08132D] border border-[#263957] rounded-xl text-[#F4F7FF] placeholder-[#9AAAC2]/60 text-sm focus:outline-none focus:border-[#315CFF] transition-all shadow-inner"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#9AAAC2] pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[#263957] bg-[#08132D] text-[#315CFF] focus:ring-0 accent-[#315CFF]"
                />
                <label htmlFor="remember">Remember this workstation</label>
              </div>
              <span className="text-[#315CFF] hover:underline cursor-pointer">
                Calling Hours: 08:00 - 19:00 IST
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#315CFF] to-[#5945F5] hover:opacity-95 text-[#F4F7FF] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#315CFF]/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Employee Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security & Compliance Banner */}
          <div className="mt-8 pt-6 border-t border-[#263957] flex items-center justify-between text-[11px] text-[#9AAAC2]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#00C995]" />
              RBI Compliant &bull; ISO 27001 Auth
            </span>
            <span>256-Bit SSL Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

