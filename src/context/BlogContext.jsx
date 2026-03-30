import { createContext, useContext, useState } from "react";
import { authApiClient } from "../api/backendApi";

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blog, setBlog] = useState([]);

  // BlogContext.jsx
  const refreshBlogComments = async (blogId) => {
    try {
      // CHANGE: Use authApiClient and the correct path
      const response = await authApiClient.get(
        `/api/blogs/${blogId}/comments/`,
      );
      const updatedComments = response.data.results;

      setBlog((prevBlogs) =>
        prevBlogs.map((b) =>
          String(b.id) === String(blogId)
            ? { ...b, comments: updatedComments }
            : b,
        ),
      );
    } catch (err) {
      console.error("Failed to refresh comments:", err);
    }
  };

  return (
    <BlogContext.Provider value={{ blog, setBlog, refreshBlogComments }}>
      {children}
    </BlogContext.Provider>
  );
};

// ✅ Add this line to fix the import error
export const useBlogContext = () => {
  return useContext(BlogContext);
};
