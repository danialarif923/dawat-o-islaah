import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageTransition, setPageTransition] = useState(0);

  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);

  // Set PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load PDF when modal opens
  useEffect(() => {
    if (!isOpen || !pdfFile) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdf = await pdfjsLib.getDocument(pdfFile).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);

        // Render first page
        renderPage(pdf, 1);
      } catch (err) {
        setError(err.message || "Failed to load PDF");
        console.error("PDF loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [isOpen, pdfFile]);

  // Render PDF page to canvas
  const renderPage = async (pdf, pageNum) => {
    try {
      if (!canvasRef.current || !pdf) return;

      const page = await pdf.getPage(Math.max(1, Math.min(pageNum, pdf.numPages)));
      const scale = 2;
      const viewport = page.getViewport({ scale });

      canvasRef.current.width = viewport.width;
      canvasRef.current.height = viewport.height;

      const context = canvasRef.current.getContext("2d");
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Get text for search highlighting
      highlightSearchTerms(page);
    } catch (err) {
      console.error("Page rendering error:", err);
    }
  };

  // Navigate to page
  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || !pdfDocRef.current) return;

    setPageTransition(pageNum > currentPage ? 1 : -1);
    setCurrentPage(pageNum);
    renderPage(pdfDocRef.current, pageNum);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  // Search and highlight text
  const highlightSearchTerms = async (page) => {
    if (!searchQuery.trim() || !page) return;

    try {
      const textContent = await page.getTextContent();
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext("2d");
      const query = searchQuery.toLowerCase();

      textContent.items.forEach((item) => {
        if (item.str.toLowerCase().includes(query)) {
          // Highlight matching text
          const transform = pdfjsLib.Util.transform(
            pdfjsLib.Util.transform([1, 0, 0, 1, 0, 0], item.transform),
            [1, 0, 0, -1, 0, 0]
          );

          context.save();
          context.fillStyle = "rgba(255, 255, 0, 0.3)";
          context.fillRect(
            transform[4],
            transform[5],
            item.width,
            item.height
          );
          context.restore();
        }
      });
    } catch (err) {
      console.error("Search highlighting error:", err);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage);
    }
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

  // Page slide animation
  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
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
          <h3 className="text-lg font-semibold mt-3 text-black">{title}</h3>
          <p className="text-gray-700 font-medium">
            {t("islamicBooks.by")} {author}
          </p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
            {description}
          </p>
        </div>

        {/* Uploaded Date */}
        <p className="text-sm text-gray-700 font-medium mt-2">
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

      {/* PDF Reader Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className={`fixed z-50 bg-white shadow-2xl flex flex-col ${
                isMobile
                  ? "inset-x-0 bottom-0 h-[95vh] rounded-t-3xl"
                  : "top-0 right-0 h-screen w-full md:w-2/3 lg:w-3/5"
              }`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-20 border-b-2 border-gray-200">
                {/* Title and Close Button */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-black truncate">{title}</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-red-100 bg-red-50 transition-all duration-200 cursor-pointer flex-shrink-0"
                  >
                    <X className="h-6 w-6 text-red-600" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={t("islamicBooks.searchInBook")}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="p-3 bg-white flex justify-between items-center gap-2 border-b border-gray-200">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-semibold"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="text-sm hidden sm:inline">{t("islamicBooks.previous")}</span>
                  </button>

                  <div className="text-center text-black font-bold text-lg px-6 py-2 bg-gray-100 rounded-lg">
                    {totalPages > 0 ? `${currentPage} / ${totalPages}` : "0 / 0"}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-semibold"
                  >
                    <span className="text-sm hidden sm:inline">{t("islamicBooks.next")}</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* PDF Canvas Container */}
              <div className="flex-1 overflow-hidden bg-gray-300 flex items-center justify-center p-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600"></div>
                    <p className="text-black font-semibold text-lg">
                      {t("islamicBooks.loading")}
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-600 p-8 bg-white rounded-lg">
                    <p className="text-lg font-bold mb-4 text-black">
                      {t("islamicBooks.failedToLoad")}
                    </p>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      {t("islamicBooks.close")}
                    </button>
                  </div>
                ) : (
                  <motion.div
                    key={currentPage}
                    custom={pageTransition}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="w-full h-full bg-white rounded-lg shadow-2xl flex items-center justify-center overflow-auto"
                  >
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-full"
                      style={{ imageRendering: "high-quality" }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookCard;
