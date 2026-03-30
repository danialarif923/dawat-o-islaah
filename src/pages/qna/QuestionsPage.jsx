import { useState, useEffect, Suspense, lazy } from "react";
import { Search, Plus, X } from "lucide-react";
import { useQnaContext } from "../../context/QnaContext";
import useQnas from "../../hooks/useQnas";
import { useLanguage } from "../../context/LanguageContext";
import { useAuthData } from "../../context/AuthContext";
import { backendApiClient, setAuthToken } from "../../api/backendApi";
import toast from "react-hot-toast";

const QuestionCard = lazy(() => import("./QuestionCard"));
const LoadingSpinner = lazy(() => import("./LoadingSpinner"));

const QuestionsPage = () => {
  const { t } = useLanguage();
  const { user, token } = useAuthData();
  const { questions, isLoading, error } = useQnas();

  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      setFilteredQuestions([]);
      return;
    }

    const approvalStatusChecked = questions.filter(
      (question) => question.answer?.approval_status === "approved"
    );

    if (searchTerm.trim() === "") {
      setFilteredQuestions(approvalStatusChecked);
      return;
    }

    const filtered = approvalStatusChecked.filter((question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredQuestions(filtered);
  }, [searchTerm, questions]);

  const highlightSearchTerm = (text) => {
    if (!text || !searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">
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
      toast.error("Please log in to post a question.");
      return;
    }
    setShowModal(true);
  };

  const handleSubmitQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      setPosting(true);
      if (token) setAuthToken(token);

      const res = await backendApiClient.post("/questions/", {
        title: newTitle.trim(),
        content: newContent.trim(),
      });

      toast.success("Question has been sent to muftis!");
      setShowModal(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post question.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl ms:text-3xl font-bold text-gray-800 mb-4 md:mb-8 text-center">
        {t("qna.pageTitle")}
      </h1>

      {/* Search Bar & Plus Icon */}
      <div className="mb-4 md:mb-8 flex flex-col sm:flex-row items-stretch gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t("qna.searchPlaceholder")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
        </div>

        <button
          onClick={handlePostQuestionClick}
          className="flex items-center justify-center gap-2 px-4 py-2 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition whitespace-nowrap"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Questions List */}
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        }
      >
        {isLoading && questions.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !filteredQuestions || filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              {searchTerm
                ? t("qna.noQuestionsFound").replace("{term}", searchTerm)
                : t("qna.noQuestionsAvailable")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 md:grid-cols-1">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                highlightSearchTerm={highlightSearchTerm}
              />
            ))}
          </div>
        )}
      </Suspense>

      {/* Modal for New Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {t("postQnaPopup.title")}
            </h2>

            <input
              type="text"
              placeholder={t("postQnaPopup.TitlePlaceHolder")}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <textarea
              placeholder={t("postQnaPopup.DetailsPlaceHolder")}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={handleSubmitQuestion}
              disabled={posting}
              className={`w-full py-2 px-4 rounded text-white transition ${
                posting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {t("postQnaPopup.submitBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
