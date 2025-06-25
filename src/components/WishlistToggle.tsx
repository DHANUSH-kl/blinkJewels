// ✅ components/WishlistToggle.tsx
"use client";

import { Heart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { toggleWishlist } from "@/lib/actions/wishlist";

interface Props {
  productId: string;
  initialState: boolean;
}

export default function WishlistToggle({ productId, initialState }: Props) {
  const [liked, setLiked] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(() => {
      toggleWishlist(productId)
        .then((res) => {
          setLiked((prev) => !prev);
          toast.success(res.status === "added" ? "Added to Wishlist" : "Removed from Wishlist");
        })
        .catch(() => {
          toast.error("Please log in to use wishlist");
        });
    });
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
      disabled={isPending}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          liked ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </button>
  );
}
