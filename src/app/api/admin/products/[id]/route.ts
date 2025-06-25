// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/Product";

// ✅ GET one product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const prod = await Product.findById(params.id);
    if (!prod) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(prod);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ✅ UPDATE product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const prod = await Product.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(prod);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// ✅ DELETE product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const prod = await Product.findByIdAndDelete(params.id);
    if (!prod) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
