import { useState, useEffect } from "react";
import api from "./services/api";
import EmployeeDashboard from "./components/EmployeeDashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const SERVICES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="3"/>
        <path d="M2 10h20"/>
        <path d="M6 15h4"/>
        <path d="M14 15h4"/>
      </svg>
    ),
    title: "Smart Payments Gateway",
    desc: "Instant, ultra-secure transaction processing with real-time settlement across UPI, cards, and net banking.",
    tag: "Core Infrastructure",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18"/>
        <path d="M7 16l4-6 4 4 4-5"/>
      </svg>
    ),
    title: "Real-time Financial Analytics",
    desc: "Deep predictive reporting, automated cash flow tracking, and intelligent transaction categorization.",
    tag: "Intelligence",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Enterprise Shield & Security",
    desc: "Multi-layered fraud detection, automated compliance auditing, and hardware security module protection.",
    tag: "Bank Security",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: "Instant T+0 Settlements",
    desc: "Direct-to-bank settlement engine ensuring zero delays in vendor payments and operational liquidity.",
    tag: "High Velocity",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Automated Payroll Suite",
    desc: "Seamless employee payouts, automated tax deductions, payslip generation, and attendance integration.",
    tag: "Corporate HR",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <path d="M14 14h3m0 0h4m-4 0v3m0 4v-4"/>
      </svg>
    ),
    title: "Developer API Suite",
    desc: "RESTful endpoints, webhooks, and SDKs for effortless integration with custom web apps and mobile solutions.",
    tag: "API First",
  },
];

const TRUST = [
  { icon: "🏛️", label: "RBI Compliant Framework" },
  { icon: "🔒", label: "ISO 27001 Certified" },
  { icon: "⚡", label: "PCI-DSS Level 1 Security" },
  { icon: "🛡️", label: "GDPR & Data Privacy Compliant" },
];

const FAQS = [
  {
    q: "How does PayMagic ensure bank-grade transaction security?",
    a: "PayMagic employs 256-bit SSL encryption, PCI-DSS Level 1 certified architecture, and Hardware Security Modules (HSM). Every transaction undergoes real-time AI fraud detection and automated compliance checking."
  },
  {
    q: "What settlement speeds does PayMagic offer for businesses?",
    a: "We support T+0 (Instant Real-Time Settlement) directly to your linked corporate bank account, ensuring your liquidity is never locked in multi-day clearing cycles."
  },
  {
    q: "How are Administrator and Employee permissions managed?",
    a: "PayMagic provides strict Role-Based Access Control (RBAC). Dedicated admin profile authentication is available for leadership (Onkar Holkar & Bhushan Gaikwad) while staff members access restricted employee workspaces."
  },
  {
    q: "How quickly can our technical team integrate PayMagic APIs?",
    a: "Our Developer API Suite comes with ready-to-use SDKs, comprehensive documentation, and sandbox test keys. Most startups complete full integration within a single day."
  }
];

