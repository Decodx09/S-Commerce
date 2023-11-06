import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const postSchema = new mongoose.Schema({
    caption : {type : String , required : false},
    likes : {type : [Number] , required : false},
    comments : {type : [String] , required : false},
    images : {type : [String] , required : false},
    post : {type : String , required : false},
    createdAt : {type : Date , default : Date.now},
    updatedAt : {type : Date , default : Date.now},
    userId : {type : ObjectId , ref : "User" , required : true}
})

export const Post = mongoose.model("Post" , postSchema);