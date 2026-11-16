import express from "express";
import { allocationController } from "../controllers/allocationController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All allocation routes require authentication
router.use(authenticate);

// ── Eligible Staff with Workload Metrics ──
router.get(
  "/eligible-employees",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.getEligibleEmployees
);

// ── Preview and Execution ──
router.post(
  "/preview",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.previewAllocation
);

router.post(
  "/execute",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.executeAllocation
);

// ── Manual & Bulk Assignment ──
router.post(
  "/manual-assign",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.manualAssign
);

router.post(
  "/bulk-assign",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.bulkAssign
);

// ── Workload Rebalancing ──
router.post(
  "/rebalance/preview",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.previewRebalance
);

router.post(
  "/rebalance/execute",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.executeRebalance
);

// ── Audit History ──
router.get(
  "/history",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.getHistory
);

router.get(
  "/case/:caseId/history",
  allocationController.getCaseHistory
);

// ── SLA Escalation Monitoring ──
router.post(
  "/sla/check",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.checkSla
);

router.get(
  "/sla/escalations",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  allocationController.listSlaEscalations
);

export default router;
