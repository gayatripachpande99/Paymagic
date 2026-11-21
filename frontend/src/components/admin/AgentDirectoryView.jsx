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
  Unlock
} from "lucide-react";

export default function AgentDirectoryView() {
  // 4 Sub-fields under Agent:
  // 1. agent list
  // 2. agent group
  // 3. compaign
  // 4. incentives
  const [agentSubTab, setAgentSubTab] = useState("agent_list");

  // ── 1. AGENT LIST SUB-TAB STATE ──
  const [agentListFilter, setAgentListFilter] = useState("all"); // 'all' | 'field' | 'call'
  const [searchAgentList, setSearchAgentList] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [activeActionModal, setActiveActionModal] = useState(null); // 'view_profile' | 'edit_profile' | 'offboard' | 'unblock'
  const [selectedAgentForModal, setSelectedAgentForModal] = useState(null);

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

  // 4 Exact Agent records specified by user
  const agentsList = [
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
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", margin: 0 }}>
            Manage agents, groupings, dialer campaigns, and automated incentives
          </p>
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
        <div className="space-y-6">
          
          {/* Header & Subtitle */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Agents list</h3>
              <p className="text-xs text-muted-foreground">
                You can view, add, and assign agents to campaigns here.
              </p>
            </div>

            {/* 4 KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Total Agents</span>
                <div className="text-2xl font-black text-foreground mt-0.5">4</div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Online Agents</span>
                <div className="text-2xl font-black text-emerald-500 mt-0.5">0</div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Unallocated Agents</span>
                <div className="text-2xl font-black text-amber-500 mt-0.5">0</div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Nil Allocated Agents</span>
                <div className="text-2xl font-black text-rose-500 mt-0.5">0</div>
              </div>
            </div>
          </div>

          {/* Controls: 3 Buttons (All, Field, Call) + Create Agent Group + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* 3 Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAgentListFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  agentListFilter === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                1. All Agent
              </button>
              <button
                onClick={() => setAgentListFilter("field")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  agentListFilter === "field"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                2. Field Agent
              </button>
              <button
                onClick={() => setAgentListFilter("call")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  agentListFilter === "call"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Call Agent
              </button>

              {/* Show "Create Agent Group" button ONLY when select third button "call agent" */}
              {agentListFilter === "call" && (
                <button
                  onClick={() => setAgentSubTab("agent_group")}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-in fade-in"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Agent Group</span>
                </button>
              )}
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchAgentList}
                onChange={(e) => setSearchAgentList(e.target.value)}
                placeholder="Search account number, name or mobile..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
              />
            </div>
          </div>

          {/* Full Agents Table (All Exact Columns) */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Agent Name</th>
                    <th className="p-3">Supervisor</th>
                    <th className="p-3">Yucollect ID</th>
                    <th className="p-3">Agency</th>
                    <th className="p-3">Agency employee ID</th>
                    <th className="p-3">Agent Contact</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Bucket</th>
                    <th className="p-3">DRA</th>
                    <th className="p-3">Area</th>
                    <th className="p-3">Base Pincode</th>
                    <th className="p-3">Residence Pincode</th>
                    <th className="p-3">Current Address</th>
                    <th className="p-3">Permanent Address</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Campaign</th>
                    <th className="p-3">ACR</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAgents.map((agent, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {agent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{agent.name}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{agent.supervisor}</td>
                      <td className="p-3 font-mono font-semibold text-blue-500">{agent.yucollectId}</td>
                      <td className="p-3 text-muted-foreground">{agent.agency}</td>
                      <td className="p-3 font-mono text-muted-foreground">{agent.agencyEmployeeId}</td>
                      <td className="p-3 font-mono text-foreground font-semibold">{agent.contact}</td>
                      <td className="p-3 font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {agent.channel}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{agent.product}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {agent.bucket}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{agent.dra}</td>
                      <td className="p-3 text-muted-foreground">{agent.area}</td>
                      <td className="p-3 font-mono text-muted-foreground">{agent.basePincode}</td>
                      <td className="p-3 font-mono text-muted-foreground">{agent.residencePincode}</td>
                      <td className="p-3 text-muted-foreground">{agent.currentAddress}</td>
                      <td className="p-3 text-muted-foreground">{agent.permanentAddress}</td>
                      <td className="p-3 font-medium text-foreground">{agent.experience}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-xs" title={agent.campaign}>
                        {agent.campaign}
                      </td>
                      <td className="p-3 font-bold text-foreground">{agent.acr}</td>
                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === idx ? null : idx)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Three Dots Dropdown Menu: View Profile, Edit Profile, Offboard Agent, Unblock User */}
                        {actionMenuOpen === idx && (
                          <div
                            className="absolute right-0 mt-1 w-44 rounded-xl bg-card border border-border p-1 shadow-xl z-50 text-left animate-in fade-in zoom-in-95"
                            onClick={() => setActionMenuOpen(null)}
                          >
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("view_profile");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>View Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("edit_profile");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-500" />
                              <span>Edit Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("offboard");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg"
                            >
                              <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                              <span>Offboard Agent</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgentForModal(agent);
                                setActiveActionModal("unblock");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                            >
                              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
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
        <div className="space-y-6">
          
          {/* Header & Finish Assessment Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-lg font-bold text-foreground">Map agents to campaigns</h3>
              <p className="text-xs text-muted-foreground">
                Assign agents or agent groups to campaigns. View, edit or delete campaigns from here.
              </p>
            </div>

            {/* Top Right Button: Finish Assessment */}
            <button
              onClick={() => setAssessmentFinished(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Finish Assessment</span>
            </button>
          </div>

          {assessmentFinished && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Assessment completed and mapped campaigns synchronized across active dialers.</span>
            </div>
          )}

          {/* 4 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground">Total Agents</span>
              <div className="text-2xl font-black text-foreground mt-0.5">4</div>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground">Online Agents</span>
              <div className="text-2xl font-black text-emerald-500 mt-0.5">0</div>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground">Unallocated Agents</span>
              <div className="text-2xl font-black text-amber-500 mt-0.5">0</div>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground">Nil Allocated Agents</span>
              <div className="text-2xl font-black text-rose-500 mt-0.5">0</div>
            </div>
          </div>

          {/* Sub-Tabs: 1. Agent Groups | 2. Ungrouped Agents */}
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <button
              onClick={() => setGroupSubTab("groups")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                groupSubTab === "groups"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              1. Agent Groups
            </button>
            <button
              onClick={() => setGroupSubTab("ungrouped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                groupSubTab === "ungrouped"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              2. Ungrouped Agents (1)
            </button>
          </div>

          {/* 1. Agent Groups View */}
          {groupSubTab === "groups" && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-foreground">Active Agent Groups</h4>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                    placeholder="Search account number, name or mobile..."
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Agent Group</th>
                      <th className="p-3">Agents Count</th>
                      <th className="p-3">% Collections</th>
                      <th className="p-3">Campaign</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Bajaj Rural Telecalling Alpha</td>
                      <td className="p-3 font-bold text-foreground">3</td>
                      <td className="p-3 font-bold text-emerald-500">28.4%</td>
                      <td className="p-3 text-muted-foreground font-medium">RURAL-BAJAJ-Nov-2026-FINAL-DATA</td>
                      <td className="p-3 text-right">
                        <button className="px-3 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold">
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
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <h4 className="text-sm font-bold text-foreground">Ungrouped Agents</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Agent Name</th>
                      <th className="p-3">Yucollect ID</th>
                      <th className="p-3">Agency Employee ID</th>
                      <th className="p-3">Agent Contact</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Bucket</th>
                      <th className="p-3">Experience</th>
                      <th className="p-3">Campaign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Manisha Shete</td>
                      <td className="p-3 font-mono text-muted-foreground">6ad891176be37f003bc8c01f</td>
                      <td className="p-3 font-mono text-muted-foreground">PM2610MS0004</td>
                      <td className="p-3 font-mono text-foreground font-semibold">9359060141</td>
                      <td className="p-3 text-muted-foreground">Consumer Durable</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Writeoff</span></td>
                      <td className="p-3 font-medium text-foreground">Freshar</td>
                      <td className="p-3 text-muted-foreground truncate max-w-sm">
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
        <div className="space-y-6">
          
          {/* Header */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-lg font-bold text-foreground">Campaign Management</h3>
            
            {/* 6 KPIs: Total Agents 4, Online 0, Unallocated 0, Nil Allocated 0, Total Campaigns 8, Active Campaigns 8 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Total Agents</span>
                <div className="text-xl font-bold text-foreground mt-0.5">4</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Online Agents</span>
                <div className="text-xl font-bold text-emerald-500 mt-0.5">0</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Unallocated Agents</span>
                <div className="text-xl font-bold text-amber-500 mt-0.5">0</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Nil Allocated</span>
                <div className="text-xl font-bold text-rose-500 mt-0.5">0</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Total Campaigns</span>
                <div className="text-xl font-bold text-blue-500 mt-0.5">8</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Active Campaigns</span>
                <div className="text-xl font-bold text-emerald-500 mt-0.5">8</div>
              </div>
            </div>
          </div>

          {/* Top Controls: Search + Create Campaign Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchCampaign}
                onChange={(e) => setSearchCampaign(e.target.value)}
                placeholder="Search by campaign name..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
              />
            </div>

            <button
              onClick={() => setShowCreateCampaignModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Campaign</span>
            </button>
          </div>

          {/* Exact 8 Campaign Rows Table */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Campaigns</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Borrower Count</th>
                    <th className="p-3">Left Out Borrower</th>
                    <th className="p-3">Contactability</th>
                    <th className="p-3">Agents Count</th>
                    <th className="p-3">Completed Autochurns</th>
                    <th className="p-3">LOB</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCampaigns.map((camp, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{camp.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          camp.category === "PREDICTIVE"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                        }`}>
                          {camp.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-foreground">{camp.borrowerCount}</td>
                      <td className="p-3 font-bold text-amber-500">{camp.leftOutBorrower}</td>
                      <td className="p-3 font-mono font-semibold text-foreground">{camp.contactability}</td>
                      <td className="p-3 font-bold text-foreground">{camp.agentsCount}</td>
                      <td className="p-3 font-mono text-muted-foreground">{camp.completedAutochurns}</td>
                      <td className="p-3 text-muted-foreground">{camp.lob}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {camp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold">
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
        <div className="space-y-6">
          
          {/* Top Header & New Program Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Incentive Program</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create and edit new or existing incentive programs here.
              </p>
            </div>

            {/* Top Right Button: New Program */}
            <button
              onClick={() => setShowNewProgramModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Program</span>
            </button>
          </div>

          {/* Programs List Table Section */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-foreground">Programs List</h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchIncentive}
                  onChange={(e) => setSearchIncentive(e.target.value)}
                  placeholder="Search by incentive, product, bucket..."
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Program Name</th>
                    <th className="p-3">Allocator</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Bucket</th>
                    <th className="p-3">Criterias</th>
                    <th className="p-3 text-right">Actions</th>
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

      {/* ── ACTION MODALS: View Profile, Edit Profile, Offboard Agent, Unblock User ── */}
      {activeActionModal && selectedAgentForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-foreground capitalize">
                {activeActionModal.replace("_", " ")} - {selectedAgentForModal.name}
              </h4>
              <button
                onClick={() => setActiveActionModal(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yucollect ID:</span>
                <span className="font-mono font-bold text-foreground">{selectedAgentForModal.yucollectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID:</span>
                <span className="font-mono text-muted-foreground">{selectedAgentForModal.agencyEmployeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-mono font-semibold text-foreground">{selectedAgentForModal.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Campaign:</span>
                <span className="text-blue-500 font-medium truncate max-w-xs">{selectedAgentForModal.campaign}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-bold"
              >
                Close
              </button>
              {activeActionModal === "offboard" && (
                <button
                  onClick={() => setActiveActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Confirm Offboarding
                </button>
              )}
              {activeActionModal === "unblock" && (
                <button
                  onClick={() => setActiveActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-foreground">Create Campaign</h4>
              <button onClick={() => setShowCreateCampaignModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <XCircle className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Campaign Name (e.g. Q4 RECOVERY)"
                className="w-full p-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none"
              />
              <select className="w-full p-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none">
                <option value="PREDICTIVE">Predictive Dialer</option>
                <option value="MANUAL">Manual Preview</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateCampaignModal(false)} className="px-3 py-1.5 rounded-lg bg-muted text-foreground font-bold text-xs">
                Cancel
              </button>
              <button onClick={() => setShowCreateCampaignModal(false)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW INCENTIVE PROGRAM MODAL ── */}
      {showNewProgramModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-foreground">Configure Incentive Program</h4>
              <button onClick={() => setShowNewProgramModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <XCircle className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Program Name"
                className="w-full p-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none"
              />
              <input
                type="text"
                placeholder="Target Collection Threshold (%)"
                className="w-full p-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewProgramModal(false)} className="px-3 py-1.5 rounded-lg bg-muted text-foreground font-bold text-xs">
                Cancel
              </button>
              <button onClick={() => setShowNewProgramModal(false)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs">
                Save Program
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
