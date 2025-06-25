"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error && error !== "undefined") {
      toast.error(
        error === "OAuthAccountNotLinked"
          ? "That email is already registered with password. Use email & password to login."
          : error
      );
    }
  }, [error]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });

    if (res?.ok) {
      toast.success("Logged in successfully!");
      router.push("/home");
    } else {
      toast.error(res?.error || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/home" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-zinc-900 p-8 rounded-xl w-full max-w-md shadow-lg text-white"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center">
          Login to <span className="text-yellow-400">Blink Jewels</span>
        </h1>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="peer w-full px-3 py-3 bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder=" "
            />
            <label className="absolute left-3 top-3 text-gray-400 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-yellow-400 transition-all">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="peer w-full px-3 py-3 bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder=" "
            />
            <label className="absolute left-3 top-3 text-gray-400 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-yellow-400 transition-all">
              Password
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 p-3 rounded-md font-semibold transition"
        >
          Login
        </button>

        <div className="mt-6 flex items-center gap-2">
          <div className="flex-grow h-px bg-gray-600" />
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-600" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 text-black bg-white py-3 rounded-md hover:bg-gray-100 transition"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>
      </motion.form>
    </main>
  );
}
