import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import useJuz from "../../../hooks/useJuz";
import VerseCard from "../surah/VerseCard";
import ShimmerLoader from "../surah/SurahShimmer";
import allJuzData from "../../../../assets/juzData.json";
import AudioPlayer from "../../../components/AppComponents/audioPlayer";
import { useLanguage } from "../../../context/LanguageContext";

const JuzDetails = () => {
  const { t, language } = useLanguage();
  const { juzNumber } = useParams();
  const juzData = allJuzData.juz[juzNumber - 1];

  const {
    juzDetails,
    translationOptions,
    verses,
    translations,
    audioLinks,
    selectedTranslations,
    setSelectedTranslations,
    loadingDetails,
    loadingVerses,
    fullJuzAudio,
    error,
  } = useJuz(juzNumber, juzData);

  const [showDropdown, setShowDropdown] = useState({ en: false, ur: false });
  const [translationsEnabled, setTranslationsEnabled] = useState(false);

  const dropdownRef = useRef(null);

  const toggleDropdown = (lang) => {
    setShowDropdown((prev) => ({ ...prev, [lang]: !prev[lang] }));
  };

  const handleTranslationChange = (lang, identifier) => {
    setSelectedTranslations((prev) => ({
      ...prev,
      [lang]: prev[lang].includes(identifier)
        ? prev[lang].filter((id) => id !== identifier)
        : [...prev[lang], identifier],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown({ en: false, ur: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loadingDetails) return <ShimmerLoader />;
  if (error)
    return <p className="text-center text-red-500 py-6 text-lg">{error}</p>;

  return (
    <div className="container mx-auto px-6 md:px-20 py-12">
      <div className="text-center mb-0">
        <h1 className="text-3xl md:text-4xl font-bold">
          {juzData.juz_name_en}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          {juzData.start_surah} - {juzData.end_surah} | {juzData.total_ayahs}{" "}
          {t("quranDetails.verses")}
        </p>
        <p className="text-3xl text-blue-600 font-bold mt-6 font-quran">
          {juzData.juz_name_ar}
        </p>

        {/* 🎵 Full Surah Audio Player */}
        {fullJuzAudio && (
          <div className="mt-4">
            <AudioPlayer audioFiles={fullJuzAudio.map((ayah) => ayah.audio)} />
          </div>
        )}

        <div className="flex items-center space-x-2 justify-center my-4 md:my-6">
          <span className="md:text-xl">{t("quranDetails.translations")}</span>
          <div
            className={`w-8 h-6 md:w-14 md:h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-all duration-300 ${
              translationsEnabled ? "bg-green-500" : "bg-gray-400"
            }`}
            onClick={() => setTranslationsEnabled(!translationsEnabled)}
          >
            <div
              className={`w-4 h-4 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                translationsEnabled
                  ? "translate-x-2 md:translate-x-6"
                  : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4" ref={dropdownRef}>
        {["en", "ur"].map((lang) => (
          <div key={lang} className="relative w-full md:w-1/2">
            <button
              onClick={() => toggleDropdown(lang)}
              disabled={!translationsEnabled}
              className={`w-full bg-gray-100 p-2 border border-gray-300 rounded-md flex justify-between items-center ${
                translationsEnabled ? "text-black" : "text-gray-500"
              }`}
            >
              {t("quranDetails.selectTranslations").replace(
                "{lang}",
                lang === "en"
                  ? language === "en"
                    ? "English"
                    : "انگریزی"
                  : language === "en"
                  ? "Urdu"
                  : "اردو"
              )}
              <FaChevronDown />
            </button>

            {showDropdown[lang] && (
              <div className="absolute w-full bg-white shadow-lg rounded-md mt-2 z-10 max-h-60 overflow-auto">
                {translationOptions[lang].map((option) => (
                  <label
                    key={option.identifier}
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTranslations[lang].includes(
                        option.identifier
                      )}
                      onChange={() =>
                        handleTranslationChange(lang, option.identifier)
                      }
                      className="mr-2"
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {loadingVerses ? (
        <ShimmerLoader />
      ) : (
        <VerseCard
          verses={verses}
          surahNo={juzDetails.number}
          translations={translations}
          audioLinks={audioLinks}
          isTranslation={translationsEnabled}
        />
      )}
    </div>
  );
};

export default JuzDetails;
