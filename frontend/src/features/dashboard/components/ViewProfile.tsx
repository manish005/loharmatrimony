import React, { useState } from "react";
import { ChevronRight, Sparkles, ShieldCheck, Heart, MessageSquare, Phone, Mail, MapPin, Info, CheckCircle2, ChevronLeft, X, Calendar } from "lucide-react";
import type { TabType } from "../dashboardHelpers";

interface Profile {
  id: string;
  name: string;
  photo: string;
  photos?: string[];
  age?: number;
  height?: string;
  occupation?: string;
  subCaste?: string;
  education?: string;
  income?: string;
  city?: string;
  state?: string;
  bio?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  compatibility?: number;
  [key: string]: any;
}

interface ViewProfileProps {
  profile: Profile;
  myProfile?: any;
  allProfiles: any[];
  showContactPremium: boolean;
  userSubscription: string;
  interestSentIds: string[];
  approvedConnectionIds: string[];
  marriageRequests: any[];
  activeDetailPhoto: number;
  onBack: () => void;
  onToggleInterest: (id: string, e?: React.MouseEvent) => void;
  onStartChat: (profile: any, e?: React.MouseEvent) => void;
  onSetActiveTab: (tab: TabType, id?: string) => void;
  onSetShowContactPremium: (val: boolean) => void;
  onSetActiveDetailPhoto: (val: number) => void;
  onOpenMarriageModal: (profile: any) => void;
  showToast: (msg: string, type?: string) => void;
}

