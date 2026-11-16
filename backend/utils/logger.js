import { v4 as uuidv4 } from "uuid";

/**
 * Enterprise Structured Logger with Correlation ID & PII Sanitization
 */

// PII patterns to redact from logs
const PII_PATTERNS = [
  { key: /phone|mobile|contact_no/i, redact: (val) => String(val).replace(/(\d{2})\d{4,6}(\d{2})/, "$1******$2") },
  { key: /pan|pan_number/i, redact: (val) => String(val).replace(/([A-Z]{2})[A-Z0-9]{5}([A-Z0-9]{3})/i, "$1*****$2") },
  { key: /aadhaar|aadhar/i, redact: (val) => String(val).replace(/(\d{4})\d{4}(\d{4})/, "$1-****-$2") },
  { key: /email/i, redact: (val) => String(val).replace(/(.{2})(.*)(@.*)/, "$1***$3") },
  { key: /password|secret|token|api_key|authorization/i, redact: () => "[REDACTED]" }
];

export const sanitizeLogData = (data) => {
  if (!data) return data;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  const sanitized = {};
  for (const [k, v] of Object.entries(data)) {
    let matched = false;
    for (const pattern of PII_PATTERNS) {
      if (pattern.key.test(k) && typeof v === "string") {
        sanitized[k] = pattern.redact(v);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (typeof v === "object" && v !== null) {
        sanitized[k] = sanitizeLogData(v);
      } else {
        sanitized[k] = v;
      }
    }
  }
  return sanitized;
};

class Logger {
  formatLog(level, message, meta = {}, correlationId = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      correlation_id: correlationId || meta.correlation_id || "system",
      ...sanitizeLogData(meta)
    };
    return JSON.stringify(entry);
  }

  info(message, meta = {}, correlationId = null) {
    console.log(this.formatLog("info", message, meta, correlationId));
  }

  warn(message, meta = {}, correlationId = null) {
    console.warn(this.formatLog("warn", message, meta, correlationId));
  }

  error(message, meta = {}, correlationId = null) {
    console.error(this.formatLog("error", message, meta, correlationId));
  }

  debug(message, meta = {}, correlationId = null) {
    if (process.env.NODE_ENV !== "production" || process.env.DEBUG === "true") {
      console.log(this.formatLog("debug", message, meta, correlationId));
    }
  }

  /**
   * Express middleware for request correlation ID tagging & logging
   */
  requestMiddleware() {
    return (req, res, next) => {
      const correlationId = req.headers["x-request-id"] || req.headers["x-correlation-id"] || uuidv4();
      req.correlationId = correlationId;
      res.setHeader("X-Request-Id", correlationId);

      const t0 = Date.now();
      res.on("finish", () => {
        const durationMs = Date.now() - t0;
        const meta = {
          method: req.method,
          path: req.originalUrl || req.url,
          status_code: res.statusCode,
          duration_ms: durationMs,
          ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
          user_id: req.user ? req.user.id : null
        };
        this.info(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} [${durationMs}ms]`, meta, correlationId);
      });

      next();
    };
  }
}

export const logger = new Logger();
export default logger;

