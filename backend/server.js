import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initializeDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import { logger } from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Compliance Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173", "http://localhost:3000", "https://paymagic.in", "https://www.paymagic.in"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key", "X-Request-ID"]
  })
);

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests. Please slow down." }
});

app.use("/api/auth/login", authLimiter);
app.use("/api/", apiLimiter);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);

// Health & Readiness Probes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "HEALTHY",
    platform: "PayMagic Enterprise v2",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health/live", (req, res) => {
  res.status(200).json({ status: "ALIVE" });
});

// Root fallback
app.get("/", (req, res) => {
  res.status(200).json({
    platform: "PayMagic Enterprise Recovery API v2",
    status: "ACTIVE",
    version: "2.0.0"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Initialize Database & Start Server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      logger.info(`🚀 PayMagic v2 API Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

export default app;
