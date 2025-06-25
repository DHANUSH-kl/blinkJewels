import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectToDatabase();
  const body = await req.json();
  const product = await Product.create(body);
  return NextResponse.json(product);
}
