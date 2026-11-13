import React from "react";

export default function HomePage({ openLogin, trustList = [] }) {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            ISO 27001 Certified &amp; RBI Compliant
          </div>

          <h1>
            Engineering the<br />
            <span className="gradient-text">Future of Finance</span>
          </h1>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={openLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Access Secure Portal</span>
            </button>
            <button className="secondary-btn" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
              <span>Explore Platform</span>
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="card-float card-float-main">
            <div className="card-chip" />
            <div className="card-brand">PayMagic Corporate</div>
            <div className="card-number">•••• •••• •••• 4291</div>
            <div className="card-footer">
              <span>VALID THRU 09/28</span>
              <span>PAYMAGIC PVT LTD</span>
            </div>
          </div>
          <div className="card-float card-float-secondary">
            <div className="mini-stat-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <span style={{color:"#10b981", fontWeight:700, fontSize:"13px"}}>+24.8% YoY</span>
            </div>
            <div style={{fontSize:"11px", color:"#94a3b8", marginTop:"4px"}}>Monthly Settlement</div>
            <div style={{fontSize:"20px", fontWeight:800, color:"white", marginTop:"6px"}}>₹1,24,82,390</div>
          </div>
          <div className="card-float card-float-tertiary">
            <div style={{fontSize:"11px", color:"#94a3b8"}}>Instant T+0 Payout</div>
            <div style={{fontSize:"18px", fontWeight:800, color:"#34d399", marginTop:"4px"}}>✓ Verified</div>
            <div className="mini-bar-wrap">
              <div className="mini-bar" style={{width:"92%", background:"linear-gradient(90deg, #10b981, #3b82f6)"}} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES BAR ── */}
      <div className="trust-bar">
        <span className="trust-bar-label">
          <span style={{ marginRight: "6px" }}>🛡️</span>
          REGULATORY COMPLIANCE &amp; CERTIFICATIONS
        </span>
        <div className="trust-badges">
          {trustList.map((t) => (
            <div className="trust-badge" key={t.label}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
