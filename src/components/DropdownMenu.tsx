"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DropdownMenu = ({ title, items }: { title: string; items: any[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm hover:text-yellow-400 transition"
      >
        {title} <ChevronDown size={14} />
      </button>
      {open && (
        <div
          className="absolute left-0 mt-2 bg-zinc-800 rounded-md shadow-md p-2 text-sm z-50"
          onMouseLeave={() => setOpen(false)}
        >
          {items.length === 0 ? (
            <p className="text-gray-400 px-3">No categories</p>
          ) : (
            items.map((item: any) => (
              <Link
                key={item._id}
                href={`/${title.toLowerCase()}/${item.slug}`}
                className="block px-3 py-1 hover:text-yellow-400"
              >
                {item.name}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
