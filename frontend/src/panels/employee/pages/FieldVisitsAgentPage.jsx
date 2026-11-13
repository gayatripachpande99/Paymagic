import React from "react";
import { Compass, Building2, Plus, Navigation, MapPin, Receipt } from "lucide-react";

const defaultFormatTime = (isoString) => {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

export default function FieldVisitsAgentPage({
  myRouteData,
  setShowCashHandoverModal,
  myCases = [],
  setFieldVisitCase,
  setShowFieldVisitModal,
  setErrorMsg,
  fieldVisits = [],
  fieldVisitsLoading = false,
  formatTime = defaultFormatTime,
  setSelectedReceiptRef,
  setShowReceiptModal
}) {
  return (
    <div className="portal-tab-content">
      {/* Field Agent Daily Operations Banner */}
      <div className="portal-card mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-white text-base">Field Enforcement Itinerary &amp; Route</h4>
                <span className="badge badge-success text-[10px]">ZONE: PUNE METRO</span>
              </div>
              <p className="text-xs text-slate-400">
                Sequential ground route, statutory GPS check-in, dynamic UPI spot collections &amp; cash reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cash In Hand Ticker */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-tight">Cash In Hand</span>
                <span className="font-mono font-bold text-xs text-emerald-400">
                  ₹{Number(myRouteData?.agent?.cash_in_hand || 8500).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCashHandoverModal(true)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Deposit Cash</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (myCases.length > 0) {
                  setFieldVisitCase(myCases[0]);
                  setShowFieldVisitModal(true);
                } else if (setErrorMsg) {
                  setErrorMsg("No assigned cases available to initiate a visit.");
                }
              }}
              className="primary-btn"
              style={{ padding: "8px 16px", fontSize: "12px", background: "linear-gradient(135deg, #d97706, #b45309)" }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Route Stops Queue (Module E) */}
      <div className="portal-card mb-6">
        <div className="card-header">
          <div className="header-left">
            <Navigation className="w-5 h-5 text-indigo-400" />
            <h4>Today's Sequential Route Stops ({myRouteData?.route?.stops?.length || 4} Stops)</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {myRouteData?.route?.completed_stops || 2} of {myRouteData?.route?.total_stops || 4} Stops Completed
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(myRouteData?.route?.stops || [
            {
              stop_number: 1,
              customer_name: "Meera Salunkhe",
              customer_phone: "+91 98220 11990",
              customer_address: "Flat 204, Ganga Satellite, Wanowrie, Pune",
              loan_account_no: "LON-HDF-8820009",
              lender_name: "HDFC Bank",
              outstanding_amount: 34500,
              time_slot: "08:00 - 11:00 AM",
              priority: "HIGH",
              status: "COMPLETED",
              visit_outcome: "Customer Met & Paid",
              collected_amount: 15000,
              receipt_ref: "RCP-FLD-901142",
              google_maps_directions_url: "https://www.google.com/maps/search/?api=1&query=Wanowrie+Pune"
            },
            {
              stop_number: 2,
              customer_name: "Suresh Pawar",
              customer_phone: "+91 98900 44221",
              customer_address: "Shop 12, Commercial Complex, Hadapsar, Pune",
              loan_account_no: "LON-BAJ-8820012",
              lender_name: "Bajaj Finance",
              outstanding_amount: 47050,
              time_slot: "11:00 - 02:00 PM",
              priority: "URGENT",
              status: "IN_PROGRESS",
              visit_outcome: null,
              collected_amount: 0,
              google_maps_directions_url: "https://www.google.com/maps/search/?api=1&query=Hadapsar+Pune"
            },
            {
              stop_number: 3,
              customer_name: "Anand Deshmukh",
              customer_phone: "+91 98110 33445",
              customer_address: "Row House #8, Kothrud Depot Road, Pune",
              loan_account_no: "LON-ICI-8820018",
              lender_name: "ICICI Bank",
              outstanding_amount: 62000,
              time_slot: "02:00 - 05:00 PM",
              priority: "HIGH",
              status: "SCHEDULED",
              visit_outcome: null,
              collected_amount: 0,
              google_maps_directions_url: "https://www.google.com/maps/search/?api=1&query=Kothrud+Pune"
            },
            {
              stop_number: 4,
              customer_name: "Pooja Shinde",
              customer_phone: "+91 98770 55667",
              customer_address: "Building B, Viman Nagar Central, Pune",
              loan_account_no: "LON-TAT-8820021",
              lender_name: "Tata Capital",
              outstanding_amount: 28900,
              time_slot: "05:00 - 07:00 PM",
              priority: "NORMAL",
              status: "SCHEDULED",
              visit_outcome: null,
              collected_amount: 0,
              google_maps_directions_url: "https://www.google.com/maps/search/?api=1&query=Viman+Nagar+Pune"
            }
          ]).map((stop) => (
            <div
              key={stop.stop_number}
              className={`p-4 rounded-2xl border transition ${
                stop.status === "IN_PROGRESS"
                  ? "bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/10"
                  : stop.status === "COMPLETED"
                  ? "bg-slate-950/40 border-slate-800 opacity-80"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                    #{stop.stop_number}
                  </span>
                  <h4 className="font-bold text-white text-sm">{stop.customer_name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  stop.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" :
                  stop.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                  "bg-indigo-500/20 text-indigo-400"
                }`}>
                  {stop.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 flex items-start gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{stop.customer_address}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/60 rounded-xl text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Due Balance:</span>
                  <span className="font-mono font-bold text-rose-400">₹{Number(stop.outstanding_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Time Window:</span>
                  <span className="font-mono text-white text-[11px]">{stop.time_slot}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={stop.google_maps_directions_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.customer_address || "Pune")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Navigation className="w-3 h-3 text-indigo-400" />
                  <span>Navigate</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const matchedCase = myCases.find((c) => c.loan_account_no === stop.loan_account_no || c.customer_name === stop.customer_name);
                    setFieldVisitCase(matchedCase || {
                      id: stop.case_id || "case_0009",
                      customer_name: stop.customer_name,
                      loan_account_no: stop.loan_account_no,
                      outstanding_amount: stop.outstanding_amount,
                      customer: { full_name: stop.customer_name, address: stop.customer_address, phone: stop.customer_phone }
                    });
                    setShowFieldVisitModal(true);
                  }}
                  className={`w-1/2 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                    stop.status === "COMPLETED"
                      ? "bg-slate-800 text-slate-400 hover:text-white"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{stop.status === "COMPLETED" ? "View Audit" : "Check In / Visit"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Visits Log Table */}
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h4>Authorized Field Visits &amp; Geolocation Log ({fieldVisits.length})</h4>
          </div>
        </div>

        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Borrower &amp; Loan Acc</th>
                <th>Physical Location</th>
                <th>Timing &amp; Duration</th>
                <th>Visit Outcome</th>
                <th>GPS Coordinates</th>
                <th>Amount Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fieldVisitsLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                    Loading field visits log...
                  </td>
                </tr>
              ) : fieldVisits.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No field visits recorded yet. Click &quot;New Field Visit&quot; or initiate from your assigned route stops.
                  </td>
                </tr>
              ) : (
                fieldVisits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="font-bold text-white text-xs">{v.customer_name || "Borrower"}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{v.loan_account_no}</span>
                    </td>
                    <td className="text-xs text-slate-300 max-w-xs truncate">
                      {v.customer_address || "Pune Metro, Maharashtra"}
                    </td>
                    <td>
                      <div className="font-mono text-xs text-white">
                        {formatTime(v.visit_start)} {v.visit_end ? `→ ${formatTime(v.visit_end)}` : "(Active)"}
                      </div>
                      <span className="text-[10px] text-indigo-400 font-semibold">
                        {v.duration_minutes ? `${v.duration_minutes} mins` : "In Progress"}
                      </span>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {v.visit_outcome || "In Progress"}
                      </span>
                      {v.visit_notes && (
                        <p className="text-[10px] text-slate-400 max-w-xs truncate mt-0.5">{v.visit_notes}</p>
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
                        <span>View Map</span>
                        <Navigation className="w-2.5 h-2.5" />
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
                            setShowReceiptModal(true);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline flex items-center gap-0.5 mt-0.5"
                        >
                          <Receipt className="w-2.5 h-2.5" />
                          <span>{v.receipt_ref}</span>
                        </button>
                      ) : null}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
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
    </div>
  );
}
