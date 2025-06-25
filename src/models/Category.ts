// src/models/Category.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: "buy" | "rent";
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  type: { type: String, required: true, enum: ["buy", "rent"] },
});

// Compound index to allow same slug per type
CategorySchema.index({ slug: 1, type: 1 }, { unique: true });

export const Category =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
