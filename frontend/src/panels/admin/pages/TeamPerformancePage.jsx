import React from "react";
import PerformanceDashboard from "../../../components/portal/PerformanceDashboard";

export default function TeamPerformancePage() {
  return (
    <div className="portal-tab-content">
      <PerformanceDashboard role="ADMIN" initialSubTab="Team Manager" />
    </div>
  );
}
