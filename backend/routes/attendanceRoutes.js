import express from "express";
import {
  getTodayAttendance,
  getAttendanceHistory,
  checkIn,
  checkOut,
  getLeaveRequests,
  applyLeave,
  getAllLeaveRequests,
  updateLeaveStatus,
  getDailyProductivity
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, getTodayAttendance);
router.get("/history", protect, getAttendanceHistory);
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/productivity", protect, getDailyProductivity);

// Leave Management
router.get("/leave", protect, getLeaveRequests);
router.post("/leave", protect, applyLeave);
router.get("/leave/all", protect, getAllLeaveRequests);
router.patch("/leave/:id/status", protect, updateLeaveStatus);

export default router;
