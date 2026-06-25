import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Calendar, MapPin, Clock, Trash2 } from "lucide-react";

interface EditMarriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { date: string; time: string; venue: string }) => Promise<void>;
  onCancelMarriage: () => Promise<void>;
  initialDate: string;
  initialTime: string;
  initialVenue: string;
  isSubmitting: boolean;
  partnerName: string;
  deletionStage?: string;
}

export const EditMarriageModal: React.FC<EditMarriageModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onCancelMarriage,
  initialDate,
  initialTime,
  initialVenue,
  isSubmitting,
  partnerName,
  deletionStage,
}) => {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [venue, setVenue] = useState(initialVenue);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate);
      setTime(initialTime);
      setVenue(initialVenue);
      setShowConfirmCancel(false);
    }
  }, [isOpen, initialDate, initialTime, initialVenue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !venue) return;
    await onUpdate({ date, time, venue });
    onClose();
  };

  const handleCancelClick = async () => {
    try {
      await onCancelMarriage();
    } finally {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            {/* Cancel Marriage Option on Top Left */}
            {!showConfirmCancel && (
              <button
                type="button"
                onClick={() => setShowConfirmCancel(true)}
                className="absolute top-4 left-4 py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-red-150/50 dark:border-red-900/30 shadow-sm"
              >
                <Trash2 className="h-3 w-3" /> Cancel Marriage
              </button>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {showConfirmCancel ? (
              <div className="text-center py-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 mb-3 animate-pulse">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Cancel Marriage Connection?
                </h3>
                <p className="text-xs text-slate-500 mt-2 px-4">
                  Are you sure you want to cancel the marriage connection with <strong>{partnerName}</strong>?
                </p>
                <div className="mt-3 text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-150/40 dark:border-red-900/20 mx-2">
                  <strong>Warning:</strong> This will delete your success story, cancel the proposal, clear both of your chats, and reset your marital status to pre-marriage register records.
                </div>
                
                {deletionStage && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="animate-spin h-3 w-3 border-2 border-maroon-500 border-t-transparent rounded-full" />
                    {deletionStage}
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmCancel(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-dark-850 cursor-pointer transition-all"
                  >
                    No, Go Back
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6 mt-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 mb-3">
                    <Heart className="h-6 w-6 fill-amber-500 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    Update Wedding Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Edit the wedding program details with {partnerName}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Wedding Date
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
                        : "bg-gradient-to-r from-amber-600 to-amber-500 hover:scale-[1.02] cursor-pointer"
                    }`}
                  >
                    {isSubmitting ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
