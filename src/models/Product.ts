// src/models/Product.ts
import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./Category"; // ✅ Ensure Category is imported for population to work

export interface IProduct extends Document {
  title: string;
  description: string;
  images: { url: string; public_id: string }[];
  price: number;
  type: "buy" | "rent";
  rentalPrice?: number;
  stock: number;
  categories: mongoose.Types.ObjectId[] | ICategory[];
  tags: string[];
  rating: number;
  reviews: any[];
  isFeatured: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ["buy", "rent"] },
    rentalPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
    tags: [{ type: String }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: [Schema.Types.Mixed], default: [] },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Export
export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
