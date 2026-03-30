import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const useHadiths = () => {
  const { bookSlug, chapterNo } = useParams();

  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const getHadiths = async () => {
      try {
        setLoading(true);

        // IMPORTANT: use ROOT URL, NOT /quran/
        const response = await axios.get(
          "http://127.0.0.1:8000/api/hadith/get-hadith/",
          {
            params: {
              book: bookSlug,
              chapter: chapterNo,
              page: currentPage,
            },
          }
        );

        if (response.status === 200) {
          setHadiths((prev) => [
            ...prev,
            ...response.data.hadiths.data,
          ]);

          setTotalPages(response.data.hadiths.last_page);
        } else {
          setError("Failed to fetch Hadiths");
        }

      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
          "Something went wrong"
        );
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };

    if (bookSlug && chapterNo) {
      getHadiths();
    }
  }, [bookSlug, chapterNo, currentPage]);

  const loadMore = () => {
    if (currentPage < totalPages) {
      setIsFetchingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  return {
    hadiths,
    loading,
    error,
    loadMore,
    currentPage,
    totalPages,
    isFetchingMore,
  };
};

export default useHadiths;