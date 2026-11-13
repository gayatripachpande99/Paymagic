import { useState, useEffect } from "react";
import api from "./services/api";
import EmployeeDashboard from "./components/EmployeeDashboard";
import AdminDashboard from "./components/AdminDashboard";
import WebsitePanel from "./panels/website/WebsitePanel";
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
    <WebsitePanel
      scrolled={scrolled}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      loggedInUser={loggedInUser}
      setAppMode={setAppMode}
      handleLogout={handleLogout}
      openLogin={openLogin}
      closeLogin={closeLogin}
      loginView={loginView}
      setLoginView={setLoginView}
      setLoginError={setLoginError}
      setEmployeeIdInput={setEmployeeIdInput}
      setPasswordInput={setPasswordInput}
      setShowLoginModal={setShowLoginModal}
      showLoginModal={showLoginModal}
      handleAdminSelect={handleAdminSelect}
      selectedAdmin={selectedAdmin}
      handleAdminSubmit={handleAdminSubmit}
      loginError={loginError}
      passwordInput={passwordInput}
      employeeIdInput={employeeIdInput}
      handleEmployeeSubmit={handleEmployeeSubmit}
      servicesList={SERVICES}
      trustList={TRUST}
      faqsList={FAQS}
      openFaq={openFaq}
      toggleFaq={toggleFaq}
    />
  );
}