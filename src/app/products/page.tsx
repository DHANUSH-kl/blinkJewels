// src/app/products/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { FilterSkeleton } from "@/components/products/FilterSkeleton";
import { SortDropdown } from "@/components/products/SortDropdown";
import { ViewToggle } from "@/components/products/ViewToggle";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Grid, List, SlidersHorizontal, X } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: "buy" | "rent";
  rentalPrice?: number;
  images: { url: string; public_id: string }[];
  categories: string[];
  rating: number;
  stock: number;
  isFeatured: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: "buy" | "rent";
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const currentFilters = {
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    search: searchParams.get("search") || "",
  };

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.type) params.set("type", currentFilters.type);
      if (currentFilters.category) params.set("category", currentFilters.category);
      if (currentFilters.minPrice) params.set("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice) params.set("maxPrice", currentFilters.maxPrice);
      if (currentFilters.search) params.set("search", currentFilters.search);

      const response = await fetch(`/api/products?${params.toString()}`);
      

      const { products } = await response.json();
      const sortedProducts = sortProducts(products, sortBy);
      setProducts(sortedProducts);


    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Sort products
  const sortProducts = (products: Product[], sortBy: string) => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
      default:
        return sorted; // Assuming API returns newest first
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const sortedProducts = sortProducts(products, newSortBy);
    setProducts(sortedProducts);
  };

  // Generate breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }];
    
    if (currentFilters.type) {
      items.push({
        label: currentFilters.type === "buy" ? "Purchase" : "Rental",
        href: `/products?type=${currentFilters.type}`
      });
    }
    
    if (currentFilters.category) {
      const category = categories.find(cat => cat.slug === currentFilters.category);
      if (category) {
        items.push({
          label: category.name,
          href: `/products?${new URLSearchParams(currentFilters).toString()}`
        });
      }
    }
    
    return items;
  };

  // Get page title
  const getPageTitle = () => {
    if (currentFilters.category) {
      const category = categories.find(cat => cat.slug === currentFilters.category);
      if (category) {
        return `${category.name} - ${currentFilters.type === "buy" ? "Purchase" : "Rental"}`;
      }
    }
    
    if (currentFilters.type) {
      return currentFilters.type === "buy" ? "Products for Purchase" : "Products for Rental";
    }
    
    return "All Products";
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb items={getBreadcrumbItems()} />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-gray-600 mt-1">
                {loading ? "Loading..." : `${products.length} products found`}
              </p>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <SortDropdown value={sortBy} onChange={handleSortChange} />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center justify-between mt-4 pt-4 border-t">
            <SortDropdown value={sortBy} onChange={handleSortChange} />
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-80 flex-shrink-0">
            {categories.length > 0 ? (
              <FilterSidebar categories={categories} loading={loading} />
            ) : (
              <FilterSkeleton />
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <ProductGrid 
                products={products} 
                viewMode={viewMode}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-full overflow-y-auto pb-20">
              {categories.length > 0 ? (
                <FilterSidebar 
                  categories={categories} 
                  loading={loading}
                />
              ) : (
                <FilterSkeleton />
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Grid className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Products Page Component with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="hidden md:block w-80 flex-shrink-0">
              <FilterSkeleton />
            </div>
            <div className="flex-1 min-w-0">
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}