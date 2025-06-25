// components/products/ProductControls.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SortDropdown } from "./SortDropdown";
import { ViewToggle } from "./ViewToggle";

export const ProductControls = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  const handleViewChange = (value: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-4">
      <SortDropdown 
        value={searchParams.get('sort') || "newest"} 
        onChange={handleSortChange} 
      />
      <ViewToggle 
        value={searchParams.get('view') as 'grid' | 'list' || "grid"} 
        onChange={handleViewChange} 
      />
    </div>
  );
};