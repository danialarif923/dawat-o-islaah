import { useState } from "react";
import useIslamicBooks from "../../hooks/useIslamicBooks";
import BookCard from "./BookCard";
import BookSearchBar from "./BookSearchBar";
import ShimmerBookCard from "./ShimmerBookCard";
import { useLanguage } from "../../context/LanguageContext";

const BookList = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const { books, loading } = useIslamicBooks(query);

  return (
    <div className="max-w-6xl mx-auto p-4 my-12 min-h-[80vh] flex flex-col">
      {/* Page Title and Search */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        {t("islamicBooks.collectionTitle")}
      </h2>
      <BookSearchBar query={query} setQuery={setQuery} />

      {/* Book Count */}
      <p className="text-gray-600 mb-4">
        {t("islamicBooks.showingBooks").replace("{count}", books.length)}
      </p>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => <ShimmerBookCard key={index} />)
          : books.length > 0
          ? books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                description={book.description}
                coverImage={book.cover_image}
                pdfFile={book.pdf_file}
                uploadedAt={book.uploaded_at}
                updatedAt={book.updated_at}
              />
            ))
          : !loading && (
              <p className="text-center text-gray-500">
                {t("islamicBooks.noBooks")}
              </p>
            )}
      </div>
    </div>
  );
};

export default BookList;
