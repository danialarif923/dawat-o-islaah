import { useState, useEffect } from "react";
import {
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaRegCommentDots,
  FaChevronDown,
  FaChevronUp,
  FaInbox,
} from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { forumApiClient, setAuthToken } from "../../api/backendApi";
import { useLanguage } from "../../context/LanguageContext";
import { useAuthData } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DiscussionForum = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuthData();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState(["All"]); // Default to All
  const [showModal, setShowModal] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [newQuestionTopic, setNewQuestionTopic] = useState(""); // State for selected topic in modal
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initForum = async () => {
      const token = localStorage.getItem("access");
      if (token) setAuthToken(token);

      setLoading(true);
      await Promise.all([fetchQuestions(), fetchTopics()]);
      setLoading(false);
    };
    initForum();
  }, []);

  const translateTopic = (topic) => {
    if (topic === "All") return t("discussionForum.topicAll");
    const key = "discussionForum.topics." + topic;
    const translated = t(key);
    return translated !== key ? translated : topic;
  };

  const fetchTopics = async () => {
    try {
      // Assumes backend endpoint: GET /api/forum/topics/
      const res = await forumApiClient.get("/api/forum/topics/");
      // Expecting res.data to be an array of strings or objects like [{name: 'Quran'}, ...]
      const fetchedTopics = Array.isArray(res.data)
        ? res.data.map((t) => (typeof t === "string" ? t : t.name))
        : ["Quran", "Hadith", "Fiqh", "General"]; // Fallback if backend fails

      setTopics(["All", ...fetchedTopics]);
    } catch (err) {
      console.error("Fetch Topics Error:", err);
      setTopics(["All", "Quran", "Hadith", "Fiqh", "General"]); // Manual fallback
    }
  };
  const getVoteKey = (qId, aId) => {
    return aId ? `vote_answer_${aId}` : `vote_question_${qId}`;
  };

  const normalizeVotes = (item) => {
    const v = Number(item.votes || 0);
    return {
      ...item,
      upvotes: item.upvotes ?? (v > 0 ? v : 0),
      downvotes: item.downvotes ?? (v < 0 ? Math.abs(v) : 0),
    };
  };

  const fetchQuestions = async () => {
    try {
      const res = await forumApiClient.get("/api/forum/questions/");
      const normalized = (res.data || []).map((q) => ({
        ...normalizeVotes(q),
        answers: (q.answers || []).map(normalizeVotes),
      }));
      setQuestions(normalized);
    } catch (err) {
      console.error("Fetch Questions Error:", err);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    if (!term) return selectedTopic === "All" || q.topic === selectedTopic;

    const matchesTopicFilter =
      selectedTopic === "All" || q.topic === selectedTopic;

    const titleMatch = q.title?.toLowerCase().includes(term);
    const contentMatch = q.content?.toLowerCase().includes(term);
    const topicMatch = q.topic?.toLowerCase().includes(term);
    const answerMatch = q.answers?.some(
      (a) =>
        a.content?.toLowerCase().includes(term) ||
        a.author_name?.toLowerCase().includes(term),
    );

    return matchesTopicFilter && (titleMatch || contentMatch || topicMatch || answerMatch);
  });

  const postQuestion = async () => {
    if (!newQuestionTitle || !newQuestionTopic) {
      alert("Please provide a title and select a topic.");
      return;
    }
    try {
      const res = await forumApiClient.post("/api/forum/questions/", {
        title: newQuestionTitle,
        content: newQuestionContent,
        topic: newQuestionTopic,
      });
      setQuestions([normalizeVotes(res.data), ...questions]);
      setShowModal(false);
      setNewQuestionTitle("");
      setNewQuestionContent("");
      setNewQuestionTopic("");
    } catch (err) {
      alert(
        err.response?.data?.detail || "Error posting question. Please login.",
      );
    }
  };

  const addAnswer = async (questionId, content) => {
    try {
      const res = await forumApiClient.post(
        `/api/forum/questions/${questionId}/answers/`,
        { content },
      );
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers: [...(q.answers || []), res.data] }
            : q,
        ),
      );
    } catch (err) {
      alert(
        err.response?.data?.detail || "Failed to post answer. Please login.",
      );
    }
  };

  const vote = async (qId, aId = null, vType = "up") => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    const voteKey = getVoteKey(qId, aId);
    const existingVote = localStorage.getItem(voteKey);

    if (existingVote === vType) {
      alert("You have already voted.");
      return;
    }

    // Optimistic update — separate upvote/downvote counters
    setQuestions((prev) =>
      prev.map((q) => {
        if (aId) {
          return {
            ...q,
            answers: q.answers?.map((a) => {
              if (a.id !== aId) return a;
              const up = Number(a.upvotes || 0);
              const down = Number(a.downvotes || 0);
              if (vType === "up") {
                return {
                  ...a,
                  upvotes: up + 1,
                  downvotes: existingVote === "down" ? down - 1 : down,
                };
              }
              return {
                ...a,
                downvotes: down + 1,
                upvotes: existingVote === "up" ? up - 1 : up,
              };
            }),
          };
        }
        if (q.id !== qId) return q;
        const up = Number(q.upvotes || 0);
        const down = Number(q.downvotes || 0);
        if (vType === "up") {
          return {
            ...q,
            upvotes: up + 1,
            downvotes: existingVote === "down" ? down - 1 : down,
          };
        }
        return {
          ...q,
          downvotes: down + 1,
          upvotes: existingVote === "up" ? up - 1 : up,
        };
      }),
    );

    if (existingVote) {
      localStorage.removeItem(voteKey);
    }

    try {
      await forumApiClient.post("/api/forum/vote/", {
        questionId: qId,
        answerId: aId,
        type: vType,
      });

      localStorage.setItem(voteKey, vType);
    } catch (err) {
      // Revert on failure
      setQuestions((prev) =>
        prev.map((q) => {
          if (aId) {
            return {
              ...q,
              answers: q.answers?.map((a) => {
                if (a.id !== aId) return a;
                const up = Number(a.upvotes || 0);
                const down = Number(a.downvotes || 0);
                if (vType === "up") {
                  return {
                    ...a,
                    upvotes: up - 1,
                    downvotes: existingVote === "down" ? down + 1 : down,
                  };
                }
                return {
                  ...a,
                  downvotes: down - 1,
                  upvotes: existingVote === "up" ? up + 1 : up,
                };
              }),
            };
          }
          if (q.id !== qId) return q;
          const up = Number(q.upvotes || 0);
          const down = Number(q.downvotes || 0);
          if (vType === "up") {
            return {
              ...q,
              upvotes: up - 1,
              downvotes: existingVote === "down" ? down + 1 : down,
            };
          }
          return {
            ...q,
            downvotes: down - 1,
            upvotes: existingVote === "up" ? up + 1 : up,
          };
        }),
      );

      if (err.response?.status === 401) {
        navigate("/signin");
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#157347] text-white py-12 text-center">
        <h1 className="text-4xl font-bold">{t("discussionForum.pageTitle")}</h1>
        <p className="mt-2 opacity-90">{t("discussionForum.subtitle")}</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-[#157347] mb-4 text-lg">
              {t("discussionForum.categories")}
            </h3>
            <div className="space-y-1">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition font-medium ${selectedTopic === t ? "bg-[#157347] text-white shadow-md" : "hover:bg-gray-100 text-gray-700"}`}
                >
                  {translateTopic(t)}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-[420px]">
            <h3 className="font-bold text-[#157347] mb-4 text-lg">{t("discussionForum.search")}</h3>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("discussionForum.searchPlaceholder")}
              className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#157347] border-gray-200"
            />
          </div>
        </div>

        {/* Feed */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {translateTopic(selectedTopic)} {t("discussionForum.discussions")}
            </h2>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/signin");
                  return;
                }
                setShowModal(true);
              }}
              className="bg-[#C9A227] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-[#b08d20] transition"
            >
              <FaPlus /> {t("discussionForum.askQuestion")}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              {t("discussionForum.loading")}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
              <FaInbox className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">
                {t("discussionForum.noQuestions")}
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden transition hover:shadow-md"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === q.id ? null : q.id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-gray-100 text-[#157347] mb-2 inline-block">
                        {translateTopic(q.topic)}
                      </span>
                      <h3 className="text-xl font-semibold text-[#0d59b5] hover:text-[#0a4a96] transition">
                        {q.title}
                      </h3>
                    </div>
                    {expandedId === q.id ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex gap-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          vote(q.id, null, "up");
                        }}
                        className="hover:text-[#157347] transition flex items-center gap-1"
                      >
                        <FaArrowUp /> {q.upvotes ?? 0}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          vote(q.id, null, "down");
                        }}
                        className="hover:text-red-500 transition flex items-center gap-1"
                      >
                        <FaArrowDown /> {q.downvotes ?? 0}
                      </button>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <FaRegCommentDots /> {q.answers?.length || 0} {t("discussionForum.answers")}
                    </span>
                    <span className="ml-auto">
                      {t("discussionForum.askedBy")} <strong>{q.author_name}</strong>
                    </span>
                  </div>
                </div>

                {expandedId === q.id && (
                  <div className="px-6 pb-6 border-t bg-gray-50/50 pt-5">
                    <div
                      className="prose prose-sm max-w-none mb-8 text-gray-800"
                      dangerouslySetInnerHTML={{ __html: q.content.replace(/<\/?p[^>]*>/g, "") }}
                    />

                    <div className="space-y-4">
                      <h4 className="font-bold border-b pb-2 text-gray-700 flex justify-between">
                        {t("discussionForum.answers")}
                        <span className="text-xs font-normal text-gray-400">
                          {q.answers?.length || 0} total
                        </span>
                      </h4>

                      {/* ✅ "No answers found" Placeholder */}
                      {!q.answers || q.answers.length === 0 ? (
                        <div className="py-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-400 text-sm italic">
                            {t("discussionForum.noAnswers")}
                          </p>
                        </div>
                      ) : (
                        q.answers.map((a) => (
                          <div
                            key={a.id}
                            className="bg-white p-4 rounded-lg border shadow-sm border-gray-100"
                          >
                            <div
                              className="text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: a.content.replace(/<\/?p[^>]*>/g, "") }}
                            />
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-[11px] text-gray-400">
                              <span>
                                By{" "}
                                <span className="text-gray-600 font-medium">
                                  {a.author_name}
                                </span>
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => vote(q.id, a.id, "up")}
                                  className="hover:text-[#157347] transition"
                                >
                                  Helpful ({a.upvotes ?? 0})
                                </button>
                                <button
                                  onClick={() => vote(q.id, a.id, "down")}
                                  className="hover:text-red-500 transition"
                                >
                                  Not helpful ({a.downvotes ?? 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      <div className="mt-8">
                        <h4 className="text-sm font-bold text-gray-600 mb-3">
                          {t("discussionForum.yourContribution")}
                        </h4>
                        <AnswerEditor
                          onSubmit={(content) => addAnswer(q.id, content)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t("discussionForum.askNewQuestion")}
            </h2>

            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    {t("discussionForum.title")}
                  </label>
                <input
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder={t("discussionForum.questionPlaceholder")}
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#157347]"
                />
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    {t("discussionForum.topic")}
                  </label>
                <select
                  value={newQuestionTopic}
                  onChange={(e) => setNewQuestionTopic(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#157347] bg-white"
                >
                  <option value="">{t("discussionForum.selectCategory")}</option>
                  {topics
                    .filter((t) => t !== "All")
                    .map((t) => (
                      <option key={t} value={t}>
                  {translateTopic(t)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    {t("discussionForum.details")}
                  </label>
                <div className="h-48 mb-12">
                  <ReactQuill
                    theme="snow"
                    value={newQuestionContent}
                    onChange={setNewQuestionContent}
                    className="h-full rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg"
              >
                {t("discussionForum.cancel")}
              </button>
              <button
                onClick={postQuestion}
                className="bg-[#157347] text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:opacity-90 transition"
              >
                {t("discussionForum.postDiscussion")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnswerEditor = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  return (
    <div className="mt-2">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        placeholder={t("discussionForum.answerPlaceholder")}
        className="bg-white rounded-lg mb-2"
      />
      <button
        onClick={() => {
          if (content && content !== "<p><br></p>") {
            onSubmit(content);
            setContent("");
          }
        }}
        className="mt-2 bg-[#0d59b5] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#0a4a96] transition shadow-sm"
      >
        {t("discussionForum.postAnswer")}
      </button>
    </div>
  );
};

export default DiscussionForum;
