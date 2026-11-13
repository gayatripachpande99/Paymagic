import React from "react";
import CallActivityReport from "../../../components/portal/CallActivityReport";

export default function CallRecordsAudioPage({ user, setSelectedCallAudio, setShowAudioModal }) {
  return (
    <div className="portal-tab-content">
      <CallActivityReport
        user={user}
        onOpenAudioPlayer={(callOrId) => {
          const callObj = typeof callOrId === "object" && callOrId !== null ? callOrId : { id: callOrId };
          setSelectedCallAudio(callObj);
          setShowAudioModal(true);
        }}
      />
    </div>
  );
}
