// src/utils/searchUtils.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format price for Indian currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Generate search highlights
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

// Search result categories
export const SEARCH_CATEGORIES = [
  'Necklaces',
  'Earrings', 
  'Rings',
  'Bracelets',
  'Pendants',
  'Anklets',
  'Bangles',
  'Chains',
  'Sets'
] as const;

// Popular search terms
export const POPULAR_SEARCHES = [
  'Gold Necklace',
  'Diamond Earrings',
  'Wedding Rings', 
  'Silver Bracelet',
  'Pearl Jewelry',
  'Engagement Ring',
  'Gold Chain',
  'Temple Jewelry',
  'Kundan Set',
  'Antique Jewelry'
] as const;

// Search suggestion types
export type SearchSuggestionType = 'product' | 'category' | 'recent' | 'trending';

export interface SearchSuggestion {
  id: string;
  title: string;
  type: SearchSuggestionType;
  category?: string;
  price?: number;
  rating?: number;
  image?: string;
}

// Storage keys
export const STORAGE_KEYS = {
  RECENT_SEARCHES: 'recentSearches',
  SEARCH_PREFERENCES: 'searchPreferences'
} as const;

// Get recent searches from storage
export const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = sessionStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save search to recent searches
export const saveRecentSearch = (query: string): void => {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(s => s !== query)].slice(0, 10);
    sessionStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save recent search:', error);
  }
};

// Clear recent searches
export const clearRecentSearches = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  } catch (error) {
    console.warn('Failed to clear recent searches:', error);
  }
};

// Build search URL with parameters
export const buildSearchUrl = (
  query: string,
  filters?: {
    category?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }
): string => {
  const params = new URLSearchParams();
  
  if (query.trim()) {
    params.set('search', query.trim());
  }
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
  }
  
  return `/search?${params.toString()}`;
};

// Extract search parameters from URL
export const parseSearchParams = (searchParams: URLSearchParams) => {
  return {
    query: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: parseInt(searchParams.get('page') || '1')
  };
};