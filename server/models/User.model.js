import mongoose from "mongoose";


// User model schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
    lastSeen: {
        type: Date,
        default: null,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]
    
}, {timestamps: true})

userSchema.index({ name: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User;