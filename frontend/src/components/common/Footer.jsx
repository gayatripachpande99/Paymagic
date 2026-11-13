import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, PhoneCall, Lock, Clock, CheckCircle2, Mail, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm">
      {/* Compliance Ribbon */}
      <div className="border-b border-slate-800/60 bg-indigo-950/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-medium">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Fair Practices Code & Ethical Debt Recovery Standard Compliant</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-indigo-400" />
              Calling Window: 08:00 - 19:00 IST
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={13} className="text-indigo-400" />
              100% Encrypted Audio Vault
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              RBI Grievance Escalation Ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Summary */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-base text-indigo-400">
                PM
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">PayMagic PVT LTD</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Next-generation enterprise loan recovery operations platform uniting automated telephony calling, voice recording compliance vaults, algorithmic case allocation, and ground field recovery.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
            <span>CIN: U72900PN2026PTC201822</span>
            <span>•</span>
            <span>ISO 27001 Certified</span>
          </div>
        </div>

        {/* Modules & Solutions */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Operations Suite</h4>
          <ul className="space-y-2.5 text-slate-400">
            <li><Link to="/services" className="hover:text-white transition-colors">Telephony Calling & Recording</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Algorithmic Case Allocation</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Ground Field Agent App</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Productivity & Shift Tracking</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Complaint & Dispute Redressal</Link></li>
          </ul>
        </div>

        {/* Ethical Governance */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Fair Practice & Ethics</h4>
          <ul className="space-y-2.5 text-slate-400">
            <li><Link to="/compliance" className="hover:text-white transition-colors">Respectful Calling Guidelines</Link></li>
            <li><Link to="/compliance" className="hover:text-white transition-colors">Permissible Hours Policy</Link></li>
            <li><Link to="/compliance" className="hover:text-white transition-colors">Audio Evidence Retention</Link></li>
            <li><Link to="/compliance" className="hover:text-white transition-colors">Borrower Grievance Redressal</Link></li>
            <li><Link to="/compliance" className="hover:text-white transition-colors">Data Privacy & PII Masking</Link></li>
          </ul>
        </div>

        {/* Office & Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Corporate Office</h4>
          <div className="space-y-3 text-slate-400 text-xs">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>PayMagic Operations Hub, Tower 4, Cyber City, Magarpatta, Pune, MH - 411028</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-indigo-400 shrink-0" />
              <a href="mailto:contact@paymagic.in" className="hover:text-white">contact@paymagic.in</a>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall size={16} className="text-indigo-400 shrink-0" />
              <span>+91 20 6711 9000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PayMagic PVT LTD. All rights reserved. Technology platform for regulated lenders & recovery partners.</p>
          <div className="flex items-center gap-6">
            <Link to="/compliance" className="hover:text-slate-400">Terms of Recovery</Link>
            <Link to="/compliance" className="hover:text-slate-400">Privacy Notice</Link>
            <Link to="/contact" className="hover:text-slate-400">Grievance Officer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

