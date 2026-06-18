import { useParams } from "react-router-dom";
import useJuz from "../../../hooks/useJuz";
import VerseCard from "../surah/VerseCard";
import ShimmerLoader from "../surah/SurahShimmer";
import allJuzData from "../../../../assets/juzData.json";
import { useLanguage } from "../../../context/LanguageContext";

const JuzDetails = () => {
  const { t } = useLanguage();
  const { juzNumber } = useParams();
  const juzData = allJuzData.juz[juzNumber - 1];

  const { juzDetails, verses, loadingDetails, loadingVerses, error } = useJuz(juzNumber, juzData);

  if (loadingDetails || loadingVerses) return <ShimmerLoader />;
  if (error)
    return <p className="text-center text-red-500 py-6 text-lg">{error}</p>;

  return (
    <div className="container mx-auto px-6 md:px-20 py-12">
      <div className="text-center mb-0">
        <h1 className="text-3xl md:text-4xl font-bold">
          {juzData.juz_name_en}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          {t(`surahNames.${juzData.start_surah_number}`)} - {t(`surahNames.${juzData.end_surah_number}`)} | {juzData.total_ayahs}{" "}
          {t("quranDetails.verses")}
        </p>
        <p className="text-3xl text-blue-600 font-bold mt-6 font-quran">
          {juzData.juz_name_ar}
        </p>
      </div>

      {loadingVerses ? (
        <ShimmerLoader />
      ) : (
        <VerseCard verses={verses} surahNo={juzDetails.number} />
      )}
    </div>
  );
};

export default JuzDetails;
