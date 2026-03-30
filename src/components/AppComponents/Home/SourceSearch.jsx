import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

const SourceSearch = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // We only send the query 'q'. 
    // The Search page will handle the data sources via Tabs.
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <form
      className="flex items-center bg-white rounded-md overflow-hidden shadow-md border border-gray-200"
      onSubmit={handleSearch}
    >
      {/* Search Input */}
      <input
        type="text"
        placeholder={t("sourceSearch.placeholder") || "Search Quran, Hadith, Tafsir..."}
        className="px-4 py-2 w-full max-w-[250px] sm:max-w-[400px] outline-none text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Search Button */}
      <button
        type="submit"
        className="px-5 py-3 bg-green-600 hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center"
      >
        <FaSearch className="text-white" />
      </button>
    </form>
  );
};

export default SourceSearch;