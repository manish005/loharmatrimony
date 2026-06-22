import React from "react";
import { Check, X, Heart, MessageSquare } from "lucide-react";
import ProfileCard from "./ProfileCard";

interface InterestsReceivedPanelProps {
  loading: boolean;
  interestsReceived: any[]; // These will be the populated profile objects that sent the interest
  onApprove: (id: string, name: string, photo: string) => void;
  onReject: (id: string) => void;
  onViewProfile: (id: string) => void;
}

const InterestsReceivedPanel: React.FC<InterestsReceivedPanelProps> = ({
  loading,
  interestsReceived,
  onApprove,
  onReject,
  onViewProfile,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-maroon-700"></div>
      </div>
    );
  }

  if (interestsReceived.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
        <Heart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No incoming interests right now</p>
        <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
          When someone shows interest in your profile, it will appear here for you to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">Interests Received</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Review members who want to connect with you
          </p>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl">
          {interestsReceived.length} Pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {interestsReceived.map((profile) => (
          <div key={profile.id} className="relative group bg-white dark:bg-dark-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-dark-800 hover:shadow-xl transition-all duration-300 flex flex-col">
            <div 
              className="h-48 md:h-56 relative overflow-hidden cursor-pointer"
              onClick={() => onViewProfile(profile.id)}
            >
              <img 
                src={profile.photo || ""} 
                alt={profile.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  {profile.name}
                  {profile.isVerified && (
                    <span className="bg-blue-500 p-0.5 rounded-full" title="Verified Profile">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </h3>
                <p className="text-white/80 text-[10px] font-medium truncate mt-0.5">
                  {profile.age} yrs • {profile.height} • {profile.city}
                </p>
                <p className="text-white/70 text-[9px] truncate">
                  {profile.occupation} • {profile.education}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-dark-900 flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onReject(profile.id); }}
                className="flex-1 py-2 px-3 bg-slate-100 dark:bg-dark-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(profile.id, profile.name, profile.photo); }}
                className="flex-1 py-2 px-3 bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold rounded-xl shadow-md shadow-maroon-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestsReceivedPanel;
