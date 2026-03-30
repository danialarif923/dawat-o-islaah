import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthData } from "../../context/AuthContext";
import { authApiClient, setAuthToken } from "../../api/backendApi";
import useBlogs from "../../hooks/useBlogs";
import { useBlogContext } from "../../context/BlogContext";
import { useLanguage } from "../../context/LanguageContext";

const BACKEND_BASE_URL = "http://127.0.0.1:8000";

const BlogDetail = () => {
  const { t } = useLanguage();
  const { blogs, loading: blogsLoading, error: blogsError } = useBlogs();
  const { blogid } = useParams();
  const { user, token } = useAuthData();
  const isUser = !!user;

  const { refreshBlogComments } = useBlogContext();

  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const selectedBlog = blogs.find((b) => String(b.id) === String(blogid));

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !isUser || !selectedBlog?.id) return;

    setIsSubmitting(true);
    setCommentError(null);

    try {
      setAuthToken(token);

      // Use authApiClient because its baseURL is the root (/)
      // instead of (/quran/)
      await authApiClient.post(
        `/api/blogs/${selectedBlog.id}/comments/create/`,
        {
          content: commentInput,
        },
      );

      await refreshBlogComments(selectedBlog.id);
      setCommentInput("");
    } catch (err) {
      console.error("Error posting comment:", err);
      setCommentError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;

    try {
      setAuthToken(token);
      // Path matches Django: path('comments/<int:pk>/')
      await authApiClient.patch(`/api/blogs/comments/${commentId}/`, {
        content: editingContent,
      });

      await refreshBlogComments(selectedBlog.id);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      setCommentError("Failed to update comment");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      setAuthToken(token);

      // Make sure there is NO double slash and the path is exact
      // Based on your backendAPI.js, authApiClient.baseURL is "http://127.0.0.1:8000/"
      // If your main urls.py has: path('blogs/', include('blog.urls'))
      // Then the full path must be: /blogs/comments/${commentId}/

      await authApiClient.delete(`/api/blogs/comments/${commentId}/`);

      // Use selectedBlog.id to refresh the list
      await refreshBlogComments(selectedBlog.id);
    } catch (err) {
      console.error("Delete failed:", err);
      setCommentError("Failed to delete comment");
    }
  };

  if (blogsLoading) {
    return <div className="text-center py-10">Loading blog...</div>;
  }

  if (blogsError) {
    return (
      <div className="text-center py-10 text-red-500">Error loading blog.</div>
    );
  }

  if (!selectedBlog) {
    return (
      <div className="text-center py-10 text-red-500">Blog not found.</div>
    );
  }

  const featuredImage = selectedBlog.featured_image
    ? selectedBlog.featured_image.startsWith("http")
      ? selectedBlog.featured_image
      : `${BACKEND_BASE_URL}${selectedBlog.featured_image}`
    : null;

  const blogContent = selectedBlog.content?.replace(
    /src="\/media/g,
    `src="${BACKEND_BASE_URL}/media`,
  );

  return (
    <div className="max-w-1xl mx-auto p-6 bg-white shadow rounded-lg my-10">
      {/* Featured Image */}
      {featuredImage && (
        <img
          src={featuredImage}
          alt={selectedBlog.title}
          className="w-full h-80 object-cover mb-6 rounded"
        />
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {selectedBlog.title}
      </h1>

      <p className="text-sm text-green-600 mb-6">
        {new Date(selectedBlog.created_at).toLocaleDateString()}
      </p>

      {/* Blog Content (CKEditor HTML) */}
      <div
        className="max-w-none blog-content-wrapper" // Add a specific class here
        dangerouslySetInnerHTML={{ __html: blogContent }}
      />

      {/* Comments */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comments</h2>

        {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
          <ul className="space-y-6">
            {selectedBlog.comments.map((comment) => {
              const isOwnComment = comment.user_email === user?.email;
              const isEditing = editingCommentId === comment.id;

              return (
                <li
                  key={comment.id}
                  className="bg-gray-100 p-4 rounded-lg flex gap-4"
                >
                  <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold">
                    {comment.user_name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{comment.user_name}</p>
                        <p className="text-xs text-gray-500">
                          {comment.user_email}
                        </p>
                      </div>

                      {isOwnComment && !isEditing && (
                        <div className="flex gap-2 text-sm">
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-green-600 hover:text-green-800"
                          >
                            {t("Blog.edit")}
                          </button>

                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {t("Blog.delete")}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          className="border rounded p-2 flex-1"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                        />

                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                          {t("Blog.update")}
                        </button>

                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded"
                        >
                          {t("Blog.cancel")}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>

      {/* Add Comment */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Post a Comment
        </h2>

        {commentError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {commentError}
          </div>
        )}

        <div className="flex gap-2">
          <input
            disabled={!isUser || isSubmitting}
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={
              isUser ? "Write your comment..." : "Login to post a comment"
            }
            className="flex-1 border p-2 rounded"
          />

          <button
            disabled={!isUser || isSubmitting || !commentInput.trim()}
            onClick={handleCommentSubmit}
            className="px-4 py-2 bg-[#1E3A5F] text-white rounded"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
