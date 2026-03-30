import React, { useState } from "react";
import { useTranslation } from "../../../../hooks/useTranslation";
import { Link } from "react-router-dom";

const Item = ({ item, closeMenu, isMobile }) => {
  const translation = useTranslation();
  const itemWord = translation?.header?.[item] || item;
  const [isHovered, setIsHovered] = useState(false);

  let route =
    item === "home"
      ? "/"
      : item === "quran"
      ? "quran"
      : item === "hadith"
      ? "hadith"
      : item === "islamicBooks"
      ? "islamicBooks"
      : item === "masail"
      ? "masail"
      : item === "discussionForum"
      ? "discussion-forum"
      : item === "login"
      ? "signin"
      : item === "questionAnswer"
      ? "questions-and-answers"
      : item === "settings"          // ✅ NEW
      ? "settings"
      : "#";

  return (
    <div
      className={`relative group ${isMobile ? "py-2" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={route}
        onClick={closeMenu}
        className={`whitespace-nowrap cursor-pointer uppercase font-bold tracking-tight transition-all duration-300 ${
          isHovered ? "text-white" : "text-[#1E3A5F]"
        } ${
          isMobile
            ? "block text-xl py-1 px-4 hover:bg-[#1E3A5F]/10 rounded-lg"
            : "text-base"
        }`}
      >
        {itemWord}
      </Link>
    </div>
  );
};

export default Item;