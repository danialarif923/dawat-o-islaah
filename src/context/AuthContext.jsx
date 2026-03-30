import { createContext, useState, useEffect, useContext, useMemo } from "react";

export const AuthContext = createContext();

// ✅ FIX: Separated the hook export to ensure Vite detects it
export const useAuthData = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthData must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const getToken = () =>
    sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

  const getUser = () => {
    const savedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return typeof savedUser === "string" ? JSON.parse(savedUser) : savedUser;
    } catch (e) {
      console.error("Error parsing user from storage", e);
      return null;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedFields };
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(newUser));
      }
      return newUser;
    });
  };

  useEffect(() => {
    const checkAuth = () => {
      const freshToken = getToken();
      const freshUser = getUser();
      setIsAuthenticated(!!freshToken);
      setToken(freshToken);
      setUser(freshUser);
    };

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const login = (newToken, newUser, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("accessToken", newToken);
    storage.setItem("user", JSON.stringify(newUser));

    setIsAuthenticated(true);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      token,
      user,
      login,
      logout,
      updateUser,
      setIsAuthenticated,
    }),
    [isAuthenticated, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};