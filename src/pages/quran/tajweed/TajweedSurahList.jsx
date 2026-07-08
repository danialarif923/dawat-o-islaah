import React from "react";
import { Link } from "react-router-dom";
import surahData from "../../../../assets/surahData.json";
import { useLanguage } from "../../../context/LanguageContext";

const TajweedSurahList = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
        {t("quran.tabTajweed")} - {t("tajweed.selectSurah")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:mx-10">
        {surahData.map((surah) => (
          <Link
            key={surah.number}
            to={`/tajweed/${surah.number}`}
            className="block"
          >
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border-2 border-neutral-200 dark:border-gray-700 hover:shadow-lg hover:scale-102 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800">
              <div>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {surah.number}. {t(`surahNames.${surah.number}`)}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {surah.englishNameTranslation} | {surah.numberOfAyahs} {t("quran.verses")}
                </p>
              </div>
              <span className="font-surah-name text-[2.5rem] text-blue-600 dark:text-blue-400">
                {`surah${String(surah.number).padStart(3, "0")}`}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TajweedSurahList;
