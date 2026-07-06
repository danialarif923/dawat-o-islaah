import { useState, useEffect } from "react";
import localApiClient from "../api/hadithApi";

const useHadithBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBooks = async () => {
      try {
        const response = await localApiClient.get("get-books/");
        const data = response.data;
        setBooks(data?.books || data?.data || []);
      } catch (err) {
        const status = err.response?.status || "NETWORK";
        console.error(`Failed to fetch hadith books [${status}]:`, err.message);
        setError(`Failed to fetch hadith books (HTTP ${status})`);
      } finally {
        setLoading(false);
      }
    };

    getBooks();
  }, []);

  return { books, loading, error };
};

export default useHadithBooks;
