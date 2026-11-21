import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import AdminPortalShell from "./components/AdminPortalShell";
import EmployeePortalShell from "./components/EmployeePortalShell";
import "./App.css";

export default function App() {
  const [appMode, setAppMode] = useState(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p.startsWith("/admin") || p.startsWith("/employee")) {
        return "portal";
      }
    }
    return "website";
  });

  const [showLoginModal, setShowLoginModal] = useState(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      return p === "/login" || (p.startsWith("/admin") && !localStorage.getItem("paymagic_user"));
    }
    return false;
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("paymagic_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme Management: Light and Dark Theme Support
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("paymagic_theme");
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
      return "dark"; // Default to dark theme
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("paymagic_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Window scroll listener for glassmorphism navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Listen to popstate for back/forward navigation between website and portal
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === "/" || p === "") {
        setAppMode("website");
      } else if (p.startsWith("/admin") || p.startsWith("/employee")) {
        setAppMode("portal");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openLogin = () => setShowLoginModal(true);
  const closeLogin = () => {
    setShowLoginModal(false);
    if (window.location.pathname === "/login") {
      window.history.pushState(null, "", "/");
    }
  };

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    setAppMode("portal");
    closeLogin();

    // Route to appropriate portal if on root or login
    const p = window.location.pathname;
    if (p === "/" || p === "/login") {
      const isLeadership = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "HR"].includes(user.role);
      const targetRoute = isLeadership ? "/admin/overview" : "/employee/queue";
      window.history.pushState(null, "", targetRoute);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("paymagic_token");
    localStorage.removeItem("paymagic_user");
    setLoggedInUser(null);
    setAppMode("website");
    window.history.pushState(null, "", "/");
  };

  const handleBackToHome = () => {
    setAppMode("website");
    window.history.pushState(null, "", "/");
  };

  // If in portal mode and user is authenticated
  if (appMode === "portal" && loggedInUser) {
    const isLeadershipOrSupervisor = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "HR"].includes(loggedInUser.role);
    return isLeadershipOrSupervisor ? (
      <AdminPortalShell
        user={loggedInUser}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    ) : (
      <EmployeePortalShell
        user={loggedInUser}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Public Landing Experience: Clean Home Page Only + Single Login Button
  return (
    <div className={`website theme-${theme}`} data-theme={theme}>
      {/* ── Single Login Header with Theme Toggle ── */}
      <Navbar
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        loggedInUser={loggedInUser}
        setAppMode={setAppMode}
        handleLogout={handleLogout}
        openLogin={openLogin}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* ── Home Page Content ── */}
      <main>
        <HomePage openLogin={openLogin} theme={theme} />
      </main>

      {/* ── Standard Regulatory Footer ── */}
      <Footer openLogin={openLogin} theme={theme} />

      {/* ── Unified Single Login Modal ── */}
      {showLoginModal && (
        <LoginModal
          showLoginModal={showLoginModal}
          closeLogin={closeLogin}
          onClose={closeLogin}
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
        />
      )}
    </div>
  );
}
