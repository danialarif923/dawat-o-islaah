import { createContext, useState, useContext } from "react";
import en from "../../assets/languages/en.json";
import ur from "../../assets/languages/ur.json";

const LanguageContext = createContext();

const translations = { en, ur };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === "en" ? "ur" : "en";
      localStorage.setItem("language", newLang);
      return newLang;
    });
  };

  // Translation function
  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];
    for (let k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
