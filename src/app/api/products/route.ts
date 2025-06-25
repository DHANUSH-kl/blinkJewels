// src/app/api/products/route.ts (FIXED VERSION)
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categorySlug = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    console.log("API Query params:", { type, categorySlug, minPrice, maxPrice, search, sort }); // Debug log

    // Build query object
    const query: any = {};

    // Filter by type (only if valid)
    if (type && (type === "buy" || type === "rent")) {
      query.type = type;
    }

    // Filter by category
    if (categorySlug) {
      try {
        const category = await Category.findOne({ slug: categorySlug });
        if (category) {
          query.categories = category._id;
        } else {
          console.log("Category not found:", categorySlug);
          // Return empty results for invalid category
          return NextResponse.json({
            products: [],
            totalProducts: 0,
            totalPages: 0,
            currentPage: page
          });
        }
      } catch (error) {
        console.error("Error finding category:", error);
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(parseInt(minPrice))) {
        query.price.$gte = parseInt(minPrice);
      }
      if (maxPrice && !isNaN(parseInt(maxPrice))) {
        query.price.$lte = parseInt(maxPrice);
      }
    }

    // Filter by search term
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: new RegExp(search.trim(), "i") } },
        { description: { $regex: new RegExp(search.trim(), "i") } }
      ];
    }

    console.log("MongoDB query:", JSON.stringify(query, null, 2)); // Debug log

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    console.log("Total products found:", totalProducts); // Debug log

    // Build sort object
    let sortObject: any = { createdAt: -1 }; // Default sort
    
    switch (sort) {
      case 'price-low':
        sortObject = { price: 1 };
        break;
      case 'price-high':
        sortObject = { price: -1 };
        break;
      case 'rating':
        sortObject = { rating: -1 };
        break;
      case 'name':
        sortObject = { title: 1 };
        break;
      case 'newest':
      default:
        sortObject = { createdAt: -1 };
        break;
    }

    // Fetch products with pagination
    const products = await Product.find(query)
      .populate("categories", "name slug type")
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Products fetched:", products.length); // Debug log

    // Transform products for frontend
    const transformedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      categories: Array.isArray(product.categories) 
        ? product.categories.map((cat: any) => ({
            ...cat,
            _id: cat._id.toString()
          }))
        : []
    }));

    return NextResponse.json({
      products: transformedProducts,
      totalProducts,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}