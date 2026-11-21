import React, { useState } from "react";
import {
  MapPin,
  List,
  Map as MapIcon,
  AlertTriangle,
  UserCheck,
  Radio,
  Clock,
  ShieldAlert,
  Search,
  Filter
} from "lucide-react";

export default function HomeFieldMonitoringView() {
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'deviation'
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Field Agent Monitoring</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            GPS radar verification, live geo-tracking, and distance deviation audits
          </p>
        </div>

        {/* 1. Live Monitoring | 2. Deviation Monitoring */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "live"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1. Live Monitoring
          </button>
          <button
            onClick={() => setActiveTab("deviation")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "deviation"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2. Deviation Monitoring
          </button>
        </div>
      </div>

      {/* ── 1. LIVE MONITORING TAB ── */}
      {activeTab === "live" && (
        <div className="space-y-6">
          
          {/* KPI Cards: Total Agents: 0, Online Agents: 0, Offline Agents: 0 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Total Agents</span>
              <div className="text-2xl font-black text-foreground mt-1">0</div>
              <div className="text-[11px] text-muted-foreground mt-1">Allocated to field visits</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Online Agents</span>
              <div className="text-2xl font-black text-emerald-500 mt-1">0</div>
              <div className="text-[11px] text-emerald-500 mt-1">Active on field radar</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Offline Agents</span>
              <div className="text-2xl font-black text-rose-500 mt-1">0</div>
              <div className="text-[11px] text-muted-foreground mt-1">No active GPS signal</div>
            </div>
          </div>

          {/* Table / Map Section */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Field Agent Live Radar</h3>
                <p className="text-xs text-muted-foreground">Real-time status of recovery agents on ground</p>
              </div>

              {/* Toggle Map / List */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Agent Name</th>
                      <th className="p-3">Yucollect ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Check-in Time</th>
                      <th className="p-3">Check-out Time</th>
                      <th className="p-3">Deviation Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-muted-foreground">
                        No field recovery agents currently active on ground.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 rounded-xl bg-muted/30 border border-border border-dashed flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MapPin className="w-8 h-8 text-muted-foreground/40" />
                <div className="text-sm font-bold text-foreground">Live GPS Radar Map</div>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Interactive OpenStreetMap &amp; GPS coordinates render when field agents check in with active mobile credentials.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── 2. DEVIATION MONITORING TAB ── */}
      {activeTab === "deviation" && (
        <div className="space-y-6">
          
          {/* KPI Cards: Total Deviation: 0, Deviation > 100M: 0 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Total Deviation</span>
              <div className="text-2xl font-black text-foreground mt-1">0</div>
              <div className="text-[11px] text-muted-foreground mt-1">Audited geolocation records</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Deviation &gt; 100M</span>
              <div className="text-2xl font-black text-rose-500 mt-1">0</div>
              <div className="text-[11px] text-rose-500 mt-1">Visits marked beyond 100m geofence</div>
            </div>
          </div>

          {/* Table / Map Section */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Geofence Compliance Log</h3>
                <p className="text-xs text-muted-foreground">Discrepancies between borrower recorded address and field check-in</p>
              </div>

              {/* Toggle Map / List */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Agent Name</th>
                      <th className="p-3">Borrower Name</th>
                      <th className="p-3">Account Number</th>
                      <th className="p-3">Deviation Distance</th>
                      <th className="p-3">Date &amp; Time</th>
                      <th className="p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-muted-foreground">
                        Zero compliance deviations detected. All marked visits verified within authorized geofences.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 rounded-xl bg-muted/30 border border-border border-dashed flex flex-col items-center justify-center text-center p-6 space-y-2">
                <ShieldAlert className="w-8 h-8 text-emerald-500/60" />
                <div className="text-sm font-bold text-foreground">No Geofence Violations</div>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Audit logs indicate 100% adherence to institutional recovery perimeter thresholds.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
