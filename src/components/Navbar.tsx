"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Heart, User, ChevronDown, Menu, X, Search } from "lucide-react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [buyCategories, setBuyCategories] = useState([]);
  const [rentCategories, setRentCategories] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const [rentDropdownOpen, setRentDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const accountRef = useRef<HTMLDivElement>(null);
  const buyDropdownRef = useRef<HTMLDivElement>(null);
  const rentDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch("/api/categories");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Categories data:", data); // Debug log
        
        // Handle different possible response structures
        if (Array.isArray(data)) {
          // If data is an array, filter by type
          setBuyCategories(data.filter((cat: any) => cat.type === 'buy'));
          setRentCategories(data.filter((cat: any) => cat.type === 'rent'));
        } else if (data.buy && data.rent) {
          // If data has buy/rent properties
          setBuyCategories(data.buy || []);
          setRentCategories(data.rent || []);
        } else if (data.categories) {
          // If data has categories property
          setBuyCategories(data.categories.filter((cat: any) => cat.type === 'buy') || []);
          setRentCategories(data.categories.filter((cat: any) => cat.type === 'rent') || []);
        } else {
          console.warn("Unexpected categories data structure:", data);
          setBuyCategories([]);
          setRentCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setBuyCategories([]);
        setRentCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (buyDropdownRef.current && !buyDropdownRef.current.contains(e.target as Node)) {
        setBuyDropdownOpen(false);
      }
      if (rentDropdownRef.current && !rentDropdownRef.current.contains(e.target as Node)) {
        setRentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setBuyDropdownOpen(false);
    setRentDropdownOpen(false);
    setAccountOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md text-gray-900 px-4 sm:px-6 lg:px-8 py-4 shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BJ</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Blink Jewels
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Buy Dropdown */}
            <div ref={buyDropdownRef} className="relative">
              <button
                onClick={() => setBuyDropdownOpen(!buyDropdownOpen)}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <span>Buy</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${buyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {buyDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Buy Categories</h3>
                  </div>
                  <div className="py-2">
                    {categoriesLoading ? (
                      <div className="px-4 py-3 text-gray-500">Loading categories...</div>
                    ) : buyCategories.length > 0 ? (
                      buyCategories.map((category: any) => (
                        <Link
                          key={category._id || category.id}
                          href={`/products?type=buy&category=${category.slug}`}
                          className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setBuyDropdownOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>{category.name}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">No buy categories available</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Rent Dropdown */}
            <div ref={rentDropdownRef} className="relative">
              <button
                onClick={() => setRentDropdownOpen(!rentDropdownOpen)}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <span>Rent</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${rentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {rentDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Rent Categories</h3>
                  </div>
                  <div className="py-2">
                    {categoriesLoading ? (
                      <div className="px-4 py-3 text-gray-500">Loading categories...</div>
                    ) : rentCategories.length > 0 ? (
                      rentCategories.map((category: any) => (
                        <Link
                          key={category._id || category.id}
                          href={`/products?type=rent&category=${category.slug}`}
                          className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                          onClick={() => setRentDropdownOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                            <span>{category.name}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">No rent categories available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for jewelry..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button (Mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {/* Account Dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <User className="w-5 h-5" />
              </button>
              
              {accountOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{session.user.name}</p>
                        <p className="text-sm text-gray-500">{session.user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link 
                          href="/profile" 
                          className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setAccountOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/orders" 
                          className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setAccountOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link 
                          href="/track-order" 
                          className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setAccountOpen(false)}
                        >
                          Track Order
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <button
                        onClick={() => signIn()}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      >
                        Sign In
                      </button>
                      <Link 
                        href="/signup" 
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setAccountOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="lg:hidden mt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for jewelry..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-40 animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 space-y-6">
            {/* Buy Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Buy Categories</h3>
              <div className="space-y-2">
                {categoriesLoading ? (
                  <div className="text-gray-500">Loading categories...</div>
                ) : buyCategories.length > 0 ? (
                  buyCategories.map((category: any) => (
                    <Link
                      key={category._id || category.id}
                      href={`/buy/${category.slug}`}
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-500">No buy categories available</div>
                )}
              </div>
            </div>

            {/* Rent Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rent Categories</h3>
              <div className="space-y-2">
                {categoriesLoading ? (
                  <div className="text-gray-500">Loading categories...</div>
                ) : rentCategories.length > 0 ? (
                  rentCategories.map((category: any) => (
                    <Link
                      key={category._id || category.id}
                      href={`/rent/${category.slug}`}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-500">No rent categories available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;