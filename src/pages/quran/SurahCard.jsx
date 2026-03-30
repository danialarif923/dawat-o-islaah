import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const SurahCard = ({
  number,
  englishName,
  englishNameTranslation,
  numberOfAyahs,
  revelationType,
  arabicName,
}) => {
  const { t } = useLanguage();
  // Use translation for revelationType if available
  const revType = t(`quran.revelationType.${revelationType}`) || revelationType;

  return (
    <Link to={`/surah/${number}`} className="block">
      <div
        className="grid grid-cols-2 items-center px-4 md:px-6 py-4 md:py-6 text-md md:text-lg 
        transition-all duration-300 transform hover:scale-102 rounded-lg border-neutral-200 border-2 hover:shadow-lg cursor-pointer relative"
      >
        {/* Left Side - English Name & Details */}
        <div className="pr-2">
          <h3 className="text-lg md:text-xl font-semibold leading-tight">
            {number}. {englishName}
          </h3>
          <p className="text-sm md:text-md text-gray-500">
            {englishNameTranslation && englishNameTranslation}
          </p>
          <p className="text-xs md:text-sm text-gray-400">
            {revType} | {numberOfAyahs} {t("quran.verses")}
          </p>
        </div>

        {/* Right Side - Arabic Name */}
        <div className="text-blue-600 text-2xl md:text-4xl text-right font-quran">
          {arabicName}
        </div>

        {/* Horizontal Rule (disappears on hover) */}
        <hr className="absolute bottom-0 left-0 w-full border-gray-300 transition-opacity duration-300 hover:opacity-0" />
      </div>
    </Link>
  );
};

export default SurahCard;
