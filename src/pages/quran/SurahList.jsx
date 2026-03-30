import useSurahList from "../../hooks/useSurahList";
import SurahCard from "./SurahCard";
import { useState } from "react";
import { motion } from "framer-motion";
import juzData from "../../../assets/juzData.json";
import JuzCard from "./JuzCard";
import { useLanguage } from "../../context/LanguageContext";

const SurahList = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("Surah");
  const tabs = [t("quran.tabSurah"), t("quran.tabJuz")];
  const { surahs, loading, error } = useSurahList();

  if (loading) return <p className="text-center py-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  const surahList = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:mx-20 mb-8">
      {surahs.map((surah) => (
        <SurahCard
          key={surah.number}
          number={surah.number}
          englishName={surah.englishName}
          englishNameTranslation={surah.englishNameTranslation}
          numberOfAyahs={surah.numberOfAyahs}
          revelationType={surah.revelationType}
          arabicName={surah.name}
        />
      ))}
    </div>
  );

  const juzList = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:mx-20">
      {juzData.juz.map((juzItem) => (
        <JuzCard
          key={juzItem.juz_number}
          number={juzItem.juz_number}
          englishName={juzItem.juz_name_en}
          numberOfAyahs={juzItem.total_ayahs}
          arabicName={juzItem.juz_name_ar}
          startingSurah={juzItem.start_surah}
          endingSurah={juzItem.end_surah}
        />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-6 pt-4 sm:pt-8">
      <h1 className="text-3xl font-bold text-center">
        {t("quran.surahListTitle")}
      </h1>

      <div className="justify-center flex my-2  sm:my-8">
        <div className="relative flex items-center bg-sky-950 text-white p-1 sm:p-2 rounded-full w-full sm:w-fit">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx === 0 ? "Surah" : "Juzz")}
              className="relative flex-1 text-center py-0.5 sm:py-2 font-medium cursor-pointer sm:w-24"
            >
              {activeTab === (idx === 0 ? "Surah" : "Juzz") && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-yellow-600 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>
      {activeTab == "Surah" ? surahList : juzList}
    </div>
  );
};

export default SurahList;
