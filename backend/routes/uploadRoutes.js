import express from "express";
import { upload, uploadFile, getImportHistory } from "../controllers/uploadController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/import", authenticate, requireRoles("SUPER_ADMIN", "ADMIN"), upload.single("file"), uploadFile);
router.post("/", authenticate, requireRoles("SUPER_ADMIN", "ADMIN"), upload.single("file"), uploadFile);
router.get("/history", authenticate, requireRoles("SUPER_ADMIN", "ADMIN"), getImportHistory);

export default router;

