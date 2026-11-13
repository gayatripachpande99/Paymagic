import React from "react";

export default function LeadershipPage({ openLogin, handleAdminSelect }) {
  return (
    <section className="leadership-section" id="leadership">
      <div className="section-inner">
        <div className="services-header">
          <h2>Guided by Visionary <span className="gradient-text">Founders &amp; Directors</span></h2>
        </div>

        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-avatar avatar-onkar">OH</div>
            <div className="founder-badge">FOUNDER &amp; DIRECTOR</div>
            <h3>Onkar Holkar</h3>
            <p className="founder-role">Strategic Planning &amp; Tech Operations</p>
            <button
              className="secondary-btn admin-login-shortcut"
              onClick={() => {
                if (openLogin && handleAdminSelect) {
                  openLogin();
                  handleAdminSelect("Onkar Holkar");
                }
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Admin Sign In</span>
            </button>
          </div>

          <div className="founder-card">
            <div className="founder-avatar avatar-bhushan">BG</div>
            <div className="founder-badge">FOUNDER &amp; DIRECTOR</div>
            <h3>Bhushan Gaikwad</h3>
            <p className="founder-role">Corporate Growth &amp; Client Relations</p>
            <button
              className="secondary-btn admin-login-shortcut"
              onClick={() => {
                if (openLogin && handleAdminSelect) {
                  openLogin();
                  handleAdminSelect("Bhushan Gaikwad");
                }
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Admin Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
