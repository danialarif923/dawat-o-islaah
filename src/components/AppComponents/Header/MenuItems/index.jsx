import Item from "./Item";

const MenuItems = ({ isMobile, isUser, closeMenu }) => {

  // Base items always visible
  const baseItems = [
    { name: "home" },
    { name: "quran" },
    { name: "hadith" },
    { name: "islamicBooks" },
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

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col space-y-6" : "items-center space-x-8"
      }`}
    >
      {items.map((item) => (
        <div key={item.name} className="w-full">
          <Item closeMenu={closeMenu} item={item.name} isMobile={isMobile} />
        </div>
      ))}
    </div>
  );
};

export default MenuItems;