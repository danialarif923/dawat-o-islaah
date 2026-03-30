import { useState, useEffect } from "react";
import apiClient from "../api/quranApi";

const useJuz = (juzNumber, juzData) => {
  const [juzDetails, setJuzDetails] = useState(null);
  const [translationOptions, setTranslationOptions] = useState({
    en: [],
    ur: [],
  });
  const [verses, setVerses] = useState([]);
  const [translations, setTranslations] = useState({ en: {}, ur: {} });
  const [audioLinks, setAudioLinks] = useState([]);
  const [fullJuzAudio, setFullJuzAudio] = useState(null);
  const [selectedTranslations, setSelectedTranslations] = useState({
    en: ["en.asad"], // Default English translation
    ur: ["ur.junagarhi"], // Default Urdu translation
  });
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Juz Details & Available Translations Once
  useEffect(() => {
    const fetchJuzDetails = async () => {
      try {
        const arabicResponse = await apiClient.get(
          `/juz/${juzNumber}/quran-uthmani`
        );
        const enResponse = await apiClient.get("/edition/language/en");
        const urResponse = await apiClient.get("/edition/language/ur");

        setJuzDetails(arabicResponse.data.data);
        setTranslationOptions({
          en: enResponse.data.data.filter(
            (edition) => edition.format === "text"
          ),
          ur: urResponse.data.data.filter(
            (edition) => edition.format === "text"
          ),
        });
      } catch (err) {
        console.error("Failed to fetch Juz details:", err);
        setError("Failed to fetch Juz details");
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchJuzDetails();
  }, [juzNumber]);

  // Fetch Selected Translations & Audio Links Dynamically
  useEffect(() => {
    const fetchVersesAndAudio = async () => {
      setLoadingVerses(true);
      try {
        let englishTranslations = {};
        let urduTranslations = {};
        let ayahAudioData = [];

        // Fetch English Translations
        for (const identifier of selectedTranslations.en) {
          const response = await apiClient.get(
            `/juz/${juzNumber}/${identifier}`
          );
          englishTranslations[identifier] = response.data.data.ayahs;
        }

        // Fetch Urdu Translations
        for (const identifier of selectedTranslations.ur) {
          const response = await apiClient.get(
            `/juz/${juzNumber}/${identifier}`
          );
          urduTranslations[identifier] = response.data.data.ayahs;
        }

        // Fetch Ayah-wise Audio
        if (juzData) {
          const { start_surah_number, end_surah_number } = juzData;
          let allAyahAudios = [];

          for (
            let surah = start_surah_number;
            surah <= end_surah_number;
            surah++
          ) {
            const audioResponse = await apiClient.get(
              `/surah/${surah}/ar.alafasy`
            );
            const ayahAudios = audioResponse.data.data.ayahs.map(
              (ayah) => ayah.audio
            );
            allAyahAudios = [...allAyahAudios, ...ayahAudios];
          }

          ayahAudioData = allAyahAudios;
        }

        // Fetch Full Juz Audio (One single link if available)
        const fullJuzAudioResponse = await apiClient.get(
          `/juz/${juzNumber}/ar.alafasy`
        );
        const fullJuzAudioLink = fullJuzAudioResponse.data.data.ayahs;

        setVerses(juzDetails?.ayahs || []);
        setTranslations({ en: englishTranslations, ur: urduTranslations });
        setAudioLinks(ayahAudioData);
        setFullJuzAudio(fullJuzAudioLink);
      } catch (err) {
        console.error("Failed to fetch translations or audio:", err);
        setError("Failed to fetch translations or audio");
      } finally {
        setLoadingVerses(false);
      }
    };

    if (juzDetails) fetchVersesAndAudio();
  }, [selectedTranslations, juzDetails, juzData]);

  return {
    juzDetails,
    translationOptions,
    verses,
    translations,
    audioLinks,
    fullJuzAudio,
    selectedTranslations,
    setSelectedTranslations,
    loadingDetails,
    loadingVerses,
    error,
  };
};

export default useJuz;
