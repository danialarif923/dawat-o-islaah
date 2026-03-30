import { useEffect, useRef, useState } from "react";
import "../../../style/audioStyles.css";
import { useLanguage } from "../../context/LanguageContext";

const AudioPlayer = ({ audioFiles }) => {
  const { t } = useLanguage();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Load new audio when track changes
  useEffect(() => {
    if (audioFiles.length > 0 && audioRef.current) {
      audioRef.current.src = audioFiles[currentTrackIndex];

      //   console.log("audioPlayer useEffect");

      // If already playing, continue playback automatically
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Playback error:", error));
      }
    }
  }, [currentTrackIndex, audioFiles, isPlaying]);

  // Auto-play next track when current ends
  const handleEnded = () => {
    if (currentTrackIndex < audioFiles.length - 1) {
      setCurrentTrackIndex((prevIndex) => prevIndex + 1);
      setIsPlaying(true);
    } else {
      setCurrentTrackIndex(0); // Reset to first track
      setIsPlaying(false);
    }
  };

  // Update handlePlay to restart from the first track if it has ended
  const handlePlay = () => {
    if (audioRef.current) {
      if (currentTrackIndex === audioFiles.length - 1 && !isPlaying) {
        setCurrentTrackIndex(0); // Restart from first track
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < audioFiles.length - 1) {
      setCurrentTrackIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <div className="p-4 justify-center items-center flex flex-col">
      {audioFiles.length > 0 ? (
        <audio
          ref={audioRef}
          controls
          className="w-64 sm:w-96 custom-audio"
          controlsList="noplaybackrate"
          onEnded={handleEnded}
        >
          {t("audioPlayer.notSupported")}
        </audio>
      ) : (
        <p className="text-red-500">{t("audioPlayer.noAudio")}</p>
      )}
      <div className="mt-4 space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentTrackIndex === 0}
          className={`${
            currentTrackIndex === 0
              ? "bg-gray-500"
              : "bg-blue-900 cursor-pointer"
          } text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base w-20 sm:w-34 text-center`}
        >
          {t("audioPlayer.previous")}
        </button>
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          {t("audioPlayer.play")}
        </button>
        <button
          onClick={handlePause}
          disabled={!isPlaying}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          {t("audioPlayer.pause")}
        </button>
        <button
          onClick={handleNext}
          disabled={currentTrackIndex === audioFiles.length - 1}
          className={`${
            currentTrackIndex === audioFiles.length - 1
              ? "bg-gray-500"
              : "bg-blue-900 cursor-pointer"
          } text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base w-20 sm:w-34 text-center`}
        >
          {t("audioPlayer.next")}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
