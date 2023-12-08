import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const rentalSchema = new mongoose.Schema({
    title: {type: String , required : true},
    description: {type: String , required : true},
    location: {type: String , required : true},
    price: {type: String , required : true},
    bedrooms: {type: String , required : true},
    available: {type: Boolean , default : true},
    availableFrom: {type: Date , required : true},
    landlord: {type: mongoose.Schema.Types.ObjectId , ref: "User" , required : true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
},
{timestamps: true});

// rentalSchema.virtual('id').get(function () {
//     return this._id.toHexString();
//   });
  
//   rentalSchema.set('toJSON', {
//     virtuals: true,
//   });

export const Rental = mongoose.model("Rental" , rentalSchema);