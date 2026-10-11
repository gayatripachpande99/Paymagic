import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    recordNumber: { type: Number, required: true },
    id: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, default: "UNASSIGNED" },
    assignedTo: { type: String, default: null },
    assignedToName: { type: String, default: null },
    assignedBy: { type: String, default: "PM-ADMIN-0001" },
    assignedAt: { type: String, default: null },
    recordStatus: { type: String, default: "PENDING" }
  },
  { timestamps: true }
);

export const Record = mongoose.model("Record", recordSchema);

const recordMetaSchema = new mongoose.Schema(
  {
    key: { type: String, default: "activeColumns", unique: true },
    columns: [{ type: String }]
  },
  { timestamps: true }
);

export const RecordMeta = mongoose.model("RecordMeta", recordMetaSchema);

export default Record;
