import React from "react";

export default function ContactPage({ openLogin }) {
  return (
    <section className="cta" id="contact">
      <div className="cta-glow" />
      <div className="cta-inner">
        <h2>Ready to Transform Your <span className="gradient-text">Financial Operations?</span></h2>
        <div className="cta-actions">
          <button className="primary-btn" onClick={openLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Access Secure Portal</span>
          </button>
          <button className="secondary-btn" onClick={openLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Sign In to Dashboard</span>
          </button>
        </div>
      </div>
    </section>
  );
}
