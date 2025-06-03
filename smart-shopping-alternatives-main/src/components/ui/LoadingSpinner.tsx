
const LoadingSpinner = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 flex flex-col justify-center items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-shopping-primary absolute top-0 left-0"></div>
      </div>
      <span className="mt-6 text-shopping-dark font-medium text-center">Searching for alternatives...</span>
      <div className="mt-4 space-y-2 w-full max-w-sm">
        <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-2 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-2 bg-gray-200 rounded animate-pulse w-4/6"></div>
      </div>
      <p className="mt-6 text-sm text-gray-500 max-w-md text-center">
        We're searching across multiple retailers to find you the best deals. This may take a moment...
      </p>
    </div>
  );
};

export default LoadingSpinner;
