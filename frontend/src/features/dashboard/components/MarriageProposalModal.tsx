import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Calendar, MapPin, Clock } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  gender?: string;
  photos?: string[];
}

interface MarriageProposalModalProps {
  selectedProfile: Profile | null;
  onSendProposal: (data: { date: string; time: string; venue: string }) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const MarriageProposalModal: React.FC<MarriageProposalModalProps> = ({
  selectedProfile,
  onSendProposal,
  onClose,
  isSubmitting
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !venue) return;
    onSendProposal({ date, time, venue });
  };

  return (
    <AnimatePresence>
      {selectedProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 mb-3">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Let's Get Married!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Propose a marriage setup with {selectedProfile.name}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Proposed Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Timing
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Venue / Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Palace Resort, Mumbai"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-maroon-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 mt-4 rounded-xl text-white font-bold text-xs transition-all shadow-md ${
                  isSubmitting 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-red-700 to-red-600 hover:scale-[1.02] cursor-pointer"
                }`}
              >
                {isSubmitting ? "Sending Request..." : "Send Marriage Request"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MarriageProposalModal;
