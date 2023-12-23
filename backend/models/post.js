import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: [String], required: false },
    comments: { type: [String], required: false },
    images: { type: [String], required: false },
    post: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Virtual property for 'id'
postSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Virtual property for 'liveTime'
postSchema.virtual('liveTime').get(function () {
    const currentTime = new Date();
    const elapsedTime = currentTime - this.createdAt;
    return elapsedTime;
});

// Enable virtuals to include when converting to JSON or Object
postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

export const Post = mongoose.model("Post", postSchema);
