"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { ShoppingBag, Sparkles, Gem } from "lucide-react";
import { useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const Carousel = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prevent flash of all slides by delaying initialization
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const slides = [
    {
      image: "/carousel/1.jpg",
      title: "Timeless Elegance",
      subtitle: "Discover Premium Jewelry Collections",
      description: "Handcrafted pieces that define luxury and sophistication",
      accent: "from-blue-600 to-purple-600"
    },
    {
      image: "/carousel/2.jpg", 
      title: "Modern Luxury",
      subtitle: "Contemporary Designs for Today",
      description: "Where tradition meets innovation in every piece",
      accent: "from-purple-600 to-pink-600"
    },
    {
      image: "/carousel/3.jpg",
      title: "Exclusive Collection",
      subtitle: "Limited Edition Masterpieces",
      description: "Rare gems and precious metals crafted to perfection",
      accent: "from-pink-600 to-red-600"
    }
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Loading placeholder */}
      {!isReady && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Main Carousel */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          autoplay={{ 
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: true
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          loop={true}
          speed={2000}
          slidesPerView={1}
          watchSlidesProgress={true}
          preloadImages={true}
          updateOnWindowResize={true}
          observer={true}
          observeParents={true}
          pagination={{
            el: '.carousel-pagination',
            clickable: true,
            dynamicBullets: false,
            renderBullet: function (index, className) {
              return `<span class="${className} carousel-bullet"></span>`;
            }
          }}
          onSwiper={(swiper) => {
            // Ensure proper initialization
            swiper.update();
          }}
          className="w-full h-full"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx} className="relative">
              <div className="relative w-full h-full">
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="max-w-3xl">
                      {/* Premium Badge */}
                      <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${slide.accent} bg-opacity-20 backdrop-blur-md rounded-full px-6 py-3 mb-6 border border-white/20`}>
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">Premium Collection</span>
                        {/* <Gem className="w-5 h-5 text-white" /> */}
                      </div>
                      
                      {/* Main Content */}
                      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        {slide.title}
                      </h1>
                      
                      <h2 className="text-2xl md:text-3xl text-white/90 font-light mb-6 leading-relaxed">
                        {slide.subtitle}
                      </h2>
                      
                      <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed max-w-2xl">
                        {slide.description}
                      </p>
                      
                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-6">
                        <button className={`group bg-gradient-to-r ${slide.accent} hover:scale-105 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:shadow-2xl flex items-center justify-center gap-3 min-w-[200px]`}>
                          <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                          <span>Buy Now</span>
                        </button>
                        
                        <button className="group border-3 border-white/40 backdrop-blur-md hover:bg-white/10 hover:border-white/60 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 min-w-[200px]">
                          <Gem className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                          <span>Rent Now</span>
                        </button>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-12 flex flex-wrap gap-8 text-white/70">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full" />
                          <span className="text-sm font-medium">Free Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full" />
                          <span className="text-sm font-medium">Lifetime Warranty</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full" />
                          <span className="text-sm font-medium">Easy Returns</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Pagination */}
      <div className="carousel-pagination absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3"></div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-10 opacity-20 animate-pulse hidden lg:block">
        <Gem className="w-32 h-32 text-white" />
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 opacity-10 animate-bounce hidden lg:block">
        <Sparkles className="w-24 h-24 text-white" />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .carousel-bullet {
          width: 60px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          opacity: 1;
          transition: all 0.5s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .carousel-bullet:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: scaleY(1.5);
        }
        
        .carousel-bullet.swiper-pagination-bullet-active {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          transform: scaleY(1.8);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
        }

        /* Smooth transitions */
        .swiper-fade .swiper-slide {
          transition-property: opacity, transform;
          transition-duration: 2000ms;
        }
        
        /* Enhanced fade effect with proper initialization */
        .swiper-fade .swiper-slide {
          transition-property: opacity;
          transition-duration: 2000ms;
          transition-timing-function: ease-in-out;
        }
        
        .swiper-fade .swiper-slide-active {
          opacity: 1;
        }
        
        .swiper-fade .swiper-slide:not(.swiper-slide-active) {
          opacity: 0;
        }

        /* Prevent flash of unstyled content */
        .swiper-initialized .swiper-slide {
          visibility: visible;
        }
        
        .swiper:not(.swiper-initialized) .swiper-slide:not(:first-child) {
          opacity: 0;
          visibility: hidden;
        }

        /* Hide default pagination */
        .swiper-pagination {
          display: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .carousel-bullet {
            width: 40px;
            height: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default Carousel;