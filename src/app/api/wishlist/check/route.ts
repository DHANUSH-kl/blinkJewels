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
      return NextResponse.json({ exists: false });
    }

    await connectToDatabase();

    const { productId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ exists: false });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ exists: false });

    const exists = await Wishlist.exists({
      user: user._id,
      productId: productId,
    });

    return NextResponse.json({ exists: !!exists });
  } catch (error) {
    console.error("❌ Wishlist check error:", error);
    return NextResponse.json({ exists: false });
  }
}
