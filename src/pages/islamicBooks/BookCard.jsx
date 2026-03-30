import { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const BookCard = ({
  title,
  author,
  description,
  coverImage,
  pdfFile,
  uploadedAt,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleDownload = (e) => {
    e.preventDefault();
    window.open(pdfFile, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative">
      <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between h-[450px]">
        {/* Book Cover */}
        <img
          src={coverImage}
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
        />

        {/* Book Details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mt-3">{title}</h3>
          <p className="text-gray-600">
            {t("islamicBooks.by")} {author}
          </p>
          <p className="text-base text-gray-500 mt-2 line-clamp-3">
            {description}
          </p>
        </div>

        {/* Uploaded Date */}
        <p className="text-sm text-gray-600 mt-2">
          {t("islamicBooks.published")}:{" "}
          {new Date(uploadedAt).toLocaleDateString()}
        </p>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 text-center bg-[#1E3A5F] text-white py-2 rounded-lg 
            transition-all duration-300 ease-in-out transform hover:bg-blue-950 hover:scale-105"
          >
            {t("islamicBooks.download")}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true);
            }}
            className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg
            transition-all duration-300 ease-in-out transform hover:bg-green-800 hover:scale-105"
          >
            {t("islamicBooks.read")}
          </button>
        </div>
      </div>

      {/* PDF Viewer Modal with Framer Motion */}
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
              onClick={() => setIsOpen(false)}
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
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold">{title}</h3>
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

              {/* PDF Viewer */}
              <div className="h-[calc(100%-56px)] overflow-auto">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={pdfFile}
                    defaultScale={1.0}
                    renderError={(error) => (
                      <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
                        <p>
                          {t("islamicBooks.failedToLoad")}: {error.message}
                        </p>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          {t("islamicBooks.close")}
                        </button>
                      </div>
                    )}
                    renderLoader={() => (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2">
                          {t("islamicBooks.loading")}
                        </span>
                      </div>
                    )}
                  />
                </Worker>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookCard;
