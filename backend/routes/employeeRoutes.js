import express from "express";
import {
  getEmployeeProfile,
  getEmployeeAssignedRecords,
  updateRecordStatus
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getEmployeeProfile);
router.get("/records", protect, getEmployeeAssignedRecords);
router.post("/records/:id/status", protect, updateRecordStatus);

export default router;

