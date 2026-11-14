import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  ArrowRightLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  PhoneCall,
  IndianRupee,
  History,
  UserCheck,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

const STATUS_COLORS = {
  New: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Contacted: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Promise to Pay": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Partially Paid": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Fully Paid": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Disputed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Not Reachable": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Field Visit": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Closed: "bg-green-500/10 text-green-400 border-green-500/20",
};

const PRIORITY_COLORS = {
  LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CRITICAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const ALL_STATUSES = [
  "New",
  "Assigned",
  "Contacted",
  "Promise to Pay",
  "Partially Paid",
  "Fully Paid",
  "Disputed",
  "Not Reachable",
  "Field Visit",
  "Closed",
];

const formatCurrency = (val) => {
  if (val == null) return "₹0";
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

const maskPhone = (phone) => {
  if (!phone) return "N/A";
  const str = String(phone);
  if (str.length <= 4) return str;
  return str.slice(0, 2) + "****" + str.slice(-4);
};

export const CaseDetailModal = ({ caseId, isOpen, onClose, onUpdate }) => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("details");

  // Status change form
  const [newStatus, setNewStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [statusChanging, setStatusChanging] = useState(false);

  // Assign/Transfer
  const [assigneeId, setAssigneeId] = useState("");
  const [transferToId, setTransferToId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && caseId) {
      fetchCaseDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, caseId]);

  const fetchCaseDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/cases/${caseId}`);
      if (res.success) {
        setCaseData(res.data || res.case || res);
      } else {
        setError(res.message || "Failed to load case details");
      }
    } catch (err) {
      setError(err.message || "Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    if (["Disputed", "Closed", "Not Reachable"].includes(newStatus) && (!statusRemarks || statusRemarks.trim().length < 3)) {
      setError(`Remarks are mandatory for '${newStatus}' status (minimum 3 characters).`);
      return;
    }
    setStatusChanging(true);
    try {
      const res = await api.patch(`/cases/${caseId}/status`, {
        newStatus,
        remarks: statusRemarks,
      });
      if (res.success) {
        await fetchCaseDetail();
        setNewStatus("");
        setStatusRemarks("");
        onUpdate?.();
      }
    } catch (err) {
      console.error("Status change failed:", err);
    } finally {
      setStatusChanging(false);
    }
  };

  const handleAssign = async () => {
    if (!assigneeId) return;
    setAssigning(true);
    try {
      const res = await api.post("/cases/assign", {
        caseId,
        employeeId: assigneeId,
      });
      if (res.success) {
        await fetchCaseDetail();
        setAssigneeId("");
        onUpdate?.();
      }
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferToId) return;
    setAssigning(true);
    try {
      const res = await api.post("/cases/transfer", {
        caseId,
        fromEmployeeId: caseData?.assignedTo?.id || caseData?.assignedTo,
        toEmployeeId: transferToId,
      });
      if (res.success) {
        await fetchCaseDetail();
        setTransferToId("");
        onUpdate?.();
      }
    } catch (err) {
      console.error("Transfer failed:", err);
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  const customer = caseData?.customer || caseData?.customerDetails || {};
  const statusHistory = caseData?.statusHistory || [];
  const calls = caseData?.calls || [];
  const payments = caseData?.payments || [];
  const currentStatus = caseData?.status || "New";
  const priority = caseData?.priority || "MEDIUM";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-slate-800 gap-3 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <FileText size={20} className="text-indigo-400 shrink-0" />
              <span>Case #{caseData?.caseNumber || caseData?.case_number || caseId}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {customer?.name || "Loading..."} &middot;{" "}
              {caseData?.lenderName || caseData?.lender || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                STATUS_COLORS[currentStatus] || STATUS_COLORS["New"]
              }`}
            >
              {currentStatus}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                PRIORITY_COLORS[priority] || PRIORITY_COLORS["MEDIUM"]
              }`}
            >
              {priority}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors ml-auto sm:ml-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && caseData && (
          <>
            {/* Section Tabs */}
            <div className="flex gap-1 px-4 sm:px-6 pt-3 sm:pt-4 border-b border-slate-800 overflow-x-auto scrollbar-thin shrink-0">
              {[
                { id: "details", label: "Details" },
                { id: "timeline", label: "Status Timeline" },
                { id: "calls", label: `Calls (${calls.length})` },
                { id: "payments", label: `Payments (${payments.length})` },
                { id: "actions", label: "Actions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                    activeSection === tab.id
                      ? "bg-slate-900 text-white border-t border-x border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {/* Details Section */}
              {activeSection === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <User size={16} className="text-indigo-400" />
                      Customer Information
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name</span>
                        <span className="text-white font-medium">
                          {customer?.name || customer?.fullName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone</span>
                        <span className="text-white font-medium">
                          {maskPhone(
                            customer?.phone || customer?.mobileNumber
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Address</span>
                        <span className="text-white font-medium text-right max-w-[200px]">
                          {customer?.address || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">City</span>
                        <span className="text-white font-medium">
                          {customer?.city || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">State</span>
                        <span className="text-white font-medium">
                          {customer?.state || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <CreditCard size={16} className="text-emerald-400" />
                      Loan Details
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lender</span>
                        <span className="text-white font-medium">
                          {caseData?.lenderName || caseData?.lender || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account No.</span>
                        <span className="text-white font-medium">
                          {caseData?.accountNumber ||
                            caseData?.loanAccountNumber ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Loan Type</span>
                        <span className="text-white font-medium">
                          {caseData?.loanType || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Principal</span>
                        <span className="text-white font-bold">
                          {formatCurrency(
                            caseData?.principalAmount ||
                              caseData?.totalDueAmount
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Outstanding</span>
                        <span className="text-rose-400 font-bold">
                          {formatCurrency(caseData?.outstandingAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">DPD</span>
                        <span className="text-amber-400 font-bold">
                          {caseData?.dpd ?? caseData?.daysOverdue ?? "—"} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned To</span>
                        <span className="text-indigo-400 font-medium">
                          {caseData?.assignedTo?.fullName ||
                            caseData?.assignedEmployee ||
                            "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              {activeSection === "timeline" && (
                <div className="relative pl-8">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 via-slate-700 to-slate-800" />

                  {statusHistory.length === 0 && (
                    <p className="text-xs text-slate-500 py-4">
                      No status history available.
                    </p>
                  )}

                  {statusHistory.map((entry, idx) => {
                    const statusColor =
                      STATUS_COLORS[entry.status] || STATUS_COLORS["New"];
                    return (
                      <div key={idx} className="relative mb-6 last:mb-0">
                        {/* Dot */}
                        <div
                          className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 ${
                            idx === 0
                              ? "bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/30"
                              : "bg-slate-800 border-slate-600"
                          }`}
                        />

                        <div className="glass-panel p-4 rounded-xl border border-slate-800 ml-2">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColor}`}
                            >
                              {entry.status || entry.newStatus || "—"}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {entry.createdAt || entry.changedAt
                                ? new Date(
                                    entry.createdAt || entry.changedAt
                                  ).toLocaleString("en-IN")
                                : "—"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300">
                            {entry.remarks || "No remarks"}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <UserCheck size={10} />
                            {entry.changedBy?.fullName ||
                              entry.employeeName ||
                              "System"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calls Section */}
              {activeSection === "calls" && (
                <div>
                  {calls.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">
                      No call records for this case.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Agent</th>
                            <th className="py-3 px-4">Duration</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Outcome</th>
                            <th className="py-3 px-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {calls.map((call, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-3 px-4">
                                {call.callDate || call.createdAt
                                  ? new Date(
                                      call.callDate || call.createdAt
                                    ).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td className="py-3 px-4 text-white font-medium">
                                {call.agent?.fullName ||
                                  call.employeeName ||
                                  "—"}
                              </td>
                              <td className="py-3 px-4">
                                {call.duration || "—"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${
                                    call.callStatus === "answered"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : call.callStatus === "busy"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : call.callStatus === "rejected"
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                  }`}
                                >
                                  {call.callStatus || "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {call.callOutcome || "—"}
                              </td>
                              <td className="py-3 px-4 max-w-[200px] truncate">
                                {call.callNotes || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Payments Section */}
              {activeSection === "payments" && (
                <div>
                  {payments.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">
                      No payment records for this case.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Mode</th>
                            <th className="py-3 px-4">Reference</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {payments.map((payment, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-3 px-4">
                                {payment.paymentDate || payment.createdAt
                                  ? new Date(
                                      payment.paymentDate || payment.createdAt
                                    ).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td className="py-3 px-4 text-emerald-400 font-bold">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="py-3 px-4">
                                {payment.mode || payment.paymentMode || "—"}
                              </td>
                              <td className="py-3 px-4">
                                {payment.referenceNumber ||
                                  payment.transactionId ||
                                  "—"}
                              </td>
                              <td className="py-3 px-4">
                                <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {payment.status || "Confirmed"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Actions Section */}
              {activeSection === "actions" && (
                <div className="space-y-6">
                  {/* Status Change */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <ArrowRightLeft size={16} className="text-indigo-400" />
                      Change Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          New Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select status...</option>
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={statusRemarks}
                          onChange={(e) => setStatusRemarks(e.target.value)}
                          placeholder="Add remarks..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleStatusChange}
                          disabled={!newStatus || statusChanging}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {statusChanging ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assign */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <UserCheck size={16} className="text-emerald-400" />
                      Assign Case
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={assigneeId}
                          onChange={(e) => setAssigneeId(e.target.value)}
                          placeholder="Enter employee ID..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAssign}
                          disabled={!assigneeId || assigning}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {assigning ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <UserCheck size={14} />
                          )}
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transfer */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <ArrowRightLeft size={16} className="text-amber-400" />
                      Transfer Case
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Transfer to Employee ID
                        </label>
                        <input
                          type="text"
                          value={transferToId}
                          onChange={(e) => setTransferToId(e.target.value)}
                          placeholder="Enter new employee ID..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleTransfer}
                          disabled={!transferToId || assigning}
                          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {assigning ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ArrowRightLeft size={14} />
                          )}
                          Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CaseDetailModal;
