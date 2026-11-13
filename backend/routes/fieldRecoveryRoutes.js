import express from "express";
import {
  getFieldOverview,
  listFieldVisits,
  scheduleFieldVisit,
  getMyRoute,
  checkInFieldVisit,
  completeFieldVisit,
  getDigitalReceipt,
  submitCashHandover,
  listCashHandovers,
  reconcileCashHandover,
  getFieldRadar
} from "../controllers/fieldRecoveryController.js";
import { protect, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All field routes require authenticated staff
router.use(protect);

// 1. Field Recovery Operations Overview KPIs
router.get("/overview", getFieldOverview);

// 2. Field Visits List (filtered by agent, status, zone, priority)
router.get("/visits", listFieldVisits);

// 3. Schedule New Field Visit (Supervisor & Admin)
router.post(
  "/schedule",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR", "FIELD_AGENT"),
  scheduleFieldVisit
);

// 4. Daily Itinerary / Route for logged in Field Agent
router.get("/my-route", getMyRoute);

// 5. On-Site Check-in with statutory GPS & notice verification
router.post("/visits/:id/check-in", checkInFieldVisit);

// 6. Conclude Visit with Outcome, Evidence, Spot Payment & Receipt
router.post("/visits/:id/complete", completeFieldVisit);

// 7. Instant Digital Receipt Lookup
router.get("/receipt/:receiptNumber", getDigitalReceipt);

// 8. Cash Handover Submission (Field Agent)
router.post(
  "/cash-handover",
  requireRoles("FIELD_AGENT", "SUPERVISOR", "ADMIN", "SUPER_ADMIN"),
  submitCashHandover
);

// 9. Cash Handovers List
router.get("/cash-handovers", listCashHandovers);

// 10. Supervisor Cash Reconciliation Approval
router.patch(
  "/cash-handover/:id/reconcile",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  reconcileCashHandover
);

// 11. Live Field Radar and Map Data
router.get("/radar", getFieldRadar);

export default router;
