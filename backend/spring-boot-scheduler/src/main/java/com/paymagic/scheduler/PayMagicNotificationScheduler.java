package com.paymagic.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * PayMagic Enterprise Automated Reminders & Notifications Scheduler
 * 
 * Implements Spring Framework @Scheduled cron and fixed-rate triggers:
 * 1. Follow-up due tomorrow (@Scheduled(cron = "0 0 8 * * *"))
 * 2. Customer promised payment today (@Scheduled(cron = "0 30 8 * * *"))
 * 3. Employee has pending cases (@Scheduled(cron = "0 0 10 * * *"))
 * 4. Supervisor approval required (@Scheduled(fixedRate = 900000))
 * 5. Field visit report not submitted (@Scheduled(fixedRate = 1800000))
 * 6. Payment reconciliation pending (@Scheduled(fixedRate = 1800000))
 * 7. Daily performance report (@Scheduled(cron = "0 0 20 * * *"))
 * 
 * Each scheduled method pushes job payloads into Redis/Message Queue topics
 * for non-blocking asynchronous processing and multi-channel dispatch.
 */
@Component
@EnableScheduling
public class PayMagicNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(PayMagicNotificationScheduler.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    // ─────────────────────────────────────────────────────────────
    // 1. Follow-up due tomorrow (Runs at 8:00 AM every day)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    public void scanFollowUpsDueTomorrow() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("[SpringScheduler] Scanning loan recovery follow-ups due tomorrow: {}", tomorrow);

        Map<String, Object> reminderJob = new HashMap<>();
        reminderJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        reminderJob.put("type", "FOLLOW_UP_DUE_TOMORROW");
        reminderJob.put("targetDate", tomorrow.format(DATE_FORMATTER));
        reminderJob.put("severity", "INFO");
        reminderJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:followup", reminderJob);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Customer promised payment today (Runs at 8:30 AM every day)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 30 8 * * *")
    public void scanPromisedPaymentsToday() {
        LocalDate today = LocalDate.now();
        log.info("[SpringScheduler] Scanning Promise to Pay (PTP) cases mature today: {}", today);

        Map<String, Object> ptpJob = new HashMap<>();
        ptpJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        ptpJob.put("type", "PROMISE_TO_PAY_TODAY");
        ptpJob.put("targetDate", today.format(DATE_FORMATTER));
        ptpJob.put("severity", "WARNING");
        ptpJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:ptp", ptpJob);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Employee has pending cases (Runs at 10:00 AM every day)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 10 * * *")
    public void scanEmployeePendingCases() {
        log.info("[SpringScheduler] Scanning tele-caller queues for pending and untouched delinquent cases...");

        Map<String, Object> workloadJob = new HashMap<>();
        workloadJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        workloadJob.put("type", "PENDING_CASES_REMINDER");
        workloadJob.put("thresholdDpd", 60);
        workloadJob.put("severity", "WARNING");
        workloadJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:workload", workloadJob);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Supervisor approval required (Fixed rate: every 15 minutes)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(fixedRate = 900000)
    public void checkSupervisorApprovals() {
        log.info("[SpringScheduler] Sentinel check: Scanning pending cash handovers and employee leave requests...");

        Map<String, Object> approvalJob = new HashMap<>();
        approvalJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        approvalJob.put("type", "SUPERVISOR_APPROVAL_REQUIRED");
        approvalJob.put("severity", "CRITICAL");
        approvalJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:approvals", approvalJob);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Field visit report not submitted (Fixed rate: every 30 minutes)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(fixedRate = 1800000)
    public void checkOverdueFieldVisitReports() {
        log.info("[SpringScheduler] Sentinel check: Detecting concluded field visits with unsubmitted reports...");

        Map<String, Object> fieldVisitJob = new HashMap<>();
        fieldVisitJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        fieldVisitJob.put("type", "FIELD_VISIT_REPORT_OVERDUE");
        fieldVisitJob.put("maxGracePeriodMinutes", 120);
        fieldVisitJob.put("severity", "CRITICAL");
        fieldVisitJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:visits", fieldVisitJob);
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Payment reconciliation pending (Fixed rate: every 30 minutes)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(fixedRate = 1800000)
    public void checkPendingPaymentReconciliations() {
        log.info("[SpringScheduler] Watchdog check: Auditing unverified cash handovers and bank settlements...");

        Map<String, Object> reconcileJob = new HashMap<>();
        reconcileJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        reconcileJob.put("type", "PAYMENT_RECONCILIATION_PENDING");
        reconcileJob.put("severity", "WARNING");
        reconcileJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:reconciliation", reconcileJob);
    }

    // ─────────────────────────────────────────────────────────────
    // 7. Daily performance report (Runs at 8:00 PM shift end)
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 20 * * *")
    public void generateDailyPerformanceReport() {
        log.info("[SpringScheduler] End-of-shift: Aggregating daily recovery totals and call telemetry digest...");

        Map<String, Object> reportJob = new HashMap<>();
        reportJob.put("id", "job_" + UUID.randomUUID().toString().substring(0, 8));
        reportJob.put("type", "DAILY_PERFORMANCE_REPORT");
        reportJob.put("digestDate", LocalDate.now().format(DATE_FORMATTER));
        reportJob.put("severity", "INFO");
        reportJob.put("timestamp", System.currentTimeMillis());

        pushToQueue("queue:notifications:reports", reportJob);
    }

    /**
     * Helper to push jobs onto Redis message queue
     */
    private void pushToQueue(String queueKey, Map<String, Object> job) {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForList().rightPush(queueKey, job);
                log.info("[RedisQueue] Dispatched job {} to topic {}", job.get("id"), queueKey);
            } else {
                log.info("[MockQueue] Dispatched job {} to topic {} (Standalone mode)", job.get("id"), queueKey);
            }
        } catch (Exception e) {
            log.error("[RedisQueue] Failed to dispatch job to queue {}: {}", queueKey, e.getMessage());
        }
    }
}

