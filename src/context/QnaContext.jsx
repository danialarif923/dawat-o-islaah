import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApiClient, publicApiClient, setAuthToken } from "../api/backendApi";
import { useAuthData } from "./AuthContext";

const QnaContext = createContext();

const SAVED_LIST_KEY = "qna_saved_list";
const VIEWED_SET_KEY = "qna_viewed_set";
const DOWNLOADED_SET_KEY = "qna_downloaded_set";

const getArray = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const setArray = (key, arr) => {
  localStorage.setItem(key, JSON.stringify(arr));
};

const getSavedIds = () => getArray(SAVED_LIST_KEY);
const setSavedIds = (ids) => setArray(SAVED_LIST_KEY, ids);

export const QNAProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [qnaTheme, setQnaTheme] = useState("light");
  const { token } = useAuthData();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await publicApiClient.get("api/questions");
      setQuestions(response.data?.results || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await publicApiClient.get("api/questions/categories/");
      setCategories(response.data?.results || response.data || []);
    } catch {
      // categories are optional
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [fetchQuestions, fetchCategories]);

  const refetchQuestions = useCallback(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const getSavedList = useCallback(() => {
    return getSavedIds();
  }, []);

  const toggleSave = useCallback(async (questionId) => {
    const saved = getSavedIds();
    const index = saved.indexOf(questionId);
    const wasSaved = index !== -1;
    if (!wasSaved) {
      saved.push(questionId);
    } else {
      saved.splice(index, 1);
    }
    setSavedIds(saved);
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          is_saved: !wasSaved,
          saves_count: Math.max(0, (q.saves_count || 0) + (wasSaved ? -1 : 1)),
        };
      })
    );
    try {
      setAuthToken(token);
      await authApiClient.post(`api/questions/${questionId}/toggle-save/`);
    } catch {
      // silent
    }
  }, [token]);

  const trackView = useCallback(async (questionId) => {
    const viewed = getArray(VIEWED_SET_KEY);
    if (viewed.includes(questionId)) return;
    viewed.push(questionId);
    setArray(VIEWED_SET_KEY, viewed);
    try {
      setAuthToken(token);
      const res = await authApiClient.post(`api/questions/${questionId}/view/`);
      if (res.data?.view_count !== undefined) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, view_count: res.data.view_count } : q))
        );
      }
    } catch {
      // silent
    }
  }, [token]);

  const trackDownload = useCallback(async (questionId) => {
    const downloaded = getArray(DOWNLOADED_SET_KEY);
    if (downloaded.includes(questionId)) return;
    downloaded.push(questionId);
    setArray(DOWNLOADED_SET_KEY, downloaded);
    try {
      setAuthToken(token);
      const res = await authApiClient.post(`api/questions/${questionId}/download/`);
      if (res.data?.download_count !== undefined) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, download_count: res.data.download_count } : q))
        );
      }
    } catch {
      // silent
    }
  }, [token]);

  const postAnswer = useCallback(async (questionId, content) => {
    const response = await authApiClient.post(`api/questions/${questionId}/answer/`, {
      content,
    });
    return response.data;
  }, []);

  return (
    <QnaContext.Provider
      value={{
        questions,
        setQuestions,
        isLoading,
        error,
        refetchQuestions,
        toggleSave,
        trackView,
        trackDownload,
        getSavedList,
        postAnswer,
        categories,
        qnaTheme,
        setQnaTheme,
      }}
    >
      {children}
    </QnaContext.Provider>
  );
};

export const useQnaContext = () => {
  return useContext(QnaContext);
};
