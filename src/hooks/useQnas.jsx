import { useEffect, useState } from "react";
import { authApiClient, setAuthToken } from "../api/backendApi";
import { useQnaContext } from "../context/QnaContext";
import { useAuthData } from "../context/AuthContext";

const useQnas = () => {
  const { questions, setQuestions } = useQnaContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuthData();

  setAuthToken(token);

  useEffect(() => {
    const fetchQnas = async () => {
      try {
        const response = await authApiClient.get("api/questions");
        setQuestions(response.data?.results || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    questions.length == 0 && fetchQnas();
  }, [setQuestions]);

  return { questions, isLoading, error };
};

export default useQnas;
