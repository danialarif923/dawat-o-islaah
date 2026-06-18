import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation, useNavigate } from "react-router-dom";

const HadithCard = ({ hadith }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showFull, setShowFull] = useState(false);
  const isTruncated = hadith?.hadithEnglish?.length > 250;

  const query = new URLSearchParams(useLocation().search);
  const targetHadith = query.get("hadith");
  const targetBook = query.get("book");

  const isActive =
    String(hadith?.hadithNumber) === String(targetHadith) &&
    String(hadith?.bookSlug) === String(targetBook);

  const cardRef = useRef(null);
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive]);

  return (
    <div
      ref={isActive ? cardRef : null}
      onClick={() => navigate(`/hadith/${hadith.bookSlug}/${hadith.chapter.chapterNumber}/hadith/${hadith.hadithNumber}`)}
      className={`p-6 rounded-lg shadow-md mb-4 transition-all border-2 cursor-pointer hover:shadow-xl hover:border-emerald-400 ${
        isActive
          ? "border-green-600 bg-green-50 ring-2 ring-green-300"
          : "border-neutral-200"
      }`}
    >
      <div
        className={`text-green-600 leading-12 text-3xl font-quran mt-2 ${
          showFull || !isTruncated ? "block" : "line-clamp-3"
        }`}
        dangerouslySetInnerHTML={{ __html: hadith?.hadithArabic?.replace(/<\/?p[^>]*>/g, "") }}
      />

      <div
        className={`text-lg leading-12 pt-2 ${
          showFull || !isTruncated ? "block" : "line-clamp-3"
        }`}
        dangerouslySetInnerHTML={{ __html: hadith?.hadithUrdu?.replace(/<\/?p[^>]*>/g, "") }}
      />

      <div
        className={`text-gray-800 pt-2 leading-12 ${
          showFull || !isTruncated ? "block" : "line-clamp-3"
        }`}
        dangerouslySetInnerHTML={{ __html: hadith?.hadithEnglish?.replace(/<\/?p[^>]*>/g, "") }}
      />

      {isTruncated && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowFull(!showFull); }}
          className="text-blue-500 text-sm mt-2 underline cursor-pointer"
        >
          {showFull ? t("hadithCard.showLess") : t("hadithCard.showMore")}
        </button>
      )}
    </div>
  );
};

export default HadithCard;
