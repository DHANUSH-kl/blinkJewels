import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  userEmail: { type: String, required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      startDate: String,
      endDate: String,
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
  address: { type: String, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
