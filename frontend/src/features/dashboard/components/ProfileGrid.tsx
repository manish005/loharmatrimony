import React from "react";
import { AnimatePresence } from "framer-motion";
import ProfileCard from "./ProfileCard";
import { useLanguage } from "../../../context/LanguageContext";

interface Profile {
  id: string;
  name: string;
  photo: string;
  age?: number;
  occupation?: string;
  subCaste?: string;
  education?: string;
  income?: string;
  city?: string;
  state?: string;
  isOnline?: boolean;
  lastActive?: any;
  isPremium?: boolean;
  compatibility?: number;
  [key: string]: any;
}

interface ProfileGridProps {
  loading: boolean;
  displayList: Profile[];
  myProfileGender: string;
  shortlistedIds: string[];
  interestSentIds: string[];
  approvedConnectionIds: string[];
  userSubscription: string;
  onToggleShortlist: (id: string, e?: React.MouseEvent) => void;
  onToggleInterest: (id: string, e?: React.MouseEvent) => void;
  onStartChat: (profile: Profile, e?: React.MouseEvent) => void;
  onViewProfile: (id: string) => void;
  onSetSelectedInvitationProfile: (profile: Profile) => void;
  recommended?: boolean;
}

const ProfileGrid: React.FC<ProfileGridProps> = ({
  loading,
  displayList,
  myProfileGender,
  shortlistedIds,
  interestSentIds,
  approvedConnectionIds,
  userSubscription,
  onToggleShortlist,
  onToggleInterest,
  onStartChat,
  onViewProfile,
  onSetSelectedInvitationProfile,
  recommended = false,
}) => {
  const { t } = useLanguage();
  const gridClass = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6`;

  if (loading) {
    return (
      <div className={gridClass}>
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-[320px] md:h-[400px] rounded-2xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-3 md:p-5 space-y-4 animate-pulse">
            <div className="h-80 w-full bg-slate-200 dark:bg-dark-800 rounded-xl" />
            <div className="h-3 md:h-4 w-2/3 bg-slate-200 dark:bg-dark-800 rounded" />
            <div className="h-3 md:h-4 w-1/2 bg-slate-200 dark:bg-dark-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (displayList.length > 0) {
    return (
      <div className={gridClass}>
        <AnimatePresence mode="popLayout">
          {displayList.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              shortlistedIds={shortlistedIds}
              interestSentIds={interestSentIds}
              approvedConnectionIds={approvedConnectionIds}
              userSubscription={userSubscription}
              onToggleShortlist={onToggleShortlist}
              onToggleInterest={onToggleInterest}
              onStartChat={onStartChat}
              onViewProfile={onViewProfile}
              onSetSelectedInvitationProfile={onSetSelectedInvitationProfile}
              recommended={recommended}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="text-center py-20 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("noprofiles")}</p>
    </div>
  );
};

export default ProfileGrid;
