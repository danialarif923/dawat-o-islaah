import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const MasailSearchBar = ({ query, setQuery, loading }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState(query);

  const handleSearch = () => {
    setQuery(search); // Update query based on input value
  };

  useEffect(() => {
    if (search === "") {
      setSearch(query); // Set search to query only if search is empty
    }
  }, [query, search]); // Run this effect when `query` or `search` changes

  const disabledClass = loading
    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
    : "bg-[#1E3A5F] text-white";
  const inputDisabledClass = loading
    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
    : "";

  return (
    <div className="flex justify-between items-center mb-4 space-y-2 md:space-x-2 md:space-y-0 flex-col md:flex-row">
      <input
        type="text"
        placeholder={t("masail.searchPlaceholder")}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value === "") {
            setQuery(""); // Reset to initial state when input is cleared
          }
        }}
        className={`w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none ${inputDisabledClass}`}
        disabled={loading}
      />
      <button
        disabled={loading}
        onClick={handleSearch}
        className={`flex-1 text-center py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 px-8 w-full cursor-pointer ${disabledClass}`}
      >
        {t("masail.searchButton")}
      </button>
    </div>
  );
};

export default MasailSearchBar;
