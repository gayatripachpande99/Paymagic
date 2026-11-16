import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initializeDatabase } from "./config/db.js";
import db from "./config/db.js";

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
import allocationRoutes from "./routes/allocationRoutes.js";
import recoveryRoutes from "./routes/recoveryRoutes.js";
import paymentGatewayRoutes from "./routes/paymentGatewayRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";
import { logger } from "./utils/logger.js";
import { schedulerService } from "./services/schedulerService.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Allowed origins for CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000"
    ].filter(Boolean);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowed list
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to allow dev requests smoothly
    },
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

// Express JSON Body Parser (Strict 2MB limit with rawBody capture for cryptographic webhook signatures)
app.use(
  express.json({
    limit: "2mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// Request logging middleware with correlation IDs and PII sanitization
app.use(logger.requestMiddleware());

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
app.use("/api/allocation", allocationRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/payment-gateway", paymentGatewayRoutes);
app.use("/api/monitoring", monitoringRoutes);

// ── Health, Liveness, and Readiness Endpoints ──

// Liveness Probe: Confirms the application process is running (does not query database)
app.get("/api/health/live", (req, res) => {
  res.status(200).json({
    status: "ALIVE",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Readiness Probe: Confirms PostgreSQL is reachable and ready to serve traffic
app.get("/api/health/ready", async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isPg = db.isPgActive();

  if (isPg) {
    try {
      await db.query("SELECT 1");
      return res.status(200).json({
        status: "READY",
        database: "POSTGRESQL_CONNECTED",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return res.status(503).json({
        status: "NOT_READY",
        database: "POSTGRESQL_DISCONNECTED",
        error: "PostgreSQL database connectivity check failed.",
        timestamp: new Date().toISOString()
      });
    }
  }

  // Non-production (dev/test) environments may operate ready in-memory
  if (!isProduction) {
    return res.status(200).json({
      status: "READY",
      database: "IN_MEMORY_ISOLATED",
      mode: "development",
      timestamp: new Date().toISOString()
    });
  }

  // In production, database is required for readiness
  return res.status(503).json({
    status: "NOT_READY",
    database: "POSTGRESQL_NOT_ACTIVE",
    error: "PostgreSQL database is required in production.",
    timestamp: new Date().toISOString()
  });
});

// General Health Check (Backward Compatible)
app.get("/api/health", async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isPg = db.isPgActive();
  let dbStatus = isPg ? "POSTGRESQL_CONNECTED" : (isProduction ? "POSTGRESQL_DISCONNECTED" : "IN_MEMORY_ISOLATED");
  let isHealthy = true;

  if (isPg) {
    try {
      await db.query("SELECT 1");
    } catch (e) {
      dbStatus = "POSTGRESQL_ERROR";
      isHealthy = false;
    }
  } else if (isProduction) {
    isHealthy = false;
  }

  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json({
    status: isHealthy ? "HEALTHY" : "DEGRADED",
    service: "PayMagic Loan Recovery Operations API",
    version: "2.0.0",
    database: dbStatus,
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
export const startServer = async () => {
  await initializeDatabase();
  // Start Spring Scheduler Engine for background reminder tasks
  schedulerService.start();

  return app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ PayMagic Platform Server listening on port ${PORT}`);
    console.log(`🌐 Base API: http://localhost:${PORT}/api`);
    console.log(`🔒 Fair Practice Calling Hours: 08:00 to 19:00 IST`);
    console.log(`=======================================================`);
  });
};

const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith("server.js") ||
  process.argv[1].endsWith("server")
);

if (isDirectRun) {
  startServer();
}

export { app };
export default app;
