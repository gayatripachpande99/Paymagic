import React from "react";
import { FileSpreadsheet, Download, Sparkles, ArrowRightLeft, Calendar } from "lucide-react";

export default function CaseOperationsToolbar({
  fileUploadLoading = false,
  setShowImportModal,
  handleDownloadTemplate,
  setShowBulkAllocateModal,
  setShowTransferModal,
  setShowTargetModal,
  handleExportCasesCSV
}) {
  return (
    <div className="portal-card case-operations-box w-full rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-white/[0.08] shadow-2xl p-5 sm:p-6 my-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                Module A: Admin Case Management Operations
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-10">
            Excel/CSV bulk upload with schema validation, rule-based portfolio allocation, case transfers, target tracking &amp; atomic status audits.
          </p>
        </div>

        {/* Action Button Grid/Flex */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {/* 1. Import Excel/CSV Button */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            disabled={fileUploadLoading}
            className="inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 min-h-[42px] bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Import Customer Loans</span>
          </button>

          {/* 2. Download Template */}
          <button
            type="button"
            onClick={() => handleDownloadTemplate("xlsx")}
            className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[42px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
            title="Download official loan import template"
          >
            <Download className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Template</span>
          </button>

          {/* 3. Rule Allocation */}
          <button
            type="button"
            onClick={() => setShowBulkAllocateModal(true)}
            className="inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4 min-h-[42px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
            <span>Rule Allocation</span>
          </button>

          {/* 4. Transfer Cases */}
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[42px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Transfer Cases</span>
          </button>

          {/* 5. Set Target */}
          <button
            type="button"
            onClick={() => setShowTargetModal(true)}
            className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[42px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
          >
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Set Target</span>
          </button>

          {/* 6. Export Cases */}
          <button
            type="button"
            onClick={handleExportCasesCSV}
            className="inline-flex items-center justify-center gap-1.5 text-xs py-2.5 px-3.5 min-h-[42px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl font-semibold transition-all active:scale-98 cursor-pointer shadow-sm"
            title="Export complete case dataset"
          >
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Export Cases</span>
          </button>
        </div>
      </div>
    </div>
  );
}

