// ✅ lib/actions/wishlist.ts
"use server";

import { connectToDatabase } from "../mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Wishlist } from "@/models/Wishlist";

export async function toggleWishlist(productId: string) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Not authenticated");

  const userId = session.user.email;

  const existing = await Wishlist.findOne({ userId, productId });

  if (existing) {
    await Wishlist.deleteOne({ _id: existing._id });
    return { status: "removed" };
  } else {
    await Wishlist.create({ userId, productId });
    return { status: "added" };
  }
}

export async function isInWishlist(productId: string) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;

  const userId = session.user.email;

  const existing = await Wishlist.findOne({ userId, productId });
  return !!existing;
}
