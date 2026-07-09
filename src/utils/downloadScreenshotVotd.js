import html2canvas from "html2canvas";

function getQuranFont() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--quran-font").trim();
  if (!raw) return '"Amiri", serif';
  return raw;
}

function getIslamicDate() {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatter.format(new Date());
}

function getGregorianDate() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatter.format(new Date());
}

function parseReference(ref) {
  const parts = ref.split(" - Hadith ");
  if (parts.length === 2) {
    return { book: parts[0], number: `Hadith ${parts[1]}` };
  }
  return { book: ref, number: "" };
}

const EMERALD = "#157347";
const GOLD = "#c9a227";

const downloadScreenshotVotd = async (item, type) => {
  const isVerse = type === "verse";
  const typeLabel = isVerse ? "Verse of the Day" : "Hadith of the Day";

  const bgColor = isVerse ? EMERALD : GOLD;
  const accentColor = isVerse ? GOLD : EMERALD;
  const contentColor = isVerse ? "#ffffff" : "#2d2d2d";
  const mutedColor = isVerse ? "#d1d5db" : "#5a5a5a";
  const borderColor = isVerse ? "#c9a227" : "#157347";
  const logoBorder = isVerse ? GOLD : EMERALD;
  const brandColor = isVerse ? GOLD : EMERALD;

  const arabicFont = isVerse
    ? getQuranFont()
    : '"TraditionNaskh", serif';
  const filename = `${type}-${(item.reference || type).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")}.png`;

  const refInfo = parseReference(item.reference);

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "650px";
  container.style.padding = "40px";
  container.style.backgroundColor = bgColor;
  container.style.color = contentColor;
  container.style.borderRadius = "16px";
  container.style.border = `2px solid ${borderColor}`;
  container.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3)";
  container.style.fontFamily = "'OptimaNovaLTPro', serif";

  const headerHtml = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="/assets/logo.jpeg" alt="Logo" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid ${logoBorder};" />
        <div>
          <h2 style="margin: 0; font-size: 18px; color: ${brandColor}; font-weight: bold;">Dawat o Islaah</h2>
          <span style="font-size: 11px; color: ${mutedColor};">dawatoislaah.com</span>
        </div>
      </div>
      <div style="text-align: right; font-size: 11px; color: ${mutedColor}; line-height: 1.6;">
        <div>${getGregorianDate()}</div>
        <div style="color: ${accentColor};">${getIslamicDate()}</div>
      </div>
    </div>
    <div style="height: 2px; background: linear-gradient(to right, ${accentColor}, transparent); margin-bottom: 25px;"></div>
  `;

  const badgeHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; background: ${accentColor}; color: ${isVerse ? "#157347" : "#ffffff"}; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; height: 22px; line-height: 22px; padding: 0 14px; border-radius: 11px;">${typeLabel}</span>
    </div>
  `;

  const arabicHtml = `
    <div style='font-family: ${arabicFont}; font-size: 32px; line-height: 2.2; text-align: center; direction: rtl; margin-bottom: 32px; color: ${contentColor}; word-spacing: 0.1em;'>
      ${item.arabic}
    </div>
  `;

  const urduHtml = `
    <div style="font-family: 'Jameel Noori Nastaleeq Regular', serif; font-size: 18px; line-height: 2; text-align: center; direction: rtl; margin-bottom: 16px; color: ${mutedColor};">
      ${item.urdu}
    </div>
  `;

  const englishHtml = `
    <div style="font-family: 'OptimaNovaLTPro', serif; font-size: 16px; line-height: 1.7; text-align: center; margin-bottom: 20px; color: ${mutedColor};">
      ${item.english}
    </div>
  `;

  const refHtml = `
    <div style="font-size: 13px; color: ${accentColor}; text-align: center; font-weight: 600; margin-bottom: 25px;">
      ${isVerse ? `<span>${refInfo.book}</span>` : `<span>${refInfo.book}</span>`}
      ${refInfo.number ? `<span style="color: ${mutedColor}; font-weight: 400;"> — ${refInfo.number}</span>` : ""}
    </div>
  `;

  const footerHtml = `
    <div style="height: 1px; background-color: ${accentColor}; opacity: 0.3; margin-bottom: 15px;"></div>
    <div style="text-align: center; font-size: 11px; color: ${mutedColor};">
      For more authentic Islamic knowledge, visit dawatoislaah.com
    </div>
  `;

  container.innerHTML = `
    ${headerHtml}
    ${badgeHtml}
    ${arabicHtml}
    ${urduHtml}
    ${englishHtml}
    ${refHtml}
    ${footerHtml}
  `;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: bgColor,
      useCORS: true,
      scale: 2,
      logging: false,
      width: 650,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
};

export default downloadScreenshotVotd;
