import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://pratapsanap14_db_user:LhC3w9szFgInoey9@cluster0.j80kogo.mongodb.net/finalproject?retryWrites=true&w=majority";
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't crash server if network is temporarily unreachable; continue with graceful fallback
    return null;
  }
};

export default connectDB;
