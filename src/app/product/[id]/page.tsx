// src/app/product/[id]/page.tsx

import { connectToDatabase } from "@/lib/mongoose";
import "@/models/Category";
import { Product } from "@/models/Product";
import { Wishlist } from "@/models/Wishlist";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
  await connectToDatabase();

  // Get session
  const session = await getServerSession(authOptions);

  // Fetch product
  const product = await Product.findById(params.id).populate("categories").lean();
  if (!product) return notFound();

  // Check if in wishlist (if logged in)
  let initialWishlist = false;
  if (session?.user?._id) {
    const wishlistItem = await Wishlist.findOne({
      user: session.user._id,
      productId: product._id,
    }).lean();
    initialWishlist = !!wishlistItem;
  }

  // Calculate discount display info
  const originalPrice = Math.floor(product.price * 1.2);
  const discountPercentage = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );

  // Serialize product for client
  const serializedProduct = {
    ...product,
    _id: product._id.toString(),
    categories: product.categories?.map((cat: any) => ({
      ...cat,
      _id: cat._id.toString(),
    })) || [],
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  };

  return (
    <ProductDetailClient
      product={serializedProduct}
      initialWishlist={initialWishlist}
      originalPrice={originalPrice}
      discountPercentage={discountPercentage}
    />
  );
}
