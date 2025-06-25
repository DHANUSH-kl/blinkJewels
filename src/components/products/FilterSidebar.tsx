"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, Star, Tag, Palette, Filter, X, Check, ShoppingBag, Home } from "lucide-react";

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

export const FilterSidebar = ({ categories, loading = false }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [localFilters, setLocalFilters] = useState({
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    search: searchParams.get("search") || "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    category: true,
    price: true,
    rating: false,
  });

  const [priceRange, setPriceRange] = useState({
    min: parseInt(localFilters.minPrice) || 0,
    max: parseInt(localFilters.maxPrice) || 100000,
  });

  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Predefined price ranges
  const priceRanges = [
    { label: "Under ₹1,000", min: 0, max: 1000 },
    { label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
    { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
    { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
    { label: "Above ₹50,000", min: 50000, max: null },
  ];

  // Debounced filter application
  const debouncedApplyFilters = useCallback(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (localFilters.type) params.set("type", localFilters.type);
    if (localFilters.category) params.set("category", localFilters.category);
    if (localFilters.minPrice) params.set("minPrice", localFilters.minPrice);
    if (localFilters.maxPrice) params.set("maxPrice", localFilters.maxPrice);
    if (localFilters.search) params.set("search", localFilters.search);

    router.push(`/products?${params.toString()}`);
    setIsFilterApplied(true);
    
    // Reset the applied state after animation
    setTimeout(() => setIsFilterApplied(false), 1000);
  };

  // Filter categories based on search and type
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !localFilters.type || category.type === localFilters.type;
    return matchesSearch && matchesType;
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Auto-apply filters for better UX
    setTimeout(() => {
      const params = new URLSearchParams();
      if (newFilters.type) params.set("type", newFilters.type);
      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
      if (newFilters.search) params.set("search", newFilters.search);
      
      router.push(`/products?${params.toString()}`);
    }, 100);
  };

  const handlePriceRangeChange = (min: number, max: number | null) => {
    const newFilters = {
      ...localFilters,
      minPrice: min.toString(),
      maxPrice: max?.toString() || "",
    };
    setLocalFilters(newFilters);
    setPriceRange({ min, max: max || 100000 });
    
    // Auto-apply price filters
    setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("minPrice", min.toString());
      if (max) params.set("maxPrice", max.toString());
      else params.delete("maxPrice");
      
      router.push(`/products?${params.toString()}`);
    }, 100);
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
    };
    setLocalFilters(emptyFilters);
    setPriceRange({ min: 0, max: 100000 });
    setSearchTerm("");
    router.push("/products");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.type) count++;
    if (localFilters.category) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.search) count++;
    return count;
  };

  // Sync with URL params
  useEffect(() => {
    setLocalFilters({
      type: searchParams.get("type") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                {getActiveFiltersCount()}
              </span>
            )}
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline transition-all duration-200 flex items-center space-x-1 hover:bg-red-50 px-2 py-1 rounded-lg"
          >
            <X className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Product Type */}
        <div className="p-6">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-gray-900 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-gray-600" />
              Product Type
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.type ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.type && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <label className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value=""
                  checked={localFilters.type === ""}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  All Products
                </span>
                {localFilters.type === "" && (
                  <Check className="w-4 h-4 ml-auto text-green-500 animate-in zoom-in duration-200" />
                )}
              </label>
              
              <label className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="buy"
                  checked={localFilters.type === "buy"}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-900 transition-colors flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Purchase
                </span>
                {localFilters.type === "buy" && (
                  <Check className="w-4 h-4 ml-auto text-green-500 animate-in zoom-in duration-200" />
                )}
              </label>
              
              <label className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-purple-50 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="rent"
                  checked={localFilters.type === "rent"}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-purple-900 transition-colors flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Rental
                </span>
                {localFilters.type === "rent" && (
                  <Check className="w-4 h-4 ml-auto text-green-500 animate-in zoom-in duration-200" />
                )}
              </label>
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
              <Tag className="w-4 h-4 mr-2 text-gray-600" />
              Categories
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.category ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.category && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
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
                <label className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={localFilters.category === ""}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    All Categories
                  </span>
                  {localFilters.category === "" && (
                    <Check className="w-4 h-4 ml-auto text-green-500 animate-in zoom-in duration-200" />
                  )}
                </label>
                
                {filteredCategories.map((category) => (
                  <label key={category._id} className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={localFilters.category === category.slug}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className={`w-4 h-4 border-gray-300 focus:ring-2 transition-colors ${
                        category.type === 'buy' 
                          ? 'text-blue-600 focus:ring-blue-500' 
                          : 'text-purple-600 focus:ring-purple-500'
                      }`}
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex items-center flex-1">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          category.type === 'buy' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                      ></div>
                      {category.name}
                    </span>
                    {localFilters.category === category.slug && (
                      <Check className="w-4 h-4 ml-auto text-green-500 animate-in zoom-in duration-200" />
                    )}
                  </label>
                ))}
                
                {filteredCategories.length === 0 && (
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
              <Palette className="w-4 h-4 mr-2 text-gray-600" />
              Price Range
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.price ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.price && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* Predefined Price Ranges */}
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                      (parseInt(localFilters.minPrice) || 0) === range.min &&
                      (parseInt(localFilters.maxPrice) || null) === range.max
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-300 shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                    }`}
                  >
                    <span>{range.label}</span>
                    {(parseInt(localFilters.minPrice) || 0) === range.min &&
                     (parseInt(localFilters.maxPrice) || null) === range.max && (
                      <Check className="w-4 h-4 text-green-500 animate-in zoom-in duration-200" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Custom Price Range */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Custom Range</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      onBlur={() => handlePriceRangeChange(priceRange.min, priceRange.max === 100000 ? null : priceRange.max)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={priceRange.max === 100000 ? "" : priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100000 }))}
                      onBlur={() => handlePriceRangeChange(priceRange.min, priceRange.max === 100000 ? null : priceRange.max)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
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
              <Star className="w-4 h-4 mr-2 text-gray-600" />
              Rating
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                expandedSections.rating ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.rating && (
            <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-yellow-50 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="flex items-center">
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
                    <span className="ml-2 text-sm text-gray-600">& Up</span>
                  </div>
                </label>
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