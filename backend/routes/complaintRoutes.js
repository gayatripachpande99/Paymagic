import express from "express";
import {
  getComplaintsOverview,
  listComplaints,
  getComplaintById,
  recordComplaint,
  assignComplaint,
  resolveComplaint,
  getCustomerInvestigationDossier
} from "../controllers/complaintController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Module G: Complaint & Dispute Management
router.get("/overview", authenticate, getComplaintsOverview);
router.get("/", authenticate, listComplaints);
router.post("/", authenticate, recordComplaint);
router.get("/:id", authenticate, getComplaintById);
router.patch("/:id/assign", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), assignComplaint);
router.patch("/:id/resolve", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), resolveComplaint);

// 360° Customer Investigation History Pack
router.get("/:id/customer-history", authenticate, getCustomerInvestigationDossier);
router.get("/customer/:id/dossier", authenticate, getCustomerInvestigationDossier);

export default router;
