import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function POST(req: Request) {
  await connectToDatabase();
  const { email, otp } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  if (user.otp !== otp) return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });

  user.verified = true;
  user.otp = "";
  await user.save();

  return NextResponse.json({ message: "Verified" });
}
