import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation } from "react-router-dom";

const STATUS_URDU = {
  Sahih: "صحیح",
  Hasan: "حسن",
  "Da'if": "ضعیف",
  "Maudu'": "موضوع",
  "Marfu'": "مرفوع",
  Mawquf: "موقوف",
  "Maqtu'": "مقطوع",
  Mutawatir: "متواتر",
  Ahad: "آحاد",
};

const getBaabName = (h, lang) => {
  const sources = [
    h?.baab, h?.chapter?.baab, h?.baab_name, h?.chapter?.baab_name,
  ];
  for (const src of sources) {
    if (!src) continue;
    const name = lang === "ur" ? (src.nameUrdu || src.name_urdu) : (src.nameEnglish || src.name_english);
    if (name) return name;
  }
  if (lang === "ur" && h?.baab_name_urdu) return h.baab_name_urdu;
  if (lang === "en" && h?.baab_name_english) return h.baab_name_english;
  if (lang === "ur" && h?.chapter?.baab_name_urdu) return h.chapter.baab_name_urdu;
  if (lang === "en" && h?.chapter?.baab_name_english) return h.chapter.baab_name_english;
  return null;
};

const urduRegex = new RegExp("[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]");

const HadithCard = ({ hadith }) => {
  const { t, language } = useLanguage();
  const [showFull, setShowFull] = useState(false);
  const isTruncated = hadith?.hadithEnglish?.length > 250;

  const cleanDetailed = hadith?.detailedExplanation?.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
  const detailedHasUrdu = cleanDetailed && urduRegex.test(cleanDetailed);

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
      <div className={`flex justify-between gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}>
        <h3 className={`text-lg font-bold text-gray-900 flex-1 leading-8 ${language === "ur" ? "text-end" : ""}`}>
          {language === "ur" ? t(`hadithChapterNames.${hadith.bookSlug}.${hadith.chapter.chapterNumber}`) || hadith?.chapter?.chapterEnglish : hadith?.chapter?.chapterEnglish}
          {getBaabName(hadith, language) && (
            <span className="text-green-700 ml-2">
              - {getBaabName(hadith, language)}
            </span>
          )}
          {hadith?.headingEnglish && " - "}{" "}
          {hadith?.headingEnglish}
        </h3>
        <p className="text-gray-500 text-3xl pb-4 font-quran flex-1 text-end">
          {hadith?.headingArabic}
        </p>
      </div>

      {/* Chapter Urdu & Arabic */}
      <div className={`flex justify-between items-center mt-1 mb-2 ${language === "ur" ? "flex-row-reverse" : ""}`}>
        {hadith?.chapter?.chapterArabic && (
          <p className="text-xl font-quran text-gray-600 leading-8">
            {hadith.chapter.chapterArabic}
          </p>
        )}
        {hadith?.chapter?.chapterUrdu && hadith.chapter.chapterUrdu !== hadith.chapter.chapterEnglish && (
          <p className="text-md text-gray-500 leading-8">
            {hadith.chapter.chapterUrdu}
          </p>
        )}
      </div>

      <div className="text-end">
        {hadith?.headingUrdu && (
          <p className="text-gray-600 text-lg leading-12">
            {hadith?.headingUrdu}
          </p>
        )}

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
      </div>

      <div
        className={`text-gray-800 pt-2 leading-12 ${
          showFull || !isTruncated ? "block" : "line-clamp-3"
        }`}
        dangerouslySetInnerHTML={{ __html: hadith?.hadithEnglish?.replace(/<\/?p[^>]*>/g, "") }}
      />

      {isTruncated && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-blue-500 text-sm mt-2 underline"
        >
          {showFull ? t("hadithCard.showLess") : t("hadithCard.showMore")}
        </button>
      )}

      {hadith?.reference && (() => {
        const cleanRef = hadith.reference.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
        const hasUrdu = urduRegex.test(cleanRef);
        return (
          <div className="mt-2 text-sm text-gray-500">
            <div className={`font-semibold ${language === "ur" ? "text-right" : ""}`}>
              {language === "ur" ? "حوالہ" : t("hadithCard.reference")}
            </div>
            <div
              className={`text-gray-400 italic leading-8 mt-1 ${hasUrdu ? "text-right" : ""}`}
              dir={hasUrdu ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: hadith?.reference?.replace(/<\/?p[^>]*>/g, "") }}
            />
          </div>
        );
      })()}
      {hadith?.detailedExplanation && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className={`text-sm font-semibold text-gray-700 mb-1 ${language === "ur" ? "text-right" : ""}`}>
            {language === "ur" ? "شرح" : "Detailed Explanation:"}
          </h4>
          <div
            className={`text-sm text-gray-600 leading-8 ${detailedHasUrdu ? "text-right" : ""}`}
            dir={detailedHasUrdu ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{
              __html: hadith.detailedExplanation?.replace(/<\/?p[^>]*>/g, ""),
            }}
          />
        </div>
      )}
      {hadith?.status && (
        <div className="mt-2 text-sm text-gray-500">
          <span className="font-semibold">{language === "ur" ? "حالت" : "Status:"}</span>{" "}
           <span className={hadith.status === "Sahih" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
            {language === "ur" ? (STATUS_URDU[hadith.status] || hadith.status) : hadith.status}
          </span>
        </div>
      )}
      <div className="mt-1 text-sm text-gray-500 text-end">
        <span>
          {t("hadithCard.hadithNumber")}: {hadith?.hadithNumber}
        </span>
      </div>
    </div>
  );
};

export default HadithCard;
