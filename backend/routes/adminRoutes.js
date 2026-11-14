import express from "express";
import {
  getAdminTodayAttendance,
  getEmployees,
  createEmployee,
  getAllRecords,
  uploadRecords,
  assignRecordsRange
} from "../controllers/adminController.js";
import { protect, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Strict RBAC: All Admin routes require authenticated ADMIN or SUPER_ADMIN role
router.use(protect);
router.use(requireRoles("ADMIN", "SUPER_ADMIN"));

router.get("/attendance/today", getAdminTodayAttendance);
router.get("/employees", getEmployees);
router.post("/employees", createEmployee);

// Records Management Workflow Routes
router.get("/records", getAllRecords);
router.post("/records/upload", uploadRecords);
router.post("/records/assign", assignRecordsRange);

export default router;
