import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import localApiClient from "../../api/hadithApi";
import { useLanguage } from "../../context/LanguageContext";
import ShimmerLoader from "../../components/AppComponents/Hadith/ShimmerLoader";

const STATUS_URDU = {
  Sahih: "صحیح",
  Hasan: "حسن",
  "Da'if": "ضعیف",
  "Maudu'": "موضوع",
  "Marfu'": "مرفوع",
  Mawquf: "موقوف",
  "Maqtu'": "مقطوع",
  Mutawatir: "متواتر",
  Ahad: "آحاد",
};

const urduRegex = new RegExp("[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]");

const HadithDetail = () => {
  const { t, language } = useLanguage();
  const { bookSlug, chapterNo, hadithNumber } = useParams();
  const navigate = useNavigate();

  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHadith = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await localApiClient.get("get-hadith/", {
          params: { book: bookSlug, chapter: chapterNo, hadith: hadithNumber },
        });
        const hadithData =
          response.data?.hadiths?.data?.[0] ??
          response.data?.hadith?.data ??
          response.data?.hadith ??
          response.data?.data?.[0] ??
          response.data;
        setHadith(hadithData);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch hadith");
      } finally {
        setLoading(false);
      }
    };
    fetchHadith();
  }, [bookSlug, hadithNumber]);

  const getBaabName = (h, lang) => {
    const sources = [
      h?.baab, h?.chapter?.baab, h?.baab_name, h?.chapter?.baab_name,
    ];
    for (const src of sources) {
      if (!src) continue;
      const name = lang === "ur" ? (src.nameUrdu || src.name_urdu) : (src.nameEnglish || src.name_english);
      if (name) return name;
    }
    if (lang === "ur" && h?.baab_name_urdu) return h.baab_name_urdu;
    if (lang === "en" && h?.baab_name_english) return h.baab_name_english;
    if (lang === "ur" && h?.chapter?.baab_name_urdu) return h.chapter.baab_name_urdu;
    if (lang === "en" && h?.chapter?.baab_name_english) return h.chapter.baab_name_english;
    return null;
  };

  const cleanDetailed = hadith?.detailedExplanation?.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
  const detailedHasUrdu = cleanDetailed && urduRegex.test(cleanDetailed);

  if (loading) return <ShimmerLoader />;
  if (error) return <p className="text-center text-red-600 my-6">{error}</p>;
  if (!hadith) return <p className="text-center text-gray-500 my-6">Hadith not found.</p>;

  return (
    <div className="container mx-auto px-4 md:px-20 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
        >
          &larr; {language === "ur" ? "واپس" : "Back"}
        </button>
        <Link
          to={`/hadith/${bookSlug}/${chapterNo}${hadithNumber ? `?hadith=${hadithNumber}&book=${bookSlug}` : ""}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {language === "ur" ? "باب پر واپس جائیں" : "Back to Chapter"}
        </Link>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-lg shadow-md border-l-4 border-l-blue-600">
        <div className="flex flex-col mb-2 items-end">
          {hadith?.chapter?.chapterArabic && (
            <p className="text-xl font-quran text-gray-600 leading-8 w-full" style={{ textAlign: "right" }}>{hadith.chapter.chapterArabic}</p>
          )}
          {hadith?.chapter?.chapterUrdu && hadith.chapter.chapterUrdu !== hadith.chapter.chapterEnglish && (
            <p className="text-md text-gray-500 leading-8 w-full text-right">{hadith.chapter.chapterUrdu}</p>
          )}
        </div>

        <div className={`flex justify-between gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}>
          <h3 className={`text-lg font-bold text-gray-900 flex-1 leading-8 ${language === "ur" ? "text-end" : ""}`}>
            {hadith?.chapter?.chapterEnglish}
            {getBaabName(hadith, "en") && (
              <span className="text-green-700 ml-2"> - {getBaabName(hadith, "en")}</span>
            )}
            {hadith?.headingEnglish && " - "} {hadith?.headingEnglish}
          </h3>
          <p className="text-gray-500 text-3xl pb-4 font-quran flex-1 text-end">{hadith?.headingArabic}</p>
        </div>

        <div className={`${language === "ur" ? "" : "text-end"}`}>
          {hadith?.headingUrdu && <p className="text-gray-600 text-lg leading-12">{hadith?.headingUrdu}</p>}

          <div
            className="text-green-600 leading-12 text-3xl font-quran mt-2"
            dangerouslySetInnerHTML={{ __html: hadith?.hadithArabic?.replace(/<\/?p[^>]*>/g, "") }}
          />
        </div>

        <div
          className="text-lg leading-12 pt-2 text-right"
          dangerouslySetInnerHTML={{ __html: hadith?.hadithUrdu?.replace(/<\/?p[^>]*>/g, "") }}
        />
        <div
          className="text-gray-800 pt-2 leading-12"
          dangerouslySetInnerHTML={{ __html: hadith?.hadithEnglish?.replace(/<\/?p[^>]*>/g, "") }}
        />

        {hadith?.reference && (() => {
          const cleanRef = hadith.reference.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
          const hasUrdu = urduRegex.test(cleanRef);
          return (
            <div className="mt-4 text-sm text-gray-500">
              <div className={`font-semibold ${language === "ur" ? "text-right" : ""}`}>
                {language === "ur" ? "حوالہ" : t("hadithCard.reference")}
              </div>
              <div
                className={`text-gray-400 italic leading-8 mt-1 ${hasUrdu ? "text-right" : ""}`}
                dir={hasUrdu ? "rtl" : "ltr"}
                dangerouslySetInnerHTML={{ __html: hadith?.reference?.replace(/<\/?p[^>]*>/g, "") }}
              />
            </div>
          );
        })()}

        {hadith?.detailedExplanation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className={`text-sm font-semibold text-gray-700 mb-1 ${language === "ur" ? "text-right" : ""}`}>
              {language === "ur" ? "شرح" : "Detailed Explanation:"}
            </h4>
            <div
              className={`text-sm text-gray-600 leading-8 ${detailedHasUrdu ? "text-right" : ""}`}
              dir={detailedHasUrdu ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: hadith.detailedExplanation?.replace(/<\/?p[^>]*>/g, "") }}
            />
          </div>
        )}

        {hadith?.status && (
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-semibold">{language === "ur" ? "حالت" : "Status:"}</span>{" "}
            <span className={hadith.status === "Sahih" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {language === "ur" ? (STATUS_URDU[hadith.status] || hadith.status) : hadith.status}
            </span>
          </div>
        )}

        <div className="mt-2 text-sm text-gray-500 text-end">
          <span>{t("hadithCard.hadithNumber")}: {hadith?.hadithNumber}</span>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        {Number(hadithNumber) > 1 ? (
          <Link
            to={`/hadith/${bookSlug}/${chapterNo}/hadith/${Number(hadithNumber) - 1}`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
          >
            &larr; {t("hadithCard.hadithNumber")} {Number(hadithNumber) - 1}
          </Link>
        ) : <div />}
        <Link
          to={`/hadith/${bookSlug}/${chapterNo}/hadith/${Number(hadithNumber) + 1}`}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
        >
          {t("hadithCard.hadithNumber")} {Number(hadithNumber) + 1} &rarr;
        </Link>
      </div>
    </div>
  );
};

export default HadithDetail;
