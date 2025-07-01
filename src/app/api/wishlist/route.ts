import { connectToDatabase } from "@/lib/mongoose";
import { Wishlist } from "@/models/Wishlist";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const items = await Wishlist.find({ user: user._id }).populate("productId");
    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    console.error("❌ GET wishlist error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id;

    // Check if already in wishlist
    const existing = await Wishlist.findOneAndDelete({
      user: userId,
      productId,
    });

    if (existing) {
      return NextResponse.json({
        inWishlist: false,
        message: "Removed from wishlist",
      });
    } else {
      await Wishlist.findOneAndUpdate(
        { user: userId, productId },
        { user: userId, productId },
        { upsert: true, new: true, runValidators: true }
      );

      return NextResponse.json({
        inWishlist: true,
        message: "Added to wishlist",
      });
    }
  } catch (error: any) {
    console.error("❌ Wishlist toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Wishlist.findOneAndDelete({ user: user._id, productId });
    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("❌ DELETE wishlist error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}