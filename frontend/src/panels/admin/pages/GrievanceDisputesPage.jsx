import React from "react";
import ComplaintManagementDesk from "../../../components/portal/ComplaintManagementDesk";

export default function GrievanceDisputesPage({ user }) {
  return (
    <div className="portal-tab-content">
      <ComplaintManagementDesk currentUser={user} />
    </div>
  );
}
