import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, X, Star } from "lucide-react";
import { computeCompatibility, type CompatResult, type KundaliData } from "../../../utils/kundali";

interface CompatibilityBadgeProps {
  myKundali: KundaliData | null;
  matchKundali: KundaliData | null;
  matchName?: string;
}

function getScoreColor(score: number): string {
  if (score >= 30) return "#10b981";
  if (score >= 24) return "#22c55e";
  if (score >= 18) return "#f59e0b";
  if (score >= 12) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 30) return "Excellent";
  if (score >= 24) return "Good";
  if (score >= 18) return "Average";
  if (score >= 12) return "Below Avg";
  return "Poor";
}

export default function CompatibilityBadge({ myKundali, matchKundali, matchName }: CompatibilityBadgeProps) {
  const [data, setData] = useState<CompatResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (myKundali && matchKundali) {
      try {
        const result = computeCompatibility(myKundali, matchKundali);
        setData(result);
      } catch (err) {
        console.error("Compatibility calc error:", err);
      }
    }
  }, [myKundali, matchKundali]);

  if (!myKundali || !matchKundali) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-800 text-[9px] font-semibold text-slate-400">
        🔮 No Kundali
      </div>
    );
  }

  if (!data) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-800 text-[9px] font-semibold text-slate-400">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        Matching…
      </div>
    );
  }

  const color = getScoreColor(data.totalScore);
  const label = getScoreLabel(data.totalScore);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white hover:scale-105 transition-all cursor-pointer shadow-sm"
        style={{ backgroundColor: color }}
        title={`Kundali Match: ${data.totalScore}/36`}
      >
        ⭐ {data.totalScore}/36 · {label}
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale:0.9, y:40 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:40 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-maroon-700 to-maroon-600 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">Kundali Compatibility</h3>
                    <p className="text-xs text-maroon-100">Ashtakoot Milan · 36 Point System</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Score circle */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                        strokeDasharray={`${(data.totalScore / 36) * 100} 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">{data.totalScore}</span>
                      <span className="text-[9px] text-white/70">/ 36</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-serif font-bold text-white">{data.verdict}</div>
                    <div className="text-xs text-maroon-100 mt-0.5">{data.percentage}% compatibility</div>
                    {data.dosha && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-200">
                        <AlertTriangle className="h-3 w-3" />{data.dosha} Present
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Factor Breakdown</h4>
                {data.factors.map((f, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {f.name} <span className="text-slate-400 font-normal">({f.nameHindi})</span>
                      </span>
                      <span className={`font-bold ${f.result==="good"?"text-emerald-600 dark:text-emerald-400":f.result==="average"?"text-amber-600 dark:text-amber-400":"text-red-500 dark:text-red-400"}`}>
                        {f.scored}/{f.maxPoints}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-dark-800 overflow-hidden">
                      <motion.div
                        initial={{ width:0 }} animate={{ width:`${(f.scored/f.maxPoints)*100}%` }}
                        transition={{ delay: idx*0.06, duration:0.4 }}
                        className={`h-full rounded-full ${f.result==="good"?"bg-emerald-500":f.result==="average"?"bg-amber-500":"bg-red-500"}`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{f.description}</p>
                  </div>
                ))}

                {(data.nadiDosha || data.bhakootDosha) && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" />Dosha Warning
                    </div>
                    {data.nadiDosha && <p className="text-[10px] text-amber-600 dark:text-amber-400">• Nadi Dosha — same Nadi: health and progeny concerns. Consult a pandit.</p>}
                    {data.bhakootDosha && <p className="text-[10px] text-amber-600 dark:text-amber-400">• Bhakoot Dosha — moon sign distance inauspicious. Remedies recommended.</p>}
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-dark-950 rounded-xl border border-slate-100 dark:border-dark-800">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recommendation</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{data.recommendation}</p>
                </div>
                <p className="text-[9px] text-slate-400 text-center">Vedic Ashtakoot Milan · Lahiri Ayanamsa · astronomy-engine</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
