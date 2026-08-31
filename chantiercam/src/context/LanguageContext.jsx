import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "../i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("chantiercam_lang") || "en");

  useEffect(() => {
    localStorage.setItem("chantiercam_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  function t(key) {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  }

  function toggleLang() {
    setLang((l) => (l === "en" ? "fr" : "en"));
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
