import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import ur from "../../../assets/languages/ur.json";

function getUrduName(bookSlug, chapterNumber) {
  return ur?.hadithChapterNames?.[bookSlug]?.[String(chapterNumber)];
}

const ChapterCard = ({ chapter }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const chapterNum = chapter.chapterNumber;
  const urduName = chapter.chapterUrdu || getUrduName(chapter.bookSlug, chapterNum);

  return (
    <div
      onClick={() =>
        navigate(`/hadith/${chapter.bookSlug}/${chapterNum}`)
      }
      className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start gap-4">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <h3 className={`${language === "ur" ? "text-[1.5rem]" : "text-xl"} font-semibold text-blue-600 leading-snug`}>
            {chapterNum}. {language === "ur" ? (() => { const n = t(`hadithChapterNames.${chapter.bookSlug}.${chapterNum}`); return n && !n.startsWith("hadithChapterNames.") ? n : chapter.chapterEnglish || `Chapter ${chapterNum}`; })() : chapter.chapterEnglish || `Chapter ${chapterNum}`}
          </h3>

          {language === "en" && urduName && (
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              {urduName}
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
              {chapter.chapterEnglish || `Chapter ${chapterNum}`}
            </p>
          ) : (
            urduName && (
              <p className="text-md text-gray-500 mt-2 leading-relaxed">
                {urduName}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
