import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Logo from "../../components/ui/Logo";

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-dark-950 transition-colors py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto glass-panel border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-6 sm:p-10 shadow-xl bg-white/80 dark:bg-dark-900/60 backdrop-blur-lg space-y-6">
        
        {/* Header logo / back button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-850 pb-4">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-maroon-700 dark:text-gold-450 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <Logo size="sm" showTagline={false} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-maroon-700 dark:text-gold-400" /> Privacy Policy
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Last Updated: June 20, 2026</p>
        </div>

        {/* Policy Content */}
        <div className="space-y-5 text-xs text-slate-655 dark:text-slate-300 leading-relaxed font-medium">
          <p>
            Welcome to Lohar Matrimony. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy describes how we collect, store, and process your information when you register and use our matrimonial services.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">1. Information We Collect</h3>
          <p>
            When you register an account, we collect basic details such as your name, gender, date of birth, contact number, email address, password, sub-caste, income range, education, occupation, and family background details. We also collect verification documents (such as Aadhaar card number) to audit and verify your identity, which is kept completely secure and never shared publicly.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">2. Image Compression and Storage</h3>
          <p>
            To optimize storage limits and ensure fast page loading, any profile photos you upload are automatically compressed using HTML5 Canvas client-side compression before being uploaded to our secure Google Cloud Storage bucket.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">3. Privacy and Visibility Controls</h3>
          <p>
            We provide advanced privacy settings inside your Member Dashboard:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Profile Masking</strong>: You can temporarily hide your profile listing from matches search.</li>
            <li><strong>Horoscope Privacy</strong>: You can blur your horoscope image (Kundli) and require matches to request permission before viewing it.</li>
            <li><strong>Contact Number Masking</strong>: You can mask your contact information so it is only visible to premium members whom you have approved.</li>
          </ul>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">4. Third-Party Authentication</h3>
          <p>
            If you choose to register or log in using third-party services such as Google Sign In or Facebook Login, we only retrieve your basic profile info (name, email, and photo URL) to create your account. We do not access your social media feeds, friends lists, or private messages.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">5. Data Deletion Requests</h3>
          <p>
            You have the right to request the permanent deletion of your profile and data at any time. Simply contact our support team from the Help & Support tab or via email. All document uploads, images, and profile information will be purged from our database within 48 hours of approval.
          </p>
        </div>

      </div>
    </div>
  );
};
