// app/products/[type]/layout.tsx (Optional - if you want nested routing)
import { ReactNode } from "react";

interface ProductTypeLayoutProps {
  children: ReactNode;
  params: {
    type: string;
  };
}

export default function ProductTypeLayout({ children, params }: ProductTypeLayoutProps) {
  const { type } = params;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional: Add type-specific header or navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="capitalize">{type}</span>
            <span>Products</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
