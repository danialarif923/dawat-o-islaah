import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import useHadiths from "../../hooks/useHadiths";
import HadithCard from "./HadithCard";
import ShimmerLoader from "../../components/AppComponents/Hadith/ShimmerLoader";
import { useLanguage } from "../../context/LanguageContext";
import localApiClient from "../../api/hadithApi";

const HadithList = () => {
  const { t, language } = useLanguage();
  const { bookSlug, chapterNo } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const targetHadith = query.get("hadith");

  const {
    hadiths,
    loading,
    error,
    loadMore,
    currentPage,
    totalPages,
    isFetchingMore,
  } = useHadiths();

  const [extraHadith, setExtraHadith] = useState(null);

  useEffect(() => {
    if (!targetHadith || loading || hadiths.length === 0) return;

    const isLoaded = hadiths.some(
      (h) => String(h.hadithNumber) === String(targetHadith)
    );

    if (!isLoaded) {
      localApiClient
        .get("get-hadith/", {
          params: { book: bookSlug, hadith: targetHadith },
        })
        .then((res) => {
          const data = res.data;
          const hadithData =
            data?.hadiths?.data?.[0] ??
            data?.hadith?.data ??
            data?.hadith;
          if (hadithData) {
            setExtraHadith(hadithData);
          }
        })
        .catch(() => {});
    } else {
      setExtraHadith(null);
    }
  }, [targetHadith, loading, hadiths, bookSlug]);

  const displayHadiths = extraHadith
    ? [extraHadith, ...hadiths.filter(
        (h) => String(h.hadithNumber) !== String(targetHadith)
      )]
    : hadiths;

  if (loading && currentPage === 1 && !extraHadith) return <ShimmerLoader />;
  if (error) return <p className="text-center text-red-600 my-6">{error}</p>;
  if (!displayHadiths.length) return <p className="text-center text-gray-500 my-6">No hadiths found.</p>;

  return (
    <div className="container mx-auto px-4 md:px-20 py-6">
      <Link
        to={`/hadith/${bookSlug}`}
        className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
      >
        &larr; {language === "ur" ? "واپس" : "Back"}
      </Link>
      <h2 className="text-2xl font-bold text-center mb-6">
        {t("hadithList.title")} {t(`hadithBookNames.${bookSlug}`) || bookSlug.replace("-", " ")} -{" "}
        {t("hadithList.chapter")} {chapterNo}
      </h2>
      {hadiths[0]?.chapter?.chapterEnglish && (
        <div className="text-center mb-6">
          {hadiths[0]?.chapter?.chapterArabic && (
            <p className="text-2xl font-hadith text-gray-700 mb-2 leading-loose" dir="rtl">
              {hadiths[0].chapter.chapterArabic}
            </p>
          )}
          <h2 className="text-3xl font-bold text-blue-900">
            &#34; {language === "ur" ? (() => { const n = t(`hadithChapterNames.${bookSlug}.${hadiths[0].chapter.chapterNumber}`); return n && !n.startsWith("hadithChapterNames.") ? n : hadiths[0].chapter.chapterEnglish || `Chapter ${hadiths[0].chapter.chapterNumber}`; })() : hadiths[0].chapter.chapterEnglish || `Chapter ${hadiths[0].chapter.chapterNumber}`} &#34;
          </h2>
          {hadiths[0]?.chapter?.chapterUrdu && (
            <p className="text-[1.5rem] text-gray-600 mt-1" dir="rtl">
              {hadiths[0].chapter.chapterUrdu}
            </p>
          )}
        </div>
      )}
      <div>
        {displayHadiths.map((hadith, index) => (
          <HadithCard
            key={`${hadith.bookSlug}-${hadith.hadithNumber}-${index}`}
            hadith={hadith}
          />
        ))}
      </div>

      {currentPage < totalPages && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 cursor-pointer leading-10"
            disabled={isFetchingMore}
          >
            {isFetchingMore ? (
              <div className="flex justify-center items-center">
                <div className="w-5 h-5 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin "></div>
              </div>
            ) : (
              t("hadithList.loadMore")
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default HadithList;
