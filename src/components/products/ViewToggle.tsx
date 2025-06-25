// components/products/ViewToggle.tsx
import React from "react";
import { Grid, List } from "lucide-react";

interface ViewToggleProps {
  value: 'grid' | 'list';
  onChange: (value: 'grid' | 'list') => void;
}

export const ViewToggle = ({ value, onChange }: ViewToggleProps) => {
  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 transition-colors ${
          value === 'grid'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 transition-colors ${
          value === 'list'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};
