import React from "react";
import { Compass } from "lucide-react";

interface HoroscopePanelProps {
  profile?: any;
}

const HoroscopePanel: React.FC<HoroscopePanelProps> = ({ profile }) => {
  return (
    <div className="glass-panel border border-slate-200/40 dark:border-dark-800/40 rounded-3xl p-6 sm:p-8 bg-white/70 space-y-6">
      <div className="text-center max-w-sm mx-auto space-y-2">
        <Compass className="h-10 w-10 mx-auto text-maroon-700 dark:text-gold-400 animate-spin-slow" />
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Traditional Horoscope Matching</h3>
        <p className="text-[10px] text-slate-500 font-semibold">Simulated Kundli details for Astro compatibility calculations</p>
      </div>

      <div className="max-w-md mx-auto aspect-square border-2 border-maroon-700/30 rounded-2xl relative p-4 bg-[#faf7f2] dark:bg-dark-900 shadow-inner flex items-center justify-center">
        <span className="font-devanagari text-xs text-maroon-700 font-bold bg-[#faf7f2] dark:bg-dark-900 px-3.5 py-2.5 rounded-lg border border-maroon-700/20 shadow">
          ॥ कुण्डली मिलान ॥
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-center max-w-md mx-auto">
        <div className="bg-white/50 dark:bg-dark-900/50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 block mb-0.5">Rashi</span>
          <strong className="text-slate-800 dark:text-slate-200">{profile?.rashi || "Mesh (Aries)"}</strong>
        </div>
        <div className="bg-white/50 dark:bg-dark-900/50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 block mb-0.5">Date of Birth</span>
          <strong className="text-slate-800 dark:text-slate-200">{profile?.dob || "N/A"}</strong>
        </div>
        <div className="bg-white/50 dark:bg-dark-900/50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 block mb-0.5">Nakshatra</span>
          <strong className="text-slate-800 dark:text-slate-200">{profile?.nakshatra || "Not specified"}</strong>
        </div>
        <div className="bg-white/50 dark:bg-dark-900/50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 block mb-0.5">Manglik</span>
          <strong className="text-slate-800 dark:text-slate-200">{profile?.manglik || "Not specified"}</strong>
        </div>
        <div className="bg-white/50 dark:bg-dark-900/50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 block mb-0.5">Birth Time & Place</span>
          <strong className="text-slate-800 dark:text-slate-200">{profile?.birthTime || "N/A"} • {profile?.birthPlace || "N/A"}</strong>
        </div>
      </div>
    </div>
  );
};

export default HoroscopePanel;
