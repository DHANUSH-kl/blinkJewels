// Product Grid Skeleton
export const ProductGridSkeleton = ({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) => {
  const skeletonCount = viewMode === 'grid' ? 12 : 6;
  
  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'space-y-4'
      }
    `}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={index} className="animate-pulse">
          {viewMode === 'grid' ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 flex">
              <div className="w-24 h-24 bg-gray-300 rounded mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
