import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import surahData from "../../../../assets/surahData.json";
import { useLanguage } from "../../../context/LanguageContext";
import { isLoaded, onReady } from "../../../data/qpcCache";

const TajweedSurahList = () => {
  const { t } = useLanguage();
  const [ready, setReady] = useState(isLoaded());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const unsub = onReady(() => {
      setReady(true);
      setTimeout(() => setVisible(false), 4000);
    });
    return unsub;
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
        {t("quran.tabTajweed")} - {t("tajweed.selectSurah")}
      </h2>

      {visible && (
        <div className={`mb-6 p-3 bg-white dark:bg-gray-800 border rounded-lg transition-opacity duration-500 ${
          ready ? "border-green-200 dark:border-green-700" : "border-amber-200 dark:border-amber-700"
        }`}>
          <div className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
            ready ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
          }`}>
            {ready
              ? "Tajweed data ready"
              : "Preparing Tajweed data..."}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
              <span
                key={num}
                className={`inline-block w-5 h-5 rounded text-center leading-5 text-[10px] transition-all duration-500 ${
                  ready
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700 animate-pulse"
                }`}
                title={`${num}. ${t(`surahNames.${num}`)}`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

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
