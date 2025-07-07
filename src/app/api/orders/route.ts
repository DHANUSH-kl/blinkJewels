// src/app/api/orders/route.ts

import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { address, paymentMethod } = await req.json();
    if (!address || !paymentMethod) {
      return NextResponse.json({ error: "Address and payment method required" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cartItems = await Cart.find({ user: user._id }).populate("product").lean();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const items = cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      startDate: item.startDate,
      endDate: item.endDate,
    }));

    const totalAmount = cartItems.reduce((sum, item) => {
      const price =
        item.product.type === "rent"
          ? item.product.rentalPrice
          : item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const order = new Order({
      userEmail: session.user.email,
      items,
      totalAmount,
      address,
      paymentMethod,
      status: "pending",
    });

    await order.save();
    await Cart.deleteMany({ user: user._id });

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({ userEmail: session.user.email })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("❌ Order fetch error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
