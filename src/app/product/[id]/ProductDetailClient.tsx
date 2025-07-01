//  src/app/product/[id]/ProductDetailClient.tsx

'use client';

import WishlistToggleWrapper from "@/components/WishlistToggleWrapper";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
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
    Expand,
    X,
    Loader2
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

// Enhanced Image Gallery Component
function ImageGallery({ images, productTitle }: { images: { url: string; public_id: string }[], productTitle: string }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
    const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
    
    // Refs for focus management
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Memoized navigation functions
    const nextImage = useCallback(() => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Enhanced keyboard navigation with better event handling
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isFullscreen) return;
        
        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                nextImage();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevImage();
                break;
            case 'Escape':
                e.preventDefault();
                setIsFullscreen(false);
                break;
            case 'Home':
                e.preventDefault();
                setSelectedImageIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setSelectedImageIndex(images.length - 1);
                break;
        }
    }, [isFullscreen, nextImage, prevImage, images.length]);

    // Image loading handlers
    const handleImageLoad = useCallback((index: number) => {
        setImageLoading(prev => ({ ...prev, [index]: false }));
    }, []);

    const handleImageError = useCallback((index: number) => {
        setImageLoading(prev => ({ ...prev, [index]: false }));
        setImageErrors(prev => ({ ...prev, [index]: true }));
    }, []);

    // Preload adjacent images for better UX
    useEffect(() => {
        if (images.length <= 1) return;
        
        const preloadImage = (index: number) => {
            if (index >= 0 && index < images.length && !imageErrors[index]) {
                const img = new window.Image();
                img.src = images[index].url;
            }
        };

        // Preload next and previous images
        const nextIndex = (selectedImageIndex + 1) % images.length;
        const prevIndex = (selectedImageIndex - 1 + images.length) % images.length;
        
        preloadImage(nextIndex);
        preloadImage(prevIndex);
    }, [selectedImageIndex, images, imageErrors]);

    // Enhanced fullscreen management with focus handling
    useEffect(() => {
        if (isFullscreen) {
            // Save current focus and prevent body scroll
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';
            
            // Focus the fullscreen container for keyboard navigation
            setTimeout(() => {
                fullscreenRef.current?.focus();
            }, 100);
            
            // Add keyboard listener
            document.addEventListener('keydown', handleKeyDown);
        } else {
            // Restore body scroll and focus
            document.body.style.overflow = 'unset';
            previousFocusRef.current?.focus();
        }
        
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen, handleKeyDown]);

    // Auto-advance slideshow (optional - can be toggled)
    const [autoPlay, setAutoPlay] = useState(false);
    useEffect(() => {
        if (!autoPlay || images.length <= 1 || isFullscreen) return;
        
        const interval = setInterval(nextImage, 4000);
        return () => clearInterval(interval);
    }, [autoPlay, nextImage, images.length, isFullscreen]);

    const getImageSrc = useCallback((index: number) => {
        return imageErrors[index] ? '/placeholder-image.jpg' : images[index]?.url || '/placeholder-image.jpg';
    }, [images, imageErrors]);

    return (
        <>
            <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white group">
                    <div className="aspect-square relative">
                        {/* Loading indicator */}
                        {imageLoading[selectedImageIndex] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        )}
                        
                        <Image
                            src={getImageSrc(selectedImageIndex)}
                            alt={`${productTitle} - Image ${selectedImageIndex + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            priority={selectedImageIndex === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onLoad={() => handleImageLoad(selectedImageIndex)}
                            onError={() => handleImageError(selectedImageIndex)}
                        />

                        {/* Navigation Arrows - Enhanced */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    aria-label={`Previous image (${((selectedImageIndex - 1 + images.length) % images.length) + 1} of ${images.length})`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    aria-label={`Next image (${((selectedImageIndex + 1) % images.length) + 1} of ${images.length})`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Enhanced Controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {images.length > 1 && (
                                <button
                                    onClick={() => setAutoPlay(!autoPlay)}
                                    className={`p-2 rounded-full backdrop-blur-sm z-10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                                        autoPlay ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                                    }`}
                                    aria-label={autoPlay ? "Stop slideshow" : "Start slideshow"}
                                >
                                    {autoPlay ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </button>
                            )}
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm z-10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="View fullscreen"
                            >
                                <Expand className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Enhanced Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                <span className="sr-only">Image </span>
                                {selectedImageIndex + 1} of {images.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Thumbnail Navigation */}
                {images.length > 1 && (
                    <div className="relative">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth" role="tablist" aria-label="Product images">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        selectedImageIndex === index
                                            ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                                            : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                                    }`}
                                    aria-label={`View image ${index + 1} of ${images.length}`}
                                    role="tab"
                                    aria-selected={selectedImageIndex === index}
                                >
                                    <Image
                                        src={getImageSrc(index)}
                                        alt={`${productTitle} thumbnail ${index + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index)}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Fullscreen Modal */}
            {isFullscreen && (
                <div 
                    ref={fullscreenRef}
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setIsFullscreen(false)}
                    tabIndex={0}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image gallery fullscreen view"
                    aria-describedby="fullscreen-instructions"
                >
                    {/* Screen reader instructions */}
                    <div id="fullscreen-instructions" className="sr-only">
                        Use arrow keys to navigate between images, Home and End to go to first or last image, Escape to close.
                    </div>

                    {/* Enhanced Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(false);
                        }}
                        className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm z-[10000] transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Close fullscreen view"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Image Container */}
                    <div 
                        className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full">
                            {imageLoading[selectedImageIndex] && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <Loader2 className="w-12 h-12 animate-spin text-white" />
                                </div>
                            )}
                            
                            <Image
                                src={getImageSrc(selectedImageIndex)}
                                alt={`${productTitle} - Fullscreen view ${selectedImageIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                                sizes="100vw"
                                onLoad={() => handleImageLoad(selectedImageIndex)}
                                onError={() => handleImageError(selectedImageIndex)}
                            />
                        </div>

                        {/* Enhanced Fullscreen Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        prevImage(); 
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-4 rounded-full backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                                    aria-label={`Previous image (${((selectedImageIndex - 1 + images.length) % images.length) + 1} of ${images.length})`}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        nextImage(); 
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-4 rounded-full backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                                    aria-label={`Next image (${((selectedImageIndex + 1) % images.length) + 1} of ${images.length})`}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>

                                {/* Enhanced Fullscreen Image Counter */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full text-base font-medium backdrop-blur-sr flex items-center gap-3">
                                    <span>{selectedImageIndex + 1} / {images.length}</span>
                                    <div className="flex gap-1">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImageIndex(index);
                                                }}
                                                className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 ${
                                                    index === selectedImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                                                }`}
                                                aria-label={`Go to image ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// Utility function for price formatting
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Utility function for calculating discount
const calculateDiscount = (currentPrice: number, originalPrice: number): number => {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Enhanced Share functionality
const handleShare = async (product: SerializedProduct) => {
    const shareData = {
        title: product.title,
        text: `Check out this ${product.type === 'rent' ? 'rental' : 'product'}: ${product.title}`,
        url: window.location.href,
    };

    try {
        if (navigator.share && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {
            console.error('Clipboard access denied:', clipboardError);
        }
    }
};

export default function ProductDetailClient({ product, initialWishlist, originalPrice, discountPercentage }: Props) {
    const [isSharing, setIsSharing] = useState(false);

    const onShare = async () => {
        setIsSharing(true);
        try {
            await handleShare(product);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link 
                        href="/home" 
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
                        aria-label="Go back to home page"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onShare}
                            disabled={isSharing}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            aria-label="Share this product"
                        >
                            {isSharing ? (
                                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                            ) : (
                                <Share2 className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                        <WishlistToggleWrapper
                            productId={product._id}
                            initialState={initialWishlist}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Product Images with Enhanced Gallery */}
                    <section className="relative" aria-label="Product images">
                        {/* Enhanced Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
                            {product.isFeatured && (
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    ⭐ FEATURED
                                </span>
                            )}
                            {discountPercentage > 0 && (
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {discountPercentage}% OFF
                                </span>
                            )}
                            {product.type === "rent" && (
                                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    🏠 RENTAL
                                </span>
                            )}
                        </div>

                        {/* Enhanced Stock indicator */}
                        <div className="absolute top-4 right-4 z-30">
                            {product.stock > 0 ? (
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                    <CheckCircle className="w-3 h-3" />
                                    In Stock ({product.stock})
                                </span>
                            ) : (
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        <ImageGallery 
                            images={product.images || [{ url: '/placeholder-image.jpg', public_id: 'placeholder' }]} 
                            productTitle={product.title} 
                        />
                    </section>

                    {/* Enhanced Product Information */}
                    <section className="space-y-6" aria-label="Product details">
                        {/* Title and Rating */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                {product.title}
                            </h1>

                            {/* Enhanced Rating */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1" role="img" aria-label={`Rating: ${product.rating.toFixed(1)} out of 5 stars`}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600 font-medium">
                                    {product.rating.toFixed(1)} ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>

                            {/* Enhanced Categories and Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.categories?.map((category: any, index: number) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                                    >
                                        {category.name || 'Category'}
                                    </span>
                                ))}
                                {product.tags?.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Enhanced Description */}
                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Enhanced Pricing Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                            {product.type === "buy" ? (
                                <div>
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {formatPrice(product.price)}
                                        </span>
                                        {discountPercentage > 0 && (
                                            <span className="text-xl text-gray-500 line-through">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-green-600 font-semibold flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Free shipping on orders above ₹999
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-4xl font-bold text-purple-700">
                                            {formatPrice(product.rentalPrice || product.price)}
                                        </span>
                                        <span className="text-lg text-gray-600">/day</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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

                        {/* Enhanced Features */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Why Choose This Product?
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700">Quality Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                                    <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    <span className="text-gray-700">Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                                    <Shield className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                    <span className="text-gray-700">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                                    <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <span className="text-gray-700">Customer Favorite</span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Reviews Preview */}
                        {product.reviews && product.reviews.length > 0 && (
                            <section className="border-t pt-6" aria-label="Customer reviews">
                                <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                                <div className="space-y-4">
                                    {product.reviews.slice(0, 2).map((review: any, index: number) => (
                                        <article key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex" role="img" aria-label={`${review.rating || 5} out of 5 stars`}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < (review.rating || 5)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                                }`}
                                                            aria-hidden="true"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {review.customerName || 'Anonymous Customer'}
                                                </span>
                                                {review.verifiedPurchase && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {review.comment || 'Great product! Highly recommended.'}
                                            </p>
                                            {review.date && (
                                                <time className="text-xs text-gray-500 mt-2 block" dateTime={review.date}>
                                                    {new Date(review.date).toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </time>
                                            )}
                                        </article>
                                    ))}
                                    {product.reviews.length > 2 && (
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1">
                                            View all {product.reviews.length} reviews →
                                        </button>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Additional Product Information */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Product Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Product ID:</span>
                                    <span className="font-medium text-gray-900">{product._id.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className={`font-medium capitalize ${
                                        product.type === 'rent' ? 'text-purple-700' : 'text-blue-700'
                                    }`}>
                                        {product.type}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Stock:</span>
                                    <span className={`font-medium ${
                                        product.stock > 10 ? 'text-green-600' : 
                                        product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                    </span>
                                </div>
                                {product.createdAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Listed:</span>
                                        <time className="font-medium text-gray-900" dateTime={product.createdAt}>
                                            {new Date(product.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short'
                                            })}
                                        </time>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Information for Buy Products */}
                        {product.type === 'buy' && (
                            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-green-600" />
                                    Delivery Information
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-green-500" />
                                        <span className="text-gray-700">Standard delivery: 3-5 business days</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="w-4 h-4 text-green-500" />
                                        <span className="text-gray-700">Express delivery available for ₹99 extra</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span className="text-gray-700">Free returns within 7 days</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rental Terms for Rent Products */}
                        {product.type === 'rent' && (
                            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                    Rental Terms
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-purple-500" />
                                        <span className="text-gray-700">Minimum rental period: 3 days</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-purple-500" />
                                        <span className="text-gray-700">Security deposit: ₹{Math.floor((product.rentalPrice || product.price) * 10).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="w-4 h-4 text-purple-500" />
                                        <span className="text-gray-700">Pickup and delivery included</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-purple-500" />
                                        <span className="text-gray-700">Professional cleaning after return</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Related Products Section Placeholder */}
                <section className="mt-16" aria-label="You might also like">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
                    <div className="bg-gray-100 rounded-2xl p-8 text-center">
                        <p className="text-gray-600">Related products will be displayed here</p>
                        <small className="text-gray-500">Implement related products logic in your backend</small>
                    </div>
                </section>
            </main>

            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.title,
                        "description": product.description,
                        "image": product.images?.map(img => img.url) || [],
                        "sku": product._id,
                        "brand": {
                            "@type": "Brand",
                            "name": "Your Store Name" // Replace with your actual brand name
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": product.type === 'rent' ? (product.rentalPrice || product.price) : product.price,
                            "priceCurrency": "INR",
                            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                            "url": typeof window !== 'undefined' ? window.location.href : '',
                            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
                        },
                        "aggregateRating": product.reviews.length > 0 ? {
                            "@type": "AggregateRating",
                            "ratingValue": product.rating,
                            "reviewCount": product.reviews.length
                        } : undefined,
                        "review": product.reviews.slice(0, 5).map((review: any) => ({
                            "@type": "Review",
                            "reviewRating": {
                                "@type": "Rating",
                                "ratingValue": review.rating || 5
                            },
                            "author": {
                                "@type": "Person",
                                "name": review.customerName || "Anonymous"
                            },
                            "reviewBody": review.comment || "Great product!"
                        }))
                    })
                }}
            />
        </div>
    );
}