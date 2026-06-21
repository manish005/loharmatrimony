import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../config/firebase";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validCode, setValidCode] = useState<boolean | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Verify the oobCode first
    const verifyCode = async () => {
      if (!oobCode || mode !== "resetPassword") {
        // Allow rendering for UI testing if no code is present
        setValidCode(true);
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setValidCode(true);
      } catch (err: any) {
        console.error(err);
        setValidCode(false);
        setError("The reset code is invalid or has expired. Please request a new link.");
      }
    };
    verifyCode();
  }, [oobCode, mode]);

  const isPasswordValid = password.length >= 6 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const passwordsMatchAndValid = password && confirmPassword && password === confirmPassword && isPasswordValid;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError("Password must be at least 6 characters, include 1 number and 1 special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!oobCode) {
      setError("Invalid or missing reset code. Cannot actually reset password without the email link code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      toast.success("Password changed successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reset password. The link might have expired.");
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
            Set New Password
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium px-4">
            Please enter your new password below. Make sure it's strong and secure!
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
              Your password has been successfully reset.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white font-bold text-xs shadow-md transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        ) : validCode === false ? (
          <div className="text-center space-y-4">
            <button
              onClick={() => navigate("/forgot-password")}
              className="mt-4 w-full px-6 py-3 rounded-xl bg-slate-200 dark:bg-dark-800 text-slate-800 dark:text-white font-bold text-xs shadow-sm transition-transform hover:bg-slate-300 cursor-pointer"
            >
              Request a New Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full text-xs pl-11 pr-10 py-2.5 border rounded-xl bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none transition-all ${
                    passwordsMatchAndValid 
                      ? "border-emerald-500 ring-1 ring-emerald-500" 
                      : "border-slate-200 dark:border-dark-800 focus:ring-1 focus:ring-maroon-600 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full text-xs pl-11 pr-10 py-2.5 border rounded-xl bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none transition-all ${
                    passwordsMatchAndValid 
                      ? "border-emerald-500 ring-1 ring-emerald-500" 
                      : "border-slate-200 dark:border-dark-800 focus:ring-1 focus:ring-maroon-600 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || validCode === null}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white font-bold text-xs shadow-md shadow-maroon-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving Password..." : "Change Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
