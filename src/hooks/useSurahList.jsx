import { useState, useEffect } from "react";
import quranApi from "../api/quranApi";

const useSurahList = () => {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await quranApi.get("/surah");
        console.log("data = ", data?.data?.data);
        setSurahs(data?.data?.data);
      } catch (err) {
        setError("Failed to fetch Surahs");
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  return { surahs, loading, error };
};

export default useSurahList;
