import { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
