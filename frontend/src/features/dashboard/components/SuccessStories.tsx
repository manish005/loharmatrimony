import React, { useEffect, useState, useMemo } from "react";
import { Heart, Calendar, PartyPopper, ChevronDown, Filter } from "lucide-react";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";

interface CoupleEntry {
  coupleId: string;
  partner1Id: string;
  partner2Id: string;
  partner1Name: string;
  partner2Name: string;
  partner1Photo: string;
  partner2Photo: string;
  partner1Gender: string;
  partner2Gender: string;
  weddingDate: string;
  venue: string;
  story: string;
}

interface SuccessStoriesProps {
  onSelectStory: (story: any) => void;
  myProfile: any;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const SuccessStories: React.FC<SuccessStoriesProps> = ({ onSelectStory, myProfile, showToast }) => {
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [storiesData, setStoriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "married">("all");

  useEffect(() => {
    const unsubProfiles = onSnapshot(
      query(collection(db, "profiles"), where("isMarried", "==", true)),
      (snapshot) => {
        const marriedData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        setProfilesData(marriedData);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load married profiles:", err);
        setLoading(false);
      }
    );

    const unsubStories = onSnapshot(collection(db, "successStories"), (snapshot) => {
      const stories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setStoriesData(stories);
    });

    return () => {
      unsubProfiles();
      unsubStories();
    };
  }, []);

  const couples = useMemo(() => {
    const paired = new Set<string>();
    const result: CoupleEntry[] = [];

    profilesData.forEach((p: any) => {
      if (paired.has(p.id)) return;
      const partner = profilesData.find((pp: any) => pp.id === p.partnerId);
      
      let entry: CoupleEntry;
      if (partner) {
        paired.add(p.id);
        paired.add(partner.id);
        entry = {
          coupleId: [p.id, partner.id].sort().join("_"),
          partner1Id: p.id,
          partner2Id: partner.id,
          partner1Name: p.name || "User",
          partner2Name: partner.name || "User",
          partner1Photo: p.photos?.[0] || p.photo || "",
          partner2Photo: partner.photos?.[0] || partner.photo || "",
          partner1Gender: p.gender || "",
          partner2Gender: partner.gender || "",
          weddingDate: p.weddingDate || "",
          venue: "",
          story: ""
        };
      } else {
        paired.add(p.id);
        entry = {
          coupleId: p.id + "_single",
          partner1Id: p.id,
          partner2Id: p.partnerId || "",
          partner1Name: p.name || "User",
          partner2Name: p.partnerName || "Partner",
          partner1Photo: p.photos?.[0] || p.photo || "",
          partner2Photo: p.partnerPhoto || "",
          partner1Gender: p.gender || "",
          partner2Gender: "",
          weddingDate: p.weddingDate || "",
          venue: "",
          story: ""
        };
      }

      // Merge with success story
      const story = storiesData.find(s => 
        (s.partner1Id === entry.partner1Id && s.partner2Id === entry.partner2Id) ||
        (s.partner1Id === entry.partner2Id && s.partner2Id === entry.partner1Id)
      );
      if (story) {
        entry.story = story.story || entry.story;
        entry.venue = story.venue || entry.venue;
        if (story.weddingDate) {
          entry.weddingDate = story.weddingDate;
        }
      }

      result.push(entry);
    });

    return result;
  }, [profilesData, storiesData]);

  const todayStr = new Date().toISOString().split("T")[0];

  const isToday = (date: string) => date === todayStr;
  const isUpcoming = (date: string) => date && new Date(date) > new Date(new Date().toDateString());
  const isPast = (date: string) => date && new Date(date) < new Date(new Date().toDateString());

  const filtered = useMemo(() => {
    let list = couples;
    if (filter === "today") list = couples.filter(c => isToday(c.weddingDate));
    else if (filter === "upcoming") list = couples.filter(c => isUpcoming(c.weddingDate) || !c.weddingDate);
    else if (filter === "married") list = couples.filter(c => c.weddingDate && isPast(c.weddingDate));
    return list;
  }, [couples, filter]);

  const todayCouples = useMemo(() => couples.filter(c => isToday(c.weddingDate)), [couples]);

  const handleCongratulate = async (couple: CoupleEntry) => {
    try {
      const myName = myProfile?.name || myProfile?.firstName || "Someone";
      const myId = myProfile?.id;
      if (!myId) {
        showToast("Please complete your profile first.", "error");
        return;
      }

      const msg = `${myName} sent congratulations on your wedding! 🎉`;

      await addDoc(collection(db, "notifications"), {
        receiverId: couple.partner1Id,
        senderId: myId,
        text: msg,
        type: "congratulations",
        read: false,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        receiverId: couple.partner2Id,
        senderId: myId,
        text: msg,
        type: "congratulations",
        read: false,
        createdAt: serverTimestamp()
      });

      const short1 = couple.partner1Name.split(" ")[0];
      const short2 = couple.partner2Name.split(" ")[0];
      showToast(`🎉 Congratulations sent to ${short1} & ${short2}!`, "success");
    } catch (err) {
      console.error("Failed to send congratulations:", err);
      showToast("Failed to send congratulations.", "error");
    }
  };

  const buildStoryData = (c: CoupleEntry) => ({
    id: c.coupleId,
    couple: `${c.partner1Name.split(" ")[0]} & ${c.partner2Name.split(" ")[0]}`,
    date: c.weddingDate || "TBD",
    image: c.partner1Photo || c.partner2Photo || "",
    malePhoto: c.partner1Gender === "Male" ? c.partner1Photo : c.partner2Photo,
    femalePhoto: c.partner1Gender === "Female" ? c.partner1Photo : c.partner2Photo,
    story: c.story || `We found our perfect match on Lohar Matrimony!`
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-dark-800/40 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Success Stories</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Celebrate couples who found their match through Lohar Matrimony
          </p>
        </div>
        <div className="relative shrink-0 self-end sm:self-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="appearance-none text-xs font-bold border border-slate-200 dark:border-dark-800 rounded-xl pl-8 pr-8 py-2 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 cursor-pointer min-w-[140px]"
          >
            <option value="all">All Stories</option>
            <option value="today">Today's Marriages</option>
            <option value="upcoming">Upcoming Marriages</option>
            <option value="married">Married Couples</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-maroon-700"></div>
        </div>
      ) : couples.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
          <Heart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No stories yet</p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
            The first success stories will appear here when someone says "I do"!
          </p>
        </div>
      ) : (
        <>
          {/* Today's Marriage Section */}
          {todayCouples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-amber-500" />
                <h3 className="font-serif text-sm font-bold text-amber-700 dark:text-amber-400">Today's Marriage!</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {todayCouples.map(couple => (
                  <div
                    key={couple.coupleId}
                    className="bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-900/15 dark:to-rose-900/15 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {couple.partner1Photo ? (
                            <img src={couple.partner1Photo} alt={couple.partner1Name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 dark:border-amber-700 shadow-sm" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-lg border-2 border-amber-300 dark:border-amber-700">
                              {couple.partner1Name.charAt(0)}
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 text-lg">👰</span>
                        </div>
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        <div className="relative">
                          {couple.partner2Photo ? (
                            <img src={couple.partner2Photo} alt={couple.partner2Name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 dark:border-amber-700 shadow-sm" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-lg border-2 border-amber-300 dark:border-amber-700">
                              {couple.partner2Name.charAt(0)}
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 text-lg">🤵</span>
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                          {couple.partner1Name.split(" ")[0]} & {couple.partner2Name.split(" ")[0]}
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 justify-center sm:justify-start mt-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Getting Married Today!
                        </p>
                        {couple.venue && (
                          <p className="text-[10px] text-slate-500 mt-0.5">Venue: {couple.venue}</p>
                        )}
                      </div>
                      {myProfile?.id !== couple.partner1Id && myProfile?.id !== couple.partner2Id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCongratulate(couple); }}
                          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <PartyPopper className="h-4 w-4" /> Congratulate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Couple Cards */}
          {filtered.length > 0 ? (
            <>
              {todayCouples.length > 0 && filter === "all" && (
                <hr className="border-slate-200 dark:border-dark-800 my-2" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(couple => {
                  const isFuture = couple.weddingDate && new Date(couple.weddingDate) >= new Date(new Date().toDateString());
                  return (
                    <div
                      key={couple.coupleId}
                      onClick={() => onSelectStory(buildStoryData(couple))}
                      className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row h-full"
                    >
                      <div className="sm:w-1/3 relative h-44 sm:h-auto min-h-[140px] bg-slate-100 dark:bg-dark-850 flex items-center justify-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          {couple.partner1Photo ? (
                            <img src={couple.partner1Photo} alt={couple.partner1Name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-dark-800 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-dark-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm border-2 border-white dark:border-dark-800">
                              {couple.partner1Name.charAt(0)}
                            </div>
                          )}
                          <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 -my-0.5" />
                          {couple.partner2Photo ? (
                            <img src={couple.partner2Photo} alt={couple.partner2Name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-dark-800 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-dark-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm border-2 border-white dark:border-dark-800">
                              {couple.partner2Name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 sm:w-2/3 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <Heart className="h-4 w-4 text-maroon-700 fill-maroon-700 shrink-0" />
                            {couple.partner1Name.split(" ")[0]} & {couple.partner2Name.split(" ")[0]}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            {couple.weddingDate
                              ? isFuture
                                ? `Wedding on ${new Date(couple.weddingDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
                                : `Married on ${new Date(couple.weddingDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
                              : "Getting Married"}
                          </span>
                          {couple.story && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-350 italic mt-2.5 leading-relaxed line-clamp-3">
                              "{couple.story}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">
                            {isFuture ? "Upcoming Wedding" : "Married Couple"}
                          </span>
                          {(isToday(couple.weddingDate) || (!isFuture && couple.weddingDate)) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCongratulate(couple); }}
                              disabled={myProfile?.id === couple.partner1Id || myProfile?.id === couple.partner2Id}
                              className="text-[9px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                              <PartyPopper className="h-3 w-3" /> Congratulate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
              <Heart className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {filter === "upcoming" ? "No upcoming marriages" :
                 filter === "married" ? "No married couples yet" :
                 filter === "today" ? "No marriages today" :
                 "No couples found"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuccessStories;
