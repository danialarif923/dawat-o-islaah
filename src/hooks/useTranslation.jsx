import { useContext } from "react";
import en from "../../assets/languages/en.json";
import ur from "../../assets/languages/ur.json";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  en,
  ur,
};

export const useTranslation = () => {
  const { language } = useLanguage();
  const currentTranslations = translations[language];

  return currentTranslations;
};
