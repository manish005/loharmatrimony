import React, { useRef } from "react";
import {
  ShieldCheck, Sparkles, User, Mail, Award, MapPin, Heart,
  Camera, X, Loader2, ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2
} from "lucide-react";
import { locationData } from "../../../data/locationData";
import { calculateAge } from "../dashboardHelpers";
import HoroscopePanel from "./HoroscopePanel";
import { useLanguage } from "../../../context/LanguageContext";

interface Profile {
  id: string;
  name: string;
  gender?: string;
  dob?: string;
  mobile?: string;
  email?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  education?: string;
  occupation?: string;
  income?: string;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  familyDetails?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  lifestyle?: string;
  foodPreference?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string;
  photo?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  age?: number;
  [key: string]: any;
}

interface MyProfileSectionProps {
  myProfile: Profile;
  isEditingProfile: boolean;
  progressPercent: number;
  userSubscription: string;
  profileFormState: any;
  onStartEdit: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  photos?: string[];
  uploadingPhoto?: boolean;
  onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto?: (index: number) => void;
}

const MyProfileSection: React.FC<MyProfileSectionProps> = ({
  myProfile,
  isEditingProfile,
  progressPercent,
  userSubscription,
  profileFormState,
  onStartEdit,
  onFormChange,
  onSaveProfile,
  onCancelEdit,
  photos = [],
  uploadingPhoto = false,
  onPhotoUpload,
  onDeletePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryIdx, setGalleryIdx] = React.useState(0);
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start gap-5 justify-between">
          <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
            <div className="relative shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-maroon-700/30 dark:border-gold-500/30 bg-slate-100 dark:bg-dark-800 cursor-pointer group relative"
              >
                <img src={myProfile.photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop"} alt={myProfile.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {myProfile.isVerified && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm border-2 border-white dark:border-dark-900">
                  <ShieldCheck className="h-3 w-3" />
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onPhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{myProfile.name}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {myProfile.occupation || "Member"} &middot; {myProfile.subCaste || "Lohar"}
                  </p>
                </div>
                {myProfile.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded-full w-fit">
                    <ShieldCheck className="h-3 w-3" /> {t("filter.verified")}
                  </span>
                )}
                {userSubscription !== "free" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 px-2 py-0.5 rounded-full w-fit">
                    <Sparkles className="h-3 w-3" /> {userSubscription.charAt(0).toUpperCase() + userSubscription.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 lg:hidden">ID: {myProfile.id}</p>
              
              {!isEditingProfile && (
                <button onClick={onStartEdit} className="mt-3 px-5 py-2 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-slate-200 dark:hover:bg-dark-700 transition-all cursor-pointer shrink-0">
                  {t("action.edit")}
                </button>
              )}

              {myProfile.partnerId && !isEditingProfile && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between sm:justify-start sm:gap-6">
                  <div className="flex items-center gap-2">
                    <img 
                      src={myProfile.partnerPhoto || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"} 
                      alt={myProfile.partnerName || "Partner"} 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-slate-200 dark:border-dark-700 shadow-sm" 
                    />
                    <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                      {myProfile.partnerName}
                    </span>
                  </div>
                  <button
                    disabled
                    className="py-1.5 px-3 md:px-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] md:text-xs flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/30 shadow-sm"
                  >
                    <Heart className="h-3 w-3 md:h-4 md:w-4 fill-amber-500 text-amber-500" />
                    {myProfile.weddingDate && new Date(myProfile.weddingDate) > new Date() ? "Marriage Fixed" : "Married"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Photo Grid on the Right */}
          {!isEditingProfile && (
            <div className="w-full lg:w-auto mt-4 lg:mt-0 flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-serif font-bold text-xs text-maroon-700 dark:text-gold-400">
                  Gallery ({photos.length}/4)
                </h4>
                {uploadingPhoto && (
                  <Loader2 className="h-4 w-4 animate-spin text-maroon-700 dark:text-gold-400" />
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-start lg:justify-end">
                {photos.slice(0, 4).map((url, idx) => (
                  <div key={idx} className="relative group h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 bg-slate-100 dark:bg-dark-800 shadow-sm">
                    <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                    {onDeletePhoto && (
                      <button
                        onClick={() => onDeletePhoto(idx)}
                        className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                ))}
                {photos.length < 4 && !uploadingPhoto && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-dark-700 flex items-center justify-center hover:border-maroon-700/50 dark:hover:border-gold-500/50 transition-colors cursor-pointer bg-slate-50 dark:bg-dark-950"
                  >
                    <Camera className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-dark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Completion</span>
            <span className="text-[10px] font-bold text-maroon-700 dark:text-gold-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-dark-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-maroon-700 to-maroon-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {isEditingProfile ? (
        <form onSubmit={onSaveProfile} className="space-y-5">
          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">
              {t("Basic Information")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name</label>
                <input type="text" name="firstName" value={profileFormState.firstName || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFormChange({
                      ...e,
                      target: { ...e.target, name: "firstName", value: val }
                    });
                    const parts = [
                      val,
                      profileFormState.middleName || "",
                      profileFormState.lastName || ""
                    ].filter(Boolean);
                    onFormChange({
                      ...e,
                      target: { ...e.target, name: "name", value: parts.join(" ").trim() }
                    });
                  }}
                  required className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Middle Name</label>
                <input type="text" name="middleName" value={profileFormState.middleName || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFormChange({
                      ...e,
                      target: { ...e.target, name: "middleName", value: val }
                    });
                    const parts = [
                      profileFormState.firstName || "",
                      val,
                      profileFormState.lastName || ""
                    ].filter(Boolean);
                    onFormChange({
                      ...e,
                      target: { ...e.target, name: "name", value: parts.join(" ").trim() }
                    });
                  }}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
                <input type="text" name="lastName" value={profileFormState.lastName || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFormChange({
                      ...e,
                      target: { ...e.target, name: "lastName", value: val }
                    });
                    const parts = [
                      profileFormState.firstName || "",
                      profileFormState.middleName || "",
                      val
                    ].filter(Boolean);
                    onFormChange({
                      ...e,
                      target: { ...e.target, name: "name", value: parts.join(" ").trim() }
                    });
                  }}
                  required className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
                <select name="gender" value={profileFormState.gender || ""} onChange={onFormChange} required
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                <input type="date" name="dob" value={profileFormState.dob || ""} onChange={onFormChange} required
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="relative w-28 shrink-0">
                    <select name="countryCode" value={profileFormState.countryCode || "+91"} onChange={onFormChange}
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl pl-3 pr-8 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none cursor-pointer">
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (AE)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <input type="text" name="mobile" value={profileFormState.mobile || ""} onChange={onFormChange} required
                    className="flex-1 w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marital Status</label>
                <select name="maritalStatus" value={profileFormState.maritalStatus || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Awaiting Divorced">Awaiting Divorced</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mother Tongue</label>
                <select name="motherTongue" value={profileFormState.motherTongue || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="Marathi">Marathi</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Marwari">Marwari</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">
              Physical & Community
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Height</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select name="heightFt" value={profileFormState.heightFt || "5"} onChange={onFormChange}
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none cursor-pointer">
                      {[4, 5, 6, 7].map(ft => <option key={ft} value={ft}>{ft} ft</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                    <select name="heightInches" value={profileFormState.heightInches || "5"} onChange={onFormChange}
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none cursor-pointer">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inch => <option key={inch} value={inch}>{inch} in</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Weight</label>
                <input type="text" name="weight" value={profileFormState.weight || ""} onChange={onFormChange} placeholder="e.g. 68 kg"
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sub Caste</label>
                <div className="relative">
                  <select name="subCaste" value={profileFormState.subCaste || ""} onChange={onFormChange}
                    className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none cursor-pointer">
                    <option value="Panchal">Panchal</option>
                    <option value="Gadi Lohar">Gadi Lohar</option>
                    <option value="Sangar">Sangar</option>
                    <option value="Jhangra">Jhangra</option>
                    <option value="Dhiman">Dhiman</option>
                    <option value="Tarkhan">Tarkhan</option>
                    <option value="Vishwakarma">Vishwakarma</option>
                    <option value="Mathura Lohar">Mathura Lohar</option>
                    <option value="Rajput Lohar">Rajput Lohar</option>
                    <option value="Luhar">Luhar</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">
              Professional & Financial
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Education</label>
                <input type="text" name="education" value={profileFormState.education || ""} onChange={onFormChange} placeholder="e.g. B.Tech"
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Occupation</label>
                <input type="text" name="occupation" value={profileFormState.occupation || ""} onChange={onFormChange} placeholder="e.g. Software Engineer"
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Annual Income</label>
                <div className="relative">
                  <select name="income" value={profileFormState.income || ""} onChange={onFormChange}
                    className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none cursor-pointer">
                    <option value="">Select Income</option>
                    <option value="1-2 Lakh">1-2 Lakh</option>
                    <option value="3-5 Lakh">3-5 Lakh</option>
                    <option value="8-10 Lakh">8-10 Lakh</option>
                    <option value="10-15 Lakh">10-15 Lakh</option>
                    <option value="20-25 Lakh">20-25 Lakh</option>
                    <option value="30-40 Lakh">30-40 Lakh</option>
                    <option value="50 Lakh">50 Lakh</option>
                    <option value="1 Cr++">1 Cr++</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Address</label>
                <input type="text" name="address" value={profileFormState.address || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
                <div className="relative">
                  <select name="country" value={profileFormState.country || ""} onChange={(e) => {
                    onFormChange(e);
                    // Reset dependents using synthesized events
                    onFormChange({ target: { name: 'state', value: '' } } as any);
                    onFormChange({ target: { name: 'district', value: '' } } as any);
                    onFormChange({ target: { name: 'city', value: '' } } as any);
                  }}
                    className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none cursor-pointer">
                    <option value="">Select Country</option>
                    {Object.keys(locationData).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
                <div className="relative">
                  <select name="state" value={profileFormState.state || ""} onChange={(e) => {
                    onFormChange(e);
                    onFormChange({ target: { name: 'district', value: '' } } as any);
                    onFormChange({ target: { name: 'city', value: '' } } as any);
                  }}
                    disabled={!profileFormState.country}
                    className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    <option value="">Select State</option>
                    {profileFormState.country && locationData[profileFormState.country] && Object.keys(locationData[profileFormState.country]).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District</label>
                <div className="relative">
                  <select name="district" value={profileFormState.district || ""} onChange={(e) => {
                    onFormChange(e);
                    onFormChange({ target: { name: 'city', value: '' } } as any);
                  }}
                    disabled={!profileFormState.state}
                    className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    <option value="">Select District</option>
                    {profileFormState.country && profileFormState.state && locationData[profileFormState.country]?.[profileFormState.state] && Object.keys(locationData[profileFormState.country][profileFormState.state]).map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Taluka / City</label>
                <div className="relative">
                  <select name="city" value={profileFormState.city || ""} onChange={onFormChange}
                    disabled={!profileFormState.district}
                    className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20 appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    <option value="">Select Taluka</option>
                    {profileFormState.country && profileFormState.state && profileFormState.district && locationData[profileFormState.country]?.[profileFormState.state]?.[profileFormState.district]?.map(taluka => (
                      <option key={taluka} value={taluka}>{taluka}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">Family & Lifestyle</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Family & Relatives</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newRel = [...(profileFormState.relativesList || []), { name: '', relation: 'Papa (Father)', occupation: '', mobile: '' }];
                      onFormChange({ target: { name: 'relativesList', value: newRel } } as any);
                    }}
                    className="flex items-center gap-1 text-[10px] text-maroon-700 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Relative
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(profileFormState.relativesList || []).map((rel: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start border border-slate-100 dark:border-dark-800 p-2.5 rounded-xl bg-slate-50/50 dark:bg-dark-900/50">
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">Name</label>
                        <input type="text" value={rel.name} onChange={(e) => {
                          const newRel = [...profileFormState.relativesList];
                          newRel[index].name = e.target.value;
                          onFormChange({ target: { name: 'relativesList', value: newRel } } as any);
                        }} className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-950 focus:outline-none focus:border-maroon-700" placeholder="Name" />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">Relation</label>
                        <select value={rel.relation} onChange={(e) => {
                          const newRel = [...profileFormState.relativesList];
                          newRel[index].relation = e.target.value;
                          onFormChange({ target: { name: 'relativesList', value: newRel } } as any);
                        }} className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-950 focus:outline-none focus:border-maroon-700 appearance-none cursor-pointer">
                          <option value="Papa (Father)">Papa (Father)</option>
                          <option value="Mummy (Mother)">Mummy (Mother)</option>
                          <option value="Bhai (Brother)">Bhai (Brother)</option>
                          <option value="Behen (Sister)">Behen (Sister)</option>
                          <option value="Chacha/Mama (Uncle)">Chacha/Mama (Uncle)</option>
                          <option value="Chachi/Mami (Aunt)">Chachi/Mami (Aunt)</option>
                          <option value="Bhatija/Bhanja (Nephew)">Bhatija/Bhanja (Nephew)</option>
                          <option value="Bhatiji/Bhanji (Niece)">Bhatiji/Bhanji (Niece)</option>
                          <option value="Dada/Nana (Grandfather)">Dada/Nana (Grandfather)</option>
                          <option value="Dadi/Nani (Grandmother)">Dadi/Nani (Grandmother)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">Occupation</label>
                        <input type="text" value={rel.occupation} onChange={(e) => {
                          const newRel = [...profileFormState.relativesList];
                          newRel[index].occupation = e.target.value;
                          onFormChange({ target: { name: 'relativesList', value: newRel } } as any);
                        }} className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-950 focus:outline-none focus:border-maroon-700" placeholder="Occupation" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">Mobile</label>
                        <input type="tel" value={rel.mobile} onChange={(e) => {
                          const newRel = [...profileFormState.relativesList];
                          newRel[index].mobile = e.target.value;
                          onFormChange({ target: { name: 'relativesList', value: newRel } } as any);
                        }} className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-950 focus:outline-none focus:border-maroon-700" placeholder="Mobile" />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pt-5">
                        <button type="button" onClick={() => {
                          const newRel = profileFormState.relativesList.filter((_: any, i: number) => i !== index);
                          onFormChange({ target: { name: 'relativesList', value: newRel } } as any);
                        }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!profileFormState.relativesList || profileFormState.relativesList.length === 0) && (
                    <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-dark-800 rounded-xl">
                      No relatives added yet. Click "+ Add Relative" above.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Food Preference</label>
                <select name="foodPreference" value={profileFormState.foodPreference || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lifestyle</label>
                <select name="lifestyle" value={profileFormState.lifestyle || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="Simple">Simple</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Liberal">Liberal</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hobbies</label>
                <input type="text" name="hobbies" value={profileFormState.hobbies || ""} onChange={onFormChange} placeholder="Reading, travel..."
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">Horoscope & Astro</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rashi (Zodiac)</label>
                <input type="text" name="rashi" value={profileFormState.rashi || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nakshatra</label>
                <input type="text" name="nakshatra" value={profileFormState.nakshatra || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dosha / Manglik</label>
                <select name="manglik" value={profileFormState.manglik || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Don't Know">Don't Know</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Birth Time</label>
                <input type="time" name="birthTime" value={profileFormState.birthTime || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Birth Place</label>
                <input type="text" name="birthPlace" value={profileFormState.birthPlace || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">Partner Preferences & Compatibility</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Family Type Preference</label>
                <select name="prefFamilyType" value={profileFormState.prefFamilyType || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="">Any</option>
                  <option value="Joint Family">Joint Family</option>
                  <option value="Nuclear Family">Nuclear Family</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partner Working</label>
                <select name="prefWorking" value={profileFormState.prefWorking || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="">Any</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Values</label>
                <select name="prefValues" value={profileFormState.prefValues || ""} onChange={onFormChange}
                  className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20">
                  <option value="">Any</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Liberal">Liberal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
              Save Profile
            </button>
            <button type="button" onClick={onCancelEdit}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-dark-800 transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-3 pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
              <User className="h-4 w-4" /> Basic Info
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Age / Height</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{(myProfile.age || calculateAge(myProfile.dob || ""))} Yrs / {myProfile.heightFt ? `${myProfile.heightFt}' ${myProfile.heightInches || 0}"` : (myProfile.height || "N/A")}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Gender</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.gender || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Marital Status</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.maritalStatus || "Never Married"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Mother Tongue</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.motherTongue || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Sub Caste</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.subCaste || "Panchal"}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-3 pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Contact
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Email</span>
                <strong className="text-slate-900 dark:text-white font-semibold truncate ml-2">{myProfile.email || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Mobile</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.countryCode || "+91"} {myProfile.mobile || "N/A"}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-3 pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
              <Award className="h-4 w-4" /> Professional
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Education</span>
                <strong className="text-slate-900 dark:text-white font-semibold text-right">{myProfile.education || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">Occupation</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.occupation || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Income</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.income || "N/A"}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-3 pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">City / District</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.city || "N/A"} / {myProfile.district || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-dark-850">
                <span className="text-slate-500">State</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.state || "N/A"}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Address</span>
                <strong className="text-slate-900 dark:text-white font-semibold text-right max-w-[60%]">{myProfile.address || "N/A"}</strong>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-3 pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
              <Heart className="h-4 w-4" /> Family & Lifestyle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
                <span className="text-slate-500 block mb-2 font-bold uppercase tracking-wider text-[10px]">Relatives</span>
                {myProfile.relativesList && myProfile.relativesList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myProfile.relativesList.map((rel: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-dark-850 p-3 rounded-xl border border-slate-100 dark:border-dark-800 flex items-center justify-between shadow-sm">
                        <div>
                          <strong className="text-slate-900 dark:text-white font-semibold block text-xs">{rel.name || "Unknown"}</strong>
                          <span className="text-[10px] text-slate-500">{rel.relation} {rel.occupation ? `• ${rel.occupation}` : ""}</span>
                        </div>
                        {rel.mobile && (
                          <div className="text-[10px] font-bold text-maroon-700 dark:text-gold-400 bg-maroon-50 dark:bg-maroon-900/20 px-2 py-1 rounded-md">
                            {rel.mobile}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <strong className="text-slate-900 dark:text-white font-semibold">N/A</strong>
                )}
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-0.5">Food</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.foodPreference || "Vegetarian"}</strong>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-0.5">Lifestyle</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.lifestyle || "Moderate"}</strong>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-0.5">Family</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.familyDetails || "N/A"}</strong>
              </div>
              <div className="py-1.5 sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">Hobbies</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.hobbies || "N/A"}</strong>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-3 pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
              <Heart className="h-4 w-4" /> Partner Preferences & Compatibility
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="py-1.5">
                <span className="text-slate-500 block mb-0.5">Family Type</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.prefFamilyType || "Any"}</strong>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-0.5">Partner Working</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.prefWorking || "Any"}</strong>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-0.5">Values</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{myProfile.prefValues || "Any"}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Read Only Horoscope */}
      {!isEditingProfile && (
        <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-6 shadow-sm mt-5">
          <h4 className="font-serif font-bold text-sm text-maroon-700 dark:text-gold-400 mb-4 pb-3 border-b border-slate-100 dark:border-dark-800">Horoscope Details</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-center">
            <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Rashi</span>
              <strong className="text-slate-800 dark:text-slate-200">{myProfile.rashi || "N/A"}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Nakshatra</span>
              <strong className="text-slate-800 dark:text-slate-200">{myProfile.nakshatra || "N/A"}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Manglik</span>
              <strong className="text-slate-800 dark:text-slate-200">{myProfile.manglik || "No"}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Birth Time & Place</span>
              <strong className="text-slate-800 dark:text-slate-200">{myProfile.birthTime || "N/A"} • {myProfile.birthPlace || "N/A"}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfileSection;
