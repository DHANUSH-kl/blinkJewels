// src/components/search/EnhancedSearchBar.tsx - Fixed with direct product navigation
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Tag, Star } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'product' | 'category' | 'recent' | 'trending';
  category?: string;
  price?: number;
  rating?: number;
  image?: string;
}

interface EnhancedSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({ 
  placeholder = "Search for jewelry...", 
  className = "",
  onSearch,
  isMobile = false 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Trending searches
  const trendingSearches = [
    'Gold Necklace',
    'Diamond Earrings', 
    'Wedding Rings',
    'Silver Bracelet',
    'Pearl Jewelry',
    'Engagement Ring'
  ];

  // Load recent searches from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('recentSearches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5));
        } catch (error) {
          console.error('Error parsing recent searches:', error);
        }
      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching suggestions for: "${searchQuery}"`);
        
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Suggestions response:', data);
          setSuggestions(data.suggestions || []);
        } else {
          console.error('Suggestions API error:', response.status, response.statusText);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }
  }, [query, debouncedSearch]);

  // Handle search execution (for general search queries)
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    console.log(`Executing search for: "${searchQuery}"`);

    // Save to recent searches
    if (typeof window !== 'undefined') {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      sessionStorage.setItem('recentSearches', JSON.stringify(updated));
    }

    // Execute search - navigate to products page with search query
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }

    setShowSuggestions(false);
    setQuery(searchQuery);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle suggestion click - UPDATED for direct product navigation
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    console.log('Suggestion clicked:', suggestion);
    
    // Close suggestions dropdown
    setShowSuggestions(false);
    
    // Navigate based on suggestion type
    if (suggestion.type === 'product') {
      // Direct navigation to product detail page
      console.log(`Navigating to product: /product/${suggestion.id}`);
      router.push(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      // Navigate to products page with category filter
      console.log(`Navigating to category: /products?category=${suggestion.title}`);
      router.push(`/products?category=${encodeURIComponent(suggestion.title)}`);
    } else {
      // For recent/trending searches, do a general search
      console.log(`Performing search for: ${suggestion.title}`);
      handleSearch(suggestion.title);
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (query.length > 0 || recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'category':
        return <Tag className="w-4 h-4 text-blue-500" />;
      case 'product':
        return <Search className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Prepare suggestions for display
  const getDisplaySuggestions = () => {
    const allSuggestions: SearchSuggestion[] = [];

    // Add API suggestions first (products and categories)
    allSuggestions.push(...suggestions);

    // If no query, show recent and trending
    if (!query.trim()) {
      // Add recent searches
      recentSearches.forEach((search, index) => {
        allSuggestions.push({
          id: `recent-${index}`,
          title: search,
          type: 'recent'
        });
      });

      // Add trending searches
      trendingSearches.forEach((search, index) => {
        if (!recentSearches.includes(search)) {
          allSuggestions.push({
            id: `trending-${index}`,
            title: search,
            type: 'trending'
          });
        }
      });
    }

    return allSuggestions.slice(0, 8);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            placeholder-gray-500 text-gray-900
            ${isMobile ? 'text-base' : 'text-sm'}
            transition-colors duration-200
          `}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                Searching...
              </div>
            </div>
          )}

          {!loading && getDisplaySuggestions().length > 0 && (
            <div className="py-2">
              {/* Show section headers */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Recent Searches
                </div>
              )}

              {/* Display suggestions with enhanced styling for products */}
              {getDisplaySuggestions().map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                >
                  {/* Icon */}
                  {suggestion.image ? (
                    <img 
                      src={suggestion.image} 
                      alt={suggestion.title}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    getSuggestionIcon(suggestion.type)
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    
                    {suggestion.category && (
                      <div className="text-xs text-gray-500">
                        in {suggestion.category}
                      </div>
                    )}

                    {/* Product type indicator */}
                    {suggestion.type === 'product' && (
                      <div className="text-xs text-green-600 font-medium">
                        Product
                      </div>
                    )}
                    
                    {suggestion.type === 'category' && (
                      <div className="text-xs text-blue-600 font-medium">
                        Category
                      </div>
                    )}
                  </div>

                  {/* Price and Rating */}
                  <div className="flex flex-col items-end space-y-1">
                    {suggestion.price && (
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(suggestion.price)}
                      </div>
                    )}

                    {suggestion.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {suggestion.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Trending section */}
              {!query.trim() && trendingSearches.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t">
                    Trending Searches
                  </div>
                  
                  {trendingSearches
                    .filter(search => !recentSearches.includes(search))
                    .slice(0, 4)
                    .map((search, index) => (
                      <button
                        key={`trending-${index}`}
                        onClick={() => handleSearch(search)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                      >
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-900">{search}</span>
                      </button>
                    ))}
                </>
              )}
            </div>
          )}

          {/* Empty state when no query */}
          {!loading && !query.trim() && recentSearches.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Start typing to search for products</p>
            </div>
          )}

          {/* No results state */}
          {!loading && query.trim() && getDisplaySuggestions().length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No suggestions found</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Search for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;