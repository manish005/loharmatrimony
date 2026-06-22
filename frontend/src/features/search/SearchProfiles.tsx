import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { 
  Filter, 
  Grid, 
  List, 
  Heart, 
  UserCheck, 
  Sparkles, 
  SlidersHorizontal,
  ChevronDown,
  MessageCircle,
  MapPin,
  Search,
  CheckCircle2
} from "lucide-react";



export const SearchProfiles: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSubCaste, setSelectedSubCaste] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [interestsSent, setInterestsSent] = useState<(string | number)[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const dbProfiles = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Anonymous",
            age: data.age ? parseInt(data.age) : null,
            height: data.height || "",
            caste: data.caste || "",
            subCaste: data.subCaste || "",
            education: data.education || "",
            occupation: data.occupation || "",
            income: data.income || "",
            city: data.city || "",
            state: data.state || "",
            photo: data.photos && data.photos.length > 0 ? data.photos[0] : "",
            compatibility: data.compatibility || null,
            isOnline: data.isOnline || false,
            isVerified: data.isVerified || false,
            isPremium: data.isPremium || false,
            bio: data.bio || ""
          };
        });

        setProfiles(dbProfiles);
      } catch (err) {
        console.error("Error loading profiles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Toggle interest helper
  const toggleInterest = (id: string | number) => {
    if (interestsSent.includes(id)) {
      setInterestsSent(prev => prev.filter(item => item !== id));
    } else {
      setInterestsSent(prev => [...prev, id]);
    }
  };

  // Filtered profiles mockup logic
  const filteredMatches = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          profile.occupation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubCaste = selectedSubCaste ? profile.subCaste === selectedSubCaste : true;
    const matchesVerified = verifiedOnly ? profile.isVerified : true;
    const matchesOnline = onlineOnly ? profile.isOnline : true;

    return matchesSearch && matchesSubCaste && matchesVerified && matchesOnline;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Page title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Search Life Partner</h1>
            <p className="text-xs text-slate-500 mt-1">Refine options using our intelligent compatibility filter panel</p>
          </div>
          
          {/* Quick search input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or profession..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* 1. FILTER SIDE PANEL (GLASSMORPHISM) */}
          <aside className="glass-panel border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-3">
              <span className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="h-4.5 w-4.5 text-maroon-700 dark:text-gold-400" /> Advanced Filters
              </span>
              <button 
                onClick={() => {
                  setSelectedSubCaste("");
                  setVerifiedOnly(false);
                  setOnlineOnly(false);
                  setSearchQuery("");
                }}
                className="text-[10px] text-maroon-700 dark:text-gold-400 font-bold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Sub-caste filter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">Sub Caste</label>
              <select
                value={selectedSubCaste}
                onChange={(e) => setSelectedSubCaste(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">All Sub Castes</option>
                <option value="Panchal">Panchal</option>
                <option value="Gadi Lohar">Gadi Lohar</option>
                <option value="Sangar">Sangar</option>
              </select>
            </div>

            {/* Range filters (mockup layout) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">Min Age</label>
                <select className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none">
                  <option>18 Yrs</option>
                  <option>22 Yrs</option>
                  <option>25 Yrs</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">Max Age</label>
                <select className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none">
                  <option>35 Yrs</option>
                  <option>40 Yrs</option>
                  <option>50 Yrs</option>
                </select>
              </div>
            </div>

            {/* Checkbox toggles */}
            <div className="space-y-3.5 border-t border-slate-100 dark:border-dark-800 pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded accent-maroon-700" 
                />
                <span className="text-xs text-slate-650 dark:text-slate-300 font-medium">Verified Profiles Only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="rounded accent-maroon-700" 
                />
                <span className="text-xs text-slate-650 dark:text-slate-300 font-medium">Online Members Only</span>
              </label>
            </div>
          </aside>

          {/* 2. MATCH GRID LISTINGS */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* View Mode controls */}
            <div className="flex items-center justify-between bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 px-4 py-3 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold">{filteredMatches.length} Matches Found</span>
              
              <div className="flex items-center gap-1.5 border border-slate-200/50 dark:border-dark-800 p-0.5 rounded-lg">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-100 dark:bg-dark-850 text-maroon-700 dark:text-gold-400" : "text-slate-400"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-slate-100 dark:bg-dark-850 text-maroon-700 dark:text-gold-400" : "text-slate-400"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Matching profile list */}
            {filteredMatches.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredMatches.map((profile) => (
                  <div 
                    key={profile.id}
                    className={`bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex relative ${
                      viewMode === "grid" ? "flex-col" : "flex-row p-4 gap-6 items-center"
                    }`}
                  >
                    
                    {/* Image Area */}
                    <div className={`relative bg-slate-100 dark:bg-dark-850 overflow-hidden flex-shrink-0 ${
                      viewMode === "grid" ? "h-60 w-full" : "h-36 w-36 rounded-2xl"
                    }`}>
                      <img 
                        src={profile.photo} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Online dot indicator */}
                      {profile.isOnline && (
                        <div className="absolute top-3 right-3">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white dark:border-dark-900"></span>
                          </span>
                        </div>
                      )}

                      {/* Compatibility match pill overlay */}
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1.5 shadow">
                        <Sparkles className="h-3 w-3 text-gold-400 fill-gold-400" /> {profile.compatibility}% Match
                      </div>
                    </div>

                    {/* Content Details Area */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                            {profile.name}
                          </h3>
                          {profile.isVerified && (
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-emerald-500/10" />
                          )}
                          {profile.isPremium && (
                            <Sparkles className="h-4 w-4 text-amber-500" />
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {profile.occupation} • {profile.subCaste}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium uppercase mt-0.5">
                          {profile.education} • {profile.income}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2">
                          <MapPin className="h-3.5 w-3.5 text-maroon-700 dark:text-gold-400 flex-shrink-0" />
                          {profile.city}, {profile.state}
                        </p>

                        {viewMode === "list" && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-3.5 leading-relaxed">
                            "{profile.bio}"
                          </p>
                        )}
                      </div>

                      {/* Card Action footer */}
                      <div className={`flex gap-2.5 mt-5 ${viewMode === "list" ? "flex-col sm:flex-row" : "flex-row"}`}>
                        <button
                          onClick={() => toggleInterest(profile.id)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
                            interestsSent.includes(profile.id)
                              ? "bg-emerald-500 text-white shadow-emerald-500/10"
                              : "bg-maroon-700 hover:bg-maroon-800 text-white shadow-maroon-500/10"
                          }`}
                        >
                          <Heart className={`h-4.5 w-4.5 ${interestsSent.includes(profile.id) ? 'fill-white' : ''}`} />
                          {interestsSent.includes(profile.id) ? "Interest Sent" : "Send Interest"}
                        </button>
                        
                        <Link 
                          to="/profile"
                          className="px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors flex items-center justify-center"
                        >
                          Details
                        </Link>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No matching profiles found. Try expanding filters.</p>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};
