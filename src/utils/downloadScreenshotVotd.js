import html2canvas from "html2canvas";
import en from "../../assets/languages/en.json";
import ur from "../../assets/languages/ur.json";

function getLang() {
  return localStorage.getItem("language") || "en";
}

function tr(key) {
  const lang = getLang();
  const data = lang === "ur" ? ur : en;
  const keys = key.split(".");
  let val = data;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) return key;
  }
  return val;
}

function getIslamicDate() {
  const locale = getLang() === "ur" ? "ur-PK-u-ca-islamic" : "en-u-ca-islamic";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
}

function getGregorianDate() {
  const locale = getLang() === "ur" ? "ur-PK" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
}

function translateReference(ref) {
  if (!ref) return ref;
  const match = ref.match(/(\d+):\d+/);
  if (match) {
    const num = match[1];
    const name = ur.surahNames?.[num];
    if (name) return ref.replace(/Surah\s+\S+/, `سورہ ${name}`);
  }
  return ref;
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
  const lang = getLang();
  const isVerse = type === "verse";
  const isUrdu = lang === "ur";

  const typeLabel = isVerse
    ? tr("dailyVerseHadees.verseOfTheDay")
    : tr("dailyVerseHadees.hadeesOfTheDay");

  const footerText = isUrdu
    ? "مزید مستند اسلامی معلومات کے لیے ملاحظہ کریں dawatoislaah.com"
    : "For more authentic Islamic knowledge, visit dawatoislaah.com";

  const bgColor = isVerse ? EMERALD : GOLD;
  const accentColor = isVerse ? GOLD : EMERALD;
  const borderColor = isVerse ? "#c9a227" : EMERALD;
  const logoBorder = isVerse ? GOLD : EMERALD;

  const arabicFont = isVerse
    ? getQuranFont()
    : '"TraditionNaskh", serif';
  const filename = `${type}-${(item.reference || type).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")}.png`;

  const refText = isUrdu && isVerse ? translateReference(item.reference) : item.reference;
  const brandName = isUrdu ? tr("footer.brand") : "Dawat o Islaah";

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "650px";
  container.style.padding = "40px";
  container.style.backgroundColor = bgColor;
  container.style.color = "#ffffff";
  container.style.borderRadius = "16px";
  container.style.border = `2px solid ${borderColor}`;
  container.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3)";
  container.style.fontFamily = "'OptimaNovaLTPro', serif";
  container.style.direction = isUrdu ? "rtl" : "ltr";
  container.style.textAlign = "center";

  const headerHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <img src="/assets/logo.jpeg" alt="Logo" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid ${logoBorder};" />
        <div>
          <h2 style="margin: 0; font-size: 18px; color: ${accentColor}; font-weight: bold;">${brandName}</h2>
          <span style="font-size: 11px; color: #ffffff;">dawatoislaah.com</span>
        </div>
      </div>
      <div style="font-size: 11px; color: #ffffff; line-height: 1.6; unicode-bidi: plaintext;">
        <div>${getGregorianDate()}</div>
        <div>${getIslamicDate()}</div>
      </div>
    </div>
    <div style="height: 2px; background: linear-gradient(to right, ${accentColor}, transparent); margin-bottom: 25px;"></div>
  `;

  const badgeHtml = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <div style="flex: 1; height: 1px; background: linear-gradient(to right, transparent, ${accentColor});"></div>
      <span style="color: ${accentColor}; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; line-height: 1; margin-top: -1px;">${typeLabel}</span>
      <div style="flex: 1; height: 1px; background: linear-gradient(to left, transparent, ${accentColor});"></div>
    </div>
  `;

  const arabicHtml = `
    <div style='font-family: ${arabicFont}; font-size: 32px; line-height: 2.2; text-align: center; direction: rtl; margin-bottom: 32px; color: #ffffff; word-spacing: 0.1em;'>
      ${item.arabic}
    </div>
  `;

  const urduHtml = `
    <div style="font-family: 'Jameel Noori Nastaleeq Regular', serif; font-size: 27px; line-height: 2; text-align: center; direction: rtl; margin-bottom: 16px; color: #ffffff;">
      ${item.urdu}
    </div>
  `;

  const englishHtml = `
    <div style="font-family: 'OptimaNovaLTPro', serif; font-size: 25px; line-height: 1.7; text-align: center; margin-bottom: 20px; color: #ffffff;">
      ${item.english}
    </div>
  `;

  const refHtml = `
    <div style="font-size: 13px; color: #ffffff; text-align: center; font-weight: 600; margin-bottom: 25px;">
      <span>${refText}</span>
    </div>
  `;

  const footerHtml = `
    <div style="height: 1px; background-color: ${accentColor}; opacity: 0.3; margin-bottom: 15px;"></div>
    <div style="text-align: center; font-size: 11px; color: #ffffff;">
      ${footerText}
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
