import mongoose from "mongoose";

const connectDB = async () => {
   // console.log(process.env.MONGO_URI)
    try {
       mongoose.connection.on('connected', () => console.log('Database Connected'));
       await mongoose.connect(process.env.MONGO_URI, {
        //  useNewUrlParser: true,
        //  useUnifiedTopology: true,
       }) 
    } catch (error) {
       console.log(`Problem at server side, ${error.message}`)
       process.exit(1)
    }
}

export default connectDB;