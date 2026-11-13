import React from "react";
import CallActivityReport from "../../../components/portal/CallActivityReport";

export default function MyCallHistoryPage({ user, setAudioCall, setShowAudioModal }) {
  return (
    <div className="portal-tab-content">
      <CallActivityReport
        user={user}
        onOpenAudioPlayer={(callOrId) => {
          const callObj = typeof callOrId === "object" && callOrId !== null ? callOrId : { id: callOrId };
          setAudioCall(callObj);
          setShowAudioModal(true);
        }}
      />
    </div>
  );
}
