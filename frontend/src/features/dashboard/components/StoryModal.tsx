import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, ShieldCheck, X } from "lucide-react";

interface Story {
  id: string;
  couple: string;
  date: string;
  malePhoto: string;
  femalePhoto: string;
  image: string;
  story: string;
}

interface StoryModalProps {
  selectedStory: Story | null;
  onClose: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ selectedStory, onClose }) => {
  return (
    <AnimatePresence>
      {selectedStory && (
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
            className="relative w-full max-w-lg bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-5">
              <div className="flex justify-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-maroon-700/30 shadow-md">
                  <img src={selectedStory.malePhoto} alt="Groom" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center">
                  <Heart className="h-6 w-6 text-maroon-700 fill-maroon-700" />
                </div>
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-maroon-700/30 shadow-md">
                  <img src={selectedStory.femalePhoto} alt="Bride" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  {selectedStory.couple}
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-gold-400 font-bold text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Marriage fixed on {selectedStory.date}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-dark-850 rounded-2xl p-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{selectedStory.story}"
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Verified Couple &middot; Lohar Matrimony
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StoryModal;
