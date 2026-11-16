import assert from "node:assert";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { initializeDatabase } from "../config/db.js";
import db, { memoryStore } from "../config/db.js";
import { paymentRepository, toPaise, fromPaise, toCurrencyNumber } from "../repositories/paymentRepository.js";
import { recoveryRepository } from "../repositories/recoveryRepository.js";
import { recoveryService } from "../services/recoveryService.js";
import { recoveryController } from "../controllers/recoveryController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("🧪 PAYMAGIC PHASE 6: RECOVERY OPERATIONS & COLLECTION TRACKING VERIFICATION");
  console.log("================================================================================\n");

  await initializeDatabase();

  const adminUser = { id: "usr_admin", role: "ADMIN", full_name: "Admin User" };
  const supervisorUser = { id: "usr_supervisor", role: "SUPERVISOR", full_name: "Supervisor Lead" };
  const callerUser = { id: "usr_caller_1", role: "CALLER", full_name: "Rahul Sharma" };

  // Setup initial test cases in memoryStore
  const testCase1 = {
    id: "case_rec_01",
    case_number: "REC-001",
    loan_account_no: "LON-REC-001",
    customer_id: "cust_rec_01",
    assigned_employee_id: "usr_caller_1",
    status: "Assigned",
    outstanding_amount: 50000.00,
    total_recovered_amount: 0.00,
    follow_up_date: null
  };

  const testCase2 = {
    id: "case_rec_02",
    case_number: "REC-002",
    loan_account_no: "LON-REC-002",
    customer_id: "cust_rec_02",
    assigned_employee_id: "usr_caller_1",
    status: "Assigned",
    outstanding_amount: 100000.00,
    total_recovered_amount: 0.00,
    follow_up_date: null
  };

  const testCustomer1 = {
    id: "cust_rec_01",
    full_name: "Ramesh Pawar",
    phone: "+91 9822001122",
    customer_code: "CUST-REC-01"
  };

  const testCustomer2 = {
    id: "cust_rec_02",
    full_name: "Sunita Deshmukh",
    phone: "+91 9822003344",
    customer_code: "CUST-REC-02"
  };

  memoryStore.loan_cases = memoryStore.loan_cases || [];
  memoryStore.customers = memoryStore.customers || [];
  memoryStore.loan_cases.push(testCase1, testCase2);
  memoryStore.customers.push(testCustomer1, testCustomer2);

  // ============================================================================
  // GROUP 1: Database Migration & Schema Integrity
  // ============================================================================
  console.log("📦 GROUP 1: Database Migration & Schema Architecture");

  await test("1. Migration 006 exists and specifies all recovery schema extensions", async () => {
    const migrationPath = path.resolve(__dirname, "../migrations/006_recovery_operations_and_collections.sql");
    assert.ok(fs.existsSync(migrationPath), "Migration 006 file must exist");
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.ok(sql.includes("case_ptp_commitments"), "Must create case_ptp_commitments table");
    assert.ok(sql.includes("customer_contacts"), "Must create customer_contacts table");
    assert.ok(sql.includes("payment_receipts"), "Must create payment_receipts table");
    assert.ok(sql.includes("reconciliation_batches"), "Must create reconciliation_batches table");
    assert.ok(sql.includes("reconciliation_records"), "Must create reconciliation_records table");
    assert.ok(sql.includes("verification_status"), "Must add verification_status to payments");
    assert.ok(sql.includes("is_reversed"), "Must add is_reversed flag to payments");
  });

  // ============================================================================
  // GROUP 2: Payment Collection & Verification Desk Workflow
  // ============================================================================
  console.log("\n📦 GROUP 2: Payment Collection & Verification Desk Workflow");

  let pendingPaymentId = null;

  await test("2. Record payment with PENDING_VERIFICATION keeps case balance unchanged", async () => {
    const res = await paymentRepository.recordPayment({
      caseId: testCase1.id,
      collectedById: callerUser.id,
      amount: 15000,
      paymentMode: "UPI",
      transactionRef: "TXN-TEST-PENDING-01",
      verificationStatus: "PENDING_VERIFICATION",
      notes: "Borrower paid via offline QR code"
    });

    pendingPaymentId = res.payment.id;
    assert.strictEqual(res.payment.verification_status, "PENDING_VERIFICATION");
    assert.strictEqual(res.case.outstanding_amount, 50000.00, "Balance must not change while pending verification");
    assert.strictEqual(res.case.total_recovered_amount, 0.00);
  });

  await test("3. Caller submission via recoveryService enters PENDING_VERIFICATION automatically", async () => {
    const res = await recoveryService.recordCollection({
      caseId: testCase2.id,
      collectedById: callerUser.id,
      userRole: callerUser.role,
      amount: 25000,
      paymentMode: "NetBanking",
      transactionRef: "TXN-CALLER-02",
      notes: "Telecaller recorded payment"
    });

    assert.strictEqual(res.payment.verification_status, "PENDING_VERIFICATION");
    assert.strictEqual(testCase2.outstanding_amount, 100000.00, "Target case balance must remain intact");
  });

  await test("4. Supervisor payment verification atomically deducts balance in integer paise", async () => {
    const res = await recoveryService.verifyPayment({
      paymentId: pendingPaymentId,
      verifiedById: supervisorUser.id,
      userRole: supervisorUser.role,
      notes: "Bank credits confirmed on statement"
    });

    assert.strictEqual(res.payment.verification_status, "VERIFIED");
    assert.strictEqual(res.case.outstanding_amount, 35000.00, "Outstanding balance must be exactly 35,000");
    assert.strictEqual(res.case.total_recovered_amount, 15000.00);
    assert.strictEqual(res.case.status, "Partially Paid");
    assert.ok(res.receipt, "Must return official receipt upon verification");
  });

  await test("5. Supervisor payment rejection marks status FAILED without altering balance", async () => {
    // Record another pending payment
    const pendingRes = await paymentRepository.recordPayment({
      caseId: testCase1.id,
      collectedById: callerUser.id,
      amount: 10000,
      paymentMode: "Cheque",
      transactionRef: "TXN-REJECT-01",
      verificationStatus: "PENDING_VERIFICATION"
    });

    const rejectRes = await recoveryService.rejectPayment({
      paymentId: pendingRes.payment.id,
      rejectedById: supervisorUser.id,
      userRole: supervisorUser.role,
      reason: "Cheque bounced due to insufficient funds"
    });

    assert.strictEqual(rejectRes.verification_status, "FAILED");
    assert.strictEqual(rejectRes.rejection_reason, "Cheque bounced due to insufficient funds");
    assert.strictEqual(testCase1.outstanding_amount, 35000.00, "Case balance must remain unchanged");
  });

  await test("6. Duplicate transaction reference rejection throws 409 Conflict", async () => {
    let duplicateRejected = false;
    try {
      await paymentRepository.recordPayment({
        caseId: testCase1.id,
        collectedById: callerUser.id,
        amount: 5000,
        paymentMode: "UPI",
        transactionRef: "TXN-TEST-PENDING-01" // Duplicate from test 2
      });
    } catch (err) {
      duplicateRejected = err.code === "DUPLICATE_PAYMENT" || err.statusCode === 409;
    }
    assert.ok(duplicateRejected, "Duplicate transaction reference must be rejected with 409");
  });

  // ============================================================================
  // GROUP 3: Exact Decimal Precision & Settlement Accounting
  // ============================================================================
  console.log("\n📦 GROUP 3: Exact Decimal Precision & Settlement Accounting");

  await test("7. Integer paise conversion eliminates IEEE-754 floating point errors", async () => {
    assert.strictEqual(toPaise("199.99"), 19999n);
    assert.strictEqual(fromPaise(19999n), "199.99");
    assert.strictEqual(toPaise("0.10") + toPaise("0.20"), 30n);
    assert.strictEqual(fromPaise(30n), "0.30");
  });

  await test("8. Partial payment balance calculation and status transition to Partially Paid", async () => {
    const res = await paymentRepository.recordPayment({
      caseId: testCase1.id,
      collectedById: adminUser.id,
      amount: 15000,
      paymentMode: "UPI",
      transactionRef: "TXN-PARTIAL-01",
      verificationStatus: "VERIFIED"
    });

    assert.strictEqual(res.case.outstanding_amount, 20000.00);
    assert.strictEqual(res.case.total_recovered_amount, 30000.00);
    assert.strictEqual(res.case.status, "Partially Paid");
  });

  await test("9. Full payment settlement clears outstanding balance and transitions to Fully Paid", async () => {
    const res = await paymentRepository.recordPayment({
      caseId: testCase1.id,
      collectedById: adminUser.id,
      amount: 20000,
      paymentMode: "NetBanking",
      transactionRef: "TXN-FULL-SETTLE-01",
      verificationStatus: "VERIFIED"
    });

    assert.strictEqual(res.case.outstanding_amount, 0.00);
    assert.strictEqual(res.case.total_recovered_amount, 50000.00);
    assert.strictEqual(res.case.status, "Fully Paid");
  });

  await test("10. Rejection of invalid or non-positive payment amounts", async () => {
    let zeroRejected = false;
    let negativeRejected = false;
    let nanRejected = false;

    try {
      await paymentRepository.recordPayment({ caseId: testCase1.id, amount: 0 });
    } catch {
      zeroRejected = true;
    }

    try {
      await paymentRepository.recordPayment({ caseId: testCase1.id, amount: -500 });
    } catch {
      negativeRejected = true;
    }

    try {
      await paymentRepository.recordPayment({ caseId: testCase1.id, amount: "INVALID" });
    } catch {
      nanRejected = true;
    }

    assert.ok(zeroRejected && negativeRejected && nanRejected, "All invalid amounts must throw validation errors");
  });

  // ============================================================================
  // GROUP 4: Tamper-Evident Receipts & Reversal Management
  // ============================================================================
  console.log("\n📦 GROUP 4: Tamper-Evident Receipts & Reversal Management");

  let verifiedPaymentToReverse = null;

  await test("11. Unverified payment receipt rejection enforces audit readiness", async () => {
    const unverifiedPay = await paymentRepository.recordPayment({
      caseId: testCase2.id,
      collectedById: callerUser.id,
      amount: 5000,
      paymentMode: "Cash",
      transactionRef: "TXN-UNVERIF-RCP",
      verificationStatus: "PENDING_VERIFICATION"
    });

    let receiptBlocked = false;
    try {
      await paymentRepository.generateReceipt({
        paymentId: unverifiedPay.payment.id,
        issuedById: supervisorUser.id
      });
    } catch (err) {
      receiptBlocked = err.message.includes("Unverified payments cannot generate");
    }
    assert.ok(receiptBlocked, "Must not generate final receipt for unverified payments");
  });

  await test("12. Verified payment generates official receipt with unique receipt number", async () => {
    const res = await paymentRepository.recordPayment({
      caseId: testCase2.id,
      collectedById: adminUser.id,
      amount: 40000,
      paymentMode: "UPI",
      transactionRef: "TXN-RCP-01",
      verificationStatus: "VERIFIED"
    });

    verifiedPaymentToReverse = res.payment;
    const receipt = await paymentRepository.getReceiptByPaymentId(res.payment.id);

    assert.ok(receipt, "Receipt must be generated");
    assert.ok(receipt.receipt_number.startsWith("RCP-PAY-"), "Receipt number must have RCP-PAY- prefix");
    assert.strictEqual(Number(receipt.amount), 40000);
    assert.strictEqual(Number(receipt.balance_after_payment), 60000);
  });

  await test("13. Receipt contains tamper-evident cryptographic signature hash", async () => {
    const receipt = await paymentRepository.getReceiptByPaymentId(verifiedPaymentToReverse.id);
    assert.ok(receipt.signature_hash, "Must contain signature_hash");
    assert.strictEqual(receipt.signature_hash.length, 64, "Must be a 64-char SHA-256 hash");
  });

  await test("14. Payment reversal atomically restores case outstanding balance in integer paise", async () => {
    const res = await recoveryService.reversePayment({
      paymentId: verifiedPaymentToReverse.id,
      reversedById: adminUser.id,
      userRole: adminUser.role,
      reason: "Chargeback filed by cardholder due to fraud"
    });

    assert.strictEqual(res.payment.is_reversed, true);
    assert.strictEqual(res.payment.verification_status, "REVERSED");
    assert.strictEqual(res.case.outstanding_amount, 100000.00, "Outstanding balance must be restored to 100,000");
    assert.strictEqual(res.case.total_recovered_amount, 0.00);
  });

  await test("15. Reversal status history audit trail is logged with exact restored balance", async () => {
    const history = memoryStore.case_status_history.filter(h => h.reference_id === verifiedPaymentToReverse.id);
    const reversalEntry = history.find(h => h.source === "Payment Reversal");
    assert.ok(reversalEntry, "Must create a status history entry for reversal");
    assert.ok(reversalEntry.remarks.includes("REVERSAL"), "Remarks must state reversal details");
  });

  await test("16. Historical payment record is never deleted on reversal", async () => {
    const payment = await paymentRepository.getPaymentById(verifiedPaymentToReverse.id);
    assert.ok(payment, "Payment record must persist in database after reversal");
    assert.strictEqual(payment.is_reversed, true);
  });

  await test("17. Reversal cannot be performed twice on already reversed payment", async () => {
    let doubleReversalBlocked = false;
    try {
      await recoveryService.reversePayment({
        paymentId: verifiedPaymentToReverse.id,
        reversedById: adminUser.id,
        userRole: adminUser.role,
        reason: "Second reversal attempt"
      });
    } catch (err) {
      doubleReversalBlocked = err.message.includes("already been reversed");
    }
    assert.ok(doubleReversalBlocked, "Double reversal must be blocked");
  });

  // ============================================================================
  // GROUP 5: Promise-to-Pay (PTP) Lifecycle & Overdue Engine
  // ============================================================================
  console.log("\n📦 GROUP 5: Promise-to-Pay (PTP) Lifecycle & Overdue Engine");

  let testPtpId = null;

  await test("18. PTP commitment creation with valid future date and positive amount", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const ptp = await recoveryService.createPTP({
      caseId: testCase2.id,
      createdById: callerUser.id,
      promisedAmount: 30000,
      promisedDate: futureDate.toISOString(),
      paymentMode: "UPI",
      remarks: "Borrower promised to pay after salary disbursement"
    });

    testPtpId = ptp.id;
    assert.strictEqual(ptp.status, "PENDING");
    assert.strictEqual(Number(ptp.promised_amount), 30000);
    const targetCase = memoryStore.loan_cases.find(c => c.id === testCase2.id);
    assert.strictEqual(targetCase.follow_up_date, futureDate.toISOString(), "Must update case follow-up date");
  });

  await test("19. PTP validation rejects negative or zero promised amount", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    let rejected = false;
    try {
      await recoveryService.createPTP({
        caseId: testCase2.id,
        createdById: callerUser.id,
        promisedAmount: 0,
        promisedDate: futureDate.toISOString()
      });
    } catch {
      rejected = true;
    }
    assert.ok(rejected, "Zero or negative PTP amount must be rejected");
  });

  await test("20. PTP validation rejects past promised date", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    let pastRejected = false;
    try {
      await recoveryService.createPTP({
        caseId: testCase2.id,
        createdById: callerUser.id,
        promisedAmount: 10000,
        promisedDate: pastDate.toISOString()
      });
    } catch (err) {
      pastRejected = err.message.includes("cannot be in the past");
    }
    assert.ok(pastRejected, "Past PTP date must be rejected");
  });

  await test("21. PTP automated broken detection marks overdue commitments as BROKEN", async () => {
    // Manually push an expired PTP into memoryStore
    const expiredPtp = {
      id: "ptp_expired_01",
      case_id: testCase2.id,
      customer_id: testCustomer2.id,
      created_by_id: callerUser.id,
      promised_amount: 15000,
      promised_date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      payment_mode: "UPI",
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.case_ptp_commitments.push(expiredPtp);

    const brokenList = await recoveryRepository.checkBrokenPTPs();
    const foundBroken = brokenList.find(b => b.id === "ptp_expired_01");
    assert.ok(foundBroken, "Expired PTP must be identified as broken");
    assert.strictEqual(expiredPtp.status, "BROKEN", "PTP status must transition to BROKEN");
  });

  await test("22. Full PTP fulfillment when verified payment matches promised amount", async () => {
    const payRes = await paymentRepository.recordPayment({
      caseId: testCase2.id,
      collectedById: adminUser.id,
      amount: 30000,
      paymentMode: "UPI",
      transactionRef: "TXN-PTP-FULFILL",
      verificationStatus: "VERIFIED"
    });

    const ptp = (memoryStore.case_ptp_commitments || []).find(p => p.id === testPtpId);
    assert.strictEqual(ptp.status, "FULFILLED");
    assert.strictEqual(ptp.fulfilled_payment_id, payRes.payment.id);
  });

  await test("23. Partial PTP fulfillment when verified payment is less than promised amount", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const newPtp = await recoveryService.createPTP({
      caseId: testCase2.id,
      createdById: callerUser.id,
      promisedAmount: 40000,
      promisedDate: futureDate.toISOString()
    });

    await paymentRepository.recordPayment({
      caseId: testCase2.id,
      collectedById: adminUser.id,
      amount: 15000, // Less than 40,000
      paymentMode: "UPI",
      transactionRef: "TXN-PTP-PARTIAL",
      verificationStatus: "VERIFIED"
    });

    const ptpRecord = (memoryStore.case_ptp_commitments || []).find(p => p.id === newPtp.id);
    assert.strictEqual(ptpRecord.status, "PARTIALLY_FULFILLED");
  });

  // ============================================================================
  // GROUP 6: Customer Omnichannel Contact History
  // ============================================================================
  console.log("\n📦 GROUP 6: Customer Omnichannel Contact History");

  await test("24. Customer contact history logging with method, outcome, and notes", async () => {
    const contact = await recoveryService.recordCustomerContact({
      caseId: testCase2.id,
      customerId: testCustomer2.id,
      contactedById: callerUser.id,
      contactMethod: "PHONE_CALL",
      outcome: "PROMISE_TO_PAY",
      discussionNotes: "Borrower agreed to settle remainder on month-end."
    });

    assert.ok(contact.id.startsWith("cnt_"));
    assert.strictEqual(contact.contact_method, "PHONE_CALL");
    assert.strictEqual(contact.outcome, "PROMISE_TO_PAY");
  });

  await test("25. Contact scheduling updates loan case next follow-up date", async () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 4);

    await recoveryService.recordCustomerContact({
      caseId: testCase2.id,
      customerId: testCustomer2.id,
      contactedById: callerUser.id,
      contactMethod: "WHATSAPP",
      outcome: "CALL_BACK",
      discussionNotes: "Borrower requested call back on Thursday",
      nextCallbackDate: nextDate.toISOString()
    });

    const targetCase = memoryStore.loan_cases.find(c => c.id === testCase2.id);
    assert.strictEqual(targetCase.follow_up_date, nextDate.toISOString());
  });

  // ============================================================================
  // GROUP 7: Bank & Gateway Reconciliation Engine
  // ============================================================================
  console.log("\n📦 GROUP 7: Bank & Gateway Reconciliation Engine");

  let reconBatchResult = null;

  await test("26. Bank statement reconciliation import and batch processing", async () => {
    const statementRows = [
      {
        bank_txn_ref: "TXN-PTP-FULFILL", // Matches existing 30,000 payment
        amount: 30000,
        txn_date: new Date().toISOString()
      },
      {
        bank_txn_ref: "TXN-PTP-PARTIAL", // Existing payment was 15,000, but statement has 12,000
        amount: 12000,
        txn_date: new Date().toISOString()
      },
      {
        bank_txn_ref: "TXN-UNKNOWN-BANK-REF", // Does not exist in payments
        amount: 8000,
        txn_date: new Date().toISOString()
      }
    ];

    reconBatchResult = await recoveryService.processStatementReconciliation({
      filename: "HDFC_Statement_Nov2026.csv",
      uploadedById: adminUser.id,
      userRole: adminUser.role,
      statementRows,
      autoReconcile: true
    });

    assert.strictEqual(reconBatchResult.totalRecords, 3);
    assert.strictEqual(reconBatchResult.totalAmount, 50000);
  });

  await test("27. Exact match reconciliation flags MATCHED status and auto-reconciles payment", async () => {
    const match = reconBatchResult.records.find(r => r.bank_txn_ref === "TXN-PTP-FULFILL");
    assert.ok(match, "Matched record must exist");
    assert.strictEqual(match.match_status, "MATCHED");

    const payment = (memoryStore.payments || []).find(p => p.transaction_ref === "TXN-PTP-FULFILL");
    assert.strictEqual(payment.reconciliation_status, "RECONCILED");
  });

  await test("28. Amount discrepancy reconciliation flags AMOUNT_MISMATCH status", async () => {
    const mismatch = reconBatchResult.records.find(r => r.bank_txn_ref === "TXN-PTP-PARTIAL");
    assert.ok(mismatch, "Mismatch record must exist");
    assert.strictEqual(mismatch.match_status, "AMOUNT_MISMATCH");
    assert.ok(mismatch.notes.includes("Amount mismatch"));
  });

  await test("29. Unmatched bank statement transaction flags UNMATCHED status", async () => {
    const unmatched = reconBatchResult.records.find(r => r.bank_txn_ref === "TXN-UNKNOWN-BANK-REF");
    assert.ok(unmatched, "Unmatched record must exist");
    assert.strictEqual(unmatched.match_status, "UNMATCHED");
  });

  // ============================================================================
  // GROUP 8: Recovery Targets, Performance, & Anti-Injection CSV Export
  // ============================================================================
  console.log("\n📦 GROUP 8: Recovery Targets, Performance, & Anti-Injection CSV Export");

  await test("30. Employee recovery target setting and progress calculation", async () => {
    memoryStore.targets = memoryStore.targets || [];
    memoryStore.targets.push({
      id: "tgt_caller_1",
      employee_id: callerUser.id,
      month_year: "2026-11",
      target_amount: 100000,
      achieved_amount: 30000
    });

    const perf = await recoveryService.getCollectorPerformance({ employeeId: callerUser.id });
    assert.ok(perf.collectors.length > 0);
    const callerPerf = perf.collectors.find(c => c.user_id === callerUser.id);
    assert.ok(callerPerf, "Caller performance profile must exist");
    assert.strictEqual(callerPerf.target_amount, 100000);
  });

  await test("31. Collector performance analytics computes reach rate and PTP fulfillment %", async () => {
    const perf = await recoveryService.getCollectorPerformance({ employeeId: callerUser.id });
    const callerPerf = perf.collectors.find(c => c.user_id === callerUser.id);
    assert.ok(callerPerf.contacts_count >= 2, "Must aggregate logged contacts");
    assert.ok(callerPerf.reach_rate >= 0 && callerPerf.reach_rate <= 100);
    assert.ok(callerPerf.ptp_fulfillment_rate >= 0 && callerPerf.ptp_fulfillment_rate <= 100);
  });

  await test("32. Anti-formula-injection CSV export sanitization prefixes unsafe characters", async () => {
    assert.strictEqual(recoveryRepository.sanitizeCsvCell("=SUM(A1:A10)"), "\"'=SUM(A1:A10)\"");
    assert.strictEqual(recoveryRepository.sanitizeCsvCell("+12345"), "\"'+12345\"");
    assert.strictEqual(recoveryRepository.sanitizeCsvCell("-CMD"), "\"'-CMD\"");
    assert.strictEqual(recoveryRepository.sanitizeCsvCell("@malicious"), "\"'@malicious\"");
    assert.strictEqual(recoveryRepository.sanitizeCsvCell("Safe Normal Text"), "\"Safe Normal Text\"");

    const csvOutput = await recoveryService.exportCollectionsCsv();
    assert.ok(csvOutput.includes("Receipt Number"), "CSV must include headers");
  });

  await test("33. RBAC enforcement prevents Callers from verifying or reversing payments", async () => {
    let verifyBlocked = false;
    let reverseBlocked = false;

    try {
      await recoveryService.verifyPayment({
        paymentId: "pay_dummy",
        verifiedById: callerUser.id,
        userRole: callerUser.role
      });
    } catch (err) {
      verifyBlocked = err.statusCode === 403;
    }

    try {
      await recoveryService.reversePayment({
        paymentId: "pay_dummy",
        reversedById: callerUser.id,
        userRole: callerUser.role,
        reason: "Unauthorized attempt"
      });
    } catch (err) {
      reverseBlocked = err.statusCode === 403;
    }

    assert.ok(verifyBlocked, "Caller cannot verify payments");
    assert.ok(reverseBlocked, "Caller cannot reverse payments");
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`📊 PHASE 6 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test runner encountered an unhandled error:", err);
  process.exit(1);
});
