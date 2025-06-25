// components/products/ProductGrid.tsx
import React from "react";
import ProductCard from "@/components/ProductCard";
import { Grid, List, Package } from "lucide-react";

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

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
  loading?: boolean;
}

export const ProductGrid = ({ products, viewMode = 'grid', loading = false }: ProductGridProps) => {
  if (loading) {
    return <ProductGridSkeleton viewMode={viewMode} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'space-y-4'
      }
    `}>
      {products.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product} 
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

