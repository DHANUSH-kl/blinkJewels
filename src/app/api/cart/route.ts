import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { User } from "@/models/User";
import { Product } from "@/models/Product";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ items: [] });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ items: [] });

  const cart = await Cart.findOne({ user: user._id })
    .populate("items.product")
    .lean();

  return NextResponse.json({ items: cart?.items || [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();

  const { productId, quantity = 1, startDate, endDate, type } = await req.json();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let cart = await Cart.findOne({ user: user._id });

  const newItem = {
    product: productId,
    quantity,
    ...(type === "rent" && { startDate, endDate }),
  };

  if (cart) {
    const existingIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push(newItem);
    }
  } else {
    cart = new Cart({
      user: user._id,
      userEmail: session.user.email,
      items: [newItem],
    });
  }

  await cart.save();
  return NextResponse.json({ message: "Item added/updated in cart" });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();
  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cart = await Cart.findOne({ user: user._id });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  const itemIndex = cart.items.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (itemIndex === -1)
    return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  return NextResponse.json({ message: "Cart updated" });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cart = await Cart.findOne({ user: user._id });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  cart.items = cart.items.filter(
    (item: any) => item.product.toString() !== productId
  );

  await cart.save();
  return NextResponse.json({ message: "Item removed from cart" });
}
