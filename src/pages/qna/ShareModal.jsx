import { useState } from "react";
import { X, Loader } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

const ShareModal = ({ isOpen, onClose, question, language = "en" }) => {
  const [loading, setLoading] = useState(false);
  const [shareTarget, setShareTarget] = useState(null); // 'whatsapp' or 'facebook'

  if (!isOpen || !question) return null;

  const handleShare = async (target) => {
    setLoading(true);
    setShareTarget(target);

    // 1. Create temporary off-screen container for rendering
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "600px";
    container.style.padding = "30px";
    container.style.backgroundColor = "#0B131A"; // Brand dark slate background
    container.style.color = "#FFFFFF";
    container.style.fontFamily = language === "ur" ? "'Noto Nastaliq Urdu', serif" : "'Merriweather', serif";
    container.style.borderRadius = "12px";
    container.style.border = "1px solid #233857";
    container.style.direction = language === "ur" ? "rtl" : "ltr";

    const headerHtml = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <img src="/assets/logo.jpeg" alt="Logo" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" />
        <div>
          <h2 style="margin: 0; font-size: 18px; color: #C9A227; font-weight: bold;">Dawat o Islaah</h2>
          <span style="font-size: 10px; color: #9CA3AF;">Islam Question & Answer</span>
        </div>
      </div>
      <div style="height: 1px; background-color: #233857; margin-bottom: 20px;"></div>
    `;

    const questionHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #FFFFFF; font-weight: bold;">${question.title}</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #D1D5DB; white-space: pre-wrap;">${question.content || question.question}</p>
      </div>
    `;

    const answerContent = question.answer?.content || question.answer || "";
    const answerHtml = `
      <div style="background-color: #132232; border-left: 4px solid #029E65; border-right: ${language === 'ur' ? '4px solid #029E65' : 'none'}; padding: 15px; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #E5E7EB; white-space: pre-wrap;">${answerContent}</p>
      </div>
    `;

    container.innerHTML = `${headerHtml}${questionHtml}${answerContent ? answerHtml : ""}`;
    document.body.appendChild(container);

    try {
      // 2. Render container to Canvas
      const canvas = await html2canvas(container, {
        backgroundColor: "#0B131A",
        useCORS: true,
        scale: 1.5,
        logging: false,
        width: 600
      });

      // Remove temporary element
      document.body.removeChild(container);

      // 3. Convert Canvas to Blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas blob conversion failed"));
        }, "image/png");
      });

      // 4. Upload to public anonymous hosting (file.io)
      const formData = new FormData();
      formData.append("file", blob, "answer.png");

      const response = await fetch("https://file.io/?expires=1d", {
        method: "POST",
        body: formData,
      });

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.message || "Failed to upload image");
      }

      const fileUrl = resJson.link;

      // 5. Open social share dialog
      let shareUrl = "";
      const textMessage = `${language === "ur" ? "دعوت و اصلاح - سوال و جواب" : "Dawat o Islaah - Islam Q&A"}: ${question.title}`;

      if (target === "whatsapp") {
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage + "\n" + fileUrl)}`;
      } else if (target === "facebook") {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fileUrl)}&quote=${encodeURIComponent(textMessage)}`;
      }

      window.open(shareUrl, "_blank", "noopener,noreferrer");
      toast.success(
        language === "ur"
          ? "شیئر لنک کامیابی سے تیار ہو گیا ہے!"
          : "Share link successfully generated and opened!"
      );
      onClose();
    } catch (error) {
      console.error("Failed to share screenshot:", error);
      toast.error(
        language === "ur"
          ? "تصویر شیئر کرنے میں خرابی۔ متبادل متن شیئر کیا جا رہا ہے۔"
          : "Error sharing image. Falling back to text-only share."
      );
      
      // Fallback text-only share
      let fallbackUrl = "";
      const currentUrl = window.location.href;
      const fallbackText = `${question.title}\n\n${language === "ur" ? "مزید پڑھیں:" : "Read more at:"} ${currentUrl}`;
      
      if (target === "whatsapp") {
        fallbackUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fallbackText)}`;
      } else if (target === "facebook") {
        fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
      }
      
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      onClose();
    } finally {
      setLoading(false);
      setShareTarget(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#132232] rounded-2xl border border-gray-200 dark:border-[#233857] w-full max-w-md p-6 relative shadow-2xl transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
          disabled={loading}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center border-b pb-3 border-gray-100 dark:border-[#233857]">
          {language === "ur" ? "جواب شیئر کریں" : "Share Answer"}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-4">
          {/* WhatsApp Button */}
          <button
            onClick={() => handleShare("whatsapp")}
            disabled={loading}
            className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl text-white font-medium transition cursor-pointer ${
              loading && shareTarget === "whatsapp"
                ? "bg-green-600/70"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg shadow-sm"
            }`}
          >
            {loading && shareTarget === "whatsapp" ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <FaWhatsapp size={22} />
            )}
            <span>
              {loading && shareTarget === "whatsapp"
                ? language === "ur"
                  ? "تصویر تیار ہو رہی ہے..."
                  : "Generating image..."
                : language === "ur"
                ? "واٹس ایپ پر شیئر کریں"
                : "Share on WhatsApp"}
            </span>
          </button>

          {/* Facebook Button */}
          <button
            onClick={() => handleShare("facebook")}
            disabled={loading}
            className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl text-white font-medium transition cursor-pointer ${
              loading && shareTarget === "facebook"
                ? "bg-blue-700/70"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-sm"
            }`}
          >
            {loading && shareTarget === "facebook" ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <FaFacebook size={22} />
            )}
            <span>
              {loading && shareTarget === "facebook"
                ? language === "ur"
                  ? "تصویر تیار ہو رہی ہے..."
                  : "Generating image..."
                : language === "ur"
                ? "فیس بک پر شیئر کریں"
                : "Share on Facebook"}
            </span>
          </button>
        </div>

        {/* Loading Overlay Hint */}
        {loading && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
            {language === "ur"
              ? "تصویر اپ لوڈ کی جا رہی ہے، براہ کرم انتظار کریں..."
              : "Uploading screenshot to share link, please wait..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
