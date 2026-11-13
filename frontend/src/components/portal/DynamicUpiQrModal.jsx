import { useState, useEffect } from "react";
import { QrCode, CheckCircle2, Copy, Clock, ShieldCheck, IndianRupee, ArrowRight, X } from "lucide-react";

export default function DynamicUpiQrModal({
  isOpen,
  onClose,
  amount,
  caseData,
  onPaymentConfirmed
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [processing, setProcessing] = useState(false);

  const amountVal = Number(amount) || 5000;
  const vpa = "paymagic.recoveries@icici";
  const payeeName = "PayMagic Fintech Services";
  const refId = `PMUPI${Date.now().toString().slice(-8)}`;
  const upiPayload = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amountVal}&cu=INR&tr=${refId}&tn=${encodeURIComponent(`Loan Recovery ${caseData?.loan_account_no || 'PM'}`)}`;

  // 5-minute timer
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(300);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const copyUpiString = () => {
    navigator.clipboard.writeText(upiPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentConfirmed({
        amount: amountVal,
        mode: "UPI_QR",
        transaction_ref: refId,
        vpa_used: vpa
      });
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Spot UPI QR Generator</h3>
              <p className="text-[11px] text-slate-400">Dynamic on-site instant digital collection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Amount Banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 text-center">
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block mb-0.5">
            Recovery Collection Amount
          </span>
          <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-1 font-mono">
            <span className="text-emerald-400">₹</span>
            <span>{amountVal.toLocaleString("en-IN")}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Borrower: <strong className="text-white">{caseData?.customer_name || "Borrower"}</strong> • Acc: <span className="font-mono text-indigo-300">{caseData?.loan_account_no}</span>
          </div>
        </div>

        {/* Dynamic QR Code Representation */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/30 relative">
            <svg
              viewBox="0 0 200 200"
              className="w-48 h-48 select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background */}
              <rect width="200" height="200" fill="#ffffff" />

              {/* Corner 1: Top-Left Finder */}
              <rect x="15" y="15" width="45" height="45" rx="6" fill="#0f172a" />
              <rect x="23" y="23" width="29" height="29" rx="3" fill="#ffffff" />
              <rect x="30" y="30" width="15" height="15" rx="2" fill="#4f46e5" />

              {/* Corner 2: Top-Right Finder */}
              <rect x="140" y="15" width="45" height="45" rx="6" fill="#0f172a" />
              <rect x="148" y="23" width="29" height="29" rx="3" fill="#ffffff" />
              <rect x="155" y="30" width="15" height="15" rx="2" fill="#4f46e5" />

              {/* Corner 3: Bottom-Left Finder */}
              <rect x="15" y="140" width="45" height="45" rx="6" fill="#0f172a" />
              <rect x="23" y="148" width="29" height="29" rx="3" fill="#ffffff" />
              <rect x="30" y="155" width="15" height="15" rx="2" fill="#4f46e5" />

              {/* Timing & Data Grid Elements */}
              <rect x="70" y="20" width="10" height="10" fill="#0f172a" />
              <rect x="90" y="20" width="10" height="10" fill="#0f172a" />
              <rect x="110" y="20" width="10" height="10" fill="#0f172a" />

              <rect x="20" y="70" width="10" height="10" fill="#0f172a" />
              <rect x="20" y="90" width="10" height="10" fill="#0f172a" />
              <rect x="20" y="110" width="10" height="10" fill="#0f172a" />

              <rect x="70" y="70" width="15" height="15" fill="#4f46e5" />
              <rect x="95" y="70" width="10" height="10" fill="#0f172a" />
              <rect x="115" y="70" width="15" height="15" fill="#0f172a" />

              <rect x="70" y="95" width="10" height="10" fill="#0f172a" />
              <rect x="90" y="95" width="20" height="20" fill="#4f46e5" />
              <rect x="120" y="95" width="10" height="10" fill="#0f172a" />

              <rect x="70" y="125" width="15" height="15" fill="#0f172a" />
              <rect x="95" y="125" width="10" height="10" fill="#4f46e5" />
              <rect x="115" y="125" width="15" height="15" fill="#0f172a" />

              <rect x="145" y="70" width="10" height="10" fill="#0f172a" />
              <rect x="165" y="70" width="15" height="15" fill="#0f172a" />
              <rect x="145" y="95" width="15" height="15" fill="#0f172a" />
              <rect x="170" y="95" width="10" height="10" fill="#0f172a" />
              <rect x="145" y="120" width="10" height="10" fill="#0f172a" />
              <rect x="165" y="120" width="15" height="15" fill="#0f172a" />

              <rect x="70" y="150" width="10" height="10" fill="#0f172a" />
              <rect x="90" y="150" width="10" height="10" fill="#0f172a" />
              <rect x="110" y="150" width="10" height="10" fill="#0f172a" />
              <rect x="130" y="150" width="10" height="10" fill="#0f172a" />
              <rect x="150" y="150" width="10" height="10" fill="#0f172a" />
              <rect x="170" y="150" width="10" height="10" fill="#0f172a" />

              <rect x="70" y="170" width="15" height="15" fill="#0f172a" />
              <rect x="95" y="170" width="10" height="10" fill="#0f172a" />
              <rect x="115" y="170" width="15" height="15" fill="#0f172a" />
              <rect x="140" y="170" width="10" height="10" fill="#0f172a" />
              <rect x="160" y="170" width="15" height="15" fill="#0f172a" />

              {/* Central PayMagic Fintech Tag */}
              <circle cx="100" cy="100" r="14" fill="#ffffff" />
              <circle cx="100" cy="100" r="11" fill="#4f46e5" />
              <text x="100" y="104" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">₹</text>
            </svg>

            {/* Expired Overlay if timer reaches 0 */}
            {timeLeft <= 0 && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center text-center p-3">
                <Clock className="w-8 h-8 text-amber-400 mb-1" />
                <span className="text-white text-xs font-bold">QR Expired</span>
                <span className="text-slate-400 text-[10px]">Please generate a fresh code</span>
              </div>
            )}
          </div>

          {/* Supported UPI Apps */}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Scan via:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Google Pay</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">PhonePe</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Paytm</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">BHIM</span>
          </div>
        </div>

        {/* Dynamic Details Box */}
        <div className="my-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>UPI ID (VPA):</span>
            <span className="font-mono text-white font-semibold flex items-center gap-1">
              {vpa}
              <button
                type="button"
                onClick={copyUpiString}
                className="text-indigo-400 hover:text-indigo-300 p-0.5"
                title="Copy UPI String"
              >
                <Copy className="w-3 h-3" />
              </button>
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Transaction Ref:</span>
            <span className="font-mono text-indigo-300 text-[11px]">{refId}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>QR Validity:</span>
            <span className={`font-mono font-bold text-xs ${timeLeft < 60 ? "text-rose-400" : "text-amber-400"}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={processing || timeLeft <= 0}
            onClick={handleSimulatePayment}
            className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{processing ? "Verifying Bank Webhook..." : "Borrower Paid (Confirm)"}</span>
          </button>
        </div>

        {/* Statutory Compliance Footer */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>RBI Fair Practice Encrypted Nodal Settlement</span>
        </div>
      </div>
    </div>
  );
}
