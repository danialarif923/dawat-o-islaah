import { useState, useEffect, useRef, useCallback } from "react";
import { getPublicWithParams } from "../api/backendApi";
import { useBookContext } from "../context/BookContext";
import {
  SearchCache,
  RequestManager,
  createCacheKey,
} from "../utils/searchOptimizations";

const BOOKS_PER_PAGE = 12;

const useIslamicBooks = (searchQuery = "", token = null) => {
  const { books, setBooks } = useBookContext();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const allBooksRef = useRef([]);
  const totalCountRef = useRef(0);

  const cacheRef = useRef(new SearchCache(10));
  const requestManagerRef = useRef(new RequestManager());
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const transformBooks = useCallback((results) => {
    return results.map((book) => ({
      ...book,
      pdf_file:
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "localhost"
          ? book.pdf_file
          : book.pdf_file?.replace("http://", "https://") || book.pdf_file,
    }));
  }, []);

  const fetchPage = useCallback(
    async (pageNum, query, append = false) => {
      const signal = requestManagerRef.current.getSignal();

      const data = await getPublicWithParams("api/books/", {
        search: query || undefined,
        page: pageNum,
        page_size: BOOKS_PER_PAGE,
      });

      if (signal.aborted || abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (data?.results) {
        const transformed = transformBooks(data.results);
        const unique = Array.from(
          new Map(transformed.map((b) => [b.id, b])).values()
        );

        if (append) {
          const existingIds = new Set(allBooksRef.current.map((b) => b.id));
          const newBooks = unique.filter((b) => !existingIds.has(b.id));
          allBooksRef.current = [...allBooksRef.current, ...newBooks];
        } else {
          allBooksRef.current = unique;
        }

        totalCountRef.current = data.count || 0;
        setBooks([...allBooksRef.current]);
        setHasMore(allBooksRef.current.length < totalCountRef.current);

        return data;
      }

      if (!append) {
        allBooksRef.current = [];
        setBooks([]);
        setHasMore(false);
      }
    },
    [transformBooks, setBooks]
  );

  useEffect(() => {
    const cacheKey = createCacheKey(searchQuery);

    if (!searchQuery) {
      cacheRef.current.clear();
    } else {
      const cachedResults = cacheRef.current.get(cacheKey);
      if (cachedResults) {
        allBooksRef.current = cachedResults;
        totalCountRef.current = cachedResults.length;
        setBooks(cachedResults);
        setHasMore(false);
        setLoading(false);
        setPage(1);
        return;
      }
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      allBooksRef.current = [];
      setLoading(true);
      setPage(1);
      setHasMore(true);

      try {
        const data = await fetchPage(1, searchQuery, false);
        if (data?.results && searchQuery) {
          const unique = Array.from(
            new Map(
              transformBooks(data.results).map((b) => [b.id, b])
            ).values()
          );
          cacheRef.current.set(cacheKey, unique);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching books:", error);
        }
      }

      setLoading(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, setBooks, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    try {
      await fetchPage(nextPage, searchQuery, true);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error loading more books:", error);
      }
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, searchQuery, fetchPage]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { books, loading, loadingMore, hasMore, loadMore, total: totalCountRef.current };
};

export default useIslamicBooks;
