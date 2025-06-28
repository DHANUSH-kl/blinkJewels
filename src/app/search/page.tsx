// src/app/search/page.tsx
import React from 'react';
import SearchResults from '@/components/search/SearchResults';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SearchResults />
    </div>
  );
}

export const metadata = {
  title: 'Search Results | Blink Jewels',
  description: 'Search for jewelry and accessories at Blink Jewels',
};