import { useLanguage } from "../../context/LanguageContext";

const BookSearchBar = ({ query, setQuery }) => {
  const { t } = useLanguage();
  return (
    <div className="flex justify-between items-center mb-4">
      <input
        type="text"
        placeholder={t("islamicBooks.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  );
};

export default BookSearchBar;
