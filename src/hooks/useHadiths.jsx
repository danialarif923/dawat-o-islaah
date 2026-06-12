import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import localApiClient from "../api/hadithApi";

const useHadiths = () => {
  const { bookSlug, chapterNo } = useParams();

  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch initial page when book/chapter changes
  useEffect(() => {
    setHadiths([]);
    setCurrentPage(1);
    setTotalPages(1);
    setLoading(true);
    setError(null);
    setIsFetchingMore(false);

    const controller = new AbortController();

    const fetchPage1 = async () => {
      try {
        const response = await localApiClient.get("get-hadith/", {
          params: { book: bookSlug, chapter: chapterNo, page: 1 },
          signal: controller.signal,
        });

        if (response.data?.hadiths?.data) {
          setHadiths(response.data.hadiths.data);
          setTotalPages(response.data.hadiths.last_page);
        } else {
          setError("Failed to fetch Hadiths");
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error(err);
          setError(
            err.response?.data?.error ||
            err.message ||
            "Something went wrong"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (bookSlug && chapterNo) {
      fetchPage1();
    }

    return () => controller.abort();
  }, [bookSlug, chapterNo]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (currentPage >= totalPages || isFetchingMore) return;

    const nextPage = currentPage + 1;
    setIsFetchingMore(true);

    try {
      const response = await localApiClient.get("get-hadith/", {
        params: { book: bookSlug, chapter: chapterNo, page: nextPage },
      });

      if (response.data?.hadiths?.data) {
        setHadiths((prev) => [...prev, ...response.data.hadiths.data]);
        setCurrentPage(nextPage);
        setTotalPages(response.data.hadiths.last_page);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to load more");
    } finally {
      setIsFetchingMore(false);
    }
  }, [currentPage, totalPages, isFetchingMore, bookSlug, chapterNo]);

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
