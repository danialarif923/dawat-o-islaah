import React from "react";
import { Link } from "react-router-dom";
import useBlogs from "../../hooks/useBlogs";

const PostCard = ({ id, image, title, date, author, tags }) => {
  return (
    <Link to={`/blog/${id}`}>
      <div className=" bg-white w-full shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img src={image} alt={title} className="w-full h-40 object-cover" />
          {tags && (
            <div className="absolute top-2 right-2 flex flex-wrap gap-x-3 gap-y-2 ml-3">
              {tags.map((t, index) => (
                <span
                  key={index}
                  className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {title.length > 40 ? title.substring(0, 40) + "..." : title}
          </h3>
          <p className="text-sm text-green-500 mb-1">{date}</p>
          <p className="text-sm text-gray-500">{author && author}</p>
        </div>
      </div>
    </Link>
  );
};

const RecentArticles = () => {
  const { blogs, loading, error } = useBlogs();

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">Error loading blogs.</div>
    );

  return (
    <div className="px-6 sm:px-14 md:px-20 lg:px-32 flex flex-col items-center md:block">
      <div className=" flex items-center justify-center mb-8  px-2 md:px-5">
        <h2 className="text-2xl md:text-3xl text-[#222222] font-bold uppercase tracking-tight">
          Recent articles
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {blogs.map((blog, index) => (
          <PostCard
            key={blog.id || index}
            id={blog.id}
            image={blog.featured_image}
            tags={["BLOG"]}
            title={blog.title}
            date={new Date(blog.created_at).toLocaleDateString()}
            // author={"Amaze Technologies"}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentArticles;
