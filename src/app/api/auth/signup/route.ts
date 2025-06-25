import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { sendVerificationEmail } from "@/lib/verifyEmail";

export async function POST(req: Request) {
  await connectToDatabase();
  const { name, email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ message: "User exists" }, { status: 400 });

  const hashed = await hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await User.create({ name, email, password: hashed, otp });

  await sendVerificationEmail(email, otp);

  return NextResponse.json({ message: "OTP sent" });
}
