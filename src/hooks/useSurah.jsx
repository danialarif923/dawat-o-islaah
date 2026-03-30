import { useState, useEffect } from "react";
import * as backendApi from "../api/backendApi";
import apiClient from "../api/quranApi";

const useSurah = (surahNumber) => {
  const [surahDetails, setSurahDetails] = useState(null);
  const [verses, setVerses] = useState([]);

  const [translationAuthors, setTranslationAuthors] = useState({
    en: [],
    ur: [],
  });

  const [tafsirAuthors, setTafsirAuthors] = useState({
    en: [],
    ur: [],
  });

  const [qaris, setQaris] = useState([]);

  const [translations, setTranslations] = useState({ en: {}, ur: {} });
  const [audioByQari, setAudioByQari] = useState({});

  const [tafseerByAyah, setTafseerByAyah] = useState({});

  const [selectedTranslations, setSelectedTranslations] = useState({
    en: [],
    ur: [],
  });

  /* =====================
     NEW: Tafsir Language
  ===================== */
  const [tafsirLang, setTafsirLang] = useState("ur");

  const [selectedTafsirAuthor, setSelectedTafsirAuthor] = useState(null);
  const [selectedQari, setSelectedQari] = useState(null);

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(true);
  const [loadingTafseer, setLoadingTafseer] = useState(true);

  const [error, setError] = useState(null);

  // =====================================================
  // Fetch Surah Details
  // =====================================================
  useEffect(() => {
    const fetchSurahDetails = async () => {
      try {
        const arabicRes = await apiClient.get(`/surah/${surahNumber}`);
        const surahData = arabicRes.data.data;

        setSurahDetails(surahData);
        setVerses(surahData.ayahs || []);
      } catch (err) {
        console.error("Failed to fetch Surah details:", err);
        setError("Failed to fetch Surah details");
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchSurahDetails();
  }, [surahNumber]);

  // =====================================================
  // Fetch Authors + Qaris
  // =====================================================
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [
          enTransAuthorsRes,
          urTransAuthorsRes,
          enTafsirAuthorsRes,
          urTafsirAuthorsRes,
          qariRes,
        ] = await Promise.all([
          backendApi.getTranslationAuthors("en"),
          backendApi.getTranslationAuthors("ur"),
          backendApi.getTafseerAuthors("en"),
          backendApi.getTafseerAuthors("ur"),
          backendApi.getQaris(),
        ]);

        const mapAuthors = (arr) =>
          (arr || []).map((a) =>
            typeof a === "string" ? { id: a, name: a } : a
          );

        const enTransAuthors = mapAuthors(enTransAuthorsRes.authors);
        const urTransAuthors = mapAuthors(urTransAuthorsRes.authors);

        const enTafsirAuthors = mapAuthors(enTafsirAuthorsRes.authors);
        const urTafsirAuthors = mapAuthors(urTafsirAuthorsRes.authors);

        setTranslationAuthors({
          en: enTransAuthors,
          ur: urTransAuthors,
        });

        setTafsirAuthors({
          en: enTafsirAuthors,
          ur: urTafsirAuthors,
        });

        setQaris(qariRes.qaris || []);

        // Default: all translations selected
        setSelectedTranslations({
          en: enTransAuthors.map((a) => ({ name: a.name })),
          ur: urTransAuthors.map((a) => ({ name: a.name })),
        });

        // Default tafsir author (based on language)
        if (tafsirLang === "ur" && urTafsirAuthors.length) {
          setSelectedTafsirAuthor(urTafsirAuthors[0].name);
        } else if (tafsirLang === "en" && enTafsirAuthors.length) {
          setSelectedTafsirAuthor(enTafsirAuthors[0].name);
        }

        setSelectedQari(qariRes.qaris?.[0] || null);
      } catch (err) {
        console.error("Failed to load authors/qaris:", err);
      }
    };

    fetchMeta();
  }, [tafsirLang]);

  // =====================================================
  // Fetch Translations + Audio
  // =====================================================
  useEffect(() => {
    const fetchTranslationsAndAudio = async () => {
      if (!surahNumber) return;

      setLoadingVerses(true);
      setError(null);

      try {
        const [enTrans, urTrans, audioRes] = await Promise.all([
          backendApi.getSurahTranslations(surahNumber, "en"),
          backendApi.getSurahTranslations(surahNumber, "ur"),
          backendApi.getSurahAudio(surahNumber),
        ]);

        const groupByAuthor = (data) => {
          const grouped = {};

          (data || []).forEach((t) => {
            const authorName = String(t.author).toUpperCase();

            if (!grouped[authorName]) grouped[authorName] = [];

            grouped[authorName].push({ ...t });
          });

          return grouped;
        };

        setTranslations({
          en: groupByAuthor(enTrans),
          ur: groupByAuthor(urTrans),
        });

        const groupedAudio = {};

        (audioRes || []).forEach((item) => {
          const qari = String(item.qari_name).toUpperCase();

          if (!groupedAudio[qari]) groupedAudio[qari] = [];

          groupedAudio[qari].push({
            ayah: item.ayah,
            url: item.audio_url,
          });
        });

        setAudioByQari(groupedAudio);
      } catch (err) {
        console.error("Backend fetch failed:", err);
        setError("Failed to fetch translations or audio");
      } finally {
        setLoadingVerses(false);
      }
    };

    if (surahDetails) {
      fetchTranslationsAndAudio();
    }
  }, [surahDetails, surahNumber]);

  // =====================================================
  // Fetch FULL Surah Tafseer (Dynamic Language)
  // =====================================================
  useEffect(() => {
    const fetchFullTafseer = async () => {
      if (!selectedTafsirAuthor) return;

      setLoadingTafseer(true);

      try {
        const tafseerData = await backendApi.getFullSurahTafseer(
          surahNumber,
          selectedTafsirAuthor,
          tafsirLang // ✅ dynamic now
        );

        setTafseerByAyah(tafseerData || {});
      } catch (err) {
        console.error("Failed to fetch full tafseer:", err);
        setTafseerByAyah({});
      } finally {
        setLoadingTafseer(false);
      }
    };

    fetchFullTafseer();
  }, [selectedTafsirAuthor, surahNumber, tafsirLang]);

  return {
    surahDetails,
    verses,

    translationAuthors,
    tafsirAuthors,
    qaris,

    translations,
    audioByQari,
    tafseerByAyah,

    selectedTranslations,
    setSelectedTranslations,

    /* Tafsir */
    tafsirLang,
    setTafsirLang,

    selectedTafsirAuthor,
    setSelectedTafsirAuthor,

    selectedQari,
    setSelectedQari,

    loadingDetails,
    loadingVerses,
    loadingTafseer,

    error,
  };
};

export default useSurah;