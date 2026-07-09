import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Bookmark, Download, Share2, Eye, User, Calendar, Clock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useQnaContext } from "../../context/QnaContext";
import { downloadScreenshot } from "../../utils/downloadScreenshot";
import toast from "react-hot-toast";
const QuestionCard = ({ question, index, highlightSearchTerm, onShare }) => {
  const { t, language } = useLanguage();
  const { trackView, toggleSave, trackDownload, getSavedList, qnaTheme } = useQnaContext();
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const isRtl = language === "ur";
  const formattedIndex = String(index + 1).padStart(2, "0");
  const isSaved = getSavedList().includes(question.id);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRtl ? "ur-PK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, question.content]);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      // Trigger view tracking when user opens/clicks the question
      trackView(question.id);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    toggleSave(question.id);
    if (!isSaved) {
      toast.success(isRtl ? "سوال محفوظ کر لیا گیا ہے!" : "Question saved successfully!");
    } else {
      toast.success(isRtl ? "محفوظ شدہ سوالات سے ہٹا دیا گیا!" : "Removed from saved questions!");
    }
  };

  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    try {
      // Register download count
      await trackDownload(question.id);
      // Generate and download screenshot
      await downloadScreenshot(question, language);
      toast.success(isRtl ? "ڈاؤن لوڈ شروع ہو گیا ہے!" : "Download started!");
    } catch (err) {
      console.error(err);
      toast.error(isRtl ? "ڈاؤن لوڈ ناکام ہو گیا!" : "Download failed!");
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onShare(question);
  };

  return (
    <div
      onClick={toggleOpen}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer theme-bg-card theme-border`}
      style={qnaTheme === "light" ? { color: "#000" } : undefined}
    >
      <div className={`p-5 sm:p-6 relative flex flex-col gap-3 ${isRtl ? "text-right" : "text-left"}`}>
        
        {/* Card Header: Index, Badge, Chevron */}
        <div className={`flex items-start justify-between w-full ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          {/* Index and Category Badge */}
          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-2xl font-black text-black dark:text-[#233857] select-none leading-none">
              {formattedIndex}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 select-none">
              {(() => {
                const cat = question.category;
                const name = typeof cat === "object" ? cat?.name : null;
                const slug = typeof cat === "object" ? cat?.slug : null;
                if (slug) { const key = "categories." + slug; const translated = t(key); if (translated !== key) return translated; }
                return name || t("categories.general");
              })()}
            </span>
          </div>

          {/* Chevron */}
          <div className="text-black dark:text-gray-400 hover:text-black dark:hover:text-white transition">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white leading-snug mt-1">
          {highlightSearchTerm ? highlightSearchTerm(question.title) : question.title}
        </h2>

        {/* Expandable Content (Question Details) */}
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ height: `${contentHeight}px` }}
        >
          <div className="pt-2 pb-4 border-b border-gray-100 dark:border-[#233857]/50">
            <p className="text-sm text-black dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {question.content || question.question}
            </p>

            {/* Answer Content */}
            {question.answer && (() => {
              const ans = question.answer;
              const ansContent = ans.content || ans;
              const ansStatus = ans.approval_status || 'approved';
              const isAnsPending = ansStatus === 'pending';

              if (isAnsPending) {
                return (
                  <div className="mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/30 dark:bg-amber-900/10">
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <Clock size={16} />
                      <span className="font-medium">{isRtl ? "جواب زیرِ التواء منظوری ہے" : "Answer pending approval"}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mt-5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {isRtl ? "جواب:" : "Answer:"}
                  </h3>
                  <div className="text-black dark:text-gray-100 leading-relaxed whitespace-pre-wrap" style={{fontSize:"1.3rem"}}>
                    {typeof ansContent === 'string' ? ansContent.replace(/<[^>]+>/g, '') : ''}
                  </div>
                  {ans.updated_by && (
                    <div className={`mt-3 flex items-center gap-1 text-xs text-black dark:text-gray-400 justify-start`}>
                      <User size={12} />
                      <span>
                        {isRtl ? "مفتی:" : "Mufti:"} <strong className="font-semibold text-black dark:text-gray-300">{ans.updated_by}</strong>
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>

        {/* Card Footer Statistics and Action Buttons */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          
          {/* Action Buttons: Save, Download, Share */}
          <div className={`flex items-center gap-4 font-semibold select-none ${isRtl ? "flex-row-reverse" : "flex-row"}`} style={{fontSize:"1.1rem"}}>
            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg border cursor-pointer ${
                isSaved
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-gray-200 dark:border-[#233857] text-black dark:text-gray-300 hover:text-black dark:hover:text-white"
              }`}
            >
              <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
              <span>{isSaved ? (isRtl ? "محفوظ شدہ" : "Saved") : (isRtl ? "محفوظ کریں" : "Save")}</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
              className="flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg border border-gray-200 dark:border-[#233857] text-black dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <Download size={15} />
              <span>{isRtl ? "ڈاؤن لوڈ" : "Download"}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg border border-gray-200 dark:border-[#233857] text-black dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <Share2 size={15} />
              <span>{isRtl ? "شیئر کریں" : "Share"}</span>
            </button>

          </div>

          {/* Question Stats (Views, Saves, Downloads) */}
          <div className={`flex items-center gap-4 text-black dark:text-gray-300 ${isRtl ? "flex-row-reverse" : "flex-row"}`} style={{fontSize:"1.1rem"}}>
            
            {/* Analytics Stats */}
            <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <span className="flex items-center gap-1" title="Views">
                <Eye size={13} />
                <span>{question.view_count || 0}</span>
              </span>
              <span className="flex items-center gap-1" title="Saves">
                <Bookmark size={13} />
                <span>{question.saves_count ?? 0}</span>
              </span>
              <span className="flex items-center gap-1" title="Downloads">
                <Download size={13} />
                <span>{question.download_count || 0}</span>
              </span>
            </div>

          </div>

        </div>

        {/* Date */}
        <div className={`flex items-center justify-center gap-1 text-xs text-black dark:text-gray-300 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          <Calendar size={13} />
          <span>{formatDate(question.created_at)}</span>
        </div>

      </div>
    </div>
  );
};

export default QuestionCard;
