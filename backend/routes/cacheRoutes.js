import express from "express";
import { cacheService } from "../services/cacheService.js";
import { indexService } from "../services/indexService.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/cache/stats
 * View real-time caching metrics (hits, misses, hit rate, entries)
 */
router.get("/stats", (req, res) => {
  res.status(200).json({
    success: true,
    cache: cacheService.stats(),
    indexes: indexService.getStats(),
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/cache/clear
 * Purge cache (Admin only)
 */
router.post("/clear", authenticate, requireRoles("SUPER_ADMIN", "ADMIN"), (req, res) => {
  cacheService.clear();
  res.status(200).json({
    success: true,
    message: "Cache successfully cleared across all namespaces."
  });
});

export default router;

