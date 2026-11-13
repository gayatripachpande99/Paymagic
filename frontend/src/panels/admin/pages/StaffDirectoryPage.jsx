import React, { useState } from "react";
import { Users, Eye, Plus, Copy } from "lucide-react";

export default function StaffDirectoryPage({
  employeesList = [],
  setShowAddModal
}) {
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const togglePasswordVisibility = (empId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="portal-tab-content">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Staff Credentials &amp; Role Access</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className="secondary-btn flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Eye className="w-4 h-4" />
            <span>{showAllPasswords ? "Hide All Passwords" : "Show All Passwords"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="primary-btn flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="portal-card">
        <div className="portal-table-container">
          <table className="portal-table min-w-[950px]">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Employee ID</th>
                <th>Role &amp; Dept</th>
                <th>Email / Contact</th>
                <th>Login Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeesList.map((emp) => {
                const isPwdVisible = showAllPasswords || visiblePasswords[emp.employeeId];
                return (
                  <tr key={emp.employeeId}>
                    <td>
                      <div className="font-bold text-white text-xs">{emp.fullName}</div>
                      <span className="text-[11px] text-slate-400">{emp.designation || "Executive"}</span>
                    </td>
                    <td className="font-mono text-indigo-400 text-xs font-semibold">{emp.employeeId}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">
                        {emp.role || "CALLER"}
                      </span>
                      <div className="text-[11px] text-slate-400">{emp.department}</div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-300">{emp.email}</div>
                      <span className="text-[11px] text-slate-500">{emp.phone}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-300 font-semibold bg-slate-800 px-2 py-1 rounded">
                          {isPwdVisible ? (emp.initialPassword || "Emp@123") : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(emp.employeeId)}
                          className="p-1 hover:text-white text-slate-400"
                          title="Toggle visibility"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(emp.initialPassword || "Emp@123", emp.employeeId)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === emp.employeeId ? "Copied!" : "Copy"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
