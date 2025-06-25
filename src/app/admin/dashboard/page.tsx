// src/app/(admin)/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // ✅ Debugging: log full session
  console.log("FULL SESSION:", session);
  console.log("SESSION ROLE:", session?.user?.role);

  if (!session || session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-4">Admin Dashboard</h1>
        <p className="text-gray-300">Welcome, admin. Manage products and categories.</p>
      </div>
    </main>
  );
}
