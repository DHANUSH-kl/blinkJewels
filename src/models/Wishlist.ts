// models/Wishlist.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  user: Types.ObjectId;
  productId: Types.ObjectId; // Keep consistent with your usage
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

// ✅ CRITICAL: Add compound index for fast lookups
WishlistSchema.index({ user: 1, productId: 1 }, { unique: true });

// ✅ Add individual indexes for common queries
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ productId: 1 });

export const Wishlist =
  mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);