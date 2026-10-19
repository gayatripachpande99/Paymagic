import mongoose from "mongoose";
import { Record, RecordMeta } from "../models/Record.js";
import { uploadedRecords, recordColumns, setRecordColumns } from "../data/store.js";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://gayatri:Gaugau99@cluster0.9ktjwfq.mongodb.net/paymagic?retryWrites=true&w=majority&appName=Cluster0";
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);

    // Sync records collection with MongoDB database 'paymagic'
    try {
      const recordsCount = await Record.countDocuments();
      if (recordsCount === 0) {
        console.log("Seeding initial 200 records into MongoDB database 'paymagic'...");
        await Record.insertMany(uploadedRecords);
        await RecordMeta.findOneAndUpdate(
          { key: "activeColumns" },
          { columns: recordColumns },
          { upsert: true }
        );
        console.log("Successfully seeded records and columns into MongoDB 'paymagic'!");
      } else {
        const dbRecords = await Record.find({}).sort({ recordNumber: 1 }).lean();
        uploadedRecords.length = 0;
        uploadedRecords.push(...dbRecords);

        const meta = await RecordMeta.findOne({ key: "activeColumns" }).lean();
        if (meta && meta.columns && meta.columns.length > 0) {
          setRecordColumns(meta.columns);
        }
        console.log(`Synced ${uploadedRecords.length} records and ${recordColumns.length} dynamic columns from MongoDB 'paymagic'.`);
      }
    } catch (syncErr) {
      console.warn("MongoDB records sync warning:", syncErr.message);
    }

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't crash server if network is temporarily unreachable; continue with graceful fallback
    return null;
  }
};

export default connectDB;
