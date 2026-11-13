import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import { HomePage, AboutPage, ServicesPage, LeadershipPage, FaqPage, ContactPage } from "./pages";

export default function WebsitePanel({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  loggedInUser,
  setAppMode,
  handleLogout,
  openLogin,
  closeLogin,
  loginView,
  setLoginView,
  setLoginError,
  setEmployeeIdInput,
  setPasswordInput,
  setShowLoginModal,
  showLoginModal,
  handleAdminSelect,
  selectedAdmin,
  handleAdminSubmit,
  loginError,
  passwordInput,
  employeeIdInput,
  handleEmployeeSubmit,
  servicesList = [],
  trustList = [],
  faqsList = [],
  openFaq,
  toggleFaq
}) {
  return (
    <div className="website">
      {/* ── NAVBAR ── */}
      <Navbar
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        loggedInUser={loggedInUser}
        setAppMode={setAppMode}
        handleLogout={handleLogout}
        openLogin={openLogin}
        setLoginView={setLoginView}
        setLoginError={setLoginError}
        setEmployeeIdInput={setEmployeeIdInput}
        setPasswordInput={setPasswordInput}
        setShowLoginModal={setShowLoginModal}
      />

      {/* ── MAIN PAGES & SECTIONS ── */}
      <main>
        {/* Hero & Trust Bar */}
        <HomePage openLogin={openLogin} trustList={trustList} />

        {/* About Section */}
        <AboutPage />

        {/* Services Section */}
        <ServicesPage servicesList={servicesList} />

        {/* Leadership & Founders Section */}
        <LeadershipPage openLogin={openLogin} handleAdminSelect={handleAdminSelect} />

        {/* Frequently Asked Questions */}
        <FaqPage faqsList={faqsList} openFaq={openFaq} toggleFaq={toggleFaq} />

        {/* Contact / Call-To-Action */}
        <ContactPage openLogin={openLogin} />
      </main>

      {/* ── FOOTER ── */}
      <Footer openLogin={openLogin} handleAdminSelect={handleAdminSelect} />

      {/* ── AUTHENTICATION MODAL ── */}
      <LoginModal
        showLoginModal={showLoginModal}
        closeLogin={closeLogin}
        loginView={loginView}
        setLoginView={setLoginView}
        setLoginError={setLoginError}
        setEmployeeIdInput={setEmployeeIdInput}
        setPasswordInput={setPasswordInput}
        handleAdminSelect={handleAdminSelect}
        selectedAdmin={selectedAdmin}
        handleAdminSubmit={handleAdminSubmit}
        loginError={loginError}
        passwordInput={passwordInput}
        employeeIdInput={employeeIdInput}
        handleEmployeeSubmit={handleEmployeeSubmit}
        loggedInUser={loggedInUser}
        handleLogout={handleLogout}
      />
    </div>
  );
}

