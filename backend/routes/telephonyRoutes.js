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

// Single recording stream endpoint
router.get("/recording/:callId", authenticate, getCallRecording);

export default router;
