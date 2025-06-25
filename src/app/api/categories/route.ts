// src/app/api/categories/route.ts
import { connectToDatabase } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ name: 1 }).lean();
    
    // Transform categories for frontend
    const transformedCategories = categories.map(category => ({
      ...category,
      _id: category._id.toString()
    }));
    
    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const { name, type } = await req.json();
    
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    await connectToDatabase();
    
    // Check if category already exists
    const existing = await Category.findOne({ slug, type });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({ name, slug, type });
    
    return NextResponse.json({
      ...category.toObject(),
      _id: category._id.toString()
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, name, type } = await req.json();
    
    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    await connectToDatabase();
    
    const updated = await Category.findByIdAndUpdate(
      id,
      { name, slug, ...(type && { type }) },
      { new: true }
    );
    
    if (!updated) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...updated.toObject(),
      _id: updated._id.toString()
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const deleted = await Category.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
};