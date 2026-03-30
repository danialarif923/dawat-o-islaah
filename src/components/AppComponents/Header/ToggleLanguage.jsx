import { useLanguage } from "../../../context/LanguageContext";

const ToggleLanguage = () => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      onClick={toggleLanguage}
      className="p-2 bg-transparent border-2 border-white px-8 text-lg text-white rounded-full cursor-pointer font-sans transform hover:scale-105 transition-all duration-400 hover:border-amber-400 hover:text-amber-400"
    >
      {language === "en" ? "Switch to Urdu" : "انگریزی میں تبدیل کریں"}
    </button>
  );
};

export default ToggleLanguage;
