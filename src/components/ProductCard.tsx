"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Clock, Heart } from "lucide-react";

export default function ProductCard({
  product,
  initialInWishlist = false,
}: {
  product: any;
  initialInWishlist?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialInWishlist);
  const [loading, setLoading] = useState(false);

  // ✅ Use useCallback to prevent unnecessary re-renders
  const toggleWishlist = useCallback(async () => {
    if (!session) return router.push("/login");

    setLoading(true);
    
    // ✅ Optimistic update - immediate UI feedback
    const newWishlistState = !wishlisted;
    setWishlisted(newWishlistState);

    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!res.ok) {
        throw new Error('Failed to toggle wishlist');
      }

      const data = await res.json();
      
      // ✅ Sync with server response
      setWishlisted(data.inWishlist);
      
      if (process.env.NODE_ENV === "development") {
        console.log(data.inWishlist ? "💖 Added" : "💔 Removed", "→", product._id);
      }
    } catch (error) {
      // ✅ Revert optimistic update on error
      setWishlisted(!newWishlistState);
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [session, router, wishlisted, product._id]);

  // ✅ Only check wishlist status if not provided and user is logged in
  useEffect(() => {
    if (session && !initialInWishlist) {
      const checkWishlist = async () => {
        try {
          const res = await fetch("/api/wishlist/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product._id }),
          });
          
          if (res.ok) {
            const data = await res.json();
            setWishlisted(data.exists);
          }
        } catch (error) {
          console.error("Failed to check wishlist:", error);
        }
      };

      checkWishlist();
    }
  }, [session, product._id, initialInWishlist]);

  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 transform hover:-translate-y-2">
      <div className="relative overflow-hidden aspect-square">
        <Link href={`/product/${product._id}`}>
          <Image
            src={product.images?.[0]?.url}
            alt={product.title}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            priority={false} // ✅ Don't prioritize all images
            loading="lazy" // ✅ Lazy load for better performance
          />
        </Link>
        
        {/* ✅ Only show wishlist button for logged in users */}
        {session && (
          <button
            onClick={toggleWishlist}
            disabled={loading}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-70"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                wishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-6">
        <Link href={`/product/${product._id}`}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg leading-snug hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2 font-medium">(4.8)</span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹{Math.floor(product.price * 1.25)?.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            {product.type === "buy" && (
              <Link
                href={`/product/${product._id}`}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy</span>
              </Link>
            )}
            {product.type === "rent" && (
              <Link
                href={`/product/${product._id}`}
                className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <Clock className="w-4 h-4" />
                <span>Rent</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}