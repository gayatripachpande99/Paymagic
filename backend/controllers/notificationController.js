import { memoryStore } from "../config/db.js";
import { queueService } from "../services/queueService.js";
import { schedulerService } from "../services/schedulerService.js";

/**
 * Module H: Automated Reminders & Notifications Controller
 */

// 1. List notifications for current user with filtering & pagination
export const listNotifications = async (req, res) => {
  try {
    const user = req.user;
    const {
      status = "ALL",
      type = "ALL",
      severity = "ALL",
      search = "",
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const allNotifications = memoryStore.notifications || [];

    // Filter by user role visibility
    let filtered = allNotifications.filter((n) => {
      // Admins and Super Admins can see all platform notifications
      if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;

      // Supervisors can see supervisor role notifications and caller notifications
      if (user.role === "SUPERVISOR") {
        return (
          n.recipient_role === "SUPERVISOR" ||
          n.recipient_role === "CALLER" ||
          n.recipient_type === "ALL" ||
          n.recipient_id === user.id
        );
      }

      // Individual staff (CALLER, FIELD_AGENT) see their own or broadcast alerts
      return (
        n.recipient_id === user.id ||
        n.recipient_role === user.role ||
        n.recipient_type === "ALL"
      );
    });

    // Filter by status (UNREAD / READ)
    if (status !== "ALL") {
      filtered = filtered.filter((n) => n.status === status);
    }

    // Filter by Type
    if (type !== "ALL") {
      filtered = filtered.filter((n) => n.type === type);
    }

    // Filter by Severity
    if (severity !== "ALL") {
      filtered = filtered.filter((n) => n.severity === severity);
    }

    // Search query in title, message or metadata
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((n) => {
        return (
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.message && n.message.toLowerCase().includes(q)) ||
          (n.recipient_name && n.recipient_name.toLowerCase().includes(q)) ||
          (n.metadata?.borrower_name && n.metadata.borrower_name.toLowerCase().includes(q)) ||
          (n.metadata?.case_number && n.metadata.case_number.toLowerCase().includes(q))
        );
      });
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedNotifications = filtered.slice(startIndex, startIndex + limitNum);

    // Compute unread count for current user
    const unreadCount = allNotifications.filter((n) => {
      const isVisible =
        user.role === "SUPER_ADMIN" ||
        user.role === "ADMIN" ||
        n.recipient_id === user.id ||
        n.recipient_role === user.role ||
        n.recipient_type === "ALL";

      return isVisible && n.status === "UNREAD";
    }).length;

    // Severity breakdown
    const criticalCount = allNotifications.filter((n) => n.severity === "CRITICAL" && n.status === "UNREAD").length;
    const warningCount = allNotifications.filter((n) => n.severity === "WARNING" && n.status === "UNREAD").length;

    return res.status(200).json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages
      },
      telemetry: {
        unreadCount,
        criticalCount,
        warningCount,
        totalNotifications: allNotifications.length
      }
    });
  } catch (err) {
    console.error("listNotifications error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Fast unread count for navbar notification bell
export const getUnreadCount = async (req, res) => {
  try {
    const user = req.user;
    const allNotifications = memoryStore.notifications || [];

    const unreadCount = allNotifications.filter((n) => {
      const isVisible =
        user.role === "SUPER_ADMIN" ||
        user.role === "ADMIN" ||
        n.recipient_id === user.id ||
        n.recipient_role === user.role ||
        n.recipient_type === "ALL";

      return isVisible && n.status === "UNREAD";
    }).length;

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Mark single notification as READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = (memoryStore.notifications || []).find((n) => n.id === id);

    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notif.status = "READ";
    notif.read_at = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: notif
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Mark all notifications for current user as READ
export const markAllAsRead = async (req, res) => {
  try {
    const user = req.user;
    let updatedCount = 0;

    (memoryStore.notifications || []).forEach((n) => {
      const isVisible =
        user.role === "SUPER_ADMIN" ||
        user.role === "ADMIN" ||
        n.recipient_id === user.id ||
        n.recipient_role === user.role ||
        n.recipient_type === "ALL";

      if (isVisible && n.status === "UNREAD") {
        n.status = "READ";
        n.read_at = new Date().toISOString();
        updatedCount++;
      }
    });

    return res.status(200).json({
      success: true,
      message: `Marked ${updatedCount} notification(s) as read.`,
      updatedCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const index = (memoryStore.notifications || []).findIndex((n) => n.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    const removed = memoryStore.notifications.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: "Notification removed.",
      removedId: id
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Broadcast custom notification into message queue
export const broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      severity = "INFO",
      recipient_role = "ALL",
      recipient_id = null,
      channel = "IN_APP"
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required for notification dispatch."
      });
    }

    const payload = {
      type: "OPERATIONAL_BROADCAST",
      title: title.trim(),
      message: message.trim(),
      severity,
      recipient_type: recipient_id ? "USER" : recipient_role === "ALL" ? "ALL" : "ROLE",
      recipient_id,
      recipient_role,
      recipient_name: recipient_role === "ALL" ? "All Operations Personnel" : `${recipient_role} Team`,
      entity_type: "broadcast",
      entity_id: `bcast_${Date.now()}`,
      metadata: { dispatched_by: req.user.full_name, sender_id: req.user.id },
      channel
    };

    const enqueueResult = await queueService.enqueue("queue:notifications:broadcast", payload, {
      priority: severity === "CRITICAL" ? "CRITICAL" : "MEDIUM"
    });

    return res.status(201).json({
      success: true,
      message: "Broadcast notification successfully queued for delivery.",
      enqueueResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Get Spring Scheduler tasks and crons status
export const getSchedulerStatus = async (req, res) => {
  try {
    const status = schedulerService.getSchedulerStatus();
    return res.status(200).json({
      success: true,
      data: status
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Trigger a specific Spring Scheduler task on-demand
export const triggerSchedulerTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await schedulerService.executeTask(taskId);

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? `Task ${taskId} executed successfully! Dispatched reminder jobs to queue.`
        : `Task execution failed: ${result.error}`,
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Get Redis & Message Queue telemetry
export const getQueueTelemetry = async (req, res) => {
  try {
    const telemetry = queueService.getTelemetry();
    return res.status(200).json({
      success: true,
      data: telemetry
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Purge Dead-Letter Queue
export const purgeDeadLetterQueue = async (req, res) => {
  try {
    const result = queueService.purgeDeadLetterQueue();
    return res.status(200).json({
      success: true,
      message: `Cleared ${result.purgedCount} job(s) from Dead-Letter Queue.`,
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

