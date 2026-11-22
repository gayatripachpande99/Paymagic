import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Award,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Check,
  ChevronRight,
  FolderPlus,
  Play,
  Layers,
  Sparkles,
  UserMinus,
  Edit,
  Eye,
  Unlock,
  Upload,
  FileUp,
  FileText
} from "lucide-react";

// Products specified by user
const PRODUCT_OPTIONS = [
  "Agri Loan",
  "Auto Loan",
  "Business Loan",
  "CASA",
  "Commercial Business",
  "Commercial Vehicle",
  "Credit Card",
  "Gold Loan",
  "Home Loan",
  "Mortgage",
  "Personal Loan",
  "Tractor",
  "Two Wheeler",
  "Consumer Durable"
];

// Buckets specified by user
const BUCKET_OPTIONS = [
  "Post Due",
  "Pre Due",
  "Bucket 1",
  "Bucket 2",
  "Bucket 3",
  "Bucket 4",
  "Bucket 5",
  "Bucket 6",
  "Sup",
  "NPA",
  "NILPOS",
  "PDM",
  "Live",
  "Recovery",
  "ODBC",
  "Writeoff"
];

const INITIAL_AGENTS = [
  {
    name: "Manisha Shete",
    supervisor: "Priya Talekar",
    yucollectId: "YC7428",
    agency: "PayMagic PVT LTD",
    agencyEmployeeId: "PM2610MS0004",
    contact: "9359060141",
    channel: "CALL",
    product: "Consumer Durable",
    bucket: "Writeoff",
    dra: "No",
    area: "Pune",
    basePincode: "400063",
    residencePincode: "400063",
    currentAddress: "Pune",
    permanentAddress: "Pune",
    experience: "Freshar",
    campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA, URBAN BAJAJ-NOV-2026, no Use",
    acr: "200 - 300"
  },
  {
    name: "Bhushan Gaikwad",
    supervisor: "Priya Talekar",
    yucollectId: "YC7426",
    agency: "PayMagic PVT LTD",
    agencyEmployeeId: "PM2609BG0002",
    contact: "7767896125",
    channel: "CALL",
    product: "Consumer Durable",
    bucket: "Writeoff",
    dra: "No",
    area: "Pune",
    basePincode: "400063",
    residencePincode: "400063",
    currentAddress: "Pune",
    permanentAddress: "Pune",
    experience: ">2 years",
    campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA, URBAN BAJAJ-NOV-2026, no Use",
    acr: "200 - 300"
  },
  {
    name: "Akshaya Ganji",
    supervisor: "Priya Talekar",
    yucollectId: "YC7427",
    agency: "PayMagic PVT LTD",
    agencyEmployeeId: "PM2610AG0003",
    contact: "8080003116",
    channel: "CALL",
    product: "Consumer Durable",
    bucket: "Writeoff",
    dra: "No",
    area: "Pune",
    basePincode: "400063",
    residencePincode: "400063",
    currentAddress: "Pune",
    permanentAddress: "Pune",
    experience: "1-2 years",
    campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA, URBAN BAJAJ-NOV-2026, no Use",
    acr: "200 - 300"
  },
  {
    name: "Priya Talekar",
    supervisor: "Priya Talekar",
    yucollectId: "YC7425",
    agency: "PayMagic PVT LTD",
    agencyEmployeeId: "PM2610PT0005",
    contact: "7038155166",
    channel: "CALL",
    product: "Consumer Durable",
    bucket: "Writeoff",
    dra: "No",
    area: "Pune",
    basePincode: "400063",
    residencePincode: "400063",
    currentAddress: "Pune",
    permanentAddress: "Pune",
    experience: "1-2 years",
    campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA, URBAN BAJAJ-NOV-2026, no Use",
    acr: "200 - 300"
  }
];

