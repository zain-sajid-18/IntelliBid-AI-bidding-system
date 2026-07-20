import mongoose from "mongoose";

// connect to database (supports both local and MongoDB Atlas)
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("MongoDB connection error: ", err);
        process.exit(1);
    }
};