import React from "react";
import { MapPin, Phone, Mail, Globe, User, ShieldCheck } from "lucide-react";

export default function Footer({ openLogin, handleAdminSelect }) {
  return (
    <footer>
      <div className="footer-inner">
        {/* Brand & Corporate Office Details */}
        <div className="footer-brand" style={{ maxWidth: "340px" }}>
          <a className="brand" href="#home">
            <div className="brand-icon">
              <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="logo-img" />
            </div>
            <span>Pay<strong>Magic</strong> PVT LTD</span>
          </a>
          
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "9px", fontSize: "12.5px", color: "#cbd5e1" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: "1.5" }}>
              <MapPin size={16} style={{ color: "#60a5fa", marginTop: "3px", flexShrink: 0 }} />
              <span>Office No. 42, 2nd Floor, Satyam Arcade, Near Ramwadi Metro Station, Vadgonsheri, Pune - 411014</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Phone size={15} style={{ color: "#34d399", flexShrink: 0 }} />
              <a href="tel:7038155166" style={{ color: "#e2e8f0", textDecoration: "none" }}>
                +91 7038155166
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Mail size={15} style={{ color: "#a78bfa", flexShrink: 0 }} />
              <a href="mailto:info@paymagic.in" style={{ color: "#e2e8f0", textDecoration: "none" }}>
                info@paymagic.in
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Globe size={15} style={{ color: "#38bdf8", flexShrink: 0 }} />
              <a href="https://www.paymagic.in" target="_blank" rel="noopener noreferrer" style={{ color: "#e2e8f0", textDecoration: "none" }}>
                https://www.paymagic.in
              </a>
            </div>
          </div>
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

          <div className="footer-col" style={{ minWidth: "230px" }}>
            <h4>Executive Leadership</h4>
            
            {/* Bhushan Gaikwad */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{ fontWeight: "700", color: "#f8fafc", fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => { if (openLogin && handleAdminSelect) { openLogin(); handleAdminSelect("Bhushan Gaikwad"); } }}
              >
                <User size={14} style={{ color: "#60a5fa" }} />
                <span>Bhushan Gaikwad</span>
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 4px" }}>Founder &amp; Director</div>
              <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
                <a href="tel:7767896125" style={{ color: "#94a3b8", fontSize: "12px", padding: "1px 0" }}>
                  📞 +91 7767896125
                </a>
                <a href="mailto:g.bhushanwork@gmail.com" style={{ color: "#94a3b8", fontSize: "12px", padding: "1px 0" }}>
                  ✉️ g.bhushanwork@gmail.com
                </a>
              </div>
            </div>

            {/* Onkar Holkar */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{ fontWeight: "700", color: "#f8fafc", fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => { if (openLogin && handleAdminSelect) { openLogin(); handleAdminSelect("Onkar Holkar"); } }}
              >
                <User size={14} style={{ color: "#34d399" }} />
                <span>Onkar Holkar</span>
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 4px" }}>Founder &amp; Director</div>
              <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
                <a href="tel:7057677873" style={{ color: "#94a3b8", fontSize: "12px", padding: "1px 0" }}>
                  📞 +91 7057677873
                </a>
                <a href="mailto:onkarholkar19@gmail.com" style={{ color: "#94a3b8", fontSize: "12px", padding: "1px 0" }}>
                  ✉️ onkarholkar19@gmail.com
                </a>
              </div>
            </div>

            <a href="#home" onClick={openLogin} style={{ color: "#60a5fa", fontWeight: "600", fontSize: "12.5px", marginTop: "4px" }}>
              Admin Portal Access &rarr;
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 PayMagic PVT LTD · All Rights Reserved</p>
        <div className="footer-trust-mini">
          <span>🛡️ RBI Compliant</span>
          <span>🔒 ISO 27001 Certified</span>
        </div>
      </div>
    </footer>
  );
}
