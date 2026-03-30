import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation } from "react-router-dom";

const HadithCard = ({ hadith }) => {
  const { t } = useLanguage();
  const [showFull, setShowFull] = useState(false);
  const isTruncated = hadith?.hadithEnglish?.length > 250;

  // ✅ GET QUERY PARAMS
  const query = new URLSearchParams(useLocation().search);
  const targetHadith = query.get("hadith");
  const targetBook = query.get("book");

  // ✅ CHECK IF THIS CARD SHOULD BE HIGHLIGHTED
  const isActive =
    String(hadith?.hadithNumber) === String(targetHadith) &&
    String(hadith?.bookSlug) === String(targetBook);

  // ✅ SCROLL INTO VIEW
  const cardRef = useRef(null);
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  return (
    <div
      ref={isActive ? cardRef : null}
      className={`p-6 rounded-lg shadow-md mb-4 transition-all border-l-4 ${
        isActive
          ? "bg-green-50 border-l-green-600 ring-2 ring-green-300"
          : "bg-white border-l-blue-600"
      }`}
    >
      <div className="flex justify-between gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex-1 leading-8">
          {hadith?.chapter?.chapterEnglish} {hadith?.headingEnglish && " - "}{" "}
          {hadith?.headingEnglish}
        </h3>
        <p className="text-gray-500 text-3xl pb-4 font-hadith flex-1 text-end">
          {hadith?.headingArabic}
        </p>
      </div>

      <div className="text-end">
        <p className="text-gray-600 text-lg leading-12">
          {hadith?.headingUrdu}
        </p>

        <p
          className={`text-green-600 leading-12 text-3xl font-hadith mt-2 ${
            showFull || !isTruncated ? "block" : "line-clamp-3"
          }`}
        >
          {hadith?.hadithArabic}
        </p>

        <p
          className={`text-lg leading-12 pt-2 ${
            showFull || !isTruncated ? "block" : "line-clamp-3"
          }`}
        >
          {hadith?.hadithUrdu}
        </p>
      </div>

      <p
        className={`text-gray-800 pt-2 leading-12 ${
          showFull || !isTruncated ? "block" : "line-clamp-3"
        }`}
      >
        {hadith?.hadithEnglish}
      </p>

      {isTruncated && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-blue-500 text-sm mt-2 underline"
        >
          {showFull ? t("hadithCard.showLess") : t("hadithCard.showMore")}
        </button>
      )}

      <div className="mt-2 text-sm text-gray-500 flex justify-between">
        <span>
          {t("hadithCard.hadithNumber")}: {hadith?.hadithNumber}
        </span>
        <span>
          {t("hadithCard.status")}:{" "}
          <span className="text-green-600">{hadith?.status}</span>
        </span>
      </div>
    </div>
  );
};

export default HadithCard;
