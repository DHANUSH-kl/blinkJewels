// src/lib/db/products.ts
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import mongoose from "mongoose";

interface Filters {
  type?: string;
  category?: string; // category **slug**
  minPrice?: number;
  maxPrice?: number;
}

export async function getFilteredProducts(filters: Filters) {
  await connectToDatabase();

  const query: any = {};

  if (filters.type) query.type = filters.type;

  if (filters.category) {
    const categoryDoc = await Category.findOne({ slug: filters.category });
    if (categoryDoc) {
      query.categories = categoryDoc._id;
    } else {
      // If invalid category slug, return no products
      return [];
    }
  }

  if (filters.minPrice !== undefined) {
    query.price = { ...query.price, $gte: filters.minPrice };
  }
  if (filters.maxPrice !== undefined) {
    query.price = { ...query.price, $lte: filters.maxPrice };
  }

  const products = await Product.find(query).populate("categories");
  return products;
}
