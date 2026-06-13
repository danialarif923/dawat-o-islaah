import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerseCard = ({ verses = [], surahNo }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const targetAyah = Number(query.get("ayah"));

  useEffect(() => {
    if (!targetAyah) return;
    setTimeout(() => {
      const element = document.getElementById(`ayah-${targetAyah}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 400);
  }, [targetAyah]);

  return (
    <div className="space-y-6">
      {verses.map((ayah) => {
        const isTarget = targetAyah === ayah.numberInSurah;
        return (
          <div
            id={`ayah-${ayah.numberInSurah}`}
            key={ayah.numberInSurah}
            onClick={() =>
              navigate(`/surah/${surahNo}/ayah/${ayah.numberInSurah}`)
            }
            className={`bg-white shadow-lg rounded-lg p-6 md:px-8 relative border-2 cursor-pointer transition-all hover:shadow-xl hover:border-emerald-400 ${
              isTarget
                ? "border-green-600 bg-green-50"
                : "border-neutral-200"
            }`}
          >
            <p className="absolute top-4 right-4 text-gray-500 text-sm">
              {surahNo}:{ayah.numberInSurah}
            </p>
            <div
              className="text-5xl text-center my-10 leading-relaxed font-quran whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: ayah.text.replace(/<\/?p[^>]*>/g, ""),
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VerseCard;
