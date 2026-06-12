import { useState, useEffect } from "react";
import { getHadiths } from "../api/hadithApi";
import { useParams } from "react-router-dom";

const useHadithChapters = () => {
  const { bookSlug } = useParams();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await getHadiths(`${bookSlug}/chapters`);

        if (data?.chapters) {
          setChapters(data.chapters);
        } else if (data?.data) {
          setChapters(data.data);
        } else if (Array.isArray(data)) {
          setChapters(data);
        } else {
          setError(`Failed to fetch chapters: unexpected response format for book "${bookSlug}"`);
        }
      } catch (err) {
        const detail = err.response?.status
          ? `HTTP ${err.response.status}`
          : err.message;
        setError(`Failed to fetch chapters for "${bookSlug}": ${detail}`);
      } finally {
        setLoading(false);
      }
    };

    getChapters();
  }, [bookSlug]);

  return { chapters, loading, error };
};

export default useHadithChapters;
