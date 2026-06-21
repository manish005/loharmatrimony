import React from "react";
import { Link } from "react-router-dom";
import { Scale, ArrowLeft } from "lucide-react";
import Logo from "../../components/ui/Logo";

export const TermsConditions: React.FC = () => {
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
            <Scale className="h-7 w-7 text-maroon-700 dark:text-gold-400" /> Terms & Conditions
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Last Updated: June 20, 2026</p>
        </div>

        {/* Terms Content */}
        <div className="space-y-5 text-xs text-slate-655 dark:text-slate-300 leading-relaxed font-medium">
          <p>
            Please read these Terms and Conditions carefully before registering or using our matrimonial platform. By creating an account or accessing our services, you agree to be bound by these terms.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">1. Eligibility Criteria</h3>
          <p>
            Lohar Matrimony is exclusively designed for the Lohar community. To register, you must be of legal marriageable age in India (18 years for females and 21 years for males). You must also register with honest details and intend to seek a genuine matrimonial alliance.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">2. Verification and Badges</h3>
          <p>
            We perform manual profile audits of all registrations. Profiles that submit valid Aadhaar Card verification details are awarded a "Verified" badge. We reserve the right to suspend or terminate any accounts displaying fake information, invalid documentation, or suspicious behavior.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">3. Subscription billing & Refund Policy</h3>
          <p>
            We offer premium packages (Silver, Gold, Platinum) billed either Monthly or Yearly. Yearly packages come with a 20% discount. Subscription fees are non-refundable. You can cancel your subscription renewal at any time through your dashboard settings.
          </p>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">4. User Code of Conduct</h3>
          <p>
            You agree to interact respectfully with other members on the platform. The following behavior is strictly prohibited:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Harassing, stalking, or sending abusive messages to matches.</li>
            <li>Uploading obscene, copyright-infringed, or fraudulent photos.</li>
            <li>Using the platform for business advertising, commercial promotions, or financial solicitations.</li>
          </ul>

          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pt-2">5. Disclaimer and Limitation of Liability</h3>
          <p>
            We do not guarantee matches or compatibility. We encourage all members to perform thorough background audits before entering into any matrimonial commitments. Lohar Matrimony is not responsible for any personal disputes or financial losses arising from connections made on the platform.
          </p>
        </div>

      </div>
    </div>
  );
};
