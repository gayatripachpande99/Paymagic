import express from "express";
import { recoveryController } from "../controllers/recoveryController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Payment Verification Desk & Collections ──
router.post("/payments", authenticate, recoveryController.recordPayment);
router.get("/payments", authenticate, recoveryController.listPayments);
router.get("/payments/:id", authenticate, recoveryController.getPaymentById);
router.post(
  "/payments/:id/verify",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.verifyPayment
);
router.post(
  "/payments/:id/reject",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.rejectPayment
);
router.post(
  "/payments/:id/reverse",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.reversePayment
);

// ── Payment Receipts ──
router.get("/payments/:id/receipt", authenticate, recoveryController.getReceipt);
router.post("/payments/:id/receipt", authenticate, recoveryController.getReceipt);

// ── Promise-to-Pay (PTP) Management ──
router.post("/ptp", authenticate, recoveryController.createPTP);
router.get("/ptp", authenticate, recoveryController.listPTPs);
router.post(
  "/ptp/check-broken",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.checkBrokenPTPs
);

// ── Customer Omnichannel Contacts ──
router.post("/contacts", authenticate, recoveryController.recordContact);
router.get("/contacts", authenticate, recoveryController.listContacts);

// ── Statement Reconciliation Engine ──
router.post(
  "/reconciliation/upload",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.reconcileStatement
);
router.post(
  "/reconciliation/preview",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.previewReconciliation
);
router.post(
  "/reconciliation/confirm",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.confirmReconciliation
);
router.get(
  "/reconciliation/batches",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.listBatches
);
router.get(
  "/reconciliation/batches/:id",
  authenticate,
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  recoveryController.getBatchDetails
);

// ── Performance & Reports ──
router.get("/performance", authenticate, recoveryController.getPerformance);
router.get("/reports/export", authenticate, recoveryController.exportReport);

export default router;

