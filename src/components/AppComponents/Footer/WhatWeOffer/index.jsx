import { Link } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";

const WhatWeOffer = () => {
  const { t } = useLanguage();
  const whatWeOfferList = t("footer.whatWeOfferList");

  const items = ["quran", "hadith", "islamicBooks", "masail"];

  return (
    <div className=" flex-1 text-white space-y-4">
      <div className="space-y-1">
        <div className="text-2xl font-bold">{t("footer.whatWeOffer")}</div>
        <div className="flex w-full ">
          <div className="border-[1px] border-amber-500 w-[40%]" />
          <div className="border-[1px] border-whitw w-[60%]" />
        </div>
      </div>
      <div className="text-lg mt-12">
        {items.map((item, index) => (
          <div key={index} className="">
            {/* <div className="border-2 border-white" /> */}

            <Link to={item} className="flex items-center space-x-2">
              <span className="border-l-4 h-5 " />
              <div className="hover:text-amber-400 transition-all">
                {whatWeOfferList[index]}
              </div>
            </Link>
            {index < whatWeOfferList.length - 1 && (
              <div className="border border-amber-500 my-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatWeOffer;
