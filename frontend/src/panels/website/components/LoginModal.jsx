import React from "react";

export default function LoginModal({
  showLoginModal,
  closeLogin,
  loginView,
  setLoginView,
  setLoginError,
  setEmployeeIdInput,
  setPasswordInput,
  handleAdminSelect,
  selectedAdmin,
  handleAdminSubmit,
  loginError,
  passwordInput,
  employeeIdInput,
  handleEmployeeSubmit,
  loggedInUser,
  handleLogout
}) {
  if (!showLoginModal) return null;

  return (
    <div className="modal-overlay" onClick={closeLogin}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeLogin} aria-label="Close">✕</button>

        {/* Step 1: Role Selection */}
        {loginView === "select-role" && (
          <div className="login-step-content">
            <div className="modal-logo">
              <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="modal-logo-img" />
            </div>
            <div className="login-header text-center">
              <p className="portal-badge">PAYMAGIC PORTAL</p>
              <h2>Welcome Back</h2>
            </div>
            <div className="login-role-grid">
              <button className="role-card admin-card" onClick={() => { setLoginView("select-admin"); setLoginError(""); }}>
                <div className="role-icon-wrapper admin-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div className="role-info">
                  <h3>Admin Login</h3>
                </div>
                <span className="role-arrow">→</span>
              </button>

              <button className="role-card employee-card" onClick={() => { setLoginView("employee-login"); setLoginError(""); setEmployeeIdInput(""); setPasswordInput(""); }}>
                <div className="role-icon-wrapper employee-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="role-info">
                  <h3>Employee Login</h3>
                </div>
                <span className="role-arrow">→</span>
              </button>
            </div>
            <p className="modal-secure-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              256-bit SSL Encrypted · Secure Portal
            </p>
          </div>
        )}

        {/* Step 2: Select Admin */}
        {loginView === "select-admin" && (
          <div className="login-step-content">
            <button className="back-step-btn" onClick={() => setLoginView("select-role")}>← Back to Options</button>
            <div className="login-header">
              <p className="portal-badge admin-badge">ADMINISTRATION</p>
              <h2>Select Administrator</h2>
            </div>
            <div className="admin-selection-grid">
              <button className="admin-profile-btn" onClick={() => handleAdminSelect("Onkar Holkar")}>
                <div className="admin-avatar avatar-onkar">OH</div>
                <div className="admin-details">
                  <h3>Onkar Holkar</h3>
                  <span className="admin-tag">Founder &amp; Director</span>
                </div>
                <span className="role-arrow">→</span>
              </button>
              <button className="admin-profile-btn" onClick={() => handleAdminSelect("Bhushan Gaikwad")}>
                <div className="admin-avatar avatar-bhushan">BG</div>
                <div className="admin-details">
                  <h3>Bhushan Gaikwad</h3>
                  <span className="admin-tag">Founder &amp; Director</span>
                </div>
                <span className="role-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3A: Admin Login Form */}
        {loginView === "admin-login" && (
          <div className="login-step-content">
            <button className="back-step-btn" onClick={() => setLoginView("select-admin")}>← Change Admin</button>
            <div className="login-header login-header-center">
              <div className={`admin-avatar large-avatar ${selectedAdmin === "Onkar Holkar" ? "avatar-onkar" : "avatar-bhushan"}`}>
                {selectedAdmin === "Onkar Holkar" ? "OH" : "BG"}
              </div>
              <p className="portal-badge admin-badge" style={{marginTop:"12px"}}>ADMINISTRATOR</p>
              <h2>{selectedAdmin}</h2>
            </div>
            <form onSubmit={handleAdminSubmit} className="login-form">
              {loginError && <div className="error-message">{loginError}</div>}
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type="password" placeholder="Enter admin password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
                </div>
              </div>
              <button type="submit" className="submit-btn primary-btn">
                Sign In as {selectedAdmin}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Step 3B: Employee Login Form */}
        {loginView === "employee-login" && (
          <div className="login-step-content">
            <button className="back-step-btn" onClick={() => setLoginView("select-role")}>← Back to Options</button>
            <div className="login-header">
              <p className="portal-badge employee-badge">EMPLOYEE WORKSPACE PORTAL</p>
              <h2>Employee Sign In</h2>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="login-form">
              {loginError && <div className="error-message">{loginError}</div>}
              <div className="form-group">
                <label>Employee ID or Email</label>
                <div className="input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                  <input type="text" placeholder="Enter your Employee ID or Email" value={employeeIdInput} onChange={(e) => setEmployeeIdInput(e.target.value)} autoFocus />
                </div>
              </div>
              <div className="form-group">
                <label>Security Password</label>
                <div className="input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type="password" placeholder="Enter password (default: Emp@123)" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="submit-btn primary-btn">
                Sign In to Staff Workspace
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success Dashboard */}
        {loginView === "dashboard" && (
          <div className="login-step-content login-success-wrap">
            <div className="success-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="portal-badge" style={{marginBottom:"10px"}}>AUTHENTICATED</p>
            <h2>Welcome, {loggedInUser?.fullName || loggedInUser?.name}!</h2>
            <p className="dashboard-sub">You are signed in as <strong>{loggedInUser?.role}</strong>.</p>
            <div className="dashboard-actions">
              <button className="primary-btn" onClick={closeLogin}>
                Go to Dashboard
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button className="secondary-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
