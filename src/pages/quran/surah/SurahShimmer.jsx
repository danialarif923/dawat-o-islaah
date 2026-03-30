import React from "react";

const ShimmerLoader = () => {
  return (
    <div className="space-y-10 px-12 py-12  md:px-36 md:py-24 animate-pulse">
      {/* Fake Surah Header */}
      <div className="text-center">
        <div className="w-48 h-6 bg-gray-300 rounded mx-auto mb-2"></div>
        <div className="w-32 h-4 bg-gray-300 rounded mx-auto"></div>
      </div>

      {/* Fake Translation Selection */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 h-10 bg-gray-300 rounded"></div>
        <div className="w-full md:w-1/2 h-10 bg-gray-300 rounded"></div>
      </div>

      {/* Fake Ayah Blocks */}
      <div className="space-y-6">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-white shadow-lg rounded-lg p-6 md:p-8 relative"
            >
              {/* Play Button Placeholder */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-gray-300 rounded-full"></div>

              {/* Fake Arabic Text */}
              <div className="w-3/4 h-6 bg-gray-300 rounded mx-auto my-4"></div>

              {/* Fake Translations */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* English Placeholder */}
                <div className="text-left">
                  <div className="w-5/6 h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="w-4/6 h-3 bg-gray-300 rounded"></div>
                </div>

                {/* Urdu Placeholder */}
                <div className="text-right">
                  <div className="w-5/6 h-4 bg-gray-300 rounded mb-2 ml-auto"></div>
                  <div className="w-4/6 h-3 bg-gray-300 rounded ml-auto"></div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShimmerLoader;
