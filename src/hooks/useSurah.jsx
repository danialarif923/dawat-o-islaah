import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as backendApi from "../api/backendApi";
import surahData from "../../assets/surahData.json";

const useSurah = (surahNumber) => {
  const location = useLocation();
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
  const [wordTimings, setWordTimings] = useState(null);

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
  // Fetch Surah Ayahs from backend
  // =====================================================
  useEffect(() => {
    const fetchSurahDetails = async () => {
      try {
        const meta = surahData.find((s) => s.number === Number(surahNumber));
        const res = await backendApi.getAyahsBySurah(surahNumber);
        console.log("[useSurah] Backend response:", res);

        let ayahs = [];
        if (Array.isArray(res)) {
          ayahs = res;
        } else if (res?.ayahs && Array.isArray(res.ayahs)) {
          ayahs = res.ayahs;
        } else if (res?.data && Array.isArray(res.data)) {
          ayahs = res.data;
        } else if (res?.results && Array.isArray(res.results)) {
          ayahs = res.results;
        } else if (res?.verses && Array.isArray(res.verses)) {
          ayahs = res.verses;
        }

        setSurahDetails({
          ...(meta || { number: surahNumber }),
          numberOfAyahs: meta?.numberOfAyahs || ayahs.length,
        });
        setVerses(ayahs);
      } catch (err) {
        console.error("Failed to fetch Surah details:", err);
        setError("Failed to fetch Surah details");
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchSurahDetails();
  }, [surahNumber, location.key]);

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

        const enTransAuthors = mapAuthors(enTransAuthorsRes?.authors);
        const urTransAuthors = mapAuthors(urTransAuthorsRes?.authors);

        const enTafsirAuthors = mapAuthors(enTafsirAuthorsRes?.authors);
        const urTafsirAuthors = mapAuthors(urTafsirAuthorsRes?.authors);

        setTranslationAuthors({
          en: enTransAuthors,
          ur: urTransAuthors,
        });

        setTafsirAuthors({
          en: enTafsirAuthors,
          ur: urTafsirAuthors,
        });

        setQaris(qariRes?.qaris || []);

        // Default: only Ahmed Raza Khan translations selected
        const findAhmedRaza = (authors, nameEn, nameUr) => {
          const en = authors.en.find((a) => a.name === nameEn);
          const ur = authors.ur.find((a) => a.name === nameUr);
          return {
            en: en ? [{ name: en.name }] : [],
            ur: ur ? [{ name: ur.name }] : [],
          };
        };
        setSelectedTranslations(
          findAhmedRaza(
            { en: enTransAuthors, ur: urTransAuthors },
            "AHMED RAZA KHAN",
            "احمد رضا خان"
          )
        );

        // Default tafsir author: none
        setSelectedTafsirAuthor(null);

        setSelectedQari(qariRes?.qaris?.[0] || null);
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
        const [enTrans, urTrans, audioRes, wordTimingRes] = await Promise.all([
          backendApi.getSurahTranslations(surahNumber, "en"),
          backendApi.getSurahTranslations(surahNumber, "ur"),
          backendApi.getSurahAudio(surahNumber),
          backendApi.getWordTimings(surahNumber),
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

        if (wordTimingRes?.timings) {
          setWordTimings(wordTimingRes.timings);
        }
      } catch (err) {
        const status = err.response?.status || "NETWORK";
        console.error(`Backend fetch failed [${status}]:`, err.message);
        setError(`Failed to fetch translations or audio (HTTP ${status})`);
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
    wordTimings,
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