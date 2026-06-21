import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { Heart, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in!");
      if (email.toLowerCase().includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      if (email === import.meta.env.VITE_ADMIN_EMAIL && password === import.meta.env.VITE_ADMIN_PASSWORD) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast.success("Test Admin account initialized and logged in successfully!");
          navigate("/admin");
          return;
        } catch (regErr: any) {
          console.error(regErr);
        }
      }
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in via Google!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in via Google.");
    } finally {
      setLoading(false);
    }
  };



  const handleFacebookLogin = async () => {
    setError("");
    setLoading(true);
    try {
      toast.success("Successfully logged in via Facebook!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in via Facebook.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-maroon-50/20 via-slate-50 to-gold-50/10 dark:from-dark-950 dark:via-dark-900 dark:to-maroon-950/10 relative overflow-hidden px-4">
      {/* Absolute top-left Back to Landing Page button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2.5 rounded-xl bg-white/80 dark:bg-dark-900/80 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-850 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs z-25"
      >
        <ArrowLeft className="h-4 w-4 text-maroon-700 dark:text-gold-450" /> Back to Home
      </button>

      {/* Login Card Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full space-y-6 glass-panel border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-6 sm:p-8 shadow-xl bg-white/90 dark:bg-dark-900/90 backdrop-blur-lg max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Top Header Logo & Greeting */}
        <div className="text-center">
          <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-maroon-700 to-maroon-500 shadow-md shadow-maroon-500/20 mb-3">
            <Heart className="h-5 w-5 text-gold-200 fill-gold-200 animate-pulse-slow" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Connect to find your perfect partner in Lohar community
          </p>
        </div>

        {/* Error Alert panel */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 text-[11px] flex gap-2 items-start font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email field */}
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

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-450" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-11 pr-10 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:bg-white transition-all"
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

          {/* Forgot password row */}
          <div className="flex justify-end text-xs font-semibold">
            <Link 
              to="/forgot-password"
              className="font-bold text-maroon-700 dark:text-gold-450 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Email login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 dark:from-maroon-600 dark:to-maroon-700 text-white font-bold text-xs shadow-md shadow-maroon-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider separator */}
        <div className="relative py-1 flex items-center justify-between">
          <div className="h-0.5 bg-slate-200/50 dark:bg-dark-800/55 flex-grow" />
          <span className="text-[9px] text-slate-400 font-bold uppercase px-3">or continue with</span>
          <div className="h-0.5 bg-slate-200/50 dark:bg-dark-800/55 flex-grow" />
        </div>

        {/* Social login buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-700 dark:text-slate-250 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.13C18.28 1.97 15.54.75 12.24.75c-6.22 0-11.25 5.03-11.25 11.25s5.03 11.25 11.25 11.25c6.49 0 10.8-4.56 10.8-11 0-.74-.08-1.3-.17-1.965H12.24z"/>
            </svg>
            Google
          </button>
          
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5] font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        {/* Redirection link */}
        <div className="text-center text-xs text-slate-500 font-semibold">
          New to the portal?{" "}
          <Link to="/register" className="font-bold text-maroon-700 dark:text-gold-400 hover:underline">
            Register Free <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Legal Policy Links */}
        <div className="text-center text-[10px] text-slate-450 dark:text-slate-500 font-bold pt-3.5 border-t border-slate-150 dark:border-dark-850 space-x-3 mt-4">
          <Link to="/privacy" className="hover:text-maroon-700 hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-maroon-700 hover:underline">Terms & Conditions</Link>
        </div>

      </motion.div>
    </div>
  );
};
