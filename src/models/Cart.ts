// src/models/Cart.ts
import mongoose, { Schema, model, models, Types } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const Cart = models.Cart || model("Cart", CartSchema);
