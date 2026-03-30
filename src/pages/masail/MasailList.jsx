import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const MasailList = ({
  masail,
  loading,
  selectedCategoryName,
  setSelectedCategory,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMasail, setSelectedMasail] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial value
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMasailClick = (id) => {
    // Find the masail with the clicked id
    setIsOpen(true);
    const selected = masail.find((masla) => masla.id === id);
    setSelectedMasail(selected); // Set the selected masail
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: {
      x: isMobile ? 0 : "100%",
      y: isMobile ? "100%" : 0,
    },
    visible: {
      x: 0,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: {
      x: isMobile ? 0 : "100%",
      y: isMobile ? "100%" : 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 cursor-pointer mt-2">
        {selectedCategoryName && (
          <div className="flex items-center space-x-2 rounded-lg shadow-lg bg-white  w-fit justify-between pl-2 p-1 border-2 border-neutral-200  hover:scale-105 transition-all duration-300">
            {/* Title */}
            <h3 className=" font-semibold text-gray-800">
              {selectedCategoryName}
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1 rounded-full hover:bg-red-100  transition-all duration-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="red"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        {loading
          ? Array(4)
              .fill()
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-center animate-pulse"
                >
                  {/* Image section */}
                  <div className="h-32 w-full sm:w-48 bg-gray-300 rounded"></div>

                  {/* Content section */}
                  <div className="md:ml-4 flex-1">
                    <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))
          : masail?.map((masla) => (
              <div
                onClick={() => handleMasailClick(masla.id)}
                key={masla.id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col md:flex-row hover:scale-102 transition-all duration-300"
              >
                {/* Image section */}
                <img
                  src={masla.image}
                  alt={masla.title}
                  className="h-32 w-full object-cover rounded md:w-48"
                />
                {/* Content section */}
                <div className=" m-3 md:ml-4 flex-1">
                  <span className="text-sm text-gray-500 italic">
                    {masla.category.name}
                  </span>
                  <h3 className="text-sm md:text-xl font-semibold mdsm:mt-4 md:mt-0">
                    {masla.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 text-sm md:text-base">
                    {masla.content}
                  </p>
                </div>
              </div>
            ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 overlay-class z-40"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={() => setIsOpen(false)} // Close drawer on click of overlay
            />

            {/* Drawer */}
            <motion.div
              className={`fixed z-50 bg-white shadow-xl ${
                isMobile
                  ? "inset-x-0 bottom-0 h-[90vh] rounded-t-3xl"
                  : "top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5"
              }`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
            >
              {/* Content inside the drawer */}
              {selectedMasail && (
                <div>
                  <div className="flex justify-between items-center p-4 border-b">
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-800">
                      {selectedMasail.title}
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-full hover:bg-red-200 bg-red-100 transition-all duration-200 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="red"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[400px] sm:max-h-[550px] overflow-y-auto">
                    {/* Image */}
                    <div className="w-full overflow-hidden rounded-lg">
                      <img
                        src={selectedMasail.image}
                        alt={selectedMasail.title}
                        className="w-full h-40 sm:h-72  object-cover"
                      />
                    </div>

                    {/* Category */}
                    <div className="text-sm text-gray-500 italic">
                      {t("masail.category")}: {selectedMasail.category?.name}
                    </div>

                    {/* Content */}
                    <p className="text-gray-700">{selectedMasail.content}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MasailList;
