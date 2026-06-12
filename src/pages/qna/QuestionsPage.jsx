import { useState, useEffect, Suspense, lazy } from "react";
import { Search, Plus, X, Leaf, Sun, Moon, Bookmark, MessageSquare, Award, Eye, FileText, ChevronRight, HelpCircle, LogIn } from "lucide-react";
import { useQnaContext } from "../../context/QnaContext";
import useQnas from "../../hooks/useQnas";
import { useLanguage } from "../../context/LanguageContext";
import { useAuthData } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { authApiClient, setAuthToken } from "../../api/backendApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const QuestionCard = lazy(() => import("./QuestionCard"));
const LoadingSpinner = lazy(() => import("./LoadingSpinner"));
const ShareModal = lazy(() => import("./ShareModal"));

const QuestionsPage = () => {
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated } = useAuthData();
  const navigate = useNavigate();
  const { theme: globalTheme } = useTheme();
  const { questions, isLoading, error, refetchQuestions, toggleSave, trackView, getSavedList, categories, qnaTheme, setQnaTheme } = useQnaContext();

  // Sync qnaTheme with global theme on first load
  useEffect(() => {
    setQnaTheme(globalTheme);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("new_answers"); // 'new_answers' or 'saved'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal post question states
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategoryId, setNewCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [posting, setPosting] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  // Share modal state
  const [sharingQuestion, setSharingQuestion] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isRtl = language === "ur";
  const isAdmin = user?.is_staff || false;

  // Helper: safely extract category name string from object {id, name, slug}
  const getCatName = (cat) => {
    if (!cat) return "";
    if (typeof cat === "string") return cat;
    if (typeof cat === "object") return cat.name || cat.slug || String(cat.id || "");
    return String(cat);
  };

  // Extract categories from context - they are already objects
  const displayCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  // Filter questions by search term, active tab, and category selection
  const getFilteredQuestions = (qList) => {
    // The backend already returns only approved questions, so show all of them.
    // Questions may or may not have an answer yet — both are valid to display.
    let result = [...qList];

    // Filter by Active Tab (Saved)
    if (activeTab === "saved") {
      const savedList = getSavedList();
      result = result.filter((q) => savedList.includes(q.id));
    }

    // Filter by Category (using slug)
    if (selectedCategory) {
      result = result.filter((q) => q.category?.slug === selectedCategory);
    }

    // Filter by Search Term
    if (searchTerm.trim() !== "") {
      result = result.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.content || q.question || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  };

  // Base list matching criteria
  const baseFiltered = getFilteredQuestions(questions);

  // "New Answers" sorted by created_at (descending)
  const newAnswersList = [...baseFiltered].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // "Most Viewed" sorted by views_count (descending)
  const mostViewedList = [...baseFiltered].sort(
    (a, b) => (b.views_count || 0) - (a.views_count || 0)
  );

  // "Essential Answers" Score Calculation (Views + Saves + Downloads)
  const getEssentialScore = (q) => (q.view_count || q.views_count || 0) + (q.saves_count || 0) + (q.download_count || q.downloads_count || 0);

  const essentialList = [...questions]
    .sort((a, b) => getEssentialScore(b) - getEssentialScore(a));

  const highlightSearchTerm = (text) => {
    if (!text || !searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-600/30 dark:text-yellow-200 font-medium px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePostQuestionClick = () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    setShowModal(true);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error(isRtl ? "زمرہ کا نام درکار ہے" : "Category name is required");
      return;
    }

    try {
      if (token) setAuthToken(token);
      const response = await authApiClient.post("api/questions/categories/", {
        name: newCategoryName.trim(),
        slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      
      setNewCategoryId(response.data.id);
      setNewCategoryName("");
      setShowNewCategoryForm(false);
      toast.success(isRtl ? "زمرہ بنایا گیا" : "Category created");
    } catch (err) {
      console.error(err);
      toast.error(isRtl ? "زمرہ بنانے میں ناکامی" : "Failed to create category");
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error(isRtl ? "عنوان اور تفصیلات لازمی ہیں۔" : "Title and content are required.");
      return;
    }

    if (!newCategoryId) {
      toast.error(isRtl ? "براہ کرم ایک زمرہ منتخب کریں۔" : "Please select a category.");
      return;
    }

    try {
      setPosting(true);
      if (token) setAuthToken(token);

      await authApiClient.post("api/questions/create/", {
        title: newTitle.trim(),
        content: newContent.trim(),
        category_id: newCategoryId,
      });

      toast.success(isRtl ? "سوال مفتیوں کو بھیج دیا گیا ہے!" : "Question has been sent to muftis!");
      setShowModal(false);
      setNewTitle("");
      setNewContent("");
      setNewCategoryId(null);
      setShowNewCategoryForm(false);
      
      // Reload questions list
      if (refetchQuestions) refetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error(isRtl ? "سوال بھیجنے میں ناکامی۔" : "Failed to post question.");
    } finally {
      setPosting(false);
    }
  };

  const handleShareTrigger = (question) => {
    setSharingQuestion(question);
    setIsShareOpen(true);
  };

  const handleCategoryClick = (categorySlug) => {
    if (selectedCategory === categorySlug) {
      setSelectedCategory(null); // toggle filter off
    } else {
      setSelectedCategory(categorySlug);
    }
  };

  // Scroll and highlight matching card
  const scrollToQuestionCard = (id) => {
    setActiveTab("new_answers");
    setSelectedCategory(null);
    setSearchTerm("");
    
    setTimeout(() => {
      const element = document.getElementById(`question-card-wrapper-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add alert class animation
        element.classList.add("ring-2", "ring-emerald-500", "scale-[1.01]");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-emerald-500", "scale-[1.01]");
        }, 1500);
      }
    }, 150);
  };

  return (
    <div id="qna-root" className={`min-h-screen theme-bg-page transition-colors duration-300 ${qnaTheme === "dark" ? "qna-mode-dark" : ""}`}>
      
      {qnaTheme !== globalTheme && (
        <style>{`
          ${(() => {
            const esc = (s) => s.replace(/[:#[\]/]/g, "\\$&");
            const rules = qnaTheme === "dark"
              ? [
                  ["dark:bg-[#132232]", "background-color", "#132232"],
                  ["dark:bg-[#0B131A]", "background-color", "#0B131A"],
                  ["dark:bg-[#1C2C3E]", "background-color", "#1C2C3E"],
                  ["dark:bg-[#233857]/50", "background-color", "rgba(35,56,87,0.5)"],
                  ["dark:bg-yellow-600/30", "background-color", "rgba(234,179,8,0.3)"],
                  ["dark:bg-emerald-900/10", "background-color", "rgba(6,78,59,0.1)"],
                  ["dark:bg-amber-900/10", "background-color", "rgba(120,53,15,0.1)"],
                  ["dark:text-white", "color", "#fff"],
                  ["dark:text-gray-100", "color", "#f3f4f6"],
                  ["dark:text-gray-300", "color", "#d1d5db"],
                  ["dark:text-gray-400", "color", "#9ca3af"],
                  ["dark:text-yellow-200", "color", "#fde68a"],
                  ["dark:text-emerald-400", "color", "#34d399"],
                  ["dark:text-amber-300", "color", "#fcd34d"],
                  ["dark:border-[#233857]", "border-color", "#233857"],
                  ["dark:border-[#233857]/40", "border-color", "rgba(35,56,87,0.4)"],
                  ["dark:border-[#233857]/50", "border-color", "rgba(35,56,87,0.5)"],
                  ["dark:border-amber-700/30", "border-color", "rgba(180,83,9,0.3)"],
                  ["dark:hover:text-white", "color", "#fff"],
                  ["dark:hover:bg-[#1C2C3E]", "background-color", "#1C2C3E"],
                  ["dark:hover:text-emerald-400", "color", "#34d399"],
                  ["dark:group-hover:text-emerald-400", "color", "#34d399"],
                ]
              : [
                  ["dark:bg-[#132232]", "background-color", "#fff"],
                  ["dark:bg-[#0B131A]", "background-color", "#f3f4f6"],
                  ["dark:bg-[#1C2C3E]", "background-color", "#f9fafb"],
                  ["dark:bg-[#233857]/50", "background-color", "#f3f4f6"],
                  ["dark:bg-yellow-600/30", "background-color", "#fef3c7"],
                  ["dark:bg-emerald-900/10", "background-color", "#ecfdf5"],
                  ["dark:bg-amber-900/10", "background-color", "#fef3c7"],
                  ["dark:text-white", "color", "#111827"],
                  ["dark:text-gray-100", "color", "#374151"],
                  ["dark:text-gray-300", "color", "#4b5563"],
                  ["dark:text-gray-400", "color", "#6b7280"],
                  ["dark:text-yellow-200", "color", "#92400e"],
                  ["dark:text-emerald-400", "color", "#059669"],
                  ["dark:text-amber-300", "color", "#b45309"],
                  ["dark:border-[#233857]", "border-color", "#e5e7eb"],
                  ["dark:border-[#233857]/40", "border-color", "#e5e7eb"],
                  ["dark:border-[#233857]/50", "border-color", "#e5e7eb"],
                  ["dark:border-amber-700/30", "border-color", "#fbbf24"],
                  ["dark:hover:text-white", "color", "#111827"],
                  ["dark:hover:bg-[#1C2C3E]", "background-color", "#f3f4f6"],
                  ["dark:hover:text-emerald-400", "color", "#059669"],
                  ["dark:group-hover:text-emerald-400", "color", "#059669"],
                ];
            const sel = qnaTheme === "dark" ? "#qna-root.qna-mode-dark" : "#qna-root:not(.qna-mode-dark)";
            return rules.map(([cls, prop, val]) => `${sel} .${esc(cls)}{${prop}:${val}}`).join("");
          })()}
        `}</style>
      )}
      
      {/* Top margin buffer to push layout below fixed header banner */}
      <div className="h-28 sm:h-24 md:h-20" />

      {/* Main Grid Wrapper with dir adaptation */}
      <div
        className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        
        {/* COLUMN 1: SIDEBAR (Filters, Theme, Tabs) */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Theme Toggle Card */}
          <div className="theme-bg-card theme-border border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {isRtl ? "تھیم تبدیل کریں" : "Toggle Theme"}
            </h3>
            <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-gray-100/50 w-fit">
              <button
                onClick={() => setQnaTheme("light")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  qnaTheme === "light"
                    ? "bg-emerald-600 text-white shadow-md font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title={isRtl ? "دن" : "Light Theme"}
              >
                <Sun size={16} />
              </button>
              <button
                onClick={() => setQnaTheme("dark")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  qnaTheme === "dark"
                    ? "bg-emerald-600 text-white shadow-md font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title={isRtl ? "رات" : "Dark Theme"}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>

          {/* Sidebar Menu Options */}
          <nav className="theme-bg-card theme-border border rounded-2xl p-4 shadow-sm flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab("new_answers");
                setSelectedCategory(null);
              }}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "new_answers"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "qna-text-dark hover:bg-gray-100 dark:hover:bg-[#1C2C3E]"
              }`}
            >
              <MessageSquare size={18} />
              <span>{isRtl ? "نئے جوابات" : "New Answers"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("saved");
                setSelectedCategory(null);
              }}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "saved"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "qna-text-dark hover:bg-gray-100 dark:hover:bg-[#1C2C3E]"
              }`}
            >
              <Bookmark size={18} />
              <span>{isRtl ? "محفوظ شدہ" : "Saved"}</span>
            </button>
          </nav>

          {/* Categories List Widget */}
          <div className="theme-bg-card theme-border border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              {isRtl ? "اقسام" : "Categories"}
            </h3>
            {displayCategories.length === 0 ? (
              <p className="text-sm qna-text-dark py-2">
                {isRtl ? "کوئی زمرہ دستیاب نہیں" : "No categories found"}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {displayCategories.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm transition font-medium cursor-pointer ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "qna-text-dark hover:bg-gray-100 dark:hover:bg-[#1C2C3E]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={15} />
                        <span>{(() => { const key = "categories." + cat.slug; const translated = t(key); return translated !== key ? translated : cat.name; })()}</span>
                      </span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* COLUMN 2 & 3: MAIN SECTION (Q&A List, Search, Analytics Lists) */}
        <main className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Header & Ask Question Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <MessageSquare className="text-emerald-600" size={28} />
              <h1 className="qna-heading text-2xl sm:text-3xl font-black leading-none select-none">
                {isRtl ? "اسلام سوال و جواب" : "Islam Question & Answer"}
              </h1>
            </div>

            <button
              onClick={handlePostQuestionClick}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition shadow-md hover:shadow-lg font-bold text-sm cursor-pointer whitespace-nowrap"
            >
              <HelpCircle size={18} />
              <span>{isRtl ? "سوال بھیجیں" : "Ask Question"}</span>
            </button>
          </div>

          {/* Guest Login Warning */}
          {!isAuthenticated && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-700/30 dark:bg-emerald-900/10 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm qna-login-text">
                <LogIn size={16} />
                <span>
                  {isRtl
                    ? "سوال پوسٹ کرنے یا جواب دینے کے لیے لاگ ان کریں۔"
                    : "Log in to post a question or answer."}
                </span>
              </div>
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer whitespace-nowrap"
              >
                {isRtl ? "لاگ ان کریں" : "Log In"}
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t("qna.searchPlaceholder")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-[#233857] rounded-xl shadow-sm bg-white dark:bg-[#132232] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              dir="auto"
            />
            <div className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400`}>
              <Search size={18} />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer`}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Questions Render Panels */}
          <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : baseFiltered.length === 0 ? (
              <div className="theme-bg-card theme-border border rounded-2xl p-12 text-center shadow-sm">
                <HelpCircle size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? (isRtl ? `"${searchTerm}" کے متعلق کوئی سوال نہیں ملا` : `No questions found matching "${searchTerm}"`)
                    : activeTab === "saved"
                    ? (isRtl ? "کوئی محفوظ شدہ سوال نہیں ہے" : "You have not saved any questions yet")
                    : (isRtl ? "کوئی سوال دستیاب نہیں" : "No questions available")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                
                {/* 1. Main List: "New Answers" or "Saved Answers" */}
                <section className="flex flex-col gap-4">
                  <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-[#233857]/40 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                    <MessageSquare size={20} className="text-emerald-500" />
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {activeTab === "saved"
                        ? (isRtl ? "محفوظ شدہ جوابات" : "Saved Answers")
                        : (isRtl ? "نئے جوابات" : "New Answers")}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({newAnswersList.length})</span>
                  </div>

                  <div className="grid gap-5 grid-cols-1">
                    {newAnswersList.map((question, idx) => (
                      <div id={`question-card-wrapper-${question.id}`} key={question.id} className="transition-all duration-300">
                        <QuestionCard
                          question={question}
                          index={idx}
                          highlightSearchTerm={highlightSearchTerm}
                          onShare={handleShareTrigger}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Most Viewed Section (only displayed on New Answers tab, as per requirements) */}
                {activeTab === "new_answers" && (
                  <section className="flex flex-col gap-4 mt-4">
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-[#233857]/40 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                      <Eye size={20} className="text-emerald-500" />
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {isRtl ? "سب سے زیادہ دیکھے گئے" : "Most Viewed"}
                      </h2>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({mostViewedList.length})</span>
                    </div>

                    <div className="grid gap-5 grid-cols-1">
                      {mostViewedList.map((question, idx) => (
                        <div id={`most-viewed-card-wrapper-${question.id}`} key={`mv-${question.id}`}>
                          <QuestionCard
                            question={question}
                            index={idx}
                            highlightSearchTerm={highlightSearchTerm}
                            onShare={handleShareTrigger}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}
          </Suspense>
        </main>

        {/* COLUMN 4: RIGHT PANEL (Essential Answers Widget) */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="theme-bg-card theme-border border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            
            {/* Widget Title Header */}
            <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Award size={22} />
              </div>
              <div>
                <h3 className="qna-heading font-extrabold leading-tight tracking-tight">
                  {isRtl ? "ضروری جوابات" : "The Essential Answers"}
                </h3>
                <span className="text-xs text-gray-700 dark:text-gray-400 font-medium">
                  {isRtl ? "نظریات، ڈاؤن لوڈز اور محفوظ شدہ کی بنیاد پر درجہ بندی" : "Ranked by views, downloads & saves"}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-800 dark:text-gray-400 leading-relaxed">
              {isRtl
                ? "اسلام کے بارے میں ایک مضبوت تفہیم پیدا کرنے کے لیے اہم سوالات و جوابات کا ایک خاص مجموعہ۔"
                : "A carefully selected collection of essential answers to build a strong grasp of Islam."}
            </p>

            <div className="height-[1px] bg-gray-100 dark:bg-[#233857]/50 my-1" />

            {/* Essential Answers List */}
            {essentialList.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                {isRtl ? "کوئی جواب دستیاب نہیں" : "No answers available"}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {essentialList.map((q, idx) => {
                  const score = getEssentialScore(q);
                  const views = q.view_count || q.views_count || 0;
                  const downloads = q.download_count || q.downloads_count || 0;
                  const saves = q.saves_count || 0;
                  
                  return (
                    <div
                      key={`essential-${q.id}`}
                      onClick={() => scrollToQuestionCard(q.id)}
                      className={`group flex items-start gap-2.5 p-3 rounded-lg transition cursor-pointer hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/30 ${
                        isRtl ? "text-right flex-row-reverse" : "text-left"
                      }`}
                    >
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded px-2 py-1 whitespace-nowrap">
                        #{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {q.title}
                        </h4>
                        <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500 dark:text-gray-400 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
                          <span className="inline-flex items-center gap-0.5">
                            👁️ <span>{views}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5">
                            ⬇️ <span>{downloads}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5">
                            🔖 <span>{saves}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* Share Modal Dialog */}
      <Suspense fallback={null}>
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => {
            setIsShareOpen(false);
            setSharingQuestion(null);
          }}
          question={sharingQuestion}
          language={language}
        />
      </Suspense>

      {/* Modal for New Question Posting */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#132232] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#233857] max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-3 border-gray-100 dark:border-[#233857]">
              {isRtl ? "نیا سوال پوسٹ کریں" : "Post a new question"}
            </h2>

            {/* Title */}
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {isRtl ? "عنوان" : "Title"}
            </label>
            <input
              type="text"
              placeholder={isRtl ? "سوال کا عنوان درج کریں..." : "Question Title"}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-200 dark:border-[#233857] rounded-xl px-4 py-2.5 mb-4 bg-white dark:bg-[#0B131A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />

            {/* Category selection */}
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {isRtl ? "زمرہ" : "Category"}
            </label>
            <div className="mb-4 flex gap-2">
              <select
                value={newCategoryId || ""}
                onChange={(e) => setNewCategoryId(Number(e.target.value) || null)}
                className="flex-1 border border-gray-200 dark:border-[#233857] rounded-xl px-4 py-2.5 bg-white dark:bg-[#0B131A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">{isRtl ? "زمرہ منتخب کریں" : "Select a category"}</option>
                {displayCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {(() => { const key = "categories." + cat.slug; const translated = t(key); return translated !== key ? translated : cat.name; })()}
                  </option>
                ))}
              </select>
              {isAdmin && (
                <button
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition text-sm"
                >
                  +
                </button>
              )}
            </div>
            
            {/* New Category Form (Admin Only) */}
            {isAdmin && showNewCategoryForm && (
              <div className="mb-4 p-3 border border-emerald-500/30 rounded-xl bg-emerald-500/5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {isRtl ? "نیا زمرہ بنائیں" : "Create New Category"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isRtl ? "زمرہ کا نام..." : "Category name..."}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 border border-gray-200 dark:border-[#233857] rounded-lg px-3 py-2 bg-white dark:bg-[#0B131A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <button
                    onClick={handleCreateCategory}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition text-sm"
                  >
                    {isRtl ? "بنائیں" : "Create"}
                  </button>
                </div>
              </div>
            )}

            {/* Details */}
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {isRtl ? "تفصیلات" : "Details"}
            </label>
            <textarea
              placeholder={isRtl ? "سوال کی مکمل تفصیلات لکھیں..." : "Question Details"}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 dark:border-[#233857] rounded-xl px-4 py-2.5 mb-5 bg-white dark:bg-[#0B131A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />

            <button
              onClick={handleSubmitQuestion}
              disabled={posting}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold transition text-sm cursor-pointer ${
                posting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg"
              }`}
            >
              {posting ? (isRtl ? "جمع کروایا جا رہا ہے..." : "Submitting...") : (isRtl ? "سوال جمع کروائیں" : "Submit Question")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionsPage;
