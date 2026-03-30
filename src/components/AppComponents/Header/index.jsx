import { useEffect, useState, useRef } from "react";
import MenuItems from "./MenuItems";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import { useAuthData } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();
  const { user } = useAuthData();

  const translation = useTranslation();
  const login = translation?.header?.login;
  const isUser = !!user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when menu is open
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // Restore scrolling
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // Cleanup
    };
  }, [isMenuOpen]);

  return (
    <div className="flex justify-between px-4 lg:px-20 items-center p-4 bg-[#C9A227]">
      {/* Logo */}
      <Link to="/">
        <img
          src="/assets/img/logo.jpeg"
          className="w-14 items-center"
          alt="Logo"
        />
      </Link>

      <div className="flex items-center">
        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-x-8">
          <MenuItems isUser={isUser} />
        </div>

        {/* Login or User Dropdown */}
        {isUser ? (
          <UserDropdown />
        ) : (
          <Link
            to="/signin"
            className="hidden lg:flex bg-[#1E3A5F] text-white hover:scale-105 rounded-lg h-fit ml-8 px-6 py-2 font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-[#2a4b7a] hover:shadow-md"
          >
            {login}
          </Link>
        )}

        {/* Hamburger Icon */}
        <button
          className="lg:hidden text-white text-2xl p-2 -mr-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile Menu Backdrop */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/30  z-40 lg:hidden" />
        )}

        {/* Mobile Menu */}
        <div
          ref={menuRef}
          className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#C9A227] shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Menu Header with Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white text-2xl p-2"
                aria-label="Close Menu"
              >
                <FaTimes />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <MenuItems
                closeMenu={() => setIsMenuOpen(false)}
                isMobile={true}
                isUser={isUser}
              />
            </div>

            {/* Optional Footer */}
            <div className="p-4 border-t border-[#1E3A5F]/20">
              {!isUser && (
                <Link
                  to="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-[#1E3A5F] text-white rounded-lg px-6 py-3 font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-[#2a4b7a]"
                >
                  {login}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
