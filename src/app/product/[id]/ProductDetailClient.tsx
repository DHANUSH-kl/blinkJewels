'use client';

import WishlistToggleWrapper from "@/components/WishlistToggleWrapper";
import Image from "next/image";
import { useState } from "react";
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
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Expand
} from "lucide-react";
import Link from "next/link";
import ProductActionsWrapper from "@/components/ProductActionsWrapper";

interface SerializedProduct {
    _id: string;
    title: string;
    description: string;
    price: number;
    rentalPrice?: number;
    stock: number;
    rating: number;
    reviews: any[];
    categories: any[];
    tags?: string[];
    images?: { url: string; public_id: string }[];
    isFeatured: boolean;
    type: "buy" | "rent";
    createdAt?: string;
    updatedAt?: string;
}

interface Props {
    product: SerializedProduct;
    initialWishlist: boolean;
    originalPrice: number;
    discountPercentage: number;
}

// Client Component for Image Gallery
function ImageGallery({ images, productTitle }: { images: { url: string; public_id: string }[], productTitle: string }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') setIsFullscreen(false);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white group">
                    <div className="aspect-square relative">
                        <Image
                            src={images[selectedImageIndex]?.url || '/placeholder-image.jpg'}
                            alt={`${productTitle} - Image ${selectedImageIndex + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            priority
                        />

                        {/* Navigation Arrows - Show on hover if multiple images */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Fullscreen Button */}
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                            aria-label="View fullscreen"
                        >
                            <Expand className="w-5 h-5" />
                        </button>

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                {selectedImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                    selectedImageIndex === index
                                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                                        : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                                }`}
                                aria-label={`View image ${index + 1}`}
                            >
                                <Image
                                    src={image.url}
                                    alt={`${productTitle} thumbnail ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setIsFullscreen(false)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    <div className="relative max-w-5xl max-h-full">
                        <div className="relative aspect-square w-full max-w-4xl mx-auto">
                            <Image
                                src={images[selectedImageIndex]?.url || '/placeholder-image.jpg'}
                                alt={`${productTitle} - Fullscreen`}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Fullscreen Controls */}
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm"
                            aria-label="Close fullscreen"
                        >
                            ✕
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Fullscreen Image Counter */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                    {selectedImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function ProductDetailClient({ product, initialWishlist, originalPrice, discountPercentage }: Props) {
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
                            productId={product._id}
                            initialState={initialWishlist}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Product Images with Interactive Gallery */}
                    <div className="relative">
                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
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
                        <div className="absolute top-4 right-4 z-10">
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

                        <ImageGallery 
                            images={product.images || [{ url: '/placeholder-image.jpg', public_id: 'placeholder' }]} 
                            productTitle={product.title} 
                        />
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