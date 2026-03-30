import { useLanguage } from "../../context/LanguageContext";

const MasailCategoryList = ({ masail, loading, setSelectedCategory }) => {
  const { t } = useLanguage();

  // Show shimmer effect while masail is loading
  if (loading) {
    return (
      <div className="my-4">
        <h2 className="text-2xl md:text-xl font-bold text-gray-800 mb-4">
          {t("masail.categories")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 bg-gray-300 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // Extract unique categories and their first masail image
  const categoryMap = new Map();
  masail.forEach((item) => {
    if (!categoryMap.has(item.category.id)) {
      categoryMap.set(item.category.id, {
        ...item.category,
        image: item.image, // Set first masail's image for the category
      });
    }
  });

  const categories = Array.from(categoryMap.values());

  return (
    <div className="my-4">
      <h2 className="text-2xl md:text-xl font-bold text-gray-800 mb-4">
        {t("masail.categories")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            onClick={() => setSelectedCategory(category.id)}
            key={category.id}
            className="relative h-40 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60 blur-[1px]"
              style={{
                backgroundImage: `url(${category.image})`,
              }}
            />

            {/* Content */}
            <div className="relative h-40 z-10 p-6 flex flex-col items-center bg-gradient-to-t justify-center from-gray-900 to-transparent">
              <h3 className="text-lg md:text-3xl font-semibold text-white text-center">
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasailCategoryList;
