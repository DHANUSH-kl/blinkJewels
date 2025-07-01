'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Heart,
  Plus,
  Minus,
  Calendar,
  Calculator,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductActionsProps {
  product: {
    _id: string;
    title: string;
    price: number;
    rentalPrice?: number;
    type: 'buy' | 'rent';
    stock: number;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [rentalDuration, setRentalDuration] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const checkCart = async () => {
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        const found = data.items?.some((item: any) => item.product._id === product._id);
        setIsInCart(found);
      } catch (err) {
        console.error(err);
      }
    };

    const checkWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist');
        const data = await res.json();
        const found = data.items?.some((item: any) => item.product._id === product._id);
        setIsInWishlist(found);
      } catch (err) {
        console.error(err);
      }
    };

    checkCart();
    checkWishlist();
  }, [product._id]);

  const rentalTotal = (product.rentalPrice || product.price) * rentalDuration;
  const securityDeposit = Math.round(rentalTotal * 0.3);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      if (endDate) {
        const diff = new Date(endDate).getTime() - new Date(value).getTime();
        setRentalDuration(Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1);
      }
    } else {
      setEndDate(value);
      if (startDate) {
        const diff = new Date(value).getTime() - new Date(startDate).getTime();
        setRentalDuration(Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1);
      }
    }
  };

  const handleAction = async (actionType: string) => {
    setIsLoading(true);
    try {
      if (actionType === 'Add to Cart') {
        const method = isInCart ? 'DELETE' : 'POST';
        const res = await fetch('/api/cart', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product._id,
            quantity,
            type: product.type,
            ...(product.type === 'rent' && { startDate, endDate }),
          }),
        });
        if (!res.ok) throw new Error('Cart operation failed');
        toast.success(isInCart ? 'Removed from cart' : 'Added to cart');
        setIsInCart(!isInCart);
      }

      if (actionType === 'Add to Wishlist') {
        const method = isInWishlist ? 'DELETE' : 'POST';
        const res = await fetch('/api/wishlist', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id }),
        });
        if (!res.ok) throw new Error('Wishlist operation failed');
        toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
        setIsInWishlist(!isInWishlist);
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
    setIsLoading(false);
  };

  const cartButtonText = isInCart ? 'Remove from Cart' : 'Add to Cart';
  const wishlistButtonText = isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';

  const WishlistButton = (
    <button
      onClick={() => handleAction('Add to Wishlist')}
      disabled={isLoading}
      className={`border-2 ${
        isInWishlist
          ? 'border-red-600 text-red-600 hover:bg-red-50'
          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
      } px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2`}
    >
      <Heart className="w-4 h-4" />
      {wishlistButtonText}
    </button>
  );

  if (product.type === 'buy') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">({product.stock} available)</span>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-blue-700">
              ₹{(product.price * quantity).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleAction('Buy Now')}
            disabled={isLoading || product.stock === 0}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <ShoppingBag className="w-5 h-5" />
            {isLoading ? 'Processing...' : 'Buy Now'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('Add to Cart')}
              disabled={isLoading || product.stock === 0}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold"
            >
              {cartButtonText}
            </button>
            {WishlistButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className="bg-purple-50 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Select Rental Period
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or select duration
          </label>
          <select
            value={rentalDuration}
            onChange={(e) => setRentalDuration(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value={3}>3 days</option>
            <option value={5}>5 days</option>
            <option value={7}>1 week</option>
            <option value={14}>2 weeks</option>
            <option value={30}>1 month</option>
            <option value={90}>3 months</option>
          </select>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white border border-purple-200 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          Cost Breakdown
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              Rental ({rentalDuration} days @ ₹{(product.rentalPrice || product.price).toLocaleString()}/day)
            </span>
            <span className="font-semibold">₹{rentalTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Security Deposit (refundable)</span>
            <span className="font-semibold">₹{securityDeposit.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-purple-700">
              ₹{(rentalTotal + securityDeposit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleAction('Rent Now')}
          disabled={isLoading || product.stock === 0 || rentalDuration < 1}
          className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-700"
        >
          <Clock className="w-5 h-5" />
          {isLoading ? 'Processing...' : 'Rent Now'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('Add to Cart')}
            disabled={isLoading || product.stock === 0}
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-xl font-semibold"
          >
            {cartButtonText}
          </button>

          <button
            onClick={() => handleAction('Add to Wishlist')}
            disabled={isLoading}
            className={`border-2 ${isInWishlist ? 'border-red-600 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2`}
          >
            <Heart className="w-4 h-4" />
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

        </div>
      </div>
    </div>
  );
}
