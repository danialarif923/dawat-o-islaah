import { useState } from "react";
import useMasail from "../../hooks/useMasail";
import MasailCategoryList from "./MasailCategoryList";
import MasailSearchBar from "./MasailSearchBar";
import MasailList from "./MasailList";
import { useLanguage } from "../../context/LanguageContext";

const Masail = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const { masail, loading } = useMasail(query);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredMasail, setFilteredMasail] = useState([]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilteredMasail(
      masail.filter((masla) => masla.category.id === categoryId)
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 my-4 md:my-12 min-h-[80vh] flex flex-col">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
        {t("masail.pageTitle")}
      </h2>
      <MasailSearchBar query={query} setQuery={setQuery} loading={loading} />

      <div>
        {query.length > 0 ? (
          <MasailList masail={masail} loading={loading} />
        ) : selectedCategory ? (
          <MasailList
            masail={filteredMasail}
            loading={loading}
            selectedCategoryName={filteredMasail[0]?.category?.name}
            setSelectedCategory={setSelectedCategory}
          />
        ) : (
          <MasailCategoryList
            masail={masail}
            loading={loading}
            setSelectedCategory={handleCategorySelect}
          />
        )}
      </div>
    </div>
  );
};

export default Masail;
