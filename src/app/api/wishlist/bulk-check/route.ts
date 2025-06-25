import { Wishlist } from "@/models/Wishlist";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ wishlistStatus: {} });
    }

    await connectToDatabase();

    const { productIds } = await req.json();
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ wishlistStatus: {} });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ wishlistStatus: {} });

    const validIds = productIds.filter(id =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const wishlistItems = await Wishlist.find({
      user: user._id,
      productId: { $in: validIds },
    }).select("productId").lean();

    const wishlistStatus = productIds.reduce((acc, productId) => {
      acc[productId] = wishlistItems.some(
        item => item.productId.toString() === productId
      );
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({ wishlistStatus });
  } catch (error) {
    console.error("❌ Bulk wishlist check error:", error);
    return NextResponse.json({ wishlistStatus: {} });
  }
}
