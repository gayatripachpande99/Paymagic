import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  Scale,
  Users,
  Clock,
  Sparkles,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import AnimatedCounter from "../../components/common/AnimatedCounter";
import api from "../../services/api";

export const HomePage = () => {
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    portfolioSize: "₹50 Cr - ₹200 Cr",
    servicesRequested: "Full Suite (Telephony + Field Recovery)",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await api.post("/enquiries", enquiryForm);
      if (res.success) {
        setFormSubmitted(true);
      } else {
        setFormError(res.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      setFormError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const services = [
    {
      icon: <PhoneCall className="text-indigo-400" size={26} />,
      title: "Telephony Calling & Auto-Recording",
      desc: "One-click click-to-call bridge with mandatory customer disclosure announcements, automatic dual-channel audio recording, and automated outcome tagging.",
      badge: "Voice Recovery"
    },
    {
      icon: <MapPin className="text-emerald-400" size={26} />,
      title: "Ground Field Recovery Operations",
      desc: "Mobile-first enforcement agent app with GPS visit verification, customer verification receipts, digital UPI/cash collection, and immediate outcome sync.",
      badge: "Ground Recovery"
    },
    {
      icon: <Database className="text-blue-400" size={26} />,
      title: "Algorithmic Case Allocation",
      desc: "Instant bulk Excel/CSV ingestion with automated case distribution based on outstanding dues, geography, priority risk, and telecaller workload.",
      badge: "Operations"
    },
    {
      icon: <Lock className="text-amber-400" size={26} />,
      title: "Encrypted Voice Evidence Vault",
      desc: "Private AWS S3 storage with KMS SSE encryption, short-lived signed URLs, strict audit access logging, and legal-hold preservation.",
      badge: "Compliance"
    },
    {
      icon: <BarChart3 className="text-purple-400" size={26} />,
      title: "Real-Time Recovery Dashboards",
      desc: "Calculates call connection rates, target achievement %, and recovery progress with live supervisor monitors and exportable reports.",
      badge: "Analytics"
    },
    {
      icon: <Scale className="text-rose-400" size={26} />,
      title: "Grievance & Dispute Redressal",
      desc: "Comprehensive borrower dispute handling: listen to past call recordings, review agent logs, assign to supervisors, and track resolutions to RBI standards.",
      badge: "Fair Practice"
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Loan Portfolio Ingestion",
      desc: "Upload unstructured Excel/CSV files from banks and NBFCs. Auto-map columns, validate dues, detect duplicates, and categorize risk profiles."
    },
    {
      step: "02",
      title: "Algorithmic Case Allocation",
      desc: "Automated routing assigns cases to telecallers and field recovery agents based on geographical zones, overdue buckets, and agent capacities."
    },
    {
      step: "03",
      title: "Omnichannel Compliant Contact",
      desc: "Telecallers initiate click-to-call inside permissible hours (08:00 - 19:00 IST) with statutory recording disclosures and automated call logging."
    },
    {
      step: "04",
      title: "Settlement & Status Audit",
      desc: "Every interaction, promise to pay, and payment is atomically audited in database transactions with full audio evidence and supervisor review."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden hero-gradient">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Next-Gen Enterprise Loan Recovery & Field Enforcement Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Ethical, High-Velocity Loan Recovery{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">
                Powered by AI Telephony
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Empower your recovery operations with click-to-call recording, algorithmic case allocation, ground field visit tracking, and immutable audit trails that meet RBI Fair Practices standards.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center gap-2 group"
              >
                <span>Launch Operations Portal</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#enquiry-form"
                className="px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl font-semibold text-base transition-all backdrop-blur-sm"
              >
                Schedule Lender Demo
              </a>
            </div>

            {/* Quick Demo Logins Banner */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Demo accounts ready: Super Admin, Admin, Supervisor, Caller, Field Agent</span>
            </div>
          </div>

          {/* KPI Highlight Strip */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 text-center hover:border-indigo-500/30 transition-all hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                <AnimatedCounter prefix="₹" value={142} suffix=" Cr+" />
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400">Total Capital Recovered</p>
              <span className="inline-block mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                +24.6% MoM Efficiency
              </span>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 text-center hover:border-indigo-500/30 transition-all hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                <AnimatedCounter value={94.2} suffix="%" />
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400">Call Connection Rate</p>
              <span className="inline-block mt-2 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-semibold">
                Smart Time-Band Routing
              </span>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 text-center hover:border-indigo-500/30 transition-all hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400">Voice Calls Recorded & Encrypted</p>
              <span className="inline-block mt-2 text-[11px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-semibold">
                AWS KMS SSE-256 Vault
              </span>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 text-center hover:border-indigo-500/30 transition-all hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                <AnimatedCounter value={99.8} suffix="%" />
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400">Grievance Resolution SLA</p>
              <span className="inline-block mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                RBI Fair Practices Code
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lender Partners / Trust Bar */}
      <div className="border-y border-slate-800/80 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
            Trusted by Leading Lenders, Banks & NBFC Portfolios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
            {["Bajaj Finance", "HDFC Bank", "ICICI Bank", "Tata Capital", "Axis Bank", "Kotak Mahindra"].map((lender) => (
              <div key={lender} className="text-sm font-bold tracking-wider text-slate-300">
                {lender}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Services Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Enterprise Solutions
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
            Everything Required for High-Performance Recovery Operations
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            From call-center outbound dialers to ground recovery agents, PayMagic unifies the entire debt collection lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-8 rounded-3xl border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-indigo-400 font-semibold group-hover:text-indigo-300">
                <span>Explore Capabilities</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              The 4-Stage Architecture
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              End-to-End Operational Lifecycle
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              A transparent, audited workflow designed for speed, accountability, and borrower dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
                <div className="text-4xl font-extrabold text-indigo-500/20 mb-4">{s.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Ethical Recovery Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl border border-indigo-500/30 p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-950">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
              <ShieldCheck size={16} />
              <span>Zero-Tolerance Fair Practices Code</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Protecting Your Lending Brand With Uncompromising Compliance
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              PayMagic strictly enforces RBI debt collection regulations through systemic code gates, preventing illegal outreach and protecting borrowers against unfair practices.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-white">Strict Calling Hours:</strong> Backend automatically prohibits calls outside 08:00 to 19:00 IST.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-white">Statutory Audio Notice:</strong> Telephony bridge announces mandatory recording disclosure to borrower.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-white">Immutable Status Audit:</strong> All case status shifts committed in ACID DB transactions with timestamps.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-white">Dispute & Grievance Redressal:</strong> Dedicated workflow linking call recordings directly to complaints.
                </span>
              </div>
            </div>

            <div className="mt-10">
              <Link
                to="/compliance"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Read Full Compliance Charter</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Contact & Consultation Form */}
      <section id="enquiry-form" className="py-24 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Get Started
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Schedule an Enterprise Consultation
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Discover how PayMagic improves capital recovery by 24% while drastically lowering compliance risks.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-white">Consultation Request Received!</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Thank you for contacting PayMagic. Our Enterprise Recovery Specialist will review your institution's profile and contact you within 4 business hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-6">
                {formError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.fullName}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="v.malhotra@lender.com"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Direct Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="+91 98200 11223"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Lending Institution / NBFC *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.organization}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, organization: e.target.value })}
                      placeholder="e.g. Zenith Retail Lending Ltd"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Active NPA Portfolio Size
                    </label>
                    <select
                      value={enquiryForm.portfolioSize}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, portfolioSize: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Under ₹10 Cr</option>
                      <option>₹10 Cr - ₹50 Cr</option>
                      <option>₹50 Cr - ₹200 Cr</option>
                      <option>₹200 Cr - ₹1,000 Cr</option>
                      <option>Over ₹1,000 Cr</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Services of Interest
                    </label>
                    <select
                      value={enquiryForm.servicesRequested}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, servicesRequested: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Full Suite (Telephony + Field Recovery)</option>
                      <option>Voice Telephony & Call Recording Vault</option>
                      <option>Ground Field Recovery Agent Platform</option>
                      <option>Algorithmic Case Allocation Engine</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Operational Requirements / Portfolio Context *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Describe your current recovery challenges, overdue buckets (30-90 DPD, 90+ DPD), and agent headcount..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-base transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {formLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Portfolio Consultation Request</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

