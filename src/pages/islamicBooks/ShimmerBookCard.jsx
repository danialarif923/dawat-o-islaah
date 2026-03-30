const ShimmerBookCard = () => {
  return (
    <div className="animate-pulse bg-gray-200 rounded-xl p-4 shadow-lg">
      <div className="h-48 bg-gray-300 rounded-lg"></div>
      <div className="h-6 w-3/4 bg-gray-400 my-2 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-400 my-1 rounded"></div>
      <div className="h-4 w-full bg-gray-300 my-1 rounded"></div>
      <div className="h-4 w-full bg-gray-300 my-1 rounded"></div>
      <div className="h-10 w-full bg-gray-400 my-3 rounded"></div>
    </div>
  );
};

export default ShimmerBookCard;
