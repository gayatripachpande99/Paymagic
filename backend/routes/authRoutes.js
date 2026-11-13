import express from "express";
import {
  login,
  refreshToken,
  getCurrentUser,
  logout,
  adminLogin,
  employeeLogin
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/employee-login", employeeLogin);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
