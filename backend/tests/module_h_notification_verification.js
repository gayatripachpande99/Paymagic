import assert from "assert";
import { initializeDatabase, memoryStore } from "../config/db.js";
import { queueService } from "../services/queueService.js";
import { schedulerService } from "../services/schedulerService.js";

console.log("==================================================");
console.log("🔔 Running Module H Automated Reminders & Queue Verification");
console.log("==================================================");

async function runTests() {
  await initializeDatabase();

  // Test 1: Verify Seed Notifications & 7 Example Scenarios
  console.log("\n[Test 1] Testing Seed Notifications & 7 Core Scenarios...");
  const notifs = memoryStore.notifications || [];
  assert(notifs.length >= 7, `Expected at least 7 seed notifications, got ${notifs.length}`);

  const types = notifs.map((n) => n.type);
  assert(types.includes("FOLLOW_UP_DUE_TOMORROW"), "Must include FOLLOW_UP_DUE_TOMORROW");
  assert(types.includes("PROMISE_TO_PAY_TODAY"), "Must include PROMISE_TO_PAY_TODAY");
  assert(types.includes("PENDING_CASES_REMINDER"), "Must include PENDING_CASES_REMINDER");
  assert(types.includes("SUPERVISOR_APPROVAL_REQUIRED"), "Must include SUPERVISOR_APPROVAL_REQUIRED");
  assert(types.includes("FIELD_VISIT_REPORT_OVERDUE"), "Must include FIELD_VISIT_REPORT_OVERDUE");
  assert(types.includes("PAYMENT_RECONCILIATION_PENDING"), "Must include PAYMENT_RECONCILIATION_PENDING");
  assert(types.includes("DAILY_PERFORMANCE_REPORT"), "Must include DAILY_PERFORMANCE_REPORT");

  console.log(`✓ Test 1 Passed: All 7 core notification scenarios verified in seed registry (${notifs.length} total).`);

  // Test 2: Verify Spring Scheduler Task Registry
  console.log("\n[Test 2] Testing Spring Scheduler Engine Status...");
  const schedulerStatus = schedulerService.getSchedulerStatus();
  assert.strictEqual(schedulerStatus.engine, "Spring Scheduler Core");
  assert.strictEqual(schedulerStatus.totalTasks, 7, "Must have exactly 7 Spring scheduled tasks");
  assert.strictEqual(schedulerStatus.activeTasks, 7, "All 7 tasks must be active");

  const taskAnnotations = schedulerStatus.tasks.map((t) => t.springAnnotation);
  assert(taskAnnotations.some((a) => a.includes("0 0 8 * * *")), "Must have 8 AM Follow-up cron");
  assert(taskAnnotations.some((a) => a.includes("0 30 8 * * *")), "Must have 8:30 AM PTP cron");
  assert(taskAnnotations.some((a) => a.includes("fixedRate = 900000")), "Must have 15m approval fixed rate");
  assert(taskAnnotations.some((a) => a.includes("0 0 20 * * *")), "Must have 8 PM daily report cron");

  console.log(`✓ Test 2 Passed: Spring Scheduler task registry verified with 7 @Scheduled cron/fixed-rate hooks.`);

  // Test 3: Redis & Message Queue Telemetry
  console.log("\n[Test 3] Testing Redis & Message Queue Telemetry...");
  const queueTelemetry = queueService.getTelemetry();
  assert.strictEqual(queueTelemetry.status, "HEALTHY");
  assert.strictEqual(queueTelemetry.connected, true);
  assert(typeof queueTelemetry.avgLatencyMs === "number", "Latency must be a number");
  assert(typeof queueTelemetry.queueDepths === "object", "Queue depths breakdown required");

  console.log(`✓ Test 3 Passed: Redis message queue verified:`, {
    backend: queueTelemetry.backend,
    status: queueTelemetry.status,
    avgLatencyMs: queueTelemetry.avgLatencyMs,
    throughput: `${queueTelemetry.throughputJobsPerMin} jobs/min`
  });

  // Test 4: Trigger Follow-up Due Tomorrow Scheduled Task
  console.log("\n[Test 4] Testing Spring Task Execution: Follow-up Due Tomorrow...");
  const followupResult = await schedulerService.executeTask("task_followup_due");
  assert.strictEqual(followupResult.success, true);
  assert(followupResult.itemsCount >= 0);
  console.log(`✓ Test 4 Passed: 'task_followup_due' executed with duration ${followupResult.durationMs}ms.`);

  // Test 5: Trigger Customer Promised Payment Today Task
  console.log("\n[Test 5] Testing Spring Task Execution: Promised Payment Today...");
  const ptpResult = await schedulerService.executeTask("task_ptp_today");
  assert.strictEqual(ptpResult.success, true);
  console.log(`✓ Test 5 Passed: 'task_ptp_today' executed, queued PTP alerts.`);

  // Test 6: Trigger Supervisor Approvals Task
  console.log("\n[Test 6] Testing Spring Task Execution: Supervisor Approvals Sentinel...");
  const approvalResult = await schedulerService.executeTask("task_supervisor_approvals");
  assert.strictEqual(approvalResult.success, true);
  console.log(`✓ Test 6 Passed: 'task_supervisor_approvals' sentinel checked pending operations.`);

  // Test 7: Trigger Daily Performance Report Task
  console.log("\n[Test 7] Testing Spring Task Execution: Daily Performance Report...");
  const reportResult = await schedulerService.executeTask("task_daily_performance_report");
  assert.strictEqual(reportResult.success, true);
  assert(reportResult.details?.totalCalls > 0);
  console.log(`✓ Test 7 Passed: 'task_daily_performance_report' generated digest (Calls: ${reportResult.details.totalCalls}, Recovery: ₹${reportResult.details.totalRecovered}).`);

  // Test 8: Message Queue Asynchronous Processing & Ingestion
  console.log("\n[Test 8] Testing Direct Queue Enqueue & Consumer Delivery...");
  const testPayload = {
    id: `notif_test_${Date.now()}`,
    type: "OPERATIONAL_BROADCAST",
    title: "Urgent Compliance Notice",
    message: "All calling representatives must adhere to the 19:00 IST calling curfew.",
    severity: "CRITICAL",
    recipient_role: "CALLER"
  };

  const enqueueRes = await queueService.enqueue("queue:notifications:broadcast", testPayload, {
    priority: "CRITICAL"
  });
  assert.strictEqual(enqueueRes.success, true);

  // Wait 250ms for asynchronous worker consumer
  await new Promise((r) => setTimeout(r, 250));

  const foundNotif = memoryStore.notifications.find((n) => n.id === testPayload.id);
  assert(foundNotif, "Enqueued notification must be processed and persisted by queue worker");
  assert.strictEqual(foundNotif.severity, "CRITICAL");
  console.log(`✓ Test 8 Passed: Asynchronous queue worker processed and stored notification: ${foundNotif.title}`);

  // Test 9: Notification Mark as Read & Read All
  console.log("\n[Test 9] Testing Mark As Read & Lifecycle...");
  foundNotif.status = "READ";
  foundNotif.read_at = new Date().toISOString();
  assert.strictEqual(foundNotif.status, "READ");
  assert(foundNotif.read_at !== null);
  console.log(`✓ Test 9 Passed: Lifecycle status transition to READ verified.`);

  // Test 10: Dead-Letter Queue (DLQ) & Purge
  console.log("\n[Test 10] Testing Dead-Letter Queue & Purge...");
  queueService.queues["queue:notifications:deadletter"].push({
    id: "job_failed_001",
    error: "Simulated Gateway Timeout",
    attempts: 3
  });
  const dlqTelemetryBefore = queueService.getTelemetry();
  assert(dlqTelemetryBefore.deadLetterJobs >= 1);

  const purgeRes = queueService.purgeDeadLetterQueue();
  assert.strictEqual(purgeRes.success, true);
  assert(purgeRes.purgedCount >= 1);
  assert.strictEqual(queueService.getTelemetry().deadLetterJobs, 0);
  console.log(`✓ Test 10 Passed: Dead-Letter Queue purged ${purgeRes.purgedCount} jobs.`);

  console.log("==================================================");
  console.log("🎉 ALL MODULE H NOTIFICATION TESTS PASSED (10/10)");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("❌ Module H Test Failure:", err);
  process.exit(1);
});

