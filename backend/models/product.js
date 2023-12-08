import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  tags: { type: [String] },
  images: { type: [String] },
  quantity: { type: Number, required: true },
  pieces : {type : Number , required : true},
  userId: { type: ObjectId, ref: "User" , required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// productSchema.virtual('id').get(function () {
//   return this._id.toHexString();
// });

// productSchema.set('toJSON', {
//   virtuals: true,
// });

export const Product = mongoose.model("Product" , productSchema);