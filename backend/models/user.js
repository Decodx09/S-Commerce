import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    Admin: { type: Boolean, default: false, required: false },
    post : [{type: mongoose.Schema.Types.ObjectId , ref : 'post'}],
    bio: { type: String, required: false },
    cart: {type: Number , required: false},
    items : [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    checkout : {type: Number, required : false},
});

// userSchema.virtual('id').get(function () {
//     return this._id.toHexString();
// });

// userSchema.set('toJSON', {
//     virtuals: true,
// });

export const User = mongoose.model("User" , userSchema);