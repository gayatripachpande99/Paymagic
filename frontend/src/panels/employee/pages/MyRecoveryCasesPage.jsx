import React from "react";
import { Search, Layers, PhoneCall, MapPin } from "lucide-react";

export default function MyRecoveryCasesPage({
  caseSearchTerm = "",
  setCaseSearchTerm,
  caseFilterStatus = "ALL",
  setCaseFilterStatus,
  CASE_STATUSES = [],
  STATUS_PILL_CLASSES = {},
  filteredCases = [],
  casesLoading = false,
  setCallingCase,
  setShowCallingModal,
  setPaymentCase,
  setShowPaymentModal,
  setFieldVisitCase,
  setShowFieldVisitModal,
  setTimelineCaseId,
  setShowTimelineModal
}) {
  return (
    <div className="portal-tab-content">
      {/* Filter toolbar */}
      <div className="portal-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="search-box" style={{ flex: "1 1 240px", minWidth: "200px" }}>
            <Search className="search-icon w-4 h-4" />
            <input
              type="text"
              placeholder="Search customer name, account, loan case #..."
              value={caseSearchTerm}
              onChange={(e) => setCaseSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={caseFilterStatus}
              onChange={(e) => setCaseFilterStatus(e.target.value)}
              style={{ padding: "7px 10px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "8px", color: "white", fontSize: "12px" }}
            >
              <option value="ALL">All Statuses (10)</option>
              {CASE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h4>My Assigned Recovery Cases ({filteredCases.length})</h4>
          </div>
          <span className="badge badge-info">Direct Portfolio Assignment</span>
        </div>

        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Case #</th>
                <th>Borrower Details</th>
                <th>Lending Partner</th>
                <th>Outstanding (₹)</th>
                <th>DPD &amp; Priority</th>
                <th>Current Status</th>
                <th>Follow-up Due</th>
                <th>Operations Actions</th>
              </tr>
            </thead>
            <tbody>
              {casesLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                    Loading assigned loan cases...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No assigned cases match criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="font-mono font-bold text-indigo-400 text-xs">
                        {item.case_number}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-white text-xs">{item.customer_name || "Borrower"}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.phone_masked || item.phone || "+91 98*** 12345"}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs text-slate-200">{item.lender_name}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{item.loan_account_no}</span>
                    </td>
                    <td className="font-mono text-amber-400 font-bold text-sm">
                      ₹{Number(item.outstanding_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-rose-400 font-mono font-semibold">{item.dpd} DPD</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.priority === "CRITICAL" ? "bg-rose-500/20 text-rose-400" :
                          item.priority === "HIGH" ? "bg-amber-500/20 text-amber-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        STATUS_PILL_CLASSES[item.status] || "bg-slate-500/10 text-slate-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-300 font-mono">
                      {item.follow_up_date || "Today"}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {/* Green Call Customer Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCallingCase(item);
                            setShowCallingModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition transform active:scale-95"
                          title="Click to Call Customer with Auto Recording"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        {/* Record Payment Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentCase(item);
                            setShowPaymentModal(true);
                          }}
                          className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                          title="Record Recovery Payment"
                        >
                          +Pay
                        </button>

                        {/* Field Visit Button (Module D) */}
                        <button
                          type="button"
                          onClick={() => {
                            setFieldVisitCase(item);
                            setShowFieldVisitModal(true);
                          }}
                          className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                          title="Authorized On-Site Field Recovery Visit with GPS Notice"
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Visit</span>
                        </button>

                        {/* View Details & Status Timeline */}
                        <button
                          type="button"
                          onClick={() => {
                            setTimelineCaseId(item.id);
                            setShowTimelineModal(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                          title="View Status History & Timeline"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
