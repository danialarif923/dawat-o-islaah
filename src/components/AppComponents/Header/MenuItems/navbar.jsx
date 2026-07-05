import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import MenuItems from "./Item";
import { useAuthData } from "../../../../context/AuthContext";
import { useLanguage } from "../../../../context/LanguageContext";

const Navbar = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user, logout, token } = useAuthData();
  const isRTL = language === "ur";

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isUser = !!token;

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full bg-white dark:bg-gray-900 shadow-md px-6 py-3 flex items-center justify-between"
    >
      
      {/* 🔷 LEFT: LOGO */}
      <div
        onClick={() => navigate("/")}
        className="text-xl font-bold text-[#1E3A5F] cursor-pointer"
      >
        {t("footer.brand")}
      </div>

      {/* 🔷 CENTER: MENU */}
      <div className="hidden md:flex">
        <MenuItems isMobile={false} isUser={isUser} />
      </div>

      {/* 🔷 RIGHT: USER SECTION */}
      <div className="flex items-center gap-3 relative">

        {/* ⚙️ SETTINGS ICON */}
        {isUser && (
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title={t("header.settings")}
          >
            <FaCog className="text-lg text-[#1E3A5F] dark:text-gray-300 hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* 👤 USER / LOGIN */}
        {!isUser ? (
          <button
            onClick={() => navigate("/signin")}
            className="bg-[#1E3A5F] text-white px-4 py-1.5 rounded-lg text-sm"
          >
            {t("header.login")}
          </button>
        ) : (
          <div className="relative">
            
            {/* AVATAR */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center cursor-pointer font-bold"
            >
              {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* DROPDOWN */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">

                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaUserCircle /> {t("header.profile")}
                </button>

                <button
                  onClick={() => {
                    navigate("/settings");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaCog /> {t("header.settings")}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaSignOutAlt /> {t("userDropdown.logout")}
                </button>

              </div>
            )}

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;