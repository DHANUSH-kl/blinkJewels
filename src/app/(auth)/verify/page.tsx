"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleVerify = async () => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message);
    toast.success("Account verified! You can login now.");
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Verify OTP</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 bg-zinc-800 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="6-digit OTP"
          className="w-full mb-4 p-3 bg-zinc-800 rounded-md"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={handleVerify}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-md font-semibold"
        >
          Verify
        </button>
      </div>
    </main>
  );
}
