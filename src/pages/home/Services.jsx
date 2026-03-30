import React from "react";
// import { FaCalculator, FaClock, FaCompass, FaMosque } from "react-icons/fa";
import InheritanceIcon from "../../../assets/Icons/Inheritance.svg";
import LoansIcon from "../../../assets/Icons/Loan.svg";
import OnTimeIcon from "../../../assets/Icons/On_time.svg";
import QiblaIcon from "../../../assets/Icons/Qibla.svg";
import MosqueIcon from "../../../assets/Icons/The_prophets_mosque.svg";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const Services = () => {
  const { t } = useLanguage();
  const cards = [
    {
      id: 1,
      icon: (
        <img
          src={LoansIcon}
          alt={t("services.zakatCalculator")}
          className="w-18 h-18"
        />
      ),
      title: t("services.zakatCalculator"),
      route: "zakat-calculator",
    },
    {
      id: 2,
      icon: (
        <img
          src={OnTimeIcon}
          alt={t("services.prayerTiming")}
          className="w-18 h-18"
        />
      ),
      title: t("services.prayerTiming"),
      route: "prayer-timings",
    },
    {
      id: 3,
      icon: (
        <img
          src={InheritanceIcon}
          alt={t("services.inheritanceCalculator")}
          className="w-18 h-18"
        />
      ),
      title: t("services.inheritanceCalculator"),
      route: "inheritance-calculator",
    },
    {
      id: 4,
      icon: (
        <img
          src={QiblaIcon}
          alt={t("services.qiblaDirection")}
          className="w-18 h-18"
        />
      ),
      title: t("services.qiblaDirection"),
      route: "qibla-direction",
    },
    {
      id: 5,
      icon: (
        <img
          src={MosqueIcon}
          alt={t("services.nearestMosque")}
          className="w-18 h-18"
        />
      ),
      title: t("services.nearestMosque"),
      route: "nearest-mosque",
    },
  ];

  return (
    <div className="px-6 bg-[#157347] py-14 sm:py-20 sm:px-14 md:px-20 lg:px-32">
      <div className="text-center mb-10">
        <h2 className="uppercase text-white text-2xl lg:text-3xl font-bold">
          {t("services.sectionTitle")}
        </h2>
      </div>
      <div className="flex flex-wrap justify-center xl:justify-between gap-6">
        {cards.map((card) => (
          <Link
            to={card.route}
            key={card.id}
            className=" w-full h-44 sm:w-52 sm:h-44 flex flex-col items-center justify-center bg-[#C9A227] rounded-lg  hover:shadow-md hover:shadow-yellow-200 transition duration-300 cursor-pointer px-2"
          >
            <div className=" mb-4 ">{card.icon}</div>
            <p className="text-[#1E3A5F] text-lg text-center">{card.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Services;
