import { useLanguage } from "../../../context/LanguageContext";

const FooterBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-[#C9A227] text-center text-white uppercase leading-10 text-sm">
      {t("footerBanner.copyright")}
    </div>
  );
};

export default FooterBanner;
