// src/components/search/SearchResults.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  isActive: boolean;
  createdAt: string;
  tags: string[];
}

interface SearchResultsProps {
  initialQuery?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ initialQuery = '' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [sortBy, setSortBy] = useState('relevance');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('search') || initialQuery;

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (Array.isArray(data)) {
          const uniqueCategories = [...new Set(data.map((cat: any) => cat.name))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Search products
  const searchProducts = async (page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '12',
        sortBy,
        ...(category && { category }),
        ...(type && { type }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice })
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.currentPage || 1);
      } else {
        console.error('Search failed:', data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial search and when filters change
  useEffect(() => {
    searchProducts(1);
  }, [query, sortBy, category, type, minPrice, maxPrice]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    searchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear filters
  const clearFilters = () => {
    setCategory('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    searchProducts(1);
  };

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Searching</h2>
          <p className="text-gray-600">Enter a search term to find products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          {loading ? 'Searching...' : `${totalProducts} products found`}
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(category || type || minPrice || maxPrice) && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {[category, type, minPrice, maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="relevance">Most Relevant</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (₹)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 || 
                      page === currentPage + 3
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;