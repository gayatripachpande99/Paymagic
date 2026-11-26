import express from "express";
import {
  getAdminOverview,
  getHierarchy,
  getCases,
  getCaseDetails,
  createAllocator,
  createCampaign,
  uploadAllocationFile,
  allocateAccounts,
  getCampaignMembers,
  mapCampaignMembers,
  getPendingPayments,
  verifyPayment,
  getPaymentLedger,
  getAnalytics,
  getTelephonyLogs,
  getIncentives,
  exportReport,
  getFieldRecoveryData,
  reconcileCashHandover,
  getCommunicationsData,
  getAgents,
  createAgent,
  updateAgent
} from "../controllers/adminController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware: authenticate and enforce Super Admin, Admin, or Supervisor roles
router.use(authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR", "HR"));

// Overview & Telemetry
router.get("/overview", getAdminOverview);
router.get("/hierarchy", getHierarchy);
router.get("/analytics", getAnalytics);
router.get("/telephony", getTelephonyLogs);

// Staff Directory & Agents
router.get("/agents", getAgents);
router.post("/agents", createAgent);
router.patch("/agents/:id", updateAgent);

// Accounts & Work Allocation
router.get("/cases", getCases);
router.get("/cases/:caseId", getCaseDetails);
router.post("/allocate", allocateAccounts);

// Entity Hierarchy Creation & Ingestion
router.post("/allocators", createAllocator);
router.post("/allocations/upload", uploadAllocationFile);
router.post("/campaigns", createCampaign);
router.get("/campaigns/:campaignId/members", getCampaignMembers);
router.post("/campaigns/:campaignId/members", mapCampaignMembers);

// Payments Verification Desk & Ledger (Architecture Section 11)
router.get("/payments/verification", getPendingPayments);
router.post("/payments/:paymentId/verify", verifyPayment);
router.get("/payments/ledger", getPaymentLedger);

// Incentives (Architecture Section 14)
router.get("/incentives", getIncentives);

// Regulatory & Statutory Reports (Architecture Section 15)
router.post("/reports/export", exportReport);

// Field Operations & GPS Radar (Architecture Section 10)
router.get("/field-recovery", getFieldRecoveryData);
router.post("/field-recovery/handovers/:id/reconcile", reconcileCashHandover);

// Digital Messages & Multi-Channel Engagement (Architecture Section 13)
router.get("/communications", getCommunicationsData);

export default router;
