import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  Users,
  Target,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Server
} from "lucide-react";

export const AboutPage = () => {
  const leaders = [
    {
      name: "Onkar Holkar",
      title: "Founder & Director",
      bio: "Pioneered automated recovery algorithms and telephony orchestration. Champions fair collection standards and institutional compliance.",
      department: "Executive Operations & Technology"
    },
    {
      name: "Bhushan Gaikwad",
      title: "Founder & Director",
      bio: "Over 14 years steering large-scale retail banking collections and ground field enforcement across Western India.",
      department: "Institutional Strategy & Grievance Governance"
    }
  ];

  const milestones = [
    { year: "2024", event: "PayMagic Founded in Pune with vision to digitize recovery workflows." },
    { year: "2025", event: "Launched proprietary click-to-call recording bridge & AWS encrypted audio vault." },
    { year: "2026", event: "Surpassed ₹140 Cr in cumulative recoveries across 6 leading NBFC and banking partners." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            About PayMagic
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Building The Future of Ethical Debt Resolution
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            We bridge the gap between financial institutions and borrowers through transparent, technologically advanced, and respectful recovery operations.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <Target size={26} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              To eliminate friction, intimidation, and compliance hazards from debt recovery. By empowering telecallers and field executives with real-time intelligence and systematic compliance safeguards, we maximize recovery yields while upholding borrower dignity.
            </p>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <Award size={26} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Standards</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We operate under bank-grade operational security and RBI Fair Practices standards. Every single outbound call is announced, recorded, and audited. Every status update is permanently timestamped. We believe true collection success lies in mutual respect and clear accountability.
            </p>
          </div>
        </div>

        {/* Leadership */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white">Leadership Team</h2>
            <p className="text-slate-400 text-sm mt-2">
              Seasoned fintech and credit operations veterans committed to ethical recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {leaders.map((leader, idx) => (
              <div
                key={idx}
                className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 mx-auto mb-4">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                    {leader.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{leader.name}</h3>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  {leader.title}
                </p>
                <p className="text-xs text-slate-500 mb-4">{leader.department}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack & Infrastructure */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 mb-20 bg-slate-900/40">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Enterprise Technology Architecture
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              High-throughput microservices designed for financial durability and strict transactional integrity.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-white block text-sm mb-1">PostgreSQL</span>
              <span className="text-slate-400">ACID Transactions & Status Audit</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-white block text-sm mb-1">AWS S3 & KMS</span>
              <span className="text-slate-400">Encrypted Private Audio Vault</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-white block text-sm mb-1">Cloud Telephony</span>
              <span className="text-slate-400">Statutory Notice & Call Bridging</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-white block text-sm mb-1">React & Tailwind</span>
              <span className="text-slate-400">Responsive Telecaller & Field Apps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

