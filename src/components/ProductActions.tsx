'use client';

import { useState } from 'react';
import { ShoppingBag, Clock, Heart, Plus, Minus, Calendar, Calculator } from 'lucide-react';

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

  // Calculate rental total
  const rentalTotal = (product.rentalPrice || product.price) * rentalDuration;
  const securityDeposit = Math.round(rentalTotal * 0.3); // 30% security deposit

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle date change and auto-calculate duration
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      if (endDate) {
        const start = new Date(value);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setRentalDuration(diffDays || 1);
      }
    } else {
      setEndDate(value);
      if (startDate) {
        const start = new Date(startDate);
        const end = new Date(value);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setRentalDuration(diffDays || 1);
      }
    }
  };

  const handleAction = async (actionType: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Action:', actionType, {
      productId: product._id,
      quantity,
      rentalDuration,
      startDate,
      endDate,
      total: product.type === 'buy' ? product.price * quantity : rentalTotal
    });

    setIsLoading(false);

    // Here you would typically make an API call to handle the action
    alert(`${actionType} action completed!`);
  };

  if (product.type === 'buy') {
    return (
      <div className="space-y-6">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            ({product.stock} available)
          </span>
        </div>

        {/* Total Price */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-blue-700">
              ₹{(product.price * quantity).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buy Actions */}
        <div className="space-y-3">
          <button
            onClick={() => handleAction('Buy Now')}
            disabled={isLoading || product.stock === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ShoppingBag className="w-5 h-5" />
            {isLoading ? 'Processing...' : 'Buy Now'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('Add to Cart')}
              disabled={isLoading || product.stock === 0}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>

            <button
              onClick={() => handleAction('Add to Wishlist')}
              disabled={isLoading}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rental Product UI
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Duration Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or select duration
          </label>
          <select
            value={rentalDuration}
            onChange={(e) => setRentalDuration(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

      {/* Rental Cost Breakdown */}
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

      {/* Rental Actions */}
      <div className="space-y-3">
        <button
          onClick={() => handleAction('Rent Now')}
          disabled={isLoading || product.stock === 0 || rentalDuration < 1}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Clock className="w-5 h-5" />
          {isLoading ? 'Processing...' : 'Rent Now'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('Add to Cart')}
            disabled={isLoading || product.stock === 0}
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>

          <button
            onClick={() => handleAction('Add to Wishlist')}
            disabled={isLoading}
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-4 h-4" />
            Wishlist
          </button>
        </div>
      </div>

      {/* Rental Terms */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h4 className="font-semibold text-gray-900 mb-2">Rental Terms:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Minimum rental period: 3 days</li>
          <li>Security deposit is fully refundable upon return</li>
          <li>Late return charges: ₹100/day</li>
          <li>Damage charges will be deducted from security deposit</li>
        </ul>
      </div>
    </div>
  );
}
