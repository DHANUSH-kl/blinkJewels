import { connectToDatabase } from "@/lib/mongoose";
import { Wishlist } from "@/models/Wishlist";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await Wishlist.findOneAndDelete({
      user: user._id,
      productId: productId,
    });

    if (existing) {
      return NextResponse.json({
        inWishlist: false,
        message: "Removed from wishlist",
      });
    } else {
      await Wishlist.findOneAndUpdate(
        { user: user._id, productId },
        { user: user._id, productId },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        inWishlist: true,
        message: "Added to wishlist",
      });
    }
  } catch (error: any) {
    console.error("❌ Wishlist toggle error:", error);

    if (error.code === 11000) {
      return NextResponse.json({
        inWishlist: true,
        message: "Already in wishlist",
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
