import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const ChapterCard = ({ chapter }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <div
      onClick={() =>
        navigate(`/hadith/${chapter.bookSlug}/${chapter.chapterNumber}`)
      }
      className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start gap-4">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <h3 className={`${language === "ur" ? "text-[1.5rem]" : "text-xl"} font-semibold text-blue-600 leading-snug`}>
            {chapter.chapterNumber}. {language === "ur" ? (() => { const n = t(`hadithChapterNames.${chapter.bookSlug}.${chapter.chapterNumber}`); return n && !n.startsWith("hadithChapterNames.") ? n : chapter.chapterEnglish || `Chapter ${chapter.chapterNumber}`; })() : chapter.chapterEnglish || `Chapter ${chapter.chapterNumber}`}
          </h3>

          {language === "en" && (
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              {chapter.chapterUrdu || t(`hadithChapterNames.${chapter.bookSlug}.${chapter.chapterNumber}`) || chapter.chapterEnglish}
            </p>
          )}
        </div>

        {/* RIGHT SIDE (ARABIC & SECONDARY) */}
        <div className="flex-1 text-right">
          <p className="text-2xl font-bold font-hadith text-gray-700 leading-loose">
            {chapter.chapterArabic || "—"}
          </p>

          {language === "ur" ? (
            <p className="text-md text-gray-500 mt-2 leading-relaxed">
              {chapter.chapterEnglish || `Chapter ${chapter.chapterNumber}`}
            </p>
          ) : (
            chapter.chapterUrdu && (
              <p className="text-md text-gray-500 mt-2 leading-relaxed">
                {chapter.chapterUrdu}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
