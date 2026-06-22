import React, { useState } from "react";
import InterestsSentPanel from "./InterestsSentPanel";
import InterestsReceivedPanel from "./InterestsReceivedPanel";
import MarriageRequestsPanel from "./MarriageRequestsPanel";
import { Heart } from "lucide-react";

interface InterestsPanelProps {
  loading: boolean;
  sentInterests: any[];
  pendingInterestsReceived: any[];
  profiles: any[];
  currentUserId: string;
  marriageRequests: any[];
  approvedReceivedIds?: string[];
  onViewProfile: (id: string) => void;
  onMessage: (profile: any) => void;
  onApprove: (senderId: string, senderName: string, senderPhoto: string) => void;
  onReject: (senderId: string) => void;
  onAcceptMarriageRequest: (requestId: string, senderProfile: any) => void;
  onRejectMarriageRequest: (requestId: string) => void;
  onOpenMarriageModal: (profile: any) => void;
}

const InterestsPanel: React.FC<InterestsPanelProps> = ({
  loading,
  sentInterests,
  pendingInterestsReceived,
  profiles,
  currentUserId,
  marriageRequests,
  approvedReceivedIds = [],
  onViewProfile,
  onMessage,
  onApprove,
  onReject,
  onAcceptMarriageRequest,
  onRejectMarriageRequest,
  onOpenMarriageModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"received" | "sent" | "marriage">("received");

  const receivedProfiles = pendingInterestsReceived
    .map(int => profiles.find(p => p.id === int.senderId))
    .filter(Boolean);

  const hasApprovedReceived = approvedReceivedIds.length > 0;
  const hasAcceptedInterests = sentInterests.some(int => int.status === "approved") || hasApprovedReceived;
  const showMarriageTab = hasAcceptedInterests;

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
        {showMarriageTab && (
          <button
            onClick={() => setActiveSubTab("marriage")}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 flex justify-center items-center gap-1.5 ${
              activeSubTab === "marriage"
                ? "border-red-600 text-red-600 dark:text-red-400 dark:border-red-400"
                : "border-transparent text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
            }`}
          >
            <Heart className="h-3.5 w-3.5" /> Marriage Requests {marriageRequests.length > 0 && `(${marriageRequests.length})`}
          </button>
        )}
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
        ) : activeSubTab === "sent" ? (
          <InterestsSentPanel
            loading={loading}
            sentInterests={sentInterests}
            profiles={profiles}
            onViewProfile={onViewProfile}
            onMessage={onMessage}
            onOpenMarriageModal={onOpenMarriageModal}
            marriageRequests={marriageRequests}
          />
        ) : (
          <MarriageRequestsPanel
            loading={loading}
            marriageRequests={marriageRequests}
            profiles={profiles}
            currentUserId={currentUserId}
            onAcceptRequest={onAcceptMarriageRequest}
            onRejectRequest={onRejectMarriageRequest}
            onViewProfile={onViewProfile}
          />
        )}
      </div>
    </div>
  );
};

export default InterestsPanel;
