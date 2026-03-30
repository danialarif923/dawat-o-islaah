import { useState, useEffect } from "react";
import { fetchHadith } from "../api/hadithApi";

const useHadithBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBooks = async () => {
      try {
        const data = await fetchHadith("books");
        setBooks(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getBooks();
  }, []);

  return { books, loading, error };
};

export default useHadithBooks;
