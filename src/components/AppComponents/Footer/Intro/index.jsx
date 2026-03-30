import React from "react";
import { useLanguage } from "../../../../context/LanguageContext";

const Intro = () => {
  const { t } = useLanguage();

  return (
    <div className=" flex-1 text-white space-y-4">
      <div className="space-y-1">
        <div className="text-2xl font-bold">{t("footer.brand")}</div>
        <div className="flex w-full ">
          <div className="border-[1px] border-amber-500 w-[40%]" />
          <div className="border-[1px] border-whitw w-[60%]" />
        </div>
      </div>
      <div className="font-light mt-12 text-lg">{t("footer.intro")}</div>
    </div>
  );
};

export default Intro;
