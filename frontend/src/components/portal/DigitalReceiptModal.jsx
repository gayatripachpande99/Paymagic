import { useState, useEffect } from "react";
import { Printer, Download, CheckCircle2, ShieldCheck, MapPin, Receipt, X, Share2 } from "lucide-react";
import api from "../../services/api";

export default function DigitalReceiptModal({
  receiptNumber,
  receiptData: initialReceiptData,
  isOpen,
  onClose
}) {
  const [receipt, setReceipt] = useState(initialReceiptData || null);
  const [loading, setLoading] = useState(!initialReceiptData && !!receiptNumber);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (initialReceiptData) {
      setReceipt(initialReceiptData);
      return;
    }

    if (isOpen && receiptNumber) {
      const fetchReceipt = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/field/receipt/${receiptNumber}`);
          if (res && res.success && res.receipt) {
            setReceipt(res.receipt);
          }
        } catch (err) {
          console.error("Receipt fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchReceipt();
    }
  }, [isOpen, receiptNumber, initialReceiptData]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `PayMagic Digital Recovery Receipt: ${receipt?.receipt_number} | Amount: ₹${receipt?.payment?.amount?.toLocaleString()} | Borrower: ${receipt?.customer?.name} | Verified RBI Compliant.`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Digital Collection Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Copy receipt summary"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? "Copied!" : "Share"}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1 transition"
              title="Print Receipt Voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Fetching secure digital receipt voucher...
          </div>
        ) : !receipt ? (
          <div className="py-16 text-center text-rose-400 text-sm">
            Receipt record could not be loaded.
          </div>
        ) : (
          <div className="mt-4 p-5 rounded-2xl bg-white text-slate-900 shadow-inner border border-slate-200 printable-receipt">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-base font-extrabold tracking-tight text-slate-900">
                  <span>Pay</span><span className="text-indigo-600">Magic</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold ml-1 uppercase">Official</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Fintech Ground &amp; Telephony Debt Recovery</p>
                <p className="text-[10px] text-slate-500 font-mono">GSTIN: 27AABCP1928K1Z5</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Number</span>
                <span className="font-mono font-bold text-xs text-indigo-700">{receipt.receipt_number}</span>
                <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                  {new Date(receipt.date_issued).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Success Pill Banner */}
            <div className="my-3 py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Payment Received &amp; Reconciled
              </span>
              <span className="font-mono font-bold uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                Mode: {receipt.payment?.mode || "UPI_QR"}
              </span>
            </div>

            {/* Borrower Details */}
            <div className="grid grid-cols-2 gap-3 py-2 text-xs border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Borrower Details</span>
                <span className="font-bold text-slate-900 block text-xs">{receipt.customer?.name}</span>
                <span className="text-[11px] text-slate-600 font-mono block">{receipt.customer?.phone}</span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{receipt.customer?.address}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Lending Account</span>
                <span className="font-bold text-slate-900 block text-xs">{receipt.customer?.lender}</span>
                <span className="text-[11px] text-indigo-700 font-mono font-bold block">{receipt.customer?.loan_account_no}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Remaining Debt: <strong className="text-slate-800 font-mono">₹{Number(receipt.payment?.remaining_balance || 0).toLocaleString("en-IN")}</strong>
                </span>
              </div>
            </div>

            {/* Payment Amount Display */}
            <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Amount Paid
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                ₹{Number(receipt.payment?.amount || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] italic text-slate-600 mt-0.5">
                ({receipt.payment?.amount_in_words || "Rupees Only"})
              </div>
            </div>

            {/* Agent & Audit Verification */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-500 border-t border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block">Field Enforcement Specialist:</span>
                <span className="font-semibold text-slate-900">{receipt.agent?.name}</span>
                <span className="text-slate-500 font-mono block">ID: {receipt.agent?.employee_id}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700 block">Verified GPS Stamp:</span>
                <span className="text-slate-600 font-mono block">📍 {receipt.audit?.gps_coordinates}</span>
                <span className="text-[9px] text-indigo-600 font-mono font-bold block mt-0.5">
                  Hash: {receipt.audit?.verification_hash}
                </span>
              </div>
            </div>

            {/* Statutory Watermark Notice */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-semibold text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>RBI Fair Practices Code Compliant Official Receipt</span>
              </div>
              <p>This is a computer-generated digital receipt and requires no physical signature.</p>
              <p>Queries? Contact: support@paymagic.in | National Toll Free: 1800-419-7296</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
