import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  otp: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    otp: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model<IUser>("User", UserSchema);
