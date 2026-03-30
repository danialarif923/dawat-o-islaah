import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthData } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

const UserDropdown = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuthData();
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    lastSegment == "questions-and-answers" && navigate("/");

    // Optional: Redirect to login page
    // window.location.href = '/login';
  };

  const handleChangePassword = () => {
    // Implement password change functionality
    // This could navigate to a password change page or open a modal
    console.log("Change password clicked");
    setIsOpen(false);

    // Example: Navigate to change password page
    // window.location.href = '/change-password';
  };

  return (
    <div className="relative md:ml-8 mr-2 md:mr-0" ref={dropdownRef}>
      {/* User icon button */}
      <button
        className={`flex items-center justify-center p-2 rounded-full cursor-pointer focus:outline-none ${
          isOpen ? "bg-gray-100" : "hover:bg-gray-100"
        }`}
        onClick={toggleDropdown}
        onMouseEnter={() => setIsOpen(true)}
      >
        <User size={24} className="text-gray-700" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <Link
            to={"/change-password"}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={handleChangePassword}
          >
            {t("userDropdown.changePassword")}
          </Link>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
            onClick={handleLogout}
          >
            {t("userDropdown.logout")}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
