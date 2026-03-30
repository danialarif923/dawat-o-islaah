import { Link } from "react-router-dom";

const SihahSittaGrid = ({ books }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {books.map((book, index) => (
      <Link
        to={book.link}
        key={index}
        className="bg-white rounded-lg text-center shadow-lg flex flex-col items-center justify-center min-h-[120px] border-2 border-transparent hover:border-blue-500 transition-all duration-300 relative px-8"
      >
        <div className="p-4 w-full sm:w-fit sm:p-6 mt-3 sm:mt-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
          <p className="text-lg sm:text-xl font-arabic text-[#1E3A5F]">
            {book.title}
          </p>
        </div>
        <p className="mt-1 sm:mt-2 mb-3 sm:mb-5 text-gray-600 text-xs sm:text-sm">
          {book.transliteration}
        </p>
      </Link>
    ))}
  </div>
);

export default SihahSittaGrid;
