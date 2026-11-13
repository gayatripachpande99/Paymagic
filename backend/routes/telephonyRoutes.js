import express from "express";
import {
  initiateCall,
  handleWebhook,
  submitCallOutcome,
  simulateCall,
  getCallHistory,
  getCallRecording,
  getAgentCallingReports
} from "../controllers/telephonyController.js";
import {
  getEvidenceOverview,
  getRecordings,
  getRecordingById,
  getPlaybackSignedUrl,
  getDownloadSignedUrl,
  getRecordingAuditTrail,
  updateLegalHold,
  deleteRecording,
  preventRecordingModification,
  linkComplaintToRecording,
  getLegalHoldsList
} from "../controllers/evidenceController.js";
import { authenticate, checkCallingHours } from "../middleware/authMiddleware.js";

const router = express.Router();

// Calling & Telephony Lifecycle (Module B)
router.post("/initiate", authenticate, checkCallingHours, initiateCall);
router.post("/webhook", handleWebhook);
router.post("/outcome", authenticate, submitCallOutcome);
router.post("/outcome/:callId", authenticate, submitCallOutcome);
router.post("/calls/:callId/outcome", authenticate, submitCallOutcome);
router.post("/simulate", authenticate, simulateCall);
router.get("/calls", authenticate, getCallHistory);
router.get("/agents", authenticate, getAgentCallingReports);
router.get("/agent-reports", authenticate, getAgentCallingReports);

// Backward-compatible single recording stream endpoint
router.get("/recording/:callId", authenticate, getCallRecording);

// Module F: Voice Evidence Vault & Regulatory Compliance
router.get("/evidence/overview", authenticate, getEvidenceOverview);
router.get("/recordings", authenticate, getRecordings);
router.get("/recordings/legal-holds", authenticate, getLegalHoldsList);
router.get("/recordings/:id", authenticate, getRecordingById);
router.post("/recordings/:id/playback-url", authenticate, getPlaybackSignedUrl);
router.post("/recordings/:id/download-url", authenticate, getDownloadSignedUrl);
router.get("/recordings/:id/audit-trail", authenticate, getRecordingAuditTrail);
router.get("/recordings/:id/access-logs", authenticate, getRecordingAuditTrail);
router.patch("/recordings/:id/legal-hold", authenticate, updateLegalHold);
router.patch("/recordings/:id/link-complaint", authenticate, linkComplaintToRecording);

// WORM Immutability Policy Guards (Delete & Put strictly blocked)
router.delete("/recordings/:id", authenticate, deleteRecording);
router.put("/recordings/:id", authenticate, preventRecordingModification);

export default router;
