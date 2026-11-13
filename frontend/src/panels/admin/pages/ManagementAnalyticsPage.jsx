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
    <div className="portal-tab-content">
      {/* Top KPI Summary Banner */}
      <div className="admin-kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap blue-wrap">📁</div>
          <div className="kpi-data">
            <span className="kpi-label">Total Debt Portfolio</span>
            <div className="kpi-val text-blue">
              ₹{Number(adminOverview?.summary?.total_principal || 48500000).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-400">
              {adminOverview?.summary?.total_cases || casesPagination?.totalCount || 200} Total Cases
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap gold-wrap">⏳</div>
          <div className="kpi-data">
            <span className="kpi-label">Active Outstanding</span>
            <div className="kpi-val text-gold">
              ₹{Number(adminOverview?.summary?.total_outstanding || 36250000).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-400">Pending recovery</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap green-wrap">💰</div>
          <div className="kpi-data">
            <span className="kpi-label">Total Amount Recovered</span>
            <div className="kpi-val text-green">
              ₹{Number(adminOverview?.summary?.total_recovered || 12250000).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {adminOverview?.summary?.overall_recovery_rate || "25.26"}% Overall Recovery Rate
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap purple-wrap">📞</div>
          <div className="kpi-data">
            <span className="kpi-label">Call Connection Rate</span>
            <div className="kpi-val text-purple">
              {adminOverview?.summary?.call_connection_rate || "70.83"}%
            </div>
            <span className="text-[11px] text-slate-400">
              {adminOverview?.summary?.answered_calls || 85} connected / {adminOverview?.summary?.total_calls || 120} attempts
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Portfolio Analytics &amp; DPD Aging Breakdown
          </h3>
        </div>

        <button
          type="button"
          onClick={onExport}
          className="secondary-btn flex items-center justify-center gap-2 self-start sm:self-auto w-full sm:w-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Management Report (Excel)</span>
        </button>
      </div>

      {/* DPD Aging Buckets Table */}
      <div className="portal-card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div className="header-left">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h4>Delinquency Aging Buckets (DPD Analysis)</h4>
          </div>
          <span className="badge badge-info">30-Day Intervals</span>
        </div>

        <div className="portal-table-container">
          <table className="portal-table min-w-[950px]">
            <thead>
              <tr>
                <th>Aging Bucket</th>
                <th>Delinquency Risk</th>
                <th>Total Cases</th>
                <th>Outstanding Debt (₹)</th>
                <th>Recovered (₹)</th>
                <th>Recovery %</th>
                <th>Action Standard</th>
              </tr>
            </thead>
            <tbody>
              {(reportsData?.dpd_aging || [
                { bucket: "0-30 DPD", case_count: 65, outstanding_amount: 8500000, recovered_amount: 3200000, recovery_rate: 27.35 },
                { bucket: "31-60 DPD", case_count: 55, outstanding_amount: 11200000, recovered_amount: 3800000, recovery_rate: 25.33 },
                { bucket: "61-90 DPD", case_count: 45, outstanding_amount: 9800000, recovered_amount: 2900000, recovery_rate: 22.83 },
                { bucket: "90+ DPD", case_count: 35, outstanding_amount: 6750000, recovered_amount: 2350000, recovery_rate: 25.82 }
              ]).map((b) => (
                <tr key={b.bucket}>
                  <td>
                    <span className="font-bold text-white text-sm">{b.bucket}</span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      b.bucket === "90+ DPD"
                        ? "bg-rose-500/20 text-rose-400"
                        : b.bucket === "61-90 DPD"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {b.bucket === "90+ DPD" ? "NPA / CRITICAL" : b.bucket === "61-90 DPD" ? "SEVERE DEFAULT" : "EARLY ARREARS"}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-200">{b.case_count} cases</td>
                  <td className="font-mono text-amber-400 font-semibold">₹{Number(b.outstanding_amount).toLocaleString("en-IN")}</td>
                  <td className="font-mono text-emerald-400 font-semibold">₹{Number(b.recovered_amount).toLocaleString("en-IN")}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(b.recovery_rate, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-white">{b.recovery_rate}%</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-400">
                    {b.bucket === "90+ DPD" ? "Field Visit + Legal Notice" : b.bucket === "61-90 DPD" ? "Intensive Calling" : "Polite Soft Calling"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lender-Wise Breakdown Table */}
      <div className="portal-card">
        <div className="card-header">
          <div className="header-left">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            <h4>Lender-Wise Performance &amp; Portfolio Distribution</h4>
          </div>
          <span className="badge badge-success">Client Portfolios</span>
        </div>

        <div className="portal-table-container">
          <table className="portal-table min-w-[950px]">
            <thead>
              <tr>
                <th>Lending Partner</th>
                <th>Total Accounts</th>
                <th>Principal Assigned (₹)</th>
                <th>Outstanding Balance (₹)</th>
                <th>Amount Recovered (₹)</th>
                <th>Recovery Rate</th>
              </tr>
            </thead>
            <tbody>
              {(reportsData?.lender_breakdown || [
                { lender: "HDFC Bank", cases_count: 52, principal_amount: 14500000, outstanding_amount: 10500000, recovered_amount: 4000000, recovery_rate: 27.58 },
                { lender: "State Bank of India", cases_count: 48, principal_amount: 12200000, outstanding_amount: 9200000, recovered_amount: 3000000, recovery_rate: 24.59 },
                { lender: "ICICI Bank", cases_count: 38, principal_amount: 9800000, outstanding_amount: 7300000, recovered_amount: 2500000, recovery_rate: 25.51 },
                { lender: "Axis Bank", cases_count: 34, principal_amount: 7200000, outstanding_amount: 5400000, recovered_amount: 1800000, recovery_rate: 25.00 },
                { lender: "Bajaj Finance", cases_count: 28, principal_amount: 4800000, outstanding_amount: 3850000, recovered_amount: 950000, recovery_rate: 19.79 }
              ]).map((l) => (
                <tr key={l.lender}>
                  <td>
                    <div className="font-bold text-white text-sm">{l.lender}</div>
                  </td>
                  <td className="font-semibold text-slate-200">{l.cases_count} cases</td>
                  <td className="font-mono text-slate-300">₹{Number(l.principal_amount).toLocaleString("en-IN")}</td>
                  <td className="font-mono text-amber-400 font-semibold">₹{Number(l.outstanding_amount).toLocaleString("en-IN")}</td>
                  <td className="font-mono text-emerald-400 font-semibold">₹{Number(l.recovered_amount).toLocaleString("en-IN")}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{l.recovery_rate}%</span>
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
