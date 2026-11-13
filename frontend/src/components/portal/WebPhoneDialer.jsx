import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Delete,
  Minimize2,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  User,
  Search,
  Sparkles,
  ChevronDown
} from "lucide-react";

// Standard Dual-Tone Multi-Frequency (DTMF) frequencies
const DTMF_FREQS = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477]
};

const DIALPAD_KEYS = [
  { key: "1", sub: "" },
  { key: "2", sub: "ABC" },
  { key: "3", sub: "DEF" },
  { key: "4", sub: "GHI" },
  { key: "5", sub: "JKL" },
  { key: "6", sub: "MNO" },
  { key: "7", sub: "PQRS" },
  { key: "8", sub: "TUV" },
  { key: "9", sub: "WXYZ" },
  { key: "*", sub: "" },
  { key: "0", sub: "+" },
  { key: "#", sub: "" }
];

export const WebPhoneDialer = ({
  user,
  cases = [],
  onCallCase,
  activeCall = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [matchedCase, setMatchedCase] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef(null);

  // Initialize Web Audio Context for realistic DTMF key feedback
  const playDTMF = (digit) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const freqs = DTMF_FREQS[digit];
      if (!freqs) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio not supported or blocked by autoplay policy
    }
  };

  // Find matching case whenever phoneNumber changes
  useEffect(() => {
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (cleanDigits.length >= 4 && cases && cases.length > 0) {
      const match = cases.find((c) => {
        const p = (c.customer_phone || c.phone_raw || "").replace(/\D/g, "");
        const num = (c.case_number || "").toLowerCase();
        const name = (c.customer_name || "").toLowerCase();
        return (
          (p && p.includes(cleanDigits)) ||
          num.includes(phoneNumber.toLowerCase()) ||
          name.includes(phoneNumber.toLowerCase())
        );
      });
      setMatchedCase(match || null);
    } else {
      setMatchedCase(null);
    }
  }, [phoneNumber, cases]);

  const handleKeyPress = (digit) => {
    playDTMF(digit);
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber("");
    setMatchedCase(null);
  };

  const handleDial = () => {
    if (!phoneNumber.trim()) return;

    if (matchedCase) {
      onCallCase(matchedCase);
    } else {
      // Create ad-hoc case object for calling
      const adHocCase = {
        id: `adhoc_${Date.now()}`,
        case_number: `DIAL-${phoneNumber.slice(-4)}`,
        customer_name: "Manual Dial Customer",
        customer_phone: `${countryCode} ${phoneNumber}`,
        outstanding_amount: 0,
        lender_name: "PayMagic Direct Recovery",
        status: "Contacted"
      };
      onCallCase(adHocCase);
    }
  };

  const agentExtension = user?.telephony_agent_id
    ? user.telephony_agent_id.replace(/\D/g, "").slice(-4) || "1012"
    : user?.emp_code
      ? user.emp_code.replace(/\D/g, "").slice(-4) || "1012"
      : "1012";

  // Floating trigger pill when dialer is closed or minimized
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-slate-900/95 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-md hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all group scale-100 active:scale-95"
        title="Open WebPhone Dialer"
      >
        <div className="relative">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-400/20" />
          </div>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            WebPhone
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              {agentExtension}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">● Ready</div>
        </div>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/60 shadow-2xl backdrop-blur-md text-white max-w-[calc(100vw-2rem)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-medium text-slate-300 truncate">
            WebPhone <span className="font-mono text-indigo-400 font-bold">{agentExtension}</span>
          </span>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
            Ready
          </span>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-700 pl-2 shrink-0">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Expand Dialer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
            title="Close Dialer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded WebPhone Dialer
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden font-sans text-white ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Dialer Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wide text-slate-100">WebPhone</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                Ext {agentExtension}
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">● Ready</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded transition-colors ${
              soundEnabled ? "text-slate-400 hover:text-white" : "text-rose-400 bg-rose-500/10"
            }`}
            title={soundEnabled ? "Mute DTMF sound" : "Unmute DTMF sound"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Number Input & Display Screen */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800/60">
        <div className="flex items-center gap-2 bg-slate-950/90 rounded-xl px-3 py-2 border border-slate-800 focus-within:border-indigo-500/60 transition-colors">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-transparent text-xs text-slate-300 font-mono font-semibold focus:outline-none cursor-pointer pr-1 border-r border-slate-800"
          >
            <option value="+91" className="bg-slate-900 text-white">🇮🇳 +91</option>
            <option value="+1" className="bg-slate-900 text-white">🇺🇸 +1</option>
            <option value="+44" className="bg-slate-900 text-white">🇬🇧 +44</option>
            <option value="+971" className="bg-slate-900 text-white">🇦🇪 +971</option>
          </select>

          <input
            type="text"
            placeholder="Enter phone number..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-transparent text-white font-mono text-sm tracking-wider focus:outline-none placeholder-slate-500"
            autoFocus
          />

          {phoneNumber && (
            <button
              onClick={handleBackspace}
              className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Matched Borrower Pill if matched */}
        {matchedCase && (
          <div
            onClick={() => onCallCase(matchedCase)}
            className="mt-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between cursor-pointer hover:bg-indigo-500/20 transition-all text-xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-indigo-200 truncate">
                  {matchedCase.customer_name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {matchedCase.case_number} • ₹{(matchedCase.outstanding_amount || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium group-hover:bg-emerald-500/30">
              Call Case
            </span>
          </div>
        )}
      </div>

      {/* Numeric Keypad Grid */}
      <div className="p-3 bg-slate-900/60">
        <div className="grid grid-cols-3 gap-2">
          {DIALPAD_KEYS.map((k) => (
            <button
              key={k.key}
              onClick={() => handleKeyPress(k.key)}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600/70 text-white transition-all active:scale-95 group focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <span className="text-base font-semibold leading-none text-slate-100 group-hover:text-white">
                {k.key}
              </span>
              {k.sub ? (
                <span className="text-[9px] font-medium tracking-widest text-slate-400 group-hover:text-slate-300 mt-1 uppercase">
                  {k.sub}
                </span>
              ) : (
                <span className="h-[9px] mt-1" />
              )}
            </button>
          ))}
        </div>

        {/* Action Controls & Big Call Button */}
        <div className="mt-3 flex items-center gap-2">
          {phoneNumber && (
            <button
              onClick={handleClear}
              className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition-colors"
              title="Clear input"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleDial}
            disabled={!phoneNumber.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 fill-white/20" />
            <span>Call</span>
          </button>
        </div>

        {/* Statutory Regulatory Badge */}
        <div className="mt-2 text-center">
          <span className="text-[9px] text-slate-500 font-mono tracking-tight">
            Encrypted WebRTC • Automatic RBI Recording
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebPhoneDialer;

