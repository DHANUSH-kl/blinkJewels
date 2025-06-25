// components/ui/Breadcrumb.tsx
import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {index === items.length - 1 ? (
            <span className="text-gray-500 font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
