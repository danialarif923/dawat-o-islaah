import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TRANSLATION_FALLBACKS = {
  allah: "الله",
  god: "الله",
  muhammad: "محمد",
  prophet: "نبي",
  messenger: "رسول",
  paradise: "جنة",
  hell: "نار",
};

const HADITH_BOOK_OPTIONS = [
  { label: "All Books", value: "" },
  { label: "Sahih Bukhari", value: "sahih-bukhari" },
  { label: "Sahih Muslim", value: "sahih-muslim" },
  { label: "Jami` at-Tirmidhi", value: "tirmidhi" },
  { label: "Sunan Abu Dawood", value: "abu-dawood" },
  { label: "Sunan Ibn Majah", value: "ibn-e-majah" },
  { label: "Sunan an-Nasa'i", value: "sunan-nasai" },
];

// Smart anchor dictionary
const KNOWN_AYAH_MAPPINGS = [
  {
    keys: ["la ilaha illa anta", "subhanaka inni kuntu"],
    ar: "لا اله الا انت سبحانك اني كنت من الظالمين",
  },
  { keys: ["inna lillahi", "wa inna ilaihi"], ar: "انا لله وانا اليه راجعون" },
  { keys: ["maal usri yusra"], ar: "ان مع العسر يسرا" },
  {
    keys: ["ayyuhal ladheena", "bis sabri was salah"],
    ar: "استعينوا بالصبر والصلاة ان الله مع الصابرين",
  },
  { keys: ["asrafoo alaa", "laa taqnatoo"], ar: "لا تقنطوا من رحمة الله" },
  { keys: ["bismillah"], ar: "بسم الله الرحمن الرحيم" },
  { keys: ["alhamdulillah"], ar: "الحمد لله" },
  { keys: ["allahu akbar"], ar: "الله اكبر" },
  { keys: ["subhanallah"], ar: "سبحان الله" },
  { keys: ["astaghfirullah"], ar: "استغفر الله" },
  { keys: ["ayatul kursi"], ar: "الحي القيوم" },
  { keys: ["qul huwallahu"], ar: "قل هو الله احد" },
  { keys: ["kun faya kun"], ar: "كن فيكون" },
];

const getArabicKeyword = (keyword) => {
  if (!keyword) return "";
  let cleanK = keyword.toLowerCase().trim();
  if (/[\u0600-\u06FF]/.test(cleanK)) return cleanK;
  if (TRANSLATION_FALLBACKS[cleanK]) return TRANSLATION_FALLBACKS[cleanK];

  let normalizedInput = cleanK
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (let mapping of KNOWN_AYAH_MAPPINGS) {
    for (let key of mapping.keys) {
      if (normalizedInput.includes(key)) return mapping.ar;
    }
  }
  return cleanK;
};

