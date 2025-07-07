// src/app/checkout/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status]);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        setCartItems(data.items || []);
        const total = data.items?.reduce((acc: number, item: any) => {
          const price = item.product.type === 'rent' ? item.product.rentalPrice : item.product.price;
          return acc + price * item.quantity;
        }, 0) || 0;
        setTotalAmount(total);
      } catch (err) {
        toast.error('Failed to load cart.');
      }
    };

    fetchCart();
  }, []);

  const handleOrder = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          paymentMethod: 'COD',
        }),
      });

      if (!res.ok) throw new Error('Order failed');

      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="space-y-6">
        {/* Cart Items Summary */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item: any) => (
                <li key={item._id} className="flex justify-between text-sm text-gray-700">
                  <span>{item.product.title} × {item.quantity}</span>
                  <span>₹{(item.product.type === 'rent' ? item.product.rentalPrice : item.product.price) * item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Address Input */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3"
            rows={4}
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 bg-white space-y-4">
          <div className="flex justify-between font-semibold text-gray-800">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Payment Method:</span>
            <span>Cash on Delivery</span>
          </div>
          <button
            onClick={handleOrder}
            disabled={loading || cartItems.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
