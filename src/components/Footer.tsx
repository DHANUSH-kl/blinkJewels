import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Shield,
  Truck,
  RefreshCw,
  CreditCard,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' }
  ];

  const customerService = [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Track Order', href: '/track' }
  ];

  const policies = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Return Policy', href: '/returns' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Warranty', href: '/warranty' }
  ];

  const categories = [
    { name: 'Rings', href: '/rings' },
    { name: 'Necklaces', href: '/necklaces' },
    { name: 'Earrings', href: '/earrings' },
    { name: 'Bracelets', href: '/bracelets' },
    { name: 'Wedding Collection', href: '/wedding' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Stay Connected</h3>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Be the first to know about new collections, exclusive offers, and jewelry care tips
            </p>
            <div className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-xl bg-white border-2 border-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white shadow-lg"
                />
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-4 text-center">
                Join 10,000+ jewelry lovers • No spam • Unsubscribe anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Blink Jewels</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Crafting timeless elegance since 1985. We specialize in premium jewelry 
                that celebrates life's precious moments with unmatched quality and design.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Visit Our Showroom</p>
                  <p className="text-gray-300">123 Luxury Lane, Diamond District</p>
                  <p className="text-gray-300">Mumbai, Maharashtra 400001</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-gray-300">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Email Us</p>
                  <p className="text-gray-300">hello@blinkjewels.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Store Hours</p>
                  <p className="text-gray-300">Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p className="text-gray-300">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Quick Links */}
              <div>
                <h4 className="text-xl font-bold mb-6">Company</h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:underline"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xl font-bold mb-6">Collections</h4>
                <ul className="space-y-3">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <a 
                        href={category.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:underline"
                      >
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h4 className="text-xl font-bold mb-6">Support</h4>
                <ul className="space-y-3">
                  {customerService.map((service, index) => (
                    <li key={index}>
                      <a 
                        href={service.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:underline"
                      >
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Policies */}
              <div>
                <h4 className="text-xl font-bold mb-6">Legal</h4>
                <ul className="space-y-3">
                  {policies.map((policy, index) => (
                    <li key={index}>
                      <a 
                        href={policy.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:underline"
                      >
                        {policy.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h5 className="font-semibold">Free Shipping</h5>
                <p className="text-gray-400 text-sm">On orders above ₹2,000</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h5 className="font-semibold">Lifetime Warranty</h5>
                <p className="text-gray-400 text-sm">Certified quality guarantee</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h5 className="font-semibold">Easy Returns</h5>
                <p className="text-gray-400 text-sm">30-day return policy</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h5 className="font-semibold">Secure Payment</h5>
                <p className="text-gray-400 text-sm">Multiple payment options</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400">
                © {currentYear} Blink Jewels. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Designed with precision, crafted with love.
              </p>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 mr-2">Follow Us:</span>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">We Accept:</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-blue-600 rounded text-xs flex items-center justify-center font-bold">
                  VISA
                </div>
                <div className="w-10 h-6 bg-red-600 rounded text-xs flex items-center justify-center font-bold">
                  MC
                </div>
                <div className="w-10 h-6 bg-purple-600 rounded text-xs flex items-center justify-center font-bold">
                  UPI
                </div>
                <div className="w-10 h-6 bg-green-600 rounded text-xs flex items-center justify-center font-bold">
                  GPay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;