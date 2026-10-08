import express from "express";
import {
  getAdminTodayAttendance,
  getEmployees,
  createEmployee
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/attendance/today", protect, getAdminTodayAttendance);
router.get("/employees", protect, getEmployees);
router.post("/employees", protect, createEmployee);

export default router;
