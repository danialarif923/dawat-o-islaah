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
        // Check if data exists and has the chapters key
        if (data && data.status === 200) {
          setChapters(data.chapters || []);
        } else {
          setError("Failed to fetch chapters");
        }
      } catch (err) {
        setError(err.message); // This is likely where your red text is coming from
      } finally {
        setLoading(false);
      }
    };

    getChapters();
  }, [bookSlug]);

  return { chapters, loading, error };
};

export default useHadithChapters;
