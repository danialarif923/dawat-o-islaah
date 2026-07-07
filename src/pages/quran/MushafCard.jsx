import { Link } from "react-router-dom";

const MushafCard = ({ layout }) => {
  return (
    <Link to={`/read-quran/${layout.slug}`} className="block">
      <div className="flex items-center px-4 md:px-6 py-4 md:py-6 text-md md:text-lg transition-all duration-300 transform hover:scale-102 rounded-lg border-neutral-200 border-2 hover:shadow-lg cursor-pointer relative min-h-[100px]">
        <div className="pr-2 flex-1">
          <h3 className="text-lg md:text-xl font-semibold leading-tight">{layout.name}</h3>
          {layout.linesPerPage && (
            <p className="text-sm md:text-md text-gray-500">
              {layout.linesPerPage} lines per page
              {layout.totalPages ? ` · ${layout.totalPages} pages` : ""}
            </p>
          )}
          <p className="text-xs md:text-sm text-gray-400">{layout.description}</p>
        </div>
        <div className="text-blue-600 text-right shrink-0">
          <span className="font-surah-name text-[3rem]">﷽</span>
        </div>
        <hr className="absolute bottom-0 left-0 w-full border-gray-300 transition-opacity duration-300 hover:opacity-0" />
      </div>
    </Link>
  );
};

export default MushafCard;
