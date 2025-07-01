import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ items: [] });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  const cartItems = await Cart.find({ user: user._id }).populate("product").lean();

  return NextResponse.json({ items: cartItems });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity = 1 } = await req.json();
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });

  const existing = await Cart.findOne({ user: user._id, product: productId });
  if (existing) {
    existing.quantity += quantity;
    await existing.save();
    return NextResponse.json({ message: "Updated quantity", item: existing });
  }

  const newItem = await Cart.create({ user: user._id, product: productId, quantity });
  return NextResponse.json({ message: "Added to cart", item: newItem });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });

  const updated = await Cart.findOneAndUpdate(
    { user: user._id, product: productId },
    { quantity },
    { new: true }
  );

  return NextResponse.json({ message: "Cart updated", item: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });

  await Cart.findOneAndDelete({ user: user._id, product: productId });
  return NextResponse.json({ message: "Item removed" });
}
