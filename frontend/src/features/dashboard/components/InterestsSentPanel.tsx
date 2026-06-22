import React from "react";
import { Clock, Check, X, MessageSquare, Heart } from "lucide-react";

interface InterestsSentPanelProps {
  loading: boolean;
  sentInterests: { id: string; receiverId: string; status: string }[];
  profiles: any[];
  onViewProfile: (id: string) => void;
  onMessage: (profile: any) => void;
  onOpenMarriageModal?: (profile: any) => void;
  marriageRequests?: any[];
}

const InterestsSentPanel: React.FC<InterestsSentPanelProps> = ({
  loading,
  sentInterests,
  profiles,
  onViewProfile,
  onMessage,
  onOpenMarriageModal,
  marriageRequests = [],
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-maroon-700"></div>
      </div>
    );
  }

  if (sentInterests.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
        <Heart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No interests sent yet</p>
        <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
          When you send an interest to someone, it will appear here so you can track its status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">Interests Sent</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Track profiles where interest requests are sent
          </p>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl">
          {sentInterests.length} Sent
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sentInterests.map((interest) => {
          const profile = profiles.find((p) => p.id === interest.receiverId);
          if (!profile) return null;

          return (
            <div key={interest.id} className="relative group bg-white dark:bg-dark-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-dark-800 hover:shadow-xl transition-all duration-300 flex flex-col">
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
                </div>
                
                {/* Status Badge overlay */}
                <div className="absolute top-3 right-3">
                  {interest.status === 'pending' && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                  {interest.status === 'approved' && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Check className="w-3 h-3" /> Accepted
                    </span>
                  )}
                  {interest.status === 'rejected' && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <X className="w-3 h-3" /> Declined
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-dark-900 flex justify-center">
                {interest.status === 'approved' ? (
                  <div className="w-full space-y-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onMessage(profile); }}
                      className="w-full py-2 px-3 bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold rounded-xl shadow-md shadow-maroon-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" /> Message
                    </button>
                    {!profile.isMarried && !marriageRequests.some((r: any) => (r.receiverId === profile.id || r.senderId === profile.id) && r.status !== 'rejected') && onOpenMarriageModal && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenMarriageModal(profile); }}
                        className="w-full py-2 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="h-4 w-4 fill-white" /> Let's Get Married!
                      </button>
                    )}
                  </div>
                ) : interest.status === 'pending' ? (
                  <div className="w-full py-2 px-3 bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    Waiting for response...
                  </div>
                ) : (
                  <div className="w-full py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    Interest was declined
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterestsSentPanel;
