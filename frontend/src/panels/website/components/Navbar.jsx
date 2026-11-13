import React from "react";

export default function Navbar({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  loggedInUser,
  setAppMode,
  handleLogout,
  openLogin,
  setLoginView,
  setLoginError,
  setEmployeeIdInput,
  setPasswordInput,
  setShowLoginModal
}) {
  return (
    <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
      <a className="brand" href="#home">
        <div className="brand-icon">
          <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="logo-img" />
        </div>
        <span>Pay<strong>Magic</strong></span>
      </a>

      {/* Desktop & Mobile Navigation Links */}
      <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
        <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
        <a href="#leadership" onClick={() => setMobileMenuOpen(false)}>Leadership</a>
        <a href="#faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</a>

        {loggedInUser ? (
          <div className="user-badge-nav mobile-user-badge">
            <div className="user-dot" />
            <span className="user-name">{loggedInUser.fullName || loggedInUser.name}</span>
            <button className="portal-launch-btn" onClick={() => { setAppMode("portal"); setMobileMenuOpen(false); }}>
              Open Portal →
            </button>
            <button className="logout-nav-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Sign Out</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              className="login-btn mobile-login-btn"
              style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "#6366f1", color: "#a5b4fc" }}
              onClick={() => {
                setLoginView("employee-login");
                setLoginError("");
                setEmployeeIdInput("PM-CAL-0001");
                setPasswordInput("Emp@123");
                setShowLoginModal(true);
                setMobileMenuOpen(false);
              }}
            >
              <span>Employee Portal</span>
            </button>
            <button className="login-btn mobile-login-btn" onClick={() => { openLogin(); setMobileMenuOpen(false); }}>
              <span>Portal Login</span>
            </button>
          </div>
        )}
      </nav>

      <div className="nav-right-actions">
        {loggedInUser ? (
          <div className="user-badge-nav desktop-user-badge">
            <div className="user-dot" />
            <span className="user-name">{loggedInUser.fullName || loggedInUser.name}</span>
            <button className="portal-launch-btn" onClick={() => setAppMode("portal")}>
              Open Portal →
            </button>
            <button className="logout-nav-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="login-btn desktop-login-btn"
              style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.4)", color: "#c7d2fe" }}
              onClick={() => {
                setLoginView("employee-login");
                setLoginError("");
                setEmployeeIdInput("PM-CAL-0001");
                setPasswordInput("Emp@123");
                setShowLoginModal(true);
              }}
            >
              <span>Employee Portal</span>
            </button>
            <button className="login-btn desktop-login-btn" onClick={openLogin}>
              <span>Portal Login</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Mobile Menu Toggle Icon Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
