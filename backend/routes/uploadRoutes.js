import express from "express";
import {
  upload,
  uploadFile,
  previewUpload,
  confirmUpload,
  getImportTemplate,
  downloadErrorRecords,
  getImportHistory
} from "../controllers/uploadController.js";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Download import template (.xlsx / .csv)
router.get("/template", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), getImportTemplate);

// Download error records for an import batch
router.get("/errors/:batchId", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), downloadErrorRecords);

// Pre-upload preview & validation
router.post("/preview", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), upload.single("file"), previewUpload);

// Confirm import from preview session
router.post("/confirm", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), confirmUpload);

// Direct file upload & import
router.post("/import", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), upload.single("file"), uploadFile);
router.post("/", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), upload.single("file"), uploadFile);

// History
router.get("/history", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"), getImportHistory);

export default router;
