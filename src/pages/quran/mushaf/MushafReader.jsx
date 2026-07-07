import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import mushafLayouts from "../../../data/mushafLayouts";
import { useLanguage } from "../../../context/LanguageContext";

const ARABIC_SURAH_NAMES = {
  1:"الفاتحة",2:"البقرة",3:"آل عمران",4:"النساء",5:"المائدة",6:"الأنعام",7:"الأعراف",
  8:"الأنفال",9:"التوبة",10:"يونس",11:"هود",12:"يوسف",13:"الرعد",14:"إبراهيم",
  15:"الحجر",16:"النحل",17:"الإسراء",18:"الكهف",19:"مريم",20:"طه",21:"الأنبياء",
  22:"الحج",23:"المؤمنون",24:"النور",25:"الفرقان",26:"الشعراء",27:"النمل",
  28:"القصص",29:"العنكبوت",30:"الروم",31:"لقمان",32:"السجدة",33:"الأحزاب",
  34:"سبأ",35:"فاطر",36:"يس",37:"الصافات",38:"ص",39:"الزمر",40:"غافر",
  41:"فصلت",42:"الشورى",43:"الزخرف",44:"الدخان",45:"الجاثية",46:"الأحقاف",
  47:"محمد",48:"الفتح",49:"الحجرات",50:"ق",51:"الذاريات",52:"الطور",
  53:"النجم",54:"القمر",55:"الرحمن",56:"الواقعة",57:"الحديد",58:"المجادلة",
  59:"الحشر",60:"الممتحنة",61:"الصف",62:"الجمعة",63:"المنافقون",64:"التغابن",
  65:"الطلاق",66:"التحريم",67:"الملك",68:"القلم",69:"الحاقة",70:"المعارج",
  71:"نوح",72:"الجن",73:"المزمل",74:"المدثر",75:"القيامة",76:"الإنسان",
  77:"المرسلات",78:"النبأ",79:"النازعات",80:"عبس",81:"التكوير",82:"الإنفطار",
  83:"المطففين",84:"الإنشقاق",85:"البروج",86:"الطارق",87:"الأعلى",88:"الغاشية",
  89:"الفجر",90:"البلد",91:"الشمس",92:"الليل",93:"الضحى",94:"الشرح",
  95:"التين",96:"العلق",97:"القدر",98:"البينة",99:"الزلزلة",100:"العاديات",
  101:"القارعة",102:"التكاثر",103:"العصر",104:"الهمزة",105:"الفيل",106:"قريش",
  107:"الماعون",108:"الكوثر",109:"الكافرون",110:"النصر",111:"المسد",112:"الإخلاص",
  113:"الفلق",114:"الناس"
};

