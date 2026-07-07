import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import useSurah from "../../../hooks/useSurah";
import { FaChevronDown, FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext";
import WordHighlightedAyah from "../WordHighlightedAyah";

const ShimmerLoader = () => (
  <div className="animate-pulse space-y-3 p-8">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-300 rounded" />
    ))}
  </div>
);

const AyahDetail = () => {
  const { t, language } = useLanguage();
  const { surahNumber, ayahNumber } = useParams();
  const isRtl = language === "ur";

  const {
    surahDetails,
    verses,
    translationAuthors,
    qaris,
    translations,
    audioByQari,
    wordTimings,
    selectedTranslations,
    setSelectedTranslations,
    selectedTafsirAuthor,
    setSelectedTafsirAuthor,
    tafseerByAyah,
    selectedQari,
    setSelectedQari,
    tafsirLang,
    setTafsirLang,
    loadingDetails,
    tafsirAuthors,
    loadingVerses,
    error,
  } = useSurah(surahNumber);

  const ayah = verses.find(
    (v) => Number(v.numberInSurah) === Number(ayahNumber)
  );

  const [showDropdown, setShowDropdown] = useState({ en: false, ur: false });
  const [translationsEnabled, setTranslationsEnabled] = useState(false);
  const [tafsirEnabled, setTafsirEnabled] = useState(false);
  const dropdownRef = useRef(null);
  const [expandedTafsir, setExpandedTafsir] = useState(false);

  const toggleDropdown = (lang) =>
    setShowDropdown((prev) => ({ ...prev, [lang]: !prev[lang] }));

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown({ en: false, ur: false });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (translationsEnabled) {
      const en = (translationAuthors?.en || []).find((a) => a.name === "AHMED RAZA KHAN");
      const ur = (translationAuthors?.ur || []).find((a) => a.name === "احمد رضا خان");
      setSelectedTranslations({
        en: en ? [{ name: en.name }] : [],
        ur: ur ? [{ name: ur.name }] : [],
      });
    }
  }, [translationsEnabled]);

  useEffect(() => {
    if (tafsirEnabled) {
      setSelectedTafsirAuthor(null);
    }
  }, [tafsirEnabled]);

  const formatTafsirContent = (text) => {
    if (!text) return "";
    return text
      .replace(
        /\{([^\}]+)\}/g,
        '<span class="text-emerald-600 font-semibold font-quran">$1</span>'
      )
      .replace(
        /«([^»]+)»/g,
        '<span class="text-blue-600 font-medium">$1</span>'
      )
      .replace(
        /\[([^\]]+)\]/g,
        '<span class="text-red-600 font-bold">[$1]</span>'
      )
      .replace(
        /([➊-➓])/g,
        '<span class="font-bold text-gray-900 mx-1">$1</span>'
      );
  };

  if (loadingDetails || loadingVerses) return <ShimmerLoader />;
  if (error)
    return (
      <p className="text-center text-red-500 py-6 text-lg">{error}</p>
    );
  if (!ayah)
    return (
      <p className="text-center text-gray-500 py-6">Ayah not found</p>
    );

  return (
    <div className="container mx-auto px-6 md:px-20 py-12">
      <Link
        to={`/surah/${surahNumber}`}
        className="inline-flex items-center gap-2 text-emerald-600 hover:underline mb-6"
      >
        <FaArrowLeft />
        {isRtl ? "سورہ پر واپس جائیں" : "Back to Surah"}
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {t(`surahNames.${surahNumber}`)}
        </h1>
        <p className="text-lg text-gray-500 mt-1">
          {t("quranDetails.ayah")} {ayahNumber}
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-neutral-200">
        <p className="text-right text-gray-500 text-sm mb-2">
          {surahNumber}:{ayahNumber}
        </p>
        <WordHighlightedAyah
          ayahText={ayah.text}
          ayahNumber={ayahNumber}
          wordTimings={wordTimings}
          audioUrl={
            selectedQari && audioByQari?.[selectedQari]
              ? audioByQari[selectedQari].find(
                  (a) => Number(a.ayah) === Number(ayahNumber)
                )?.url
              : null
          }
        />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <select
          value={selectedQari || ""}
          onChange={(e) => setSelectedQari(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded"
        >
          <option value="">
            {isRtl ? "قاری منتخب کریں" : "Select Qari"}
          </option>
          {qaris.map((qari) => (
            <option key={qari} value={qari}>
              {qari}
            </option>
          ))}
        </select>
      </div>

      <div className={`flex items-center gap-6 my-6 ${isRtl ? "flex-row-reverse" : ""}`}>
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
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
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
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

      <div
        className="flex flex-col md:flex-row gap-4 mb-6"
        ref={dropdownRef}
      >
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
                    : "اردو"
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
                        (a) => a.name === author.name
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
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-1/2">
          <select
            disabled={!tafsirEnabled}
            value={tafsirLang}
            onChange={(e) => {
              setTafsirLang(e.target.value);
              setSelectedTafsirAuthor("");
            }}
            className={`w-full p-2 border rounded ${
              tafsirEnabled ? "bg-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            <option value="ur">{isRtl ? "اردو تفسیر" : "Urdu Tafsir"}</option>
            <option value="en">{isRtl ? "انگریزی تفسیر" : "English Tafsir"}</option>
          </select>
          <select
            disabled={!tafsirEnabled}
            value={selectedTafsirAuthor || ""}
            onChange={(e) => setSelectedTafsirAuthor(e.target.value)}
            className={`w-full p-2 border rounded ${
              tafsirEnabled ? "bg-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            <option value="">
              {isRtl
                ? `${tafsirLang === "en" ? "انگریزی" : "اردو"} تفسیر منتخب کریں`
                : `Select ${tafsirLang === "en" ? "English" : "Urdu"} Tafsir`}
            </option>
            {tafsirAuthors?.[tafsirLang]?.map((author) => (
              <option key={author.id} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {translationsEnabled && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            {selectedTranslations.en.map((author) => {
              const name = String(author?.name || author).trim();
              const group = translations.en?.[name];
              const list =
                group ||
                Object.values(translations.en || {})
                  .flat()
                  .filter((t) => t.author === name);
              const tr = list.find(
                (t) =>
                  Number(t.ayah || t.numberInSurah) === Number(ayahNumber)
              );
              if (!tr) return null;
              return (
                <div key={`en-${name}`} className="mb-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    {author.displayName || tr.author || name}
                  </p>
                  <p
                    className="text-lg text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: tr.text.replace(/<\/?p[^>]*>/g, ""),
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="text-right">
            {selectedTranslations.ur.map((author) => {
              const name = String(author?.name || author).trim();
              const group = translations.ur?.[name];
              const list =
                group ||
                Object.values(translations.ur || {})
                  .flat()
                  .filter((t) => t.author === name);
              const tr = list.find(
                (t) =>
                  Number(t.ayah || t.numberInSurah) === Number(ayahNumber)
              );
              if (!tr) return null;
              return (
                <div key={`ur-${name}`} className="mb-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    {author.displayName || tr.author || name}
                  </p>
                  <p
                    className="text-2xl leading-relaxed font-urdu"
                    style={{ direction: "rtl" }}
                    dangerouslySetInnerHTML={{
                      __html: tr.text.replace(/<\/?p[^>]*>/g, ""),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tafsirEnabled && selectedTafsirAuthor && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <p className="text-sm text-emerald-800 mb-2 font-bold">
            {selectedTafsirAuthor} — {t("quranDetails.tafsir")}
          </p>
          {(() => {
            const rawTafsir = (
              tafseerByAyah?.[ayahNumber] || ""
            ).replace(/<\/?p[^>]*>/g, "");
            if (!rawTafsir)
              return (
                <p className="text-gray-400 italic">
                  {t("quranDetails.tafsirNotAvailable")}
                </p>
              );
            const plainText = rawTafsir.replace(/<[^>]+>/g, "");
            const isLong = plainText.length > 300;
            const formattedTafsir = formatTafsirContent(rawTafsir);
            const previewFormatted =
              formatTafsirContent(rawTafsir.slice(0, 300)) + "...";
            return (
              <>
                <div
                  className={`text-xl leading-loose text-gray-800 ${tafsirLang === "en" ? "text-left" : "text-right"} ${tafsirLang === "en" ? "" : "font-urdu"}`}
                  style={{ direction: tafsirLang === "en" ? "ltr" : "rtl" }}
                  dangerouslySetInnerHTML={{
                    __html: expandedTafsir
                      ? formattedTafsir
                      : isLong
                        ? previewFormatted
                        : formattedTafsir,
                  }}
                />
                {isLong && (
                  <button
                    onClick={() => setExpandedTafsir(!expandedTafsir)}
                    className="mt-2 text-emerald-600 text-sm font-bold hover:underline"
                  >
                    {expandedTafsir ? t("qna.readLess") : t("qna.readMore")}
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        {Number(ayahNumber) > 1 ? (
          <Link
            to={`/surah/${surahNumber}/ayah/${Number(ayahNumber) - 1}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <span>&larr;</span>
            {isRtl ? "پچھلی آیت" : "Previous Ayah"}
          </Link>
        ) : (
          <div />
        )}
        {Number(ayahNumber) < verses.length ? (
          <Link
            to={`/surah/${surahNumber}/ayah/${Number(ayahNumber) + 1}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {isRtl ? "اگلی آیت" : "Next Ayah"}
            <span>&rarr;</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default AyahDetail;
