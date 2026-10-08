import express from "express";
import {
  getTodayAttendance,
  getAttendanceHistory,
  checkIn,
  checkOut
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, getTodayAttendance);
router.get("/history", protect, getAttendanceHistory);
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);

export default router;
