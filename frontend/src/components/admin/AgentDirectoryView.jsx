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
  Clock
} from "lucide-react";

export default function AgentDirectoryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const agents = [
    {
      id: "AG-101",
      name: "Manisha Shete",
      email: "manishashete549@gmail.com",
      role: "TELECALLER",
      teamLeader: "Priya Talekar",
      status: "Online",
      channel: "Call",
      campaign: "RURAL-BAJAJ-Nov-2026-FINAL-DATA",
      dailyCap: 250,
      todayCalls: 133,
      rating: 3.1
    },
    {
      id: "AG-102",
      name: "Akshaya Ganji",
      email: "akshaya.g@paymagic.in",
      role: "TELECALLER",
      teamLeader: "Priya Talekar",
      status: "Offline",
      channel: "Call",
      campaign: "URBAN BAJAJ-NOV-2026",
      dailyCap: 200,
      todayCalls: 0,
      rating: 4.2
    },
    {
      id: "AG-103",
      name: "Bhushan Gaikwad",
      email: "bhushan.g@paymagic.in",
      role: "FIELD_AGENT",
      teamLeader: "Priya Talekar",
      status: "Offline",
      channel: "Field",
      campaign: "URBAN BAJAJ-NOV-2026",
      dailyCap: 25,
      todayCalls: 0,
      rating: 3.8
    },
    {
      id: "AG-104",
      name: "Priya Talekar",
      email: "infopaymagic@gmail.com",
      role: "SUPERVISOR",
      teamLeader: "Leadership",
      status: "Online",
      channel: "Omnichannel",
      campaign: "New URBAN BAJAJ-NOV-2026",
      dailyCap: 500,
      todayCalls: 52,
      rating: 4.9
    }
  ];

  const filtered = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Staff Directory &amp; Channel Capacity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage telecallers, field recovery officers, daily case quotas, and channel credentials
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New Agent</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-xs text-muted-foreground">Total Staff</span>
          <div className="text-2xl font-black text-foreground mt-1">4</div>
          <div className="text-[11px] text-muted-foreground mt-1">Active licenses</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-xs text-muted-foreground">Telecallers</span>
          <div className="text-2xl font-black text-blue-500 mt-1">2</div>
          <div className="text-[11px] text-muted-foreground mt-1">Voice channel</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-xs text-muted-foreground">Field Agents</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">1</div>
          <div className="text-[11px] text-muted-foreground mt-1">GPS verified radar</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-xs text-muted-foreground">Supervisors</span>
          <div className="text-2xl font-black text-amber-500 mt-1">1</div>
          <div className="text-[11px] text-muted-foreground mt-1">Audit authority</div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="TELECALLER">Telecaller</option>
              <option value="FIELD_AGENT">Field Agent</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent name, ID, email..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Agent</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Team Leader</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Campaign</th>
                <th className="p-3">Daily Capacity</th>
                <th className="p-3">Today's Progress</th>
                <th className="p-3">Quality Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((agent) => (
                <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{agent.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{agent.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {agent.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      agent.status === "Online"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{agent.teamLeader}</td>
                  <td className="p-3 font-semibold text-foreground">{agent.channel}</td>
                  <td className="p-3 text-muted-foreground truncate max-w-xs">{agent.campaign}</td>
                  <td className="p-3 font-bold text-foreground">{agent.dailyCap} accounts</td>
                  <td className="p-3 font-bold text-blue-500">{agent.todayCalls} dialed</td>
                  <td className="p-3 font-bold text-amber-500">{agent.rating} / 5.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
