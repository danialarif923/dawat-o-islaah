import html2canvas from "html2canvas";

function getQuranFont() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--quran-font").trim();
  if (!raw) return '"Amiri", serif';
  return raw;
}

const EMERALD = "#157347";
const GOLD = "#c9a227";

function getIslamicDate(isUrdu) {
  try {
    const locale = isUrdu ? "ur-PK-u-ca-islamic" : "en-u-ca-islamic";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  } catch (e) {
    return new Intl.DateTimeFormat("en-u-ca-islamic", {
      day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  }
}

function getGregorianDate(isUrdu) {
  try {
    const locale = isUrdu ? "ur-PK" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  } catch (e) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  }
}

function translateRef(ref, t) {
  if (!ref) return ref;
  const m = ref.match(/(\d+):\d+/);
  if (m) {
    const name = t("surahNames." + m[1]);
    if (name && name.indexOf("surahNames.") !== 0) {
      return ref.replace(/Surah\s+\S+/, "سورہ " + name);
    }
  }
  return ref;
}

const downloadScreenshotVotd = async (item, type, lang, t) => {
  let container = null;
  try {
    const isVerse = type === "verse";
    const isUrdu = lang === "ur";

    const typeLabel = isVerse
      ? t("dailyVerseHadees.verseOfTheDay")
      : t("dailyVerseHadees.hadeesOfTheDay");

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

    const refText = isUrdu && isVerse ? translateRef(item.reference, t) : item.reference;
    const brandName = isUrdu ? t("footer.brand") : "Dawat o Islaah";

    container = document.createElement("div");
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
          <div>${getGregorianDate(isUrdu)}</div>
          <div>${getIslamicDate(isUrdu)}</div>
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

    container.innerHTML = [
      headerHtml,
      badgeHtml,
      arabicHtml,
      urduHtml,
      englishHtml,
      refHtml,
      footerHtml,
    ].join("\n");

    document.body.appendChild(container);

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
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

export default downloadScreenshotVotd;
