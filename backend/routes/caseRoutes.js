import express from "express";
import {
  listCases,
  getCaseById,
  updateCaseStatus,
  assignCase,
  bulkAssignCases,
  previewRuleAllocation,
  executeRuleAllocation,
  transferCase,
  getTransferHistory,
  setFollowUpDate,
  setRecoveryTarget,
  listRecoveryTargets,
  getCaseAuditHistory,
  listAllPayments,
  recordPayment,
  listFieldVisits,
  startFieldVisit,
  completeFieldVisit
} from "../controllers/caseController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Specific GET endpoints (MUST precede /:id to avoid collision) ──
router.get("/field-visits", authenticate, listFieldVisits);
router.get("/payments/all", authenticate, listAllPayments);
router.get("/targets", authenticate, listRecoveryTargets);
router.get("/transfers/history", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), getTransferHistory);
router.get("/audit-history", authenticate, getCaseAuditHistory);
router.get("/audit/history", authenticate, getCaseAuditHistory);

// ── Rule-Based Allocation Engine ──
router.post("/allocate/preview", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), previewRuleAllocation);
router.post("/allocate/execute", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), executeRuleAllocation);

// ── Case Assignment & Bulk Operations ──
router.post("/assign", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), assignCase);
router.post("/bulk-assign", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), bulkAssignCases);

// ── Case Transfer ──
router.post("/transfer", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), transferCase);
router.post("/transfer/:caseId", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), transferCase);

// ── Follow-up Scheduling ──
router.patch("/:id/follow-up", authenticate, setFollowUpDate);
router.post("/follow-up", authenticate, setFollowUpDate);

// ── Targets ──
router.post("/targets", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), setRecoveryTarget);

// ── Case listing & Detail ──
router.get("/", authenticate, listCases);
router.get("/:id", authenticate, getCaseById);

// ── Status update (Critical Transaction Rule) ──
router.patch("/:id/status", authenticate, updateCaseStatus);

// ── Payments Recording ──
router.post("/:id/payments", authenticate, recordPayment);

// ── Field Visit actions ──
router.post("/:id/field-visits/start", authenticate, startFieldVisit);
router.post("/:id/field-visits/:visitId/complete", authenticate, completeFieldVisit);

export default router;
