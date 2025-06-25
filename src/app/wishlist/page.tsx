import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Wishlist } from "@/models/Wishlist";
import { Product } from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import { redirect } from "next/navigation";
import { Heart, ShoppingBag, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");
  
  await connectToDatabase();

  // ✅ Optimized: Single aggregation pipeline for better performance
  const wishlistData = await Wishlist.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(session.user._id) }
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: "$product"
    },
    {
      $replaceRoot: { newRoot: "$product" }
    }
  ]);

  // ✅ Create wishlist status map (all items are in wishlist by definition)
  const wishlistStatus = wishlistData.reduce((acc, product) => {
    acc[product._id.toString()] = true;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/home" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="bg-pink-50 p-2 rounded-full">
                <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">
                  {wishlistData.length} {wishlistData.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {wishlistData.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center shadow-2xl">
                <Heart className="w-16 h-16 text-pink-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-700" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your wishlist is waiting
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Save your favorite items and never lose track of what you love. Start building your dream collection!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/home"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Start Shopping</span>
              </Link>
              
              <Link
                href="/featured"
                className="group inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>View Featured</span>
              </Link>
            </div>
          </div>
        ) : (
          // Wishlist Items
          <>
            {/* Header Stats */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Your Saved Items
                    </h2>
                    <p className="text-gray-600">
                      {wishlistData.length} carefully curated {wishlistData.length === 1 ? 'piece' : 'pieces'} waiting for you
                    </p>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">
                        {wishlistData.length}
                      </div>
                      <div className="text-sm text-gray-600">Items</div>
                    </div>
                    
                    <div className="w-px h-12 bg-gray-300"></div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{wishlistData.reduce((sum, product) => sum + (product.price || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Value</div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Stats */}
                <div className="sm:hidden mt-4 pt-4 border-t border-pink-200">
                  <div className="flex justify-around">
                    <div className="text-center">
                      <div className="text-xl font-bold text-pink-600">
                        {wishlistData.length}
                      </div>
                      <div className="text-xs text-gray-600">Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        ₹{wishlistData.reduce((sum, product) => sum + (product.price || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Total Value</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlistData.map((product: any) => (
                <div key={product._id.toString()} className="transform hover:scale-[1.02] transition-transform duration-300">
                  <ProductCard
                    product={{
                      ...product,
                      images: product.images?.map(({ url, public_id }: any) => ({
                        url,
                        public_id,
                      })),
                    }}
                    initialInWishlist={true} // ✅ All items are in wishlist
                  />
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to make them yours?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Don't let your favorites slip away. These handpicked pieces are waiting to become part of your collection.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/home"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </Link>
                
                <Link
                  href="/categories"
                  className="group inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  <span>Browse Categories</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}