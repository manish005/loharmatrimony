import React from "react";
import { ChevronDown } from "lucide-react";

interface HelpSupportProps {
  faqOpen: number | null;
  supportSubmitted: boolean;
  myProfile: any;
  onSetFaqOpen: (index: number | null) => void;
  onSupportSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const HelpSupport: React.FC<HelpSupportProps> = ({ faqOpen, supportSubmitted, myProfile, onSetFaqOpen, onSupportSubmit }) => {
  const faqs = [
    { q: "How do I upgrade my account to Premium?", a: "Navigate to the Premium Subscriptions tab in the menu, select your plan, and complete payment. Your premium features will activate immediately." },
    { q: "Is my personal data safe?", a: "Yes. You have complete control over your details in the Settings & Privacy tab. You can mask your phone number, hide your profile from search results, and blur your Kundli horoscope." },
    { q: "What does the Verified Badge mean?", a: "The Verified Badge (Green Checkmark) is awarded after our admin board manually reviews identity documentation (such as Aadhaar card) submitted in the KYC Verification portal." }
  ];

  return (
    <div className="glass-panel border border-slate-200/40 dark:border-dark-800/40 rounded-3xl p-6 sm:p-8 bg-white/70 space-y-6">
      <div className="border-b border-slate-100 dark:border-dark-850 pb-4">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Help & Support Center</h3>
        <p className="text-[10px] text-slate-500 font-semibold">Get answers or contact our matrimony relationship support managers</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h4>
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-dark-900/60 border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => onSetFaqOpen(faqOpen === index ? null : index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-slate-800 dark:text-white hover:text-maroon-700"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${faqOpen === index ? "rotate-180" : ""}`} />
            </button>
            {faqOpen === index && (
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-dark-950/20 text-[10px] text-slate-550 dark:text-slate-400 border-t border-slate-50 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-dark-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Submit a Support Ticket</h4>
        <form onSubmit={onSupportSubmit} className="space-y-3.5 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-500 uppercase">Query Category</label>
              <select name="category" className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none">
                <option value="Profile & verification issues">Profile & verification issues</option>
                <option value="Premium Billing & upgrade">Premium Billing & upgrade</option>
                <option value="Abuse / Fake Profile Report">Abuse / Fake Profile Report</option>
                <option value="General assistance">General assistance</option>
                <option value="Delete Account Request">Delete Account Request</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-500 uppercase">User ID / Email</label>
              <input
                type="text"
                readOnly
                value={`${myProfile?.id || "LM-GUEST"} (${myProfile?.email || ""})`}
                className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-100 dark:bg-dark-900/60 text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 uppercase">Ticket Description</label>
            <textarea
              name="description"
              required
              placeholder="Please describe your query in detail..."
              rows={3}
              className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-white dark:bg-dark-950 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-maroon-700 text-white font-bold text-xs rounded-xl shadow hover:bg-maroon-800 cursor-pointer"
          >
            {supportSubmitted ? "Submitting..." : "Submit Support Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpSupport;
