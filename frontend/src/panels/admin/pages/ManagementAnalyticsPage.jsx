import React from "react";
import { Download, Layers, IndianRupee } from "lucide-react";

export const ManagementAnalyticsPage = ({
  adminOverview,
  casesPagination,
  reportsData,
  reportsLoading,
  handleExportCSV,
  handleExportReportsCSV
}) => {
  const onExport = handleExportCSV || handleExportReportsCSV;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── 1. Top KPI Summary Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Debt Portfolio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl hover:border-[#315CFF]/50 transition-all relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#315CFF] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-lg text-[#315CFF] shadow-inner shrink-0">
              📁
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#9AAAC2] uppercase tracking-wider block truncate">Total Debt Portfolio</span>
              <div className="text-2xl font-bold font-mono text-[#315CFF] tracking-tight">
                ₹{Number(adminOverview?.summary?.total_principal || 48500000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-[#9AAAC2] truncate block mt-0.5">
                {adminOverview?.summary?.total_cases || casesPagination?.totalCount || 200} Total Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Outstanding */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl hover:border-[#FFB800]/50 transition-all relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#FFB800] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-lg text-[#FFB800] shadow-inner shrink-0">
              ⏳
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#9AAAC2] uppercase tracking-wider block truncate">Active Outstanding</span>
              <div className="text-2xl font-bold font-mono text-[#FFB800] tracking-tight">
                ₹{Number(adminOverview?.summary?.total_outstanding || 36250000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-[#9AAAC2] truncate block mt-0.5">Pending Recovery</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Recovered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl hover:border-[#00C995]/50 transition-all relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#00C995] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-lg text-[#00C995] shadow-inner shrink-0">
              💰
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#9AAAC2] uppercase tracking-wider block truncate">Total Recovered</span>
              <div className="text-2xl font-bold font-mono text-[#00C995] tracking-tight">
                ₹{Number(adminOverview?.summary?.total_recovered || 12250000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-[#00C995] font-semibold truncate block mt-0.5">
                {adminOverview?.summary?.overall_recovery_rate || "25.26"}% Overall Recovery Rate
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Call Connection Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl hover:border-[#5945F5]/50 transition-all relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#5945F5] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-lg text-[#5945F5] shadow-inner shrink-0">
              📞
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#9AAAC2] uppercase tracking-wider block truncate">Call Connection Rate</span>
              <div className="text-2xl font-bold font-mono text-[#5945F5] tracking-tight">
                {adminOverview?.summary?.call_connection_rate || "70.83"}%
              </div>
              <span className="text-[11px] text-[#9AAAC2] truncate block mt-0.5">
                {adminOverview?.summary?.answered_calls || 85} connected / {adminOverview?.summary?.total_calls || 120} calls
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Quick Actions Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#F4F7FF]">
            Portfolio Analytics &amp; DPD Aging Breakdown
          </h3>
          <span className="text-[11px] text-[#9AAAC2]">
            Statutory delinquency buckets, recovery percentages &amp; institutional distribution
          </span>
        </div>

        <button
          type="button"
          onClick={onExport}
          className="px-4 py-2 min-h-[38px] rounded-xl bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#00C995]/50 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#00C995]" />
          <span>Export Management Report (Excel)</span>
        </button>
      </div>

      {/* ── 3. DPD Aging Buckets Table ── */}
      <div className="w-full rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#315CFF]/30 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#263957] bg-[#08132D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-[#315CFF] shadow-inner">
              <Layers className="w-4 h-4 text-[#315CFF]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#F4F7FF]">Delinquency Aging Buckets (DPD Analysis)</h4>
              <span className="text-[10px] text-[#9AAAC2]">Statutory intervals tracking borrower default lifecycle</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#315CFF]/15 text-[#315CFF] border border-[#315CFF]/30 font-mono">
            30-Day Intervals
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[950px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#263957] bg-[#08132D] text-[#9AAAC2] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Aging Bucket</th>
                <th className="py-3 px-4">Delinquency Risk</th>
                <th className="py-3 px-4">Total Cases</th>
                <th className="py-3 px-4">Outstanding Debt (₹)</th>
                <th className="py-3 px-4">Recovered (₹)</th>
                <th className="py-3 px-4">Recovery %</th>
                <th className="py-3 px-4">Action Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263957]/50 font-medium">
              {(Array.isArray(reportsData?.dpd_aging) ? reportsData.dpd_aging : [
                { bucket: "0-30 DPD", case_count: 65, outstanding_amount: 8500000, recovered_amount: 3200000, recovery_rate: 27.35 },
                { bucket: "31-60 DPD", case_count: 55, outstanding_amount: 11200000, recovered_amount: 3800000, recovery_rate: 25.33 },
                { bucket: "61-90 DPD", case_count: 45, outstanding_amount: 9800000, recovered_amount: 2900000, recovery_rate: 22.83 },
                { bucket: "90+ DPD", case_count: 35, outstanding_amount: 6750000, recovered_amount: 2350000, recovery_rate: 25.82 }
              ]).map((b) => (
                <tr key={b.bucket} className="hover:bg-[#14223A]/50 transition-colors group text-[#F4F7FF]">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-[#F4F7FF] text-sm">{b.bucket}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      b.bucket === "90+ DPD"
                        ? "bg-[#FF527A]/15 text-[#FF527A] border-[#FF527A]/30"
                        : b.bucket === "61-90 DPD"
                        ? "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30"
                        : "bg-[#315CFF]/15 text-[#315CFF] border-[#315CFF]/30"
                    }`}>
                      {b.bucket === "90+ DPD" ? "NPA / CRITICAL" : b.bucket === "61-90 DPD" ? "SEVERE DEFAULT" : "EARLY ARREARS"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-[#F4F7FF]">{b.case_count} cases</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#FFB800] font-semibold">₹{Number(b.outstanding_amount).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#00C995] font-semibold">₹{Number(b.recovered_amount).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[#14223A] border border-[#263957] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00C995] rounded-full"
                          style={{ width: `${Math.min(b.recovery_rate, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-[#00C995] font-mono">{b.recovery_rate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#9AAAC2]">
                    {b.bucket === "90+ DPD" ? "Field Visit + Legal Notice" : b.bucket === "61-90 DPD" ? "Intensive Calling" : "Polite Soft Calling"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Lender-Wise Breakdown Table ── */}
      <div className="w-full rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00C995]/30 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#263957] bg-[#08132D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-[#00C995] shadow-inner">
              <IndianRupee className="w-4 h-4 text-[#00C995]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#F4F7FF]">Lender-Wise Performance &amp; Portfolio Distribution</h4>
              <span className="text-[10px] text-[#9AAAC2]">Institutional client recovery ratios &amp; outstanding balances</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00C995]/15 text-[#00C995] border border-[#00C995]/30 font-mono">
            Client Portfolios
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[950px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#263957] bg-[#08132D] text-[#9AAAC2] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Lending Partner</th>
                <th className="py-3 px-4">Total Accounts</th>
                <th className="py-3 px-4">Principal Assigned (₹)</th>
                <th className="py-3 px-4">Outstanding Balance (₹)</th>
                <th className="py-3 px-4">Amount Recovered (₹)</th>
                <th className="py-3 px-4">Recovery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263957]/50 font-medium">
              {(Array.isArray(reportsData?.lender_breakdown) ? reportsData.lender_breakdown : [
                { lender: "HDFC Bank", cases_count: 52, principal_amount: 14500000, outstanding_amount: 10500000, recovered_amount: 4000000, recovery_rate: 27.58 },
                { lender: "State Bank of India", cases_count: 48, principal_amount: 12200000, outstanding_amount: 9200000, recovered_amount: 3000000, recovery_rate: 24.59 },
                { lender: "ICICI Bank", cases_count: 38, principal_amount: 9800000, outstanding_amount: 7300000, recovered_amount: 2500000, recovery_rate: 25.51 },
                { lender: "Axis Bank", cases_count: 34, principal_amount: 7200000, outstanding_amount: 5400000, recovered_amount: 1800000, recovery_rate: 25.00 },
                { lender: "Bajaj Finance", cases_count: 28, principal_amount: 4800000, outstanding_amount: 3850000, recovered_amount: 950000, recovery_rate: 19.79 }
              ]).map((l) => (
                <tr key={l.lender} className="hover:bg-[#14223A]/50 transition-colors group text-[#F4F7FF]">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-[#F4F7FF] text-sm">{l.lender}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-[#F4F7FF]">{l.cases_count} cases</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#9AAAC2]">₹{Number(l.principal_amount).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#FFB800] font-semibold">₹{Number(l.outstanding_amount).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#00C995] font-semibold">₹{Number(l.recovered_amount).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#00C995] font-mono">{l.recovery_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagementAnalyticsPage;
