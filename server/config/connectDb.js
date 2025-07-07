import mongoose from "mongoose";

const connectDB = async () => {
   // console.log(process.env.MONGO_URI)
    try {
       await mongoose.connect(process.env.MONGO_URI);
       console.log("Server Connected")
    } catch (error) {
       console.log(`Problem at server side, ${error.message}`)
       process.exit(1)
    }
}

export default connectDB;