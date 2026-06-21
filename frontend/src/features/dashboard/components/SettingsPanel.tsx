import React from "react";
import { LogOut } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

interface SettingsPanelProps {
  privacySettings: {
    hideProfile: boolean;
    blurHoroscope: boolean;
    maskContact: boolean;
    emailNotifications: boolean;
  };
  language: string;
  onPrivacySettingChange: (key: string, value: boolean) => void;
  onSetLanguage: (code: "en" | "hi" | "mr") => void;
  onLogout?: () => void;
  onOpenHelp?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  privacySettings,
  language,
  onPrivacySettingChange,
  onSetLanguage,
  onLogout,
  onOpenHelp,
}) => {
  const { t } = useLanguage();
  const labels: Record<string, string> = { en: "English", hi: "हिन्दी", mr: "मराठी" };

  return (
    <div className="glass-panel border border-slate-200/40 dark:border-dark-800/40 rounded-3xl p-6 sm:p-8 bg-white/70 space-y-6">
      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-850 pb-2">
        {t("Settings & Privacy Controls")}
      </h3>

      <div className="space-y-5 text-xs font-semibold">
        <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl bg-white/50 dark:bg-dark-900/50 cursor-pointer">
          <div>
            <h4 className="text-slate-800 dark:text-slate-250">{t("Hide Profile View")}</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-450 font-normal">{t("Temporary suspend listing in Search directories")}</p>
          </div>
          <input
            type="checkbox"
            checked={privacySettings.hideProfile}
            onChange={(e) => onPrivacySettingChange("hideProfile", e.target.checked)}
            className="h-4.5 w-4.5 rounded accent-maroon-700 cursor-pointer"
          />
        </label>





        {/* Language Selector */}
        <div className="p-3.5 border border-slate-100 rounded-2xl bg-white/50 dark:bg-dark-900/50">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 mb-3">{t("App Language")}</h4>
          <div className="flex flex-wrap gap-2">
            {(["en", "hi", "mr"] as const).map(code => (
              <button
                key={code}
                onClick={() => onSetLanguage(code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${language === code
                  ? "bg-maroon-700 text-white shadow-md"
                  : "bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700"
                  }`}
              >
                {labels[code]}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-dark-800">
          <div className="space-y-1">
            {onOpenHelp && (
              <div
                onClick={onOpenHelp}
                className="w-full flex items-center gap-3 px-2 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {t("Help & Support")}
              </div>
            )}

            <div
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-2 py-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
