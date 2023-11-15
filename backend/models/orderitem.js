import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // Add any other fields relevant to an order item
});

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
