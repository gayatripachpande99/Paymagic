import express from "express";
import {
  getEmployeeDashboard,
  getTeamDashboard,
  getLeaderboard,
  getAdminOverview,
  getManagementReports
} from "../controllers/dashboardController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";
import { cacheService } from "../services/cacheService.js";

const router = express.Router();

router.get("/employee", authenticate, cacheService.middleware(20, "dashboard:employee"), getEmployeeDashboard);
router.get("/team", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), cacheService.middleware(30, "dashboard:team"), getTeamDashboard);
router.get("/leaderboard", authenticate, cacheService.middleware(30, "dashboard:leaderboard"), getLeaderboard);
router.get("/admin-overview", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), cacheService.middleware(30, "dashboard:admin"), getAdminOverview);
router.get("/reports", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), cacheService.middleware(30, "dashboard:reports"), getManagementReports);

export default router;

