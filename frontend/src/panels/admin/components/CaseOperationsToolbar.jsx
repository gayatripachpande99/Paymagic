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
    <div className="case-operations-box w-full rounded-2xl bg-[#0B1733] border border-[#263957] shadow-xl p-4 sm:p-5 my-3 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#315CFF]/40 to-transparent pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Section: Section Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#14223A] border border-[#263957] flex items-center justify-center text-[#315CFF] shrink-0 shadow-inner">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#F4F7FF] text-sm sm:text-base tracking-tight">
              Case Operations
            </h3>
          </div>
        </div>

        {/* Action Buttons: Primary & Secondary Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          {/* Primary Action 1: Import Customer Loans */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            disabled={fileUploadLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs py-2 px-3.5 min-h-[38px] bg-gradient-to-r from-[#315CFF] to-[#5945F5] hover:from-[#2a50e0] hover:to-[#4e3cd4] text-[#F4F7FF] rounded-xl font-semibold shadow-lg shadow-[#315CFF]/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>Import Loans</span>
          </button>

          {/* Primary Action 2: Rule Allocation Engine */}
          <button
            type="button"
            onClick={() => setShowBulkAllocateModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs py-2 px-3.5 min-h-[38px] bg-gradient-to-r from-[#5945F5] to-[#315CFF] hover:from-[#4e3cd4] hover:to-[#2a50e0] text-[#F4F7FF] rounded-xl font-semibold shadow-lg shadow-[#5945F5]/25 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#FFB800]" />
            <span>Rule Allocation</span>
          </button>

          {/* Secondary Action 1: Download Sample Template */}
          <button
            type="button"
            onClick={() => handleDownloadTemplate("xlsx")}
            className="flex-1 sm:flex-initial min-w-[80px] inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 min-h-[38px] bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#315CFF]/50 rounded-xl font-medium transition-all active:scale-98 cursor-pointer shadow-sm"
            title="Download official loan import template"
          >
            <Download className="w-3.5 h-3.5 text-[#9AAAC2] shrink-0" />
            <span>Template</span>
          </button>

          {/* Secondary Action 2: Transfer Cases */}
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="flex-1 sm:flex-initial min-w-[80px] inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 min-h-[38px] bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#315CFF]/50 rounded-xl font-medium transition-all active:scale-98 cursor-pointer shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#315CFF] shrink-0" />
            <span>Transfer</span>
          </button>

          {/* Secondary Action 3: Set Targets */}
          <button
            type="button"
            onClick={() => setShowTargetModal(true)}
            className="flex-1 sm:flex-initial min-w-[80px] inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 min-h-[38px] bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#00C995]/50 rounded-xl font-medium transition-all active:scale-98 cursor-pointer shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-[#00C995] shrink-0" />
            <span>Set Target</span>
          </button>

          {/* Secondary Action 4: Export CSV */}
          <button
            type="button"
            onClick={handleExportCasesCSV}
            className="flex-1 sm:flex-initial min-w-[80px] inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3 min-h-[38px] bg-[#14223A] hover:bg-[#1b2e4f] text-[#F4F7FF] border border-[#263957] hover:border-[#FFB800]/50 rounded-xl font-medium transition-all active:scale-98 cursor-pointer shadow-sm"
            title="Export complete case dataset"
          >
            <Download className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
