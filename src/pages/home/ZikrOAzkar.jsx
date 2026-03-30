import { useRef, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import useBlogs from "../../hooks/useBlogs";

const ZikrOAzkar = () => {
  const { t } = useLanguage();
  const { blogs, loading: blogsLoading, error: blogsError } = useBlogs();
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Animation controls for both motion.div elements
  const controls1 = useAnimation();
  const controls2 = useAnimation();

  const validBlogs = blogs?.filter((blog) => blog.title && blog.featured_image);

  const animationDuration = validBlogs?.length ? validBlogs.length * 8 : 30;

  const handleBlogClick = (blogId) => {
    window.location.href = `/blog/${blogId}`;
  };

  // Start the continuous animation
  useEffect(() => {
    if (!isPaused && validBlogs?.length > 0) {
      // Start both animations in sync
      controls1.start({
        x: [0, "-100%"],
        transition: {
          ease: "linear",
          duration: animationDuration,
          repeat: Infinity,
          repeatType: "loop",
        },
      });

      controls2.start({
        x: [0, "-100%"],
        transition: {
          ease: "linear",
          duration: animationDuration,
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    }
  }, [controls1, controls2, isPaused, validBlogs, animationDuration]);

  // Handle pause/resume
  const handleMouseEnter = () => {
    setIsPaused(true);
    // Stop both animations smoothly
    controls1.stop();
    controls2.stop();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    // Resume animations from current position
    controls1.start({
      x: [null, "-100%"], // null means continue from current position
      transition: {
        ease: "linear",
        duration: animationDuration,
        repeat: Infinity,
        repeatType: "loop",
      },
    });

    controls2.start({
      x: [null, "-100%"], // null means continue from current position
      transition: {
        ease: "linear",
        duration: animationDuration,
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  return (
    <div className="bg-[#116466] text-white hidden px-10 sm:px-14 md:px-20 lg:px-32 py-2 md:flex items-center overflow-hidden">
      <h1 className="mr-5 bg-[#1E3A5F] rounded-md py-3 px-2 w-fit text-nowrap">
        ZIKR O AZKAAR
      </h1>
      <div className="relative w-full overflow-hidden">
        {blogsLoading ? (
          <div className="text-white text-sm">Loading...</div>
        ) : (
          <div className="flex">
            <motion.div
              className="flex items-center whitespace-nowrap will-change-transform"
              animate={controls1}
              style={{ display: "flex" }}
            >
              {[...validBlogs, ...validBlogs, ...validBlogs]?.map(
                (blog, index) => (
                  <div
                    key={`set1-${index}`}
                    className="flex items-center gap-2 min-w-max cursor-pointer hover:bg-white/10 rounded-md p-2 transition-colors duration-200"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleBlogClick(blog.id)}
                  >
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-10 h-10 rounded-md"
                    />
                    <p className="pr-6">{blog.title}</p>
                  </div>
                )
              )}
            </motion.div>
            <motion.div
              className="flex items-center whitespace-nowrap will-change-transform"
              animate={controls2}
              style={{ display: "flex" }}
            >
              {[...validBlogs, ...validBlogs, ...validBlogs]?.map(
                (blog, index) => (
                  <div
                    key={`set2-${index}`}
                    className="flex items-center gap-2 min-w-max cursor-pointer hover:bg-white/10 rounded-md p-2 transition-colors duration-200"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleBlogClick(blog.id)}
                  >
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-10 h-10 rounded-md"
                    />
                    <p className="pr-6">{blog.title}</p>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZikrOAzkar;
