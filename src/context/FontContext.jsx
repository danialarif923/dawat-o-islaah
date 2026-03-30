// src/context/FontContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [activeFont, setActiveFont] = useState("serif");

  useEffect(() => {
    const fetchFont = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/quran/api/fonts/");
        const data = await response.json();
        
        console.log("Font API Response:", data); // Check this in Browser Console!

        if (data.active_font) {
          setActiveFont(data.active_font);
          // We wrap the font name in quotes in case it has spaces
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