export default function AgentDirectoryView() {
  // 4 Sub-fields under Agent:
  // 1. agent list
  // 2. agent group
  // 3. compaign
  // 4. incentives
  const [agentSubTab, setAgentSubTab] = useState("agent_list");

  // ── 1. AGENT LIST SUB-TAB STATE ──
  const [agentsList, setAgentsList] = useState(INITIAL_AGENTS);
  const [agentListFilter, setAgentListFilter] = useState("all"); // 'all' | 'call' | 'field'
  const [searchAgentList, setSearchAgentList] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [activeActionModal, setActiveActionModal] = useState(null); // 'view_profile' | 'edit_profile' | 'offboard' | 'unblock'
  const [selectedAgentForModal, setSelectedAgentForModal] = useState(null);

  // ── AGENT ONBOARDING FORM MODAL STATE ──
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [onboardingTab, setOnboardingTab] = useState("profile"); // 'profile' | 'kyc' | 'skills' | 'contract'
  const [onboardingErrors, setOnboardingErrors] = useState({});
  const [onboardingSuccessToast, setOnboardingSuccessToast] = useState("");

  const initialOnboardingFormData = {
    // Profile
    name: "",
    allocatorName: "",
    email: "",
    phone: "",
    employeeId: "",
    supervisor: "",
    product: "",
    bucket: "",
    role: "",
    channel: "call",
    acr: "",
    city: "",
    area: "",
    basePincode: "",
    currentAddress: "",
    permanentAddress: "",
    residencePincode: "",

    // KYC Details (uploaded file names)
    aadhaarCard: "",
    panCard: "",
    draCertificate: "",
    pccPvcCertificate: "",
    higherEducationMarksheet: "",
    passportPhoto: "",
    cancelCheque: "",
    experienceLetter: "",

    // Skills
    language: "",
    collectionExperience: "",
    draStatus: "",

    // Agent Contract
    activeStatus: "",
    workingDays: "",
    startDate: "",
    endDate: "",
    shiftStartTime: "",
    shiftEndTime: "",
    cashThreshold: ""
  };

  const [agentFormData, setAgentFormData] = useState(initialOnboardingFormData);

  // ── 2. AGENT GROUP SUB-TAB STATE ──
  const [groupSubTab, setGroupSubTab] = useState("groups"); // 'groups' | 'ungrouped'
  const [searchGroup, setSearchGroup] = useState("");
  const [assessmentFinished, setAssessmentFinished] = useState(false);

  // ── 3. CAMPAIGN SUB-TAB STATE ──
  const [searchCampaign, setSearchCampaign] = useState("");
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);

  // ── 4. INCENTIVES SUB-TAB STATE ──
  const [searchIncentive, setSearchIncentive] = useState("");
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);

  // 8 Exact Campaign records specified by user
  const campaignsList = [
    {
      name: "New URBAN BAJAJ-NOV-2026",
      category: "PREDICTIVE",
      borrowerCount: 4,
      leftOutBorrower: 0,
      contactability: "78%",
      agentsCount: 4,
      completedAutochurns: 0,
      lob: "Personal Loan",
      status: "Running"
    },
    {
      name: "no Use",
      category: "PREDICTIVE",
      borrowerCount: 0,
      leftOutBorrower: 0,
      contactability: "-",
      agentsCount: 0,
      completedAutochurns: 0,
      lob: "Personal Loan",
      status: "Running"
    },
    {
      name: "URBAN BAJAJ-NOV-2026",
      category: "PREDICTIVE",
      borrowerCount: 4,
      leftOutBorrower: 9,
      contactability: "64%",
      agentsCount: 4,
      completedAutochurns: 1,
      lob: "Consumer Durable",
      status: "Running"
    },
    {
      name: "RURAL-BAJAJ-Nov-2026-FINAL-DATA",
      category: "PREDICTIVE",
      borrowerCount: 4,
      leftOutBorrower: 17,
      contactability: "71%",
      agentsCount: 4,
      completedAutochurns: 2,
      lob: "Consumer Durable",
      status: "Running"
    },
    {
      name: "Sem Bajaj",
      category: "PREDICTIVE",
      borrowerCount: 4,
      leftOutBorrower: 0,
      contactability: "55%",
      agentsCount: 4,
      completedAutochurns: 0,
      lob: "Personal Loan",
      status: "Running"
    },
    {
      name: "Samp. Bajaj Rural",
      category: "MANUAL",
      borrowerCount: 4,
      leftOutBorrower: 0,
      contactability: "48%",
      agentsCount: 4,
      completedAutochurns: 0,
      lob: "Personal Loan",
      status: "Running"
    },
    {
      name: "Poonawala",
      category: "PREDICTIVE",
      borrowerCount: 4,
      leftOutBorrower: 16,
      contactability: "62%",
      agentsCount: 4,
      completedAutochurns: 1,
      lob: "Auto Loan",
      status: "Running"
    },
    {
      name: "Bajaj",
      category: "MANUAL",
      borrowerCount: 4,
      leftOutBorrower: 0,
      contactability: "50%",
      agentsCount: 4,
      completedAutochurns: 0,
      lob: "Personal Loan",
      status: "Running"
    }
  ];

  const filteredAgents = agentsList.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchAgentList.toLowerCase()) ||
      a.contact.includes(searchAgentList) ||
      a.yucollectId.toLowerCase().includes(searchAgentList.toLowerCase());
    if (agentListFilter === "field") return matchesSearch && a.channel === "FIELD";
    if (agentListFilter === "call") return matchesSearch && a.channel === "CALL";
    return matchesSearch;
  });

  const filteredCampaigns = campaignsList.filter((c) =>
    c.name.toLowerCase().includes(searchCampaign.toLowerCase()) ||
    c.lob.toLowerCase().includes(searchCampaign.toLowerCase()) ||
    c.category.toLowerCase().includes(searchCampaign.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── AGENT SUB-NAVIGATION TABS (4 SUB-FIELDS) ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "20px",
          borderRadius: "16px",
          backgroundColor: "#041030",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Agent &amp; Campaign Center
          </h2>
        </div>

        {/* 4 Sub-Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px",
            backgroundColor: "#020921",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            overflowX: "auto"
          }}
        >
          {[
            { id: "agent_list", label: "1. Agent List" },
            { id: "agent_group", label: "2. Agent Group" },
            { id: "campaign", label: "3. Campaign" },
            { id: "incentives", label: "4. Incentives" }
          ].map((tab) => {
            const isActive = agentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAgentSubTab(tab.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? "#1d4ed8" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                  boxShadow: isActive ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          1. AGENT LIST SUB-TAB
         ═══════════════════════════════════════════════════════ */}
      {agentSubTab === "agent_list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Header & Subtitle Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Agents list
              </h3>
              <button
                onClick={() => {
                  setOnboardingErrors({});
                  setOnboardingTab("profile");
                  setShowAddAgentModal(true);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#1d4ed8",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
              >
                <Plus style={{ width: "15px", height: "15px" }} />
                <span>+ Add Agent</span>
              </button>
            </div>

            {/* 4 KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
                paddingTop: "6px"
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", display: "block" }}>Total Agents</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>{agentsList.length}</div>
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", display: "block" }}>Online Agents</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>0</div>
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", display: "block" }}>Unallocated Agents</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#fbbf24", marginTop: "2px" }}>0</div>
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", display: "block" }}>Nil Allocated Agents</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#fb7185", marginTop: "2px" }}>0</div>
              </div>
            </div>
          </div>

          {/* Controls: 3 Buttons without button styling (All Agent, Call Agent, Field Agent) + Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "4px"
            }}
          >
            {/* 3 Buttons in one line: first is all agent, second is call agent, third is field agent. Only text, selected button bottom side line */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <button
                onClick={() => setAgentListFilter("all")}
                style={{
                  padding: "8px 4px",
                  fontSize: "13px",
                  fontWeight: agentListFilter === "all" ? 700 : 500,
                  backgroundColor: "transparent",
                  color: agentListFilter === "all" ? "#60a5fa" : "#94a3b8",
                  border: "none",
                  borderBottom: agentListFilter === "all" ? "2px solid #3b82f6" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                All Agent
              </button>
              <button
                onClick={() => setAgentListFilter("call")}
                style={{
                  padding: "8px 4px",
                  fontSize: "13px",
                  fontWeight: agentListFilter === "call" ? 700 : 500,
                  backgroundColor: "transparent",
                  color: agentListFilter === "call" ? "#60a5fa" : "#94a3b8",
                  border: "none",
                  borderBottom: agentListFilter === "call" ? "2px solid #3b82f6" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                Call Agent
              </button>
              <button
                onClick={() => setAgentListFilter("field")}
                style={{
                  padding: "8px 4px",
                  fontSize: "13px",
                  fontWeight: agentListFilter === "field" ? 700 : 500,
                  backgroundColor: "transparent",
                  color: agentListFilter === "field" ? "#60a5fa" : "#94a3b8",
                  border: "none",
                  borderBottom: agentListFilter === "field" ? "2px solid #3b82f6" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                Field Agent
              </button>

              {/* Show "Create Agent Group" button ONLY when select "Call Agent" */}
              {agentListFilter === "call" && (
                <button
                  onClick={() => setAgentSubTab("agent_group")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(5, 150, 105, 0.3)",
                    transition: "all 0.15s ease",
                    marginLeft: "8px"
                  }}
                >
                  <FolderPlus style={{ width: "14px", height: "14px" }} />
                  <span>Create Agent Group</span>
                </button>
              )}
            </div>

            {/* Search input */}
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  width: "14px",
                  height: "14px",
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}
              />
              <input
                type="text"
                value={searchAgentList}
                onChange={(e) => setSearchAgentList(e.target.value)}
                placeholder="Search account number, name or mobile..."
                style={{
                  paddingLeft: "36px",
                  paddingRight: "14px",
                  paddingTop: "7px",
                  paddingBottom: "7px",
                  borderRadius: "10px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "12px",
                  color: "#ffffff",
                  outline: "none",
                  width: "280px"
                }}
              />
            </div>
          </div>

          {/* Full Agents Table (All Exact Columns) */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  <tr>
                    <th style={{ padding: "12px 14px" }}>Agent Name</th>
                    <th style={{ padding: "12px 14px" }}>Supervisor</th>
                    <th style={{ padding: "12px 14px" }}>Yucollect ID</th>
                    <th style={{ padding: "12px 14px" }}>Agency</th>
                    <th style={{ padding: "12px 14px" }}>Agency employee ID</th>
                    <th style={{ padding: "12px 14px" }}>Agent Contact</th>
                    <th style={{ padding: "12px 14px" }}>Channel</th>
                    <th style={{ padding: "12px 14px" }}>Product</th>
                    <th style={{ padding: "12px 14px" }}>Bucket</th>
                    <th style={{ padding: "12px 14px" }}>DRA</th>
                    <th style={{ padding: "12px 14px" }}>Area</th>
                    <th style={{ padding: "12px 14px" }}>Base Pincode</th>
                    <th style={{ padding: "12px 14px" }}>Residence Pincode</th>
                    <th style={{ padding: "12px 14px" }}>Current Address</th>
                    <th style={{ padding: "12px 14px" }}>Permanent Address</th>
                    <th style={{ padding: "12px 14px" }}>Experience</th>
                    <th style={{ padding: "12px 14px" }}>Campaign</th>
                    <th style={{ padding: "12px 14px" }}>ACR</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <td style={{ padding: "14px", fontWeight: 600, color: "#ffffff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "9999px",
                              backgroundColor: "rgba(37, 99, 235, 0.2)",
                              color: "#60a5fa",
                              fontWeight: 700,
                              fontSize: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            {agent.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{agent.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{agent.supervisor}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", fontWeight: 700, color: "#60a5fa" }}>{agent.yucollectId}</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{agent.agency}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#94a3b8" }}>{agent.agencyEmployeeId}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#ffffff", fontWeight: 600 }}>{agent.contact}</td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: "rgba(37, 99, 235, 0.15)",
                            color: "#60a5fa",
                            border: "1px solid rgba(37, 99, 235, 0.3)"
                          }}
                        >
                          {agent.channel}
                        </span>
                      </td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{agent.product}</td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.3)"
                          }}
                        >
                          {agent.bucket}
                        </span>
                      </td>
                      <td style={{ padding: "14px", color: "#94a3b8" }}>{agent.dra}</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{agent.area}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#94a3b8" }}>{agent.basePincode}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#94a3b8" }}>{agent.residencePincode}</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{agent.currentAddress}</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{agent.permanentAddress}</td>
                      <td style={{ padding: "14px", color: "#ffffff", fontWeight: 500 }}>{agent.experience}</td>
                      <td style={{ padding: "14px", color: "#94a3b8", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis" }} title={agent.campaign}>
                        {agent.campaign}
                      </td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#ffffff" }}>{agent.acr}</td>
                      <td style={{ padding: "14px", textAlign: "right", position: "relative" }}>
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === idx ? null : idx)}
                          style={{
                            padding: "4px",
                            borderRadius: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer"
                          }}
                        >
                          <MoreVertical style={{ width: "16px", height: "16px" }} />
                        </button>

                        {/* Three Dots Dropdown Menu: View Profile, Edit Profile, Offboard Agent, Unblock User */}
                        {actionMenuOpen === idx && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              marginTop: "4px",
                              width: "180px",
                              borderRadius: "12px",
                              backgroundColor: "#051336",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              padding: "6px",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.7)",
                              zIndex: 50,
                              textAlign: "left"
                            }}
                            onClick={() => setActionMenuOpen(null)}
                          >
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("view_profile");
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#ffffff",
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "left"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <Eye style={{ width: "14px", height: "14px", color: "#60a5fa" }} />
                              <span>View Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("edit_profile");
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#ffffff",
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "left"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <Edit style={{ width: "14px", height: "14px", color: "#fbbf24" }} />
                              <span>Edit Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("offboard");
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#fb7185",
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "left"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.1)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <UserMinus style={{ width: "14px", height: "14px", color: "#fb7185" }} />
                              <span>Offboard Agent</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("unblock");
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#34d399",
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "left"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <Unlock style={{ width: "14px", height: "14px", color: "#34d399" }} />
                              <span>Unblock User</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          2. AGENT GROUPS SUB-TAB (Map agents to campaigns)
         ═══════════════════════════════════════════════════════ */}
      {agentSubTab === "agent_group" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Header & Finish Assessment Button */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Map agents to campaigns
              </h3>
            </div>

            {/* Top Right Button: Finish Assessment */}
            <button
              onClick={() => setAssessmentFinished(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "#1d4ed8",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)"
              }}
            >
              <Check style={{ width: "16px", height: "16px" }} />
              <span>Finish Assessment</span>
            </button>
          </div>

          {assessmentFinished && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <CheckCircle2 style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>Assessment completed and mapped campaigns synchronized across active dialers.</span>
            </div>
          )}

          {/* 4 KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px"
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Total Agents</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>4</div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Online Agents</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>0</div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Unallocated Agents</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#fbbf24", marginTop: "2px" }}>0</div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Nil Allocated Agents</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#fb7185", marginTop: "2px" }}>0</div>
            </div>
          </div>

          {/* Sub-Tabs: 1. Agent Groups | 2. Ungrouped Agents */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "8px"
            }}
          >
            <button
              onClick={() => setGroupSubTab("groups")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: groupSubTab === "groups" ? 700 : 500,
                backgroundColor: groupSubTab === "groups" ? "#1d4ed8" : "transparent",
                color: groupSubTab === "groups" ? "#ffffff" : "#94a3b8",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: groupSubTab === "groups" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none"
              }}
            >
              1. Agent Groups
            </button>
            <button
              onClick={() => setGroupSubTab("ungrouped")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: groupSubTab === "ungrouped" ? 700 : 500,
                backgroundColor: groupSubTab === "ungrouped" ? "#1d4ed8" : "transparent",
                color: groupSubTab === "ungrouped" ? "#ffffff" : "#94a3b8",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: groupSubTab === "ungrouped" ? "0 2px 4px rgba(29, 78, 216, 0.3)" : "none"
              }}
            >
              2. Ungrouped Agents (1)
            </button>
          </div>

          {/* 1. Agent Groups View */}
          {groupSubTab === "groups" && (
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Active Agent Groups</h4>
                <div style={{ position: "relative" }}>
                  <Search style={{ width: "14px", height: "14px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                    placeholder="Search account number, name or mobile..."
                    style={{
                      paddingLeft: "36px",
                      paddingRight: "14px",
                      paddingTop: "7px",
                      paddingBottom: "7px",
                      borderRadius: "10px",
                      backgroundColor: "#020921",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "12px",
                      color: "#ffffff",
                      outline: "none",
                      width: "260px"
                    }}
                  />
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
                  <thead style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <tr>
                      <th style={{ padding: "12px 14px" }}>Agent Group</th>
                      <th style={{ padding: "12px 14px" }}>Agents Count</th>
                      <th style={{ padding: "12px 14px" }}>% Collections</th>
                      <th style={{ padding: "12px 14px" }}>Campaign</th>
                      <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "14px", fontWeight: 600, color: "#ffffff" }}>Bajaj Rural Telecalling Alpha</td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#ffffff" }}>3</td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#34d399" }}>28.4%</td>
                      <td style={{ padding: "14px", color: "#cbd5e1", fontWeight: 500 }}>RURAL-BAJAJ-Nov-2026-FINAL-DATA</td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <button
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer"
                          }}
                        >
                          Manage Group
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Ungrouped Agents View */}
          {groupSubTab === "ungrouped" && (
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                backgroundColor: "#041030",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Ungrouped Agents</h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
                  <thead style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <tr>
                      <th style={{ padding: "12px 14px" }}>Agent Name</th>
                      <th style={{ padding: "12px 14px" }}>Yucollect ID</th>
                      <th style={{ padding: "12px 14px" }}>Agency Employee ID</th>
                      <th style={{ padding: "12px 14px" }}>Agent Contact</th>
                      <th style={{ padding: "12px 14px" }}>Product</th>
                      <th style={{ padding: "12px 14px" }}>Bucket</th>
                      <th style={{ padding: "12px 14px" }}>Experience</th>
                      <th style={{ padding: "12px 14px" }}>Campaign</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "14px", fontWeight: 600, color: "#ffffff" }}>Manisha Shete</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#94a3b8" }}>6ad891176be37f003bc8c01f</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#94a3b8" }}>PM2610MS0004</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#ffffff", fontWeight: 600 }}>9359060141</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>Consumer Durable</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                          Writeoff
                        </span>
                      </td>
                      <td style={{ padding: "14px", color: "#ffffff", fontWeight: 500 }}>Freshar</td>
                      <td style={{ padding: "14px", color: "#94a3b8", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        RURAL-BAJAJ-Nov-2026-FINAL-DATA, URBAN BAJAJ-NOV-2026, no Use
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          3. CAMPAIGN SUB-TAB
         ═══════════════════════════════════════════════════════ */}
      {agentSubTab === "campaign" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Header Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Campaign Management
            </h3>
            
            {/* 6 KPIs: Total Agents 4, Online 0, Unallocated 0, Nil Allocated 0, Total Campaigns 8, Active Campaigns 8 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                paddingTop: "4px"
              }}
            >
              <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Total Agents</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>4</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Online Agents</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>0</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Unallocated Agents</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24", marginTop: "2px" }}>0</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Nil Allocated</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#fb7185", marginTop: "2px" }}>0</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Total Campaigns</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#60a5fa", marginTop: "2px" }}>8</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#020921", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Active Campaigns</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>8</div>
              </div>
            </div>
          </div>

          {/* Top Controls: Search + Create Campaign Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search style={{ width: "14px", height: "14px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                value={searchCampaign}
                onChange={(e) => setSearchCampaign(e.target.value)}
                placeholder="Search by campaign name..."
                style={{
                  paddingLeft: "36px",
                  paddingRight: "14px",
                  paddingTop: "7px",
                  paddingBottom: "7px",
                  borderRadius: "10px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "12px",
                  color: "#ffffff",
                  outline: "none",
                  width: "280px"
                }}
              />
            </div>

            <button
              onClick={() => setShowCreateCampaignModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "#1d4ed8",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)"
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              <span>Create Campaign</span>
            </button>
          </div>

          {/* Exact 8 Campaign Rows Table */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
                <thead style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <tr>
                    <th style={{ padding: "12px 14px" }}>Campaigns</th>
                    <th style={{ padding: "12px 14px" }}>Category</th>
                    <th style={{ padding: "12px 14px" }}>Borrower Count</th>
                    <th style={{ padding: "12px 14px" }}>Left Out Borrower</th>
                    <th style={{ padding: "12px 14px" }}>Contactability</th>
                    <th style={{ padding: "12px 14px" }}>Agents Count</th>
                    <th style={{ padding: "12px 14px" }}>Completed Autochurns</th>
                    <th style={{ padding: "12px 14px" }}>LOB</th>
                    <th style={{ padding: "12px 14px" }}>Status</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((camp, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <td style={{ padding: "14px", fontWeight: 600, color: "#ffffff" }}>{camp.name}</td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: camp.category === "PREDICTIVE" ? "rgba(37, 99, 235, 0.15)" : "rgba(168, 85, 247, 0.15)",
                            color: camp.category === "PREDICTIVE" ? "#60a5fa" : "#c084fc",
                            border: camp.category === "PREDICTIVE" ? "1px solid rgba(37, 99, 235, 0.3)" : "1px solid rgba(168, 85, 247, 0.3)"
                          }}
                        >
                          {camp.category}
                        </span>
                      </td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#ffffff" }}>{camp.borrowerCount}</td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#fbbf24" }}>{camp.leftOutBorrower}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", fontWeight: 600, color: "#ffffff" }}>{camp.contactability}</td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#ffffff" }}>{camp.agentsCount}</td>
                      <td style={{ padding: "14px", fontFamily: "monospace", color: "#94a3b8" }}>{camp.completedAutochurns}</td>
                      <td style={{ padding: "14px", color: "#cbd5e1" }}>{camp.lob}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                          {camp.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <button
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer"
                          }}
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          4. INCENTIVE SUB-TAB
         ═══════════════════════════════════════════════════════ */}
      {agentSubTab === "incentives" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Top Header & New Program Button */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Incentive Program
              </h3>
            </div>

            {/* Top Right Button: New Program */}
            <button
              onClick={() => setShowNewProgramModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "#1d4ed8",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(29, 78, 216, 0.4)"
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              <span>New Program</span>
            </button>
          </div>

          {/* Programs List Table Section */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "#041030",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Programs List</h4>
              <div style={{ position: "relative" }}>
                <Search style={{ width: "14px", height: "14px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  value={searchIncentive}
                  onChange={(e) => setSearchIncentive(e.target.value)}
                  placeholder="Search by incentive, product, bucket..."
                  style={{
                    paddingLeft: "36px",
                    paddingRight: "14px",
                    paddingTop: "7px",
                    paddingBottom: "7px",
                    borderRadius: "10px",
                    backgroundColor: "#020921",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                    color: "#ffffff",
                    outline: "none",
                    width: "280px"
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", fontSize: "12px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
                <thead style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <tr>
                    <th style={{ padding: "12px 14px" }}>Program Name</th>
                    <th style={{ padding: "12px 14px" }}>Allocator</th>
                    <th style={{ padding: "12px 14px" }}>Product</th>
                    <th style={{ padding: "12px 14px" }}>Bucket</th>
                    <th style={{ padding: "12px 14px" }}>Criterias</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" style={{ padding: "48px 14px", textAlign: "center", color: "#94a3b8", fontWeight: 500 }}>
                      No data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── ACTION MODALS: View Profile, Edit Profile, Offboard Agent, Unblock User ── */}
      {activeActionModal && selectedAgentForModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setActiveActionModal(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff", margin: 0, textTransform: "capitalize" }}>
                {activeActionModal.replace("_", " ")} - {selectedAgentForModal.name}
              </h4>
              <button
                onClick={() => setActiveActionModal(null)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <XCircle style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <div
              style={{
                padding: "14px",
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
                <span style={{ color: "#94a3b8" }}>Yucollect ID:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#ffffff" }}>{selectedAgentForModal.yucollectId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Employee ID:</span>
                <span style={{ fontFamily: "monospace", color: "#94a3b8" }}>{selectedAgentForModal.agencyEmployeeId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Contact:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#ffffff" }}>{selectedAgentForModal.contact}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Assigned Campaign:</span>
                <span style={{ color: "#60a5fa", fontWeight: 500, maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedAgentForModal.campaign}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
              <button
                onClick={() => setActiveActionModal(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              {activeActionModal === "offboard" && (
                <button
                  onClick={() => setActiveActionModal(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Confirm Offboarding
                </button>
              )}
              {activeActionModal === "unblock" && (
                <button
                  onClick={() => setActiveActionModal(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Confirm Unblock
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE CAMPAIGN MODAL ── */}
      {showCreateCampaignModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowCreateCampaignModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff", margin: 0 }}>Create Campaign</h4>
              <button
                onClick={() => setShowCreateCampaignModal(false)}
                style={{ padding: "4px", borderRadius: "6px", backgroundColor: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <XCircle style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <input
                type="text"
                placeholder="Campaign Name (e.g. Q4 RECOVERY)"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <select
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <option value="PREDICTIVE">Predictive Dialer</option>
                <option value="MANUAL">Manual Preview</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => setShowCreateCampaignModal(false)}
                style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff", fontWeight: 700, fontSize: "12px", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateCampaignModal(false)}
                style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "#1d4ed8", color: "#ffffff", fontWeight: 700, fontSize: "12px", border: "none", cursor: "pointer" }}
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW INCENTIVE PROGRAM MODAL ── */}
      {showNewProgramModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowNewProgramModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff", margin: 0 }}>Configure Incentive Program</h4>
              <button
                onClick={() => setShowNewProgramModal(false)}
                style={{ padding: "4px", borderRadius: "6px", backgroundColor: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <XCircle style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <input
                type="text"
                placeholder="Program Name"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <input
                type="text"
                placeholder="Target Collection Threshold (%)"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#020921",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => setShowNewProgramModal(false)}
                style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff", fontWeight: 700, fontSize: "12px", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewProgramModal(false)}
                style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "#1d4ed8", color: "#ffffff", fontWeight: 700, fontSize: "12px", border: "none", cursor: "pointer" }}
              >
                Save Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AGENT ONBOARDING FORM MODAL ── */}
      {showAddAgentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowAddAgentModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "880px",
              maxHeight: "92vh",
              backgroundColor: "#051336",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Agent onboarding form
                </h3>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginTop: "4px" }}>
                  Enter agent details to onboard
                </span>
              </div>
              <button
                onClick={() => setShowAddAgentModal(false)}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <XCircle style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* 4 Tabs: Profile, KYC Details, Skills, Agent Contract */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                padding: "0 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "#030c24",
                overflowX: "auto"
              }}
            >
              {[
                { id: "profile", label: "Profile" },
                { id: "kyc", label: "KYC Details" },
                { id: "skills", label: "Skills" },
                { id: "contract", label: "Agent Contract" }
              ].map((tab) => {
                const isActive = onboardingTab === tab.id;
                const hasError =
                  (tab.id === "profile" && (onboardingErrors.supervisor || onboardingErrors.role)) ||
                  (tab.id === "skills" && (onboardingErrors.collectionExperience || onboardingErrors.draStatus)) ||
                  (tab.id === "contract" && onboardingErrors.activeStatus);

                return (
                  <button
                    key={tab.id}
                    onClick={() => setOnboardingTab(tab.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                      color: isActive ? "#60a5fa" : hasError ? "#fb7185" : "#94a3b8",
                      padding: "12px 4px",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span>{tab.label}</span>
                    {hasError && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "9999px",
                          backgroundColor: "#fb7185"
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body (Scrollable) */}
            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "18px"
              }}
            >
              {/* TAB 1: PROFILE */}
              {onboardingTab === "profile" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px"
                  }}
                >
                  {/* Enter agent name * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      * Enter agent name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter agent name"
                      value={agentFormData.name}
                      onChange={(e) => setAgentFormData({ ...agentFormData, name: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Allocator Name * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Allocator Name *
                    </label>
                    <select
                      value={agentFormData.allocatorName}
                      onChange={(e) => setAgentFormData({ ...agentFormData, allocatorName: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select allocators</option>
                      <option value="Priya Talekar">Priya Talekar</option>
                      <option value="Rahul Deshmukh">Rahul Deshmukh</option>
                      <option value="Admin Allocator">Admin Allocator</option>
                      <option value="System Allocation">System Allocation</option>
                    </select>
                  </div>

                  {/* Enter email address * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      * Enter email address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={agentFormData.email}
                      onChange={(e) => setAgentFormData({ ...agentFormData, email: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Enter phone number * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      * Enter phone number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={agentFormData.phone}
                      onChange={(e) => setAgentFormData({ ...agentFormData, phone: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Enter employee ID * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      * Enter employee ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter employee ID"
                      value={agentFormData.employeeId}
                      onChange={(e) => setAgentFormData({ ...agentFormData, employeeId: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Supervisor Name * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Supervisor Name *
                    </label>
                    <select
                      value={agentFormData.supervisor}
                      onChange={(e) => {
                        setAgentFormData({ ...agentFormData, supervisor: e.target.value });
                        if (e.target.value && onboardingErrors.supervisor) {
                          const errs = { ...onboardingErrors };
                          delete errs.supervisor;
                          setOnboardingErrors(errs);
                        }
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: onboardingErrors.supervisor ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select supervisor</option>
                      <option value="Priya Talekar">Priya Talekar</option>
                      <option value="Rajesh Sharma">Rajesh Sharma</option>
                      <option value="Amit Patil">Amit Patil</option>
                      <option value="Deepak Verma">Deepak Verma</option>
                    </select>
                    {onboardingErrors.supervisor && (
                      <span style={{ fontSize: "11px", color: "#fb7185", fontWeight: 600 }}>
                        {onboardingErrors.supervisor}
                      </span>
                    )}
                  </div>

                  {/* Product * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Product *
                    </label>
                    <select
                      value={agentFormData.product}
                      onChange={(e) => setAgentFormData({ ...agentFormData, product: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select products</option>
                      {PRODUCT_OPTIONS.map((prod) => (
                        <option key={prod} value={prod}>
                          {prod}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bucket * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Bucket *
                    </label>
                    <select
                      value={agentFormData.bucket}
                      onChange={(e) => setAgentFormData({ ...agentFormData, bucket: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select buckets</option>
                      {BUCKET_OPTIONS.map((bkt) => (
                        <option key={bkt} value={bkt}>
                          {bkt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Role *
                    </label>
                    <select
                      value={agentFormData.role}
                      onChange={(e) => {
                        setAgentFormData({ ...agentFormData, role: e.target.value });
                        if (e.target.value && onboardingErrors.role) {
                          const errs = { ...onboardingErrors };
                          delete errs.role;
                          setOnboardingErrors(errs);
                        }
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: onboardingErrors.role ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select role</option>
                      <option value="employee">employee</option>
                      <option value="admin">admin</option>
                    </select>
                    {onboardingErrors.role && (
                      <span style={{ fontSize: "11px", color: "#fb7185", fontWeight: 600 }}>
                        {onboardingErrors.role}
                      </span>
                    )}
                  </div>

                  {/* Channel * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Channel *
                    </label>
                    <select
                      value={agentFormData.channel}
                      onChange={(e) => setAgentFormData({ ...agentFormData, channel: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select channel</option>
                      <option value="call">call</option>
                      <option value="field">field</option>
                    </select>
                  </div>

                  {/* Acr */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Acr
                    </label>
                    <select
                      value={agentFormData.acr}
                      onChange={(e) => setAgentFormData({ ...agentFormData, acr: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select acr</option>
                      <option value="<100">&lt;100</option>
                      <option value="100 - 200">100 - 200</option>
                      <option value="200 - 300">200 - 300</option>
                      <option value=">300">&gt;300</option>
                    </select>
                  </div>

                  {/* City * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      City *
                    </label>
                    <select
                      value={agentFormData.city}
                      onChange={(e) => setAgentFormData({ ...agentFormData, city: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select cities</option>
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Nagpur">Nagpur</option>
                    </select>
                  </div>

                  {/* Area * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Area *
                    </label>
                    <select
                      value={agentFormData.area}
                      onChange={(e) => setAgentFormData({ ...agentFormData, area: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select areas</option>
                      <option value="Pune">Pune</option>
                      <option value="Hinjewadi">Hinjewadi</option>
                      <option value="Shivaji Nagar">Shivaji Nagar</option>
                      <option value="Kothrud">Kothrud</option>
                      <option value="Hadapsar">Hadapsar</option>
                      <option value="Viman Nagar">Viman Nagar</option>
                    </select>
                  </div>

                  {/* Base Pincode * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Base Pincode *
                    </label>
                    <select
                      value={agentFormData.basePincode}
                      onChange={(e) => setAgentFormData({ ...agentFormData, basePincode: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select base pincodes</option>
                      <option value="400063">400063</option>
                      <option value="411001">411001</option>
                      <option value="411014">411014</option>
                      <option value="411038">411038</option>
                      <option value="411057">411057</option>
                    </select>
                  </div>

                  {/* Enter current address * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      * Enter current address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter current address"
                      value={agentFormData.currentAddress}
                      onChange={(e) => setAgentFormData({ ...agentFormData, currentAddress: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Enter permanent address */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Enter permanent address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter permanent address"
                      value={agentFormData.permanentAddress}
                      onChange={(e) => setAgentFormData({ ...agentFormData, permanentAddress: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Enter residence pincode * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      * Enter residence pincode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter residence pincode"
                      value={agentFormData.residencePincode}
                      onChange={(e) => setAgentFormData({ ...agentFormData, residencePincode: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: KYC DETAILS */}
              {onboardingTab === "kyc" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px"
                  }}
                >
                  {[
                    { key: "aadhaarCard", title: "Aadhaar Card" },
                    { key: "panCard", title: "PAN Card" },
                    { key: "draCertificate", title: "DRA Certificate" },
                    { key: "pccPvcCertificate", title: "PCC/PVC Certificate and Applied receipt" },
                    { key: "higherEducationMarksheet", title: "Higher Education Certificate Marksheet" },
                    { key: "passportPhoto", title: "Passport Size Photo" },
                    { key: "cancelCheque", title: "Cancel cheque/ Passbook" },
                    { key: "experienceLetter", title: "Work Experience Letter" }
                  ].map((doc) => (
                    <div
                      key={doc.key}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>
                          {doc.title}
                        </span>
                        {agentFormData[doc.key] && (
                          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
                        )}
                      </div>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px dashed rgba(255, 255, 255, 0.2)",
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"; }}
                      >
                        <Upload style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                        <span style={{ fontSize: "11px", color: agentFormData[doc.key] ? "#34d399" : "#94a3b8" }}>
                          {agentFormData[doc.key] || "Click to upload file"}
                        </span>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            if (file) {
                              setAgentFormData({ ...agentFormData, [doc.key]: file.name });
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: SKILLS */}
              {onboardingTab === "skills" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px"
                  }}
                >
                  {/* Language * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Language *
                    </label>
                    <select
                      value={agentFormData.language}
                      onChange={(e) => setAgentFormData({ ...agentFormData, language: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select languages</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                    </select>
                  </div>

                  {/* Collection Experience * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Collection Experience *
                    </label>
                    <select
                      value={agentFormData.collectionExperience}
                      onChange={(e) => {
                        setAgentFormData({ ...agentFormData, collectionExperience: e.target.value });
                        if (e.target.value && onboardingErrors.collectionExperience) {
                          const errs = { ...onboardingErrors };
                          delete errs.collectionExperience;
                          setOnboardingErrors(errs);
                        }
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: onboardingErrors.collectionExperience ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select experience</option>
                      <option value="Freshar">Freshar</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value=">2 years">&gt;2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value=">5 years">&gt;5 years</option>
                    </select>
                    {onboardingErrors.collectionExperience && (
                      <span style={{ fontSize: "11px", color: "#fb7185", fontWeight: 600 }}>
                        {onboardingErrors.collectionExperience}
                      </span>
                    )}
                  </div>

                  {/* DRA * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      DRA *
                    </label>
                    <select
                      value={agentFormData.draStatus}
                      onChange={(e) => {
                        setAgentFormData({ ...agentFormData, draStatus: e.target.value });
                        if (e.target.value && onboardingErrors.draStatus) {
                          const errs = { ...onboardingErrors };
                          delete errs.draStatus;
                          setOnboardingErrors(errs);
                        }
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: onboardingErrors.draStatus ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select DRA status</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Applied">Applied</option>
                      <option value="Exempted">Exempted</option>
                    </select>
                    {onboardingErrors.draStatus && (
                      <span style={{ fontSize: "11px", color: "#fb7185", fontWeight: 600 }}>
                        {onboardingErrors.draStatus}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AGENT CONTRACT */}
              {onboardingTab === "contract" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px"
                  }}
                >
                  {/* Active * */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Active *
                    </label>
                    <select
                      value={agentFormData.activeStatus}
                      onChange={(e) => {
                        setAgentFormData({ ...agentFormData, activeStatus: e.target.value });
                        if (e.target.value && onboardingErrors.activeStatus) {
                          const errs = { ...onboardingErrors };
                          delete errs.activeStatus;
                          setOnboardingErrors(errs);
                        }
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: onboardingErrors.activeStatus ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Probation">Probation</option>
                    </select>
                    {onboardingErrors.activeStatus && (
                      <span style={{ fontSize: "11px", color: "#fb7185", fontWeight: 600 }}>
                        {onboardingErrors.activeStatus}
                      </span>
                    )}
                  </div>

                  {/* Working Days */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Working Days
                    </label>
                    <select
                      value={agentFormData.workingDays}
                      onChange={(e) => setAgentFormData({ ...agentFormData, workingDays: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    >
                      <option value="">Select working days</option>
                      <option value="Mon - Fri">Mon - Fri</option>
                      <option value="Mon - Sat">Mon - Sat</option>
                      <option value="All 7 Days">All 7 Days</option>
                      <option value="Custom Shift">Custom Shift</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={agentFormData.startDate}
                      onChange={(e) => setAgentFormData({ ...agentFormData, startDate: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* End Date */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={agentFormData.endDate}
                      onChange={(e) => setAgentFormData({ ...agentFormData, endDate: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Shift Start Time */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Shift Start Time
                    </label>
                    <input
                      type="time"
                      value={agentFormData.shiftStartTime}
                      onChange={(e) => setAgentFormData({ ...agentFormData, shiftStartTime: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Shift End Time */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Shift End Time
                    </label>
                    <input
                      type="time"
                      value={agentFormData.shiftEndTime}
                      onChange={(e) => setAgentFormData({ ...agentFormData, shiftEndTime: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Enter cash threshold */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                      Enter cash threshold
                    </label>
                    <input
                      type="text"
                      placeholder="Enter cash threshold (e.g. ₹50,000)"
                      value={agentFormData.cashThreshold}
                      onChange={(e) => setAgentFormData({ ...agentFormData, cashThreshold: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#020921",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "#030c24",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {onboardingTab !== "profile" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onboardingTab === "kyc") setOnboardingTab("profile");
                      else if (onboardingTab === "skills") setOnboardingTab("kyc");
                      else if (onboardingTab === "contract") setOnboardingTab("skills");
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "#cbd5e1",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Back
                  </button>
                )}
                {onboardingTab !== "contract" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onboardingTab === "profile") setOnboardingTab("kyc");
                      else if (onboardingTab === "kyc") setOnboardingTab("skills");
                      else if (onboardingTab === "skills") setOnboardingTab("contract");
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "#cbd5e1",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Next Tab
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const errors = {};
                    if (!agentFormData.supervisor) errors.supervisor = "Please select Supervisor Name!";
                    if (!agentFormData.role) errors.role = "Please select Role!";
                    if (!agentFormData.collectionExperience) errors.collectionExperience = "Please select Collection Experience!";
                    if (!agentFormData.draStatus) errors.draStatus = "Please select DRA!";
                    if (!agentFormData.activeStatus) errors.activeStatus = "Please select Active!";

                    if (Object.keys(errors).length > 0) {
                      setOnboardingErrors(errors);
                      if (errors.supervisor || errors.role) {
                        setOnboardingTab("profile");
                      } else if (errors.collectionExperience || errors.draStatus) {
                        setOnboardingTab("skills");
                      } else if (errors.activeStatus) {
                        setOnboardingTab("contract");
                      }
                      return;
                    }

                    // Onboarding Successful
                    const newAgentRecord = {
                      name: agentFormData.name.trim() || "New Agent",
                      supervisor: agentFormData.supervisor || "Priya Talekar",
                      yucollectId: `YC${Math.floor(1000 + Math.random() * 9000)}`,
                      agency: "PayMagic PVT LTD",
                      agencyEmployeeId: agentFormData.employeeId.trim() || `PM26${Math.floor(1000 + Math.random() * 9000)}`,
                      contact: agentFormData.phone.trim() || "9876543210",
                      channel: (agentFormData.channel || "call").toUpperCase(),
                      product: agentFormData.product || "Personal Loan",
                      bucket: agentFormData.bucket || "Bucket 1",
                      dra: agentFormData.draStatus || "No",
                      area: agentFormData.area || "Pune",
                      basePincode: agentFormData.basePincode || "400063",
                      residencePincode: agentFormData.residencePincode || "400063",
                      currentAddress: agentFormData.currentAddress || "Pune",
                      permanentAddress: agentFormData.permanentAddress || "Pune",
                      experience: agentFormData.collectionExperience || "Freshar",
                      campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA",
                      acr: agentFormData.acr || "200 - 300"
                    };

                    setAgentsList((prev) => [newAgentRecord, ...prev]);
                    setOnboardingErrors({});
                    setShowAddAgentModal(false);
                    setAgentFormData(initialOnboardingFormData);
                    setOnboardingSuccessToast(`Agent ${newAgentRecord.name} onboarded successfully!`);
                    setTimeout(() => setOnboardingSuccessToast(""), 4000);
                  }}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(29, 78, 216, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Check style={{ width: "15px", height: "15px" }} />
                  <span>Onboard Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ONBOARDING SUCCESS TOAST ── */}
      {onboardingSuccessToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 70,
            padding: "12px 20px",
            borderRadius: "12px",
            backgroundColor: "#059669",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
          }}
        >
          <CheckCircle2 style={{ width: "18px", height: "18px" }} />
          <span>{onboardingSuccessToast}</span>
        </div>
      )}

    </div>
  );
}
