import { useParams } from "react-router-dom";
import useHadithChapters from "../../hooks/useHadithChapters";
import ChapterCard from "./ChapterCard";
import ShimmerLoader from "../../components/AppComponents/Hadith/ShimmerLoader";
import { useLanguage } from "../../context/LanguageContext";

const HadithBookChapters = () => {
  const { t } = useLanguage();
  const { bookSlug } = useParams();
  const { chapters, loading, error } = useHadithChapters();

  if (loading) return <ShimmerLoader />;

  if (error)
    return (
      <p className="text-center text-red-500 mt-6">
        {t("hadithBookChapters.error")}: {error}
      </p>
    );

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 md:px-16">
      <h2 className="text-4xl font-bold text-center mb-10 capitalize">
        Chapters of {bookSlug.replace("-", " ")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {chapters
          .sort((a, b) => a.chapterNumber - b.chapterNumber)
          .map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
      </div>
    </div>
  );
};

export default HadithBookChapters;
