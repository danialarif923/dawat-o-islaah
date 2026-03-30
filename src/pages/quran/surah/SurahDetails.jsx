import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useSurah from "../../../hooks/useSurah";
import VerseCard from "./VerseCard";
import { FaChevronDown } from "react-icons/fa";
import ShimmerLoader from "./SurahShimmer";
import { useLanguage } from "../../../context/LanguageContext";

const SurahDetails = () => {
  const { t, language } = useLanguage();
  const { surahNumber } = useParams();

  /* =====================
     DATA FROM HOOK
  ===================== */
  const {
    surahDetails,
    verses,
    translationAuthors,
    qaris,
    translations,
    audioByQari,

    selectedTranslations,
    setSelectedTranslations,

    selectedTafsirAuthor,
    setSelectedTafsirAuthor,

    tafseerByAyah,

    selectedQari,
    setSelectedQari,

    tafsirLang, // ✅ ADD
    setTafsirLang, // ✅ ADD

    loadingDetails,
    tafsirAuthors,
    loadingVerses,
    error,
  } = useSurah(surahNumber);

  /* =====================
     LOCAL STATE
  ===================== */
  const [showDropdown, setShowDropdown] = useState({ en: false, ur: false });
  const [translationsEnabled, setTranslationsEnabled] = useState(false);
  const [tafsirEnabled, setTafsirEnabled] = useState(false);

  const dropdownRef = useRef(null);

  /* =====================
     AUDIO LINKS
  ===================== */
  const audioLinks =
    selectedQari && audioByQari?.[selectedQari]
      ? audioByQari?.[selectedQari].map((a) => ({
          ayah: a.ayah,
          url: a.url,
        }))
      : [];

  /* =====================
     DROPDOWNS
  ===================== */
  const toggleDropdown = (lang) => {
    setShowDropdown((prev) => ({
      ...prev,
      [lang]: !prev[lang],
    }));
  };

  const handleTranslationChange = (lang, authorName) => {
    setSelectedTranslations((prev) => {
      const exists = prev[lang].some((a) => a.name === authorName);

      return {
        ...prev,
        [lang]: exists
          ? prev[lang].filter((a) => a.name !== authorName)
          : [...prev[lang], { name: authorName }],
      };
    });
  };

  /* =====================
     CLOSE DROPDOWN
  ===================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown({ en: false, ur: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =====================
     LOADING / ERROR
  ===================== */
  if (loadingDetails || loadingVerses) return <ShimmerLoader />;

  if (error) {
    return <p className="text-center text-red-500 py-6 text-lg">{error}</p>;
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="container mx-auto px-6 md:px-20 py-12">
      {/* =====================
          HEADER
      ===================== */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">
          {surahDetails.englishName} ({surahDetails.englishNameTranslation})
        </h1>

        <p className="text-lg text-gray-500 mt-2">
          {surahDetails.revelationType} | {surahDetails.numberOfAyahs}{" "}
          {t("quranDetails.verses")}
        </p>

        <p className="text-3xl text-blue-600 font-semibold mt-4 font-quran">
          {surahDetails.name}
        </p>
      </div>

      {/* =====================
          TOGGLES
      ===================== */}
      <div className="flex items-center justify-center gap-6 my-6">
        {/* Translation */}
        <div className="flex items-center gap-2">
          <span>{t("quranDetails.translations")}</span>

          <div
            onClick={() => setTranslationsEnabled(!translationsEnabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${
              translationsEnabled ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform ${
                translationsEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>

        {/* Tafsir */}
        <div className="flex items-center gap-2">
          <span>{t("quranDetails.tafsir")}</span>

          <div
            onClick={() => setTafsirEnabled(!tafsirEnabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${
              tafsirEnabled ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform ${
                tafsirEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* =====================
          DROPDOWNS
      ===================== */}
      <div className="flex flex-col md:flex-row gap-4 mb-6" ref={dropdownRef}>
        {/* Translations */}
        {["en", "ur"].map((lang) => (
          <div key={lang} className="relative w-full md:w-1/2">
            <button
              onClick={() => toggleDropdown(lang)}
              disabled={!translationsEnabled}
              className={`w-full p-2 border rounded-md flex justify-between items-center ${
                translationsEnabled
                  ? "bg-gray-100"
                  : "bg-gray-200 text-gray-500"
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
                    : "اردو",
              )}

              <FaChevronDown />
            </button>

            {showDropdown[lang] && (
              <div className="absolute w-full bg-white shadow rounded mt-2 z-10 max-h-60 overflow-auto">
                {translationAuthors?.[lang]?.map((author) => (
                  <label
                    key={author.name}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTranslations[lang].some(
                        (a) => a.name === author.name,
                      )}
                      onChange={() =>
                        handleTranslationChange(lang, author.name)
                      }
                      className="mr-2"
                    />

                    {author.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Tafsir Selectors */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-1/2">
          {/* Tafsir Language */}
          <select
            disabled={!tafsirEnabled}
            value={tafsirLang}
            onChange={(e) => {
              setTafsirLang(e.target.value);
              setSelectedTafsirAuthor(""); // reset author
            }}
            className={`w-full p-2 border rounded ${
              tafsirEnabled ? "bg-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            <option value="ur">Urdu Tafsir</option>
            <option value="en">English Tafsir</option>
          </select>

          {/* Tafsir Author */}
          <select
            disabled={!tafsirEnabled}
            value={selectedTafsirAuthor || ""}
            onChange={(e) => setSelectedTafsirAuthor(e.target.value)}
            className={`w-full p-2 border rounded ${
              tafsirEnabled ? "bg-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            <option value="">
              Select {tafsirLang === "en" ? "English" : "Urdu"} Tafsir
            </option>

            {tafsirAuthors?.[tafsirLang]?.map((author) => (
              <option key={author.id} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================
          QARI
      ===================== */}
      <div className="mb-6">
        <select
          value={selectedQari || ""}
          onChange={(e) => setSelectedQari(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded"
        >
          <option value="">Select Qari</option>

          {qaris.map((qari) => (
            <option key={qari} value={qari}>
              {qari}
            </option>
          ))}
        </select>
      </div>

      {/* =====================
          VERSES
      ===================== */}
      <VerseCard
        verses={verses}
        translations={translations}
        audioLinks={audioLinks}
        surahNo={surahNumber}
        isTranslation={translationsEnabled}
        selectedEnglish={selectedTranslations.en}
        selectedUrdu={selectedTranslations.ur}
        tafsirEnabled={tafsirEnabled}
        tafseerByAyah={tafseerByAyah}
        selectedTafsir={selectedTafsirAuthor}
        tafsirLang={tafsirLang}
      />
    </div>
  );
};

export default SurahDetails;