const ViewProfile: React.FC<ViewProfileProps> = ({
  profile,
  myProfile,
  allProfiles,
  showContactPremium,
  userSubscription,
  interestSentIds,
  approvedConnectionIds,
  marriageRequests,
  activeDetailPhoto,
  onBack,
  onToggleInterest,
  onStartChat,
  onSetActiveTab,
  onSetShowContactPremium,
  onSetActiveDetailPhoto,
  onOpenMarriageModal,
  showToast,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImgIdx, setModalImgIdx] = useState(0);
  const profilePhotos: string[] = (profile.photos && profile.photos.length > 0) ? profile.photos : (profile.photo ? [profile.photo] : []);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-bold text-slate-900 dark:text-white hover:underline gap-1 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Matches Directory
      </button>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5 space-y-4">
          <div 
            onClick={() => { setModalImgIdx(0); setIsImageModalOpen(true); }}
            className="relative aspect-square rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-dark-800 bg-white dark:bg-dark-900 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <img src={profilePhotos[0]} alt={profile.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            {profile.isOnline && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 glass-panel px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-450 border border-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
              </div>
            )}
          </div>

          {profilePhotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {profilePhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => { setModalImgIdx(idx); setIsImageModalOpen(true); }}
                  className={`h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${idx === modalImgIdx && isImageModalOpen ? 'border-maroon-700 dark:border-gold-500' : 'border-slate-200 dark:border-dark-800 hover:border-maroon-700/50 dark:hover:border-gold-500/50'}`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-7 space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{profile.name.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1 || arr.length === 1).join(' ')}</h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                {profile.isPremium && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" /> Premium
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-455 mt-1">
                {profile.isOnline ? "Online" : profile.city ? `From ${profile.city}` : "Profile Created"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y border-slate-50 dark:border-dark-850 py-3.5 text-center">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Age / Height</span>
                <h4 className="text-xs font-serif font-bold text-slate-900 dark:text-white mt-0.5">{profile.age} Yrs • {profile.height}</h4>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Sub Caste</span>
                <h4 className="text-xs font-serif font-bold text-slate-900 dark:text-white mt-0.5">{profile.subCaste}</h4>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Compatibility</span>
                <h4 className="text-xs font-serif font-bold text-emerald-655 dark:text-emerald-450 mt-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4 text-gold-450 fill-gold-450" /> {profile.compatibility}%
                </h4>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-50 dark:border-dark-850">
              <button
                onClick={(e) => onToggleInterest(profile.id, e)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer ${interestSentIds.includes(profile.id)
                  ? "bg-emerald-500 text-white"
                  : "bg-maroon-700 hover:bg-maroon-800 text-white"
                  }`}
              >
                <Heart className={`h-4.5 w-4.5 ${interestSentIds.includes(profile.id) ? 'fill-white' : ''}`} />
                {interestSentIds.includes(profile.id) ? "Interest Sent" : "Send Interest"}
              </button>

              <button
                onClick={(e) => onStartChat(profile, e)}
                className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="h-4.5 w-4.5" /> Chat
              </button>
            </div>

            {(() => {
              const acceptedReq = marriageRequests.find((r: any) => (r.receiverId === profile.id || r.senderId === profile.id) && r.status === 'accepted');
              const pendingReq = marriageRequests.find((r: any) => (r.receiverId === profile.id || r.senderId === profile.id) && r.status === 'pending');
              const canPropose = approvedConnectionIds.includes(profile.id) && !myProfile?.isMarried && !acceptedReq && !pendingReq;
              const weddingDate = profile.weddingDate || acceptedReq?.weddingDate || "";
              const isDatePassed = weddingDate ? new Date(weddingDate) < new Date() : false;
              const statusLabel = isDatePassed ? "Married" : "Getting Married";

              if (acceptedReq || profile.isMarried || myProfile?.isMarried) {
                const partnerId = acceptedReq
                  ? (acceptedReq.senderId === profile.id ? acceptedReq.receiverId : acceptedReq.senderId)
                  : (profile.partnerId || "");
                const partnerProfile = allProfiles.find((p: any) => p.id === partnerId);
                const partnerName = partnerProfile?.name || profile.partnerName || "Partner";
                const partnerPhoto = partnerProfile?.photos?.[0] || partnerProfile?.photo || profile.partnerPhoto || "";

                return (
                  <div className="w-full mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-400">{statusLabel}</span>
                    </div>
                    {partnerName && (
                      <div className="flex items-center gap-3 justify-center mt-2">
                        {partnerPhoto ? (
                          <img
                            src={partnerPhoto}
                            alt={partnerName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 dark:border-amber-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                            {partnerName.charAt(0)}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">{partnerName}</p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {weddingDate ? new Date(weddingDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Date TBD"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (pendingReq) {
                return (
                  <div className="w-full mt-3 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-400">Proposal Pending</span>
                    </div>
                  </div>
                );
              }

              if (canPropose) {
                return (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenMarriageModal(profile); }}
                    className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="h-4.5 w-4.5 fill-white" /> Let's Get Married!
                  </button>
                );
              }

              return null;
            })()}
          </div>

          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-serif text-xs font-bold text-slate-900 dark:text-white mb-2.5">Contact Details</h3>
            {showContactPremium ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Phone className="h-4 w-4 text-maroon-650" /> {profile.mobile || "Not specified"}
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Mail className="h-4 w-4 text-maroon-650" /> {profile.email || "Not specified"}
                </div>
                <div className="col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <MapPin className="h-4 w-4 text-maroon-650" /> {profile.city}, {profile.state}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 rounded-2xl">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  {userSubscription === "free" || userSubscription === "silver"
                    ? "Upgrade to Gold or Platinum to view contact details and chat directly"
                    : "Unlock direct mobile details and chat with a Gold Tier contact credit"}
                </p>
                <button
                  onClick={() => {
                    if (userSubscription === "free" || userSubscription === "silver") {
                      showToast("Upgrade to Gold or Platinum to view contact details", "info");
                      onSetActiveTab("subscriptions");
                    } else {
                      onSetShowContactPremium(true);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-maroon-700 to-maroon-600 text-white rounded-xl text-[10px] font-bold shadow-sm cursor-pointer"
                >
                  {userSubscription === "free" || userSubscription === "silver" ? "Upgrade Now" : "View Contact Info"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-3.5 md:col-span-2">
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-850 pb-2">About Me</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {profile.bio || "No introduction provided."}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-3.5">
          <h3 className="font-serif text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-850 pb-2">Personal Background & Lifestyle</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] leading-relaxed">
            <div>
              <span className="text-slate-450 font-medium">Education</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.education || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Occupation</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.occupation || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-455 font-medium">Annual Income</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.income || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Dietary Prefs</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.foodPreference || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Drinking</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.drinking || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Smoking</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.smoking || "Not specified"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-3.5">
          <h3 className="font-serif text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-850 pb-2">Horoscope Details</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] leading-relaxed">
            <div>
              <span className="text-slate-450 font-medium">Zodiac Sign</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.zodiac || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Manglik Status</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.manglik || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Birth Time</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.birthTime || "Not specified"}</p>
            </div>
            <div>
              <span className="text-slate-450 font-medium">Birth Place</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.birthPlace || "Not specified"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-3.5 md:col-span-2">
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-850 pb-2">Partner Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-slate-500 font-medium text-[11px]">What they are looking for</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                {profile.partnerPreferencesBio || "Not specified"}
              </p>
            </div>
            
            {myProfile && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl mt-4">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  <Sparkles className="inline-block h-3.5 w-3.5 mr-1" />
                  You match {(profile.compatibility ?? 0)}% of their preferences
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-[11px] leading-relaxed pt-2">
              <div>
                <span className="text-slate-450 font-medium">Sub-Caste Preferred</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  {profile.subCaste || "Any"}
                  {myProfile && (myProfile.subCaste === profile.subCaste || !profile.subCaste) && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </p>
              </div>
              <div>
                <span className="text-slate-450 font-medium">Diet Preferred</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  {profile.foodPreference || "Any"}
                  {myProfile && (myProfile.foodPreference === profile.foodPreference || !profile.foodPreference) && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </p>
              </div>
              <div>
                <span className="text-slate-450 font-medium">Drinking Acceptable</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  {profile.drinking || "Not specified"}
                  {myProfile && (myProfile.drinking === profile.drinking || !profile.drinking) && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </p>
              </div>
              <div>
                <span className="text-slate-450 font-medium">Smoking Acceptable</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  {profile.smoking || "Not specified"}
                  {myProfile && (myProfile.smoking === profile.smoking || !profile.smoking) && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all cursor-pointer z-50"
          >
            <X className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          
          {profilePhotos.length > 1 && (
            <button
              onClick={() => setModalImgIdx((i) => (i - 1 + profilePhotos.length) % profilePhotos.length)}
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 sm:p-4 rounded-full bg-black/50 hover:bg-black/80 transition-all cursor-pointer z-50"
            >
              <ChevronLeft className="h-6 w-6 sm:h-10 sm:w-10" />
            </button>
          )}

          <img 
            src={profilePhotos[modalImgIdx]} 
            className="max-w-full max-h-[85vh] object-contain select-none" 
            alt="Profile Preview" 
          />

          {profilePhotos.length > 1 && (
            <button
              onClick={() => setModalImgIdx((i) => (i + 1) % profilePhotos.length)}
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 sm:p-4 rounded-full bg-black/50 hover:bg-black/80 transition-all cursor-pointer z-50"
            >
              <ChevronRight className="h-6 w-6 sm:h-10 sm:w-10" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
