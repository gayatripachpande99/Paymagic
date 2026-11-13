import React from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldAlert,
  Server,
  Users,
  Database,
  Lock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Clock
} from "lucide-react";
import AnimatedCounter from "../../components/common/AnimatedCounter";

export const SuperAdminPortal = () => {
  const { user } = useAuth();

  const auditEvents = [
    { action: "ROLE_PERMISSION_CHECK", user: "Onkar Holkar", time: "2m ago", status: "PASSED" },
    { action: "TELEPHONY_RECORDING_AUDIT", user: "System Guard", time: "14m ago", status: "VERIFIED" },
    { action: "BULK_PORTFOLIO_IMPORT", user: "Bhushan Gaikwad", time: "1h ago", status: "COMMITTED" }
  ];

  return (
    <PortalLayout
      title="Super Administrator Root Command"
      subtitle="Comprehensive system oversight, governance, audit logs, and security enforcement."
    >
      <div className="space-y-8">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio</span>
              <Database size={18} className="text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              <AnimatedCounter prefix="₹" value={142} suffix=" Cr" />
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">Across 6 Partner Institutions</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Recovery Staff</span>
              <Users size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              <AnimatedCounter value={48} />
            </div>
            <div className="text-xs text-slate-400 mt-2">Telecallers & Ground Field Agents</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Audio Vault Status</span>
              <Lock size={18} className="text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-2">KMS SSE-256 Encrypted (S3)</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Fair Practices Code</span>
              <ShieldAlert size={18} className="text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">08:00-19:00</div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">IST Window Active</div>
          </div>
        </div>

        {/* Security & System Audit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">Enterprise System Audit Trail</h3>
            <div className="space-y-3">
              {auditEvents.map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <div>
                      <div className="font-bold text-white">{ev.action}</div>
                      <div className="text-slate-400 text-[11px]">{ev.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {ev.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">System Controls</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Telephony Gateway Bridge</span>
                <span className="text-emerald-400 font-semibold">Online (Mock Adapter)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">PostgreSQL Relational Engine</span>
                <span className="text-emerald-400 font-semibold">ACID Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Statutory Notice Enforcement</span>
                <span className="text-indigo-400 font-semibold">Mandatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default SuperAdminPortal;

