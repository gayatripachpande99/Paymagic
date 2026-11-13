import React from "react";

export default function AboutPage() {
  return (
    <section className="section" id="about">
      <div className="section-inner">
        <div className="about-text">
          <h2>Trusted Partner for <span className="gradient-text">Enterprise Growth</span></h2>
          <div className="about-pillars">
            <div className="pillar">
              <div className="pillar-icon blue-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <strong>Enterprise Reliability &bull; 99.99% Uptime</strong>
            </div>
            <div className="pillar">
              <div className="pillar-icon green-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <strong>Transparent Financial Operations &bull; Zero Hidden Fees</strong>
            </div>
            <div className="pillar">
              <div className="pillar-icon purple-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <strong>Continuous High-Velocity Innovation</strong>
            </div>
          </div>
        </div>
        <div className="about-graphic">
          <div className="metric-card">
            <div className="metric-icon blue-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 4-5"/>
              </svg>
            </div>
            <div>
              <div className="metric-value">₹2.4B+</div>
              <div className="metric-label">Processed Volume</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon green-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <div className="metric-value">50,000+</div>
              <div className="metric-label">Satisfied Users</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon purple-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div className="metric-value">100%</div>
              <div className="metric-label">Data Protection</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon gold-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <div className="metric-value">4.9 ★</div>
              <div className="metric-label">Client Trust Score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