const MushafReader = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const layout = mushafLayouts.find((l) => l.slug === slug);

  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jumpInput, setJumpInput] = useState("");

  useEffect(() => {
    if (!layout) {
      setError("Layout not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/quran/api/quran/mushaf/page/?layout=${slug}&page=${currentPage}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load page");
        return r.json();
      })
      .then((data) => {
        setPageData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, currentPage, layout]);

  const getPageFontConfig = (slug, page) => {
    let fontName = null;
    let url = null;
    if (slug.startsWith('kfgqpc-v1')) {
      fontName = `font-v1-p${page}`;
      url = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v1-optimized/woff2/p${page}.woff2`;
    } else if (slug.startsWith('kfgqpc-v2')) {
      fontName = `font-v2-p${page}`;
      url = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v2/woff2/p${page}.woff2`;
    } else if (slug.startsWith('kfgqpc-v4')) {
      fontName = `font-v4-p${page}`;
      url = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v4-tajweed/woff2/p${page}.woff2`;
    } else if (slug.startsWith('kfgqpc-nastaleeq')) {
      fontName = `font-nastaleeq-p${page}`;
      url = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/nastaleeq/woff2/p${page}.woff2`;
    } else if (slug === 'mushaf-qatar') {
      fontName = `font-qatar-p${page}`;
      url = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/qatar/woff2/p${page}.woff2`;
    }
    return { fontName, url };
  };

  const fontConfig = getPageFontConfig(slug, currentPage);

  if (!layout) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-red-500 text-lg">{t("quran.layoutNotFound") || "Layout not found"}</p>
        <Link to="/quran" className="text-blue-600 underline mt-4 inline-block">{t("quran.backToQuran")}</Link>
      </div>
    );
  }

  const totalPages = layout.totalPages || pageData?.total_pages || currentPage;
  const linesPerPage = layout.linesPerPage || 15;

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (!totalPages || currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleJump = (e) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (num >= 1 && (!totalPages || num <= totalPages)) {
      setCurrentPage(num);
      setJumpInput("");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Link to="/quran" className="text-blue-600 hover:underline text-sm">&larr; {t("quran.backToQuran")}</Link>
        <h1 className="text-lg font-bold text-center flex-1">{layout.name}</h1>
        <div className="text-sm text-gray-500">
          {t("quran.page")} {currentPage}{totalPages ? ` ${t("quran.of")} ${totalPages}` : ""}
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={handlePrev} disabled={currentPage <= 1}
          className="px-4 py-2 bg-white border rounded-md disabled:opacity-30 hover:bg-gray-50">&lt; {t("quran.prev") || "Prev"}</button>
        <form onSubmit={handleJump} className="flex items-center gap-2">
          <input type="number" min="1" max={totalPages} value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder={t("quran.jumpToPage")}
            className="border rounded px-2 py-1 w-28 text-sm" />
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Go</button>
        </form>
        <button onClick={handleNext} disabled={totalPages ? currentPage >= totalPages : false}
          className="px-4 py-2 bg-white border rounded-md disabled:opacity-30 hover:bg-gray-50">{t("quran.next") || "Next"} &gt;</button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="max-w-3xl mx-auto">
          <div className="border-2 border-gray-300 rounded-lg p-8 md:p-12 bg-[#faf9f6] shadow-lg">
            {Array.from({ length: linesPerPage }).map((_, i) => (
              <div key={i} className={`h-7 md:h-9 mb-2 rounded ${i === 0 ? "w-1/2 mx-auto" : "w-full"} bg-gray-200 animate-pulse`} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-gray-400">{t("quran.mushafDataNotReady")}</p>
        </div>
      )}

      {/* Page Content */}
      {fontConfig.url && (
        <style>{`
          @font-face {
            font-family: '${fontConfig.fontName}';
            src: url('${fontConfig.url}') format('woff2');
            font-display: block;
          }
        `}</style>
      )}

      {!loading && !error && pageData && (
        <div className="max-w-3xl mx-auto">
          {pageData.is_svg ? (
            <div
              className="border-2 border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden p-4 flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: pageData.svg }}
            />
          ) : (
            <div className="border-2 border-gray-300 rounded-lg p-8 md:p-12 bg-[#faf9f6] shadow-lg">
              {pageData.lines?.map((line) => (
                <div
                  key={line.line_number}
                  className={`mb-2 ${
                    line.line_type === "surah_name" ? "my-6" : ""
                  } ${line.line_type === "basmallah" ? "my-5" : ""}`}
                  style={{
                    direction: "rtl",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: line.is_centered ? "center" : "space-between",
                    alignItems: "baseline",
                    fontFamily: fontConfig.fontName ? `'${fontConfig.fontName}', serif` : (layout.fontFamily || "indopak-nastaleeq, serif"),
                    width: "100%",
                  }}
                >
                  {line.line_type === "surah_name" && (
                    <span className="text-xl md:text-2xl text-blue-800 font-bold" style={{ textAlign: "center", width: "100%", marginBottom: "8px" }}>
                      {ARABIC_SURAH_NAMES[line.surah_number] || t("surahNames." + line.surah_number) || `Surah ${line.surah_number}`}
                    </span>
                  )}
                  {line.line_type === "basmallah" && (
                    <span className="text-2xl md:text-3xl text-blue-800" style={{ textAlign: "center", width: "100%", marginBottom: "8px" }}>
                      ﷽
                    </span>
                  )}
                  {line.line_type === "ayah" && line.words?.map((w, idx) => {
                    let displayText = w.text;
                    const isLastWord = idx === (line.words?.length - 1);
                    const isEndMarker = displayText.includes('\u06df') || displayText.includes('') || displayText.includes('۝') || displayText.includes('') || displayText.includes('');
                    let ayahNumberStr = '';
                    
                    if (isEndMarker || isLastWord) {
                      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                      ayahNumberStr = w.ayah.toString().split('').map(c => arabicNumbers[c]).join('');
                      
                      if (displayText.includes('\u06df')) {
                        displayText = displayText.replace('\u06df', '');
                      } else if (displayText.includes('')) {
                        displayText = displayText.replace('', '');
                      } else if (displayText.includes('۝')) {
                        displayText = displayText.replace('۝', '');
                      } else if (displayText.includes('')) {
                        displayText = displayText.replace('', '');
                      } else if (displayText.includes('')) {
                        displayText = displayText.replace('', '');
                      }
                    }
                    
                    return (
                      <span
                        key={w.word_index}
                        onClick={() => navigate(`/surah/${w.surah}/ayah/${w.ayah}`)}
                        className="cursor-pointer hover:text-blue-700 hover:bg-yellow-100 px-0.5 rounded transition-colors"
                        style={{ fontFamily: "inherit", position: "relative", display: "inline-flex", alignItems: "baseline" }}
                      >
                        <span style={{ color: "#1a1a1a", fontSize: "1.25rem", lineHeight: "2.2" }}>
                          {displayText}
                        </span>
                        {ayahNumberStr && (
                          <span style={{ color: "#0066cc", fontSize: "0.85rem", marginRight: "2px", marginLeft: "2px", fontWeight: "bold" }}>
                            {ayahNumberStr}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              ))}
              {/* Fill remaining lines for consistent page height */}
              {pageData.lines && Array.from({
                length: Math.max(0, linesPerPage - pageData.lines.length)
              }).map((_, i) => (
                <div key={`empty-${i}`} className="mb-2 leading-[2.2] md:leading-[2.8]" style={{ visibility: "hidden" }}>
                  &nbsp;
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MushafReader;
