import React from "react";
import { LogIn, ArrowRight, ShieldCheck, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  loggedInUser,
  setAppMode,
  handleLogout,
  openLogin,
  theme,
  toggleTheme
}) {
  return (
    <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
      <a
        className="brand"
        href="#home"
        onClick={() => setAppMode("website")}
        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
      >
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
        <a href="#compliance" onClick={() => setMobileMenuOpen(false)}>Compliance</a>
        <a href="#faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</a>
        <a href="#enquiry-form" onClick={() => setMobileMenuOpen(false)}>Enquiry</a>

        <div className="mobile-theme-row" style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>Theme</span>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {loggedInUser ? (
          <div className="user-badge-nav mobile-user-badge">
            <div className="user-dot" />
            <span className="user-name">{loggedInUser.fullName || loggedInUser.name}</span>
            <button
              className="portal-launch-btn"
              onClick={() => {
                setAppMode("portal");
                setMobileMenuOpen(false);
              }}
            >
              Open Portal →
            </button>
            <button
              className="logout-nav-btn"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            className="login-btn mobile-login-btn"
            onClick={() => {
              openLogin();
              setMobileMenuOpen(false);
            }}
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}
      </nav>

      <div className="nav-right-actions">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} className="desktop-theme-toggle" />

        {loggedInUser ? (
          <div className="user-badge-nav desktop-user-badge">
            <div className="user-dot" />
            <span className="user-name">{loggedInUser.fullName || loggedInUser.name || "Authenticated"}</span>
            <span
              className="role-tag"
              style={{
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.2)",
                color: "#a5b4fc",
                fontWeight: 600,
                border: "1px solid rgba(99, 102, 241, 0.3)"
              }}
            >
              {loggedInUser.role}
            </span>
            <button className="portal-launch-btn" onClick={() => setAppMode("portal")}>
              <span>Open Portal</span>
              <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
            <button className="logout-nav-btn" onClick={handleLogout} title="Sign Out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button className="login-btn desktop-login-btn" onClick={openLogin}>
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}

        {/* Mobile Hamburger Toggle */}
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
