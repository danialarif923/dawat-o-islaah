import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const HADITH_BOOK_OPTIONS = (t) => [
  { label: t("searchPage.allBooks"), value: "" },
  { label: t("hadithBookNames.sahih-bukhari"), value: "sahih-bukhari" },
  { label: t("hadithBookNames.sahih-muslim"), value: "sahih-muslim" },
  { label: t("hadithBookNames.tirmidhi"), value: "al-tirmidhi" },
  { label: t("hadithBookNames.abu-dawood"), value: "abu-dawood" },
  { label: t("hadithBookNames.ibn-e-majah"), value: "ibn-e-majah" },
  { label: t("hadithBookNames.sunan-nasai"), value: "sunan-nasai" },
];

const BOOKS = ["sahih-bukhari", "sahih-muslim", "al-tirmidhi", "abu-dawood", "ibn-e-majah", "sunan-nasai"];
const HADITH_PAGE_SIZE = 100;

const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

const ROMAN_URDU_MAP = {
  "a":"ا","b":"ب","c":"س","d":"د","e":"ی",
  "f":"ف","g":"گ","h":"ہ","i":"ی","j":"ج",
  "k":"ک","l":"ل","m":"م","n":"ن","o":"و","p":"پ",
  "q":"ق","r":"ر","s":"س","t":"ت","u":"و",
  "v":"و","w":"و","x":"کس","y":"ی","z":"ز",
  "ae":"ع","gh":"غ","kh":"خ","sh":"ش","ch":"چ",
  "dh":"ذ","th":"ث",
};

const romanUrduToArabic = (text) => {
  if (!text || ARABIC_SCRIPT.test(text)) return text;
  const lower = text.toLowerCase();
  let result = "";
  for (let i = 0; i < lower.length; i++) {
    const two = i + 1 < lower.length ? ROMAN_URDU_MAP[lower.slice(i, i + 2)] : null;
    if (two) { result += two; i++; }
    else { result += ROMAN_URDU_MAP[lower[i]] || text[i]; }
  }
  return result;
};

const normalizeArabic = (str) => {
  if (!str || !ARABIC_SCRIPT.test(str)) return str;
  return str
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u0671]/g, "")
    .replace(/[إأآاٱ]/g, "ا")
    .replace(/[ہھةۃ]/g, "ه")
    .replace(/[ىیۓ]/g, "ي")
    .replace(/[ک]/g, "ك")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/ـ/g, "")
    .trim();
};

