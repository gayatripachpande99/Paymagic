import assert from "assert";
import jwt from "jsonwebtoken";
import db, { memoryStore, initializeDatabase } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { caseRepository } from "../repositories/caseRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { maskCustomerByRole, maskPhone } from "../services/piiMaskingService.js";
import { runMigrations } from "../scripts/runMigrations.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
};

const mockReq = (overrides = {}) => ({
  headers: {},
  params: {},
  query: {},
  body: {},
  user: { id: "usr_admin", role: "ADMIN", full_name: "Admin Tester" },
  ...overrides
});

console.log("================================================================================");
console.log("🚀 PAYMAGIC PHASE 4.2: CRITICAL SECURITY & DATABASE REMEDIATION VERIFICATION");
console.log("================================================================================\n");

async function runTests() {
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  };

  // ============================================================================
  // GROUP 1: P0-01 - PostgreSQL Production Source of Truth & Fallback Prevention
  // ============================================================================
  console.log("📦 GROUP 1: P0-01 PostgreSQL Production Source of Truth");

  await test("1. Production startup fails immediately if DATABASE_URL is missing", async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevUrl = process.env.DATABASE_URL;
    try {
      process.env.NODE_ENV = "production";
      delete process.env.DATABASE_URL;

      let threw = false;
      try {
        await initializeDatabase();
      } catch (err) {
        threw = true;
        assert(
          err.message.includes("DATABASE_URL must be configured in production"),
          `Expected missing DATABASE_URL error message, got: ${err.message}`
        );
      }
      assert.strictEqual(threw, true, "initializeDatabase must throw fatal error in production without DATABASE_URL");
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevUrl) process.env.DATABASE_URL = prevUrl;
    }
  });

  await test("2. Production startup fails immediately if PostgreSQL connection fails", async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevUrl = process.env.DATABASE_URL;
    try {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgres://invalid_user:invalid_pass@127.0.0.1:54329/invalid_db";

      let threw = false;
      try {
        await initializeDatabase();
      } catch (err) {
        threw = true;
        assert(
          err.message.includes("Production database failure: Cannot connect to PostgreSQL"),
          `Expected fatal connection failure message, got: ${err.message}`
        );
      }
      assert.strictEqual(threw, true, "initializeDatabase must throw fatal error in production when connection fails");
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevUrl) process.env.DATABASE_URL = prevUrl;
    }
  });

  await test("3. Development environment safely boots in isolated memoryStore when no PostgreSQL", async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevUrl = process.env.DATABASE_URL;
    try {
      process.env.NODE_ENV = "development";
      delete process.env.DATABASE_URL;

      await initializeDatabase();
      assert.strictEqual(db.isPgActive(), false, "PostgreSQL should not be active without DATABASE_URL");
      assert(memoryStore.loan_cases.length > 0, "MemoryStore should be initialized with baseline seed data");
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevUrl) process.env.DATABASE_URL = prevUrl;
    }
  });

  // ============================================================================
  // GROUP 2: P0-02 - Transaction-Safe Operational Writes & Decimal Arithmetic
  // ============================================================================
  console.log("\n💳 GROUP 2: P0-02 Payment & Case Operations Persistence");

  // Create a clean test case in memoryStore for deterministic verification
  const testCaseId = `case_test_${Date.now()}`;
  const testCustomer = memoryStore.customers[0] || { id: "cust_test_01", full_name: "Rohan Sharma" };
  const testCase = {
    id: testCaseId,
    case_number: `CASE-TEST-${Date.now().toString().slice(-4)}`,
    loan_account_no: "LACC-99887766",
    customer_id: testCustomer.id,
    borrower_name: testCustomer.full_name,
    outstanding_amount: 10000.50,
    total_recovered_amount: 0,
    recovered_amount: 0,
    status: "New",
    assigned_employee_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  memoryStore.loan_cases.push(testCase);

  await test("4. Case assignment updates status from 'New' to 'Assigned' and logs audit history", async () => {
    const updated = await caseRepository.assignSingle(
      testCaseId,
      "usr_caller_1",
      "usr_admin",
      "Initial allocation for voice outreach"
    );

    assert.strictEqual(updated.assigned_employee_id, "usr_caller_1", "Employee ID must be assigned");
    assert.strictEqual(updated.status, "Assigned", "Status must transition to 'Assigned'");

    const history = memoryStore.case_status_history.filter(h => h.case_id === testCaseId);
    assert(history.length > 0, "Status audit entry must be generated");
    assert.strictEqual(history[0].new_status, "Assigned");
    assert.strictEqual(history[0].source, "Assignment");
  });

  await test("5. Case transfer reassigns employee, records transfer audit, and preserves case state", async () => {
    const transferred = await caseRepository.transferCase(
      testCaseId,
      "usr_caller_2",
      "usr_supervisor",
      "Workload rebalance across telecallers"
    );

    assert.strictEqual(transferred.assigned_employee_id, "usr_caller_2", "Employee must be transferred to usr_caller_2");
    const assignments = memoryStore.case_assignments.filter(a => a.case_id === testCaseId && a.assignment_type === "TRANSFER");
    assert(assignments.length > 0, "Transfer assignment record must be generated");
    assert.strictEqual(assignments[0].assigned_to, "usr_caller_2");
  });

  await test("6. Payment recording enforces exact decimal arithmetic and updates balance", async () => {
    const txnRef = `TXN-REM-${Date.now()}`;
    const result = await paymentRepository.recordPayment({
      caseId: testCaseId,
      collectedById: "usr_caller_2",
      amount: 4000.25,
      paymentMode: "UPI",
      transactionRef: txnRef,
      notes: "Partial payment settlement via phone QR"
    });

    assert.strictEqual(result.case.outstanding_amount, 6000.25, "Outstanding balance must be exactly 6000.25");
    assert.strictEqual(result.case.recovered_amount, 4000.25, "Recovered amount must be 4000.25");
    assert.strictEqual(result.case.status, "Partially Paid", "Status must transition to 'Partially Paid'");
    assert.strictEqual(result.payment.transaction_ref, txnRef);

    // Verify audit log
    const auditLogs = memoryStore.case_status_history.filter(h => h.case_id === testCaseId && h.source === "Payment Settlement");
    assert(auditLogs.length > 0, "Payment settlement must be audited in case_status_history");
  });

  await test("7. Duplicate transaction reference is rejected with 409 conflict error", async () => {
    const duplicateTxnRef = `TXN-DUP-${Date.now()}`;
    // First record succeeds
    await paymentRepository.recordPayment({
      caseId: testCaseId,
      collectedById: "usr_caller_2",
      amount: 500,
      paymentMode: "UPI",
      transactionRef: duplicateTxnRef
    });

    // Second record with same txnRef must throw 409 DUPLICATE_PAYMENT
    let threw = false;
    try {
      await paymentRepository.recordPayment({
        caseId: testCaseId,
        collectedById: "usr_caller_2",
        amount: 500,
        paymentMode: "UPI",
        transactionRef: duplicateTxnRef
      });
    } catch (err) {
      threw = true;
      assert.strictEqual(err.code, "DUPLICATE_PAYMENT");
      assert.strictEqual(err.statusCode, 409);
    }
    assert.strictEqual(threw, true, "Duplicate payment transaction_ref must throw DUPLICATE_PAYMENT");
  });

  await test("8. Full balance clearance transitions case status to 'Fully Paid'", async () => {
    const remainingBalance = testCase.outstanding_amount;
    const result = await paymentRepository.recordPayment({
      caseId: testCaseId,
      collectedById: "usr_caller_2",
      amount: remainingBalance,
      paymentMode: "BANK_TRANSFER",
      transactionRef: `TXN-FINAL-${Date.now()}`
    });

    assert.strictEqual(result.case.outstanding_amount, 0, "Outstanding balance must be 0");
    assert.strictEqual(result.case.status, "Fully Paid", "Status must transition to 'Fully Paid'");
  });

  // ============================================================================
  // GROUP 3: P0-03 - Strict Cryptographic JWT Verification (No jwt.decode fallback)
  // ============================================================================
  console.log("\n🔒 GROUP 3: P0-03 Strict Cryptographic JWT Verification");

  await test("9. Unsigned / forged JWT token is rejected with HTTP 401", async () => {
    // Forged unsigned token (token with role: SUPER_ADMIN signed with dummy wrong secret)
    const forgedToken = jwt.sign(
      { id: "hacker_01", role: "SUPER_ADMIN", full_name: "Attacker" },
      "malicious_attacker_key_not_matching_backend"
    );

    const req = mockReq({
      headers: { authorization: `Bearer ${forgedToken}` }
    });
    const res = mockRes();
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, "Forged token must never call next()");
    assert.strictEqual(res.statusCode, 401, "Forged token must return 401 Unauthorized");
    assert.strictEqual(res.data.success, false);
  });

  await test("10. Malformed or plain JSON string passed as Bearer token returns HTTP 401", async () => {
    const rawFakeToken = Buffer.from(JSON.stringify({ id: "fake", role: "ADMIN" })).toString("base64");
    const req = mockReq({
      headers: { authorization: `Bearer ${rawFakeToken}` }
    });
    const res = mockRes();
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
  });

  await test("11. Valid cryptographically signed JWT token passes authentication", async () => {
    const secret = "paymagic_jwt_secret_2026";
    const validToken = jwt.sign(
      { id: "usr_supervisor_01", role: "SUPERVISOR", full_name: "Authorized Supervisor" },
      secret,
      { algorithm: "HS256", expiresIn: "2h" }
    );

    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` }
    });
    const res = mockRes();
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true, "Valid signed token must successfully call next()");
    assert.strictEqual(req.user.id, "usr_supervisor_01");
    assert.strictEqual(req.user.role, "SUPERVISOR");
  });

  // ============================================================================
  // GROUP 4: P1 - PII Masking in Telephony, Evidence, and Complaints
  // ============================================================================
  console.log("\n🛡️ GROUP 4: P1 PII Masking Compliance Across Modules");

  const sampleCust = {
    id: "cust_pii_test",
    customer_code: "CUST-9900",
    full_name: "Vikramaditya Rao",
    phone_raw: "9876543210",
    phone_masked: "98XXXXXX10",
    phone: "9876543210",
    email: "vikram.rao@enterprise.com",
    address: "Flat 402, Shivajinagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411005"
  };

  await test("12. Caller without canDial cannot see raw phone in PII service", () => {
    const callerUser = { id: "caller_1", role: "CALLER", canDial: false };
    const masked = maskCustomerByRole(sampleCust, callerUser);

    assert.strictEqual(masked.phone, "98XXXXXX10", "Caller without canDial must see masked phone");
    assert.strictEqual(masked.phone_raw, "98XXXXXX10", "Caller without canDial must have phone_raw masked");
  });

  await test("13. Field agent sees masked phone and full physical address", () => {
    const fieldAgentUser = { id: "field_1", role: "FIELD_AGENT" };
    const masked = maskCustomerByRole(sampleCust, fieldAgentUser);

    assert.strictEqual(masked.phone, "98XXXXXX10", "Field agent must see masked phone");
    assert.strictEqual(masked.current_address, sampleCust.address, "Field agent must see full physical address");
    assert.strictEqual(masked.pincode, sampleCust.pincode, "Field agent must see full pincode");
  });

  await test("14. Admin role sees unmasked raw phone for regulatory compliance", () => {
    const adminUser = { id: "admin_1", role: "ADMIN" };
    const masked = maskCustomerByRole(sampleCust, adminUser);

    assert.strictEqual(masked.phone, "9876543210", "Admin must have access to full phone number");
  });

  // ============================================================================
  // GROUP 5: P1 - Advisory Locking in Database Migrations
  // ============================================================================
  console.log("\n🔒 GROUP 5: P1 Database Migration Advisory Locking");

  await test("15. runMigrations.js script contains pg_advisory_lock and pg_advisory_unlock", () => {
    const migrationScriptPath = path.resolve(__dirname, "../scripts/runMigrations.js");
    const scriptContent = fs.readFileSync(migrationScriptPath, "utf8");

    assert(
      scriptContent.includes("pg_advisory_lock"),
      "Migration script must contain pg_advisory_lock to prevent concurrent execution collisions"
    );
    assert(
      scriptContent.includes("pg_advisory_unlock"),
      "Migration script must contain pg_advisory_unlock in finally block to ensure lock release"
    );
  });

  // ============================================================================
  // GROUP 6: Production Hardening (2MB Payload Limit & Health Check Status)
  // ============================================================================
  console.log("\n⚙️ GROUP 6: Production Readiness Hardening");

  await test("16. server.js restricts global JSON body parser limit to 2MB", () => {
    const serverScriptPath = path.resolve(__dirname, "../server.js");
    const serverContent = fs.readFileSync(serverScriptPath, "utf8");

    assert(
      serverContent.includes('express.json({ limit: "2mb" })'),
      "Global express.json parser limit must be restricted to 2mb"
    );
  });

  await test("17. server.js /api/health includes explicit database engine status", () => {
    const serverScriptPath = path.resolve(__dirname, "../server.js");
    const serverContent = fs.readFileSync(serverScriptPath, "utf8");

    assert(
      serverContent.includes("POSTGRESQL_CONNECTED") && serverContent.includes("IN_MEMORY_ISOLATED"),
      "/api/health endpoint must report explicit database connectivity status"
    );
  });

  console.log("\n================================================================================");
  console.log(`🏁 VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Fatal Test Suite Execution Failure:", err);
  process.exit(1);
});
