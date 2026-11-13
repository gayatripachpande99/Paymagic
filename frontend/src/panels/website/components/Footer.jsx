import React from "react";

export default function Footer({ openLogin, handleAdminSelect }) {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <a className="brand" href="#home">
            <div className="brand-icon">
              <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="logo-img" />
            </div>
            <span>Pay<strong>Magic</strong></span>
          </a>
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
            <a href="#leadership" onClick={() => { if (openLogin && handleAdminSelect) { openLogin(); handleAdminSelect("Onkar Holkar"); } }}>
              Onkar Holkar
            </a>
            <a href="#leadership" onClick={() => { if (openLogin && handleAdminSelect) { openLogin(); handleAdminSelect("Bhushan Gaikwad"); } }}>
              Bhushan Gaikwad
            </a>
            <a href="#home" onClick={openLogin}>Admin Portal</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 OIT_Stack · All Rights Reserved</p>
      </div>
    </footer>
  );
}