const Search = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const keyword = query.get("q") || "";

  const [activeTab, setActiveTab] = useState("quran");
  const [quranResults, setQuranResults] = useState([]);
  const [hadithResults, setHadithResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  // FILTER STATES
  const [selectedSurah, setSelectedSurah] = useState("");
  const [startAyah, setStartAyah] = useState("");
  const [endAyah, setEndAyah] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all"); // all | ar | en
  const [hadithBook, setHadithBook] = useState("");
  const [hadithGrade, setHadithGrade] = useState("");

  const HADITH_API_KEY =
    "$2y$10$d4nL2E660zHHBrwTB7Bviu3WvW5sToLRBWFbJ1yhn7rJzSuNpA0S";

  const highlightText = useCallback((text, target) => {
    if (!text || !target || !target.trim()) return text;
    const normalize = (str) =>
      str
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u0671]/g, "")
        .replace(/[إأآاٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .toLowerCase()
        .trim();
    try {
      if (!/[\u0600-\u06FF]/.test(text)) {
        const regex = new RegExp(
          `(${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
          "gi",
        );
        const parts = text.split(regex);
        return parts.map((part, i) =>
          regex.test(part) ? (
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
      let cleanTarget = normalize(target);
      const diacritics =
        "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0610-\\u061A\\u0671]*";
      const regexSource = cleanTarget
        .split("")
        .map((char) => {
          if (char === "ا") return "[اأإآٱ]" + diacritics;
          if (char === "ه") return "[ههة]" + diacritics;
          if (char === "ي") return "[ييى]" + diacritics;
          if (char === " ") return "\\s+";
          return char + diacritics;
        })
        .join("");
      const dynamicRegex = new RegExp(`(${regexSource})`, "g");
      const parts = text.split(dynamicRegex);
      return parts.map((part, i) =>
        dynamicRegex.test(part) ? (
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
    } catch (e) {
      return text;
    }
  }, []);

  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      setLoading(true);

      const arabicK = getArabicKeyword(keyword);
      const encodedK = encodeURIComponent(keyword);
      const encodedArabicK = encodeURIComponent(arabicK);

      const BOOKS = [
        "sahih-bukhari",
        "sahih-muslim",
        "tirmidhi",
        "abu-dawood",
        "ibn-e-majah",
        "sunan-nasai",
      ];

      try {
        // 🔥 FETCH HADITH FROM ALL BOOKS
        const hadithRequests = BOOKS.map((book) =>
          fetch(
            `https://hadithapi.com/api/hadiths?apiKey=${HADITH_API_KEY}&book=${book}&hadithEnglish=${encodedK}&paginate=20`,
          )
            .then((res) => res.json())
            .catch(() => null),
        );

        const hadithResponses = await Promise.all(hadithRequests);

        const allHadiths = hadithResponses.flatMap(
          (res) => res?.hadiths?.data || [],
        );

        // 🔥 REMOVE DUPLICATES
        const uniqueHadiths = Array.from(
          new Map(
            allHadiths.map((h) => [`${h.book?.bookSlug}-${h.hadithNumber}`, h]),
          ).values(),
        );

        setHadithResults(uniqueHadiths);

        // 🔥 QURAN SEARCH (UNCHANGED)
        const endpoints = [
          fetch(`https://api.alquran.cloud/v1/search/${encodedK}/all/en.sahih`),
          fetch(
            `https://api.alquran.cloud/v1/search/${encodedArabicK}/all/quran-simple-clean`,
          ),
          fetch(
            `https://api.alquran.cloud/v1/search/${encodedK}/all/ur.junagarhi`,
          ),
        ];

        const responses = await Promise.all(
          endpoints.map((p) => p.catch(() => null)),
        );

        const parseRes = async (res) => {
          if (res && res.ok) {
            try {
              return await res.json();
            } catch {
              return null;
            }
          }
          return null;
        };

        const [enData, arData, urData] = await Promise.all(
          responses.map(parseRes),
        );

        const mergedMap = new Map();

        [enData, arData, urData].forEach((dataset) => {
          if (dataset?.data?.matches) {
            dataset.data.matches.forEach((m) => {
              if (!mergedMap.has(m.number)) {
                mergedMap.set(m.number, m);
              }
            });
          }
        });

        setQuranResults(Array.from(mergedMap.values()));
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword]);

  // APPLY FILTERS
  const filteredData =
    activeTab === "quran"
      ? quranResults.filter((item) => {
          if (selectedSurah && item.surah.number != selectedSurah) return false;
          if (startAyah && item.numberInSurah < startAyah) return false;
          if (endAyah && item.numberInSurah > endAyah) return false;
          return true;
        })
      : hadithResults.filter((item) => {
          if (hadithBook && item.book?.bookSlug !== hadithBook) return false;
          if (hadithGrade && item.grade !== hadithGrade) return false;
          return true;
        });

  const totalPages = Math.ceil(filteredData.length / resultsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage,
  );

  return (
    <div className="max-w-5xl mx-auto p-4 min-h-[60vh]">
      <h2 className="text-2xl font-bold my-6 text-center text-[#1E3A5F]">
        Results for "{keyword}"
      </h2>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap gap-4 mb-4">
        {activeTab === "quran" && (
          <>
            <input
              type="number"
              placeholder="Start Ayah"
              value={startAyah}
              onChange={(e) => setStartAyah(e.target.value)}
              className="border rounded px-2 py-1 w-33"
            />
            <input
              type="number"
              placeholder="End Ayah"
              value={endAyah}
              onChange={(e) => setEndAyah(e.target.value)}
              className="border rounded px-2 py-1 w-33"
            />
            <input
              type="number"
              placeholder="Surah Number"
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value)}
              className="border rounded px-2 py-1 w-40"
            />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All Languages</option>
              <option value="ar">Arabic</option>
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </>
        )}
        {activeTab === "hadith" && (
          <>
            <select
              value={hadithBook}
              onChange={(e) => setHadithBook(e.target.value)}
              className="border rounded px-2 py-1 w-48"
            >
              {HADITH_BOOK_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Grade"
              value={hadithGrade}
              onChange={(e) => setHadithGrade(e.target.value)}
              className="border rounded px-2 py-1 w-28"
            />
          </>
        )}
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

      {/* TABS */}
      <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("quran");
            setCurrentPage(1);
          }}
          className={`pb-2 px-4 ${activeTab === "quran" ? "border-b-2 border-green-600 font-bold text-green-700" : "text-gray-400"}`}
        >
          Quran ({quranResults.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("hadith");
            setCurrentPage(1);
          }}
          className={`pb-2 px-4 ${activeTab === "hadith" ? "border-b-2 border-blue-600 font-bold text-blue-700" : "text-gray-400"}`}
        >
          Hadith ({hadithResults.length})
        </button>
      </div>

      {/* RESULTS */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-green-600 font-medium">
            Searching...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No results found for "{keyword}".
          </div>
        ) : (
          <>
            {paginatedData.map((item, idx) => (
              <ResultCard
                key={`${activeTab}-${idx}`}
                item={item}
                type={activeTab}
                highlight={highlightText}
                keyword={keyword}
                languageFilter={languageFilter}
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
  highlight,
  keyword,
  languageFilter,
  navigate,
}) => {
  const [data, setData] = useState({ ar: "", en: "" });
  const [loading, setLoading] = useState(type === "quran");
  useEffect(() => {
    if (type !== "quran") return;
    const fetchFullData = async () => {
      try {
        const [arRes, enRes, urRes] = await Promise.all([
          fetch(
            `https://api.alquran.cloud/v1/ayah/${item.number}/quran-uthmani`,
          ),
          fetch(`https://api.alquran.cloud/v1/ayah/${item.number}/en.sahih`),
          fetch(
            `https://api.alquran.cloud/v1/ayah/${item.number}/ur.junagarhi`,
          ),
        ]);
        const ar = await arRes.json();
        const en = await enRes.json();
        const ur = await urRes.json();
        setData({ ar: ar.data.text, en: en.data.text, ur: ur.data.text });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, [item.number, type]);

  const arabicKeyword = getArabicKeyword(keyword);

  if (type === "quran") {
    return (
      <div
        onClick={() =>
          navigate(`/surah/${item.surah.number}?ayah=${item.numberInSurah}`)
        }
        className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-600 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="text-xs font-bold text-green-700 uppercase mb-4">
          {item.surah.englishName} • {item.surah.number}:{item.numberInSurah}
        </div>
        {loading ? (
          <div className="h-20 bg-gray-50 animate-pulse rounded" />
        ) : (
          <>
            {(languageFilter === "all" || languageFilter === "ar") && (
              <p
                className="text-right font-arabic text-3xl mb-6 leading-[2.5]"
                dir="rtl"
              >
                {highlight(data.ar, arabicKeyword)}
              </p>
            )}
            {(languageFilter === "all" || languageFilter === "en") && (
              <p className="text-gray-700 italic border-t pt-4">
                {highlight(data.en, keyword)}
              </p>
            )}
            {(languageFilter === "all" || languageFilter === "ur") &&
              data.ur && (
                <p className="text-gray-800 italic border-t pt-4">
                  {highlight(data.ur, keyword)}
                </p>
              )}
          </>
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

          // 🔥 Call your backend to get chapter number
          const res = await fetch(
            `http://127.0.0.1:8000/api/hadith/get-hadith/?book=${bookSlug}&hadith=${item.hadithNumber}`,
          );
          const data = await res.json();

          const chapterNo = data?.chapterNumber ?? 0;

          navigate(
            `/hadith/${bookSlug}/${chapterNo}?hadith=${item.hadithNumber}&book=${bookSlug}`,
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

      <p className="text-gray-700 mb-4 text-lg">
        {highlight(item.hadithEnglish, keyword)}
      </p>

      {item.hadithArabic && (
        <p
          className="text-right font-arabic text-2xl text-gray-600 leading-loose"
          dir="rtl"
        >
          {highlight(item.hadithArabic, arabicKeyword)}
        </p>
      )}
    </div>
  );
};

export default Search;
