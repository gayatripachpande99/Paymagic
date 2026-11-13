import React from "react";
import { Link } from "react-router-dom";
import {
  FileUp,
  Cpu,
  PhoneForwarded,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
  Workflow
} from "lucide-react";

export const HowItWorksPage = () => {
  const steps = [
    {
      step: "Phase 1",
      icon: <FileUp className="text-indigo-400" size={28} />,
      title: "Data Ingestion & Risk Scoring",
      desc: "Upload raw loan delinquency spreadsheets directly from your core banking system or lending partner.",
      points: [
        "Dynamic column mapping supports arbitrary bank schemas",
        "Validates principal, outstanding dues, DPD, borrower mobile, and address",
        "Instant error report generation for skipped or malformed rows",
        "Duplicate loan account detection and historical linkage"
      ]
    },
    {
      step: "Phase 2",
      icon: <Cpu className="text-emerald-400" size={28} />,
      title: "Algorithmic Case Allocation",
      desc: "Intelligent rules assign cases based on balances, geographic cluster, and telecaller workload.",
      points: [
        "Balanced distribution ensures no telecaller exceeds maximum workload capacity",
        "High-DPD and critical balance cases prioritized for senior recovery officers",
        "Geographic clustering groups cases by city and pincode for field follow-up",
        "Bulk transfers and supervisor re-assignments with full audit log"
      ]
    },
    {
      step: "Phase 3",
      icon: <PhoneForwarded className="text-blue-400" size={28} />,
      title: "Compliant Telephony Outreach",
      desc: "Telecallers trigger one-click calls with statutory recording disclosures inside authorized hours.",
      points: [
        "Enforces calling window between 08:00 and 19:00 IST",
        "System plays mandatory call recording notice to the customer",
        "Dual-channel high-fidelity recording automatically captured and tagged",
        "Mandatory outcome submission: Promise to Pay, Disputed, Callback, or Not Reachable"
      ]
    },
    {
      step: "Phase 4",
      icon: <MapPin className="text-amber-400" size={28} />,
      title: "Ground Field Recovery Escalation",
      desc: "When borrowers are not reachable by phone or request on-site meetings, field recovery is dispatched.",
      points: [
        "Mobile-optimized interface for field enforcement agents on the road",
        "GPS location captured strictly at authorized visit start and end with explicit notice",
        "Instant generation of digital payment receipts for cash or UPI settlement",
        "Photographic premise verification notes and status updates"
      ]
    },
    {
      step: "Phase 5",
      icon: <ShieldCheck className="text-purple-400" size={28} />,
      title: "Atomic Resolution & Evidence Vault",
      desc: "Every status transition is immutably audited inside ACID database transactions.",
      points: [
        "Critical rule: Every status change writes to case_status_history with employee ID and timestamp",
        "Audio recordings preserved in private AWS S3 bucket with KMS encryption",
        "Short-lived signed URLs for supervisory quality review and dispute investigation",
        "Exportable reconciliation reports for lender settlement auditing"
      ]
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Operational Blueprint
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How PayMagic Works
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            A battle-tested 5-phase operational pipeline delivering maximum collection velocity while protecting regulatory compliance.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-slate-800 -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content card */}
                  <div className="w-full lg:w-1/2">
                    <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                          {step.step}
                        </span>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-400 mb-6">{step.desc}</p>
                      <div className="space-y-2.5 border-t border-slate-800/80 pt-4">
                        {step.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-300">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden lg:flex w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 items-center justify-center text-xs font-bold text-indigo-400 z-10 shrink-0 shadow-lg shadow-indigo-500/20">
                    {idx + 1}
                  </div>

                  {/* Empty Spacer */}
                  <div className="hidden lg:block w-1/2"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all text-sm"
          >
            <span>Experience The Live Operations Workflow</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;

