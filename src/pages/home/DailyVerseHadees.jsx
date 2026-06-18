import React, { useState, useEffect, useCallback } from "react";
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
  FaDownload,
  FaTimes,
  FaShare,
} from "react-icons/fa";

const COLORS = {
  verse: { primary: "#22c55e", light: "#dcfce7", dark: "#166534" },
  hadees: { primary: "#3b82f6", light: "#dbeafe", dark: "#1e40af" },
};

const LOGO_URL = "/assets/img/logo.jpeg";

const DailyVerseHadees = () => {
  const { t } = useLanguage();
  const currentDay = new Date().getDate();

  const verseIndex = (currentDay - 1) % verses.length;
  const hadeesIndex = (currentDay - 1) % hadiths.length;

  const verse = verses[verseIndex];
  const hadees = hadiths[hadeesIndex];

  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true));
    const timeout = setTimeout(() => setFontsLoaded(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

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

  const generateImage = async (item, type) => {
    const quranFont = (getComputedStyle(document.documentElement).getPropertyValue("--quran-font").trim() || "'1 MUHAMMADI QURANIC', 'Amiri', serif").replace(/"/g, "'");
    const arabicFont = type === "verse" ? quranFont : "'TraditionNaskh', 'Noto Nastaliq Urdu', serif";
    const safeArabicFont = arabicFont || "'1 MUHAMMADI QURANIC', 'Amiri', serif";
    const c = COLORS[type];

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:fixed;left:0;top:0;z-index:-9999;pointer-events:none;";
    document.body.appendChild(wrapper);

    wrapper.innerHTML = `
      <div style="
        background:white;
        border-radius:16px;
        width:440px;
        overflow:hidden;
        box-shadow:0 8px 30px rgba(0,0,0,0.12);
        font-family:'Segoe UI',system-ui,sans-serif;
      ">
        <div style="
          background:linear-gradient(135deg, ${c.primary}, ${c.dark});
          padding:20px 24px;
          text-align:center;
        ">
          <img src="${LOGO_URL}" style="width:50px;height:50px;border-radius:50%;border:2px solid white;object-fit:cover;display:inline-block;vertical-align:middle;" />
          <span style="color:white;font-size:18px;font-weight:600;margin-left:10px;vertical-align:middle;">Dawat-o-Islaah</span>
        </div>

        <div style="padding:24px 24px 8px;">
          <div style="
            background:${c.light};
            border-radius:50%;
            width:40px;height:40px;
            display:flex;align-items:center;justify-content:center;
            margin:0 auto 16px;
            font-size:20px;
          ">
            ${type === "verse" ? "&#x1F4D6;" : "&#x1F4F0;"}
          </div>

          <p style="font-family:${safeArabicFont};font-size:30px;direction:rtl;text-align:center;line-height:2;margin:0 0 16px;">
            ${item.arabic}
          </p>

          <div style="height:1px;background:linear-gradient(to right,transparent,${c.primary}40,transparent);margin:12px 0;"></div>

          <p style="font-family:'Noto Nastaliq Urdu Local', 'Noto Nastaliq Urdu', serif;font-size:18px;text-align:center;line-height:1.8;margin:0 0 12px;color:#1a1a1a;">
            ${item.urdu}
          </p>

          <p style="font-family:'Merriweather', serif;font-size:15px;text-align:center;line-height:1.6;margin:0 0 12px;color:#444;">
            ${item.english}
          </p>

          <p style="font-size:12px;text-align:right;color:#888;margin:0 0 8px;font-style:italic;">
            ${item.reference}
          </p>
        </div>

        <div style="
          background:#f8f9fa;
          padding:12px 24px;
          text-align:center;
          border-top:1px solid #eee;
        ">
          <span style="font-size:11px;color:#999;">
            ${type === "verse" ? "آیتِ الیوم" : "حدیثِ الیوم"} &bull; Dawat-o-Islaah
          </span>
        </div>
      </div>
    `;

    await new Promise((r) => requestAnimationFrame(r));

    const canvas = await html2canvas(wrapper.firstElementChild, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    wrapper.remove();

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject("toBlob failed");
        resolve(blob);
      }, "image/png");
    });
  };

  const downloadImage = useCallback(async (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownload = useCallback(async (item, type) => {
    setLoading(true);
    try {
      const blob = await generateImage(item, type);
      await downloadImage(blob, `dawat-${type}-${Date.now()}.png`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
      setModalItem(null);
      setModalType(null);
    }
  }, [downloadImage]);

  const handleWhatsApp = useCallback(async (item, type) => {
    setLoading(true);
    let blob;
    try {
      blob = await generateImage(item, type);
      const text = buildText(item);
      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod/i.test(ua);
      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], "share.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: "Dawat-o-Islaah" }); return; } catch {}
        }
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      const label = type === "verse" ? "Verse of the Day" : "Hadith of the Day";
      alert(`Text of ${label} will be sent to your selected contacts.\n\nIn order to send a screenshot, press Ctrl+V in your selected contact's chat.`);
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text + "\n\n— Dawat-o-Islaah")}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      if (blob) {
        await downloadImage(blob, `whatsapp-${type}-${Date.now()}.png`);
        alert("Screenshot downloaded.\nOpen WhatsApp Web, attach the image, and send.");
      }
    } finally {
      setLoading(false);
      setModalItem(null);
      setModalType(null);
    }
  }, [generateImage, downloadImage]);

  const handleInstagram = useCallback(async (item, type) => {
    setLoading(true);
    try {
      const blob = await generateImage(item, type);
      const text = buildText(item);
      await downloadImage(blob, `instagram-${type}-${Date.now()}.png`);
      navigator.clipboard.writeText(text);
      alert("Image downloaded and caption copied!\nUpload to Instagram and paste the caption.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setModalItem(null);
      setModalType(null);
    }
  }, [downloadImage]);

  const handleFacebook = useCallback(async (item, type) => {
    setLoading(true);
    try {
      const blob = await generateImage(item, type);
      const text = buildText(item);
      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod/i.test(ua);
      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], "share.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: "Dawat-o-Islaah" }); return; } catch {}
        }
      }
      await downloadImage(blob, `facebook-${type}-${Date.now()}.png`);
      const quote = encodeURIComponent(text);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://dawat-o-islaah.com")}&quote=${quote}`, "_blank");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setModalItem(null);
      setModalType(null);
    }
  }, [downloadImage]);

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
    const c = COLORS[modalType];

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
              onClick={() => handleDownload(modalItem, modalType)}
              disabled={loading}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FaDownload className="text-gray-600" />
              </div>
              <span className="font-medium text-gray-700">Download Image</span>
            </button>

            <button
              onClick={() => handleWhatsApp(modalItem, modalType)}
              disabled={loading}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FaWhatsapp className="text-green-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Share to WhatsApp</span>
            </button>

            <button
              onClick={() => handleInstagram(modalItem, modalType)}
              disabled={loading}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <FaInstagram className="text-pink-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Share to Instagram</span>
            </button>

            <button
              onClick={() => handleFacebook(modalItem, modalType)}
              disabled={loading}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FaFacebook className="text-blue-600 text-xl" />
              </div>
              <span className="font-medium text-gray-700">Share to Facebook</span>
            </button>
          </div>

          {loading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Generating image...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCard = (item, type, title, color) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center">
        {title}
      </h3>

      <div style={{ ...cardStyle, borderTop: `4px solid ${color}` }}>
        <p className={type === "verse" ? "font-quran" : "font-hadith"} style={{ fontSize: 32, textAlign: "center", direction: "rtl" }}>
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

        <div className="flex items-center gap-3 mt-5 justify-center">
          <button
            onClick={() => copyText(item)}
            className={`${buttonBase} bg-gray-200 hover:bg-gray-300 flex-1`}
          >
            <FaCopy /> Copy Text
          </button>

          <button
            onClick={() => openShareModal(item, type)}
            disabled={!fontsLoaded}
            className={`${buttonBase} flex-1 bg-gray-200 hover:bg-gray-300`}
          >
            <FaShareAlt className="text-gray-700" /> Share Image
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
