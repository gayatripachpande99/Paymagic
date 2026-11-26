import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import AdminPortalShell from "./components/AdminPortalShell";
import EmployeePortalShell from "./components/EmployeePortalShell";
import api from "./services/api";
import "./App.css";

// Default authorized users for portal direct linking (e.g. /admin/allocations)
const DEFAULT_SUPERVISOR_USER = {
  id: "usr_admin",
  fullName: "Bhushan Gaikwad",
  role: "ADMIN",
  email: "admin@paymagic.in",
  employeeId: "PM-ADM-0001"
};

const DEFAULT_EMPLOYEE_USER = {
  id: "usr_caller_1",
  fullName: "Rahul Sharma",
  role: "CALLER",
  email: "caller@paymagic.in",
  employeeId: "PM-CAL-0001"
};

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
      return p === "/login";
    }
    return false;
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("paymagic_user");
      if (savedUser) return JSON.parse(savedUser);

      // If directly accessing /admin routes (e.g. /admin/allocations), auto-supply authorized supervisor session
      if (typeof window !== "undefined") {
        const p = window.location.pathname;
        if (p.startsWith("/admin")) {
          localStorage.setItem("paymagic_user", JSON.stringify(DEFAULT_SUPERVISOR_USER));
          return DEFAULT_SUPERVISOR_USER;
        }
        if (p.startsWith("/employee")) {
          localStorage.setItem("paymagic_user", JSON.stringify(DEFAULT_EMPLOYEE_USER));
          return DEFAULT_EMPLOYEE_USER;
        }
      }
      return null;
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

  // Listen for browser navigation (popstate)
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/employee")) {
        setAppMode("portal");
        if (!loggedInUser) {
          const user = path.startsWith("/admin") ? DEFAULT_SUPERVISOR_USER : DEFAULT_EMPLOYEE_USER;
          setLoggedInUser(user);
          localStorage.setItem("paymagic_user", JSON.stringify(user));
        }
      } else if (path === "/login") {
        setAppMode("website");
        setShowLoginModal(true);
      } else {
        setAppMode("website");
        setShowLoginModal(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [loggedInUser]);

  // Auto-bootstrap JWT token for direct portal deep-links if missing
  useEffect(() => {
    if (appMode === "portal" && !localStorage.getItem("paymagic_token")) {
      const isEmployeeRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/employee");
      const creds = isEmployeeRoute
        ? { email: "caller@paymagic.in", password: "Emp@123" }
        : { email: "admin@paymagic.in", password: "Admin@123" };
      api.post("/auth/login", creds).then((res) => {
        if (res && (res.token || res.tokens?.accessToken) && res.user) {
          const token = res.token || res.tokens.accessToken;
          localStorage.setItem("paymagic_token", token);
          if (res.tokens?.refreshToken) {
            localStorage.setItem("paymagic_refresh_token", res.tokens.refreshToken);
          }
          localStorage.setItem("paymagic_user", JSON.stringify(res.user));
          setLoggedInUser(res.user);
        }
      }).catch((err) => {
        console.warn("Portal direct authentication bootstrap:", err?.message || err);
      });
    }
  }, [appMode]);

  const openLogin = () => setShowLoginModal(true);
  const closeLogin = () => {
    setShowLoginModal(false);
    if (window.location.pathname === "/login") {
      window.history.pushState(null, "", "/");
    }
  };

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    localStorage.setItem("paymagic_user", JSON.stringify(user));
    setShowLoginModal(false);
    setAppMode("portal");

    const isLeadershipOrSupervisor = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "HR"].includes(user.role);
    const targetRoute = isLeadershipOrSupervisor ? "/admin/overview" : "/employee/dashboard";
    window.history.pushState(null, "", targetRoute);
  };

  const handleLogout = () => {
    localStorage.removeItem("paymagic_user");
    localStorage.removeItem("paymagic_token");
    localStorage.removeItem("paymagic_refresh_token");
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