const translateRomanUrdu = async (text) => {
  if (!text) return { urdu: "", english: "" };
  const cleanText = text.toLowerCase().trim();
  if (!cleanText) return { urdu: "", english: "" };

  const translateToEnglish = async (urduText) => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(urduText)}&langpair=ur|en`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch { /* fallback */ }
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ur&tl=en&dt=t&q=${encodeURIComponent(urduText)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.[0]?.[0]?.[0]) return data[0][0][0];
      }
    } catch { /* fallback */ }
    return "";
  };

  if (ARABIC_SCRIPT.test(cleanText)) {
    const english = await translateToEnglish(cleanText);
    return { urdu: cleanText, english };
  }

  let urdu = "";
  let english = "";

  try {
    const urduRes = await fetch("/roman2urdu/api", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ text: cleanText }),
    });
    if (urduRes.ok) {
      const urduData = await urduRes.json();
      if (urduData.success) urdu = urduData.output;
    }
  } catch {
    try {
      const urduRes2 = await fetch("https://roman2urdu.hamzaafzal.com/api", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ text: cleanText }),
      });
      if (urduRes2.ok) {
        const urduData2 = await urduRes2.json();
        if (urduData2.success) urdu = urduData2.output;
      }
    } catch { /* fallback silently */ }
  }

  if (urdu) {
    english = await translateToEnglish(urdu);
  }

  return { urdu, english };
};

const Search = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const keyword = query.get("q") || "";

  const [activeSection, setActiveSection] = useState("general");
  const [quranResults, setQuranResults] = useState([]);
  const [hadithResults, setHadithResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [searchTerms, setSearchTerms] = useState([]);

  // QURAN FILTERS
  const [quranLanguage, setQuranLanguage] = useState("all");
  const [quranAyah, setQuranAyah] = useState("");
  const [quranSurah, setQuranSurah] = useState("");

  // HADITH FILTERS
  const [hadithLanguage, setHadithLanguage] = useState("all");
  const [hadithBook, setHadithBook] = useState("");
  const [hadithGrade, setHadithGrade] = useState("");

  // HADITH NUMBER SEARCH
  const [hadithNumberInput, setHadithNumberInput] = useState("");
  const [hadithNumberSearchMode, setHadithNumberSearchMode] = useState("all");
  const [hadithNumberSelectedBooks, setHadithNumberSelectedBooks] = useState([]);
  const [hadithNumberResults, setHadithNumberResults] = useState([]);
  const [hadithNumberLoading, setHadithNumberLoading] = useState(false);

  const HADITH_API_KEY =
    "$2y$10$d4nL2E660zHHBrwTB7Bviu3WvW5sToLRBWFbJ1yhn7rJzSuNpA0S";

  const highlightText = useCallback((text, target) => {
    if (!text || !target || !target.trim()) return text;
    try {
      if (!/[\u0600-\u06FF]/.test(text)) {
        const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
          part.toLowerCase() === target.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-200 text-black rounded px-1 font-semibold"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        );
      }
      let cleanTarget = normalizeArabic(target);
      const diacritics =
        "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0610-\\u061A\\u0671]*";
      const regexSource = cleanTarget
        .split("")
        .map((char) => {
          if (char === "ا") return "[اأإآٱ]" + diacritics;
          if (char === "ه") return "[هہھة]" + diacritics;
          if (char === "ي") return "[ييىی]" + diacritics;
          if (char === "ك") return "[كک]" + diacritics;
          if (char === " ") return "\\s+";
          return char + diacritics;
        })
        .join("");
      const dynamicRegex = new RegExp(`(${regexSource})`, "gi");
      const parts = text.split(dynamicRegex);
      return parts.map((part, i) => {
        if (!part) return part;
        const cleanPart = normalizeArabic(part);
        return cleanPart.includes(cleanTarget) ? (
          <mark
            key={i}
            className="bg-yellow-200 text-black rounded px-1 font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        );
      });
    } catch (e) {
      return text;
    }
  }, []);

  const highlightMulti = useCallback((text, terms) => {
    if (!text || !terms?.length) return text;
    const hasArabic = ARABIC_SCRIPT.test(text);
    const normalizedText = hasArabic ? normalizeArabic(text) : text.toLowerCase();
    for (const term of terms) {
      if (!term?.trim()) continue;
      const normalizedTerm = hasArabic ? normalizeArabic(term) : term.toLowerCase();
      if (!normalizedTerm) continue;
      if (normalizedText.includes(normalizedTerm)) {
        return highlightText(text, term);
      }
      if (hasArabic && !ARABIC_SCRIPT.test(term)) {
        const arabicTerm = romanUrduToArabic(term);
        const arabicFallback = normalizeArabic(arabicTerm);
        if (arabicFallback && normalizedText.includes(arabicFallback)) {
          return highlightText(text, arabicTerm);
        }
      }
    }
    return text;
  }, [highlightText]);

  useEffect(() => {
    if (!keyword) return;
    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setQuranResults([]);
      setHadithResults([]);
      setCurrentPage(1);

      let searchTerms = [keyword];
      setLoadingMessage("Translating...");

      const expanded = await translateRomanUrdu(keyword);
      if (cancelled) return;
      if (expanded.urdu && !searchTerms.includes(expanded.urdu)) searchTerms.push(expanded.urdu);
      if (expanded.english && !searchTerms.includes(expanded.english)) searchTerms.push(expanded.english);

      // deduplicate case-insensitively
      const lowerMap = new Map();
      searchTerms.forEach((t) => { const k = t.toLowerCase(); if (!lowerMap.has(k)) lowerMap.set(k, t); });
      searchTerms = Array.from(lowerMap.values());
      setSearchTerms(searchTerms);

      // Run Quran and Hadith searches in parallel
      const searchQuran = async () => {
        const mergedMap = new Map();
        const quranEndpoints = [];
        searchTerms.forEach((term) => {
          const arabicTerm = normalizeArabic(term);
          quranEndpoints.push(
            { url: `https://api.alquran.cloud/v1/search/${encodeURIComponent(arabicTerm)}/all/quran-simple-clean`, lang: "ar" },
            { url: `https://api.alquran.cloud/v1/search/${encodeURIComponent(term)}/all/en.sahih`, lang: "en" },
            { url: `https://api.alquran.cloud/v1/search/${encodeURIComponent(term)}/all/ur.jalandhry`, lang: "ur" },
          );
        });

        const mergeMatches = (matches, lang) => {
          if (!matches) return;
          matches.forEach((m) => {
            if (!mergedMap.has(m.number)) {
              mergedMap.set(m.number, { ...m, ar: "", en: "", ur: "" });
            }
            const entry = mergedMap.get(m.number);
            entry[lang] = m.text || "";
          });
        };

        for (let i = 0; i < quranEndpoints.length; i++) {
          if (cancelled) return;
          setLoadingMessage(`Searching Quran (term ${i + 1}/${quranEndpoints.length})...`);
          try {
            const resp = await fetch(quranEndpoints[i].url).then((r) => (r.ok ? r.json() : null));
            if (cancelled) return;
            mergeMatches(resp?.data?.matches, quranEndpoints[i].lang);
            setQuranResults(Array.from(mergedMap.values()));
          } catch { /* skip */ }
        }

        const QURAN_EDITIONS = "quran-simple-clean,en.sahih,ur.jalandhry";
        const matchedAyahs = Array.from(mergedMap.keys());
        for (let idx = 0; idx < matchedAyahs.length; idx++) {
          if (cancelled) return;
          setLoadingMessage(`Fetching full translations for ayah ${idx + 1}/${matchedAyahs.length}...`);
          try {
            const resp = await fetch(
              `https://api.alquran.cloud/v1/ayah/${matchedAyahs[idx]}/editions/${QURAN_EDITIONS}`,
            ).then((r) => (r.ok ? r.json() : null));
            if (cancelled) return;
            if (resp?.data) {
              resp.data.forEach((item) => {
                const entry = mergedMap.get(item.number);
                if (!entry) return;
                const id = item.edition?.identifier;
                if (id === "quran-simple-clean") entry.ar = item.text || "";
                if (id === "en.sahih") entry.en = item.text || "";
                if (id === "ur.jalandhry") entry.ur = item.text || "";
              });
            }
          } catch { /* skip */ }
        }
        setQuranResults(Array.from(mergedMap.values()));
      };

      const searchHadith = async () => {
        const allHadithsMap = new Map();
        let totalHadithPages = 0;
        let completedHadithPages = 0;

        for (const term of searchTerms) {
          const isArabicTerm = ARABIC_SCRIPT.test(term);
          for (const book of BOOKS) {
            let page = 1;
            let lastPage = 1;
            const MAX_PAGES = 50;

            while (page <= lastPage && page <= MAX_PAGES) {
              if (cancelled) return;
              await new Promise((r) => setTimeout(r, 400));
              setLoadingMessage(
                `Fetching hadith — ${book} page ${page}/${lastPage || "?"} (${completedHadithPages} pages done)...`,
              );

              try {
                const searchTerm = isArabicTerm ? normalizeArabic(term) : term;
                const hadithParam = isArabicTerm ? "hadithArabic" : "hadithEnglish";
                const res = await fetch(
                  `https://hadithapi.com/api/hadiths?apiKey=${HADITH_API_KEY}&book=${book}&${hadithParam}=${encodeURIComponent(searchTerm)}&paginate=${HADITH_PAGE_SIZE}&page=${page}`,
                ).then((r) => (r.ok ? r.json() : null));

                if (cancelled) return;

                if (res?.hadiths) {
                  if (totalHadithPages === 0) {
                    totalHadithPages = res.hadiths.last_page || 1;
                  }
                  lastPage = res.hadiths.last_page || 1;

                  const data = res.hadiths.data || [];
                  data.forEach((h) => {
                    const key = `${h.book?.bookSlug}-${h.hadithNumber}`;
                    if (!allHadithsMap.has(key)) allHadithsMap.set(key, h);
                  });

                  setHadithResults(Array.from(allHadithsMap.values()));
                }
                completedHadithPages++;
              } catch { /* skip */ }

              page++;
            }
          }
        }
      };

      await Promise.all([searchQuran(), searchHadith()]);

      if (!cancelled) setLoading(false);
    };

    fetchResults();

    return () => { cancelled = true; };
  }, [keyword]);

  // HADITH NUMBER SEARCH
  const searchHadithNumber = useCallback(async () => {
    const num = hadithNumberInput.trim();
    if (!num || isNaN(num)) return;
    setHadithNumberLoading(true);
    setHadithNumberResults([]);

    const booksToSearch =
      hadithNumberSearchMode === "specific" && hadithNumberSelectedBooks.length > 0
        ? hadithNumberSelectedBooks
        : BOOKS;

    const allResults = new Map();
    for (const book of booksToSearch) {
      try {
        const res = await fetch(
          `https://hadithapi.com/api/hadiths?apiKey=${HADITH_API_KEY}&book=${book}&hadithNumber=${num}`,
        ).then((r) => (r.ok ? r.json() : null));
        if (res?.hadiths?.data) {
          res.hadiths.data.forEach((h) => {
            const key = `${h.book?.bookSlug}-${h.hadithNumber}`;
            if (!allResults.has(key)) allResults.set(key, h);
          });
        }
      } catch { /* skip */ }
    }

    setHadithNumberResults(Array.from(allResults.values()));
    setHadithNumberLoading(false);
  }, [hadithNumberInput, hadithNumberSearchMode, hadithNumberSelectedBooks, HADITH_API_KEY]);

  // SECTION DATA
  const generalResults = [
    ...quranResults.map((item) => ({ ...item, _type: "quran" })),
    ...hadithResults.map((item) => ({ ...item, _type: "hadith" })),
  ];

  const filteredQuranResults = quranResults.filter((item) => {
    if (quranSurah && item.surah?.number != quranSurah) return false;
    if (quranAyah && item.numberInSurah != quranAyah) return false;
    return true;
  });

  const filteredHadithResults = hadithResults.filter((item) => {
    if (hadithBook && item.book?.bookSlug !== hadithBook) return false;
    if (hadithGrade && item.grade !== hadithGrade) return false;
    return true;
  });

  const sectionData =
    activeSection === "general"
      ? generalResults
      : activeSection === "quran"
        ? filteredQuranResults
        : hadithNumberResults.length > 0
          ? hadithNumberResults
          : filteredHadithResults;

  const totalPages = Math.ceil(sectionData.length / resultsPerPage);
  const paginatedData = sectionData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage,
  );

  return (
    <div className="max-w-5xl mx-auto p-4 min-h-[60vh]">
      <h2 className="text-2xl font-bold my-6 text-center text-[#1E3A5F]">
        {t("searchPage.resultsFor")} "{keyword}"
      </h2>

      {/* SECTION TABS */}
      <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
        {["general", "quran", "hadith"].map((sec) => (
          <button
            key={sec}
            onClick={() => { setActiveSection(sec); setCurrentPage(1); }}
            className={`pb-2 px-4 capitalize ${
              activeSection === sec
                ? "border-b-2 border-green-600 font-bold text-green-700"
                : "text-gray-400"
            }`}
          >
            {sec === "general"
              ? `General (${generalResults.length})`
              : sec === "quran"
                ? `Quran (${quranResults.length})`
                : `Hadith (${hadithResults.length})`}
          </button>
        ))}
      </div>

      {/* LOADING STATUS BAR */}
      {loading && (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-pulse flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingMessage || "Searching..."}
        </div>
      )}

      {/* QURAN FILTERS */}
      {activeSection === "quran" && (
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={quranLanguage}
            onChange={(e) => setQuranLanguage(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Languages</option>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
            <option value="ur">Urdu</option>
            <option value="roman">Roman Urdu</option>
          </select>
          <select
            value={quranSurah}
            onChange={(e) => { setQuranSurah(e.target.value); setQuranAyah(""); }}
            className="border rounded px-2 py-1 w-40"
          >
            <option value="">All Surahs</option>
            {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}. {t("surahNames." + num)}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="286"
            placeholder="Ayah #"
            value={quranAyah}
            onChange={(e) => setQuranAyah(e.target.value)}
            className="border rounded px-2 py-1 w-28"
          />
          <select
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      )}

      {/* HADITH FILTERS */}
      {activeSection === "hadith" && (
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <select
            value={hadithLanguage}
            onChange={(e) => setHadithLanguage(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Languages</option>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
            <option value="ur">Urdu</option>
            <option value="roman">Roman Urdu</option>
          </select>
          <select
            value={hadithBook}
            onChange={(e) => setHadithBook(e.target.value)}
            className="border rounded px-2 py-1 w-48"
          >
            {HADITH_BOOK_OPTIONS(t).map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <select
            value={hadithGrade}
            onChange={(e) => setHadithGrade(e.target.value)}
            className="border rounded px-2 py-1 w-36"
          >
            <option value="">All Grades</option>
            <option value="Sahih">Sahih</option>
            <option value="Sahih Jiddan">Sahih Jiddan</option>
            <option value="Hasan">Hasan</option>
            <option value="Hasan Sahih">Hasan Sahih</option>
            <option value="Da'if">Da'if</option>
            <option value="Da'if Jiddan">Da'if Jiddan</option>
            <option value="Mawdu'">Mawdu'</option>
          </select>
          <select
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* HADITH NUMBER SEARCH */}
          <div className="w-full border-t pt-4 mt-2 flex flex-wrap gap-3 items-end">
            <span className="text-sm font-semibold text-gray-600 w-full">Search by Hadith Number</span>
            <input
              type="number"
              placeholder="Hadith #"
              value={hadithNumberInput}
              onChange={(e) => setHadithNumberInput(e.target.value)}
              className="border rounded px-2 py-1 w-28"
            />
            <select
              value={hadithNumberSearchMode}
              onChange={(e) => setHadithNumberSearchMode(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All Books</option>
              <option value="specific">Specific Books</option>
            </select>
            {hadithNumberSearchMode === "specific" && (
              <div className="flex flex-wrap gap-1">
                {BOOKS.map((book) => (
                  <label key={book} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hadithNumberSelectedBooks.includes(book)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setHadithNumberSelectedBooks((prev) => [...prev, book]);
                        } else {
                          setHadithNumberSelectedBooks((prev) => prev.filter((b) => b !== book));
                        }
                      }}
                    />
                    {book.replace("al-", "").replace(/-/g, " ")}
                  </label>
                ))}
              </div>
            )}
            <button
              onClick={searchHadithNumber}
              disabled={hadithNumberLoading || !hadithNumberInput.trim()}
              className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {hadithNumberLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      )}

      {/* RESULTS */}
      <div className="space-y-6">
        {!loading && paginatedData.length === 0 && !hadithNumberLoading ? (
          <div className="text-center py-20 text-gray-400">
            No results found for "{keyword}".
          </div>
        ) : paginatedData.length === 0 ? null : (
          <>
            {paginatedData.map((item, idx) => (
              <ResultCard
                key={`${activeSection}-${idx}`}
                item={item}
                type={item._type || activeSection}
                highlightMulti={highlightMulti}
                keyword={keyword}
                searchTerms={searchTerms}
                languageFilter={
                  activeSection === "quran"
                    ? quranLanguage
                    : activeSection === "hadith"
                      ? hadithLanguage
                      : "all"
                }
                navigate={navigate}
              />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-10 pb-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ResultCard = ({
  item,
  type,
  highlightMulti,
  keyword,
  searchTerms,
  languageFilter,
  navigate,
}) => {
  const { t } = useLanguage();

  const terms = searchTerms?.length ? searchTerms : [keyword];
  const arabicKeyword = /[\u0600-\u06FF]/.test(keyword) ? keyword : "";
  const showLang = (lang) =>
    languageFilter === "all" || languageFilter === "roman" || languageFilter === lang;

  if (type === "quran") {
    return (
      <div
        onClick={() => {
          if (item.surah) {
            navigate(`/surah/${item.surah.number}?ayah=${item.numberInSurah}`);
          }
        }}
        className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-600 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="text-xs font-bold text-green-700 uppercase mb-4">
          {item.surah ? t("surahNames." + item.surah.number) + " • " + item.surah.number + ":" + item.numberInSurah : ""}
        </div>
        {showLang("ar") && item.ar && (
          <p
            className="text-right font-quran text-3xl mb-6 leading-[2.5]"
            dir="rtl"
          >
            {highlightMulti(item.ar, [arabicKeyword, ...terms])}
          </p>
        )}
        {showLang("en") && item.en && (
          <p className="text-gray-700 italic border-t pt-4">
            {highlightMulti(item.en, terms)}
          </p>
        )}
        {showLang("ur") && item.ur && (
          <p className="text-gray-800 italic border-t pt-4">
            {highlightMulti(item.ur, terms)}
          </p>
        )}
        {languageFilter === "roman" && (
          <p className="text-gray-500 text-sm italic border-t pt-4">
            Roman Urdu: {keyword}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={async () => {
        try {
          const bookSlug =
            item.book?.bookSlug ||
            item.book?.bookName?.toLowerCase().replace(/\s+/g, "-");

          let chapterNo = item.chapter?.chapterNumber;

          if (!chapterNo) {
            const res = await fetch(
              `/api/hadith/get-hadith/?book=${bookSlug}&hadith=${item.hadithNumber}`,
            );
            const data = await res.json();
            chapterNo = data?.chapterNumber;
          }

          navigate(
            `/hadith/${bookSlug}/${chapterNo ?? 1}?hadith=${item.hadithNumber}&book=${bookSlug}`,
          );
        } catch (err) {
          console.error(err);
        }
      }}
      className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-600 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="text-xs font-bold text-blue-700 mb-2 uppercase">
        {item.book?.bookName} • Hadith {item.hadithNumber}
      </div>

      {showLang("en") && item.hadithEnglish && (
        <p className="text-gray-700 mb-4 text-lg">
          {highlightMulti(item.hadithEnglish, terms)}
        </p>
      )}

      {showLang("ur") && item.hadithUrdu && (
        <p className="text-gray-800 mb-4 text-lg">
          {highlightMulti(item.hadithUrdu, terms)}
        </p>
      )}

      {showLang("ar") && item.hadithArabic && (
        <p
          className="text-right font-hadith text-2xl text-gray-600 leading-loose"
          dir="rtl"
        >
          {highlightMulti(item.hadithArabic, [arabicKeyword, ...terms])}
        </p>
      )}

      {languageFilter === "roman" && (
        <p className="text-gray-500 text-sm italic border-t pt-4">
          Roman Urdu: {keyword}
        </p>
      )}
    </div>
  );
};

export default Search;
