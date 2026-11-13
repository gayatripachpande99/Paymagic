import express from "express";
import { submitEnquiry, listEnquiries } from "../controllers/enquiryController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitEnquiry);
router.get("/", authenticate, requireRoles("SUPER_ADMIN", "ADMIN"), listEnquiries);

export default router;

