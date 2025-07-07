// src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel order');

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      toast.success('Order cancelled');
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling order');
    }
  };

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    order.status === 'cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Placed on {format(new Date(order.createdAt), 'dd/MM/yyyy')}
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                {order.items.map((item: any) => (
                  <li key={item._id}>
                    {item.product?.title || 'Unknown'} × {item.quantity} ₹
                    {(item.product?.type === 'rent'
                      ? item.product?.rentalPrice
                      : item.product?.price) * item.quantity || 0}
                  </li>
                ))}
              </ul>
              <p className="text-right font-semibold mb-1">
                Total: ₹{order.totalAmount?.toLocaleString()}
              </p>
              <p className="text-right text-sm text-gray-500 mb-4">
                {order.paymentMethod}
              </p>
              {order.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancel(order._id)}
                  className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}