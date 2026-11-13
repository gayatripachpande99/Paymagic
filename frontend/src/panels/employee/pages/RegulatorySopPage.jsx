import React from "react";
import { FileText } from "lucide-react";

export default function RegulatorySopPage() {
  return (
    <div className="portal-tab-content">
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h4>Fair Practice &amp; Recovery SOP Guidelines</h4>
          </div>
          <span className="badge badge-success">RBI Fair Practices Enforced</span>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h5 className="font-bold text-white text-sm mb-2">1. Permissible Calling Hours</h5>
            <p>
              Calls must only be placed between <strong>08:00 AM and 07:00 PM IST</strong>. System enforces automated lockout outside authorized hours.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h5 className="font-bold text-white text-sm mb-2">2. Mandatory Audio Recording Announcement</h5>
            <p>
              All calls automatically inform the customer: <em>&quot;This call is recorded for quality, compliance and training purposes.&quot;</em>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h5 className="font-bold text-white text-sm mb-2">3. Respectful &amp; Courteous Interaction</h5>
            <p>
              Intimidation, harassment, or verbal abuse is strictly prohibited under zero-tolerance corporate recovery policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
