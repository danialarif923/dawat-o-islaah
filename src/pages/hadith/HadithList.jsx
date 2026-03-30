import React from "react";
import { useParams } from "react-router-dom";
import useHadiths from "../../hooks/useHadiths";
import HadithCard from "./HadithCard";
import ShimmerLoader from "../../components/AppComponents/Hadith/ShimmerLoader";
import { useLanguage } from "../../context/LanguageContext";

const HadithList = () => {
  const { t } = useLanguage();
  const { bookSlug, chapterNo } = useParams();
  const {
    hadiths,
    loading,
    error,
    loadMore,
    currentPage,
    totalPages,
    isFetchingMore,
  } = useHadiths();

  if (loading && currentPage === 1) return <ShimmerLoader />;
  if (error) return <p className="text-center text-red-600 my-6">{error}</p>;

  // console.log("hadiths data", hadiths);

  return (
    <div className="container mx-auto px-4 md:px-20 py-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t("hadithList.title")} {bookSlug.replace("-", " ")} -{" "}
        {t("hadithList.chapter")} {chapterNo}
      </h2>
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">
        &#34; {hadiths[0]?.chapter?.chapterEnglish} &#34;
      </h2>
      <div>
        {hadiths.map((hadith, index) => (
          <HadithCard
            // Combining values creates a much more reliable unique string
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
