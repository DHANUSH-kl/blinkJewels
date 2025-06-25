"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message);
    toast.success("OTP sent! Verify your email.");
    router.push("/verify");
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-black text-white">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        {["name", "email", "password"].map((key) => (
          <input
            key={key}
            type={key === "password" ? "password" : "text"}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            className="w-full mb-4 p-3 rounded-md bg-zinc-800 text-white outline-none"
            value={(form as any)[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required
          />
        ))}
        <button className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded-md font-semibold">
          Sign Up
        </button>
      </motion.form>
    </main>
  );
}
