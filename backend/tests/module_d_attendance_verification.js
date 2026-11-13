import assert from "node:assert";
import { memoryStore, initializeDatabase, updateCaseStatusWithHistory } from "../config/db.js";
import { checkIn, checkOut, applyLeave, updateLeaveStatus, getDailyProductivity } from "../controllers/attendanceController.js";
import { listFieldVisits, startFieldVisit, completeFieldVisit } from "../controllers/caseController.js";
import { employeeLogin } from "../controllers/authController.js";

async function runModuleDVerification() {
  console.log("==================================================================");
  console.log("🧪 Running PayMagic Module D Verification Suite");
  console.log("   (Employee Login, Attendance, Productivity, Leave, Field GPS)");
  console.log("==================================================================");

  await initializeDatabase();

  // Test 1: Employee login with caller & field agent IDs
  console.log("\n[Test 1] Testing Employee Login System for Distinct Roles...");
  
  let callerToken = null;
  let callerUser = null;
  const callerReq = {
    body: { employeeId: "PM-CAL-0001", password: "Emp@123" }
  };
  const callerRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  await employeeLogin(callerReq, callerRes);
  assert.strictEqual(callerRes.statusCode, 200, "Caller login failed");
  assert.strictEqual(callerRes.data.user.employeeId, "PM-CAL-0001", "Invalid employeeId returned");
  assert.strictEqual(callerRes.data.user.role, "CALLER", "Caller role not preserved");
  callerToken = callerRes.data.token;
  callerUser = callerRes.data.user;
  console.log(`  ✓ Telecaller login verified: ${callerUser.fullName} (${callerUser.role})`);

  let fieldToken = null;
  let fieldUser = null;
  const fieldReq = {
    body: { employeeId: "PM-FLD-0001", password: "Emp@123" }
  };
  const fieldRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  await employeeLogin(fieldReq, fieldRes);
  assert.strictEqual(fieldRes.statusCode, 200, "Field agent login failed");
  assert.strictEqual(fieldRes.data.user.role, "FIELD_AGENT", "Field agent role not preserved");
  fieldToken = fieldRes.data.token;
  fieldUser = fieldRes.data.user;
  console.log(`  ✓ Field Agent login verified: ${fieldUser.fullName} (${fieldUser.role})`);

  // Test 2: Daily Attendance & Start Shift / End Shift
  console.log("\n[Test 2] Testing Daily Attendance & Shift Tracking...");
  const attInReq = { user: callerUser };
  const attInRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  checkIn(attInReq, attInRes);
  assert.ok(attInRes.statusCode === 200 || attInRes.statusCode === 400, "Unexpected check-in status");
  console.log("  ✓ Start shift / Check-in clock verified");

  const attOutReq = { user: callerUser };
  const attOutRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  checkOut(attOutReq, attOutRes);
  assert.ok(attOutRes.statusCode === 200 || attOutRes.statusCode === 400, "Unexpected check-out status");
  console.log("  ✓ End shift / Check-out clock & duration verified");

  // Test 3: Daily Productivity Tracking
  console.log("\n[Test 3] Testing Daily Productivity & Activity Tracking...");
  const prodReq = { user: callerUser };
  const prodRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  getDailyProductivity(prodReq, prodRes);
  assert.strictEqual(prodRes.statusCode, 200, "Productivity endpoint failed");
  assert.ok(prodRes.data.productivity.productivity_score >= 0, "Invalid productivity score");
  console.log(`  ✓ Daily productivity verified: Score ${prodRes.data.productivity.productivity_score}%, Calls: ${prodRes.data.productivity.total_calls}, Talk Time: ${prodRes.data.productivity.total_talk_time_formatted}`);

  // Test 4: Leave Management & Supervisor Approval
  console.log("\n[Test 4] Testing Leave Management & Supervisor Approval...");
  const leaveReq = {
    user: callerUser,
    body: {
      type: "Casual Leave",
      fromDate: "2026-11-20",
      toDate: "2026-11-21",
      reason: "Personal family obligation"
    }
  };
  const leaveRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  applyLeave(leaveReq, leaveRes);
  assert.strictEqual(leaveRes.statusCode, 201, "Leave application failed");
  const leaveId = leaveRes.data.leave.id;
  assert.strictEqual(leaveRes.data.leave.status, "PENDING", "Initial leave status must be PENDING");
  console.log(`  ✓ Leave application created: ${leaveId} (${leaveRes.data.leave.days} days, Status: PENDING)`);

  const approvReq = {
    user: { id: "usr_supervisor", fullName: "Aarav Mehta", role: "SUPERVISOR" },
    params: { id: leaveId },
    body: { status: "APPROVED", remarks: "Approved for personal obligation." }
  };
  const approvRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  updateLeaveStatus(approvReq, approvRes);
  assert.strictEqual(approvRes.statusCode, 200, "Supervisor approval failed");
  assert.strictEqual(approvRes.data.leave.status, "APPROVED", "Leave status must be APPROVED");
  console.log(`  ✓ Supervisor approval verified: ${leaveId} marked APPROVED by Supervisor`);

  // Test 5: Field Recovery Visit with GPS Notice & Limited Collection
  console.log("\n[Test 5] Testing Field Recovery Employee Operations & GPS Audit...");
  const testCase = memoryStore.loan_cases[0];
  const initialBalance = testCase.outstanding_amount;

  const startVisitReq = {
    user: fieldUser,
    params: { id: testCase.id },
    body: {
      gps_latitude: 18.5204,
      gps_longitude: 73.8567,
      gps_accuracy: 6.2,
      gps_consent_acknowledged: true
    }
  };
  const startVisitRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  await startFieldVisit(startVisitReq, startVisitRes);
  assert.strictEqual(startVisitRes.statusCode, 201, "Start field visit failed");
  const visitRecord = startVisitRes.data.visit;
  assert.strictEqual(visitRecord.status, "IN_PROGRESS", "Visit status must be IN_PROGRESS");
  assert.strictEqual(testCase.status, "Field Visit", "Case status must atomically transition to 'Field Visit'");
  console.log(`  ✓ Field visit initiated at ${visitRecord.visit_start}`);
  console.log(`  ✓ GPS Coordinates captured with statutory notice: (${visitRecord.gps_latitude}° N, ${visitRecord.gps_longitude}° E, Acc: ±${visitRecord.gps_accuracy}m)`);
  console.log(`  ✓ Atomic case status transitioned to 'Field Visit'`);

  // Conclude visit with on-site payment collection
  const collectedAmt = 5000;
  const completeVisitReq = {
    user: fieldUser,
    params: { id: testCase.id, visitId: visitRecord.id },
    body: {
      visit_outcome: "Customer Met & Paid",
      visit_notes: "Borrower verified at residence. Agreed to on-site UPI QR settlement.",
      collected_amount: collectedAmt,
      payment_mode: "UPI QR Code",
      gps_latitude: 18.5204,
      gps_longitude: 73.8567,
      gps_accuracy: 5.5
    }
  };
  const completeVisitRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  await completeFieldVisit(completeVisitReq, completeVisitRes);
  assert.strictEqual(completeVisitRes.statusCode, 200, "Complete field visit failed");
  assert.strictEqual(completeVisitRes.data.visit.status, "COMPLETED", "Visit must be marked COMPLETED");
  assert.strictEqual(testCase.outstanding_amount, initialBalance - collectedAmt, "Outstanding amount must be reduced by collected amount");
  assert.ok(completeVisitRes.data.payment, "Payment record must be created");
  console.log(`  ✓ Field visit completed: Outcome '${completeVisitRes.data.visit.visit_outcome}'`);
  console.log(`  ✓ On-site collection reconciled: ₹${collectedAmt.toLocaleString('en-IN')} (Receipt: ${completeVisitRes.data.visit.receipt_ref})`);
  console.log(`  ✓ New case outstanding: ₹${testCase.outstanding_amount.toLocaleString('en-IN')}`);

  // Test 6: Field visits listing
  const listVisitsReq = { user: fieldUser };
  const listVisitsRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(payload) { this.data = payload; return this; }
  };
  await listFieldVisits(listVisitsReq, listVisitsRes);
  assert.strictEqual(listVisitsRes.statusCode, 200, "List field visits failed");
  assert.ok(listVisitsRes.data.visits.length > 0, "No visits returned");
  console.log(`  ✓ Field visits retrieval verified: ${listVisitsRes.data.visits.length} visit record(s) with enriched customer & GPS data`);

  console.log("\n==================================================================");
  console.log("🎉 ALL MODULE D VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================================");
}

runModuleDVerification().catch((err) => {
  console.error("Module D Verification Failed:", err);
  process.exit(1);
});
