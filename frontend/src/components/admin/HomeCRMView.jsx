import React, { useState } from "react";
import {
  Search,
  PhoneCall,
  MessageSquare,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  PhoneForwarded,
  Filter,
  ChevronDown
} from "lucide-react";

export default function HomeCRMView() {
  const [crmViewMode, setCrmViewMode] = useState("supervisor"); // 'supervisor' | 'agent'
  const [selectedCampaign, setSelectedCampaign] = useState("New URBAN BAJAJ-NOV-2026 - PREDICTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals / Drawers
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showPriorityTasksModal, setShowPriorityTasksModal] = useState(false);
  const [prioritySubTab, setPrioritySubTab] = useState("ptp"); // 'ptp' | 'call_drop' | 'missed_call'
  const [activeCallAccount, setActiveCallAccount] = useState(null);

  // 10 exact rows specified by the user
  const crmAccounts = [
    {
      name: "Mahendra Krushnarao Kodgirwar",
      accountNumber: "xxxxxxxxxx2278",
      phone: "xxxxxx6505",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Pune",
      outstanding: "₹1.21 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Sachin Sopanrao Mandale",
      accountNumber: "xxxxxxxxxx4631",
      phone: "xxxxxx2559",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Mumbai",
      outstanding: "₹3.73 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    },
    {
      name: "AMOL BARANGULE",
      accountNumber: "xxxxxxxxxx6003",
      phone: "xxxxxx7954",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Nashik",
      outstanding: "₹2.89 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Manoj Satyanarayan Pareek",
      accountNumber: "xxxxxxxxxxx7378",
      phone: "xxxxxx5096",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Nagpur",
      outstanding: "₹16 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    },
    {
      name: "Vijay Rajaram Ghorpade",
      accountNumber: "xxxxxxxxxxx4697",
      phone: "xxxxxx1547",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Kolhapur",
      outstanding: "₹3.03 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Siddharth Navnath Sonawane",
      accountNumber: "xxxxxxxxxxx1192",
      phone: "xxxxxx4067",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Aurangabad",
      outstanding: "₹1.06 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    },
    {
      name: "Kunal Surendra Pawar",
      accountNumber: "xxxxxxxxxx4699",
      phone: "xxxxxx3448",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Solapur",
      outstanding: "₹1.81 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "TUSHAR SAKPAL",
      accountNumber: "xxxxxxxxxx1354",
      phone: "xxxxxx4111",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Thane",
      outstanding: "₹4.5 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    },
    {
      name: "Datta Ashok Daundkar",
      accountNumber: "xxxxxxxxxx0938",
      phone: "xxxxxx7770",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Pune",
      outstanding: "₹1.43 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Jayprakash N Mhetre",
      accountNumber: "xxxxxxxxxxx5126",
      phone: "xxxxxx1926",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Satara",
      outstanding: "₹4.03 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    }
  ];

  // Call Drop exact 10 records specified by user
  const callDropRecords = [
    { name: "AKASH WAGH", acc: "xxxxxxxxxx3000", amount: "₹82.35 K" },
    { name: "GANESH GAIKWAD", acc: "xxxxxxxxxx4156", amount: "₹62.06 K" },
    { name: "PRASHANT MUKINDA SONAWANE", acc: "xxxxxxxxxx9211", amount: "₹8.22 Lakh" },
    { name: "RAVIKANT GANGADHAR CHAVAN", acc: "xxxxxxxxxx8484", amount: "₹5.73 Lakh" },
    { name: "SWAPNIL SHINDE", acc: "xxxxxxxxxx1290", amount: "₹1.01 Lakh" },
    { name: "SUNIL BABURAO KOLI", acc: "xxxxxxxxxx7721", amount: "₹1.89 Lakh" },
    { name: "VINOD MARUTI GAVHANE", acc: "xxxxxxxxxx3309", amount: "₹3.91 Lakh" },
    { name: "ASHOK RAJARAM JADHAV", acc: "xxxxxxxxxx5050", amount: "₹1.28 Lakh" },
    { name: "GORAKHNATH TUKARAM SHINDE", acc: "xxxxxxxxxx8912", amount: "₹3.02 Lakh" },
    { name: "VIJAY RAMCHANDRA KASBE", acc: "xxxxxxxxxx6431", amount: "₹2.12 Lakh" }
  ];

  const filteredAccounts = crmAccounts.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.accountNumber.includes(searchQuery) ||
    a.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Greeting & Top Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Hi, Priya Talekar</h2>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs font-semibold">
              <button
                onClick={() => setCrmViewMode("supervisor")}
                className={`px-2.5 py-0.5 rounded ${
                  crmViewMode === "supervisor" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                1. Supervisor View
              </button>
              <button
                onClick={() => setCrmViewMode("agent")}
                className={`px-2.5 py-0.5 rounded ${
                  crmViewMode === "agent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                2. Agent View
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track tasks, make calls, and monitor progress in real time.
          </p>
        </div>

        {/* Right Buttons: Switch campaigns, Messages, Priority Tasks */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Switch campaigns dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-semibold text-foreground">
            <span className="text-muted-foreground">Campaign:</span>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
            >
              <option value="New URBAN BAJAJ-NOV-2026 - PREDICTIVE">
                New URBAN BAJAJ-NOV-2026 - PREDICTIVE
              </option>
              <option value="RURAL-BAJAJ-Nov-2026-FINAL-DATA">
                RURAL-BAJAJ-Nov-2026-FINAL-DATA
              </option>
            </select>
          </div>

          {/* Messages Button */}
          <button
            onClick={() => setShowMessagesModal(true)}
            className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center gap-1.5 border border-border transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>Messages</span>
          </button>

          {/* Priority Tasks Button */}
          <button
            onClick={() => setShowPriorityTasksModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Priority Tasks</span>
          </button>
        </div>
      </div>

      {/* 9 Status KPI Blocks Specified by User */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Total accounts</span>
          <div className="text-base font-bold text-foreground mt-0.5">116</div>
          <div className="text-[10px] text-muted-foreground">₹2.79 Cr • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Not Contacted</span>
          <div className="text-base font-bold text-foreground mt-0.5">36</div>
          <div className="text-[10px] text-muted-foreground">₹91.38 L • 31.03%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Paid</span>
          <div className="text-base font-bold text-emerald-500 mt-0.5">0</div>
          <div className="text-[10px] text-muted-foreground">₹0 • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">PTP</span>
          <div className="text-base font-bold text-blue-500 mt-0.5">0</div>
          <div className="text-[10px] text-muted-foreground">₹0 • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">RTP</span>
          <div className="text-base font-bold text-rose-500 mt-0.5">0</div>
          <div className="text-[10px] text-muted-foreground">₹0 • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Call Back</span>
          <div className="text-base font-bold text-indigo-500 mt-0.5">0</div>
          <div className="text-[10px] text-muted-foreground">₹0 • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Settlement</span>
          <div className="text-base font-bold text-amber-500 mt-0.5">0</div>
          <div className="text-[10px] text-muted-foreground">₹0 • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Dispute</span>
          <div className="text-base font-bold text-red-500 mt-0.5">0</div>
          <div className="text-[10px] text-muted-foreground">₹0 • 0%</div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-[10px] text-muted-foreground">Untouched</span>
          <div className="text-base font-bold text-amber-500 mt-0.5">80</div>
          <div className="text-[10px] text-muted-foreground">₹1.88 Cr • 68.97%</div>
        </div>
      </div>

      {/* Accounts Queue Table */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-foreground">Delinquent Account Queue</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search account number, name or mobile..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Account Number</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Product</th>
                <th className="p-3">Bucket</th>
                <th className="p-3">Location</th>
                <th className="p-3">Outstanding</th>
                <th className="p-3">Follow Up Date</th>
                <th className="p-3">Latest Remarks</th>
                <th className="p-3">CC Agent</th>
                <th className="p-3">3p Disp</th>
                <th className="p-3">Best Disp</th>
                <th className="p-3">Last Disp</th>
                <th className="p-3">Agent</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAccounts.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">{row.name}</td>
                  <td className="p-3 font-mono text-muted-foreground">{row.accountNumber}</td>
                  <td className="p-3 font-mono text-muted-foreground">{row.phone}</td>
                  <td className="p-3 text-muted-foreground">{row.product}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {row.bucket}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{row.location}</td>
                  <td className="p-3 font-bold text-foreground">{row.outstanding}</td>
                  <td className="p-3 text-muted-foreground">{row.followUp}</td>
                  <td className="p-3 text-muted-foreground">{row.remarks}</td>
                  <td className="p-3 text-muted-foreground">{row.ccAgent}</td>
                  <td className="p-3 text-muted-foreground">{row.p3Disp}</td>
                  <td className="p-3 text-muted-foreground">{row.bestDisp}</td>
                  <td className="p-3 text-muted-foreground">{row.lastDisp}</td>
                  <td className="p-3 font-semibold text-foreground">{row.agent}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveCallAccount(row)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MESSAGES MODAL / DRAWER ── */}
      {showMessagesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-foreground">WhatsApp Messaging Logs</h3>
              </div>
              <button
                onClick={() => setShowMessagesModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Mobile Number</th>
                    <th className="p-2.5">Message</th>
                    <th className="p-2.5">Template Name</th>
                    <th className="p-2.5">Sent Date &amp; Time</th>
                    <th className="p-2.5">Delivery Status</th>
                    <th className="p-2.5">Read Status</th>
                    <th className="p-2.5">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/40">
                    <td className="p-2.5 font-mono">919876543210</td>
                    <td className="p-2.5 truncate max-w-xs">Dear Borrower, your EMI of ₹12,500 is overdue...</td>
                    <td className="p-2.5 font-mono text-muted-foreground">bajaj_overdue_notice_v1</td>
                    <td className="p-2.5 font-mono text-muted-foreground">2026-11-18 10:24:12</td>
                    <td className="p-2.5"><span className="text-emerald-500 font-bold">Delivered</span></td>
                    <td className="p-2.5"><span className="text-blue-500 font-bold">Read</span></td>
                    <td className="p-2.5 text-muted-foreground">Will pay on 22nd Nov</td>
                  </tr>
                  <tr className="hover:bg-muted/40">
                    <td className="p-2.5 font-mono">919812345678</td>
                    <td className="p-2.5 truncate max-w-xs">Immediate settlement offer available on account...</td>
                    <td className="p-2.5 font-mono text-muted-foreground">settlement_waiver_discount</td>
                    <td className="p-2.5 font-mono text-muted-foreground">2026-11-18 11:05:40</td>
                    <td className="p-2.5"><span className="text-emerald-500 font-bold">Delivered</span></td>
                    <td className="p-2.5"><span className="text-muted-foreground font-bold">Unread</span></td>
                    <td className="p-2.5 text-muted-foreground">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button
                onClick={() => setShowMessagesModal(false)}
                className="px-4 py-2 rounded-xl bg-card border border-border text-foreground font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIORITY TASKS MODAL ── */}
      {showPriorityTasksModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListTodo className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-foreground">Priority Tasks Queue</h3>
              </div>
              <button
                onClick={() => setShowPriorityTasksModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Tabs: 1. PTP / Call Back | 2. Call Drop | 3. Missed Call */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-border bg-muted/20">
              <button
                onClick={() => setPrioritySubTab("ptp")}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                  prioritySubTab === "ptp"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                1. PTP / Call Back
              </button>
              <button
                onClick={() => setPrioritySubTab("call_drop")}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                  prioritySubTab === "call_drop"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                2. Call Drop (10)
              </button>
              <button
                onClick={() => setPrioritySubTab("missed_call")}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                  prioritySubTab === "missed_call"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Missed Call
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 max-h-[460px] overflow-x-auto">
              {/* Tab 1: PTP / Call Back */}
              {prioritySubTab === "ptp" && (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Account Number</th>
                      <th className="p-2.5">Disposition</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/40">
                      <td className="p-2.5 font-bold text-foreground">Abhishek Wayal</td>
                      <td className="p-2.5 font-mono text-muted-foreground">xxxxxxxxxx5172</td>
                      <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">PTP</span></td>
                      <td className="p-2.5 font-bold text-foreground">₹5.72 Lakh</td>
                      <td className="p-2.5 text-rose-500 font-bold">Overdue: 34 hrs</td>
                      <td className="p-2.5 text-right">
                        <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                          Call
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Tab 2: Call Drop (10 Records) */}
              {prioritySubTab === "call_drop" && (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5">Borrower Name</th>
                      <th className="p-2.5">Account Number</th>
                      <th className="p-2.5">Default Amount</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {callDropRecords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/40">
                        <td className="p-2.5 font-bold text-foreground">{item.name}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{item.acc}</td>
                        <td className="p-2.5 font-bold text-amber-500">{item.amount}</td>
                        <td className="p-2.5 text-right">
                          <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                            Redial
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Tab 3: Missed Call (Empty State) */}
              {prioritySubTab === "missed_call" && (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <PhoneForwarded className="w-8 h-8 mx-auto text-muted-foreground/40" />
                  <div className="font-bold text-sm text-foreground">No Data Available</div>
                  <p className="text-xs">No missed inbound calls recorded for this campaign today.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button
                onClick={() => setShowPriorityTasksModal(false)}
                className="px-4 py-2 rounded-xl bg-card border border-border text-foreground font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLICK-TO-CALL DIALER POPUP ── */}
      {activeCallAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{activeCallAccount.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{activeCallAccount.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCallAccount(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono font-bold text-foreground">{activeCallAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding Amount:</span>
                <span className="font-bold text-foreground">{activeCallAccount.outstanding}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Agent:</span>
                <span className="font-semibold text-blue-500">{activeCallAccount.agent}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Compliant dialer active (08:00 - 19:00 IST). Mandatory call recording enabled.</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveCallAccount(null)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
