import SourceSearch from "../../components/AppComponents/Home/SourceSearch";
import { useLanguage } from "../../context/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#157347] pt-60 pb-10 sm:pb-16 lg:pb-20 w-full flex text-white flex-col items-center gap-y-4 sm:gap-y-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center leading-16">
        {t("hero.title")}
      </h1>
      {/*\\ <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-center">
        {t("hero.date")}
      </h2> */}
      <SourceSearch />
    </div>
  );
};

export default Hero;
