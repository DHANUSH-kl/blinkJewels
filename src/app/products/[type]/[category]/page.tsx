// app/products/[type]/[category]/page.tsx (Updated for new structure)
import { Suspense } from "react";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductGrid, ProductGridSkeleton } from "@/components/products/ProductGrid";
import { FilterSkeleton } from "@/components/products/FilterSkeleton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SortDropdown } from "@/components/products/SortDropdown";
import { ViewToggle } from "@/components/products/ViewToggle";
import { redirect } from "next/navigation";

interface Params {
  params: {
    type: "buy" | "rent";
    category: string;
  };
  searchParams: {
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sort?: string;
    view?: string;
  };
}

// This component handles the legacy route structure
// It redirects to the new unified /products route with appropriate query parameters
export default async function LegacyProductsPage({ params, searchParams }: Params) {
  const { type, category } = params;
  const { minPrice, maxPrice, search, sort, view } = searchParams;

  // Build new URL with query parameters
  const newParams = new URLSearchParams();
  newParams.set('type', type);
  newParams.set('category', category);
  
  if (minPrice) newParams.set('minPrice', minPrice);
  if (maxPrice) newParams.set('maxPrice', maxPrice);
  if (search) newParams.set('search', search);
  if (sort) newParams.set('sort', sort);
  if (view) newParams.set('view', view);

  // Redirect to the new unified products page
  redirect(`/products?${newParams.toString()}`);
}
