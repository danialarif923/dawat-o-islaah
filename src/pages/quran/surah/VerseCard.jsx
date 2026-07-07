import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WordHighlightedAyah from "../WordHighlightedAyah";

const VerseCard = ({ verses = [], surahNo, wordTimings, audioByQari, selectedQari }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playingAyah, setPlayingAyah] = useState(null);

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
      <p className="text-center text-sm text-gray-500 mb-2">
        Click on an ayah for details
      </p>
      {verses.map((ayah) => {
        const isTarget = targetAyah === ayah.numberInSurah;
        const ayahNum = ayah.numberInSurah;
        const audioUrl = audioByQari?.[selectedQari]?.find(
          (a) => Number(a.ayah) === Number(ayahNum)
        )?.url;
        const isThisPlaying = playingAyah === ayahNum;

        const handleAyahClick = () => {
          navigate(`/surah/${surahNo}/ayah/${ayahNum}`);
        };

        return (
          <div
            id={`ayah-${ayahNum}`}
            key={ayahNum}
            className={`bg-white shadow-lg rounded-lg p-6 md:px-8 relative border-2 transition-all hover:shadow-xl hover:border-emerald-400 ${
              isTarget
                ? "border-green-600 bg-green-50"
                : "border-neutral-200"
            } ${isThisPlaying ? "border-emerald-500" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">
                {surahNo}:{ayahNum}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisPlaying) {
                      setPlayingAyah(null);
                    } else {
                      setPlayingAyah(ayahNum);
                    }
                  }}
                  disabled={!audioUrl}
                  className={`text-xs px-3 py-1 rounded font-medium ${
                    audioUrl
                      ? isThisPlaying
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isThisPlaying ? "Stop" : audioUrl ? "Play" : "No audio"}
                </button>
                <button
                  onClick={handleAyahClick}
                  className="text-xs text-gray-400 hover:text-emerald-600 underline"
                >
                  Details
                </button>
              </div>
            </div>

            {isThisPlaying && wordTimings ? (
              <WordHighlightedAyah
                ayahText={ayah.text}
                ayahNumber={ayahNum}
                wordTimings={wordTimings}
                audioUrl={audioUrl}
                onPlayStateChange={(playing) => {
                  if (!playing) setPlayingAyah(null);
                }}
              />
            ) : (
              <div
                onClick={handleAyahClick}
                className="cursor-pointer"
              >
                <div
                  className="text-5xl text-center my-10 leading-relaxed font-quran whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: ayah.text.replace(/<\/?p[^>]*>/g, ""),
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VerseCard;
