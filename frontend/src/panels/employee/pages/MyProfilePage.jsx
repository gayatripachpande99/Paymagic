import React from "react";
import { User } from "lucide-react";

export default function MyProfilePage({ profile = {}, kpiData = {} }) {
  return (
    <div className="portal-tab-content">
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <User className="w-5 h-5 text-indigo-400" />
            <h4>Employee Profile &amp; Role Authorizations</h4>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Full Legal Name</span>
            <span className="font-bold text-white text-base">{profile?.fullName || "Operations Executive"}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Employee System ID</span>
            <span className="font-mono text-indigo-400 text-base font-bold">{profile?.employeeId || "PM-EMP-0001"}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Role &amp; Designation</span>
            <span className="font-semibold text-slate-200 text-sm">{profile?.designation || "Recovery Specialist"} ({profile?.role || "CALLER"})</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Monthly Target Assigned</span>
            <span className="font-mono text-emerald-400 text-base font-bold">₹{Number(kpiData.target_amount || 100000).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
