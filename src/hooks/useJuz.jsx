import { useState, useEffect, useMemo } from "react";
import * as backendApi from "../api/backendApi";

const useJuz = (juzNumber, juzData) => {
  const [juzDetails, setJuzDetails] = useState(null);
  const [verses, setVerses] = useState([]);
  const [translations, setTranslations] = useState({ en: {}, ur: {} });
  const [audioLinks, setAudioLinks] = useState([]);
  const [fullJuzAudio, setFullJuzAudio] = useState(null);
  const [selectedTranslations, setSelectedTranslations] = useState({
    en: [],
    ur: [],
  });
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(true);
  const [error, setError] = useState(null);

  const juzMeta = useMemo(() => juzData, [juzData]);

  // Fetch ayahs for each surah in this juz range from backend
  useEffect(() => {
    const fetchJuzDetails = async () => {
      if (!juzMeta) {
        setLoadingDetails(false);
        return;
      }
      try {
        const { start_surah_number, end_surah_number } = juzMeta;
        let allAyahs = [];

        for (let surah = start_surah_number; surah <= end_surah_number; surah++) {
          const res = await backendApi.getAyahsBySurah(surah);
          const ayahs = res?.ayahs || res?.data || [];
          allAyahs = [...allAyahs, ...ayahs];
        }

        setJuzDetails({ ayahs: allAyahs });
        setVerses(allAyahs);
      } catch (err) {
        console.error("Failed to fetch Juz details:", err);
        setError("Failed to fetch Juz details");
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchJuzDetails();
  }, [juzNumber, juzMeta]);

  // Fetch Translations & Audio from backend
  useEffect(() => {
    const fetchVersesAndAudio = async () => {
      if (!juzMeta) return;
      setLoadingVerses(true);
      try {
        let englishTranslations = {};
        let urduTranslations = {};
        let ayahAudioData = [];

        const { start_surah_number, end_surah_number } = juzMeta;

        // Fetch English Translations
        for (const identifier of selectedTranslations.en) {
          const allTrans = {};
          for (let surah = start_surah_number; surah <= end_surah_number; surah++) {
            const res = await backendApi.getSurahTranslations(surah, "en");
            (res || []).forEach((t) => {
              if (!allTrans[t.ayah]) allTrans[t.ayah] = [];
              allTrans[t.ayah].push(t);
            });
          }
          englishTranslations[identifier] = allTrans;
        }

        // Fetch Urdu Translations
        for (const identifier of selectedTranslations.ur) {
          const allTrans = {};
          for (let surah = start_surah_number; surah <= end_surah_number; surah++) {
            const res = await backendApi.getSurahTranslations(surah, "ur");
            (res || []).forEach((t) => {
              if (!allTrans[t.ayah]) allTrans[t.ayah] = [];
              allTrans[t.ayah].push(t);
            });
          }
          urduTranslations[identifier] = allTrans;
        }

        // Fetch Audio
        for (let surah = start_surah_number; surah <= end_surah_number; surah++) {
          const audioRes = await backendApi.getSurahAudio(surah);
          (audioRes || []).forEach((item) => {
            ayahAudioData.push({
              ayah: item.ayah,
              url: item.audio_url,
              qari: item.qari_name,
            });
          });
        }

        setVerses(juzDetails?.ayahs || []);
        setTranslations({ en: englishTranslations, ur: urduTranslations });
        setAudioLinks(ayahAudioData);
      } catch (err) {
        console.error("Failed to fetch translations or audio:", err);
        setError("Failed to fetch translations or audio");
      } finally {
        setLoadingVerses(false);
      }
    };

    if (juzDetails) fetchVersesAndAudio();
  }, [selectedTranslations, juzDetails, juzMeta]);

  return {
    juzDetails,
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
