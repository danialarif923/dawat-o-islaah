import { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext";
import { useLocation } from "react-router-dom";

/* Shimmer */
const ShimmerLoader = () => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-300 rounded"></div>
    ))}
  </div>
);

const VerseCard = ({
  verses = [],
  translations = { en: {}, ur: {} },
  audioLinks = [],
  surahNo,

  /* Tafsir */
  tafsirEnabled,
  selectedTafsir,
  tafseerByAyah,

  /* Translation */
  isTranslation,
  selectedEnglish = [],
  selectedUrdu = [],
}) => {
  const { t } = useLanguage();
  const location = useLocation();

  /* =====================
      TARGET AYAH FROM URL
  ===================== */
  const query = new URLSearchParams(location.search);
  const targetAyah = Number(query.get("ayah"));

  /* =====================
      AUDIO
  ===================== */
  const audioRef = useRef(null);
  const [playingAyah, setPlayingAyah] = useState(null);

  /* =====================
      TAFSIR EXPAND
  ===================== */
  const [expandedTafsir, setExpandedTafsir] = useState({});

  /* =====================
      SCROLL TO AYAH
  ===================== */
  useEffect(() => {
    if (!targetAyah) return;

    setTimeout(() => {
      const element = document.getElementById(`ayah-${targetAyah}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 400);
  }, [targetAyah]);

  const formatTafsirContent = (text) => {
    if (!text) return "";

    return text
      .replace(
        /\{([^\}]+)\}/g,
        '<span class="text-emerald-600 font-semibold font-quran">$1</span>'
      )
      .replace(
        /«([^»]+)»/g,
        '<span class="text-blue-600 font-medium">$1</span>'
      )
      .replace(
        /\[([^\]]+)\]/g,
        '<span class="text-red-600 font-bold">[$1]</span>'
      )
      .replace(
        /([➊-➓])/g,
        '<span class="font-bold text-gray-900 mx-1">$1</span>'
      );
  };

  /* =====================
      PLAY AUDIO
  ===================== */
  const playAudio = (ayahNumber) => {
    if (!audioLinks.length) return;

    const audioObj = audioLinks.find(
      (a) => Number(a.ayah) === Number(ayahNumber)
    );

    if (!audioObj?.url) return;

    if (playingAyah === ayahNumber && audioRef.current) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(audioObj.url);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
    });

    setPlayingAyah(ayahNumber);

    audio.onended = () => setPlayingAyah(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  /* =====================
      RENDER
  ===================== */
  return (
    <div className="space-y-6">
      {verses.map((ayah) => {
        const isTarget = targetAyah === ayah.numberInSurah;

        return (
          <div
            id={`ayah-${ayah.numberInSurah}`}
            key={ayah.numberInSurah}
            className={`bg-white shadow-lg rounded-lg p-6 md:px-8 relative border-2 ${
              isTarget
                ? "border-green-600 bg-green-50"
                : "border-neutral-200"
            }`}
          >
            {/* Play */}
            <button
              onClick={() => playAudio(ayah.numberInSurah)}
              className="absolute top-4 left-4 text-gray-600 flex gap-2 items-center"
            >
              {playingAyah === ayah.numberInSurah ? <FaPause /> : <FaPlay />}

              <span className="text-sm">
                {playingAyah === ayah.numberInSurah
                  ? t("quranDetails.pauseVerse")
                  : t("quranDetails.playVerse")}
              </span>
            </button>

            {/* Ayah Number */}
            <p className="absolute top-4 right-4 text-gray-500 text-sm">
              {surahNo}:{ayah.numberInSurah}
            </p>

            {/* Arabic - Using Dynamic Font Class */}
            <p className="text-5xl text-center my-10 leading-relaxed font-quran">
              {ayah.text}
            </p>

            {/* TRANSLATIONS */}
            {isTranslation && (
              <div className="grid md:grid-cols-2 gap-6 mt-6 border-t pt-6">
                {/* English */}
                <div>
                  {selectedEnglish.map((author) => {
                    const name = String(author?.name || author).trim();
                    const list = translations.en
                      ? Object.values(translations.en).flat().filter((t) => t.author === name)
                      : [];
                    const tr = list.find((t) => Number(t.ayah) === ayah.numberInSurah);

                    if (!tr) return null;

                    return (
                      <div key={`${name}-${ayah.numberInSurah}`} className="mb-4">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">{name}</p>
                        <p
                          className="text-lg text-gray-700"
                          dangerouslySetInnerHTML={{ __html: tr.text }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Urdu */}
                <div className="text-right">
                  {selectedUrdu.map((author) => {
                    const name = String(author?.name || author).trim();
                    const list = translations.ur
                      ? Object.values(translations.ur).flat().filter((t) => t.author === name)
                      : [];
                    const tr = list.find((t) => Number(t.ayah) === ayah.numberInSurah);

                    if (!tr) return null;

                    return (
                      <div key={`${name}-${ayah.numberInSurah}`} className="mb-4">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">{name}</p>
                        <p
                          className="text-2xl leading-relaxed font-urdu"
                          style={{ direction: "rtl" }}
                          dangerouslySetInnerHTML={{ __html: tr.text }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAFSIR */}
            {tafsirEnabled && selectedTafsir && (
              <div className="mt-6 border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-800 mb-2 font-bold">
                  {selectedTafsir} — Tafsir
                </p>

                {(() => {
                  const rawTafsir = tafseerByAyah?.[ayah.numberInSurah] || "";

                  if (!rawTafsir) {
                    return (
                      <p className="text-gray-400 italic">
                        {t("quranDetails.tafsirNotAvailable")}
                      </p>
                    );
                  }

                  const plainText = rawTafsir.replace(/<[^>]+>/g, "");
                  const isLong = plainText.length > 300;
                  const isExpanded = expandedTafsir[ayah.numberInSurah];

                  const formattedTafsir = formatTafsirContent(rawTafsir);
                  const previewFormatted = formatTafsirContent(rawTafsir.slice(0, 300)) + "...";

                  return (
                    <>
                      <div
                        className="text-xl leading-loose text-gray-800 text-right font-urdu"
                        style={{ direction: "rtl" }}
                        dangerouslySetInnerHTML={{
                          __html: isExpanded
                            ? formattedTafsir
                            : isLong
                            ? previewFormatted
                            : formattedTafsir,
                        }}
                      />

                      {isLong && (
                        <button
                          onClick={() =>
                            setExpandedTafsir((prev) => ({
                              ...prev,
                              [ayah.numberInSurah]: !prev[ayah.numberInSurah],
                            }))
                          }
                          className="mt-2 text-emerald-600 text-sm font-bold hover:underline"
                        >
                          {isExpanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VerseCard;