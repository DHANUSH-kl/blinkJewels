import { Product } from "@/models/Product";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Edit } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return <p>Unauthorized</p>;
  }

  await connectToDatabase();
  const products = await Product.find().lean();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 border border-yellow-400 text-yellow-400 rounded"
        >
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p._id} className="bg-zinc-900 p-4 rounded relative group">
            <img
              src={p.images[0]?.url}
              alt={p.title}
              className="h-40 w-full object-cover rounded mb-2"
            />
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mt-2">₹{p.price}</p>
            <div className="opacity-0 group-hover:opacity-100 transition absolute inset-0 backdrop-blur-sm bg-white/10 border border-white/10 flex justify-center items-center gap-4 rounded">
              <Link
                href={`/admin/products/${p._id}`}
                className="p-2 bg-yellow-400 text-black rounded"
              >
                <Edit />
              </Link>
              <DeleteButton id={p._id.toString()} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
