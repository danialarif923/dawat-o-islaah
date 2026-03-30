import { useState, useEffect } from "react";
import { getWithParams } from "../api/backendApi"; // use helper to handle params
import { useBookContext } from "../context/BookContext";

const useIslamicBooks = (searchQuery = "", token = null) => {
  const { books, setBooks } = useBookContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      try {
        // Use relative path to reach the actual API
        const data = await getWithParams("../api/books/", {
          search: searchQuery,
        });

        if (data?.results) {
          // Transform the books data to ensure pdf_file uses HTTPS
          const transformedBooks = data.results.map((book) => ({
            ...book,
            pdf_file:
              window.location.hostname === "127.0.0.1" ||
              window.location.hostname === "localhost"
                ? book.pdf_file // keep HTTP in dev
                : book.pdf_file?.replace("http://", "https://") ||
                  book.pdf_file,
          }));

          setBooks(transformedBooks);
        } else {
          console.error("No books found or invalid response:", data);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }

      setLoading(false);
    };

    fetchBooks();
  }, [searchQuery, setBooks]);

  return { books, loading };
};

export default useIslamicBooks;
