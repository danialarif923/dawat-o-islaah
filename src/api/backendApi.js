import axios from "axios";

/* =====================================================
   BASE URL (Production-Ready Relative Paths)
===================================================== */

// Using relative paths / ensures the browser uses the current domain
const BACKEND_BASE_URL = "/quran/";
const AUTH_BASE_URL = "/";
const FORUM_BASE_URL = "/";

/* =====================================================
   AXIOS INSTANCES
===================================================== */

const backendApiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const authApiClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const forumApiClient = axios.create({
  baseURL: FORUM_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* =====================================================
   AUTH TOKEN HANDLER
===================================================== */

export const setAuthToken = (token) => {
  if (token) {
    const authHeader = `Bearer ${token}`;
    backendApiClient.defaults.headers.common["Authorization"] = authHeader;
    authApiClient.defaults.headers.common["Authorization"] = authHeader;
    forumApiClient.defaults.headers.common["Authorization"] = authHeader;
  } else {
    delete backendApiClient.defaults.headers.common["Authorization"];
    delete authApiClient.defaults.headers.common["Authorization"];
    delete forumApiClient.defaults.headers.common["Authorization"];
  }
};

/* =====================================================
   GENERIC HELPERS
===================================================== */

const getWithParams = async (endpoint, params = {}) => {
  try {
    const res = await backendApiClient.get(endpoint, { params });
    return res.data;
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    return null;
  }
};

const postData = async (endpoint, data = {}) => {
  try {
    const res = await backendApiClient.post(endpoint, data);
    return res.data;
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    return null;
  }
};

/* =====================================================
   EXTERNAL SURAH LIST (Public API)
===================================================== */

export const getSurahList = async () => {
  const res = await axios.get("https://api.quranapi.com/v4/chapters");
  return res.data.chapters;
};

/* =====================================================
   QURAN CORE
===================================================== */

export const getAyahsBySurah = (surahNumber) =>
  getWithParams("api/quran/", { surah: surahNumber });

/* =====================================================
   TRANSLATIONS
===================================================== */

export const getSurahTranslations = (surahId, language = "en") =>
  getWithParams("api/translations/", { surah: surahId, language });

export const getTranslation = (
  surahNumber,
  ayahNumber,
  author,
  language = "en"
) =>
  getWithParams("api/translation/", {
    surah: surahNumber,
    ayah: ayahNumber,
    author,
    language,
  });

export const getTranslationAuthors = (language = "en") =>
  getWithParams("api/authors/translations/", { language });

/* =====================================================
   TAFSEER
===================================================== */

export const getTafseer = async (surahNumber, ayahNumber, author, language) => {
  const data = await getWithParams("api/tafseer/", {
    surah: surahNumber,
    ayah: ayahNumber,
    author: author?.toUpperCase().trim(),
    language: language?.toLowerCase().trim(),
  });

  return data?.tafseer || "";
};

export const getTafseerAuthors = (language = "ur") =>
  getWithParams("api/authors/tafseer/", { language });

/* -----------------------------
   FULL SURAH TAFSEER (NEW)
------------------------------ */
export const getFullSurahTafseer = async (surah, author, language) => {
  const res = await backendApiClient.get("/api/tafseer/full/", {
    params: {
      surah,
      author: author?.toUpperCase().trim(),
      language: language?.toLowerCase().trim(),
    },
  });

  return res.data;
};

/* =====================================================
   SURAH AUDIO
===================================================== */

export const getSurahAudio = (surahId) =>
  getWithParams("api/surah-audios/", { surah: surahId });

export const getQaris = () => getWithParams("api/qaris/");

/* =====================================================
   AUTHOR MANAGEMENT (Admin Tools)
===================================================== */

export const addAuthor = (author, language) =>
  postData("authors/add/", { author, language });

export const deleteAuthor = (author, language) =>
  backendApiClient
    .delete("authors/delete/", { data: { author, language, confirm: true } })
    .then((res) => res.data);

/* =====================================================
   EXPORT CORE CLIENT
===================================================== */

export {
  backendApiClient,
  authApiClient,
  BACKEND_BASE_URL,
  forumApiClient,
  getWithParams,
  postData,
};