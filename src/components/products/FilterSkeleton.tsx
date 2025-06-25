// components/products/FilterSkeleton.tsx
import React from "react";

export const FilterSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-6">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 bg-gray-300 rounded mr-3"></div>
                    <div className="h-4 bg-gray-300 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};