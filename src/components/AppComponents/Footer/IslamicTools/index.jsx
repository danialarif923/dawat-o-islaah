import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";

const IslamicTools = () => {
  const { t } = useLanguage();

  const data = [
    { title: "zakatCalculator", route: "zakat-calculator" },
    { title: "prayerTiming", route: "prayer-timings" },
    { title: "inheritanceCalculator", route: "inheritance-calculator" },
    { title: "qiblaDirection", route: "qibla-direction" },
    { title: "nearestMosque", route: "nearest-mosque" },
  ];

  return (
    <div className=" flex-1 text-white space-y-4">
      <div className="space-y-1">
        <div className="text-2xl font-bold">{t("footer.islamicTools")}</div>
        <div className="flex w-full ">
          <div className="border-[1px] border-amber-500 w-[40%]" />
          <div className="border-[1px] border-whitw w-[60%]" />
        </div>
      </div>
      <div className="text-lg mt-12 flex space-y-2 space-x-2 flex-wrap">
        {data.map((item, index) => (
          <Link
            to={item.route}
            key={index}
            className="p-2 border hover:border-amber-400 hover:text-amber-400 rounded  transition-all"
          >
            <div className=" transition-all leading-10">
              {t(`services.${item.title}`)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IslamicTools;
