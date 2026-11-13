import React from "react";
import NotificationHub from "../../../components/portal/NotificationHub";

export default function RemindersQueuePage({
  user,
  setSelectedCaseId,
  setShowCaseDetailModal
}) {
  return (
    <div className="portal-tab-content">
      <NotificationHub
        currentUser={user}
        onNavigateToEntity={(entityType, entityId) => {
          if (entityType === "case") {
            setSelectedCaseId(entityId);
            setShowCaseDetailModal(true);
          }
        }}
      />
    </div>
  );
}
