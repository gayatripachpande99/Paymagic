import React, { useState } from "react";
import {
  FileText,
  BarChart3,
  PhoneCall,
  Download,
  Search,
  Filter,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Volume2
} from "lucide-react";

export default function MoreViews({ activeTab }) {
  // If activeTab is 'more_reports' or starts with 'more_reports', show the Reports suite with its sidebar:
  // a. One View
  // b. CC Report
  // c. Field Report
  // d. Digital Engagement Report
  // e. Call Recording
  const [reportSidebar, setReportSidebar] = useState("one_view"); // 'one_view' | 'cc_report' | 'field_report' | 'digital_report' | 'call_recording'
  
  // Date filter state
  const [reportStartDate, setReportStartDate] = useState("2026-11-18");
  const [reportEndDate, setReportEndDate] = useState("2026-11-18");
  const [searchReportQuery, setSearchReportQuery] = useState("");
  const [selectedAllocationFile, setSelectedAllocationFile] = useState("");

  const allocationsList = [
    {
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32",
      product: "Personal Loan",
      bucket: "Writeoff",
      channel: "Call",
      records: 117,
      uploadedOn: "2026-11-18 16:32:00",
      scoreStatus: "Scored",
      score: 84.5
    },
    {
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-13_10:13",
      product: "Personal Loan",
      bucket: "Writeoff",
      channel: "Call",
      records: 117,
      uploadedOn: "2026-11-13 10:13:00",
      scoreStatus: "Scored",
      score: 82.0
    },
    {
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_13:45",
      product: "Personal Loan",
      bucket: "Writeoff",
      channel: "Call",
      records: 293,
      uploadedOn: "2026-11-04 13:45:00",
      scoreStatus: "Scored",
      score: 79.8
    },
    {
      name: "BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_11:31",
      product: "Personal Loan",
      bucket: "Writeoff",
      channel: "Call",
      records: 4,
      uploadedOn: "2026-11-04 11:31:00",
      scoreStatus: "Scored",
      score: 71.2
    }
  ];

  const handleDownloadReport = (name, type) => {
    const csvContent = "data:text/csv;charset=utf-8,Allocation_Name,Product,Bucket,Channel,Status,Generated_At\n" +
      `"${name}","Personal Loan","Writeoff","Call","Completed","2026-11-21"\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${name}_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ═══════════════════════════════════════════════════════
  // 3. SCORE: YUCOLLECT SCORE
  // ═══════════════════════════════════════════════════════
  if (activeTab === "more_score") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Yucollect Score</h2>
          </div>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recalculate AI Scores</span>
          </button>
        </div>

        {/* Yucollect Score Table */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Allocation Name</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Bucket</th>
                  <th className="p-3">Total Records</th>
                  <th className="p-3">Uploaded On</th>
                  <th className="p-3">Score Status</th>
                  <th className="p-3">Collection Score</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocationsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{item.name}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.product}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {item.bucket}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-foreground">{item.records}</td>
                    <td className="p-3 font-mono text-muted-foreground">{item.uploadedOn}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {item.scoreStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="font-bold text-foreground">{item.score} / 100</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDownloadReport(item.name, "score_audit")}
                        className="px-3 py-1 rounded bg-muted hover:bg-muted/80 text-blue-500 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // 1. REPORT SUITE (DEFAULT FOR MORE)
  // ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Operational Reports Center</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Reports Left Sidebar:
            a. One View
            b. CC Report
            c. Field Report
            d. Digital Engagement Report
            e. Call Recording
        */}
        <aside className="w-full md:w-60 lg:w-64 shrink-0">
          <div className="sticky top-24 rounded-2xl bg-card border border-border p-3 space-y-1.5 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-2">
              Report Categories
            </div>

            <button
              onClick={() => setReportSidebar("one_view")}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                reportSidebar === "one_view"
                  ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                  : "text-foreground hover:bg-muted font-medium"
              }`}
            >
              <span>a. One View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setReportSidebar("cc_report")}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                reportSidebar === "cc_report"
                  ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                  : "text-foreground hover:bg-muted font-medium"
              }`}
            >
              <span>b. CC Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setReportSidebar("field_report")}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                reportSidebar === "field_report"
                  ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                  : "text-foreground hover:bg-muted font-medium"
              }`}
            >
              <span>c. Field Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setReportSidebar("digital_report")}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                reportSidebar === "digital_report"
                  ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                  : "text-foreground hover:bg-muted font-medium"
              }`}
            >
              <span>d. Digital Engagement Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setReportSidebar("call_recording")}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                reportSidebar === "call_recording"
                  ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                  : "text-foreground hover:bg-muted font-medium"
              }`}
            >
              <span>e. Call Recording</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* Reports Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* ── a. ONE VIEW ── */}
          {reportSidebar === "one_view" && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-foreground">All Reports</h3>
              </div>

              {/* Date Filters: 18-11-2026 to 18-11-2026 & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>18-11-2026</span>
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>18-11-2026</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchReportQuery}
                    onChange={(e) => setSearchReportQuery(e.target.value)}
                    placeholder="Search Allocations, Bucket, Product, Channel..."
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
                  />
                </div>
              </div>

              {/* Exact 4 Rows Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Allocation Name</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Bucket</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allocationsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>{item.name}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{item.product}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {item.bucket}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-foreground">{item.channel}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDownloadReport(item.name, "one_view")}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── b. CC REPORT (Contact Center) ── */}
          {reportSidebar === "cc_report" && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-foreground">Contact Center (CC) Reports</h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono font-semibold">
                  18-11-2026
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono font-semibold">
                  18-11-2026
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Allocation Name</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Bucket</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allocationsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{item.name}</td>
                        <td className="p-3 text-muted-foreground">{item.product}</td>
                        <td className="p-3">{item.bucket}</td>
                        <td className="p-3 font-semibold text-foreground">Call Center</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDownloadReport(item.name, "cc_report")}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download CC</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── c. FIELD REPORT ── */}
          {reportSidebar === "field_report" && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-foreground">Field Reports</h3>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>18-11-2026</span>
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>18-11-2026</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search Allocations, Bucket, Product, Channel..."
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Allocation Name</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Bucket</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allocationsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{item.name}</td>
                        <td className="p-3 text-muted-foreground">{item.product}</td>
                        <td className="p-3">{item.bucket}</td>
                        <td className="p-3 font-semibold text-foreground">Field Recovery</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDownloadReport(item.name, "field_report")}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Field</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── d. DIGITAL ENGAGEMENT REPORT ── */}
          {reportSidebar === "digital_report" && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-foreground">Filter and Download Report</h3>
              </div>

              {/* Date Filters: Start date & End date */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                <span className="font-bold text-foreground">Date Range</span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Start Date:</span>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">End Date:</span>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section: All Downloads */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-foreground">All Downloads</h4>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Requested by</th>
                        <th className="p-3">Date Range</th>
                        <th className="p-3">Allocator</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-muted-foreground font-medium">
                          No data
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ── e. CALL RECORDING ── */}
          {reportSidebar === "call_recording" && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-foreground">Filter and Download all Call Recordings</h3>
              </div>

              {/* Filters: Allocation File & Date range */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Allocation File Dropdown */}
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Allocation File</label>
                    <select
                      value={selectedAllocationFile}
                      onChange={(e) => setSelectedAllocationFile(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none"
                    >
                      <option value="">Select allocation file</option>
                      <option value="bajaj_18">BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-18_16:32</option>
                      <option value="bajaj_13">BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-13_10:13</option>
                      <option value="bajaj_04_13">BAJAJ FINSERVE_Personal Loan_Writeoff_2026-11-04_13:45</option>
                    </select>
                  </div>

                  {/* Date range */}
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Date range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none"
                      />
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Section: All Downloads */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-foreground">All Downloads</h4>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search recordings..."
                      className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Date Range</th>
                        <th className="p-3">Allocator</th>
                        <th className="p-3">Request Criteria</th>
                        <th className="p-3">Requested by</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">File Size</th>
                        <th className="p-3 text-right">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td colSpan="8" className="p-12 text-center text-muted-foreground font-medium">
                          No data
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
