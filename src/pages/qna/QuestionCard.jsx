import { useState, useRef, useEffect } from "react";
import { CheckCircle, Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const QuestionCard = ({ question, highlightSearchTerm }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [isFullAnswerVisible, setIsFullAnswerVisible] = useState(false);
  const contentRef = useRef(null);
  const isAnswered = question.status === "answered";
  const isApproved =
    isAnswered && question.answer?.approval_status === "approved";

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
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
    setIsOpen(!isOpen);
  };

  const toggleFullAnswer = () => {
    setIsFullAnswerVisible(!isFullAnswerVisible);
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm transition-all ${
        isApproved
          ? "border-emerald-200 hover:shadow-md"
          : "border-amber-200 hover:shadow-md"
      }`}
    >
      <div
        onClick={toggleOpen}
        className={`px-4 py-3 sm:px-6 sm:py-4 cursor-pointer ${
          isApproved
            ? "bg-emerald-50"
            : isAnswered
            ? "bg-amber-50"
            : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-2">
            {highlightSearchTerm(question?.title)}
          </h2>
          <div className="flex items-center justify-between sm:justify-normal">
            <div
              className={`flex items-center sm:mr-3 text-sm sm:text-base ${
                isApproved
                  ? "text-emerald-600"
                  : isAnswered
                  ? "text-amber-600"
                  : "text-gray-500"
              }`}
            >
              {isApproved ? (
                <>
                  <CheckCircle size={16} className="mr-1" /> {t("qna.approved")}
                </>
              ) : isAnswered ? (
                <>
                  <Clock size={16} className="mr-1" /> {t("qna.pending")}
                </>
              ) : (
                <>
                  <Clock size={16} className="mr-1" /> {t("qna.awaiting")}
                </>
              )}
            </div>
            {isOpen ? (
              <ChevronUp
                size={20}
                className="transition-transform duration-300"
              />
            ) : (
              <ChevronDown
                size={20}
                className="transition-transform duration-300"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 mb-2 gap-1">
          <User size={12} className="mr-1" />
          <span>
            {t("qna.askedBy")} {question.user_name}
          </span>
          <span className="mx-1 sm:mx-2">•</span>
          <span>{formatDate(question.created_at)}</span>
        </div>

        {/* Animated content area */}
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ height: `${contentHeight}px` }}
        >
          <p className="text-gray-700 text-xs sm:text-sm pt-2">
            {question.content}
          </p>
        </div>
      </div>

      {/* Animated answer section */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen && isAnswered ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        {isAnswered && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100">
            <div className="mb-3">
              <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                {t("qna.answer")}
              </h3>
              <div className="prose prose-sm mt-2 text-gray-700 whitespace-pre-line text-xs sm:text-sm">
                {isFullAnswerVisible
                  ? question?.answer.content
                  : question?.answer.content.length > 300
                  ? `${question?.answer.content.substring(0, 300)}...`
                  : question.answer.content}
              </div>
            </div>

            {question?.answer.mufti_name && (
              <div className="flex flex-wrap items-center mt-4 text-xs sm:text-sm gap-1">
                <span className="text-gray-600">
                  {t("qna.answeredBy")}{" "}
                  <span className="font-medium">
                    {question.answer.mufti_name}
                  </span>
                </span>
                <span className="mx-1 sm:mx-2 text-gray-400">•</span>
                <span className="text-gray-500">
                  {formatDate(question.answer.created_at)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {isOpen && isAnswered && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium cursor-pointer"
            onClick={toggleFullAnswer}
          >
            {isFullAnswerVisible ? t("qna.readLess") : t("qna.readFullAnswer")}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
