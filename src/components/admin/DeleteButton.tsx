"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 bg-red-600 rounded text-white hover:bg-red-700 transition"
    >
      <Trash2 />
    </button>
  );
}
