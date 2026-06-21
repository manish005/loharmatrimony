import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, X } from "lucide-react";
import { getSpouseName, getWeddingDate } from "../dashboardHelpers";

interface Profile {
  id: string;
  name: string;
  gender?: string;
  [key: string]: any;
}

interface WeddingInvitationModalProps {
  selectedInvitationProfile: Profile | null;
  shortlistedIds: string[];
  interestSentIds: string[];
  onToggleShortlist: (id: string) => void;
  onToggleInterest: (id: string) => void;
  onClose: () => void;
}

const WeddingInvitationModal: React.FC<WeddingInvitationModalProps> = ({
  selectedInvitationProfile,
  shortlistedIds,
  interestSentIds,
  onToggleShortlist,
  onToggleInterest,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {selectedInvitationProfile && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#fdfaf2] border-8 border-double border-[#d4af37] dark:border-[#b8860b] rounded-3xl p-6 sm:p-8 text-center shadow-2xl z-10 overflow-hidden font-serif select-none max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
              <div className="w-48 h-48 rounded-full border-8 border-dashed border-red-700 animate-spin-slow"></div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-700 transition-colors cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-700 text-amber-300">
                  <Heart className="h-6 w-6 fill-amber-300 text-amber-300" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#d4af37]">Save the Date</span>
                <h2 className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-950 font-serif">Wedding Celebration</h2>
              </div>

              <div className="py-4 border-y border-dashed border-[#d4af37]/45 my-4 space-y-3">
                <p className="text-[11px] italic text-slate-600">With the blessings of family, we invite you to celebrate the marriage of</p>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-red-900 dark:text-red-950 font-serif">
                    {selectedInvitationProfile.gender === "Female"
                      ? `${selectedInvitationProfile.name.split(" ")[0]} & ${getSpouseName(selectedInvitationProfile.name)}`
                      : `${getSpouseName(selectedInvitationProfile.name)} & ${selectedInvitationProfile.name.split(" ")[0]}`
                    }
                  </h3>
                  <p className="text-[10px] uppercase font-bold text-[#d4af37]">Tie the Knot</p>
                </div>

                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-center gap-1 text-slate-800 font-bold text-xs sm:text-sm">
                    <Calendar className="h-4 w-4 text-red-700" />
                    <span>{getWeddingDate(selectedInvitationProfile.name) || "November 2025"}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Grand Palace Resort, Maharashtra</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Let's celebrate their beautiful journey of togetherness. Please congratulate them and remove this profile from your list.
                </p>

                <button
                  onClick={() => {
                    const pid = selectedInvitationProfile.id;
                    if (shortlistedIds.includes(pid)) onToggleShortlist(pid);
                    if (interestSentIds.includes(pid)) onToggleInterest(pid);
                    onClose();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/15 transition-all cursor-pointer uppercase tracking-wider"
                >
                  Congratulate & Remove from List
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WeddingInvitationModal;
