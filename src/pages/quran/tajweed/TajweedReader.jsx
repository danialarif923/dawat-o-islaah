import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { getPageNumber } from "../../../data/pageMapping";
import surahData from "../../../../assets/surahData.json";

const THEMES = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "sepia", label: "Sepia" },
  { key: "black", label: "Black" },
  { key: "p1", label: "P1" },
  { key: "p2", label: "P2" },
  { key: "p3", label: "P3" },
  { key: "p4", label: "P4" },
  { key: "p5", label: "P5" },
  { key: "p6", label: "P6" },
];

const TajweedReader = () => {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const surahNum = parseInt(surahNumber, 10);

  const [qpcData, setQpcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [theme, setTheme] = useState("light");

  const surahInfo = useMemo(
    () => surahData.find((s) => s.number === surahNum),
    [surahNum]
  );
  const totalAyahs = surahInfo ? surahInfo.numberOfAyahs : 0;

  useEffect(() => {
    setLoading(true);
    setError(null);
    import(
      "../../../../assets/Tajweed/qpc-v4.json/qpc-v4.json"
    )
      .then((mod) => {
        setQpcData(mod.default || mod);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load Tajweed data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentAyah(1);
  }, [surahNumber]);

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

  const pageNum = useMemo(
    () => getPageNumber(surahNum, currentAyah),
    [surahNum, currentAyah]
  );

  useEffect(() => {
    if (!pageNum) return;
    const familyName = `p${pageNum}-v4-tajweed`;
    const existing = document.getElementById(`tajweed-font-${pageNum}`);
    if (existing) return;
    const style = document.createElement("style");
    style.id = `tajweed-font-${pageNum}`;
    style.textContent = `
      @font-face {
        font-family: '${familyName}';
        src: url('https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v4-tajweed/woff2/p${pageNum}.woff2?v=3.1') format('woff2'),
             url('https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v4-tajweed/woff/p${pageNum}.woff?v=3.1') format('woff'),
             url('https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v4-tajweed/ttf/p${pageNum}.ttf?v=3.1') format('truetype');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }, [pageNum]);

  const goToAyah = useCallback(
    (ayah) => {
      if (ayah >= 1 && ayah <= totalAyahs) {
        setCurrentAyah(ayah);
      }
    },
    [totalAyahs]
  );

  const handleSurahChange = useCallback(
    (e) => {
      navigate(`/tajweed/${e.target.value}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-blue-600" />
        <span className="ml-3 text-gray-500">{t("tajweed.loading") || "Loading Tajweed data..."}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">{error}</div>
    );
  }

  if (!surahInfo) {
    return (
      <div className="text-center py-8 text-red-500">
        {t("tajweed.surahNotFound") || "Surah not found"}
      </div>
    );
  }

  const currentThemeClass = `tajweed-theme-${theme}`;
  const themeBg = theme === "dark" || theme === "black"
    ? "bg-gray-900"
    : theme === "sepia"
    ? "bg-amber-50"
    : "bg-white";
  const themeText = theme === "dark" || theme === "black"
    ? "text-gray-100"
    : theme === "sepia"
    ? "text-amber-900"
    : "text-gray-800";
  const themeBorder = theme === "dark" || theme === "black"
    ? "border-gray-700"
    : theme === "sepia"
    ? "border-amber-300"
    : "border-gray-200";
  const fontFamilyName = `p${pageNum}-v4-tajweed`;

  return (
    <div className={`container mx-auto px-4 py-6 ${currentThemeClass}`}>
      <div className={`rounded-xl shadow-lg p-6 ${themeBg} ${themeText} ${themeBorder}`}>
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <button
            onClick={() => navigate("/quran")}
            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm cursor-pointer transition-colors"
          >
            &larr; {t("quran.backToQuran")}
          </button>

          <select
            value={surahNum}
            onChange={handleSurahChange}
            className={`px-3 py-1.5 rounded-lg border ${themeBorder} bg-transparent text-sm outline-none cursor-pointer`}
          >
            {surahData.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {t(`surahNames.${s.number}`)}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1">
            {THEMES.map((th) => (
              <button
                key={th.key}
                onClick={() => setTheme(th.key)}
                className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
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

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => goToAyah(currentAyah - 1)}
            disabled={currentAyah <= 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm cursor-pointer transition-colors"
          >
            &larr; {t("quran.prev")}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {t("quranDetails.ayah")} {currentAyah}
            </span>
            <span className="text-sm text-gray-400">/ {totalAyahs}</span>
            <select
              value={currentAyah}
              onChange={(e) => goToAyah(parseInt(e.target.value, 10))}
              className={`px-2 py-1 rounded border ${themeBorder} bg-transparent text-sm outline-none cursor-pointer`}
            >
              {Array.from({ length: totalAyahs }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => goToAyah(currentAyah + 1)}
            disabled={currentAyah >= totalAyahs}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm cursor-pointer transition-colors"
          >
            {t("quran.next")} &rarr;
          </button>
        </div>

        <div
          className="flex flex-wrap gap-3 justify-center p-6 rounded-lg min-h-[200px] items-start content-start"
          style={{ direction: "rtl" }}
        >
          {ayahWords.length === 0 ? (
            <p className="text-gray-400">{t("tajweed.noData") || "No data available"}</p>
          ) : (
            ayahWords.map((word) => (
              <span
                key={word.location}
                className="tajweed-word-box inline-flex items-center justify-center"
                style={{ fontFamily: `'${fontFamilyName}', serif`, fontSize: "30px", lineHeight: "1.8" }}
              >
                {word.text}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TajweedReader;
