import React, { useState } from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  FileCheck2,
  AlertCircle,
  Receipt,
  UserCheck,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import AnimatedCounter from "../../components/common/AnimatedCounter";

export const FieldAgentPortal = () => {
  const { user } = useAuth();
  const [gpsConsent, setGpsConsent] = useState(true);

  return (
    <PortalLayout
      title="Field Enforcement Agent Workstation"
      subtitle="On-site physical visits, authorized GPS check-in, premise verification, and payment receipts."
    >
      <div className="space-y-8 max-w-4xl">
        {/* GPS Privacy & Consent Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-300">
          <ShieldCheck size={20} className="shrink-0 mt-0.5 text-amber-400" />
          <div>
            <strong>Limited GPS Collection Notice:</strong> To ensure compliance and employee privacy, your location is strictly requested only when you initiate and complete an authorized customer premise visit. Background tracking is strictly disabled.
          </div>
        </div>

        {/* Field Agent Daily KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Scheduled Visits</span>
            <div className="text-2xl font-extrabold text-white">
              <AnimatedCounter value={18} />
            </div>
            <span className="text-[10px] text-slate-500">Today's Route</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Completed</span>
            <div className="text-2xl font-extrabold text-emerald-400">
              <AnimatedCounter value={14} />
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">77.7% Rate</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Collections</span>
            <div className="text-2xl font-extrabold text-white">
              <AnimatedCounter prefix="₹" value={142000} />
            </div>
            <span className="text-[10px] text-emerald-400">Cash + UPI</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Receipts Issued</span>
            <div className="text-2xl font-extrabold text-indigo-400">
              <AnimatedCounter value={8} />
            </div>
            <span className="text-[10px] text-indigo-400">Digital Acknowledged</span>
          </div>
        </div>

        {/* Sample Scheduled Visit Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Next Priority Visit
            </span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <Clock size={13} />
              Scheduled: 2:30 PM IST
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Suresh Pawar (LON-BAJ-8820009)</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin size={14} className="text-indigo-400" />
              Flat #109, Greenfield Heights, Sector 9, Pune, MH - 411019
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Overdue Balance</span>
              <span className="font-bold text-white">₹47,050</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DPD Bucket</span>
              <span className="font-bold text-rose-400">79 DPD</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Lender</span>
              <span className="font-bold text-slate-300">Bajaj Finance</span>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default FieldAgentPortal;

