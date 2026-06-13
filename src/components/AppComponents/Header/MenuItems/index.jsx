import { useLanguage } from "../../../../context/LanguageContext";
import Item from "./Item";

const MenuItems = ({ isMobile, isUser, closeMenu }) => {
  const { language } = useLanguage();

  // Base items always visible
  const baseItems = [
    { name: "home" },
    { name: "quran" },
    { name: "hadith" },
    { name: "islamicBooks" },
    { name: "islamicTools" },
    { name: "masail" },
    { name: "discussionForum" },
    { name: "questionAnswer" },
  ];

  // Auth-based items (only Settings requires login)
  let authDependentItems = [];

  if (isUser) {
    authDependentItems = [
      { name: "settings" },
    ];
  }

  const items = [...baseItems, ...authDependentItems];

  const renderedItems = language === "ur" ? [...items].reverse() : items;

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col space-y-6" : "items-center space-x-8"
      }`}
    >
      {renderedItems.map((item) => (
        <div key={item.name} className="w-full">
          <Item closeMenu={closeMenu} item={item.name} isMobile={isMobile} />
        </div>
      ))}
    </div>
  );
};

export default MenuItems;