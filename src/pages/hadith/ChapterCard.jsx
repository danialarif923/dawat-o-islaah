import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import ur from "../../../assets/languages/ur.json";

function getUrduName(bookSlug, chapterNumber) {
  return chapterNumber != null
    ? ur?.hadithChapterNames?.[bookSlug]?.[String(Number(chapterNumber) + 1)]
    : undefined;
}

function getTranslationLabel(t, bookSlug, chapterNumber) {
  const key = `hadithChapterNames.${bookSlug}.${Number(chapterNumber) + 1}`;
  const val = t(key);
  return val && !val.startsWith("hadithChapterNames.") ? val : undefined;
}

const ChapterCard = ({ chapter }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const chapterNum = chapter.chapterNumber;
  const urduName = chapter.chapterUrdu || getUrduName(chapter.bookSlug, chapterNum);
  const displayChapter = Number(chapterNum) + 1;

  return (
    <div
      onClick={() =>
        navigate(`/hadith/${chapter.bookSlug}/${chapterNum}`)
      }
      className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start gap-4">
        {/* LEFT — blue chapter name */}
        <div className="flex-1">
          {language === "ur" ? (
            <h3 className="text-[1.5rem] font-semibold text-blue-600 leading-snug">
              {displayChapter}. {getTranslationLabel(t, chapter.bookSlug, chapterNum) || chapter.chapterEnglish || `Chapter ${displayChapter}`}
            </h3>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-blue-600 leading-snug">
                {displayChapter}. {chapter.chapterEnglish || `Chapter ${displayChapter}`}
              </h3>
              {urduName && (
                <p className="text-[1.3rem] text-gray-500 mt-4 leading-relaxed">
                  {urduName}
                </p>
              )}
            </>
          )}
        </div>

        {/* RIGHT — Arabic + English (left-aligned) */}
        <div className="flex-1">
          <p className="text-2xl font-bold font-hadith text-gray-700 leading-loose">
            {chapter.chapterArabic || "—"}
          </p>
          {language === "ur" && (
            <p className="text-[1.25rem] text-gray-500 mt-2 leading-relaxed">
              {chapter.chapterEnglish || `Chapter ${displayChapter}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
