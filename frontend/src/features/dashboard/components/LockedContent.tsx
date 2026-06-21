import React from "react";
import { Lock } from "lucide-react";
import type { TabType } from "../dashboardHelpers";

interface LockedContentProps {
  activeTab: TabType;
  onViewPlans: () => void;
}

const LockedContent: React.FC<LockedContentProps> = ({ activeTab, onViewPlans }) => {
  return (
    <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-8 shadow-sm space-y-4">
      <Lock className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
        {activeTab === "shortlisted" ? "Shortlisted Profiles Locked" : "Interests Page Locked"}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">
        {activeTab === "shortlisted"
          ? "Upgrade to Silver or higher to save and view your shortlisted profiles."
          : "Upgrade to Gold or higher to send interests and track who you've expressed interest in."}
      </p>
      <button
        onClick={onViewPlans}
        className="px-6 py-3 bg-gradient-to-r from-maroon-700 to-maroon-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        View Subscription Plans
      </button>
    </div>
  );
};

export default LockedContent;
