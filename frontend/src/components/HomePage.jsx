import React, { useState } from "react";
import {
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  Scale,
  Users,
  Sparkles,
  AlertCircle,
  Zap
} from "lucide-react";

export default function HomePage({ openLogin }) {
  // ── FAQ Accordion State ──
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ── Interactive Enterprise Consultation Form State ──
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    portfolioSize: "₹50 Cr - ₹200 Cr",
    servicesRequested: "Full Suite (Telephony + Field Recovery)",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
    }, 800);
  };

  // ── Trust Items ──
  const TRUST_ITEMS = [
    { icon: "🏛️", label: "RBI Compliant Framework" },
    { icon: "🔒", label: "ISO 27001 Certified Security" },
    { icon: "⚡", label: "PCI-DSS Level 1 Security" },
    { icon: "🛡️", label: "GDPR & Data Privacy Compliant" },
    { icon: "📋", label: "CERT-In Security Audited" }
  ];

  // ── 6 Core Solutions List ──
  const SERVICES_LIST = [
    {
      icon: <PhoneCall className="w-6 h-6 text-indigo-400" />,
      title: "Telephony Calling & Auto-Recording",
      desc: "One-click click-to-call bridge with mandatory customer disclosure announcements, automatic dual-channel audio recording, and automated outcome tagging.",
      tag: "Voice Recovery"
    },
    {
      icon: <MapPin className="w-6 h-6 text-emerald-400" />,
      title: "Ground Field Recovery Operations",
      desc: "Mobile-first enforcement agent app with GPS visit verification, customer verification receipts, digital UPI/cash collection, and immediate outcome sync.",
      tag: "Ground Recovery"
    },
    {
      icon: <Database className="w-6 h-6 text-blue-400" />,
      title: "Algorithmic Case Allocation Engine",
      desc: "Instant bulk Excel/CSV ingestion with automated case distribution based on outstanding dues, geography, priority risk, and telecaller workload.",
      tag: "Operations"
    },
    {
      icon: <Lock className="w-6 h-6 text-amber-400" />,
      title: "Encrypted Voice Evidence Vault",
      desc: "Private AWS S3 storage with KMS SSE encryption, short-lived signed URLs, strict audit access logging, and legal-hold preservation.",
      tag: "Compliance"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      title: "Real-Time Recovery Dashboards",
      desc: "Calculates call connection rates, target achievement %, and recovery progress with live supervisor monitors and exportable reports.",
      tag: "Analytics"
    },
    {
      icon: <Scale className="w-6 h-6 text-rose-400" />,
      title: "Grievance & Dispute Redressal",
      desc: "Comprehensive borrower dispute handling: listen to past call recordings, review agent logs, assign to supervisors, and track resolutions to RBI standards.",
      tag: "Fair Practice"
    }
  ];

  // ── FAQs List ──
  const FAQS_LIST = [
    {
      q: "How does PayMagic ensure bank-grade transaction and calling security?",
      a: "PayMagic employs 256-bit SSL encryption, PCI-DSS Level 1 certified architecture, and AWS KMS SSE encryption. Every voice call is auto-recorded with statutory notice, and financial ledger postings operate under ACID guarantees."
    },
    {
      q: "What settlement speeds and recovery rates does PayMagic deliver?",
      a: "We support instant T+0 reconciliation of digital UPI and bank collections directly to linked corporate client accounts, delivering a verified 28.4% average recovery realization compared to the 18% industry benchmark."
    },
    {
      q: "How are Administrator and Employee permissions managed?",
      a: "PayMagic provides strict Role-Based Access Control (RBAC). Dedicated admin profiles are available for leadership (Onkar Holkar & Bhushan Gaikwad) and supervisors, while staff members access restricted employee caller workspaces."
    },
    {
      q: "How quickly can our technical team integrate PayMagic APIs and upload files?",
      a: "Our Developer API Suite and Excel/CSV ingestion pipeline allow instant onboarding. You can upload existing loan portfolios with tens of thousands of records and distribute them to caller queues within minutes."
    }
  ];

  return (
    <div className="home-page-container">
      {/* ───────────────────────────────────────────────────────────
          1. HERO SECTION
      ─────────────────────────────────────────────────────────── */}
      <section className="hero" id="home">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            ISO 27001 Certified &amp; RBI Compliant Framework
          </div>

          <h1>
            Engineering the<br />
            <span className="gradient-text">Future of Finance &amp; Debt Recovery</span>
          </h1>

          <p
            className="hero-description"
            style={{
              fontSize: "15px",
              color: "#94a3b8",
              maxWidth: "560px",
              lineHeight: 1.6,
              marginBottom: "28px"
            }}
          >
            Empower your recovery operations with click-to-call recording, algorithmic case allocation,
            ground field visit tracking, and immutable audit trails that meet RBI Fair Practices standards.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={openLogin}>
              <Lock className="w-4 h-4" />
              <span>Access Secure Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              className="secondary-btn"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Zap className="w-4 h-4" />
              <span>Explore Platform</span>
            </button>
          </div>
        </div>

        {/* Visual Floating Cards Showcase */}
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
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: "13px" }}>+24.8% YoY</span>
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Monthly Settlement</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "white", marginTop: "6px" }}>₹1,24,82,390</div>
          </div>

          <div className="card-float card-float-tertiary">
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Instant T+0 Payout</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>✓ Verified</div>
            <div className="mini-bar-wrap">
              <div
                className="mini-bar"
                style={{ width: "92%", background: "linear-gradient(90deg, #10b981, #3b82f6)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          2. REGULATORY COMPLIANCE TRUST BAR
      ─────────────────────────────────────────────────────────── */}
      <div className="trust-bar">
        <span className="trust-bar-label">
          <span style={{ marginRight: "6px" }}>🛡️</span>
          REGULATORY COMPLIANCE &amp; CERTIFICATIONS
        </span>
        <div className="trust-badges">
          {TRUST_ITEMS.map((t) => (
            <div className="trust-badge" key={t.label}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          3. ABOUT SECTION (PILLARS & METRICS)
      ─────────────────────────────────────────────────────────── */}
      <section className="section" id="about">
        <div className="section-inner">
          <div className="about-text">
            <span className="section-label">ABOUT PAYMAGIC</span>
            <h2>
              Trusted Partner for <span className="gradient-text">Enterprise Growth</span>
            </h2>
            <p className="about-desc">
              PayMagic delivers a unified loan-recovery calling and field operations platform. We bridge
              lending institutions with supervisory controls, compliant caller dialers, and real-time ledger accounting.
            </p>

            <div className="about-pillars">
              <div className="pillar">
                <div className="pillar-icon blue-icon">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <strong>Enterprise Reliability &bull; 99.99% Uptime</strong>
              </div>
              <div className="pillar">
                <div className="pillar-icon green-icon">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <strong>Transparent Financial Operations &bull; Zero Hidden Fees</strong>
              </div>
              <div className="pillar">
                <div className="pillar-icon purple-icon">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <strong>Continuous High-Velocity Innovation</strong>
              </div>
            </div>
          </div>

          <div className="about-graphic">
            <div className="metric-card">
              <div className="metric-icon blue-icon">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="metric-value">₹2.4B+</div>
                <div className="metric-label">Processed Volume</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon green-icon">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="metric-value">50,000+</div>
                <div className="metric-label">Satisfied Accounts</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon purple-icon">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="metric-value">100%</div>
                <div className="metric-label">Data Protection</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon gold-icon">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="metric-value">4.9 ★</div>
                <div className="metric-label">Client Trust Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          4. SERVICES & SOLUTIONS SECTION
      ─────────────────────────────────────────────────────────── */}
      <section className="services" id="services">
        <div className="services-inner">
          <div className="services-header">
            <h2>
              Everything You Need to <span className="gradient-text">Manage Money &amp; Recovery</span>
            </h2>
            <p className="services-sub">
              From outbound telephony dialers to ground recovery agents, PayMagic unifies the entire debt collection lifecycle.
            </p>
          </div>

          <div className="service-grid">
            {SERVICES_LIST.map((s) => (
              <div className="service-card" key={s.title}>
                <div>
                  <div className="service-tag">{s.tag}</div>
                  <div className="service-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p style={{ fontSize: "13.5px", color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
                <div className="card-learn" onClick={openLogin} style={{ cursor: "pointer" }}>
                  <span>Explore Capabilities &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          5. EXECUTIVE LEADERSHIP & FOUNDERS SECTION
      ─────────────────────────────────────────────────────────── */}
      <section className="leadership-section" id="leadership">
        <div className="leadership-inner">
          <div className="services-header">
            <h2>
              Guided by Visionary <span className="gradient-text">Founders &amp; Directors</span>
            </h2>
            <p className="services-sub">
              Leadership steering PayMagic to redefine debt resolution and enterprise finance across India.
            </p>
          </div>

          <div className="founders-grid">
            <div className="founder-card">
              <div className="founder-avatar avatar-onkar">OH</div>
              <div className="founder-badge">FOUNDER &amp; DIRECTOR</div>
              <h3>Onkar Holkar</h3>
              <p className="founder-role">Strategic Planning &amp; Tech Operations</p>
              <p className="founder-bio">
                Leading the architectural vision, cloud infrastructure, and regulatory telemetry powering PayMagic.
              </p>
              <button className="secondary-btn admin-login-shortcut" onClick={openLogin}>
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Sign In</span>
              </button>
            </div>

            <div className="founder-card">
              <div className="founder-avatar avatar-bhushan">BG</div>
              <div className="founder-badge">FOUNDER &amp; DIRECTOR</div>
              <h3>Bhushan Gaikwad</h3>
              <p className="founder-role">Corporate Growth &amp; Client Relations</p>
              <p className="founder-bio">
                Directing strategic enterprise partnerships with top tier banks, NBFC allocators, and legal compliance.
              </p>
              <button className="secondary-btn admin-login-shortcut" onClick={openLogin}>
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          6. COMPLIANCE & ZERO-TOLERANCE FAIR PRACTICES CHARTER
      ─────────────────────────────────────────────────────────── */}
      <section className="section" id="compliance">
        <div style={{ maxWidth: "1200px", margin: "auto", padding: "0 24px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 62, 0.9), rgba(5, 11, 32, 0.95))",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "28px",
              padding: "48px 36px",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ maxWidth: "780px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "12px",
                  fontWeight: 700,
                  marginBottom: "20px"
                }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Tolerance Fair Practices Code</span>
              </div>

              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "white", lineHeight: 1.25 }}>
                Protecting Your Lending Brand With Uncompromising Compliance
              </h2>

              <p style={{ marginTop: "16px", color: "#cbd5e1", fontSize: "15px", lineHeight: 1.7 }}>
                PayMagic strictly enforces RBI debt collection regulations through systemic code gates,
                preventing illegal outreach and protecting borrowers against unfair practices.
              </p>

              <div
                style={{
                  marginTop: "32px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "18px"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span style={{ fontSize: "13.5px", color: "#cbd5e1" }}>
                    <strong style={{ color: "white" }}>Strict Calling Hours:</strong> System prohibits call initiation outside 08:00 to 19:00 IST.
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span style={{ fontSize: "13.5px", color: "#cbd5e1" }}>
                    <strong style={{ color: "white" }}>Statutory Audio Notice:</strong> Telephony bridge announces mandatory recording disclosure to borrower.
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span style={{ fontSize: "13.5px", color: "#cbd5e1" }}>
                    <strong style={{ color: "white" }}>Immutable Status Audit:</strong> All case status shifts committed in ACID DB transactions with timestamps.
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span style={{ fontSize: "13.5px", color: "#cbd5e1" }}>
                    <strong style={{ color: "white" }}>Dispute Redressal:</strong> Dedicated workflow linking call recordings directly to complaints.
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "36px" }}>
                <button
                  className="primary-btn"
                  onClick={openLogin}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Lock className="w-4 h-4" />
                  <span>Access Compliance Vault &amp; Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          7. FREQUENTLY ASKED QUESTIONS (FAQS)
      ─────────────────────────────────────────────────────────── */}
      <section className="faqs-section" id="faqs">
        <div className="faqs-inner">
          <div className="services-header">
            <h2>
              Got Questions? <span className="gradient-text">We Have Answers.</span>
            </h2>
            <p className="services-sub">
              Everything you need to know about security, speeds, permissions, and technical integration.
            </p>
          </div>

          <div className="faq-accordion">
            {FAQS_LIST.map((faq, index) => (
              <div
                className={`faq-item ${openFaq === index ? "faq-open" : ""}`}
                key={faq.q}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <h3>{faq.q}</h3>
                  <span className="faq-toggle">{openFaq === index ? "−" : "+"}</span>
                </div>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          8. INTERACTIVE ENTERPRISE CONSULTATION / ENQUIRY FORM
      ─────────────────────────────────────────────────────────── */}
      <section
        id="enquiry-form"
        style={{
          padding: "90px 24px",
          background: "linear-gradient(180deg, rgba(2, 9, 44, 0.8), #02092c)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div style={{ maxWidth: "860px", margin: "auto" }}>
          <div className="services-header" style={{ marginBottom: "36px" }}>
            <span className="section-label">PARTNER WITH US</span>
            <h2>
              Schedule an <span className="gradient-text">Enterprise Consultation</span>
            </h2>
            <p className="services-sub">
              Discover how PayMagic improves capital recovery by 24% while drastically lowering compliance risks.
            </p>
          </div>

          <div
            style={{
              background: "#040c2e",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px 32px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)"
            }}
          >
            {formSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px"
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "12px" }}>
                  Consultation Request Received!
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.6 }}>
                  Thank you for contacting PayMagic. Our Enterprise Recovery Specialist will review your institution's profile
                  and contact you within 4 business hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="secondary-btn"
                  style={{ padding: "10px 24px" }}
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {formError && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#f87171",
                      fontSize: "14px"
                    }}
                  >
                    <AlertCircle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.fullName}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "14px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="v.malhotra@lender.com"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Direct Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="+91 98200 11223"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "14px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Lending Institution / NBFC *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.organization}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, organization: e.target.value })}
                      placeholder="e.g. Zenith Retail Lending Ltd"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Active Defaulted Portfolio Size
                    </label>
                    <select
                      value={enquiryForm.portfolioSize}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, portfolioSize: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "#081444",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "14px"
                      }}
                    >
                      <option>Under ₹10 Cr</option>
                      <option>₹10 Cr - ₹50 Cr</option>
                      <option>₹50 Cr - ₹200 Cr</option>
                      <option>₹200 Cr - ₹1,000 Cr</option>
                      <option>Over ₹1,000 Cr</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Services of Interest
                    </label>
                    <select
                      value={enquiryForm.servicesRequested}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, servicesRequested: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "#081444",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "14px"
                      }}
                    >
                      <option>Full Suite (Telephony + Field Recovery)</option>
                      <option>Voice Telephony &amp; Call Recording Vault</option>
                      <option>Ground Field Recovery Agent Platform</option>
                      <option>Algorithmic Case Allocation Engine</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                    Operational Requirements / Portfolio Context *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Describe your current recovery challenges, overdue buckets (30-90 DPD, 90+ DPD), and agent headcount..."
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "14px",
                      resize: "vertical"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="primary-btn"
                  style={{
                    padding: "16px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "15px",
                    fontWeight: 700
                  }}
                >
                  {formLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Portfolio Consultation Request</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          9. CALL-TO-ACTION (CTA) BANNER
      ─────────────────────────────────────────────────────────── */}
      <section className="cta" id="contact">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2>
            Ready to Transform Your <span className="gradient-text">Financial Operations?</span>
          </h2>
          <p>
            Experience next-generation automated calling, ground recovery tracking, and statutory compliance in one platform.
          </p>
          <div className="cta-actions">
            <button className="primary-btn" onClick={openLogin}>
              <Lock className="w-4 h-4" />
              <span>Access Secure Portal</span>
            </button>
            <button className="secondary-btn" onClick={openLogin}>
              <Zap className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
