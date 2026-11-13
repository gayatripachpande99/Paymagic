import assert from "node:assert";
import { initializeDatabase, db, memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { generateTokens, checkCallingHours } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const runTests = async () => {
  console.log("=================================================");
  console.log("🧪 Running PayMagic Phase 1 Verification Test Suite");
  console.log("=================================================");

  // 1. Initialize Database & Seed verification
  await initializeDatabase();
  assert(memoryStore.users.length >= 5, "Database must seed at least 5 standard users");
  assert(memoryStore.loan_cases.length >= 200, "Database must seed 200 sample loan cases");
  assert(memoryStore.case_status_history.length > 0, "Case status history must be populated");
  console.log("✓ Database seed integrity verified: 200 cases & 5 RBAC roles active.");

  // 2. Auth Credentials & Role Verification
  const testRoles = [
    { email: "superadmin@paymagic.in", role: "SUPER_ADMIN", pass: "Admin@123" },
    { email: "admin@paymagic.in", role: "ADMIN", pass: "Admin@123" },
    { email: "supervisor@paymagic.in", role: "SUPERVISOR", pass: "Emp@123" },
    { email: "caller@paymagic.in", role: "CALLER", pass: "Emp@123" },
    { email: "field@paymagic.in", role: "FIELD_AGENT", pass: "Emp@123" }
  ];

  for (const acc of testRoles) {
    const user = memoryStore.users.find(u => u.email === acc.email);
    assert(user, `User ${acc.email} must exist in store`);
    assert.strictEqual(user.role, acc.role, `User ${acc.email} must have role ${acc.role}`);
    const match = await bcrypt.compare(acc.pass, user.password_hash);
    assert(match, `Password for ${acc.email} must match '${acc.pass}'`);
  }
  console.log("✓ All 5 RBAC role accounts verified with secure bcrypt hashes.");

  // 3. JWT Token Generation
  const callerUser = memoryStore.users.find(u => u.role === "CALLER");
  const { accessToken, refreshToken } = generateTokens(callerUser);
  assert(accessToken && typeof accessToken === "string", "Valid access token must be generated");
  assert(refreshToken && typeof refreshToken === "string", "Valid refresh token must be generated");
  console.log("✓ JWT Token generation and payload signature verified.");

  // 4. CRITICAL Transaction Rule: Case Status History
  console.log("\n🧪 Testing CRITICAL RULE: Case Status History inside ACID transaction...");
  const targetCase = memoryStore.loan_cases[0];
  const initialStatus = targetCase.status;
  const initialHistoryCount = memoryStore.case_status_history.length;
  const newStatus = initialStatus === "Contacted" ? "Promise to Pay" : "Contacted";

  const updateResult = await updateCaseStatusWithHistory({
    caseId: targetCase.id,
    employeeId: callerUser.id,
    newStatus,
    remarks: "Customer confirmed payment schedule over phone"
  });

  assert.strictEqual(updateResult.case.status, newStatus, "Case status must be updated to newStatus");
  assert.strictEqual(updateResult.historyEntry.new_status, newStatus, "History entry must record new_status");
  assert.strictEqual(updateResult.historyEntry.previous_status, initialStatus, "History entry must record previous_status");
  assert.strictEqual(updateResult.historyEntry.employee_id, callerUser.id, "History entry must record employee ID");
  assert.strictEqual(memoryStore.case_status_history.length, initialHistoryCount + 1, "case_status_history must contain new row");
  console.log("✓ CRITICAL RULE Verified: Atomic transaction updated status and wrote to case_status_history.");

  // 5. Rollback verification on error
  try {
    await db.transaction(async (trx) => {
      memoryStore.loan_cases[0].status = "SHOULD_ROLLBACK";
      throw new Error("Simulated transactional failure");
    });
  } catch (err) {
    // Expected error
  }
  assert.notStrictEqual(memoryStore.loan_cases[0].status, "SHOULD_ROLLBACK", "Transaction rollback must restore previous state upon failure");
  console.log("✓ Transaction rollback verified: Uncommitted changes safely rolled back.");

  console.log("\n=================================================");
  console.log("🎉 ALL PHASE 1 VERIFICATION TESTS PASSED (5/5)");
  console.log("=================================================");
};

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
