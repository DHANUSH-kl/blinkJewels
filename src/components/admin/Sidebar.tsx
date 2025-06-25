"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, Boxes, Tags } from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white h-screen p-4 border-r border-yellow-400">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Blink Admin</h2>
      <ul className="space-y-4">
        <li>
          <Link
            href="/admin/dashboard"
            className={clsx("block", pathname === "/admin/dashboard" && "text-yellow-400 font-bold")}
          >
            <LayoutDashboard className="inline mr-2" /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/admin/products"
            className={clsx("block", pathname.startsWith("/admin/products") && "text-yellow-400 font-bold")}
          >
            <Boxes className="inline mr-2" /> Products
          </Link>
        </li>
        <li>
          <Link
            href="/admin/categories"
            className={clsx("block", pathname === "/admin/categories" && "text-yellow-400 font-bold")}
          >
            <Tags className="inline mr-2" /> Categories
          </Link>
        </li>
      </ul>
    </aside>
  );
};
