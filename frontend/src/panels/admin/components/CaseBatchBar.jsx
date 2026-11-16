import React from "react";
import { CheckCircle2, Users, Loader2, X } from "lucide-react";

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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-2xl p-3.5 sm:p-4 rounded-2xl bg-[#0B1733]/95 border border-[#315CFF]/50 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[#F4F7FF] animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-[#00C995] shrink-0" />
        <span className="font-bold text-xs sm:text-sm">
          {selectedCaseIds.length} Case{selectedCaseIds.length > 1 ? "s" : ""} Selected
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <select
          value={selectedBulkEmp}
          onChange={(e) => setSelectedBulkEmp(e.target.value)}
          className="px-3 py-1.5 bg-[#14223A] border border-[#263957] rounded-xl text-xs text-[#F4F7FF] focus:outline-none focus:border-[#315CFF]"
        >
          <option value="" className="bg-[#0B1733] text-[#9AAAC2]">Assign to Specialist...</option>
          {employeesList.map((emp) => (
            <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id} className="bg-[#0B1733] text-[#F4F7FF]">
              {emp.fullName || emp.name} ({emp.employeeId || emp.id})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAssignSelectedCases}
          disabled={!selectedBulkEmp || bulkAssignLoading}
          className="px-4 py-1.5 bg-gradient-to-r from-[#315CFF] to-[#5945F5] hover:from-[#2a50e0] hover:to-[#4e3cd4] text-[#F4F7FF] rounded-xl text-xs font-semibold shadow-md shadow-[#315CFF]/30 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          {bulkAssignLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
          <span>Assign</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCaseIds([])}
          className="p-1.5 sm:px-3 sm:py-1.5 bg-[#14223A] hover:bg-[#1b2e4f] text-[#9AAAC2] hover:text-[#F4F7FF] border border-[#263957] rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
          title="Clear selected cases"
        >
          <X className="w-3.5 h-3.5 sm:hidden" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
}
