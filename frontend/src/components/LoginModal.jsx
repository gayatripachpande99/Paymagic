import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Shield, AlertCircle, CheckCircle2, KeyRound, Sparkles } from "lucide-react";
import api from "../services/api";

export default function LoginModal({
  showLoginModal = true,
  closeLogin,
  onClose,
  onLoginSuccess
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [view, setView] = useState("login"); // "login" | "forgot"
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Fallback close handler that calls whichever prop was supplied
  const handleClose = () => {
    if (typeof closeLogin === "function") closeLogin();
    if (typeof onClose === "function") onClose();
  };

  if (showLoginModal === false) return null;

  const handleLoginSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg("Please enter your Email / Employee ID and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post("/auth/login", {
        email: identifier.trim(),
        password: password.trim()
      });

      if (res && (res.token || res.tokens?.accessToken) && res.user) {
        const token = res.token || res.tokens.accessToken;
        localStorage.setItem("paymagic_token", token);
        localStorage.setItem("paymagic_user", JSON.stringify(res.user));
        if (typeof onLoginSuccess === "function") {
          onLoginSuccess(res.user);
        }
        handleClose();
      } else {
        setErrorMsg(res?.message || "Invalid authentication response.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg(err.message || "Invalid Email/Employee ID or Password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg("Please enter your registered Email or Employee ID.");
      return;
    }

    try {
      setForgotLoading(true);
      setErrorMsg("");
      setForgotMsg("");

      const res = await api.post("/auth/forgot-password", {
        email: forgotEmail.trim()
      });

      setForgotMsg(res?.message || "Password recovery initiated. Please check with your supervisor.");
    } catch (err) {
      setErrorMsg(err.message || "Unable to process password recovery request.");
    } finally {
      setForgotLoading(false);
    }
  };

  const fillCredentials = (id, pwd) => {
    setIdentifier(id);
    setPassword(pwd);
    setErrorMsg("");
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close">✕</button>

        {view === "login" ? (
          <div className="login-step-content" style={{ padding: "8px 4px" }}>
            {/* Header */}
            <div className="modal-logo" style={{ textAlign: "center", marginBottom: "16px" }}>
              <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="modal-logo-img" style={{ maxHeight: "38px", margin: "0 auto" }} />
            </div>

            <div className="login-header text-center" style={{ marginBottom: "20px" }}>
              <span className="portal-badge" style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                fontWeight: 700,
                border: "1px solid rgba(99, 102, 241, 0.3)"
              }}>
                ENTERPRISE ACCESS
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", marginTop: "8px" }}>
                Sign In to PayMagic
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                Enter your credentials to access your authorized workspace
              </p>
            </div>

            {errorMsg && (
              <div className="portal-banner banner-error" style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: "12px",
                marginBottom: "16px"
              }}>
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Unified Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Email / Employee ID */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                  Email or Employee ID
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. name@paymagic.in or PM-ADM-0001"
                    required
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 36px",
                      borderRadius: "10px",
                      background: "#08132D",
                      border: "1px solid #263957",
                      color: "#f8fafc",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  <Mail className="w-4 h-4 text-slate-400" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setErrorMsg("");
                      setForgotMsg("");
                      setForgotEmail(identifier);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#818cf8",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 36px",
                      borderRadius: "10px",
                      background: "#08132D",
                      border: "1px solid #263957",
                      color: "#f8fafc",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  <Lock className="w-4 h-4 text-slate-400" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #315CFF 0%, #5945F5 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "4px",
                  boxShadow: "0 4px 16px rgba(49, 92, 255, 0.35)",
                  transition: "opacity 0.2s"
                }}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px", fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                <Sparkles size={13} className="text-indigo-400" />
                <span>Quick Demo Accounts:</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => fillCredentials("PM-ADM-0001", "Admin@123")}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "#c7d2fe",
                    cursor: "pointer"
                  }}
                >
                  Admin (Onkar)
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("PM-ADM-0002", "Admin@123")}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "#c7d2fe",
                    cursor: "pointer"
                  }}
                >
                  Admin (Bhushan)
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("PM-SUP-0001", "Sup@123")}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#a7f3d0",
                    cursor: "pointer"
                  }}
                >
                  Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("PM-CAL-0001", "Emp@123")}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "#bfdbfe",
                    cursor: "pointer"
                  }}
                >
                  Telecaller
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("PM-FLD-0001", "Fld@123")}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fde68a",
                    cursor: "pointer"
                  }}
                >
                  Field Agent
                </button>
              </div>
            </div>

            <p style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#64748b",
              marginTop: "16px",
              textAlign: "center"
            }}>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit SSL Encrypted • Single Source of Truth</span>
            </p>
          </div>
        ) : (
          /* Forgot Password View */
          <div className="login-step-content" style={{ padding: "8px 4px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#818cf8"
              }}>
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                Reset Password
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                Enter your registered Email or Employee ID to dispatch a credential reset request to your agency supervisor.
              </p>
            </div>

            {errorMsg && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: "12px",
                marginBottom: "16px"
              }}>
                {errorMsg}
              </div>
            )}

            {forgotMsg ? (
              <div style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#6ee7b7",
                fontSize: "12px",
                lineHeight: 1.5,
                textAlign: "center",
                marginBottom: "16px"
              }}>
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <p>{forgotMsg}</p>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setErrorMsg("");
                    setForgotMsg("");
                  }}
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                    Registered Email or Employee ID
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter Email or Employee ID"
                    required
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      background: "#08132D",
                      border: "1px solid #263957",
                      color: "#f8fafc",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    background: "#315CFF",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: forgotLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {forgotLoading ? "Submitting..." : "Send Reset Request"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setErrorMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  ← Back to Sign In
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
