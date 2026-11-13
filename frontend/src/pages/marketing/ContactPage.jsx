import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Headphones
} from "lucide-react";
import api from "../../services/api";

export const ContactPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    portfolioSize: "₹10 Cr - ₹50 Cr",
    servicesRequested: "Voice Telephony & Call Recording",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/enquiries", form);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Get In Touch
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Connect With PayMagic Operations
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Whether you are a retail bank seeking recovery partners or require a demonstration of our telephony compliance engine, we are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details & Operations Hours */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-xl font-bold text-white">Corporate Headquarters</h3>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="text-indigo-400 shrink-0 mt-1" size={20} />
                  <span>
                    PayMagic Operations Hub, Tower 4, Cyber City, Magarpatta, Hadapsar, Pune, Maharashtra - 411028
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-indigo-400 shrink-0" size={20} />
                  <a href="mailto:contact@paymagic.in" className="hover:text-white transition-colors">
                    contact@paymagic.in
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-indigo-400 shrink-0" size={20} />
                  <span>+91 20 6711 9000 / +91 99001 12233</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="text-emerald-400 shrink-0" size={20} />
                  <span>Calling Ops Window: 08:00 - 19:00 IST (Mon - Sat)</span>
                </div>
              </div>
            </div>

            {/* Grievance Redressal Direct Escalation */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-3">
                <Headphones className="text-rose-400" size={24} />
                <h4 className="text-base font-bold text-white">Borrower Grievance Channel</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For dispute escalation regarding telecaller behavior, disputed balances, or calling hours complaints, contact our dedicated compliance desk directly:
              </p>
              <div className="pt-2 text-xs space-y-1 text-slate-300">
                <div><strong>Email:</strong> grievance@paymagic.in</div>
                <div><strong>Response SLA:</strong> Within 48 business hours</div>
                <div><strong>Nodal Officer:</strong> Bhushan Gaikwad (Director)</div>
              </div>
            </div>
          </div>

          {/* Interactive Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 bg-slate-950/80">
              <h3 className="text-2xl font-bold text-white mb-2">Send an Enquiry</h3>
              <p className="text-xs text-slate-400 mb-8">
                All enquiries are logged directly into our enterprise CRM for immediate review.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-white">Message Successfully Sent!</h4>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Thank you for reaching out. A PayMagic solution specialist will contact your team shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="e.g. Ramesh Kulkarni"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Official Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="r.kulkarni@bank.com"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98900 11223"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Organization / NBFC *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.organization}
                        onChange={(e) => setForm({ ...form, organization: e.target.value })}
                        placeholder="e.g. Axis Credit Services"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Message / Portfolio Specifications *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Share details about your loan portfolio, recovery volume, or telephony requirements..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Submit Corporate Enquiry</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

