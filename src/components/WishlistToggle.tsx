// src/components/WishlistToggle.tsx
"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

interface Props {
  productId: string;
  initialState: boolean;
}

export default function WishlistToggle({ productId, initialState }: Props) {
  const [liked, setLiked] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const toggle = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Please log in to use wishlist");
            return;
          }
          throw new Error('Failed to toggle wishlist');
        }

        const data = await response.json();
        
        // Update the local state immediately for instant feedback
        setLiked(data.inWishlist);
        
        // Show success message
        toast.success(data.message || (data.inWishlist ? "Added to Wishlist" : "Removed from Wishlist"));
        
      } catch (error) {
        console.error('Wishlist toggle error:', error);
        toast.error("Something went wrong. Please try again.");
        
        // Revert the optimistic update on error
        setLiked(initialState);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isPending}
      aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-200 ${
          liked 
            ? "fill-red-500 text-red-500 scale-110" 
            : "text-gray-600 hover:text-red-400"
        } ${isPending ? "animate-pulse" : ""}`}
      />
    </button>
  );
}