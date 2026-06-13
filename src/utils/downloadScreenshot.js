import html2canvas from "html2canvas";

/**
 * Generates and downloads a high-quality PNG screenshot of a Q&A card.
 * @param {Object} question - The question object.
 * @param {string} language - The active language ('en' or 'ur').
 */
export const downloadScreenshot = async (question, language = "en") => {
  // 1. Create formatted filename
  const cleanTitle = (question.title || "question")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
  const filename = `${cleanTitle || "question"}.png`;

  // 2. Create off-screen container for rendering
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "650px";
  container.style.padding = "40px";
  container.style.backgroundColor = "#0B131A"; // Premium dark slate background
  container.style.color = "#FFFFFF";
  container.style.fontFamily = language === "ur" ? "'Noto Nastaliq Urdu', serif" : "'Merriweather', serif";
  container.style.borderRadius = "16px";
  container.style.border = "2px solid #233857";
  container.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3)";
  container.style.direction = language === "ur" ? "rtl" : "ltr";

  // Branding Header HTML
  const headerHtml = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <img src="/assets/logo.jpeg" alt="Logo" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #C9A227;" />
        <div>
          <h2 style="margin: 0; font-size: 20px; color: #C9A227; font-weight: bold;">Dawat o Islaah</h2>
          <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em;">Islam Question & Answer</span>
        </div>
      </div>
      <div style="font-size: 12px; color: #C9A227; border: 1px solid #C9A227; padding: 4px 10px; border-radius: 20px;">
        ${question.category?.name || (language === "ur" ? "فتویٰ" : "Fatwa")}
      </div>
    </div>
    <div style="height: 2px; background: linear-gradient(to right, #C9A227, transparent); margin-bottom: 25px;"></div>
  `;

  // Question HTML
  const questionHtml = `
    <div style="margin-bottom: 30px;">
      <div style="font-size: 12px; font-weight: bold; color: #029E65; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        ${language === "ur" ? "سوال" : "Question"}
      </div>
      <h1 style="margin: 0 0 12px 0; font-size: 24px; line-height: 1.4; color: #FFFFFF; font-weight: 700;">
        ${question.title}
      </h1>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #D1D5DB; font-weight: normal; white-space: pre-wrap;">
        ${question.content || question.question}
      </p>
    </div>
  `;

  // Answer HTML
  const answerContent = question.answer?.content || question.answer || "";
  const answerHtml = `
    <div style="background-color: #132232; border-left: 4px solid #029E65; border-right: ${language === "ur" ? "4px solid #029E65" : "none"}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <div style="font-size: 12px; font-weight: bold; color: #029E65; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        ${language === "ur" ? "جواب" : "Answer"}
      </div>
      <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #E5E7EB; white-space: pre-wrap;">
        ${answerContent}
      </p>
      ${question.answer?.mufti_name ? `
        <div style="margin-top: 15px; font-size: 12px; color: #9CA3AF; text-align: ${language === 'ur' ? 'left' : 'right'};">
          — ${language === "ur" ? "مفتی" : "Mufti"}: <strong>${question.answer.mufti_name}</strong>
        </div>
      ` : ""}
    </div>
  `;

  // Footer HTML
  const footerHtml = `
    <div style="text-align: center; font-size: 11px; color: #6B7280; margin-top: 30px; border-t: 1px solid #1E2D4A; padding-top: 15px;">
      ${language === "ur" ? "مزید مستند اسلامی معلومات کے لیے ملاحظہ فرمائیں: dawatoislaah.com" : "For more authentic Islamic information, visit dawatoislaah.com"}
    </div>
  `;

  // Combine and append to DOM
  container.innerHTML = `
    ${headerHtml}
    ${questionHtml}
    ${answerContent ? answerHtml : ""}
    ${footerHtml}
  `;
  document.body.appendChild(container);

  try {
    // 3. Capture element using html2canvas
    const canvas = await html2canvas(container, {
      backgroundColor: "#0B131A",
      useCORS: true,
      scale: 2, // 2x scale for Retina-ready high resolution
      logging: false,
      width: 650,
      onclone: (documentClone) => {
        // Force images to render and styles to be active
        const images = documentClone.getElementsByTagName("img");
        for (let img of images) {
          img.style.display = "block";
        }
      }
    });

    // 4. Download file
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    throw error;
  } finally {
    // 5. Clean up temporary container
    document.body.removeChild(container);
  }
};
