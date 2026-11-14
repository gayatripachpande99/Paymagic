import React from "react";
import { CheckCircle2, Users, Loader2 } from "lucide-react";

export default function CaseBatchBar({
  selectedCaseIds = [],
  setSelectedCaseIds,
  selectedBulkEmp = "",
  setSelectedBulkEmp,
  employeesList = [],
  handleAssignSelectedCases,
  bulkAssignLoading = false
}) {
  if (selectedCaseIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-2xl p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/50 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="font-bold text-xs sm:text-sm">
          {selectedCaseIds.length} Case{selectedCaseIds.length > 1 ? "s" : ""} Selected
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <select
          value={selectedBulkEmp}
          onChange={(e) => setSelectedBulkEmp(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">Assign to Specialist...</option>
          {employeesList.map((emp) => (
            <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
              {emp.fullName || emp.name} ({emp.employeeId || emp.id})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAssignSelectedCases}
          disabled={!selectedBulkEmp || bulkAssignLoading}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          {bulkAssignLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
          <span>Assign</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCaseIds([])}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
