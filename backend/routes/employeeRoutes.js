import express from "express";
import { getEmployeeProfile } from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getEmployeeProfile);

export default router;
