import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from "lucide-react";
import { backendApiClient } from "../../api/backendApi";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

const BookCard = ({
  id,
  title,
  author,
  description,
  coverImage,
  pdfFile,
  uploadedAt,
  readCount: propReadCount,
  downloadCount: propDownloadCount,
  isSplit: propIsSplit = false,
  pagesUrlPrefix: propPagesUrlPrefix = '',
  totalPages: propTotalPages = 0,
  processingStatus = "completed",
}) => {
  const [readCount, setReadCount] = useState(propReadCount ?? 0);
  const [downloadCount, setDownloadCount] = useState(propDownloadCount ?? 0);
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageTransition, setPageTransition] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [noTextContent, setNoTextContent] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [pageGenerating, setPageGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const retryRef = useRef(null);
  const retryCountRef = useRef(0);

  const isSplit = propIsSplit;
  const pagesUrlPrefix = propPagesUrlPrefix ? `${propPagesUrlPrefix.replace(/\/?$/, '/')}` : '';
  const imgCacheRef = useRef(new Set());

  // Preload page 1 for split books (instant open)
  useEffect(() => {
    if (!isSplit || !pagesUrlPrefix) return;
    const img = new Image();
    img.src = `${pagesUrlPrefix}page-1.jpg`;
  }, [isSplit, pagesUrlPrefix]);

  // Preload adjacent pages for split books
  useEffect(() => {
    if (!isSplit || !pagesUrlPrefix || totalPages <= 1) return;
    const pagesToPreload = [currentPage + 1, currentPage - 1];
    pagesToPreload.forEach((p) => {
      if (p < 1 || p > totalPages || imgCacheRef.current.has(p)) return;
      imgCacheRef.current.add(p);
      const img = new Image();
      img.src = `${pagesUrlPrefix}page-${p}.jpg`;
    });
  }, [isSplit, pagesUrlPrefix, totalPages, currentPage]);

  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const imgRef = useRef(null);
  const pageRef = useRef(null);
  const viewportRef = useRef(null);
  const scaleRef = useRef(2);
  const ocrCacheRef = useRef(new Map());
  const ocrWordsRef = useRef(null);
  const ocrBusyRef = useRef(false);
  const latestSearchRef = useRef("");
  const isScannedRef = useRef(false);
  const textContentRef = useRef("");
  const textItemsRef = useRef(null);
  const pendingSearchRef = useRef("");
  const splitTextItemsCacheRef = useRef(new Map());
  const splitViewportCacheRef = useRef(new Map());
  const readTrackedRef = useRef(false);
  const pageCacheRef = useRef(new Map());
  const preRenderRef = useRef(null);
  const pageTextLoadingRef = useRef(new Map()); // pageNum -> Promise<result>

  useEffect(() => {
    readTrackedRef.current = false;
  }, [id]);

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
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []);

  // Sync counts from server whenever props change (handles refresh / navigation)
  useEffect(() => {
    setReadCount(propReadCount ?? 0);
    setDownloadCount(propDownloadCount ?? 0);
  }, [propReadCount, propDownloadCount]);

  // Increment read count when modal opens (once per book session)
  useEffect(() => {
    if (!isOpen || !pdfFile || readTrackedRef.current) return;
    readTrackedRef.current = true;
    backendApiClient.post(`../api/books/${id}/read/`).then((res) => {
      if (res?.data?.read_count) setReadCount(res.data.read_count);
    }).catch(() => {});
  }, [isOpen]);

  // Load when modal opens
  useEffect(() => {
    if (!isOpen || !pdfFile) return;

    setError(null);
    setCurrentPage(1);

    if (isSplit && propTotalPages > 0) {
      setTotalPages(propTotalPages);
      setImgLoaded(true);
      setImgError(false);
      setPageGenerating(false);
      retryCountRef.current = 0;
      if (retryRef.current) {
        clearTimeout(retryRef.current);
        retryRef.current = null;
      }
      return;
    }

    // Non-split - load PDF page by page (no blocking)
    setTotalPages(0);
    setImgError(false);
    setImgLoaded(false);
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({
          url: pdfFile,
          disableAutoFetch: true,
          disableStream: true,
        }).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setPageGenerating(false);
        // Render current page (user might have navigated while PDF was loading)
        renderPage(pdf, currentPage, searchQuery);
      } catch (err) {
        setError(err.message || "Failed to load PDF");
        console.error("PDF loading error:", err);
      }
    })();
  }, [isOpen, pdfFile]);

  // Reactive search: runs on every searchQuery and page change
  useEffect(() => {
    const query = searchQuery;
    latestSearchRef.current = query;

    if (!query.trim()) {
      setMatchCount(0);
      const ctx = overlayCanvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return;
    }

    const applySearch = () => {
      if (isSplit) {
        if (ocrCacheRef.current.has(currentPage)) {
          const cached = ocrCacheRef.current.get(currentPage);
          doSearch(cached, query);
          if (ocrWordsRef.current) {
            drawSplitSearchHighlights(query);
          } else if (splitTextItemsCacheRef.current.has(currentPage)) {
            const items = splitTextItemsCacheRef.current.get(currentPage);
            const vp = splitViewportCacheRef.current.get(currentPage);
            if (items && vp) {
              drawSplitPageHighlights({ items }, vp, query);
            }
          }
        } else {
          loadSplitPageForSearch(currentPage, query);
        }
        return true;
      }

      if (isScannedRef.current) {
        if (ocrWordsRef.current) {
          drawOcrHighlights(query);
        } else if (textContentRef.current) {
          doSearch(textContentRef.current, query);
        } else {
          extractText();
        }
        return true;
      }

      const vp = viewportRef.current;
      const overlay = overlayCanvasRef.current;
      if (textItemsRef.current && vp && overlay) {
        const ctx = overlay.getContext("2d");
        drawTextHighlights(ctx, vp, scaleRef.current, textItemsRef.current, query);
        return true;
      }

      // Non-split: try page-{n}.txt+json for instant search (any page, before or after pdf.js loads)
      if (!textItemsRef.current && overlay) {
        loadSplitPageForSearch(currentPage, query);
        return true;
      }

      return false;
    };

    if (!applySearch()) {
      pendingSearchRef.current = query;
    } else {
      pendingSearchRef.current = "";
    }
  }, [searchQuery, currentPage]);

  // Pre-load page text on mount/navigation for split books (instant search)
  useEffect(() => {
    if (!isOpen || !isSplit || !propTotalPages) return;
    ensurePageText(currentPage);
  }, [currentPage, isOpen, isSplit]);

  // Render a single page to a given canvas context
  const renderPageToCtx = async (pdf, pageNum, ctx, width, height, scale) => {
    const page = await pdf.getPage(Math.max(1, Math.min(pageNum, pdf.numPages)));
    const viewport = page.getViewport({ scale });
    const canvas = ctx.canvas;
    canvas.width = width || viewport.width;
    canvas.height = height || viewport.height;
    ctx.save();
    ctx.scale(canvas.width / viewport.width, canvas.height / viewport.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    ctx.restore();
    return { page, viewport };
  };

  // Render PDF page to canvas with caching + pre-render next page
  const renderPage = async (pdf, pageNum, searchTerm = "") => {
    try {
      if (!canvasRef.current || !pdf) return;

      // Check cache first
      const cached = pageCacheRef.current.get(pageNum);
      if (cached) {
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = cached.width;
        canvasRef.current.height = cached.height;
        ctx.putImageData(cached.imageData, 0, 0);
        if (cached.textContent) {
          textContentRef.current = cached.textContent;
          setOcrText(cached.textContent);
        }
        if (cached.textItems) textItemsRef.current = cached.textItems;
        isScannedRef.current = cached.isScanned;
        setNoTextContent(cached.isScanned);
        setMatchCount(0);
        setPageGenerating(false);
        return;
      }

      textItemsRef.current = null;
      textContentRef.current = "";
      ocrWordsRef.current = null;
      isScannedRef.current = false;

      const page = await pdf.getPage(Math.max(1, Math.min(pageNum, pdf.numPages)));
      const viewport1 = page.getViewport({ scale: 1 });
      const fitScale = Math.max((window.innerWidth * 0.92) / viewport1.width, 1.0);

      const viewport = page.getViewport({ scale: fitScale });

      pageRef.current = page;
      viewportRef.current = viewport;

      canvasRef.current.width = viewport.width;
      canvasRef.current.height = viewport.height;

      const context = canvasRef.current.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;

      // Cache the rendered page as ImageData
      const imageData = context.getImageData(0, 0, viewport.width, viewport.height);
      pageCacheRef.current.set(pageNum, { imageData, width: viewport.width, height: viewport.height });

      scaleRef.current = fitScale;

      const textContent = await page.getTextContent();
      const isScanned = textContent.items.length === 0;
      isScannedRef.current = isScanned;
      setNoTextContent(isScanned);

      textItemsRef.current = isScanned ? null : textContent.items;

      if (!isScanned) {
        const pdfText = textContent.items.map(i => i.str).join(" ");
        textContentRef.current = pdfText;
        setOcrText(pdfText);
        setOcrError(null);
        ocrCacheRef.current.set(pageNum, pdfText);
        // Update cache with text data
        const entry = pageCacheRef.current.get(pageNum);
        if (entry) { entry.textContent = pdfText; entry.textItems = textContent.items; entry.isScanned = false; }
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = viewport.width;
          overlayCanvasRef.current.height = viewport.height;
          const ctx = overlayCanvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, viewport.width, viewport.height);
          const activeSearch = searchTerm.trim() || latestSearchRef.current.trim() || pendingSearchRef.current;
          if (activeSearch) {
            await highlightSearchTermsOnCanvas(page, viewport, ctx, fitScale, activeSearch);
          }
        }
      } else {
        textContentRef.current = "";
        setOcrText("");
        const entry = pageCacheRef.current.get(pageNum);
        if (entry) { entry.isScanned = true; }
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = viewport.width;
          overlayCanvasRef.current.height = viewport.height;
          overlayCanvasRef.current.getContext("2d")?.clearRect(0, 0, viewport.width, viewport.height);
        }
        extractText();
      }

      // Pre-render next page in background (to offscreen canvas, not visible one)
      const nextPage = pageNum + 1;
      if (nextPage <= totalPages && !pageCacheRef.current.has(nextPage)) {
        if (preRenderRef.current) clearTimeout(preRenderRef.current);
        preRenderRef.current = setTimeout(async () => {
          const pdf = pdfDocRef.current;
          if (!pdf) return;
          try {
            const oc = document.createElement('canvas');
            oc.width = 1; oc.height = 1;
            const octx = oc.getContext("2d");
            const { page, viewport } = await renderPageToCtx(pdf, nextPage, octx, 0, 0, 1.0);
            const fullScale = Math.max((window.innerWidth * 0.92) / viewport.width, 1.0);
            const fullVp = page.getViewport({ scale: fullScale });
            oc.width = fullVp.width;
            oc.height = fullVp.height;
            await page.render({ canvasContext: octx, viewport: fullVp }).promise;
            const imgData = octx.getImageData(0, 0, fullVp.width, fullVp.height);
            pageCacheRef.current.set(nextPage, { imageData: imgData, width: fullVp.width, height: fullVp.height });
            // Get text content
            const tc = await page.getTextContent();
            if (tc.items.length > 0) {
              const entry = pageCacheRef.current.get(nextPage);
              if (entry) {
                entry.textContent = tc.items.map(i => i.str).join(" ");
                entry.textItems = tc.items;
                entry.isScanned = false;
              }
            }
            page.cleanup();
          } catch (e) {
            // Pre-render failed silently
          }
        }, 200);
      }
      setPageGenerating(false);
    } catch (err) {
      console.error("Page rendering error:", err);
      setPageGenerating(false);
    }
  };

  const setupOverlayForSplit = () => {
    const img = imgRef.current;
    const overlay = overlayCanvasRef.current;
    if (!img || !overlay) return false;
    const rect = img.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    overlay.width = rect.width;
    overlay.height = rect.height;
    return true;
  };

  const drawOcrHighlights = (query) => {
    const words = ocrWordsRef.current;
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const vp = viewportRef.current;

    if (!isSplit) {
      if (!vp) return;
      ctx.clearRect(0, 0, vp.width, vp.height);
    } else {
      if (!setupOverlayForSplit()) return;
    }

    if (!query.trim() || !words) return;

    const lower = query.toLowerCase().trim();
    let count = 0;
    for (const w of words) {
      if (!w.text) continue;
      const wordText = w.text.trim();
      if (!wordText) continue;
      const wordTextLower = wordText.toLowerCase();
      if (!wordTextLower.includes(lower)) continue;

      const b = w.bbox;
      if (!b || typeof b.x0 !== "number") continue;

      const wordWidth = b.x1 - b.x0;
      const wordHeight = b.y1 - b.y0;
      if (wordWidth <= 0 || wordHeight <= 0) continue;

      let startIdx = 0;
      while ((startIdx = wordTextLower.indexOf(lower, startIdx)) !== -1) {
        count++;
        const endIdx = startIdx + lower.length;
        const charWidth = wordWidth / wordText.length;
        const cx = b.x0 + startIdx * charWidth;
        const cw = (endIdx - startIdx) * charWidth;

        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillRect(cx, b.y0, cw, wordHeight);

        startIdx = endIdx;
      }
    }
    setMatchCount(count);
    if (count > 0) setShowTextPanel(true);
  };

  const drawSplitSearchHighlights = (query) => {
    const words = ocrWordsRef.current;
    const ctx = overlayCanvasRef.current?.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img) return;
    if (!setupOverlayForSplit()) return;

    if (!query.trim() || !words) return;

    const lower = query.toLowerCase().trim();
    let count = 0;
    for (const w of words) {
      if (!w.text) continue;
      const wordText = w.text.trim();
      if (!wordText) continue;
      const wordTextLower = wordText.toLowerCase();
      if (!wordTextLower.includes(lower)) continue;

      const b = w.bbox;
      if (!b || typeof b.x0 !== "number") continue;

      const wordWidth = b.x1 - b.x0;
      const wordHeight = b.y1 - b.y0;
      if (wordWidth <= 0 || wordHeight <= 0) continue;

      let startIdx = 0;
      while ((startIdx = wordTextLower.indexOf(lower, startIdx)) !== -1) {
        count++;
        const endIdx = startIdx + lower.length;
        const charWidth = wordWidth / wordText.length;
        const cx = b.x0 + startIdx * charWidth;
        const cw = (endIdx - startIdx) * charWidth;

        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillRect(cx, b.y0, cw, wordHeight);

        startIdx = endIdx;
      }
    }
    setMatchCount(count);
  };

  // Build full-text index from text items for multi-span match support
  const buildTextIndex = (items) => {
    let fullText = "";
    const boundaries = [];
    for (const item of items) {
      if (!item.str) continue;
      const start = fullText.length;
      fullText += item.str;
      boundaries.push({ start, end: fullText.length, item });
    }
    return { fullText, fullTextLower: fullText.toLowerCase(), boundaries };
  };

  const drawTextHighlights = (overlayContext, viewport, scale, textItems, searchTerm) => {
    overlayContext.clearRect(0, 0, overlayContext.canvas.width, overlayContext.canvas.height);
    if (!searchTerm.trim() || !textItems || textItems.length === 0) {
      if (!searchTerm.trim()) setMatchCount(0);
      return;
    }

    const query = searchTerm.toLowerCase().trim();
    const { fullTextLower, boundaries } = buildTextIndex(textItems);
    let matchCount = 0;
    let pos = 0;

    while ((pos = fullTextLower.indexOf(query, pos)) !== -1) {
      const matchEnd = pos + query.length;
      matchCount++;

      for (const b of boundaries) {
        if (b.start >= matchEnd) break;
        if (b.end <= pos) continue;

        const item = b.item;
        const x = item.transform?.[4];
        const y = item.transform?.[5];
        if (x == null || y == null) continue;
        let totalW = item.width;
        const h = item.height || 10;
        if (h <= 0) continue;
        if (!totalW || totalW <= 0) {
          totalW = item.str.length * 10;
        }

        const overlapStart = Math.max(pos, b.start);
        const overlapEnd = Math.min(matchEnd, b.end);
        const startRel = overlapStart - b.start;
        const endRel = overlapEnd - b.start;
        const startRatio = startRel / item.str.length;
        const endRatio = endRel / item.str.length;

        const cx = (x + startRatio * totalW) * scale;
        const cw = (endRatio - startRatio) * totalW * scale;
        const cy = viewport.height - (y + h) * scale;
        const ch = h * scale;

        overlayContext.fillStyle = "rgba(255, 255, 0, 0.5)";
        overlayContext.fillRect(cx, cy, cw, ch);
      }

      pos = matchEnd;
    }

    setMatchCount(matchCount);
  };

  const highlightSearchTermsOnCanvas = async (page, viewport, overlayContext, scale, searchTerm) => {
    try {
      if (textItemsRef.current) {
        drawTextHighlights(overlayContext, viewport, scale, textItemsRef.current, searchTerm);
        return;
      }
      const textContent = await page.getTextContent();
      const items = textContent.items;
      if (items.length === 0) {
        if (!isScannedRef.current) { overlayContext.clearRect(0, 0, overlayContext.canvas.width, overlayContext.canvas.height); setMatchCount(0); }
        return;
      }
      textItemsRef.current = items;
      drawTextHighlights(overlayContext, viewport, scale, items, searchTerm);
    } catch (err) {
      console.error("Search highlight error:", err);
      setMatchCount(0);
    }
  };

  // Navigate to page
  const goToPage = (pageNum) => {
    if (pageNum < 1) return;
    if (totalPages > 0 && pageNum > totalPages) return;

    setPageTransition(pageNum > currentPage ? 1 : -1);
    setCurrentPage(pageNum);
    setImgLoaded(false);
    setImgError(false);
    setPageGenerating(false);
    retryCountRef.current = 0;
    if (retryRef.current) {
      clearTimeout(retryRef.current);
      retryRef.current = null;
    }

    if (isSplit) return;
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, pageNum, searchQuery);
    } else {
      setPageGenerating(true);
    }
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const extractText = async () => {
    if (ocrCacheRef.current.has(currentPage)) {
      const t = ocrCacheRef.current.get(currentPage);
      textContentRef.current = t;
      setOcrText(t);
      if (latestSearchRef.current.trim()) {
        doSearch(t, latestSearchRef.current);
      }
      return;
    }
    if (ocrBusyRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    ocrBusyRef.current = true;
    setOcrError(null);
    setOcrLoading(true);
    try {
      const { data } = await Tesseract.recognize(canvas, "ara+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") setOcrLoading(true);
        },
      });
      const text = data.text || "";
      console.log("OCR extracted:", text.substring(0, 200));
      textContentRef.current = text;
      ocrCacheRef.current.set(currentPage, text);
      ocrWordsRef.current = data.words || null;
      setOcrText(text);
      if (latestSearchRef.current.trim()) {
        drawOcrHighlights(latestSearchRef.current);
        if (!ocrWordsRef.current) doSearch(text, latestSearchRef.current);
      }
    } catch (err) {
      console.error("OCR failed:", err);
      setOcrError(err.message || "OCR failed");
    } finally {
      setOcrLoading(false);
      ocrBusyRef.current = false;
    }
  };

  const doSearch = (text, query) => {
    if (!query.trim()) { setMatchCount(0); return; }
    const lower = query.toLowerCase().trim();
    const lines = text.split("\n");
    let count = 0;
    for (const line of lines) {
      if (line.toLowerCase().includes(lower)) count++;
    }
    setMatchCount(count);
    if (count > 0) setShowTextPanel(true);
  };

  const drawSplitPageHighlights = (textContent, pageViewport, query) => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    const ctx = overlay?.getContext("2d");
    if (!ctx || !query.trim()) return;

    // Use img for positioning (pages 1-5, or split books), fallback to pdf.js canvas
    let refEl = img && img.getBoundingClientRect().width > 0 ? img : canvas;
    if (!refEl || refEl.getBoundingClientRect().width <= 0) return;
    const refRect = refEl.getBoundingClientRect();
    if (refRect.width <= 0 || refRect.height <= 0) return;

    overlay.width = refRect.width;
    overlay.height = refRect.height;

    const pdfW = pageViewport.width;
    const pdfH = pageViewport.height;
    const scaleX = refRect.width / pdfW;
    const scaleY = refRect.height / pdfH;

    const lower = query.toLowerCase().trim();
    const { fullTextLower, boundaries } = buildTextIndex(textContent.items);
    let count = 0;
    let pos = 0;

    while ((pos = fullTextLower.indexOf(lower, pos)) !== -1) {
      const matchEnd = pos + lower.length;
      count++;

      for (const b of boundaries) {
        if (b.start >= matchEnd) break;
        if (b.end <= pos) continue;

        const item = b.item;
        const x = item.transform?.[4];
        const y = item.transform?.[5];
        if (x == null || y == null) continue;
        let totalW = item.width;
        const h = item.height || 10;
        if (h <= 0) continue;
        if (!totalW || totalW <= 0) {
          totalW = item.str.length * 10;
        }

        const overlapStart = Math.max(pos, b.start);
        const overlapEnd = Math.min(matchEnd, b.end);
        const startRel = overlapStart - b.start;
        const endRel = overlapEnd - b.start;
        const startRatio = startRel / item.str.length;
        const endRatio = endRel / item.str.length;

        const cx = (x + startRatio * totalW) * scaleX;
        const cw = (endRatio - startRatio) * totalW * scaleX;
        const cy = (pdfH - y - h) * scaleY;
        const ch = h * scaleY;

        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillRect(cx, cy, cw, ch);
      }

      pos = matchEnd;
    }

    setMatchCount(count);
    if (count > 0) setShowTextPanel(true);
  };

  // Try page-{n}.txt + page-{n}.json first, fallback to PDF
  // Uses per-page promise dedup so concurrent callers share one load
  const ensurePageText = async (pageNum) => {
    if (ocrCacheRef.current.has(pageNum)) {
      return { text: ocrCacheRef.current.get(pageNum), scanned: isScannedRef.current, items: splitTextItemsCacheRef.current.get(pageNum), viewport: splitViewportCacheRef.current.get(pageNum), words: ocrWordsRef.current };
    }
    const existing = pageTextLoadingRef.current.get(pageNum);
    if (existing) return existing;
    const promise = (async () => {
      setOcrLoading(true);
      try {
        const txtUrl = `${pagesUrlPrefix}page-${pageNum}.txt`;
        const resp = await fetch(txtUrl);
        if (resp.ok) {
          const pdfText = await resp.text();
          textContentRef.current = pdfText;
          ocrCacheRef.current.set(pageNum, pdfText);
          isScannedRef.current = false;
          setOcrText(pdfText);
          setOcrLoading(false);
          pageTextLoadingRef.current.delete(pageNum);
          // Try loading JSON with bounding boxes for instant positional highlights
          const jsonUrl = `${pagesUrlPrefix}page-${pageNum}.json`;
          try {
            const jsonResp = await fetch(jsonUrl);
            if (jsonResp.ok) {
              const jsonData = await jsonResp.json();
              const items = jsonData.items.map(item => ({
                str: item.str,
                transform: [0, 0, 0, 0, item.x, item.y],
                width: item.width,
                height: item.height || 10,
              }));
              const vp = { width: jsonData.pageWidth, height: jsonData.pageHeight };
              splitTextItemsCacheRef.current.set(pageNum, items);
              splitViewportCacheRef.current.set(pageNum, vp);
              return { text: pdfText, scanned: false, items, viewport: vp, words: null };
            }
          } catch (_) {}
          return { text: pdfText, scanned: false, items: null, viewport: null, words: null };
        }
      } catch (_) { }
      // Fallback to PDF
      try {
        const pagePdfUrl = `${pagesUrlPrefix}page-${pageNum}.pdf`;
        const pdf = await pdfjsLib.getDocument(pagePdfUrl).promise;
        const page = await pdf.getPage(1);
        const pageViewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();
        const scanned = textContent.items.length === 0;
        isScannedRef.current = scanned;
        setNoTextContent(scanned);
        if (!scanned) {
          const pdfText = textContent.items.map(i => i.str).join(" ");
          textContentRef.current = pdfText;
          ocrCacheRef.current.set(pageNum, pdfText);
          splitTextItemsCacheRef.current.set(pageNum, textContent.items);
          splitViewportCacheRef.current.set(pageNum, pageViewport);
          setOcrText(pdfText);
          setOcrLoading(false);
          pageTextLoadingRef.current.delete(pageNum);
          return { text: pdfText, scanned: false, items: textContent.items, viewport: pageViewport, words: null };
        }
        // Scanned — render and OCR
        const viewport = page.getViewport({ scale: 2 });
        if (canvasRef.current) {
          canvasRef.current.width = viewport.width;
          canvasRef.current.height = viewport.height;
          const ctx = canvasRef.current.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;
          pageRef.current = page;
          viewportRef.current = viewport;
          scaleRef.current = 2;
        }
        const { data } = await Tesseract.recognize(canvasRef.current, "ara+eng", {
          logger: (m) => { if (m.status === "recognizing text") setOcrLoading(true); },
        });
        const text = data.text || "";
        textContentRef.current = text;
        ocrCacheRef.current.set(pageNum, text);
        ocrWordsRef.current = data.words || null;
        setOcrText(text);
        setOcrLoading(false);
        pageTextLoadingRef.current.delete(pageNum);
        return { text, scanned: true, items: null, viewport: null, words: data.words || null };
      } catch (err) {
        console.error("Split page search failed:", err);
        setOcrError(err.message || "Failed to load page for search");
        setOcrLoading(false);
        pageTextLoadingRef.current.delete(pageNum);
        return null;
      }
    })();
    pageTextLoadingRef.current.set(pageNum, promise);
    return promise;
  };

  const loadSplitPageForSearch = async (pageNum, query) => {
    if (!query.trim()) { setMatchCount(0); return; }

    if (ocrCacheRef.current.has(pageNum)) {
      const cached = ocrCacheRef.current.get(pageNum);
      doSearch(cached, query);
      if (ocrWordsRef.current) {
        drawSplitSearchHighlights(query);
      } else if (splitTextItemsCacheRef.current.has(pageNum)) {
        const items = splitTextItemsCacheRef.current.get(pageNum);
        const vp = splitViewportCacheRef.current.get(pageNum);
        if (items && vp) drawSplitPageHighlights({ items }, vp, query);
      }
      return;
    }
    setOcrError(null);
    const result = await ensurePageText(pageNum);
    if (!result) return;
    doSearch(result.text, query);
    if (result.words) drawOcrHighlights(query);
    if (result.items) drawSplitPageHighlights({ items: result.items }, result.viewport, query);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

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
    backendApiClient.post(`../api/books/${id}/download/`).then((res) => {
      setDownloadCount(res.data.download_count);
    }).catch(() => {
      setDownloadCount((c) => c + 1);
    });
  };

  return (
    <div className="relative">
      <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between h-[450px]">
        {/* Book Cover */}
        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

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

        {/* Read & Download Counts */}
        <div className="flex gap-4 mt-1 text-xs text-gray-500">
          <span dir="rtl">{t("islamicBooks.reads").replace("{count}", readCount)}</span>
          <span dir="rtl">{t("islamicBooks.downloads").replace("{count}", downloadCount)}</span>
        </div>

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
                  : "top-0 right-0 h-screen w-full"
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
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                          title="Clear search"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Search Results Info */}
                  {searchQuery.trim() && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      {ocrError ? (
                        <span className="text-red-600 font-medium" title={ocrError}>
                          ⚠️ Text scanning unavailable
                        </span>
                      ) : ocrLoading ? (
                        <span className="text-amber-600 font-medium">
                          ⏳ Scanning page for text...
                        </span>
                      ) : noTextContent && !ocrText ? (
                        <span className="text-amber-600 font-medium">
                          ⚠️ This PDF has no searchable text (scanned pages)
                        </span>
                      ) : matchCount > 0 ? (
                        <span className="text-green-700 font-medium">
                          ✓ {matchCount} {matchCount === 1 ? "match" : "matches"} found on this page
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          ✗ No matches found on this page
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="p-3 bg-white flex flex-wrap items-center gap-2 border-b border-gray-200">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-semibold text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="text-xs hidden sm:inline">{t("islamicBooks.previous")}</span>
                    </button>

                    <div className="text-center text-black font-bold text-base px-3 py-2 bg-gray-100 rounded-lg min-w-[80px]">
                      {totalPages > 0 ? `${currentPage} / ${totalPages}` : `${currentPage}`}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={totalPages > 0 && currentPage >= totalPages}
                      className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-semibold text-sm"
                    >
                      <span className="text-xs hidden sm:inline">{t("islamicBooks.next")}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={1}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const p = parseInt(pageInput);
                          if (p >= 1) goToPage(p);
                          setPageInput("");
                        }
                      }}
                      placeholder={totalPages > 0 ? `1-${totalPages}` : "Page #"}
                      className="w-16 px-2 py-2 border-2 border-gray-300 rounded-lg text-sm text-center text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const p = parseInt(pageInput);
                        if (p >= 1) { goToPage(p); setPageInput(""); }
                      }}
                      disabled={!pageInput}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      Go
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (!document.fullscreenElement) {
                          document.querySelector('.book-viewer')?.requestFullscreen();
                          setIsFullscreen(true);
                        } else {
                          document.exitFullscreen();
                          setIsFullscreen(false);
                        }
                      }}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {ocrLoading && (
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Scanning page for text...</span>
                  </div>
                )}
              </div>

              {/* PDF / Image Display Area */}
              <div className="flex-1 bg-gray-300 flex items-start justify-center overflow-auto relative book-viewer">
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
                  className="relative bg-white rounded-lg shadow-2xl m-2"
                >
                    <div style={{ position: "relative", display: "inline-block" }}>
                    {/* Loading spinner — shown for any book when generating page */}
                    {pageGenerating && (
                      <div className="flex items-center justify-center p-16 min-h-[300px]">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-amber-500"></div>
                          <p className="text-gray-500 text-sm font-medium">Loading page {currentPage}...</p>
                        </div>
                      </div>
                    )}
                    {/* Page image — displayed when available (all pages after processing) */}
                    {!imgError && (
                      <>
                        <img
                          ref={imgRef}
                          src={`${pagesUrlPrefix}page-${currentPage}.jpg`}
                          alt={`Page ${currentPage}`}
                          onLoad={() => {
                            setImgLoaded(true);
                            setImgError(false);
                            setPageGenerating(false);
                            if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
                            retryCountRef.current = 0;
                          }}
                            onError={() => {
                            if (isSplit || currentPage === 1) {
                              if (processingStatus === "processing" || processingStatus === "pending") {
                                if (retryCountRef.current < 60) {
                                  setPageGenerating(true); setImgLoaded(false);
                                  retryCountRef.current += 1;
                                  retryRef.current = setTimeout(() => {
                                    if (imgRef.current) imgRef.current.src = `${pagesUrlPrefix}page-${currentPage}.jpg?retry=${Date.now()}`;
                                  }, 3000);
                                } else { setImgError(true); setPageGenerating(false); }
                              } else { setImgError(true); setImgLoaded(true); setPageGenerating(true); }
                            } else {
                              setImgError(true);
                              setImgLoaded(false);
                              setPageGenerating(true);
                              if (pdfDocRef.current) {
                                renderPage(pdfDocRef.current, currentPage, searchQuery);
                              }
                            }
                          }}
                          className="max-w-full h-auto"
                          style={{ display: imgLoaded && !imgError ? 'block' : 'none' }}
                        />
                      </>
                    )}

                    {/* pdf.js canvas — shown when image unavailable or for search highlights */}
                    <canvas
                      ref={canvasRef}
                      style={{
                        display: isSplit || (!imgError && imgLoaded) ? 'none' : 'block',
                        imageRendering: "high-quality",
                      }}
                    />

                    <canvas
                      ref={overlayCanvasRef}
                      style={{
                        position: "absolute", top: 0, left: 0,
                        width: "100%", height: "100%", pointerEvents: "none",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Error overlay */}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center text-red-600 p-8">
                      <p className="text-lg font-bold mb-4 text-black">{t("islamicBooks.failedToLoad")}</p>
                      <p className="text-red-500 mb-6">{error}</p>
                      <button onClick={() => setIsOpen(false)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                        {t("islamicBooks.close")}
                      </button>
                    </div>
                  </div>
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
