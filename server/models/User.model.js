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
    
}, {timestamps: true})

const userModel = mongoose.models.user || mongoose.model("user", userSchema)
export default userModel;