import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import surahData from "../../../../assets/surahData.json";
import hafsPageStarts, { getPageNumber } from "../../../data/pageMapping";
import { getQpcData, getCachedData } from "../../../data/qpcCache";

const THEMES = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "sepia", label: "Sepia" },
];

const TajweedReader = () => {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const routeSurahNum = parseInt(surahNumber, 10);

  const [localSurahNum, setLocalSurahNum] = useState(routeSurahNum);
  const surahNum = localSurahNum;

  const [qpcData, setQpcData] = useState(getCachedData());
  const [currentAyah, setCurrentAyah] = useState(1);
  const [theme, setTheme] = useState("light");
  const [fontStyles, setFontStyles] = useState("");
  const [showJumpInput, setShowJumpInput] = useState(false);

  const surahInfo = useMemo(
    () => surahData.find((s) => s.number === surahNum),
    [surahNum]
  );
  const totalAyahs = surahInfo ? surahInfo.numberOfAyahs : 0;

  useEffect(() => {
    if (!qpcData) {
      getQpcData().then(setQpcData);
    }
  }, [qpcData]);

  useEffect(() => {
    const routeNum = parseInt(surahNumber, 10);
    if (!isNaN(routeNum) && routeNum !== localSurahNum) {
      setLocalSurahNum(routeNum);
      setCurrentAyah(1);
    }
  }, [surahNumber]);

  const ayahPage = useMemo(
    () => getPageNumber(surahNum, currentAyah),
    [surahNum, currentAyah]
  );

  const nextAyahPage = useMemo(
    () => (currentAyah < totalAyahs ? getPageNumber(surahNum, currentAyah + 1) : ayahPage),
    [surahNum, currentAyah, totalAyahs, ayahPage]
  );

  const TOTAL_FONT_PAGES = 604;
  const MISSING_FONT_PAGES = new Set([328]);

  useEffect(() => {
    const styles = [];
    for (let p = 1; p <= TOTAL_FONT_PAGES; p++) {
      if (MISSING_FONT_PAGES.has(p)) continue;
      styles.push(
        `@font-face{font-family:'p${p}-v4-tajweed';src:url('https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v4-tajweed/woff2/p${p}.woff2') format('woff2');font-display:swap}`
      );
    }
    setFontStyles(styles.join(""));
  }, []);

  const fontFamilies = useMemo(() => {
    const pages = [];
    for (let p = ayahPage; p <= nextAyahPage; p++) {
      if (p <= TOTAL_FONT_PAGES && !MISSING_FONT_PAGES.has(p)) {
        pages.push(`'p${p}-v4-tajweed'`);
      }
    }
    return pages.length > 0 ? pages.join(", ") + ", serif" : "serif";
  }, [ayahPage, nextAyahPage]);

  const ayahWords = useMemo(() => {
    if (!qpcData) return [];
    const prefix = `${surahNum}:${currentAyah}:`;
    const words = [];
    let idx = 1;
    while (true) {
      const key = `${prefix}${idx}`;
      const entry = qpcData[key];
      if (!entry) break;
      words.push(entry);
      idx++;
    }
    return words;
  }, [qpcData, surahNum, currentAyah]);

  const goToPrevPage = useCallback(() => {
    const prevIdx = ayahPage - 2;
    if (prevIdx < 0) return;
    const [surah, ayah] = hafsPageStarts[prevIdx];
    setCurrentAyah(ayah);
    if (surah !== surahNum) {
      setLocalSurahNum(surah);
      window.history.replaceState(null, "", `/tajweed/${surah}`);
    }
  }, [ayahPage, surahNum]);

  const goToNextPage = useCallback(() => {
    const nextIdx = ayahPage;
    if (nextIdx >= hafsPageStarts.length) return;
    const [surah, ayah] = hafsPageStarts[nextIdx];
    setCurrentAyah(ayah);
    if (surah !== surahNum) {
      setLocalSurahNum(surah);
      window.history.replaceState(null, "", `/tajweed/${surah}`);
    }
  }, [ayahPage, surahNum]);

  const handleSurahChange = useCallback((e) => {
    const num = parseInt(e.target.value, 10);
    setLocalSurahNum(num);
    setCurrentAyah(1);
    window.history.replaceState(null, "", `/tajweed/${num}`);
  }, []);

  const jumpToPage = useCallback((targetPage) => {
    const pageNum = parseInt(targetPage, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > hafsPageStarts.length) return;
    const [surah, ayah] = hafsPageStarts[pageNum - 1];
    setCurrentAyah(ayah);
    if (surah !== surahNum) {
      setLocalSurahNum(surah);
      window.history.replaceState(null, "", `/tajweed/${surah}`);
    }
    setShowJumpInput(false);
  }, [surahNum]);

  if (!qpcData) {
    return null;
  }

  if (!surahInfo) {
    return (
      <div className="text-center py-8 text-red-500">
        {t("tajweed.surahNotFound") || "Surah not found"}
      </div>
    );
  }

  const currentThemeClass = `tajweed-theme-${theme}`;
  const themeBg = theme === "dark"
    ? "bg-gray-900"
    : theme === "sepia"
    ? "bg-amber-50"
    : "bg-white";
  const themeText = theme === "dark"
    ? "text-gray-100"
    : theme === "sepia"
    ? "text-amber-900"
    : "text-gray-800";
  const themeBorder = theme === "dark"
    ? "border-gray-700"
    : theme === "sepia"
    ? "border-amber-300"
    : "border-gray-200";
  const wordBoxBorder = theme === "dark"
    ? "#555"
    : theme === "sepia"
    ? "#D4C5A0"
    : "#d1d5db";
  const boxTextColor = theme === "dark" ? "#fff" : "inherit";
  const boxBg = theme === "dark" ? "#fff" : "transparent";
  return (
    <div className={`container mx-auto px-4 py-6 ${currentThemeClass}`}>
      <div className={`rounded-xl shadow-lg p-6 ${themeBg} ${themeText} ${themeBorder}`}>
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <button
            onClick={() => navigate("/quran")}
            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm cursor-pointer transition-colors text-gray-800 dark:text-gray-800"
          >
            &larr; {t("quran.backToQuran")}
          </button>

          <select
            value={surahNum}
            onChange={handleSurahChange}
            style={{ color: "#000" }}
            className={`px-3 py-1.5 rounded-lg border ${themeBorder} bg-white text-sm outline-none cursor-pointer`}
          >
            {surahData.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {t(`surahNames.${s.number}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevPage}
            disabled={ayahPage <= 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm cursor-pointer transition-colors"
          >
            &larr; {t("quran.prev")}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowJumpInput(true)}
              className="text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {t("quran.page") || "Page"} {ayahPage}
            </button>
            {showJumpInput && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
                <input
                  type="number"
                  min={1}
                  max={hafsPageStarts.length}
                  defaultValue={ayahPage}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") jumpToPage(e.target.value);
                    if (e.key === "Escape") setShowJumpInput(false);
                  }}
                  onBlur={() => setShowJumpInput(false)}
                  className="w-16 px-1 py-0.5 text-sm border rounded outline-none dark:bg-gray-700 dark:text-gray-100"
                />
                <span className="text-xs text-gray-500">/ {hafsPageStarts.length}</span>
              </div>
            )}
          </div>

          <button
            onClick={goToNextPage}
            disabled={ayahPage >= hafsPageStarts.length}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm cursor-pointer transition-colors"
          >
            {t("quran.next")} &rarr;
          </button>
        </div>

        {fontStyles && <style>{fontStyles}</style>}
        <div className="p-6 rounded-lg min-h-[200px] leading-[2]" style={{ direction: "rtl", textAlign: "center", overflowX: "auto", overflowY: "hidden" }}>
          {ayahWords.length === 0 ? (
            <p className="text-gray-400 text-center">{t("tajweed.noData") || "No data available"}</p>
          ) : (
            ayahWords.map((word) => (
              <span
                key={word.location}
                className="tajweed-word-box"
                style={{
                  fontFamily: fontFamilies,
                  fontSize: "42px",
                  lineHeight: "2",
                  borderColor: wordBoxBorder,
                  color: boxTextColor,
                  backgroundColor: boxBg,
                }}
              >
                {word.text}
              </span>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-1 justify-center mt-4">
          {THEMES.map((th) => (
            <button
              key={th.key}
              onClick={() => setTheme(th.key)}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                theme === th.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {th.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TajweedReader;
