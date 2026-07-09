// src/main.jsx
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./navigation/Router";
import { AuthProvider } from "./context/AuthContext";
import { FontProvider } from "./context/FontContext";
import { preloadQpcData } from "./data/qpcCache";

preloadQpcData();

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <FontProvider>
      <Router />
    </FontProvider>
  </AuthProvider>
);