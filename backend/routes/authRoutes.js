import express from "express";
import { adminLogin, employeeLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/admin-login", adminLogin);
router.post("/employee-login", employeeLogin);

export default router;
