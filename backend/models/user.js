import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    Admin: { type: Boolean, default: false, required: false },
    bio: { type: String, required: true },
    cart: {type: Number , required: false},
    items : [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export const User = mongoose.model("User" , userSchema);