import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Bookmark,
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";
import { formatLastSeen } from "../dashboardHelpers";

interface Profile {
  id: string;
  name: string;
  photo: string;
  age?: number;
  height?: string;
  occupation?: string;
  subCaste?: string;
  education?: string;
  income?: string;
  city?: string;
  state?: string;
  isOnline?: boolean;
  lastActive?: any;
  isVerified?: boolean;
  isPremium?: boolean;
  compatibility?: number;
  [key: string]: any;
}

interface ProfileCardProps {
  profile: Profile;
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

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
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
  const marriageFixed = profile.isMarried;
  const profilePhotos = profile.photos?.length > 0 ? profile.photos : (profile.photo ? [profile.photo] : []);
  const hasCarousel = profilePhotos.length > 1;
  const [carouselIdx, setCarouselIdx] = useState(0);
  const prevPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIdx(i => (i - 1 + profilePhotos.length) % profilePhotos.length);
  }, [profilePhotos.length]);
  const nextPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIdx(i => (i + 1) % profilePhotos.length);
  }, [profilePhotos.length]);
  useEffect(() => {
    if (!hasCarousel) return;
    const timer = setInterval(() => {
      setCarouselIdx(i => (i + 1) % profilePhotos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hasCarousel, profilePhotos.length]);

  return (
    <motion.div
      layout
      key={profile.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-2xl md:rounded-[28px] overflow-hidden shadow-md dark:shadow-black/50 hover:shadow-xl dark:hover:shadow-black/70 transition-all duration-350 flex flex-col group relative ${recommended ? 'h-[500px] mb-4' : 'h-fit'}`}
    >
      <div
        onClick={() => marriageFixed ? onSetSelectedInvitationProfile(profile) : onViewProfile(profile.id)}
        className="relative h-[278px] sm:h-[230px] overflow-hidden bg-slate-100 dark:bg-dark-850 flex-shrink-0 cursor-pointer"
      >
        <div className="w-full h-full relative">
          {profilePhotos.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              alt={profile.name}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${idx === carouselIdx ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {hasCarousel && (
            <>
            </>
          )}
        </div>



        {!marriageFixed && (
          <div className="absolute top-3 right-3 flex items-center justify-center">
            {profile.isOnline ? (
              <span className="relative flex h-2 w-2 md:h-3 md:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-emerald-500 border border-white"></span>
              </span>
            ) : (
              <span className="text-[7px] sm:text-[8px] text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-black/60 backdrop-blur px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                {formatLastSeen(profile.lastActive) || "Offline"}
              </span>
            )}
          </div>
        )}

        {!marriageFixed && (
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => onToggleShortlist(profile.id, e)}
            className={`absolute bottom-3 right-3 p-1.5 md:bottom-4 md:right-4 md:p-2.5 rounded-full border backdrop-blur-md transition-all cursor-pointer z-10 ${shortlistedIds.includes(profile.id)
              ? "bg-amber-500 border-amber-500 text-white"
              : "bg-white/70 hover:bg-white border-white/20 text-slate-700"
              }`}
            title="Shortlist Profile"
            variants={{
              hover: { scale: 1.15, rotate: 5 }
            }}
          >
            <motion.div
              variants={{
                hover: { rotate: [0, -10, 10, 0] }
              }}
              transition={{ duration: 0.3 }}
              animate={shortlistedIds.includes(profile.id) ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : {}}
            >
              <Bookmark className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" />
            </motion.div>
          </motion.button>
        )}

        {!marriageFixed && (
          <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur border border-white/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold text-white flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-gold-450 fill-gold-450" /> {profile.compatibility ?? "—"}% Match
          </div>
        )}
        {marriageFixed && (
          <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur border border-white/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold text-white flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 md:h-3 md:w-3 fill-white" /> {profile.weddingDate && new Date(profile.weddingDate) < new Date() ? "Married" : "Taken"}
          </div>
        )}
      </div>

      <div className={`p-4 sm:p-5 ${recommended ? 'pb-10 flex flex-col flex-1 min-h-0' : 'pb-6 sm:pb-7 flex flex-col'}`}>
        <div
          onClick={() => marriageFixed ? onSetSelectedInvitationProfile(profile) : onViewProfile(profile.id)}
          className={`space-y-0.5 sm:space-y-1 cursor-pointer ${recommended ? 'flex-1 overflow-hidden' : ''}`}
        >
          <div className="flex items-center gap-1">
            <h4 className="font-serif text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 dark:text-white group-hover:text-maroon-700 dark:group-hover:text-gold-400 transition-colors truncate">
              {profile.name.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1 || arr.length === 1).join(' ')}
            </h4>
            {profile.isVerified && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md shrink-0">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 fill-emerald-500 text-white" />
                <span className="text-[8px] sm:text-[9px] font-bold">Verified</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
            {[profile.age ? `${profile.age} yrs` : null, profile.height, profile.subCaste, profile.maritalStatus].filter(Boolean).map((item, idx) => (
              <span key={`attr1-${idx}`} className="bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] md:text-[11px] font-medium border border-slate-200 dark:border-dark-700">
                {item}
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 pt-0.5 min-w-0">
            {[profile.education, profile.income].filter(Boolean).map((item, idx) => (
              <span key={`attr2-${idx}`} className="bg-slate-50 dark:bg-dark-850 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wide font-medium border border-slate-200/50 dark:border-dark-700/50 truncate max-w-[50%]">
                {item}
              </span>
            ))}
          </div>

          <p className="text-[8px] sm:text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 sm:gap-1 pt-0.5 sm:pt-1 truncate">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-maroon-700 dark:text-gold-450 flex-shrink-0" />
            {[profile.city, profile.state].filter(Boolean).join(", ")}
          </p>

          {marriageFixed && (
            <div className="mt-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-400 text-[8px] sm:text-[9px] rounded-lg font-bold flex items-center justify-between">
              <span>{profile.weddingDate && new Date(profile.weddingDate) < new Date() ? "Married" : "Getting Married"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (shortlistedIds.includes(profile.id)) onToggleShortlist(profile.id);
                  if (interestSentIds.includes(profile.id)) onToggleInterest(profile.id);
                }}
                className="text-amber-900 dark:text-amber-250 hover:underline font-extrabold cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {profile.partnerId ? (
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile.partnerPhoto ? (
                <img 
                  src={profile.partnerPhoto} 
                  alt={profile.partnerName || "Partner"} 
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-dark-700" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs border border-slate-200 dark:border-dark-700">
                  {(profile.partnerName || "P").charAt(0)}
                </div>
              )}
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                {profile.partnerName}
              </span>
            </div>
            <button
              disabled
              className="py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] sm:text-xs flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/30 shadow-sm"
            >
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-500 text-amber-500" />
              {profile.weddingDate && new Date(profile.weddingDate) < new Date() ? "Married" : "Getting Married"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-5 pt-2 sm:pt-3">
            {marriageFixed ? (
              <button
                disabled
                className="w-full py-2 sm:py-2 md:py-3 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-[10px] md:text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/50 dark:border-dark-700/50"
              >
                <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span>Locked</span>
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={interestSentIds.includes(profile.id) ? {
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.02, 1]
                } : {}}
                transition={interestSentIds.includes(profile.id) ? {
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut"
                } : { duration: 0.2 }}
                onClick={(e) => onToggleInterest(profile.id, e)}
                className={`w-full py-2 sm:py-2 md:py-3 rounded-xl text-[10px] sm:text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${interestSentIds.includes(profile.id)
                  ? "bg-emerald-500 text-white shadow-emerald-500/15"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/30"
                  }`}
              >
                <motion.div
                  animate={interestSentIds.includes(profile.id) ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </motion.div>
                {interestSentIds.includes(profile.id) ? t("interest.sent") : t("interest.send")}
              </motion.button>
            )}

            {marriageFixed || !approvedConnectionIds.includes(profile.id) ? (
              <button
                disabled
                className="w-full py-2 sm:py-2 md:py-3 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-[10px] md:text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/50 dark:border-dark-700/50"
              >
                <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span>{approvedConnectionIds.includes(profile.id) ? "Locked" : "Send interest to chat"}</span>
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onStartChat(profile, e)}
                className="w-full py-2 sm:py-2 md:py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/30 text-[10px] sm:text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                {t("action.chat")}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileCard;
