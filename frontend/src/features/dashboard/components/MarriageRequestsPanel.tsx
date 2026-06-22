import React from "react";
import { Check, X, Calendar, MapPin, Clock, HeartHandshake } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  gender?: string;
  photos?: string[];
  subCaste?: string;
  city?: string;
}

interface MarriageRequest {
  id: string;
  senderId: string;
  receiverId: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  status: string; // 'pending', 'accepted', 'rejected'
}

interface MarriageRequestsPanelProps {
  loading: boolean;
  marriageRequests: MarriageRequest[];
  profiles: Profile[];
  currentUserId: string;
  onAcceptRequest: (requestId: string, senderProfile: Profile) => void;
  onRejectRequest: (requestId: string) => void;
  onViewProfile: (id: string) => void;
}

const MarriageRequestsPanel: React.FC<MarriageRequestsPanelProps> = ({
  loading,
  marriageRequests,
  profiles,
  currentUserId,
  onAcceptRequest,
  onRejectRequest,
  onViewProfile
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-maroon-200 border-t-maroon-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Find incoming requests
  const incomingRequests = marriageRequests.filter(req => req.receiverId === currentUserId && req.status === "pending");

  if (incomingRequests.length === 0) {
    return (
      <div className="text-center py-16 bg-white/50 dark:bg-dark-900/50 rounded-2xl border border-slate-100 dark:border-dark-800">
        <HeartHandshake className="h-12 w-12 text-slate-300 dark:text-dark-700 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">No Marriage Requests</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          You don't have any pending marriage proposals at the moment. Connect with more people to find your perfect match!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incomingRequests.map((request) => {
        const sender = profiles.find(p => p.id === request.senderId);
        if (!sender) return null;

        return (
          <div 
            key={request.id}
            className="p-5 border-2 border-red-100 dark:border-red-900/30 rounded-2xl bg-gradient-to-br from-white to-red-50/50 dark:from-dark-900 dark:to-red-950/20"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onViewProfile(sender.id)}>
                <img 
                  src={sender.photos?.[0] || ""} 
                  alt={sender.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white group-hover:text-red-700 transition-colors">
                    {sender.name} wants to marry you!
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mb-2">
                    {sender.subCaste} • {sender.city}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <Calendar className="h-3 w-3 text-red-600" /> {request.weddingDate}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <Clock className="h-3 w-3 text-red-600" /> {request.weddingTime}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <MapPin className="h-3 w-3 text-red-600" /> {request.venue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onAcceptRequest(request.id, sender)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Accept
                </button>
                <button 
                  onClick={() => onRejectRequest(request.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-red-50 dark:bg-dark-800 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" /> Decline
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarriageRequestsPanel;
