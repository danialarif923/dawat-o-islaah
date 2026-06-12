import { useState, useEffect, useCallback } from "react";
import quranApi from "../api/quranApi";
import surahData from "../../assets/surahData.json";

const useSurahList = () => {
  const [surahs, setSurahs] = useState(surahData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSurahs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quranApi.get("/surah");
      if (data?.data?.data) {
        setSurahs(data.data.data);
      }
    } catch (err) {
      const status = err.response?.status || "NETWORK";
      console.warn(`API fetch failed [${status}], using local data.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurahs();
  }, [fetchSurahs]);

  return { surahs, loading, error, retry: fetchSurahs };
};

export default useSurahList;
