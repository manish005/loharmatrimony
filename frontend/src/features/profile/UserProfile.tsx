import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  Share2,
  Bookmark,
  Mail,
  Phone
} from "lucide-react";

export const UserProfile: React.FC = () => {
  const [interestSent, setInterestSent] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Profile data mockup of a Lohar bride
  const profile = {
    id: 1,
    name: "Sunita Lohar",
    age: 24,
    height: "5'2\"",
    weight: "52 kg",
    maritalStatus: "Never Married",
    religion: "Hinduism",
    caste: "Lohar",
    subCaste: "Panchal",
    motherTongue: "Marathi",
    education: "B.Tech Computer Science",
    occupation: "Software Engineer",
    company: "Tata Consultancy Services (TCS)",
    income: "₹12 Lakh",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Bandra West, Mumbai",
    compatibility: 91,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    bio: "I am a simple, ambitious, and family-oriented girl. I have completed my B.Tech and currently working in Mumbai as a Software Engineer. I like balancing modern professional life with deep-rooted Indian values. In my spare time, I love painting, reading, and listening to classical music.",
    family: {
      father: "Govind Lohar (Retired Government Servant)",
      mother: "Shubhangi Lohar (School Teacher)",
      siblings: "1 Younger Brother (Completed BE, studying for MS)",
      values: "Moderate / Traditional"
    },
    lifestyle: {
      food: "Pure Vegetarian",
      smoking: "No",
      drinking: "No",
      hobbies: "Painting, Travel, Gardening"
    },
    preferences: {
      age: "26 to 30 Yrs",
      height: "5'6\" to 5'11\"",
      education: "BE / B.Tech / MBA / Post Graduate",
      income: "₹10 Lakh+",
      caste: "Lohar (Panchal preferred)",
      location: "Maharashtra (Mumbai/Pune preferred)"
    },
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop"
    ]
  };

  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Profile Header Cards (Gallery + Top summary) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Photo Gallery Panel */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-dark-800 bg-white dark:bg-dark-900 shadow-sm">
              <img 
                src={profile.photos[activePhoto]} 
                alt={profile.name} 
                className="w-full h-full object-cover transition-all"
              />
              
              {/* Online status indicator */}
              {profile.isOnline && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 glass-panel px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                </div>
              )}
            </div>

            {/* Thumbnail selectors */}
            <div className="flex gap-3">
              {profile.photos.map((photo, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activePhoto === idx ? "border-maroon-700 dark:border-gold-500 scale-95" : "border-transparent"
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Top Quick Details and CTA controls */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-5">
              
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> ID Verified
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" /> Premium
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Profile created by Parents • Last seen 1 hour ago
                </p>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-3 gap-4 border-y border-slate-50 dark:border-dark-850 py-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Age / Height</span>
                  <h4 className="text-sm font-serif font-bold text-slate-900 dark:text-white mt-0.5">{profile.age} Yrs • {profile.height}</h4>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Caste / Sub-Caste</span>
                  <h4 className="text-sm font-serif font-bold text-slate-900 dark:text-white mt-0.5">{profile.caste} • {profile.subCaste}</h4>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Compatibility</span>
                  <h4 className="text-sm font-serif font-bold text-emerald-600 dark:text-emerald-450 mt-0.5 flex items-center justify-center gap-1">
                    <Sparkles className="h-4.5 w-4.5 text-gold-450 fill-gold-450" /> {profile.compatibility}%
                  </h4>
                </div>
              </div>

              {/* Core short bio summary */}
              <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed italic">
                "{profile.bio}"
              </p>

              {/* Actions row */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-50 dark:border-dark-850">
                <button
                  onClick={() => setInterestSent(!interestSent)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
                    interestSent 
                      ? "bg-emerald-500 text-white" 
                      : "bg-maroon-700 hover:bg-maroon-800 text-white"
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${interestSent ? 'fill-white' : ''}`} />
                  {interestSent ? "Interest Sent" : "Send Interest"}
                </button>

                <button
                  onClick={() => setShortlisted(!shortlisted)}
                  className={`p-3 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors ${
                    shortlisted ? "text-maroon-750 bg-maroon-50/50" : "text-slate-500"
                  }`}
                  title="Shortlist Profile"
                >
                  <Bookmark className={`h-4.5 w-4.5 ${shortlisted ? 'fill-maroon-600' : ''}`} />
                </button>

                <button
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-dark-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-850 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="h-4.5 w-4.5 text-maroon-600 dark:text-gold-400" /> Chat Now
                </button>
              </div>
            </div>

            {/* Contact details premium gate */}
            <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white mb-3">Contact Information</h3>
              
              {showContact ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Phone className="h-4 w-4 text-maroon-650" /> +91 98214 74210
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Mail className="h-4 w-4 text-maroon-650" /> sunita.lohar@tata.com
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <MapPin className="h-4 w-4 text-maroon-650" /> {profile.address}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 rounded-2xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Unlock contact info using one of your Gold tier contact credits
                  </p>
                  <button
                    onClick={() => setShowContact(true)}
                    className="px-4 py-2 bg-gradient-to-r from-maroon-700 to-maroon-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    View Contact Details
                  </button>
                </div>
              )}
            </div>

          </div>

        </section>

        {/* 2. TABULAR PROFILE METADATA DETAILS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Detailed sections columns */}
          <div className="md:col-span-2 space-y-6">
            
            {/* About Block */}
            <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-dark-850 pb-2">
                Personal Background & Lifestyle
              </h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs leading-relaxed">
                <div>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Marital Status</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.maritalStatus}</p>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Mother Tongue</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.motherTongue}</p>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Education</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.education}</p>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Annual Income</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.income}</p>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Dietary Prefs</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.lifestyle.food}</p>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Hobbies</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.lifestyle.hobbies}</p>
                </div>
              </div>
            </div>

            {/* Family background */}
            <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-dark-850 pb-2">
                Family Context
              </h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-450 dark:text-slate-500 font-medium w-1/3">Father's Status</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 w-2/3 text-right">{profile.family.father}</p>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-450 dark:text-slate-500 font-medium w-1/3">Mother's Status</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 w-2/3 text-right">{profile.family.mother}</p>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-450 dark:text-slate-500 font-medium w-1/3">Siblings Detail</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 w-2/3 text-right">{profile.family.siblings}</p>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-450 dark:text-slate-500 font-medium w-1/3">Family values</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 w-2/3 text-right">{profile.family.values}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right column: Partner Preferences */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-dark-850 pb-2 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-maroon-700 dark:text-gold-400" /> Partner Preferences
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium block">Age Scope</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{profile.preferences.age}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium block">Height Scope</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{profile.preferences.height}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium block">Preferred Caste</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{profile.preferences.caste}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium block">Education Scope</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{profile.preferences.education}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium block">Expected Income</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{profile.preferences.income}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium block">Preferred Locations</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{profile.preferences.location}</p>
                </div>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};
