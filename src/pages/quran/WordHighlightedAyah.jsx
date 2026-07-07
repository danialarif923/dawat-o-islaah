import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const WordHighlightedAyah = ({
  ayahText,
  ayahNumber,
  wordTimings,
  audioUrl,
  onPlayStateChange,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);

  const timings = wordTimings?.[String(ayahNumber)] || [];

  const words = ayahText
    .replace(/<\/?p[^>]*>/g, "")
    .trim()
    .split(/\s+/);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentWordIdx(-1);
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!audioRef.current || !timings.length) return;
    const currentMs = audioRef.current.currentTime * 1000;

    let found = -1;
    for (const t of timings) {
      if (currentMs >= t.start_ms && currentMs < t.end_ms) {
        found = t.word_index;
        break;
      }
    }
    setCurrentWordIdx(found);
  };

  const togglePlay = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(console.error);
    }
    setIsPlaying(true);
    onPlayStateChange?.(true);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentWordIdx(-1);
      onPlayStateChange?.(false);
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef.current]);

  return (
    <div className="relative">
      <div className="text-5xl text-center leading-relaxed font-quran whitespace-pre-wrap">
        {words.map((word, idx) => {
          const wordNum = idx + 1;
          const isHighlighted = wordNum === currentWordIdx;
          return (
            <span
              key={idx}
              className={`transition-colors duration-150 ${
                isHighlighted
                  ? "text-yellow-600 bg-yellow-100 rounded px-0.5"
                  : ""
              }`}
            >
              {word}{" "}
            </span>
          );
        })}
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
      />
      <button
        onClick={togglePlay}
        disabled={!audioUrl}
        className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded font-medium text-sm ${
          audioUrl
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
        {isPlaying ? "Pause" : "Play with highlights"}
      </button>
    </div>
  );
};

export default WordHighlightedAyah;
