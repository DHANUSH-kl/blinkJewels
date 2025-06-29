// src/lib/actions/wishlist.ts
"use server";

import { connectToDatabase } from "../mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Wishlist } from "@/models/Wishlist";
import { User } from "@/models/User";

export async function toggleWishlist(productId: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if product is already in wishlist
    const existing = await Wishlist.findOne({ 
      user: user._id, 
      productId: productId 
    });

    if (existing) {
      // Remove from wishlist
      await Wishlist.deleteOne({ _id: existing._id });
      return { status: "removed", inWishlist: false };
    } else {
      // Add to wishlist
      await Wishlist.create({ 
        user: user._id, 
        productId: productId 
      });
      return { status: "added", inWishlist: true };
    }
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    throw error;
  }
}

export async function isInWishlist(productId: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return false;
    }

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return false;
    }

    const existing = await Wishlist.findOne({ 
      user: user._id, 
      productId: productId 
    });
    
    return !!existing;
  } catch (error) {
    console.error("Check wishlist error:", error);
    return false;
  }
}