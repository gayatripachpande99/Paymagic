import express from "express";
import {
  listCases,
  getCaseById,
  updateCaseStatus,
  assignCase,
  bulkAssignCases,
  transferCase,
  setFollowUpDate,
  setRecoveryTarget,
  listAllPayments,
  recordPayment,
  listFieldVisits,
  startFieldVisit,
  completeFieldVisit
} from "../controllers/caseController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Field Visits listing (placed before /:id)
router.get("/field-visits", authenticate, listFieldVisits);

// Payments listing (placed before /:id)
router.get("/payments/all", authenticate, listAllPayments);

// Case listing & detail
router.get("/", authenticate, listCases);
router.get("/:id", authenticate, getCaseById);

// Field Visit actions
router.post("/:id/field-visits/start", authenticate, startFieldVisit);
router.post("/:id/field-visits/:visitId/complete", authenticate, completeFieldVisit);

// Payments recording
router.post("/:id/payments", authenticate, recordPayment);

// Status update (critical transaction rule)
router.patch("/:id/status", authenticate, updateCaseStatus);

// Case assignment & transfer (Admin/Supervisor)
router.post("/assign", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), assignCase);
router.post("/bulk-assign", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), bulkAssignCases);
router.post("/transfer", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), transferCase);
router.post("/transfer/:caseId", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), transferCase);

// Follow-up scheduling
router.patch("/:id/follow-up", authenticate, setFollowUpDate);
router.post("/follow-up", authenticate, setFollowUpDate);

// Targets
router.post("/targets", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), setRecoveryTarget);

export default router;

