import { useEffect, useState } from "react";
import { authApiClient } from "../api/backendApi";
import { useBlogContext } from "../context/BlogContext";

const useBlogs = () => {
  const { blog, setBlog } = useBlogContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // useBlogs.jsx
    const fetchBlogs = async () => {
      try {
        // CHANGE: Use authApiClient and add the /api/ prefix
        const response = await authApiClient.get("api/blogs/");
        setBlog(response.data?.results || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [setBlog]);

  return { blogs: blog, loading, error };
};

export default useBlogs;
