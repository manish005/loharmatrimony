import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { en } from "../locales/en";
import { hi } from "../locales/hi";
import { mr } from "../locales/mr";
import { auth, database, realtimeHelpers } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

type LanguageCode = "en" | "hi" | "mr";

const locales: Record<LanguageCode, Record<string, string>> = { en, hi, mr };

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("app_language") as LanguageCode | null;
    if (stored && locales[stored]) setLanguageState(stored);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, `profiles/${user.uid}`));
          const profileData = profileSnap.val ? profileSnap.val() : profileSnap;
          if (profileData && profileData.appLanguage && locales[profileData.appLanguage as LanguageCode]) {
            setLanguageState(profileData.appLanguage as LanguageCode);
            localStorage.setItem("app_language", profileData.appLanguage);
          }
        } catch (error) {
          console.error("Error loading language preference:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);

    if (auth.currentUser) {
      try {
        await realtimeHelpers.update(realtimeHelpers.ref(database, `profiles/${auth.currentUser.uid}`), {
          appLanguage: lang
        });
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    }
  }, []);

  const t = useCallback((key: string): string => {
    return locales[language]?.[key] || en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
