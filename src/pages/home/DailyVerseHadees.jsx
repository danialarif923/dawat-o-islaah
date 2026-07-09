import React, { useState, useEffect } from "react";
import verses from "../../../data/dailyHadithVerse/dailyVerse.json";
import hadiths from "../../../data/dailyHadithVerse/dailyHadith.json";
import { useLanguage } from "../../context/LanguageContext";
import {
  FaShareAlt,
  FaCopy,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import downloadScreenshotVotd from "../../utils/downloadScreenshotVotd";

const COLORS = {
  verse: { primary: "#22c55e", light: "#dcfce7", dark: "#166534" },
  hadees: { primary: "#3b82f6", light: "#dbeafe", dark: "#1e40af" },
};

const DailyVerseHadees = () => {
  const { t, language } = useLanguage();
  const currentDay = new Date().getDate();

  const verseIndex = (currentDay - 1) % verses.length;
  const hadeesIndex = (currentDay - 1) % hadiths.length;

  const verse = verses[verseIndex];
  const hadees = hadiths[hadeesIndex];

  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  const buildText = (item) => {
    return `${item.arabic}

${item.urdu}

${item.english}

📖 ${item.reference}

— Dawat-o-Islaah`;
  };

  const copyText = (item) => {
    navigator.clipboard.writeText(buildText(item));
    alert("Text copied to clipboard!");
  };

  const handleWhatsApp = (item, type) => {
    const text = buildText(item);
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text + "\n\n— Dawat-o-Islaah")}`, "_blank", "noopener,noreferrer");
    setModalItem(null);
    setModalType(null);
  };

  const handleFacebook = (item, type) => {
    const text = buildText(item);
    const quote = encodeURIComponent(text);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://dawat-o-islaah.com")}&quote=${quote}`, "_blank");
    setModalItem(null);
    setModalType(null);
  };

  const handleInstagram = (item, type) => {
    const text = buildText(item);
    navigator.clipboard.writeText(text);
    alert("Caption copied to clipboard!\nPaste it on Instagram.");
    setModalItem(null);
    setModalType(null);
  };

  const handleDownloadImage = async (item, type) => {
    try {
      await downloadScreenshotVotd(item, type, language, t);
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Failed to generate image. Please try again.");
    }
    setModalItem(null);
    setModalType(null);
  };

  const openShareModal = (item, type) => {
    setModalItem(item);
    setModalType(type);
  };

  const closeShareModal = () => {
    setModalItem(null);
    setModalType(null);
  };

  const cardStyle = {
    padding: 20,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  };

  const buttonBase =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition";

  const ShareModal = () => {
    if (!modalItem || !modalType) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={closeShareModal}
      >
        <div
          className="bg-white rounded-2xl p-6 w-80 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Share {modalType === "verse" ? "Verse" : "Hadith"}
            </h3>
            <button
              onClick={closeShareModal}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleWhatsApp(modalItem, modalType)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FaWhatsapp className="text-green-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Share to WhatsApp</span>
            </button>

            <button
              onClick={() => handleDownloadImage(modalItem, modalType)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FaDownload className="text-gray-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Download Image</span>
            </button>

            <button
              onClick={() => handleInstagram(modalItem, modalType)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <FaInstagram className="text-pink-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Share to Instagram</span>
            </button>

            <button
              onClick={() => handleFacebook(modalItem, modalType)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FaFacebook className="text-blue-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Share to Facebook</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (item, type, title, color) => (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center">
        {title}
      </h3>

      <div style={{ ...cardStyle, borderTop: `4px solid ${color}`, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p className={type === "verse" ? "font-quran" : "font-hadith"} style={{ fontSize: 32, textAlign: "center", direction: "rtl", width: "100%" }}>
            {item.arabic}
          </p>
          <p style={{ fontSize: 18, textAlign: "center", marginTop: 10, width: "100%" }}>
            {item.urdu}
          </p>
          <p style={{ fontSize: 16, textAlign: "center", marginTop: 10, width: "100%" }}>
            {item.english}
          </p>
          <p style={{ fontSize: 12, textAlign: "center", marginTop: 14, width: "100%" }}>
            {item.reference}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-5 justify-center">
          <button
            onClick={() => copyText(item)}
            className={`${buttonBase} bg-gray-200 hover:bg-gray-300 flex-1`}
          >
            <FaCopy /> Copy Text
          </button>
          <button
            onClick={() => openShareModal(item, type)}
            className={`${buttonBase} flex-1 bg-gray-200 hover:bg-gray-300`}
          >
            <FaShareAlt className="text-gray-700" /> Share
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:px-32 px-6">
        {renderCard(
          verse,
          "verse",
          t("dailyVerseHadees.verseOfTheDay"),
          "#22c55e",
        )}

        {renderCard(
          hadees,
          "hadees",
          t("dailyVerseHadees.hadeesOfTheDay"),
          "#3b82f6",
        )}
      </div>

      <ShareModal />
    </>
  );
};

export default DailyVerseHadees;