export default function App() {
  const [appMode, setAppMode] = useState("website"); // "website" | "portal"
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginView, setLoginView] = useState("select-role");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openLogin = () => {
    setShowLoginModal(true);
    setLoginView("select-role");
    setSelectedAdmin(null);
    setLoginError("");
    setPasswordInput("");
    setEmployeeIdInput("");
  };

  const closeLogin = () => setShowLoginModal(false);

  const handleAdminSelect = (name) => {
    setSelectedAdmin(name);
    setLoginView("admin-login");
    setLoginError("");
    setPasswordInput("");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("paymagic_user");
    const savedToken = localStorage.getItem("paymagic_token");
    if (savedUser && savedToken) {
      try {
        setLoggedInUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("paymagic_user");
        localStorage.removeItem("paymagic_token");
      }
    }
  }, []);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError("Please enter your password.");
      return;
    }

    try {
      setLoginError("");

      const data = await api.post("/auth/admin-login", {
        name: selectedAdmin || "Onkar Holkar",
        password: passwordInput
      });

      localStorage.setItem("paymagic_token", data.token);
      localStorage.setItem("paymagic_user", JSON.stringify(data.user));

      setLoggedInUser(data.user);
      setShowLoginModal(false);
      setAppMode("portal");
    } catch (error) {
      setLoginError(error.message || "Invalid Administrator password.");
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!employeeIdInput.trim() || !passwordInput.trim()) {
      setLoginError("Please fill in all fields.");
      return;
    }

    try {
      setLoginError("");

      const data = await api.post("/auth/employee-login", {
        employeeId: employeeIdInput,
        password: passwordInput
      });

      localStorage.setItem("paymagic_token", data.token);
      localStorage.setItem("paymagic_user", JSON.stringify(data.user));

      setLoggedInUser(data.user);
      setShowLoginModal(false);
      setAppMode("portal");
    } catch (error) {
      setLoginError(error.message || "Unable to login.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("paymagic_token");
    localStorage.removeItem("paymagic_user");
    setLoggedInUser(null);
    setLoginView("select-role");
    setShowLoginModal(false);
    setAppMode("website");
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // If user is logged in and portal mode is active, render the rich dashboard
  if (appMode === "portal" && loggedInUser) {
    if (loggedInUser.role === "ADMIN" || loggedInUser.role === "HR") {
      return (
        <AdminDashboard
          user={loggedInUser}
          onLogout={handleLogout}
          onBackToHome={() => setAppMode("website")}
        />
      );
    }
    return (
      <EmployeeDashboard
        user={loggedInUser}
        onLogout={handleLogout}
        onBackToHome={() => setAppMode("website")}
      />
    );
  }

  return (
    <div className="website">


      {/* ── NAVBAR ── */}
      <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
        <a className="brand" href="#home">
          <div className="brand-icon">
            <img src="/logo.jpg" alt="PayMagic Logo" className="logo-img" />
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
              <span className="user-name">{loggedInUser.fullName || loggedInUser.name}</span>
              <button className="portal-launch-btn" onClick={() => { setAppMode("portal"); setMobileMenuOpen(false); }}>
                Open Portal →
              </button>
              <button className="logout-nav-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Sign Out</button>
            </div>
          ) : (
            <button className="login-btn mobile-login-btn" onClick={() => { openLogin(); setMobileMenuOpen(false); }}>
              <span>Portal Login</span>
            </button>
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
            <button className="login-btn desktop-login-btn" onClick={openLogin}>
              <span>Portal Login</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </button>
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


      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            ISO 27001 Certified &amp; RBI Compliant Fintech Startup
          </div>

          <h1>
            Engineering the<br />
            <span className="gradient-text">Future of Finance</span>
          </h1>

          <p className="hero-description">
            PayMagic PVT LTD is a high-growth fintech startup delivering transparent,
            ultra-fast payment processing, automated payroll, and intelligent treasury operations for modern enterprises.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={openLogin}>
              Access Secure Portal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="secondary-btn" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Platform
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
        <span className="trust-bar-label">REGULATORY COMPLIANCE &amp; CERTIFICATIONS</span>
        <div className="trust-badges">
          {TRUST.map((t) => (
            <div className="trust-badge" key={t.label}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="section" id="about">
        <div className="section-inner">
          <div className="about-text">
            <p className="section-label">ABOUT PAYMAGIC PVT LTD</p>
            <h2>Trusted Partner for <span className="gradient-text">Enterprise Growth</span></h2>
            <p className="about-desc">
              Founded on principles of extreme reliability, security, and transparent pricing, PayMagic PVT LTD provides modern companies with robust financial technology. From instant vendor settlements to automated payroll and developer APIs, we empower businesses to operate with maximum speed and complete peace of mind.
            </p>
            <div className="about-pillars">
              <div className="pillar">
                <div className="pillar-dot blue" />
                <div>
                  <strong>Enterprise Reliability</strong>
                  <p>Guaranteed 99.99% uptime with redundant failover across premier cloud clusters</p>
                </div>
              </div>
              <div className="pillar">
                <div className="pillar-dot green" />
                <div>
                  <strong>Transparent Financial Operations</strong>
                  <p>Zero hidden charges, instant ledger reconciliation, and downloadable audit trails</p>
                </div>
              </div>
              <div className="pillar">
                <div className="pillar-dot purple" />
                <div>
                  <strong>Continuous Innovation</strong>
                  <p>Regular feature rollouts keeping your business at the forefront of financial tech</p>
                </div>
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

      {/* ── SERVICES ── */}
      <section className="services" id="services">
        <div className="services-inner">
          <div className="services-header">
            <p className="section-label">OUR PLATFORM SERVICES</p>
            <h2>Everything You Need to <span className="gradient-text">Manage Money</span></h2>
            <p className="services-sub">A unified financial suite designed to handle everything from merchant transactions to corporate payroll seamlessly.</p>
          </div>
          <div className="service-grid">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.title}>
                <div className="service-tag">{s.tag}</div>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="card-learn">Learn more →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP / FOUNDERS SECTION ── */}
      <section className="leadership-section" id="leadership">
        <div className="section-inner">
          <div className="services-header">
            <p className="section-label">EXECUTIVE LEADERSHIP</p>
            <h2>Guided by Visionary <span className="gradient-text">Founders &amp; Directors</span></h2>
            <p className="services-sub">PayMagic PVT LTD is led by experienced technology and business leaders dedicated to corporate integrity and client success.</p>
          </div>

          <div className="founders-grid">
            <div className="founder-card">
              <div className="founder-avatar avatar-onkar">OH</div>
              <div className="founder-badge">FOUNDER &amp; DIRECTOR</div>
              <h3>Onkar Holkar</h3>
              <p className="founder-role">Strategic Planning &amp; Tech Operations</p>
              <p className="founder-bio">Leading technology infrastructure, high-velocity payment architectures, and system resilience for enterprise clients.</p>
              <button className="secondary-btn admin-login-shortcut" onClick={() => { openLogin(); handleAdminSelect("Onkar Holkar"); }}>
                Admin Sign In →
              </button>
            </div>

            <div className="founder-card">
              <div className="founder-avatar avatar-bhushan">BG</div>
              <div className="founder-badge">FOUNDER &amp; DIRECTOR</div>
              <h3>Bhushan Gaikwad</h3>
              <p className="founder-role">Corporate Growth &amp; Client Relations</p>
              <p className="founder-bio">Driving corporate partnership strategy, compliance frameworks, and long-term financial growth initiatives.</p>
              <button className="secondary-btn admin-login-shortcut" onClick={() => { openLogin(); handleAdminSelect("Bhushan Gaikwad"); }}>
                Admin Sign In →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQS SECTION ── */}
      <section className="faqs-section" id="faqs">
        <div className="faqs-inner">
          <div className="services-header">
            <p className="section-label">FREQUENTLY ASKED QUESTIONS</p>
            <h2>Got Questions? <span className="gradient-text">We Have Answers.</span></h2>
          </div>

          <div className="faq-accordion">
            {FAQS.map((faq, index) => (
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

      {/* ── CTA ── */}
      <section className="cta" id="contact">
        <div className="cta-glow" />
        <div className="cta-inner">
          <p className="section-label" style={{color:"#60a5fa"}}>GET STARTED WITH PAYMAGIC</p>
          <h2>Ready to Transform Your<br /><span className="gradient-text">Financial Operations?</span></h2>
          <p>Join thousands of businesses that trust PayMagic PVT LTD for high-velocity payments and payroll.</p>
          <div className="cta-actions">
            <button className="primary-btn" onClick={openLogin}>
              Access Secure Portal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="secondary-btn" onClick={openLogin}>Sign In to Dashboard</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a className="brand" href="#home">
              <div className="brand-icon">
                <img src="/logo.jpg" alt="PayMagic Logo" className="logo-img" />
              </div>
              <span>Pay<strong>Magic</strong></span>
            </a>
            <p className="footer-tagline">PayMagic PVT LTD · Finance Made Simple. Growth Made Real.</p>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#services">Smart Payments</a>
              <a href="#services">Financial Analytics</a>
              <a href="#services">Enterprise Security</a>
              <a href="#services">Developer APIs</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#leadership">Leadership</a>
              <a href="#faqs">FAQs</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Leadership</h4>
              <a href="#leadership" onClick={() => { openLogin(); handleAdminSelect("Onkar Holkar"); }}>Onkar Holkar</a>
              <a href="#leadership" onClick={() => { openLogin(); handleAdminSelect("Bhushan Gaikwad"); }}>Bhushan Gaikwad</a>
              <a href="#home" onClick={openLogin}>Admin Portal</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 OIT_Stack · All Rights Reserved</p>
          <div className="footer-trust-mini">
            <span>🔒 256-Bit Secured</span>
            <span>🏛️ RBI Compliant</span>
            <span>⚡ PCI-DSS Certified</span>
          </div>
        </div>
      </footer>

      {/* ── LOGIN MODAL ── */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={closeLogin}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeLogin} aria-label="Close">✕</button>

            {/* Step 1: Role Selection */}
            {loginView === "select-role" && (
              <div className="login-step-content">
                <div className="modal-logo">
                  <img src="/logo.jpg" alt="PayMagic Logo" className="modal-logo-img" />
                </div>
                <div className="login-header text-center">
                  <p className="portal-badge">PAYMAGIC PORTAL</p>
                  <h2>Welcome Back</h2>
                  <p>Choose your login type to continue</p>
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
                      <p>Management &amp; administrative controls</p>
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
                      <p>Staff workspace &amp; payroll access</p>
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
                  <p>Choose your admin profile to sign in</p>
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
                  <p>Enter your security password</p>
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
                  <p className="portal-badge employee-badge">EMPLOYEE PORTAL</p>
                  <h2>Employee Sign In</h2>
                  <p>Enter your credentials to access the staff portal</p>
                </div>
                <form onSubmit={handleEmployeeSubmit} className="login-form">
                  {loginError && <div className="error-message">{loginError}</div>}
                  <div className="form-group">
                    <label>Employee ID</label>
                    <div className="input-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      </svg>
                      <input type="text" placeholder="e.g. EMP-1042" value={employeeIdInput} onChange={(e) => setEmployeeIdInput(e.target.value)} autoFocus />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input type="password" placeholder="Enter your password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="submit-btn primary-btn">
                    Sign In to Portal
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
      )}
    </div>
  );
}