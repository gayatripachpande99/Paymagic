import React, { useState } from "react";
import {
  MapPin,
  Plus,
  RefreshCw,
  Radio,
  Building2,
  Calendar,
  IndianRupee,
  Search,
  ExternalLink,
  Receipt,
  Compass,
  CheckCircle2
} from "lucide-react";

export default function FieldRecoveryVisitsPage({
  setShowScheduleVisitModal,
  loadFieldVisits = () => {},
  loadFieldOverview = () => {},
  loadCashHandovers = () => {},
  fieldOverviewData,
  fieldVisitsList = [],
  fieldVisitsLoading = false,
  cashHandoversList = [],
  cashHandoversLoading = false,
  setSelectedReceiptRef,
  setShowDigitalReceiptModal,
  handleReconcileCash = () => {}
}) {
  const [fieldSubTab, setFieldSubTab] = useState("visits");
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");
  const [fieldFilterStatus, setFieldFilterStatus] = useState("ALL");
  const [fieldFilterZone, setFieldFilterZone] = useState("ALL");

  return (
    <div className="portal-tab-content">
      {/* Top Operations Header */}
      <div className="portal-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                  Field Recovery Operations Hub
                </h3>
                <span className="badge badge-success" style={{ fontSize: "10px", padding: "2px 8px" }}>
                  MODULE E ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowScheduleVisitModal(true)}
              className="primary-btn"
              style={{ padding: "8px 18px", fontSize: "12px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Schedule Field Visit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loadFieldVisits();
                loadFieldOverview();
                loadCashHandovers();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Operations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Operations Sub-Tabs Navigation */}
        <div style={{ display: "flex", gap: "8px", marginTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFieldSubTab("visits")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              fieldSubTab === "visits"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Scheduled &amp; Logged Visits ({fieldVisitsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFieldSubTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              fieldSubTab === "overview"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Ground Radar &amp; Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setFieldSubTab("handovers")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              fieldSubTab === "handovers"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Cash Handover Desk ({cashHandoversList.filter((h) => h.status === "PENDING_RECONCILIATION").length} Pending)</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="portal-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="portal-stat-card">
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <MapPin className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Field Cases</span>
            <h3 className="stat-value">{fieldOverviewData?.total_field_cases || fieldVisitsList.length}</h3>
            <span className="stat-badge neutral">Assigned on Ground</span>
          </div>
        </div>

        <div className="portal-stat-card">
          <div className="stat-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Scheduled Today</span>
            <h3 className="stat-value">{fieldOverviewData?.today_scheduled_visits || 4}</h3>
            <span className="stat-badge positive">{fieldOverviewData?.today_completed_visits || 3} Concluded</span>
          </div>
        </div>

        <div className="portal-stat-card">
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Spot Recoveries</span>
            <h3 className="stat-value">
              ₹{(fieldOverviewData?.total_spot_collections || fieldVisitsList.reduce((acc, v) => acc + Number(v.collected_amount || 0), 0)).toLocaleString("en-IN")}
            </h3>
            <span className="stat-badge positive">UPI + Cash + Cheque</span>
          </div>
        </div>

        <div className="portal-stat-card">
          <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
            <Building2 className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Cash-in-Hand Balance</span>
            <h3 className="stat-value">
              ₹{(fieldOverviewData?.cash_in_hand_total || 0).toLocaleString("en-IN")}
            </h3>
            <span className="stat-badge neutral">
              {fieldOverviewData?.pending_handovers_count || 1} Slip Pending
            </span>
          </div>
        </div>
      </div>

      {/* ── SUB-TAB 1: SCHEDULED & LOGGED FIELD VISITS ── */}
      {fieldSubTab === "visits" && (
        <div className="portal-card">
          {/* Filters toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center flex-wrap gap-3 mb-4">
            <div className="search-box flex-1 min-w-[200px]">
              <Search className="search-icon w-4 h-4" />
              <input
                type="text"
                placeholder="Search borrower name, loan account #, address, receipt..."
                value={fieldSearchTerm}
                onChange={(e) => setFieldSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={fieldFilterStatus}
                onChange={(e) => setFieldFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses (3)</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <select
                value={fieldFilterZone}
                onChange={(e) => setFieldFilterZone(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs flex-1 sm:flex-initial focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Zones</option>
                <option value="pune metro">Pune Metro</option>
                <option value="pune east">Pune East</option>
                <option value="hadapsar">Hadapsar</option>
                <option value="kothrud">Kothrud</option>
                <option value="viman nagar">Viman Nagar</option>
                <option value="pimpri chinchwad">Pimpri Chinchwad</option>
                <option value="mumbai suburbs">Mumbai Suburbs</option>
              </select>
            </div>
          </div>

          <div className="portal-table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Agent &amp; ID</th>
                  <th>Borrower &amp; Loan Acc</th>
                  <th>Physical Address &amp; Zone</th>
                  <th>Timing &amp; Slot</th>
                  <th>Outcome &amp; Observation</th>
                  <th>Statutory GPS Audit</th>
                  <th>Spot Collection</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fieldVisitsLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                      Loading field recovery visits...
                    </td>
                  </tr>
                ) : (
                  fieldVisitsList
                    .filter((v) => {
                      const matchesStatus = fieldFilterStatus === "ALL" ? true : v.status === fieldFilterStatus;
                      const matchesZone = fieldFilterZone === "ALL" ? true : v.geographic_zone?.toLowerCase() === fieldFilterZone.toLowerCase();
                      const term = fieldSearchTerm.toLowerCase();
                      const matchesSearch =
                        !term ||
                        v.customer_name?.toLowerCase().includes(term) ||
                        v.loan_account_no?.toLowerCase().includes(term) ||
                        v.customer_address?.toLowerCase().includes(term) ||
                        v.agent_name?.toLowerCase().includes(term) ||
                        v.receipt_ref?.toLowerCase().includes(term);
                      return matchesStatus && matchesZone && matchesSearch;
                    })
                    .map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div className="font-bold text-white text-xs">{v.agent_name || "Vikram Singh"}</div>
                          <span className="text-[11px] text-slate-400 font-mono">{v.agent_employee_id || "PM-FLD-0001"}</span>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{v.id}</div>
                        </td>
                        <td>
                          <div className="font-bold text-white text-xs">{v.customer_name || "Borrower"}</div>
                          <span className="text-[11px] text-indigo-400 font-mono">{v.loan_account_no}</span>
                          <div className="text-[10px] text-slate-400">Due: ₹{Number(v.outstanding_amount || 0).toLocaleString("en-IN")}</div>
                        </td>
                        <td className="text-xs text-slate-300 max-w-xs">
                          <div className="truncate">{v.customer_address || "Pune Metro, Maharashtra"}</div>
                          <span className="text-[10px] text-purple-400 font-semibold">{v.geographic_zone || "Pune Central"}</span>
                        </td>
                        <td>
                          <div className="font-mono text-xs text-white">
                            {v.time_slot || "11:00 - 02:00 PM"}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {v.duration_minutes ? `${v.duration_minutes} mins on-site` : v.status}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            v.visit_outcome?.includes("Paid") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            v.visit_outcome?.includes("Promise") ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {v.visit_outcome || "Scheduled Route"}
                          </span>
                          {v.promise_date && (
                            <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                              PTP: {v.promise_date} (₹{Number(v.promise_amount || 0).toLocaleString("en-IN")})
                            </div>
                          )}
                          {v.notice_served && (
                            <span className="text-[9px] text-emerald-400 block font-semibold">✓ Demand Notice Served</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                            <span>📍 {v.gps_latitude?.toFixed ? v.gps_latitude.toFixed(4) : v.gps_latitude}° N, {v.gps_longitude?.toFixed ? v.gps_longitude.toFixed(4) : v.gps_longitude}° E</span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${v.gps_latitude},${v.gps_longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>Open Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td>
                          <div className="font-mono font-bold text-sm text-emerald-400">
                            ₹{Number(v.collected_amount || 0).toLocaleString("en-IN")}
                          </div>
                          {v.receipt_ref ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceiptRef(v.receipt_ref);
                                setShowDigitalReceiptModal(true);
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline flex items-center gap-0.5 mt-0.5"
                            >
                              <Receipt className="w-2.5 h-2.5" />
                              <span>{v.receipt_ref}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 block">Pending Spot Settlement</span>
                          )}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                            v.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" :
                            "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: GROUND RADAR & OPERATIONS ANALYTICS ── */}
      {fieldSubTab === "overview" && (
        <div className="space-y-6">
          {/* Active Agents on Ground Grid */}
          <div className="portal-card">
            <div className="card-header">
              <div className="header-left">
                <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h4>Active Ground Enforcement Agents</h4>
              </div>
              <span className="badge badge-success">
                {(fieldOverviewData?.agents_on_ground || []).length} Agents On Duty
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {(fieldOverviewData?.agents_on_ground || [
                { id: "usr_field_1", name: "Vikram Singh", employee_id: "PM-FLD-0001", status: "ON_VISIT", total_visits: 7, completed_visits: 4, total_collected: 23500 }
              ]).map((ag) => (
                <div key={ag.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{ag.name}</h4>
                      <span className="font-mono text-[11px] text-slate-400">{ag.employee_id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ag.status === "ON_VISIT" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {ag.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stops Assigned:</span>
                      <span className="font-bold text-white">{ag.total_visits} Stops</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Spot Collected:</span>
                      <span className="font-mono font-bold text-emerald-400">₹{Number(ag.total_collected || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>Assigned Zone: <strong>Pune Metro &bull; Western Hub</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Territory Clusters & Outcomes Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Zones */}
            <div className="portal-card">
              <div className="card-header">
                <div className="header-left">
                  <Compass className="w-5 h-5 text-purple-400" />
                  <h4>Territory Zone Clusters</h4>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(fieldOverviewData?.zone_distribution || {
                  "Pune Metro": 3,
                  "Pune East": 1,
                  "Hadapsar": 1,
                  "Kothrud": 1,
                  "Viman Nagar": 1,
                  "Pimpri Chinchwad": 1,
                  "Mumbai Suburbs": 1
                }).map(([zoneName, count]) => (
                  <div key={zoneName} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="font-bold text-white">{zoneName}</span>
                    </div>
                    <span className="font-mono text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {count} Case(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes Breakdown */}
            <div className="portal-card">
              <div className="card-header">
                <div className="header-left">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4>Ground Interaction Outcomes</h4>
                </div>
              </div>
              <div className="p-4 space-y-3 text-xs">
                {Object.entries(fieldOverviewData?.outcomes_breakdown || {
                  "Customer Met & Paid": 2,
                  "Promise to Pay": 1,
                  "Premises Locked / Not Available": 1,
                  "Disputed Dues": 0,
                  "Address Untraceable / Shifted": 0,
                  "Third Party Contacted": 0,
                  "Refused to Pay": 0
                }).map(([outcomeLabel, count]) => (
                  <div key={outcomeLabel} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{outcomeLabel}</span>
                      <span className="font-mono font-bold text-white">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, (count / Math.max(1, fieldVisitsList.length)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: CASH HANDOVER & RECONCILIATION DESK ── */}
      {fieldSubTab === "handovers" && (
        <div className="portal-card">
          <div className="card-header">
            <div className="header-left">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h4>Field Agent Cash Handovers &amp; Reconciliation Desk</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-warning">
                {cashHandoversList.filter((h) => h.status === "PENDING_RECONCILIATION").length} Pending Branch Verification
              </span>
              <button
                type="button"
                onClick={loadCashHandovers}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Refresh Handovers"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="portal-table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Handover Ref</th>
                  <th>Field Agent</th>
                  <th>Deposit Branch</th>
                  <th>Deposit Slip #</th>
                  <th>Amount (₹)</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Supervisor Action</th>
                </tr>
              </thead>
              <tbody>
                {cashHandoversLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                      Loading cash handovers ledger...
                    </td>
                  </tr>
                ) : cashHandoversList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      No cash handover records found.
                    </td>
                  </tr>
                ) : (
                  cashHandoversList.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <span className="font-mono font-bold text-xs text-indigo-400">{h.handover_ref || h.id}</span>
                      </td>
                      <td>
                        <div className="font-bold text-white text-xs">{h.agent_name || "Vikram Singh"}</div>
                        <span className="text-[11px] text-slate-400 font-mono">{h.agent_employee_id || "PM-FLD-0001"}</span>
                      </td>
                      <td className="text-xs text-slate-300">{h.branch_name || "Pune FC Road Branch"}</td>
                      <td>
                        <span className="font-mono text-xs text-amber-300">{h.deposit_slip_ref || "SLIP-99104"}</span>
                      </td>
                      <td>
                        <div className="font-mono font-bold text-sm text-emerald-400">
                          ₹{Number(h.amount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="text-xs text-slate-400 font-mono">
                        {new Date(h.submitted_at).toLocaleDateString("en-IN")} {new Date(h.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === "RECONCILED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          h.status === "REJECTED" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                          "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td>
                        {h.status === "PENDING_RECONCILIATION" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReconcileCash(h.id, "RECONCILED")}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                            >
                              Approve &amp; Reconcile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReconcileCash(h.id, "REJECTED")}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {h.supervisor_remarks || `Reconciled by ${h.reconciled_by || 'Supervisor'}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
