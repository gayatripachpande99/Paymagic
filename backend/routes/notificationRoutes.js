import express from "express";
import { authenticate, requireRoles } from "../middleware/authMiddleware.js";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
  getSchedulerStatus,
  triggerSchedulerTask,
  getQueueTelemetry,
  purgeDeadLetterQueue
} from "../controllers/notificationController.js";

const router = express.Router();

// All notification routes require JWT authentication
router.use(authenticate);

// 1. Notification Feed & Management
router.get("/", listNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

// 2. Broadcast Notifications (Admins & Supervisors)
router.post(
  "/broadcast",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  broadcastNotification
);

// 3. Spring Scheduler Engine Controls
router.get(
  "/scheduler/status",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  getSchedulerStatus
);

router.post(
  "/scheduler/trigger/:taskId",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  triggerSchedulerTask
);

// 4. Redis & Message Queue Telemetry
router.get(
  "/queue/telemetry",
  requireRoles("SUPER_ADMIN", "ADMIN", "SUPERVISOR"),
  getQueueTelemetry
);

router.post(
  "/queue/purge-dlq",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  purgeDeadLetterQueue
);

export default router;

