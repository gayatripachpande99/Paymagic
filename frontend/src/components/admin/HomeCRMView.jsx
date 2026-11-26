import React, { useState, useEffect } from "react";
import api from "../../services/api";
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

  const [filteredAccountsState, setFilteredAccountsState] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCases = async () => {
      try {
        const res = await api.get(`/admin/cases?limit=50${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`);
        if (isMounted && res.success && res.data?.cases?.length > 0) {
          const mapped = res.data.cases.map(c => ({
            name: c.borrower_name || c.customer_name || "Borrower",
            accountNumber: c.case_number || "CASE-REF",
            phone: c.phone_number || "+91 98******10",
            product: c.product || "Personal Loan",
            bucket: c.bucket || "Writeoff",
            location: c.city || "Pune",
            outstanding: `₹${Number(c.outstanding_amount).toLocaleString("en-IN")}`,
            followUp: c.next_action_date || "-",
            remarks: c.last_disposition_remarks || "-",
            ccAgent: c.assigned_agent_name || "-",
            p3Disp: "-",
            bestDisp: c.status || "-",
            lastDisp: c.last_disposition || "-",
            agent: c.assigned_agent_name || "Assigned Specialist"
          }));
          setFilteredAccountsState(mapped);
        }
      } catch (err) {
        // Fallback to initial
      }
    };
    fetchCases();
    return () => { isMounted = false; };
  }, [searchQuery]);

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
      outstanding: "₹3.09 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Akshay Subhash Pawar",
      accountNumber: "xxxxxxxxxxx5006",
      phone: "xxxxxx8787",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Satara",
      outstanding: "₹4.47 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    },
    {
      name: "GURUPRASAD ANIL RANE",
      accountNumber: "xxxxxxxxxxx4431",
      phone: "xxxxxx5588",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Ratnagiri",
      outstanding: "₹1.48 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Bapu Nagesh Khilare",
      accountNumber: "xxxxxxxxxxx4971",
      phone: "xxxxxx2834",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Solapur",
      outstanding: "₹3.28 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    },
    {
      name: "MOHASIN ABDULRAJJAK ATTAR",
      accountNumber: "xxxxxxxxxxx4679",
      phone: "xxxxxx5599",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Sangli",
      outstanding: "₹6.35 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Manisha Shete"
    },
    {
      name: "Prakash Ashok Mali",
      accountNumber: "xxxxxxxxxxx4765",
      phone: "xxxxxx4851",
      product: "Personal Loan",
      bucket: "Writeoff",
      location: "Jalgaon",
      outstanding: "₹2.29 Lakh",
      followUp: "-",
      remarks: "-",
      ccAgent: "-",
      p3Disp: "-",
      bestDisp: "-",
      lastDisp: "-",
      agent: "Priya Talekar"
    }
  ];

  // 10 exact rows for Call Drop sub-tab
  const callDropRows = [
    {
      name: "AKASH WAGH",
      acc: "**********9962",
      phone: "******4832",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹11,790",
      time: "18/11/26 03:24 PM",
      lastD: "-",
      bestD: "Call Back",
      camp: "RURAL-BAJAJ-Nov-2026-FINAL-DATA - 2026-11-04T11:51:10.944597521",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "GANESH GAIKWAD",
      acc: "**********4305",
      phone: "******5905",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹32,398",
      time: "18/11/26 03:06 PM",
      lastD: "-",
      bestD: "Not Contacted",
      camp: "RURAL-BAJAJ-Nov-2026-FINAL-DATA - 2026-11-04T11:51:10.944597521",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "Basant Kumar Behera",
      acc: "***********4206",
      phone: "******5001",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹1.02 Lakh",
      time: "18/11/26 09:07 AM",
      lastD: "-",
      bestD: "Not Contacted",
      camp: "URBAN BAJAJ-NOV-2026 - 2026-11-14T04:10:45.055221698",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "AKASH GADEKAR",
      acc: "**********2434",
      phone: "******0177",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹9,498",
      time: "18/11/26 03:17 PM",
      lastD: "-",
      bestD: "Call Back",
      camp: "RURAL-BAJAJ-Nov-2026-FINAL-DATA - 2026-11-04T11:51:10.944597521",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "SACHIN NAVNATH MALI",
      acc: "**********0198",
      phone: "******3749",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹2.29 Lakh",
      time: "18/11/26 03:35 PM",
      lastD: "-",
      bestD: "Call Back",
      camp: "RURAL-BAJAJ-Nov-2026-FINAL-DATA - 2026-11-04T11:51:10.944597521",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "Prasad Ramakant Zarkar",
      acc: "***********3991",
      phone: "******2253",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹5.23 Lakh",
      time: "18/11/26 11:38 AM",
      lastD: "-",
      bestD: "Not Contacted",
      camp: "URBAN BAJAJ-NOV-2026 - 2026-11-14T04:10:45.055221698",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "Prachi Arvind Meshram",
      acc: "***********0551",
      phone: "******7680",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹2 Lakh",
      time: "18/11/26 11:51 AM",
      lastD: "-",
      bestD: "Not Contacted",
      camp: "URBAN BAJAJ-NOV-2026 - 2026-11-14T04:10:45.055221698",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "GHARU DHONDIBA NAIK",
      acc: "**********8762",
      phone: "******7984",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹93,723",
      time: "18/11/26 11:45 AM",
      lastD: "-",
      bestD: "Dispute",
      camp: "URBAN BAJAJ-NOV-2026 - 2026-11-14T04:10:45.055221698",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "SANIYA NADEEM SAYYED",
      acc: "***********3810",
      phone: "******0258",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹2.33 Lakh",
      time: "18/11/26 09:36 AM",
      lastD: "-",
      bestD: "PTP",
      camp: "URBAN BAJAJ-NOV-2026 - 2026-11-14T04:10:45.055221698",
      dialed: "No",
      dDate: "-"
    },
    {
      name: "RANJANA KHANZODE",
      acc: "***********9127",
      phone: "******8898",
      prod: "Personal Loan",
      buck: "Writeoff",
      loc: "-",
      out: "₹96,125",
      time: "18/11/26 05:56 PM",
      lastD: "-",
      bestD: "Not Contacted",
      camp: "RURAL-BAJAJ-Nov-2026-FINAL-DATA - 2026-11-04T11:51:10.944597521",
      dialed: "No",
      dDate: "-"
    }
  ];

  const activeAccountList = filteredAccountsState || crmAccounts;
  const filteredAccounts = activeAccountList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.accountNumber.includes(searchQuery) ||
    a.phone.includes(searchQuery)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Greeting & Top Action Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "18px 24px",
          borderRadius: "16px",
          backgroundColor: "#051336",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Hi, Priya Talekar
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px",
              backgroundColor: "#020921",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.06)"
            }}
          >
            <button
              onClick={() => setCrmViewMode("supervisor")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: crmViewMode === "supervisor" ? 700 : 500,
                backgroundColor: crmViewMode === "supervisor" ? "#1d4ed8" : "transparent",
                color: crmViewMode === "supervisor" ? "#ffffff" : "#94a3b8",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              1. Supervisor View
            </button>
            <button
              onClick={() => setCrmViewMode("agent")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: crmViewMode === "agent" ? 700 : 500,
                backgroundColor: crmViewMode === "agent" ? "#1d4ed8" : "transparent",
                color: crmViewMode === "agent" ? "#ffffff" : "#94a3b8",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              2. Agent View
            </button>
          </div>
        </div>

        {/* Right Buttons: Switch campaigns, Messages, Priority Tasks */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          
          {/* Switch campaigns dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#020921",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: "12px",
              color: "#ffffff"
            }}
          >
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>Campaign:</span>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              style={{
                backgroundColor: "transparent",
                color: "#ffffff",
                fontWeight: 700,
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              <option value="New URBAN BAJAJ-NOV-2026 - PREDICTIVE" style={{ backgroundColor: "#041030", color: "#ffffff" }}>
                New URBAN BAJAJ-NOV-2026 - PREDICTIVE
              </option>
              <option value="RURAL-BAJAJ-Nov-2026-FINAL-DATA" style={{ backgroundColor: "#041030", color: "#ffffff" }}>
                RURAL-BAJAJ-Nov-2026-FINAL-DATA
              </option>
            </select>
          </div>

          {/* Messages Button */}
          <button
            onClick={() => setShowMessagesModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              backgroundColor: "#020921",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <MessageSquare style={{ width: "14px", height: "14px", color: "#60a5fa" }} />
            <span>Messages</span>
          </button>

          {/* Priority Tasks Button */}
          <button
            onClick={() => setShowPriorityTasksModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              backgroundColor: "#1d4ed8",
              border: "none",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(29, 78, 216, 0.35)",
              transition: "all 0.15s ease"
            }}
          >
            <ListTodo style={{ width: "14px", height: "14px" }} />
            <span>Priority Tasks</span>
          </button>
        </div>
      </div>

      {/* 9 Status KPI Blocks Specified by User */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "10px"
        }}
      >
        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Total accounts</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: "4px 0" }}>116</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹2.79 Cr • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Not Contacted</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: "4px 0" }}>36</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹91.38 L • 31.03%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(16, 185, 129, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Paid</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399", margin: "4px 0" }}>0</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹0 • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(37, 99, 235, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>PTP</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#60a5fa", margin: "4px 0" }}>0</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹0 • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(244, 63, 94, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>RTP</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#fb7185", margin: "4px 0" }}>0</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹0 • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(99, 102, 241, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Call Back</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#818cf8", margin: "4px 0" }}>0</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹0 • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(245, 158, 11, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Settlement</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#fbbf24", margin: "4px 0" }}>0</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹0 • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(239, 68, 68, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Dispute</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#f87171", margin: "4px 0" }}>0</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹0 • 0%</div>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#051336", border: "1px solid rgba(245, 158, 11, 0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Untouched</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#fbbf24", margin: "4px 0" }}>80</div>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>₹1.88 Cr • 68.97%</div>
        </div>
      </div>

      {/* Accounts Queue Table */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "16px",
          backgroundColor: "#051336",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Delinquent Account Queue
          </h3>
          <div style={{ position: "relative", minWidth: "280px" }}>
            <Search
              style={{
                width: "14px",
                height: "14px",
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b"
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search account number, name or mobile..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: "10px",
                backgroundColor: "#020921",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: "12px",
                color: "#ffffff",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)"
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Number</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone Number</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bucket</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Outstanding</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Follow Up Date</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Latest Remarks</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>CC Agent</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>3p Disp</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Disp</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Disp</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent</th>
                <th style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "14px 14px", fontWeight: 600, color: "#ffffff" }}>{row.name}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8", fontFamily: "monospace" }}>{row.accountNumber}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8", fontFamily: "monospace" }}>{row.phone}</td>
                  <td style={{ padding: "14px 14px", color: "#cbd5e1" }}>{row.product}</td>
                  <td style={{ padding: "14px 14px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "rgba(245, 158, 11, 0.12)",
                        color: "#fbbf24",
                        border: "1px solid rgba(245, 158, 11, 0.25)"
                      }}
                    >
                      {row.bucket}
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.location}</td>
                  <td style={{ padding: "14px 14px", fontWeight: 700, color: "#ffffff" }}>{row.outstanding}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.followUp}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.remarks}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.ccAgent}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.p3Disp}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.bestDisp}</td>
                  <td style={{ padding: "14px 14px", color: "#94a3b8" }}>{row.lastDisp}</td>
                  <td style={{ padding: "14px 14px", fontWeight: 600, color: "#ffffff" }}>{row.agent}</td>
                  <td style={{ padding: "14px 14px", textAlign: "right" }}>
                    <button
                      onClick={() => setActiveCallAccount(row)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#1d4ed8",
                        border: "none",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: "0 2px 4px rgba(29, 78, 216, 0.25)"
                      }}
                    >
                      <PhoneCall style={{ width: "12px", height: "12px" }} />
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "880px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MessageSquare style={{ width: "18px", height: "18px", color: "#34d399" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  WhatsApp Messaging Logs
                </h3>
              </div>
              <button
                onClick={() => setShowMessagesModal(false)}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <div style={{ padding: "16px 20px", overflowX: "auto", maxHeight: "460px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
                <thead>
                  <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Name</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Account No.</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Phone Number</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Product</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Bucket</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Allocator</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Outstanding</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Time</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>Mahendra Krushnarao Kodgirwar</td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>xxxxxxxxxx2278</td>
                    <td style={{ padding: "12px", fontFamily: "monospace", color: "#cbd5e1" }}>xxxxxx6505</td>
                    <td style={{ padding: "12px", color: "#cbd5e1" }}>Personal Loan</td>
                    <td style={{ padding: "12px", color: "#fbbf24", fontWeight: 700 }}>Writeoff</td>
                    <td style={{ padding: "12px", color: "#cbd5e1" }}>Bajaj Finserve</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>₹1.21 Lakh</td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>18-11-2026</td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>10:24 AM</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                        Delivered
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button style={{ padding: "5px 12px", borderRadius: "6px", backgroundColor: "#1d4ed8", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>
                        View
                      </button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>Sachin Sopanrao Mandale</td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>xxxxxxxxxx4631</td>
                    <td style={{ padding: "12px", fontFamily: "monospace", color: "#cbd5e1" }}>xxxxxx2559</td>
                    <td style={{ padding: "12px", color: "#cbd5e1" }}>Personal Loan</td>
                    <td style={{ padding: "12px", color: "#fbbf24", fontWeight: 700 }}>Writeoff</td>
                    <td style={{ padding: "12px", color: "#cbd5e1" }}>Bajaj Finserve</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>₹3.73 Lakh</td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>18-11-2026</td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>11:05 AM</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", border: "1px solid rgba(37, 99, 235, 0.3)" }}>
                        Sent
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button style={{ padding: "5px 12px", borderRadius: "6px", backgroundColor: "#1d4ed8", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "#020921", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowMessagesModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIORITY TASKS MODAL ── */}
      {showPriorityTasksModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "960px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ListTodo style={{ width: "18px", height: "18px", color: "#60a5fa" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Priority Tasks Queue
                </h3>
              </div>
              <button
                onClick={() => setShowPriorityTasksModal(false)}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* 3 Tabs: 1. PTP / Call Back | 2. Call Drop | 3. Missed Call */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 20px 0 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "#020921"
              }}
            >
              {[
                { id: "ptp", label: "1. PTP / Call Back" },
                { id: "call_drop", label: "2. Call Drop (10)" },
                { id: "missed_call", label: "3. Missed Call" }
              ].map((tab) => {
                const isActive = prioritySubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPrioritySubTab(tab.id)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "12px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#60a5fa" : "#94a3b8",
                      border: "none",
                      borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div style={{ padding: "20px", maxHeight: "500px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Tab 1: PTP / Call Back */}
              {prioritySubTab === "ptp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>PTP</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Accounts: </span><strong style={{ color: "#ffffff" }}>0</strong></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Amount: </span><strong style={{ color: "#ffffff" }}>₹0</strong></div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Call Back</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Accounts: </span><strong style={{ color: "#ffffff" }}>1</strong></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Amount: </span><strong style={{ color: "#ffffff" }}>₹0</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Name</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Account Number</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Phone Number</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Product</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Bucket</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Location</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Outstanding</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Last Disposition</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Followup Date</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>PTP Date</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Best Disposition</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Last Campaign</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>Abhishek Wayal</td>
                          <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>**********5917</td>
                          <td style={{ padding: "12px", fontFamily: "monospace", color: "#cbd5e1" }}>******2022</td>
                          <td style={{ padding: "12px", color: "#cbd5e1" }}>Personal Loan</td>
                          <td style={{ padding: "12px", color: "#fbbf24", fontWeight: 700 }}>Writeoff</td>
                          <td style={{ padding: "12px", color: "#94a3b8" }}>-</td>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>₹8,572</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(37, 99, 235, 0.15)", color: "#60a5fa" }}>
                              Call Back
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>18/11/26</td>
                          <td style={{ padding: "12px", color: "#94a3b8" }}>-</td>
                          <td style={{ padding: "12px", color: "#34d399", fontWeight: 700 }}>PTP</td>
                          <td style={{ padding: "12px", color: "#94a3b8" }}>RURAL-BAJAJ-Nov-2026-FINAL-DATA</td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            <button style={{ padding: "5px 12px", borderRadius: "6px", backgroundColor: "#1d4ed8", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>
                              Call
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Call Drop */}
              {prioritySubTab === "call_drop" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Total Call Drop</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Accounts: </span><strong style={{ color: "#ffffff" }}>17</strong></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Amount: </span><strong style={{ color: "#ffffff" }}>₹26.42 Lakh</strong></div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Pending Call Drop</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Accounts: </span><strong style={{ color: "#ffffff" }}>12</strong></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Amount: </span><strong style={{ color: "#ffffff" }}>₹17.51 Lakh</strong></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Name</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Account Number</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Phone Number</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Product</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Bucket</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Location</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Outstanding</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Call Drop Time</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Last Disposition</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Best Disposition</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Last Campaign</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Dialed</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Dialed Date</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {callDropRows.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                            <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>{row.name}</td>
                            <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>{row.acc}</td>
                            <td style={{ padding: "12px", fontFamily: "monospace", color: "#cbd5e1" }}>{row.phone}</td>
                            <td style={{ padding: "12px", color: "#cbd5e1" }}>{row.prod}</td>
                            <td style={{ padding: "12px", color: "#fbbf24", fontWeight: 700 }}>{row.buck}</td>
                            <td style={{ padding: "12px", color: "#94a3b8" }}>{row.loc}</td>
                            <td style={{ padding: "12px", fontWeight: 700, color: "#ffffff" }}>{row.out}</td>
                            <td style={{ padding: "12px", color: "#94a3b8", fontFamily: "monospace" }}>{row.time}</td>
                            <td style={{ padding: "12px", color: "#94a3b8" }}>{row.lastD}</td>
                            <td style={{ padding: "12px", color: "#60a5fa", fontWeight: 600 }}>{row.bestD}</td>
                            <td style={{ padding: "12px", color: "#94a3b8", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{row.camp}</td>
                            <td style={{ padding: "12px", color: "#94a3b8" }}>{row.dialed}</td>
                            <td style={{ padding: "12px", color: "#94a3b8" }}>{row.dDate}</td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <button style={{ padding: "5px 12px", borderRadius: "6px", backgroundColor: "#1d4ed8", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>
                                Redial
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Missed Call */}
              {prioritySubTab === "missed_call" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#020921", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Name</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Mobile Number</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Account Number</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Campaign Name</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Campaign Type</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Last Agent Called</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Product</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Bucket</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Outstanding</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Missed Call Date</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Missed Call Time</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Last Disposition</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px" }}>Best Disposition</th>
                          <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 700, fontSize: "11px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan="14" style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                            <PhoneForwarded style={{ width: "32px", height: "32px", margin: "0 auto 8px auto", color: "rgba(255, 255, 255, 0.2)" }} />
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>No data</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "#020921", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowPriorityTasksModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLICK-TO-CALL DIALER POPUP ── */}
      {activeCallAccount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(37, 99, 235, 0.2)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <PhoneCall style={{ width: "16px", height: "16px" }} />
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    {activeCallAccount.name}
                  </h4>
                  <p style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace", margin: 0 }}>
                    {activeCallAccount.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCallAccount(null)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "#020921",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Account Number:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#ffffff" }}>{activeCallAccount.accountNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Outstanding Amount:</span>
                <span style={{ fontWeight: 700, color: "#ffffff" }}>{activeCallAccount.outstanding}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Assigned Agent:</span>
                <span style={{ fontWeight: 600, color: "#60a5fa" }}>{activeCallAccount.agent}</span>
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                fontSize: "11px",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <CheckCircle2 style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>Compliant dialer active (08:00 - 19:00 IST). Mandatory call recording enabled.</span>
            </div>

            <button
              onClick={() => setActiveCallAccount(null)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#e11d48",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
