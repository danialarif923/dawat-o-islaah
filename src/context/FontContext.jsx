import { createContext, useContext, useState, useEffect } from "react";

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [activeFont, setActiveFont] = useState("serif");

  useEffect(() => {
    const fetchFont = async () => {
      try {
        const response = await fetch("/quran/api/fonts/");
        const data = await response.json();
        if (data.active_font) {
          setActiveFont(data.active_font);
          document.documentElement.style.setProperty(
            "--quran-font",
            `"${data.active_font}", serif`
          );
        }
      } catch (err) {
        console.error("Failed to load global font:", err);
      }
    };
    fetchFont();
  }, []);

  return (
    <FontContext.Provider value={{ activeFont }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => useContext(FontContext);