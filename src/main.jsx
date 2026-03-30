// src/main.jsx
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./navigation/Router";
import { AuthProvider } from "./context/AuthContext";
import { FontProvider } from "./context/FontContext"; // 1. Import it

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <FontProvider> {/* 2. Wrap it here */}
      <Router />
    </FontProvider>
  </AuthProvider>
);