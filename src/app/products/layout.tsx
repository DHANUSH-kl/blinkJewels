// app/products/layout.tsx
import { ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
}