import React, { useState, useEffect } from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import PerformanceDashboard from "../../components/portal/PerformanceDashboard";
import CaseDetailModal from "../../components/portal/CaseDetailModal";
import AnimatedCounter from "../../components/common/AnimatedCounter";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  Scale,
  BarChart3,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  ArrowRightLeft
} from "lucide-react";

export const SupervisorPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboard, setLeaderboard] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailCaseId, setDetailCaseId] = useState(null);

  // Transfer modal / form state
  const [transferCaseId, setTransferCaseId] = useState("");
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [transferMsg, setTransferMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lbRes, teamRes, casesRes] = await Promise.all([
        api.get("/dashboard/leaderboard"),
        api.get("/dashboard/team"),
        api.get("/cases?limit=50")
      ]);

      if (lbRes.success && lbRes.data) {
        setLeaderboard(lbRes.data.leaderboard || []);
      }
      if (teamRes.success && teamRes.data) {
        setTeamStats(teamRes.data);
      }
      if (casesRes.success && casesRes.data) {
        setCases(casesRes.data.cases || []);
      }
    } catch (err) {
      console.error("Failed to load supervisor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferCaseId || !targetEmployeeId) return;

    try {
      const res = await api.post("/cases/transfer", {
        caseId: transferCaseId,
        toEmployeeId: targetEmployeeId,
        reason: transferReason || "Workload rebalance by supervisor"
      });

      if (res.success) {
        setTransferMsg("Case successfully transferred to new officer!");
        setTransferCaseId("");
        setTransferReason("");
        await fetchData();
      }
    } catch (err) {
      setTransferMsg(err.message || "Failed to transfer case.");
    }
  };

  return (
    <PortalLayout
      title="Supervisor Quality & Team Operations Hub"
      subtitle="Team workload monitoring, case transfers, dispute investigation, and shift approval."
    >
      <div className="space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Supervised Staff</span>
              <Users size={18} className="text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              <AnimatedCounter value={leaderboard.length || 6} />
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">All Checked In Today</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Team Recovery Total</span>
              <Award size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              <AnimatedCounter
                prefix="₹"
                value={teamStats?.summary?.total_recovered ?? 812000}
              />
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">
              {teamStats?.summary?.target_achievement ?? 81.2}% of Team Target
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Connected Calls</span>
              <PhoneCall size={18} className="text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              <AnimatedCounter value={teamStats?.summary?.connected_calls ?? 348} />
            </div>
            <div className="text-xs text-slate-400 mt-2">Avg Connection: 76.2%</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Disputes</span>
              <Scale size={18} className="text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400">
              <AnimatedCounter value={2} />
            </div>
            <div className="text-xs text-slate-400 mt-2">Under Supervisor Review</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "leaderboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Team Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("transfer")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "transfer"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Case Transfer & Re-allocation
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "performance"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Analytics & Quality Trends
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Telecaller & Field Recovery Rankings</h3>
              <button
                onClick={fetchData}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Department / Role</th>
                    <th className="py-3 px-4">Total Calls</th>
                    <th className="py-3 px-4">Conn. Rate</th>
                    <th className="py-3 px-4">Recovered (₹)</th>
                    <th className="py-3 px-4">Target Progress</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leaderboard.map((agent, i) => (
                    <tr key={agent.id || i} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                            i === 0
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : i === 1
                              ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                              : i === 2
                              ? "bg-amber-700/20 text-amber-600 border border-amber-700/40"
                              : "text-slate-400"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{agent.full_name || agent.name}</div>
                        <div className="text-[10px] text-slate-500">{agent.employee_id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {agent.role?.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-4">{agent.total_calls ?? agent.calls ?? 0}</td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-400">
                        {agent.call_connection_rate ?? agent.rate ?? "74.4%"}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        ₹{agent.amount_recovered?.toLocaleString("en-IN") ?? agent.recovery}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {agent.target_achievement ?? 85}% of ₹
                        {agent.assigned_target?.toLocaleString("en-IN") ?? agent.target}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          Active Shift
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSFER & RE-ALLOCATION */}
        {activeTab === "transfer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-2">Re-allocate Case</h3>
              <p className="text-xs text-slate-400 mb-6">
                Reassign a loan recovery case between telecallers or escalate to field enforcement.
              </p>

              {transferMsg && (
                <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs">
                  {transferMsg}
                </div>
              )}

              <form onSubmit={handleTransfer} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Select Loan Case *
                  </label>
                  <select
                    required
                    value={transferCaseId}
                    onChange={(e) => setTransferCaseId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Case --</option>
                    {cases.slice(0, 30).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.case_number} - {c.lender_name} (₹
                        {c.outstanding_amount?.toLocaleString("en-IN")}) - {c.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Assign To Officer *
                  </label>
                  <select
                    required
                    value={targetEmployeeId}
                    onChange={(e) => setTargetEmployeeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Officer --</option>
                    <option value="usr_caller_1">Rahul Sharma (Telecaller - Pune East)</option>
                    <option value="usr_caller_2">Priya Patel (Telecaller - Pune West)</option>
                    <option value="usr_field_1">Vikram Singh (Field Agent - Mumbai)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Transfer Reason / Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Workload rebalance, language specialization, or field visit escalation..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft size={15} />
                  <span>Execute Transfer & Log Audit</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Active Cases Overview</h3>
              <div className="space-y-2.5">
                {cases.slice(0, 8).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{c.case_number}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.lender_name} • ₹{c.outstanding_amount?.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {c.status}
                      </span>
                      <button
                        onClick={() => setDetailCaseId(c.id)}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERFORMANCE ANALYTICS */}
        {activeTab === "performance" && <PerformanceDashboard />}
      </div>

      {detailCaseId && (
        <CaseDetailModal caseId={detailCaseId} onClose={() => setDetailCaseId(null)} />
      )}
    </PortalLayout>
  );
};

export default SupervisorPortal;
