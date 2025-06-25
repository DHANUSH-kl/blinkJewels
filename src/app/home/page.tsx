import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';
import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { connectToDatabase } from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Wishlist } from '@/models/Wishlist';
import { Sparkles, ArrowRight, Truck, Shield, Heart } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectToDatabase();

  // Get session for wishlist data
  const session = await getServerSession(authOptions);

  // Convert MongoDB docs to plain objects
  const featuredRaw = await Product.find({ isFeatured: true }).limit(8).lean();
  const latestRaw = await Product.find().sort({ createdAt: -1 }).limit(8).lean();
  const featured = JSON.parse(JSON.stringify(featuredRaw));
  const latest = JSON.parse(JSON.stringify(latestRaw));

  // ✅ Get wishlist status for all products in one query
  let wishlistStatus: Record<string, boolean> = {};
  if (session?.user?._id) {
    const allProductIds = [
      ...featured.map((p: any) => p._id),
      ...latest.map((p: any) => p._id)
    ];

    const wishlistItems = await Wishlist.find({
      user: session.user._id,
      productId: { $in: allProductIds }
    }).select('productId').lean();

    wishlistStatus = allProductIds.reduce((acc, productId) => {
      acc[productId] = wishlistItems.some(item => 
        item.productId.toString() === productId
      );
      return acc;
    }, {} as Record<string, boolean>);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ClientNavbarWrapper />

      <div className="relative">
        <Carousel />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Featured Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Curated Selection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Handpicked pieces that embody exceptional craftsmanship and timeless beauty
            </p>
            <Link
              href="/featured"
              className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg transition-all duration-300"
            >
              <span>View Complete Collection</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((p: any) => (
              <ProductCard 
                key={p._id} 
                product={p} 
                initialInWishlist={wishlistStatus[p._id] || false} 
              />
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50/30 -mx-6 lg:-mx-8 px-6 lg:px-8 rounded-3xl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Fresh Arrivals</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">New Arrivals</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                The latest designs that set new standards in luxury and sophistication
              </p>
              <Link
                href="/new-arrivals"
                className="group inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-lg transition-all duration-300"
              >
                <span>Discover New Pieces</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latest.map((p: any) => (
                <ProductCard 
                  key={p._id} 
                  product={p} 
                  initialInWishlist={wishlistStatus[p._id] || false}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100/50">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Blink Jewels</h3>
              <p className="text-lg text-gray-600">Your satisfaction is our commitment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Truck className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Free Express Shipping</h4>
                <p className="text-gray-600 leading-relaxed">
                  Complimentary shipping on all orders above ₹2,000 with secure packaging
                </p>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Lifetime Guarantee</h4>
                <p className="text-gray-600 leading-relaxed">
                  100% authentic jewelry with certified quality and lifetime craftsmanship warranty
                </p>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Heart className="w-10 h-10 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Hassle-Free Returns</h4>
                <p className="text-gray-600 leading-relaxed">
                  30-day easy return policy with full refund and free return shipping
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}