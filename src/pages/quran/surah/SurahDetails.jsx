import { useParams } from "react-router-dom";
import useSurah from "../../../hooks/useSurah";
import VerseCard from "./VerseCard";
import ShimmerLoader from "./SurahShimmer";
import { useLanguage } from "../../../context/LanguageContext";

const SurahDetails = () => {
  const { t } = useLanguage();
  const { surahNumber } = useParams();

  const { surahDetails, verses, wordTimings, audioByQari, selectedQari, loadingDetails, loadingVerses, error } =
    useSurah(surahNumber);

  if (loadingDetails || loadingVerses) return <ShimmerLoader />;

  if (error) {
    return <p className="text-center text-red-500 py-6 text-lg">{error}</p>;
  }

  return (
    <div className="container mx-auto px-6 md:px-20 py-12">
      <div className="text-center mb-6">
        <p className="text-3xl text-blue-600 font-semibold">
          <span className="font-surah-name" aria-label={surahDetails.name}>
            {`surah${String(surahNumber).padStart(3, "0")}`}
          </span>
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mt-4">
          {t(`surahNames.${surahNumber}`)}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          {surahDetails.revelationType} | {surahDetails.numberOfAyahs}{" "}
          {t("quranDetails.verses")}
        </p>
      </div>

      <VerseCard verses={verses} surahNo={surahNumber} wordTimings={wordTimings} audioByQari={audioByQari} selectedQari={selectedQari} />
    </div>
  );
};

export default SurahDetails;
