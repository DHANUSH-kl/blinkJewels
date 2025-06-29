"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, Star, Tag, Palette, Filter, X, Check, ShoppingBag, Home, RotateCcw } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: "buy" | "rent";
}

interface FilterSidebarProps {
  categories: Category[];
  loading?: boolean;
}

// Range Slider Component
const RangeSlider = ({ min, max, value, onChange, formatValue }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleChange = (e, index) => {
    const newValue = [...value];
    newValue[index] = parseInt(e.target.value);
    
    // Ensure min doesn't exceed max and vice versa
    if (index === 0 && newValue[0] > newValue[1]) {
      newValue[1] = newValue[0];
    } else if (index === 1 && newValue[1] < newValue[0]) {
      newValue[0] = newValue[1];
    }
    
    onChange(newValue);
  };

  return (
    <div className="px-2 py-4">
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          border-color: #1d4ed8;
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: none;
        }
        
        .slider-thumb::-moz-range-track {
          background: transparent;
          height: 8px;
        }
      `}</style>
      
      <div className="relative mb-6">
        {/* Track */}
        <div className="absolute top-1/2 w-full h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Active Track */}
        <div 
          className="absolute top-1/2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-y-1/2 transition-all duration-200"
          style={{
            left: `${(value[0] / max) * 100}%`,
            width: `${((value[1] - value[0]) / max) * 100}%`
          }}
        ></div>
        
        {/* Min Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => handleChange(e, 0)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: 1 }}
        />
        
        {/* Max Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => handleChange(e, 1)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: 2 }}
        />
      </div>
      
      {/* Value Display */}
      <div className="flex justify-between items-center text-sm">
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
          {formatValue(value[0])}
        </div>
        <div className="px-2 text-gray-400">-</div>
        <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
          {formatValue(value[1])}
        </div>
      </div>
    </div>
  );
};

export const FilterSidebar = ({ categories, loading = false }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [localFilters, setLocalFilters] = useState({
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    search: searchParams.get("search") || "",
    rating: searchParams.get("rating") || "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    category: true,
    price: true,
    rating: false,
  });

  const [priceRange, setPriceRange] = useState([
    parseInt(localFilters.minPrice) || 0,
    parseInt(localFilters.maxPrice) || 100000,
  ]);

  const [activeFilters, setActiveFilters] = useState(new Set());

  useEffect(() => {
    const active = new Set();
    if (localFilters.type) active.add('type');
    if (localFilters.category) active.add('category');
    if (localFilters.minPrice || localFilters.maxPrice) active.add('price');
    if (localFilters.rating) active.add('rating');
    if (localFilters.search) active.add('search');
    setActiveFilters(active);
  }, [localFilters]);

  // Fixed filter toggle function
  const handleFilterToggle = (key: string, value: string) => {
    const currentValue = localFilters[key];
    const newValue = currentValue === value ? "" : value;
    
    let newFilters = { ...localFilters, [key]: newValue };
    
    // FIXED: When changing type, clear category selection to avoid conflicts
    if (key === 'type') {
      newFilters.category = "";
    }
    
    setLocalFilters(newFilters);
    
    // Apply filters immediately
    setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v && v !== "") {
          params.set(k, v);
        }
      });
      router.push(`/products?${params.toString()}`);
    }, 100);
  };

  // FIXED: Improved category selection function
  const handleCategoryToggle = (categorySlug: string, categoryType: string) => {
    let newFilters = { ...localFilters };
    
    // Create a unique identifier for the category that includes both slug and type
    const currentCategoryKey = localFilters.category;
    const currentTypeKey = localFilters.type;
    
    // Check if we're clicking on the currently selected category of the same type
    const isCurrentlySelected = (currentCategoryKey === categorySlug && currentTypeKey === categoryType);
    
    if (isCurrentlySelected) {
      // Deselect the category but keep the type
      newFilters.category = "";
    } else {
      // Select the new category and set/update the type
      newFilters.category = categorySlug;
      newFilters.type = categoryType;
    }
    
    setLocalFilters(newFilters);
    
    // Apply filters immediately
    setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v && v !== "") {
          params.set(k, v);
        }
      });
      router.push(`/products?${params.toString()}`);
    }, 100);
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    const newFilters = {
      ...localFilters,
      minPrice: newRange[0].toString(),
      maxPrice: newRange[1] === 100000 ? "" : newRange[1].toString(),
    };
    setLocalFilters(newFilters);
    
    // Auto-apply price filters with slight delay
    setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (newRange[0] > 0) {
        params.set("minPrice", newRange[0].toString());
      } else {
        params.delete("minPrice");
      }
      if (newRange[1] !== 100000) {
        params.set("maxPrice", newRange[1].toString());
      } else {
        params.delete("maxPrice");
      }
      
      // Preserve other filters
      if (localFilters.type) params.set("type", localFilters.type);
      if (localFilters.category) params.set("category", localFilters.category);
      if (localFilters.search) params.set("search", localFilters.search);
      if (localFilters.rating) params.set("rating", localFilters.rating);
      
      router.push(`/products?${params.toString()}`);
    }, 500);
  };

  const handleRatingToggle = (rating: string) => {
    handleFilterToggle('rating', rating);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const resetFilters = () => {
    const emptyFilters = {
      type: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      rating: "",
    };
    setLocalFilters(emptyFilters);
    setPriceRange([0, 100000]);
    setSearchTerm("");
    router.push("/products");
  };

  const getActiveFiltersCount = () => {
    return activeFilters.size;
  };

  const formatPrice = (value) => {
    if (value >= 100000) return "₹1L+";
    if (value >= 1000) return `₹${(value/1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  // FIXED: Show all categories, but group them properly
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // FIXED: Group categories by slug to show both buy and rent versions
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    if (!acc[category.slug]) {
      acc[category.slug] = [];
    }
    acc[category.slug].push(category);
    return acc;
  }, {});

  // FIXED: Helper function to check if a category is selected
  const isCategorySelected = (categorySlug: string, categoryType: string) => {
    return localFilters.category === categorySlug && localFilters.type === categoryType;
  };

  // Sync with URL params
  useEffect(() => {
    const newFilters = {
      type: searchParams.get("type") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      search: searchParams.get("search") || "",
      rating: searchParams.get("rating") || "",
    };
    
    setLocalFilters(newFilters);
    
    setPriceRange([
      parseInt(searchParams.get("minPrice")) || 0,
      parseInt(searchParams.get("maxPrice")) || 100000,
    ]);
  }, [searchParams]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                {getActiveFiltersCount()}
              </span>
            )}
          </h2>
        </div>
        
        {/* Clear Filters */}
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={resetFilters}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {/* Product Type */}
        <div className="p-6">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-gray-900 flex items-center">
              <ShoppingBag className={`w-4 h-4 mr-2 ${activeFilters.has('type') ? 'text-blue-600' : 'text-gray-600'}`} />
              Product Type
              {activeFilters.has('type') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></div>
              )}
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.type ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.type && (
            <div className="mt-4 space-y-2">
              {[
                { value: "", label: "All Products", color: "gray" },
                { value: "buy", label: "Purchase", color: "blue" },
                { value: "rent", label: "Rental", color: "purple" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterToggle('type', option.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    localFilters.type === option.value
                      ? option.color === 'gray' 
                        ? 'bg-gray-100 border-2 border-gray-300 shadow-md'
                        : option.color === 'blue'
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-md'
                        : 'bg-purple-100 border-2 border-purple-300 shadow-md'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      option.color === 'gray' ? 'bg-gray-400' :
                      option.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      localFilters.type === option.value 
                        ? option.color === 'gray' ? 'text-gray-800' : 
                          option.color === 'blue' ? 'text-blue-800' : 'text-purple-800'
                        : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  {localFilters.type === option.value && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="p-6">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Tag className={`w-4 h-4 mr-2 ${activeFilters.has('category') ? 'text-blue-600' : 'text-gray-600'}`} />
              Categories
              {activeFilters.has('category') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></div>
              )}
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.category ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.category && (
            <div className="mt-4 space-y-4">
              {/* Category Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Category List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <button
                  onClick={() => handleFilterToggle('category', '')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    localFilters.category === ''
                      ? 'bg-gray-100 border-2 border-gray-300 shadow-md'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    localFilters.category === '' ? 'text-gray-800' : 'text-gray-700'
                  }`}>
                    All Categories
                  </span>
                  {localFilters.category === '' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
                
                {/* FIXED: Show grouped categories with both buy and rent options */}
                {Object.entries(groupedCategories).map(([slug, categoryGroup]) => (
                  <div key={slug} className="space-y-1">
                    {categoryGroup.map((category) => (
                      <button
                        key={`${category._id}-${category.type}`}
                        onClick={() => handleCategoryToggle(category.slug, category.type)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isCategorySelected(category.slug, category.type)
                            ? category.type === 'buy' 
                              ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
                              : 'bg-purple-100 border-2 border-purple-300 shadow-md'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-3 ${
                              category.type === 'buy' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                          ></div>
                          <span className={`text-sm font-medium ${
                            isCategorySelected(category.slug, category.type)
                              ? category.type === 'buy' ? 'text-blue-800' : 'text-purple-800'
                              : 'text-gray-700'
                          }`}>
                            {category.name} ({category.type === 'buy' ? 'Purchase' : 'Rental'})
                          </span>
                        </div>
                        {isCategorySelected(category.slug, category.type) && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
                
                {Object.keys(groupedCategories).length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">No categories found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="p-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Palette className={`w-4 h-4 mr-2 ${activeFilters.has('price') ? 'text-blue-600' : 'text-gray-600'}`} />
              Price Range
              {activeFilters.has('price') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></div>
              )}
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.price ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.price && (
            <div className="mt-4">
              <RangeSlider
                min={0}
                max={100000}
                value={priceRange}
                onChange={handlePriceRangeChange}
                formatValue={formatPrice}
              />
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="p-6">
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Star className={`w-4 h-4 mr-2 ${activeFilters.has('rating') ? 'text-blue-600' : 'text-gray-600'}`} />
              Rating
              {activeFilters.has('rating') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></div>
              )}
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.rating ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.rating && (
            <div className="mt-4 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingToggle(rating.toString())}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    localFilters.rating === rating.toString()
                      ? 'bg-yellow-100 border-2 border-yellow-300 shadow-md'
                      : 'hover:bg-yellow-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 transition-colors ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-medium ${
                      localFilters.rating === rating.toString() ? 'text-yellow-800' : 'text-gray-600'
                    }`}>
                      & Up
                    </span>
                  </div>
                  {localFilters.rating === rating.toString() && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};