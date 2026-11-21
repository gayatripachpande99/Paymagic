import express from "express";
import {
  getEmployeeDashboard,
  getAssignedCases,
  recordCall,
  saveDisposition,
  recordPaymentClaim,
  getEmployeeFollowups,
  updatePresence,
  getFieldVisits,
  recordFieldVisitCheckIn,
  recordFieldVisitOutcome
} from "../controllers/employeeController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware: authenticate token for all employee endpoints
router.use(authenticate);

// Telemetry & Working Queue
router.get("/dashboard", getEmployeeDashboard);
router.get("/cases", getAssignedCases);

// Operations: Calling, Dispositions, and Payment Collection
router.post("/calls", recordCall);
router.post("/cases/:caseId/disposition", saveDisposition);
router.post("/payments", recordPaymentClaim);

// Field Operations (Architecture Section 10)
router.get("/field-visits", getFieldVisits);
router.post("/field-visits/:id/checkin", recordFieldVisitCheckIn);
router.post("/field-visits/:id/outcome", recordFieldVisitOutcome);

// Tasks & Presence
router.get("/followups", getEmployeeFollowups);
router.post("/presence", updatePresence);

export default router;
