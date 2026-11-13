import React, { useState, useEffect } from "react";
import {
  X,
  Scale,
  User,
  AlertTriangle,
  FileText,
  Phone,
  CheckCircle2,
  Loader2
} from "lucide-react";
import api from "../../services/api";

const COMPLAINT_CATEGORIES = [
  "Calling outside permissible hours",
  "Rude / Aggressive tone or harassment",
  "Disputed statement balance / Missing payment credit",
  "Frequent / Excessive calling",
  "Unauthorized contact to third parties / relatives",
  "Refusal to provide official receipt",
  "Wrong borrower identity / skip-trace error",
  "Other fair practice code violation"
];

export const RecordComplaintModal = ({
  isOpen,
  onClose,
  onComplaintCreated
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [reportedEmployeeId, setReportedEmployeeId] = useState("");
  const [assignedSupervisorId, setAssignedSupervisorId] = useState("");
  const [complaintType, setComplaintType] = useState(COMPLAINT_CATEGORIES[0]);
  const [severity, setSeverity] = useState("HIGH");
  const [lodgedChannel, setLodgedChannel] = useState("PHONE_HELPLINE");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setFetchingData(true);
      // Fetch cases
      const casesRes = await api.get("/cases?limit=50");
      if (casesRes && casesRes.success) {
        setCases(casesRes.data.cases || []);
        if (casesRes.data.cases?.length > 0) {
          setSelectedCaseId(casesRes.data.cases[0].id);
          if (casesRes.data.cases[0].assigned_employee_id) {
            setReportedEmployeeId(casesRes.data.cases[0].assigned_employee_id);
          }
        }
      }

      // Fetch employees
      const empRes = await api.get("/admin/employees");
      if (empRes && empRes.employees) {
        setEmployees(empRes.employees);
        const sups = empRes.employees.filter(e => e.role === "SUPERVISOR" || e.role === "ADMIN");
        setSupervisors(sups.length > 0 ? sups : empRes.employees);
        if (sups.length > 0) setAssignedSupervisorId(sups[0].id);
      }
    } catch (err) {
      console.warn("Failed to load cases/employees:", err.message);
    } finally {
      setFetchingData(false);
    }
  };

  const handleCaseChange = (caseId) => {
    setSelectedCaseId(caseId);
    const chosen = cases.find(c => c.id === caseId);
    if (chosen && chosen.assigned_employee_id) {
      setReportedEmployeeId(chosen.assigned_employee_id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter the borrower's grievance description.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const chosenCase = cases.find(c => c.id === selectedCaseId);
      const payload = {
        case_id: selectedCaseId,
        customer_id: chosenCase ? chosenCase.customer_id : null,
        reported_employee_id: reportedEmployeeId || "usr_caller_1",
        assigned_supervisor_id: assignedSupervisorId || "usr_supervisor",
        complaint_type: complaintType,
        severity: severity,
        lodged_channel: lodgedChannel,
        description: description.trim()
      };

      const res = await api.post("/complaints", payload);
      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onComplaintCreated) onComplaintCreated(res.data.complaint);
          onClose();
        }, 1200);
      } else {
        setError(res?.message || "Failed to record complaint.");
      }
    } catch (err) {
      console.error("recordComplaint error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to record grievance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Record Borrower Complaint &amp; Dispute</h3>
              <p className="text-xs text-slate-400">Formal Fair Practice Code Grievance Registration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {fetchingData ? (
            <div className="flex items-center justify-center py-10 gap-2 text-indigo-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading borrower accounts &amp; staff registry...</span>
            </div>
          ) : (
            <>
              {/* Row 1: Loan Case / Borrower */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Loan Case &amp; Borrower:
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} &bull; {c.customer_name || "Borrower"} ({c.lender_name} &bull; ₹{c.outstanding_amount?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Reported Staff & Assigned Supervisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reported Employee / Staff:
                  </label>
                  <select
                    value={reportedEmployeeId}
                    onChange={(e) => setReportedEmployeeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || emp.fullName} ({emp.employeeId || "EMP"} &bull; {emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assign Investigating Supervisor:
                  </label>
                  <select
                    value={assignedSupervisorId}
                    onChange={(e) => setAssignedSupervisorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.fullName} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Category & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Grievance Category / Violation:
                  </label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {COMPLAINT_CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Level &amp; Intake Channel:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>

                    <select
                      value={lodgedChannel}
                      onChange={(e) => setLodgedChannel(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PHONE_HELPLINE">Helpline Call</option>
                      <option value="EMAIL">Official Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="OMBUDSMAN">Ombudsman / RBI</option>
                      <option value="DIRECT_CALL">Direct Call</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Borrower Statement / Grievance Description:
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the borrower's exact statement (e.g. Borrower claims they were called after 7:30 PM; or borrower disputes payment allocation of ₹15,000 made on 4th Nov)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Complaint ticket registered successfully. 48-Hour SLA assigned.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
                  <span>Register Grievance</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default RecordComplaintModal;

