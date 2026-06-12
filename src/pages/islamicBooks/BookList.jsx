import { useState, useRef, useEffect, useCallback } from "react";
import useIslamicBooks from "../../hooks/useIslamicBooks";
import BookCard from "./BookCard";
import BookSearchBar from "./BookSearchBar";
import ShimmerBookCard from "./ShimmerBookCard";
import { useLanguage } from "../../context/LanguageContext";

const BookList = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const { books, loading, loadingMore, hasMore, loadMore, total } =
    useIslamicBooks(query);
  const sentinelRef = useRef(null);

  const uniqueBooks = Array.from(
    new Map(books.map((book) => [book.id, book])).values()
  );

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loadingMore, loading, loadMore]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="max-w-6xl mx-auto p-4 my-12 min-h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        {t("islamicBooks.collectionTitle")}
      </h2>
      <BookSearchBar query={query} setQuery={setQuery} />

      <p className="text-gray-600 mb-4">
        {t("islamicBooks.showingBooks")
          .replace("{count}", uniqueBooks.length)
          .replace("{total}", total)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => <ShimmerBookCard key={index} />)
          : uniqueBooks.length > 0
          ? uniqueBooks.map((book) => (
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
                readCount={book.read_count}
                downloadCount={book.download_count}
                isSplit={book.is_split}
                pagesUrlPrefix={book.pages_url_prefix}
                totalPages={book.total_pages}
                processingStatus={book.processing_status}
              />
            ))
          : !loading && (
              <p className="text-center text-gray-500 col-span-full">
                {t("islamicBooks.noBooks")}
              </p>
            )}
      </div>

      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <ShimmerBookCard key={`more-${index}`} />
            ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
};

export default BookList;
