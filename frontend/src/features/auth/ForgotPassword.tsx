import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { Mail, ArrowLeft, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Use ActionCodeSettings to route back to our /reset-password route
      const actionCodeSettings = {
        url: window.location.origin + "/reset-password",
        handleCodeInApp: false, // The oobCode is still handled by Firebase template, but we will provide instructions or intercept if we can.
      };
      // For standard interception, the user MUST configure Firebase console Action URL to be their app's domain.
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset email. Ensure the email is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-maroon-50/20 via-slate-50 to-gold-50/10 dark:from-dark-950 dark:via-dark-900 dark:to-maroon-950/10 relative overflow-hidden px-4">
      {/* Absolute top-left Back button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 p-2.5 rounded-xl bg-white/80 dark:bg-dark-900/80 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-850 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs z-25"
      >
        <ArrowLeft className="h-4 w-4 text-maroon-700 dark:text-gold-450" /> Back to Login
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full space-y-6 glass-panel border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-6 sm:p-8 shadow-xl bg-white/90 dark:bg-dark-900/90 backdrop-blur-lg"
      >
        <div className="text-center">
          <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-maroon-700 to-maroon-500 shadow-md shadow-maroon-500/20 mb-3">
            <Heart className="h-5 w-5 text-gold-200 fill-gold-200" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium px-4">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 text-[11px] flex gap-2 items-start font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white font-bold text-xs shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full text-xs pl-11 pr-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white font-bold text-xs shadow-md shadow-maroon-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
};
