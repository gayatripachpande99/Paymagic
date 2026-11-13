import assert from "assert";
import { memoryStore, initializeDatabase } from "../config/db.js";
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

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

async function runModuleFVerification() {
  console.log("==================================================");
  console.log("🔒 Running Module F Recording & Evidence Verification");
  console.log("==================================================");

  await initializeDatabase();

  // Test 1: Verify Seeded Evidence Metadata
  assert(memoryStore.call_recordings.length > 0, "Recordings must be seeded");
  const firstRec = memoryStore.call_recordings[0];
  assert(firstRec.s3_bucket === "paymagic-telephony-recordings-secure", "Must use private S3 bucket");
  assert(firstRec.encryption_type === "aws:kms:sse", "Must use AWS KMS SSE encryption");
  assert(firstRec.kms_key_arn, "Must have KMS Key ARN");
  assert(firstRec.checksum_sha256, "Must have SHA-256 integrity checksum");
  assert.strictEqual(firstRec.customer_notification_status, "ANNOUNCED_RECORDED", "Notice must be ANNOUNCED_RECORDED");
  console.log("✓ Test 1 Passed: S3 bucket, KMS SSE encryption, SHA-256 hash, and statutory notice verified:", {
    bucket: firstRec.s3_bucket,
    encryption: firstRec.encryption_type,
    notice: firstRec.customer_notification_status,
    retention_until: firstRec.retention_until
  });

  // Test 2: Evidence Overview Telemetry
  const mockResOverview = createMockRes();
  await getEvidenceOverview({}, mockResOverview);
  assert.strictEqual(mockResOverview.statusCode, 200);
  assert(mockResOverview.body.data.total_recordings > 0, "Total recordings must be > 0");
  assert(mockResOverview.body.data.total_storage_mb > 0, "Total storage MB must be > 0");
  assert.strictEqual(mockResOverview.body.data.kms_encryption_rate_pct, "100.0", "100% KMS encryption required");
  assert.strictEqual(mockResOverview.body.data.statutory_notice_compliance_rate_pct, "100.0", "100% Notice compliance required");
  console.log("✓ Test 2 Passed: Overview telemetry verified:", mockResOverview.body.data);

  // Test 3: List Recordings with Rich Enrichment
  const mockResList = createMockRes();
  await getRecordings({
    query: { page: 1, limit: 10 },
    user: { id: "usr_admin", role: "ADMIN", fullName: "Bhushan Gaikwad" }
  }, mockResList);
  assert.strictEqual(mockResList.statusCode, 200);
  assert(mockResList.body.data.recordings.length > 0, "Enriched recordings must be returned");
  const recItem = mockResList.body.data.recordings[0];
  assert(recItem.call_metadata, "Call metadata must be enriched");
  assert(recItem.employee_details, "Employee details must be enriched");
  assert(recItem.customer_details, "Customer details must be enriched");
  assert(recItem.duration_formatted, "Duration formatted must exist");
  assert(recItem.file_size_formatted, "File size formatted must exist");
  console.log("✓ Test 3 Passed: Rich metadata enrichment verified:", {
    callId: recItem.call_metadata?.id,
    direction: recItem.call_metadata?.direction,
    employee: recItem.employee_details?.full_name,
    customer: recItem.customer_details?.full_name,
    status: recItem.processing_status
  });

  // Test 4: Short-Lived Signed URL Generation & Access Audit Logging
  const initialAuditCount = (memoryStore.recording_access_logs || []).length;
  const mockResPlayback = createMockRes();
  await getPlaybackSignedUrl({
    params: { id: firstRec.id },
    body: { purpose: "Quality Call Calibration Audit", expiresInSeconds: 900 },
    user: { id: "usr_supervisor", role: "SUPERVISOR", fullName: "Aarav Mehta", employeeId: "PM-SUP-0001" },
    ip: "192.168.1.55",
    headers: { "user-agent": "VerificationTestAgent/1.0" }
  }, mockResPlayback);

  assert.strictEqual(mockResPlayback.statusCode, 200);
  assert(mockResPlayback.body.data.signed_url.includes("https://"), "Signed URL must be HTTPS S3 endpoint");
  assert(mockResPlayback.body.data.signed_url.includes("X-Amz-Signature"), "Must contain signature");
  assert.strictEqual(mockResPlayback.body.data.expires_in_seconds, 900, "Must be 900s short-lived signed URL");
  assert(mockResPlayback.body.data.audit_log_id, "Must return audit log ID");

  // Verify access audit record was created immutably
  assert.strictEqual(memoryStore.recording_access_logs.length, initialAuditCount + 1, "Audit log count must increase by 1");
  const latestLog = memoryStore.recording_access_logs[memoryStore.recording_access_logs.length - 1];
  assert.strictEqual(latestLog.access_type, "PLAYBACK");
  assert.strictEqual(latestLog.user_id, "usr_supervisor");
  assert.strictEqual(latestLog.purpose, "Quality Call Calibration Audit");
  assert.strictEqual(latestLog.ip_address, "192.168.1.55");
  console.log("✓ Test 4 Passed: Short-lived signed S3 KMS URL generated with mandatory audit log:", latestLog);

  // Test 5: RBAC Isolation - Callers Cannot Play Other Agents' Calls
  // Find a recording belonging to usr_caller_2
  const caller2Call = memoryStore.calls.find(c => c.employee_id === "usr_caller_2");
  const caller2Rec = memoryStore.call_recordings.find(r => r.call_id === caller2Call?.id);
  assert(caller2Rec, "Must find a recording belonging to usr_caller_2");

  const mockResCallerDenied = createMockRes();
  await getPlaybackSignedUrl({
    params: { id: caller2Rec.id },
    body: { purpose: "Unauthorized Snooping" },
    user: { id: "usr_caller_1", role: "CALLER", fullName: "Rohan Kulkarni" },
    ip: "192.168.1.88",
    headers: {}
  }, mockResCallerDenied);
  assert.strictEqual(mockResCallerDenied.statusCode, 403, "Caller attempting to play another agent's call must be 403 Forbidden");
  console.log("✓ Test 5 Passed: RBAC isolation verified (403 Forbidden on cross-agent playback)");

  // Test 6: RBAC Isolation - Callers Cannot Download Audio Files
  const mockResDownloadDenied = createMockRes();
  await getDownloadSignedUrl({
    params: { id: firstRec.id },
    body: { purpose: "Illegal Export Attempt" },
    user: { id: "usr_caller_1", role: "CALLER", fullName: "Rohan Kulkarni" },
    ip: "192.168.1.88",
    headers: {}
  }, mockResDownloadDenied);
  assert.strictEqual(mockResDownloadDenied.statusCode, 403, "Caller downloading audio must be 403 Forbidden");

  // Admin download succeeds and logs DOWNLOAD
  const mockResDownloadAllowed = createMockRes();
  await getDownloadSignedUrl({
    params: { id: firstRec.id },
    body: { purpose: "Ombudsman Hearing Evidence Handover" },
    user: { id: "usr_admin", role: "ADMIN", fullName: "Bhushan Gaikwad" },
    ip: "192.168.1.10",
    headers: {}
  }, mockResDownloadAllowed);
  assert.strictEqual(mockResDownloadAllowed.statusCode, 200, "Admin download must succeed");
  assert(mockResDownloadAllowed.body.data.download_url.includes("response-content-disposition=attachment"), "Must contain attachment disposition");
  const downloadLog = memoryStore.recording_access_logs[memoryStore.recording_access_logs.length - 1];
  assert.strictEqual(downloadLog.access_type, "DOWNLOAD");
  console.log("✓ Test 6 Passed: Download RBAC & download audit log verified:", downloadLog);

  // Test 7: WORM Immutability Policy (DELETE / PUT Blocked)
  const mockResDelete = createMockRes();
  await deleteRecording({ params: { id: firstRec.id }, user: { id: "usr_admin", role: "ADMIN" } }, mockResDelete);
  assert.strictEqual(mockResDelete.statusCode, 403, "DELETE on recording must return 403 Forbidden");
  assert.strictEqual(mockResDelete.body.error, "WORM_IMMUTABILITY_RESTRICTION");

  const mockResPut = createMockRes();
  await preventRecordingModification({ params: { id: firstRec.id }, user: { id: "usr_admin", role: "ADMIN" } }, mockResPut);
  assert.strictEqual(mockResPut.statusCode, 403, "PUT/PATCH on recording must return 403 Forbidden");
  console.log("✓ Test 7 Passed: WORM policy enforced (403 Forbidden on DELETE and PUT tampering)");

  // Test 8: Legal Hold Application and Retention Protection
  const targetRec = memoryStore.call_recordings[1];
  const mockResHold = createMockRes();
  await updateLegalHold({
    params: { id: targetRec.id },
    body: {
      is_legal_hold: true,
      reason: "Borrower disputed EMI compound penalty calculation",
      reference: "ARB-PUNE-2026-904"
    },
    user: { id: "usr_supervisor", role: "SUPERVISOR", fullName: "Aarav Mehta" },
    ip: "192.168.1.20",
    headers: {}
  }, mockResHold);

  assert.strictEqual(mockResHold.statusCode, 200);
  assert.strictEqual(mockResHold.body.data.is_legal_hold, true);
  assert.strictEqual(mockResHold.body.data.processing_status, "LEGAL_HOLD");
  assert.strictEqual(mockResHold.body.data.legal_hold_reference, "ARB-PUNE-2026-904");
  assert.strictEqual(targetRec.is_legal_hold, true);
  assert.strictEqual(targetRec.processing_status, "LEGAL_HOLD");

  // Verify it appears in legal holds list
  const mockResHoldList = createMockRes();
  await getLegalHoldsList({}, mockResHoldList);
  assert(mockResHoldList.body.data.legal_holds.some(r => r.id === targetRec.id), "Target rec must appear in legal holds list");
  console.log("✓ Test 8 Passed: Legal hold applied, WORM retention locked, and listed in legal holds registry");

  // Test 9: Linking Customer Grievance/Complaint
  const mockResLink = createMockRes();
  await linkComplaintToRecording({
    params: { id: targetRec.id },
    body: { complaint_id: "comp_001" },
    user: { id: "usr_supervisor", role: "SUPERVISOR", fullName: "Aarav Mehta" },
    ip: "192.168.1.20",
    headers: {}
  }, mockResLink);
  assert.strictEqual(mockResLink.statusCode, 200);
  assert.strictEqual(targetRec.linked_complaint_id, "comp_001");
  assert.strictEqual(targetRec.linked_complaint_number, "GRIEV-2026-0012");
  console.log("✓ Test 9 Passed: Linked customer grievance to call recording evidence");

  // Test 10: Complete Audit Trail Retrieval
  const mockResAudit = createMockRes();
  await getRecordingAuditTrail({
    params: { id: targetRec.id },
    user: { id: "usr_admin", role: "ADMIN" }
  }, mockResAudit);
  assert.strictEqual(mockResAudit.statusCode, 200);
  assert(mockResAudit.body.data.total_accesses >= 2, "Should have legal hold + complaint link audit entries");
  assert(mockResAudit.body.data.audit_trail.some(l => l.access_type === "LEGAL_HOLD_APPLIED"));
  assert(mockResAudit.body.data.audit_trail.some(l => l.access_type === "COMPLAINT_LINKED"));
  console.log(`✓ Test 10 Passed: Audit trail returned ${mockResAudit.body.data.total_accesses} access entries for evidence ${targetRec.id}`);

  console.log("==================================================");
  console.log("🎉 ALL MODULE F EVIDENCE MANAGEMENT TESTS PASSED (10/10)");
  console.log("==================================================");
}

runModuleFVerification().catch(err => {
  console.error("❌ Module F verification failed:", err);
  process.exit(1);
});
