import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import telephonyRoutes from "./routes/telephonyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cacheRoutes from "./routes/cacheRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import fieldRecoveryRoutes from "./routes/fieldRecoveryRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { schedulerService } from "./services/schedulerService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Global Rate Limiter: 300 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again in 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api", globalLimiter);

// Specific Auth Rate Limiter: 20 login attempts per 15 mins
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  }
});
app.use("/api/auth/login", authLimiter);

// Express JSON Body Parser (large payloads for bulk imports)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/telephony", telephonyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cache", cacheRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/field", fieldRecoveryRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);

// System Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "HEALTHY",
    service: "PayMagic Loan Recovery Operations API",
    version: "2.0.0",
    compliance: {
      callingHoursIST: "08:00 - 19:00",
      recordingRetention: "365 days / private encrypted S3",
      rbiFairPracticesCode: "ENFORCED"
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.send("🚀 PayMagic Enterprise Loan Recovery API Platform Active.");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected server error occurred."
  });
});

// Initialize database and start server
initializeDatabase().then(() => {
  // Start Spring Scheduler Engine for background reminder tasks
  schedulerService.start();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ PayMagic Platform Server listening on port ${PORT}`);
    console.log(`🌐 Base API: http://localhost:${PORT}/api`);
    console.log(`🔒 Fair Practice Calling Hours: 08:00 to 19:00 IST`);
    console.log(`=======================================================`);
  });
});
