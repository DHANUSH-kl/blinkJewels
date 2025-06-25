import { connectToDatabase } from "@/lib/mongoose";
import "@/models/Category"; // ✅ Force register Category first
import { Product } from "@/models/Product";
import { Wishlist } from "@/models/Wishlist";
import WishlistToggleWrapper from "@/components/WishlistToggleWrapper";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    ShoppingBag,
    Clock,
    Star,
    Heart,
    Share2,
    Package,
    Shield,
    Truck,
    Calendar,
    ArrowLeft,
    Plus,
    Minus,
    CheckCircle
} from "lucide-react";
import Link from "next/link";
import ProductActionsWrapper from "@/components/ProductActionsWrapper";

interface Props {
    params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
    await connectToDatabase();
    
    // Get session first
    const session = await getServerSession(authOptions);
    
    const product = await Product.findById(params.id).populate('categories').lean();

    if (!product) return notFound();

    // ✅ Optimized wishlist check - single query instead of calling isInWishlist function
    let initialWishlist = false;
    if (session?.user?._id) {
        const wishlistItem = await Wishlist.findOne({
            user: session.user._id,
            productId: product._id
        }).lean();
        
        initialWishlist = !!wishlistItem;
    }

    // Calculate discount percentage for display
    const originalPrice = Math.floor(product.price * 1.2);
    const discountPercentage = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/home" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                        <WishlistToggleWrapper
                            productId={product._id.toString()}
                            initialState={initialWishlist}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
                            <div className="aspect-square relative">
                                <Image
                                    src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {product.isFeatured && (
                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            ⭐ FEATURED
                                        </span>
                                    )}
                                    {discountPercentage > 0 && (
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            {discountPercentage}% OFF
                                        </span>
                                    )}
                                    {product.type === "rent" && (
                                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            🏠 RENTAL
                                        </span>
                                    )}
                                </div>

                                {/* Stock indicator */}
                                <div className="absolute top-4 right-4">
                                    {product.stock > 0 ? (
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            In Stock ({product.stock})
                                        </span>
                                    ) : (
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Images Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.slice(1, 5).map((image, index) => (
                                    <div key={index} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
                                        <Image
                                            src={image.url}
                                            alt={`${product.title} ${index + 2}`}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Information */}
                    <div className="space-y-6">
                        {/* Title and Rating */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                {product.title}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600 font-medium">
                                    {product.rating.toFixed(1)} ({product.reviews.length} reviews)
                                </span>
                            </div>

                            {/* Categories and Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.categories?.map((category: any, index: number) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {category.name || 'Category'}
                                    </span>
                                ))}
                                {product.tags?.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                            {product.type === "buy" ? (
                                <div>
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        {discountPercentage > 0 && (
                                            <span className="text-xl text-gray-500 line-through">
                                                ₹{originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-green-600 font-semibold flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        Free shipping on orders above ₹999
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-4xl font-bold text-purple-700">
                                            ₹{product.rentalPrice?.toLocaleString() || product.price.toLocaleString()}
                                        </span>
                                        <span className="text-lg text-gray-600">/day</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Minimum 3 days
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Shield className="w-4 h-4" />
                                            Security deposit required
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Actions Component */}
                        <ProductActionsWrapper product={product} />

                        {/* Features */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Why Choose This Product?
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">Quality Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-blue-500" />
                                    <span className="text-gray-700">Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-purple-500" />
                                    <span className="text-gray-700">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-red-500" />
                                    <span className="text-gray-700">Customer Favorite</span>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Preview */}
                        {product.reviews && product.reviews.length > 0 && (
                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                                <div className="space-y-4">
                                    {product.reviews.slice(0, 2).map((review: any, index: number) => (
                                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < (review.rating || 5)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {review.customerName || 'Anonymous'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 text-sm">
                                                {review.comment || 'Great product!'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}