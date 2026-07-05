import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useLanguage } from "../../context/LanguageContext";
import SourceSearch from "../../components/AppComponents/Home/SourceSearch";

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
      className="relative w-full pt-48 md:pt-44 lg:pt-32 min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] via-[#162D4A] to-[#0D1B2A]" />

      <div className={`absolute -top-20 w-72 h-72 bg-[#C9A227]/10 rounded-full blur-3xl animate-float ${isRtl ? "-right-20" : "-left-20"}`} />
      <div className={`absolute top-1/3 w-96 h-96 bg-[#157347]/10 rounded-full blur-3xl animate-float-delayed ${isRtl ? "left-10" : "right-10"}`} />
      <div className={`absolute -bottom-10 w-80 h-80 bg-[#C9A227]/5 rounded-full blur-3xl animate-float-slow ${isRtl ? "right-1/3" : "left-1/3"}`} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <motion.div
          className={`flex flex-col ${isRtl ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-16`}
          initial="hidden"
          animate={ready ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div
            className="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[26rem] lg:h-[26rem] flex-shrink-0 will-change-transform"
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight will-change-transform">
              {t("hero.title")}
            </h1>
            <p className={`mt-8 text-base sm:text-lg md:text-xl text-gray-300 max-w-xl will-change-transform ${isRtl ? "pe-12 sm:pe-16" : ""}`}>
              {t("hero.subtitle")}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex justify-center mt-10 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <SourceSearch />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
