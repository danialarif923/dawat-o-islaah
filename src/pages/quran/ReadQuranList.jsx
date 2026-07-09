import MushafCard from "./MushafCard";
import mushafLayouts from "../../data/mushafLayouts";
import { useLanguage } from "../../context/LanguageContext";

const ReadQuranList = () => {
  const { t } = useLanguage();

  return (
    <div>
      <p className="text-center text-sm text-gray-500 mb-6">{t("quran.selectMushaf")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:mx-20 mb-8">
        {mushafLayouts.filter((l) => l.slug === "svg-mushaf").map((layout) => (
          <MushafCard key={layout.slug} layout={layout} />
        ))}
      </div>
    </div>
  );
};

export default ReadQuranList;
