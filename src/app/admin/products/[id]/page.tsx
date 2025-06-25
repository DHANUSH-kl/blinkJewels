import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function ProductFormPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  // ✅ Await params before accessing its properties
  const { id } = await params;

  await connectToDatabase();
  const categoriesRaw = await Category.find().lean();
  const productRaw = id !== "new" ? await Product.findById(id).lean() : null;

  // ✅ Serialize before passing to Client Component
  const categories = JSON.parse(JSON.stringify(categoriesRaw));
  const product = productRaw ? JSON.parse(JSON.stringify(productRaw)) : null;

  return <ProductForm product={product} categories={categories} />;
}