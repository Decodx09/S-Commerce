import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const postSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId , ref : "User" , required : true},
    caption : {type : String , required : false},
    likes : {type : [String] , required : false},
    comments : {type : [String] , required : false},
    images : {type : [String] , required : false},
    post : {type : String , required : false},
    createdAt : {type : Date , default : Date.now},
    updatedAt : {type : Date , default : Date.now},
})

// postSchema.virtual('id').get(function () {
//     return this._id.toHexString();
// });

// postSchema.set('toJSON', {
//     virtuals: true,
// });


export const Post = mongoose.model("Post" , postSchema);