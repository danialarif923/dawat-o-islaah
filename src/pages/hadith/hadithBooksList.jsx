import useHadithBooks from "../../hooks/useHadithBooks";
import HadithBookCard from "./HadithBookCard";
import ShimmerLoader from "../../components/AppComponents/Hadith/ShimmerLoader";
import { useLanguage } from "../../context/LanguageContext";

const HadithBooksList = () => {
  const { t } = useLanguage();
  const { books, loading, error } = useHadithBooks();

  if (loading) return <ShimmerLoader />;
  if (error)
    return (
      <p className="text-center text-red-500">
        {t("hadith.error")}: {error.message}
      </p>
    );

  return (
    <div className="container mx-auto px-4 md:px-20 py-6">
      <h2 className="text-2xl font-bold text-center mb-6 leading-12">
        {t("hadith.booksTitle")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books?.books?.length > 0 &&
          books.books
            .filter((book) => book.hadiths_count > 0)
            .map((book) => <HadithBookCard key={book.id} book={book} />)}
      </div>
    </div>
  );
};

export default HadithBooksList;
