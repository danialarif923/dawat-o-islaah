import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import verses from "../../../data/dailyHadithVerse/dailyVerse.json";
import hadiths from "../../../data/dailyHadithVerse/dailyHadith.json";
import { useLanguage } from "../../context/LanguageContext";
import {
  FaShareAlt,
  FaCopy,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const DailyVerseHadees = () => {
  const { t } = useLanguage();
  const currentDay = new Date().getDate();

  const verseIndex = (currentDay - 1) % verses.length;
  const hadeesIndex = (currentDay - 1) % hadiths.length;

  const verse = verses[verseIndex];
  const hadees = hadiths[hadeesIndex];

  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const hiddenRef = useRef(null);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true));
  }, []);

  const buildText = (item) => {
    return `${item.arabic}

${item.urdu}

${item.english}

📖 ${item.reference}`;
  };

  const copyText = (item) => {
    navigator.clipboard.writeText(buildText(item));
    alert("Text copied to clipboard!");
  };

  const generateImage = async (item, type) => {
    const div = hiddenRef.current;

    div.innerHTML = `
      <div style="
        background:white;
        border-radius:12px;
        width:420px;
        padding:24px;
        box-shadow:0 4px 12px rgba(0,0,0,0.1);
        font-family:'TraditionNaskh','AlQalamQuranPublisher',sans-serif;
        text-align:center;
        position:relative;
      ">
        <div style="
          height:6px;
          width:100%;
          background:${type === "verse" ? "#22c55e" : "#3b82f6"};
          position:absolute;
          top:0;
          left:0;
        "></div>

        <p style="font-size:26px;direction:rtl;margin-top:14px;">
          ${item.arabic}
        </p>

        <p style="font-size:18px;margin-top:12px;">
          ${item.urdu}
        </p>

        <p style="font-size:16px;margin-top:10px;color:#333;">
          ${item.english}
        </p>

        <p style="font-size:13px;margin-top:16px;text-align:right;">
          ${item.reference}
        </p>
      </div>
    `;

    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(div, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject("toBlob failed");
        resolve(blob);
      }, "image/png");
    });
  };

  const handleShare = async (item, type) => {
    setLoading(true);
    try {
      const blob = await generateImage(item, type);
      const file = new File([blob], "daily-card.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Daily Verse / Hadees",
          text: buildText(item),
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "daily-card.png";
        link.click();
        URL.revokeObjectURL(url);
        alert("Image downloaded. You can now share it!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = (item) => {
    const text = encodeURIComponent(buildText(item));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareFacebook = (item) => {
    const text = encodeURIComponent(buildText(item));
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=&quote=${text}`,
      "_blank",
    );
  };

  const shareInstagram = async (item, type) => {
    const blob = await generateImage(item, type);
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "daily-instagram-post.png";
    link.click();

    navigator.clipboard.writeText(buildText(item));

    alert(
      "Image downloaded and caption copied.\nUpload the image to Instagram and paste the caption.",
    );
  };

  const cardStyle = {
    padding: 20,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  };

  const buttonBase =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition";

  const renderCard = (item, type, title, color) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center">
        {title}
      </h3>

      <div style={{ ...cardStyle, borderTop: `4px solid ${color}` }}>
        <p style={{ fontSize: 24, textAlign: "center", direction: "rtl" }}>
          {item.arabic}
        </p>

        <p style={{ fontSize: 18, textAlign: "center", marginTop: 10 }}>
          {item.urdu}
        </p>

        <p style={{ fontSize: 16, textAlign: "center", marginTop: 10 }}>
          {item.english}
        </p>

        <p style={{ fontSize: 12, textAlign: "right", marginTop: 14 }}>
          {item.reference}
        </p>

        <div className="flex flex-col items-center gap-3 mt-5">
          {/* INLINE MAIN BUTTONS */}
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={() => copyText(item)}
              className={`${buttonBase} bg-gray-200 hover:bg-gray-300 flex-1`}
            >
              <FaCopy /> Copy Text
            </button>

            <button
              onClick={() => handleShare(item, type)}
              disabled={loading || !fontsLoaded}
              className={`${buttonBase} flex-1 ${
                loading || !fontsLoaded
                  ? "bg-gray-400"
                  : `${
                      type === "verse"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`
              }`}
            >
              <FaShareAlt /> {loading ? "Processing..." : "Share Image"}
            </button>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => shareWhatsApp(item)}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
            >
              <FaWhatsapp />
            </button>

            <button
              onClick={() => shareFacebook(item)}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <FaFacebook />
            </button>

            <button
              onClick={() => shareInstagram(item, type)}
              className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600"
            >
              <FaInstagram />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
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

      <div
        ref={hiddenRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}
      />
    </div>
  );
};

export default DailyVerseHadees;
