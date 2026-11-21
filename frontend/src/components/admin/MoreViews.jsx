import React, { useState } from "react";
import {
  BarChart3,
  PhoneCall,
  Award,
  FileText,
  Megaphone,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Play,
  Volume2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function MoreViews({ activeTab }) {
  const [playingAudio, setPlayingAudio] = useState(null);

  // 1. ANALYTICS & DPD BUCKETS
  if (activeTab === "more_analytics") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Portfolio Analytics &amp; DPD Buckets</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Days Past Due (DPD) migration analysis, liquidation rates, and vintage recovery performance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">0-30 DPD (Early)</span>
            <div className="text-2xl font-bold text-foreground mt-1">₹14.2 Cr</div>
            <div className="text-xs text-emerald-500 font-semibold mt-1">68.4% Roll-forward recovery</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">31-60 DPD (Mid)</span>
            <div className="text-2xl font-bold text-foreground mt-1">₹8.9 Cr</div>
            <div className="text-xs text-blue-500 font-semibold mt-1">42.1% Contact resolution</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">61-90 DPD (Critical)</span>
            <div className="text-2xl font-bold text-foreground mt-1">₹5.3 Cr</div>
            <div className="text-xs text-amber-500 font-semibold mt-1">29.6% PTP fulfillment</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">90+ DPD / Writeoff</span>
            <div className="text-2xl font-bold text-foreground mt-1">₹4.74 Cr</div>
            <div className="text-xs text-rose-500 font-semibold mt-1">18.2% Legal &amp; OTS yield</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="text-sm font-bold text-foreground">DPD Migration Flow Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Algorithmically models delinquency roll-backs against traditional T+30 aging trends
          </p>
          <div className="p-8 rounded-xl bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground">
            Real-time Markov chain transition matrix generated based on 4 Active Portfolios.
          </div>
        </div>
      </div>
    );
  }

  // 2. VOICE TELEPHONY CDR
  if (activeTab === "more_telephony") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Voice Telephony CDR &amp; Audio Vault</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Statutory call recordings, conversational metadata, and sentiment tags
            </p>
          </div>
          <button className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-1.5 border border-border">
            <Download className="w-3.5 h-3.5" />
            <span>Export CDR Audit</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Call ID</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3">Borrower Number</th>
                  <th className="p-3">Disposition</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Recording</th>
                  <th className="p-3">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/40">
                  <td className="p-3 font-mono font-bold text-foreground">CDR-20261118-0912</td>
                  <td className="p-3 font-semibold text-foreground">Manisha Shete</td>
                  <td className="p-3 font-mono text-muted-foreground">xxxxxx6505</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">PTP</span></td>
                  <td className="p-3 font-mono">03:42</td>
                  <td className="p-3">
                    <button
                      onClick={() => setPlayingAudio(playingAudio === "1" ? null : "1")}
                      className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-blue-500 font-bold flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{playingAudio === "1" ? "Pause" : "Play (03:42)"}</span>
                    </button>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono">2026-11-18 10:14:22</td>
                </tr>
                <tr className="hover:bg-muted/40">
                  <td className="p-3 font-mono font-bold text-foreground">CDR-20261118-0913</td>
                  <td className="p-3 font-semibold text-foreground">Priya Talekar</td>
                  <td className="p-3 font-mono text-muted-foreground">xxxxxx2559</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Callback</span></td>
                  <td className="p-3 font-mono">01:15</td>
                  <td className="p-3">
                    <button className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-blue-500 font-bold flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Play (01:15)</span>
                    </button>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono">2026-11-18 11:32:05</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. AUTOMATED INCENTIVES
  if (activeTab === "more_incentives") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Automated Agent Incentives</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent, audited recovery slabs calculating bonus incentives based on atomic ledger transactions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">Standard Recovery Slab</span>
            <div className="text-xl font-bold text-foreground mt-1">1.5% Incentive</div>
            <div className="text-xs text-muted-foreground mt-1">For collections up to 20% bucket target</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">Accelerated Slab</span>
            <div className="text-xl font-bold text-blue-500 mt-1">3.0% Incentive</div>
            <div className="text-xs text-muted-foreground mt-1">For collections exceeding 35% target</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">OTS &amp; Hard Recovery Slab</span>
            <div className="text-xl font-bold text-emerald-500 mt-1">5.0% Incentive</div>
            <div className="text-xs text-muted-foreground mt-1">For full resolution of 90+ DPD writeoffs</div>
          </div>
        </div>
      </div>
    );
  }

  // 4. REGULATORY REPORTS
  if (activeTab === "more_reports") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Regulatory &amp; Statutory Compliance Reports</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              RBI Fair Practices Code audits, permissible call hours compliance, and data privacy exports
            </p>
          </div>
          <button className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Generate Regulatory Audit Pack</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span className="font-semibold text-foreground">Statutory Permissible Hours Adherence (08:00 - 19:00 IST)</span>
              <span className="text-emerald-500 font-bold">100.0% Compliant</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span className="font-semibold text-foreground">Mandatory Call Recording Disclosure Verified</span>
              <span className="text-emerald-500 font-bold">100.0% Compliant</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span className="font-semibold text-foreground">Borrower Dignity &amp; Anti-Harassment Algorithmic Frequency Gate</span>
              <span className="text-emerald-500 font-bold">Active (Max 3 attempts/day)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. CAMPAIGNS
  if (activeTab === "more_campaigns") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Campaign Strategies &amp; Dialers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure automated predictive dialers, voice broadcast drops, and channel allocation routing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h4 className="font-bold text-foreground text-sm">New URBAN BAJAJ-NOV-2026 - PREDICTIVE</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Type: <strong>Predictive Voice Dialer</strong></div>
              <div>Pacing Ratio: <strong>1.4 lines / active agent</strong></div>
              <div>Status: <span className="text-emerald-500 font-bold">Active</span></div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h4 className="font-bold text-foreground text-sm">RURAL-BAJAJ-Nov-2026-FINAL-DATA</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Type: <strong>Progressive Dialer</strong></div>
              <div>Pacing Ratio: <strong>1.0 line / active agent</strong></div>
              <div>Status: <span className="text-emerald-500 font-bold">Active</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. PAYMENT VERIFICATION
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Payment Recovery &amp; Collections Desk</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Atomic verification of bank settlement receipts, UPI transactions, and promissory notes
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
        <div className="font-bold text-sm text-foreground">All Settlements Atomically Audited</div>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Every recovered payment is reconciled in database transactions with automated receipt distribution.
        </p>
      </div>
    </div>
  );
}
