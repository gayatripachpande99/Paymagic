import React from "react";
import { Link } from "react-router-dom";
import {
  PhoneCall,
  MapPin,
  Database,
  Lock,
  BarChart3,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Radio
} from "lucide-react";

export const ServicesPage = () => {
  const serviceCategories = [
    {
      title: "Telephony Calling & Automatic Dual-Channel Recording",
      icon: <PhoneCall className="text-indigo-400" size={32} />,
      badge: "Module B",
      description:
        "Seamless cloud telephony bridge that eliminates manual dialing errors while enforcing recording disclosures and time-band compliance.",
      features: [
        "Single-click dialer embedded directly in telecaller worklists",
        "Mandatory recording announcement disclosure played before bridging borrower",
        "Automatic webhook capture of call duration, start/end timestamps, and disconnect reason",
        "Mandatory post-call outcome workflow: Promise to Pay, Disputed, Callback, or Not Reachable",
        "Real-time telephony status tracker: Answered, Busy, Rejected, Unanswered"
      ]
    },
    {
      title: "Ground Field Recovery & Enforcement Management",
      icon: <MapPin className="text-emerald-400" size={32} />,
      badge: "Module E",
      description:
        "Mobile-first operational tool designed specifically for field recovery executives visiting borrower residences and business premises.",
      features: [
        "GPS location capture strictly at authorized visit start/end with explicit privacy notices",
        "On-site cash and instant UPI QR code payment collection verification",
        "Digital collection receipts generated instantly and shared with borrower",
        "Offline-capable visit notes and premise occupancy verification (Locked, Shifted, Met)",
        "Supervisor visit approvals and route optimization"
      ]
    },
    {
      title: "Algorithmic Case Ingestion & Dynamic Allocation",
      icon: <Database className="text-blue-400" size={32} />,
      badge: "Module A",
      description:
        "Intelligent ingestion engine that normalizes messy bank Excel and CSV portfolios into actionable cases with risk categorization.",
      features: [
        "Dynamic column mapping and row-level schema validation with downloadable error logs",
        "Automated distribution based on outstanding dues, geography, priority risk, and agent workload",
        "Seamless bulk re-assignment and supervisor transfer workflows",
        "ACID-compliant transactional audit log recording every single case status transition",
        "Configurable recovery target assignment with follow-up calendar synchronization"
      ]
    },
    {
      title: "Encrypted Voice Evidence & Legal Audio Vault",
      icon: <Lock className="text-amber-400" size={32} />,
      badge: "Module F",
      description:
        "Bank-grade audio storage ensuring every customer interaction is immutable, encrypted, and legally defensible in regulatory audits.",
      features: [
        "Private AWS S3 storage with AWS KMS SSE-256 server-side encryption",
        "Access strictly restricted through short-lived (15-minute) pre-signed URLs",
        "Immutable audit logs: every playback, scrub, and download permanently logged",
        "Legal-hold flags preventing automated retention purges during open litigation or disputes",
        "Zero employee edit or deletion permissions on original recordings"
      ]
    },
    {
      title: "Borrower Complaint & Dispute Redressal Engine",
      icon: <Scale className="text-rose-400" size={32} />,
      badge: "Module G",
      description:
        "A formal grievance redressal system that turns borrower feedback and disputes into opportunities for fair resolution.",
      features: [
        "Direct one-click access to complete borrower telephony call histories and audio playback",
        "Supervisor dispute assignment with escalation triggers and status timelines",
        "Dispute categorization: Uncredited payments, tone/conduct complaints, calling hour violations",
        "Comprehensive investigation notes and formal borrower resolution documentation",
        "RBI Fair Practice Code compliance reporting ready for bank audit review"
      ]
    },
    {
      title: "Executive Recovery Dashboards & Attendance",
      icon: <BarChart3 className="text-purple-400" size={32} />,
      badge: "Modules C, D & I",
      description:
        "Comprehensive workforce productivity suite combining real-time shift tracking, connection formulas, and recovery achievement metrics.",
      features: [
        "Calculates Call Connection Rate = Connected Calls / Total Attempts * 100",
        "Calculates Recovery Percentage = Amount Recovered / Assigned Outstanding * 100",
        "Calculates Target Achievement = Actual Recovery / Assigned Target * 100",
        "Shift clock-in/out, daily attendance, work duration, and leave request management",
        "Multi-dimensional exportable reports by lender, employee, product type, and aging bucket"
      ]
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Platform Capabilities
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Integrated Debt Recovery Solutions
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Engineered specifically to solve the core operational bottlenecks of modern collection agencies, banks, and retail NBFCs.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-12">
          {serviceCategories.map((service, index) => (
            <div
              key={index}
              className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                    {service.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    {service.badge}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{service.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{service.description}</p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View in Live Workspace</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                  Operational Features
                </h4>
                <div className="space-y-3">
                  {service.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;

