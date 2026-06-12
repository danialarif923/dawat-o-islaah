import { useEffect, useState } from "react";
import { publicApiClient } from "../api/backendApi";
import { useQnaContext } from "../context/QnaContext";

const useQnas = () => {
  const { questions, setQuestions } = useQnaContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQnas = async () => {
      try {
        const response = await publicApiClient.get("api/questions");
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
