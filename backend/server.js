import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

// Express JSON Body Parser
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

// Health Check Endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "PayMagic Backend API", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send("🚀 PayMagic Backend API Server Running");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`⚡ PayMagic Backend Server running on port ${PORT}`);
  console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
  console.log(`===========================================`);
});
