import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/devconnect";
    if (!process.env.MONGO_URI) {
       console.warn("MONGO_URI not set — using fallback local MongoDB URI.");
    }
    try {
       await mongoose.connect(uri);
       console.log("Database connected")
    } catch (error) {
       console.log(`Problem at server side, ${error.message}`)
       process.exit(1)
    }
}

export default connectDB;