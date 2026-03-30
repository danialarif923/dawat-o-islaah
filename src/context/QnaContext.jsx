import { createContext, useContext, useState } from "react";

const QnaContext = createContext();

export const QNAProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);

  return (
    <QnaContext.Provider value={{ questions, setQuestions }}>
      {children}
    </QnaContext.Provider>
  );
};

export const useQnaContext = () => {
  return useContext(QnaContext);
};
