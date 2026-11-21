import React from "react";
import { MapPin, Phone, Mail, Globe, User, ShieldCheck } from "lucide-react";

export default function Footer({ openLogin }) {
  return (
    <footer>
      <div className="footer-inner">
        {/* Brand & Corporate Office Details */}
        <div className="footer-brand" style={{ maxWidth: "340px" }}>
          <a className="brand" href="#home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div className="brand-icon">
              <img src="/Logo_Name_PayMagic.png" alt="PayMagic Logo" className="logo-img" />
            </div>
            <span style={{ fontSize: "18px", color: "white" }}>
              Pay<strong>Magic</strong> PVT LTD
            </span>
          </a>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "12.5px",
              color: "#cbd5e1"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: "1.5" }}>
              <MapPin size={16} style={{ color: "#60a5fa", marginTop: "3px", flexShrink: 0 }} />
              <span>
                Office No. 42, 2nd Floor, Satyam Arcade, Near Ramwadi Metro Station, Vadgonsheri, Pune - 411014
              </span>
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
              <a
                href="https://www.paymagic.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#e2e8f0", textDecoration: "none" }}
              >
                https://www.paymagic.in
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#services">Smart Payments</a>
            <a href="#services">Financial Analytics</a>
            <a href="#services">Enterprise Security</a>
            <a href="#services">Voice Telephony</a>
            <a href="#services">Field Operations</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#leadership">Leadership</a>
            <a href="#compliance">RBI Compliance</a>
            <a href="#faqs">FAQs</a>
            <a href="#enquiry-form">Contact / Enquiry</a>
          </div>

          <div className="footer-col" style={{ minWidth: "240px" }}>
            <h4>Executive Leadership</h4>

            {/* Bhushan Gaikwad */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontWeight: "700",
                  color: "#f8fafc",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={openLogin}
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
                style={{
                  fontWeight: "700",
                  color: "#f8fafc",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={openLogin}
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
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} PayMagic PVT LTD. All rights reserved.</p>
        <div className="footer-trust-mini">
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} style={{ color: "#10b981" }} />
            <span>RBI Fair Practices Framework</span>
          </span>
          <span>•</span>
          <span>ISO 27001 Certified</span>
          <span>•</span>
          <span>PCI-DSS Level 1 Encrypted</span>
        </div>
      </div>
    </footer>
  );
}
