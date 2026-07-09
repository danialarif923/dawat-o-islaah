import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useLanguage } from "../../context/LanguageContext";

const Hero = () => {
  const { language, t } = useLanguage();
  const isRtl = language === "ur";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  }, []);

  const containerVariants = useMemo(() => ({
    visible: { transition: { staggerChildren: 0.15 } },
  }), []);

  const slideVariants = useMemo(() => ({
    hidden: { opacity: 0, x: isRtl ? 60 : -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
  }), [isRtl]);

  const slideReverseVariants = useMemo(() => ({
    hidden: { opacity: 0, x: isRtl ? -60 : 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
  }), [isRtl]);

  return (
    <div
      className="relative w-full pt-32 md:pt-28 min-h-[450px] flex items-center overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] via-[#162D4A] to-[#0D1B2A]" />

      <div className={`absolute -top-20 w-72 h-72 bg-[#C9A227]/10 rounded-full blur-3xl animate-float ${isRtl ? "-right-20" : "-left-20"}`} />
      <div className={`absolute top-1/3 w-96 h-96 bg-[#157347]/10 rounded-full blur-3xl animate-float-delayed ${isRtl ? "left-10" : "right-10"}`} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <motion.div
          className={`flex flex-col ${isRtl ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-4 lg:gap-12`}
          initial="hidden"
          animate={ready ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div
            className="w-[200px] h-[200px] flex-shrink-0 will-change-transform"
            variants={slideVariants}
          >
            <DotLottieReact
              src="/assets/Reading%20in%20Quran.lottie"
              autoplay
              loop
              speed={1}
            />
          </motion.div>

          <motion.div
            className={`flex flex-col ${isRtl ? "self-start lg:self-auto items-start text-right" : "items-start text-left"}`}
            variants={slideReverseVariants}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight will-change-transform">
              {t("hero.title")}
            </h1>
            <p className={`mt-4 text-sm sm:text-base md:text-lg text-gray-300 max-w-xl will-change-transform ${isRtl ? "pe-12 sm:pe-16" : ""}`}>
              {t("hero.subtitle")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
