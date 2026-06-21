import React, { useState } from "react";
import InterestsSentPanel from "./InterestsSentPanel";
import InterestsReceivedPanel from "./InterestsReceivedPanel";

interface InterestsPanelProps {
  loading: boolean;
  sentInterests: any[];
  pendingInterestsReceived: any[];
  profiles: any[];
  onViewProfile: (id: string) => void;
  onMessage: (profile: any) => void;
  onApprove: (senderId: string, senderName: string, senderPhoto: string) => void;
  onReject: (senderId: string) => void;
}

const InterestsPanel: React.FC<InterestsPanelProps> = ({
  loading,
  sentInterests,
  pendingInterestsReceived,
  profiles,
  onViewProfile,
  onMessage,
  onApprove,
  onReject
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"received" | "sent">("received");

  const receivedProfiles = pendingInterestsReceived
    .map(int => profiles.find(p => p.id === int.senderId))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">Interests</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Manage your sent and received connection requests
          </p>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex border-b border-slate-200 dark:border-dark-800">
        <button
          onClick={() => setActiveSubTab("received")}
          className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
            activeSubTab === "received"
              ? "border-maroon-700 text-maroon-700 dark:text-gold-400 dark:border-gold-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Received Requests {pendingInterestsReceived.length > 0 && `(${pendingInterestsReceived.length})`}
        </button>
        <button
          onClick={() => setActiveSubTab("sent")}
          className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
            activeSubTab === "sent"
              ? "border-maroon-700 text-maroon-700 dark:text-gold-400 dark:border-gold-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Sent Requests {sentInterests.length > 0 && `(${sentInterests.length})`}
        </button>
      </div>

      <div className="mt-4">
        {activeSubTab === "received" ? (
          <InterestsReceivedPanel
            loading={loading}
            interestsReceived={receivedProfiles}
            onApprove={onApprove}
            onReject={onReject}
            onViewProfile={onViewProfile}
          />
        ) : (
          <InterestsSentPanel
            loading={loading}
            sentInterests={sentInterests}
            profiles={profiles}
            onViewProfile={onViewProfile}
            onMessage={onMessage}
          />
        )}
      </div>
    </div>
  );
};

export default InterestsPanel;
