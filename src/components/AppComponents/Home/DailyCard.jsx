import React from "react";
import { FaShareAlt, FaDownload, FaBookOpen } from "react-icons/fa";

const DailyCard = ({
  arabicText,
  urduText,
  englishText,
  reference,
  isVerse,
  verse,
  hadith,
}) => {
  return (
    <div
      className={`rounded-lg shadow-md p-6 bg-white flex flex-col ${
        isVerse ? "border-t-4 border-green-500" : "border-t-4 border-blue-500"
      }`}
      style={{ minHeight: "380px" }}
    >
      {/* Reference at the top (left-aligned) */}
      <p className="text-xs text-gray-500 text-left mb-2">{reference}</p>

      {/* Content Section */}
      <div className=" flex-grow flex flex-col items-center justify-center">
        {/* Arabic Text (center-aligned) */}
        <p
          className={`text-center text-3xl text-gray-900  leading-loose ${
            verse ? "font-quran" : "font-hadith"
          } `}
        >
          {arabicText}
        </p>

        {/* Urdu Translation (center-aligned) */}
        <p className="text-center text-lg text-gray-800 mt-2 ">{urduText}</p>

        {/* English Translation (center-aligned) */}
        <p className="text-center text-sm text-gray-700 mt-4 mb-4">
          {englishText}
        </p>
      </div>

      {/* Horizontal Rule */}
      {/* <hr className="border-gray-300" /> */}

      {/* Actions Section */}
      {/* <div className="flex flex-col items-center text-base md:text-sm gap-4 md:gap-0 md:flex-row md:justify-between mt-3 text-[#1E3A5F]">
        <button className="flex items-center gap-2 font-medium">
          <FaShareAlt color="black" /> Share Now
        </button>
        <button className="flex items-center gap-2 font-medium">
          <FaDownload color="black" /> Download
        </button>
        <button className="flex items-center gap-2 font-medium">
          <FaBookOpen color="black" /> Read Complete
        </button>
      </div> */}
    </div>
  );
};

export default DailyCard;
