import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Loader2, ChevronDown, ChevronUp, AlertTriangle,
  Sparkles, Calculator, RefreshCw, Info
} from "lucide-react";
import { auth } from "../../../config/firebase";
import {
  computeKundali, saveKundali,
  type KundaliData
} from "../../../utils/kundali";
import toast from "react-hot-toast";

interface KundaliCardProps {
  profile: any;
  isOwnProfile: boolean;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:"☉", Moon:"☽", Mars:"♂", Mercury:"☿",
  Jupiter:"♃", Venus:"♀", Saturn:"♄", Rahu:"☊", Ketu:"☋"
};
const RASHI_SYMBOLS: Record<string, string> = {
  Aries:"♈", Taurus:"♉", Gemini:"♊", Cancer:"♋",
  Leo:"♌", Virgo:"♍", Libra:"♎", Scorpio:"♏",
  Sagittarius:"♐", Capricorn:"♑", Aquarius:"♒", Pisces:"♓"
};
const SEVERITY_BG: Record<string, string> = {
  mild: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  moderate: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  severe: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
};
const DOSHA_COLORS: Record<string, string> = {
  mild: "#f59e0b", moderate: "#f97316", severe: "#ef4444"
};

export default function KundaliCard({ profile, isOwnProfile }: KundaliCardProps) {
  const [loading, setLoading] = useState(false);
  const [expandedDosha, setExpandedDosha] = useState<number | null>(null);
  const [showPlanets, setShowPlanets] = useState(false);
  const [kundali, setKundali] = useState<KundaliData | null>(profile.kundali || null);
  const [formData, setFormData] = useState({
    dob: profile.dob || "",
    birthTime: profile.birthTime || "",
    birthPlace: profile.city || "",
  });
  const [showForm, setShowForm] = useState(!profile.kundali);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dob || !formData.birthTime || !formData.birthPlace) {
      toast.error("Please fill in birth date, time, and city");
      return;
    }
    const uid = profile.id || auth.currentUser?.uid;
    if (!uid) { toast.error("Not authenticated"); return; }
    setLoading(true);
    try {
      // Convert dob if in DD/MM/YYYY format
      let dob = formData.dob;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
        const [d, m, y] = dob.split("/");
        dob = `${y}-${m}-${d}`;
      }
      // Client-side calculation using astronomy-engine
      const result = computeKundali(dob, formData.birthTime, formData.birthPlace);
      // Save to Firestore directly
      await saveKundali(uid, result);
      setKundali(result);
      setShowForm(false);
      toast.success("Kundali calculated successfully! 🪐");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to calculate Kundali");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-700 to-maroon-600 dark:from-maroon-800 dark:to-maroon-700 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">🪐</div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Janma Kundali</h3>
              <p className="text-xs text-maroon-100">Vedic Birth Chart · Ashtakoot Analysis</p>
            </div>
          </div>
          {kundali && isOwnProfile && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" /> Recalculate
            </button>
          )}
        </div>
      </div>

      {/* Calculation Form */}
      <AnimatePresence>
        {(showForm || !kundali) && isOwnProfile && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
            <form onSubmit={handleCalculate} className="p-5 space-y-4 border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                Enter exact birth details for accurate Kundali (Lahiri Ayanamsa, Vedic sidereal)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Birth Date</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData(p => ({...p, dob: e.target.value}))} required className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-500/30" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Birth Time (24hr)</label>
                  <input type="time" value={formData.birthTime} onChange={e => setFormData(p => ({...p, birthTime: e.target.value}))} required className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-500/30" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Birth City (India)</label>
                  <input type="text" value={formData.birthPlace} onChange={e => setFormData(p => ({...p, birthPlace: e.target.value}))} placeholder="e.g., Pune, Mumbai" required className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-500/30" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5" />}
                {loading ? "Calculating…" : "Calculate My Kundali"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not calculated — other profile */}
      {!kundali && !isOwnProfile && (
        <div className="p-8 text-center text-slate-400">
          <div className="text-4xl mb-3">🔮</div>
          <p className="text-sm font-medium">Kundali not yet set up</p>
          <p className="text-xs mt-1">This profile hasn't calculated their birth chart yet</p>
        </div>
      )}

      {/* Results */}
      {kundali && (
        <div className="p-5 space-y-5">
          {/* Core Signs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Moon Sign (Rashi)", value:kundali.moonSign, symbol:RASHI_SYMBOLS[kundali.moonSign]||"🌙", sub:"राशि" },
              { label:"Ascendant (Lagna)", value:kundali.lagna, symbol:RASHI_SYMBOLS[kundali.lagna]||"⬆️", sub:"लग्न" },
              { label:"Sun Sign", value:kundali.sunSign, symbol:RASHI_SYMBOLS[kundali.sunSign]||"☀️", sub:"सूर्य" },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 dark:bg-dark-950 rounded-2xl p-3 text-center border border-slate-100 dark:border-dark-800">
                <div className="text-2xl mb-1">{item.symbol}</div>
                <div className="font-serif text-sm font-bold text-slate-900 dark:text-white">{item.value}</div>
                <div className="text-[9px] text-slate-400">{item.sub}</div>
                <div className="text-[9px] text-maroon-600 dark:text-gold-400 font-semibold mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Nakshatra & Ashtakoot factors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-maroon-50 to-gold-50 dark:from-maroon-950/20 dark:to-gold-950/10 rounded-2xl p-3 border border-maroon-100 dark:border-maroon-900/30">
              <div className="text-[9px] font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-wider mb-1">Birth Nakshatra</div>
              <div className="font-serif text-base font-bold text-slate-900 dark:text-white">⭐ {kundali.nakshatra}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pada {kundali.pada} · Lord: {kundali.nakshatraLord}</div>
            </div>
            <div className="bg-slate-50 dark:bg-dark-950 rounded-2xl p-3 border border-slate-100 dark:border-dark-800">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ashtakoot Factors</div>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <span className="text-slate-600 dark:text-slate-300">Gana: <strong>{kundali.gana}</strong></span>
                <span className="text-slate-600 dark:text-slate-300">Nadi: <strong>{kundali.nadi}</strong></span>
                <span className="text-slate-600 dark:text-slate-300">Yoni: <strong>{kundali.yoni}</strong></span>
                <span className="text-slate-600 dark:text-slate-300">Varna: <strong>{kundali.varna}</strong></span>
              </div>
            </div>
          </div>

          {/* Planet Positions */}
          <div>
            <button onClick={() => setShowPlanets(!showPlanets)} className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-maroon-700 dark:hover:text-gold-400 transition-colors cursor-pointer">
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Graha Positions (Planet Chart)</span>
              {showPlanets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <AnimatePresence>
              {showPlanets && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden mt-3">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {Object.entries(kundali.planets).map(([name, pos]) => (
                      <div key={name} className="bg-slate-50 dark:bg-dark-950 rounded-xl p-2 text-center border border-slate-100 dark:border-dark-800">
                        <div className="text-lg font-bold text-maroon-700 dark:text-gold-400">{PLANET_SYMBOLS[name]||"•"}</div>
                        <div className="text-[9px] font-bold text-slate-900 dark:text-white">{name}</div>
                        <div className="text-[8px] text-slate-500">{RASHI_SYMBOLS[pos.rashi]||""} {pos.rashi}</div>
                        <div className="text-[8px] text-maroon-600 dark:text-gold-400">{pos.degree.toFixed(1)}°{pos.retrograde?" ℞":""}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Doshas */}
          {kundali.doshas.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Doshas Detected ({kundali.doshas.length})</span>
              </div>
              <div className="space-y-2">
                {kundali.doshas.map((dosha, idx) => (
                  <div key={idx} className={`rounded-2xl border p-3 ${SEVERITY_BG[dosha.severity]}`}>
                    <button onClick={() => setExpandedDosha(expandedDosha === idx ? null : idx)} className="w-full flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: DOSHA_COLORS[dosha.severity] }}>{dosha.severity.toUpperCase()}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{dosha.name}</span>
                      </div>
                      {expandedDosha === idx ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedDosha === idx && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{dosha.description}</p>
                          <div className="mt-2">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remedies</div>
                            <ul className="space-y-1">
                              {dosha.remedies.map((r, ri) => (
                                <li key={ri} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                  <span className="text-maroon-600 dark:text-gold-400 flex-shrink-0 mt-0.5">•</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
              <Star className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-semibold">No major Doshas detected — auspicious Kundali! 🙏</span>
            </div>
          )}

          <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
            {kundali.birthPlace} · {kundali.dob} · {kundali.birthTime} IST · Lahiri Ayanamsa (Vedic Sidereal)
          </p>
        </div>
      )}
    </div>
  );
}
