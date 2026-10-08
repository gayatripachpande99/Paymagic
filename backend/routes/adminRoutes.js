import express from "express";
import {
  getAdminTodayAttendance,
  getEmployees,
  createEmployee,
  getAllRecords,
  uploadRecords,
  assignRecordsRange
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/attendance/today", protect, getAdminTodayAttendance);
router.get("/employees", protect, getEmployees);
router.post("/employees", protect, createEmployee);

// Records Management Workflow Routes
router.get("/records", protect, getAllRecords);
router.post("/records/upload", protect, uploadRecords);
router.post("/records/assign", protect, assignRecordsRange);

export default router;

