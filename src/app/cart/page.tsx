// src/app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    images: { url: string }[];
    type: string;
  };
  quantity: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items);
    setLoading(false);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    await fetch("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    });
    fetchCart();
  };

  const removeItem = async (productId: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    });
    toast.success("Removed from cart");
    fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  if (loading) return <div className="p-8 text-white">Loading cart...</div>;

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center text-gray-400">
          <p>Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block px-6 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 items-center bg-zinc-900 p-4 rounded shadow"
              >
                <Image
                  src={item.product.images[0]?.url || "/placeholder.png"}
                  alt={item.product.title}
                  width={100}
                  height={100}
                  className="rounded object-cover w-24 h-24"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {item.product.title}
                  </h2>
                  <p className="text-sm text-gray-400 capitalize">
                    {item.product.type}
                  </p>
                  <p className="mt-1 text-yellow-400">₹{item.product.price}</p>

                  <div className="mt-2 flex gap-2 items-center">
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      className="px-2 py-1 bg-zinc-700 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-zinc-700 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="ml-4 text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 p-6 rounded shadow h-fit">
            <h3 className="text-xl font-bold mb-4">Summary</h3>
            <div className="flex justify-between mb-2 text-gray-300">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-300">
              <span>Total</span>
              <span className="text-yellow-400 font-semibold">₹{total}</span>
            </div>
            <button
              disabled
              className="mt-6 w-full bg-gray-700 text-white font-semibold px-4 py-2 rounded cursor-not-allowed"
              title="Coming Soon"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
