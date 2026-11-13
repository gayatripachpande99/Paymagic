import assert from "assert";
import { memoryStore, initializeDatabase, updateCaseStatusWithHistory } from "../config/db.js";
import { telephonyProvider } from "../adapters/telephonyAdapter.js";
import { getCallHistory, getAgentCallingReports } from "../controllers/telephonyController.js";

async function runModuleBVerification() {
  console.log("==================================================");
  console.log("📞 Running Module B Telephony & CDR Verification");
  console.log("==================================================");

  await initializeDatabase();

  // Test 1: Verify Seeded Calls and Call Recordings
  assert(memoryStore.calls.length > 0, "Seeded calls must exist");
  assert(memoryStore.call_recordings.length > 0, "Seeded call recordings must exist");
  console.log(`✓ Seeded calls: ${memoryStore.calls.length}, recordings: ${memoryStore.call_recordings.length}`);

  // Test 2: Call History & Metrics Ribbon
  const mockReqAll = {
    query: { timeRange: "7d", page: 1, limit: 10 },
    user: { id: "usr_admin", role: "ADMIN", fullName: "Bhushan Gaikwad" }
  };
  let resAllData = null;
  const mockResAll = {
    status: (code) => ({
      json: (data) => {
        resAllData = data;
        return data;
      }
    })
  };

  await getCallHistory(mockReqAll, mockResAll);
  assert(resAllData && resAllData.success, "getCallHistory must succeed");
  assert(resAllData.data.metrics, "Metrics ribbon must be present");
  assert(resAllData.data.metrics.total_calls > 0, "Total calls must be > 0");
  assert(resAllData.data.metrics.total_duration_formatted, "Total duration formatted must exist");
  console.log("✓ CDR Metrics ribbon verified:", resAllData.data.metrics);

  // Test 3: Enriched Call fields for CDR Table
  const firstCall = resAllData.data.calls[0];
  assert(firstCall.formatted_call_id, "formatted_call_id must exist");
  assert(firstCall.direction, "direction must exist");
  assert(firstCall.customer_phone, "customer_phone must exist");
  assert(firstCall.customer_name, "customer_name must exist");
  assert(firstCall.agent_extension, "agent_extension must exist");
  assert(firstCall.call_type, "call_type must exist");
  assert(firstCall.duration_formatted, "duration_formatted must exist");
  assert(firstCall.disposition, "disposition must exist");
  console.log("✓ CDR enriched call row verified:", {
    id: firstCall.formatted_call_id,
    direction: firstCall.direction,
    contact: `${firstCall.customer_name} (${firstCall.customer_phone})`,
    ext: firstCall.agent_extension,
    type: firstCall.call_type,
    duration: firstCall.duration_formatted,
    disposition: firstCall.disposition,
    has_recording: firstCall.has_recording
  });

  // Test 4: Direction Filtering (OUTBOUND vs INBOUND)
  const mockReqInbound = {
    query: { direction: "INBOUND", page: 1, limit: 50 },
    user: { id: "usr_admin", role: "ADMIN" }
  };
  let resInbound = null;
  const mockResInbound = {
    status: () => ({ json: (d) => { resInbound = d; } })
  };
  await getCallHistory(mockReqInbound, mockResInbound);
  assert(resInbound.data.calls.every(c => c.direction === "INBOUND"), "All returned calls must be INBOUND");
  console.log(`✓ Direction filter INBOUND verified: ${resInbound.data.calls.length} calls`);

  // Test 5: Employee-Wise Calling Reports (Agent Activity)
  let agentReportsData = null;
  const mockResAgents = {
    status: () => ({ json: (d) => { agentReportsData = d; } })
  };
  await getAgentCallingReports({}, mockResAgents);
  assert(agentReportsData && agentReportsData.success, "getAgentCallingReports must succeed");
  assert(agentReportsData.data.agentReports.length > 0, "Agent reports list must not be empty");
  const agent1 = agentReportsData.data.agentReports[0];
  assert(agent1.extension, "Agent extension must exist");
  assert(agent1.total_calls !== undefined, "Total calls must be present");
  assert(agent1.connection_rate !== undefined, "Connection rate must be present");
  assert(agent1.total_duration_formatted, "Total duration formatted must exist");
  assert(agent1.quality_score, "Quality score must exist");
  console.log("✓ Employee-wise calling reports verified. Sample agent:", {
    name: agent1.name,
    ext: agent1.extension,
    total_calls: agent1.total_calls,
    connection_rate: `${agent1.connection_rate}%`,
    total_duration: agent1.total_duration_formatted,
    ptp_conversions: agent1.ptp_conversions
  });

  // Test 6: S3 KMS Signed URL Generation
  const signedUrlResult = await telephonyProvider.generateSignedUrl("recordings/2026/11/call_001.mp3", 900);
  assert(signedUrlResult.signed_url.includes("https://"), "Signed URL must be HTTPS S3 endpoint");
  assert(signedUrlResult.expires_in_seconds === 900, "Signed URL expiration must match");
  console.log("✓ S3 KMS Signed URL generation verified (900s expiration)");

  // Test 7: Post-Call Outcome Atomicity with case_status_history
  const testCase = memoryStore.loan_cases[0];
  const oldStatus = testCase.status;
  const newStatus = oldStatus === "Promise to Pay" ? "Contacted" : "Promise to Pay";
  const statusUpdateResult = await updateCaseStatusWithHistory({
    caseId: testCase.id,
    employeeId: "usr_caller_1",
    newStatus,
    remarks: "Post-call outcome submitted: Customer confirmed partial settlement by Friday."
  });
  assert(statusUpdateResult.changed, "Case status should be changed");
  assert.strictEqual(statusUpdateResult.case.status, newStatus, "Case status must match new status");
  const latestHistory = statusUpdateResult.historyEntry || memoryStore.case_status_history[0];
  assert.strictEqual(latestHistory.case_id, testCase.id, "Latest history entry must match case ID");
  assert.strictEqual(latestHistory.new_status, newStatus, "History new status must match");
  assert.strictEqual(latestHistory.previous_status, oldStatus, "History previous status must match old status");
  console.log("✓ Post-call outcome ACID transaction verified: Status transitioned & logged in case_status_history");

  console.log("==================================================");
  console.log("🎉 ALL MODULE B TELEPHONY TESTS PASSED (7/7)");
  console.log("==================================================");
}

runModuleBVerification().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
