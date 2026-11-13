import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Clock,
  Volume2,
  Lock,
  Scale,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Mail,
  Building
} from "lucide-react";

export const CompliancePage = () => {
  const pillars = [
    {
      icon: <Clock className="text-indigo-400" size={28} />,
      title: "Permissible Calling Hours Policy",
      summary: "Systemically enforced 08:00 to 19:00 IST time band",
      description:
        "Under the Reserve Bank of India (RBI) Fair Practices Code for Lenders, recovery outreach is strictly prohibited during early morning, late evening, and night hours. PayMagic blocks all outgoing telephony requests before 08:00 IST and after 19:00 IST at the backend API layer. Even if an agent clicks to dial, the request is rejected with a compliance exception.",
      rules: [
        "Default active window: Monday - Saturday, 08:00 to 19:00 IST",
        "Configurable holiday and Sunday blackout periods",
        "Out-of-hours override requests require two-step Executive authorization"
      ]
    },
    {
      icon: <Volume2 className="text-emerald-400" size={28} />,
      title: "Mandatory Call Recording Disclosure",
      summary: "Statutory borrower notification before dialogue",
      description:
        "Every single outbound or inbound telephony session includes an automated, tamper-proof voice prompt informing the borrower that 'This call is placed by PayMagic on behalf of the lender and is recorded for quality, training, and compliance purposes.' The system records the customer notification status flag ('ANNOUNCED_RECORDED') as part of the immutable call record.",
      rules: [
        "Automated audio prompt precedes agent bridging",
        "Customer notification status logged in calls database table",
        "Bypassing prompt is technically prohibited in telephony gateway"
      ]
    },
    {
      icon: <UserCheck className="text-blue-400" size={28} />,
      title: "Respectful Calling & Conduct Standard",
      summary: "Zero-tolerance against intimidation, abuse, or harassment",
      description:
        "PayMagic enforces strict code-of-conduct guidelines. Agents are trained and certified on non-coercive negotiation. All calls are processed through automated keyword and sentiment analysis flags to detect aggressive phrasing, repeated intrusive calls, or third-party disclosure violations.",
      rules: [
        "Strict prohibition of offensive language, threats, or intimidation",
        "Borrower privacy protected: No disclosure to unauthorized third parties or employers",
        "Frequency throttling prevents excessive multiple calls in a single day"
      ]
    },
    {
      icon: <Lock className="text-amber-400" size={28} />,
      title: "Data Privacy & Sensitive PII Masking",
      summary: "Role-based masking of phone numbers and financial identifiers",
      description:
        "To protect borrower confidentiality and prevent data leakage, customer contact numbers and sensitive bank account details are masked on caller and field agent screens (e.g. +91 98765****12). Full unmasked data is restricted exclusively to Operations Administrators with security clearance.",
      rules: [
        "Click-to-call bridges dial directly without exposing full telephone number to agent",
        "Borrower financial data encrypted at rest and in transit (AES-256 / TLS 1.3)",
        "Audit logs track every single data export and screen view"
      ]
    },
    {
      icon: <Scale className="text-rose-400" size={28} />,
      title: "Borrower Grievance Redressal Process",
      summary: "Direct escalation path to Ombudsman & Quality Lead",
      description:
        "Borrowers have a fundamental right to fair treatment. When a borrower registers a complaint or dispute, PayMagic provides an audited escalation flow: supervisors listen to original recordings, review agent visit notes, place the case on hold, and provide written resolution within 48 hours.",
      rules: [
        "Immediate temporary suspension of recovery actions upon disputed dues",
        "Supervisor assigned with mandatory 48-hour resolution SLA",
        "Full transparent dossier provided to lending partner compliance team"
      ]
    },
    {
      icon: <FileCheck2 className="text-purple-400" size={28} />,
      title: "Evidence Vault & Legal Hold Policies",
      summary: "AWS S3 KMS encrypted immutable audio storage",
      description:
        "Audio files are stored in private S3 buckets accessible only through short-lived signed URLs. Original audio cannot be deleted or edited by any employee. When legal disputes arise, a Legal Hold flag freezes automated retention schedules to ensure complete evidentiary integrity.",
      rules: [
        "15-minute signed URL lifespan with IP-bound playback logs",
        "365-day statutory audio retention with legal-hold freeze capability",
        "Audit trail for every single audio playback and download action"
      ]
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck size={16} />
            <span>Fair Practices Code & Regulatory Charter</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Compliance and Ethical Recovery
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            How PayMagic ensures 100% adherence to RBI Master Directions, data protection standards, and dignified debt resolution.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{pillar.summary}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {pillar.description}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Enforcement Standards:
                </span>
                {pillar.rules.map((rule, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Grievance Officer Contact Box */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Principal Grievance Redressal Officer</h2>
            <p className="text-slate-400 text-sm">
              If you are a borrower and have experienced non-compliant calling hours or inappropriate conduct from any PayMagic representative, please notify our Grievance Redressal Officer directly:
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-indigo-400" />
                <span><strong>Officer:</strong> Mr. Bhushan Gaikwad</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-400" />
                <a href="mailto:grievance@paymagic.in" className="text-indigo-400 hover:underline">grievance@paymagic.in</a>
              </div>
              <div className="flex items-center gap-2">
                <Building size={16} className="text-indigo-400" />
                <span>Magarpatta Cyber City, Pune, MH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;

