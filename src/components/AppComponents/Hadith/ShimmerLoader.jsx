import React from "react";

const ShimmerLoader = () => {
  return (
    <div className="container mx-auto px-4 md:px-20 py-6">
      {/* Heading Placeholder */}
      <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-6 animate-pulse"></div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 p-4 rounded-lg shadow-md flex flex-col gap-y-3"
          >
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4 mx-auto"></div>
            <div className="flex justify-center gap-2 mt-2">
              <div className="h-5 bg-gray-300 rounded w-16"></div>
              <div className="h-5 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShimmerLoader;
