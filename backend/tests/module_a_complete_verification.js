import assert from "node:assert";
import { initializeDatabase, db, memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import {
  previewRuleAllocation,
  executeRuleAllocation,
  assignCase,
  bulkAssignCases,
  transferCase,
  getTransferHistory,
  setRecoveryTarget,
  listRecoveryTargets,
  setFollowUpDate,
  updateCaseStatus
} from "../controllers/caseController.js";
import {
  getImportTemplate,
  previewUpload,
  confirmUpload,
  downloadErrorRecords
} from "../controllers/uploadController.js";
import * as XLSX from "xlsx";

const mockReq = (overrides = {}) => ({
  user: {
    id: "usr_admin_01",
    fullName: "System Admin",
    name: "System Admin",
    role: "ADMIN",
    employeeId: "PM-ADMIN-0001"
  },
  body: {},
  params: {},
  query: {},
  ...overrides
});

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
    },
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    }
  };
  return res;
};

const runModuleATests = async () => {
  console.log("======================================================================");
  console.log("🧪 Running PayMagic Module A — Comprehensive Verification Suite");
  console.log("======================================================================");

  // 1. Initialize DB with seed
  await initializeDatabase();
  assert(memoryStore.loan_cases.length >= 200, "Must seed initial 200 cases");
  assert(memoryStore.users.length >= 5, "Must seed users");
  console.log("✓ Database initialized with seed cases and RBAC accounts.");

  // 2. Test Download Import Template (.xlsx & .csv)
  console.log("\n🧪 1. Testing Download Import Template (.xlsx & .csv)...");
  const resXlsx = mockRes();
  await getImportTemplate(mockReq({ query: { format: "xlsx" } }), resXlsx);
  assert.strictEqual(resXlsx.statusCode, 200, "Template XLSX response must be 200");
  assert(resXlsx.data instanceof Buffer, "XLSX template must return buffer");

  const resCsv = mockRes();
  await getImportTemplate(mockReq({ query: { format: "csv" } }), resCsv);
  assert.strictEqual(resCsv.statusCode, 200, "Template CSV response must be 200");
  assert(typeof resCsv.data === "string" && resCsv.data.includes("Customer Name"), "CSV template must contain Customer Name header");
  console.log("✓ Downloadable template generates valid .xlsx and .csv formats with standard loan fields.");

  // 3. Test Pre-Validation & Duplicate Detection
  console.log("\n🧪 2. Testing Data Import Pre-Validation, Duplicates & Error Handling...");
  // Create test workbook with 1 valid row, 1 in-database duplicate row, 1 in-file duplicate row, 1 invalid row
  const existingCaseAccount = memoryStore.loan_cases[0].loan_account_no;
  const testUploadRows = [
    {
      "Customer Name": "Mohit Agarwal",
      "Customer Mobile Number": "9811122233",
      "Loan Account Number": "LN-NEW-TEST-001",
      "Bank / Financial Institution": "Axis Bank",
      "Total Loan Amount": 200000,
      "Outstanding Amount": 140000,
      "City": "Mumbai"
    },
    {
      "Customer Name": "Duplicate In DB Customer",
      "Customer Mobile Number": "9822233344",
      "Loan Account Number": existingCaseAccount, // In-DB duplicate!
      "Bank / Financial Institution": "HDFC Bank",
      "Total Loan Amount": 300000,
      "Outstanding Amount": 210000
    },
    {
      "Customer Name": "Duplicate In File Customer",
      "Customer Mobile Number": "9833344455",
      "Loan Account Number": "LN-NEW-TEST-001", // In-file duplicate!
      "Bank / Financial Institution": "SBI",
      "Total Loan Amount": 100000,
      "Outstanding Amount": 70000
    },
    {
      "Customer Name": "", // Invalid: Missing Name!
      "Customer Mobile Number": "123", // Invalid phone!
      "Loan Account Number": "LN-INVALID-001",
      "Bank / Financial Institution": "", // Invalid: missing lender!
      "Total Loan Amount": -500 // Invalid: negative principal!
    }
  ];

  const ws = XLSX.utils.json_to_sheet(testUploadRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import");
  const testBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const previewReq = mockReq({
    file: {
      originalname: "test_loans_batch.xlsx",
      buffer: testBuffer,
      size: testBuffer.length,
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  });
  const previewRes = mockRes();
  await previewUpload(previewReq, previewRes);

  assert.strictEqual(previewRes.statusCode, 200, "Preview must return 200");
  const previewData = previewRes.data.data;
  assert.strictEqual(previewData.total_records, 4, "Total records must be 4");
  assert.strictEqual(previewData.valid_records, 1, "Only 1 record should be valid");
  assert.strictEqual(previewData.duplicate_records, 2, "2 records must be detected as duplicates");
  assert.strictEqual(previewData.rejected_records, 1, "1 record must be rejected for schema errors");
  assert.strictEqual(previewData.can_import, true, "Valid records exist so can_import is true");
  console.log(`✓ Pre-validation correctly identified: ${previewData.valid_records} valid, ${previewData.duplicate_records} duplicates, ${previewData.rejected_records} rejected.`);

  // 4. Test Error Records Download
  console.log("\n🧪 3. Testing Download Error Records...");
  const errorDownloadRes = mockRes();
  await downloadErrorRecords(mockReq({ params: { batchId: previewData.preview_batch_id }, query: { format: "csv" } }), errorDownloadRes);
  assert.strictEqual(errorDownloadRes.statusCode, 200, "Error download must be 200");
  assert(errorDownloadRes.data.includes("Failure Reason"), "Error export must include 'Failure Reason' column");
  console.log("✓ Download error records export includes row-level failure reasons.");

  // 5. Test Confirm Import
  console.log("\n🧪 4. Testing Confirm Import & Atomic Case Creation...");
  const initialCasesCount = memoryStore.loan_cases.length;
  const initialHistoryCount = memoryStore.case_status_history.length;

  const confirmRes = mockRes();
  await confirmUpload(mockReq({ body: { preview_batch_id: previewData.preview_batch_id } }), confirmRes);
  assert.strictEqual(confirmRes.statusCode, 200, "Confirm import must succeed with 200");
  assert.strictEqual(confirmRes.data.data.success_count, 1, "Must import 1 case");
  assert.strictEqual(memoryStore.loan_cases.length, initialCasesCount + 1, "Total cases count must increment by 1");
  assert.strictEqual(memoryStore.case_status_history.length, initialHistoryCount + 1, "Status history must record intake audit row");

  const importedCase = memoryStore.loan_cases.find(c => c.loan_account_no === "LN-NEW-TEST-001");
  assert(importedCase, "Imported case must exist in database");
  assert.strictEqual(importedCase.status, "New", "Imported case initial status must be 'New'");
  console.log("✓ Import confirmed: case created atomically with initial intake audit record.");

  // 6. Test Single & Bulk Manual Assignment
  console.log("\n🧪 5. Testing Manual Single & Bulk Assignment...");
  const targetCaller = memoryStore.users.find(u => u.role === "CALLER");
  assert(targetCaller, "Must find active caller");

  const assignRes = mockRes();
  await assignCase(mockReq({ params: { caseId: importedCase.id }, body: { employeeId: targetCaller.id } }), assignRes);
  assert.strictEqual(assignRes.statusCode, 200, "Assign case must succeed");
  assert.strictEqual(importedCase.assigned_employee_id, targetCaller.id, "Case assigned employee ID must be updated");
  assert.strictEqual(importedCase.status, "Assigned", "Case status must automatically transition from 'New' to 'Assigned'");

  // Bulk manual assign
  const unassignedCases = memoryStore.loan_cases.filter(c => c.status === "New" && c.id !== importedCase.id).slice(0, 3);
  const bulkReq = mockReq({
    body: {
      mode: "manual",
      employeeId: targetCaller.id,
      caseIds: unassignedCases.map(c => c.id)
    }
  });
  const bulkRes = mockRes();
  await bulkAssignCases(bulkReq, bulkRes);
  assert.strictEqual(bulkRes.statusCode, 200, "Bulk assign must succeed");
  assert.strictEqual(bulkRes.data.data.assigned_count, unassignedCases.length, "All requested cases must be assigned");
  console.log("✓ Manual single & bulk assignment transition cases from 'New' to 'Assigned' with assignment tracking.");

  // 7. Test Rule-Based Allocation Engine (Preview & Execute)
  console.log("\n🧪 6. Testing Rule-Based Automatic Allocation Engine...");
  const rulePreviewReq = mockReq({
    body: {
      strategy: "AMOUNT_BALANCED",
      rules: { minAmount: 10000 },
      limit: 10
    }
  });
  const rulePreviewRes = mockRes();
  await previewRuleAllocation(rulePreviewReq, rulePreviewRes);
  assert.strictEqual(rulePreviewRes.statusCode, 200, "Rule allocation preview must return 200");
  const allocData = rulePreviewRes.data.data;
  assert(allocData.preview_id, "Preview must return preview_id");
  assert(allocData.allocations.length > 0, "Preview must return employee allocations breakdown");
  assert(allocData.total_cases_selected > 0, "Preview must select cases");
  console.log(`✓ Rule-based preview generated: ${allocData.total_cases_selected} cases balanced across ${allocData.allocations.length} staff members.`);

  // Execute allocation preview
  const executeReq = mockReq({
    body: { preview_id: allocData.preview_id }
  });
  const executeRes = mockRes();
  await executeRuleAllocation(executeReq, executeRes);
  assert.strictEqual(executeRes.statusCode, 200, "Rule allocation execute must return 200");
  assert.strictEqual(executeRes.data.data.total_assigned, allocData.total_cases_selected, "All previewed cases must be assigned");
  console.log("✓ Rule-based allocation executed atomically across team members.");

  // Test PRIORITY_BASED and OVERDUE_BUCKET strategies
  const priorityPreviewRes = mockRes();
  await previewRuleAllocation(mockReq({ body: { strategy: "PRIORITY_BASED", limit: 5 } }), priorityPreviewRes);
  assert.strictEqual(priorityPreviewRes.statusCode, 200, "Priority-based preview must return 200");
  assert(priorityPreviewRes.data.data.allocations.length > 0, "Priority allocation must have allocations");

  const overduePreviewRes = mockRes();
  await previewRuleAllocation(mockReq({ body: { strategy: "OVERDUE_BUCKET", limit: 5 } }), overduePreviewRes);
  assert.strictEqual(overduePreviewRes.statusCode, 200, "Overdue bucket preview must return 200");
  console.log("✓ Priority-Based and Overdue Bucket allocation strategies verified.");

  // 8. Test Case Transfer Between Employees
  console.log("\n🧪 7. Testing Case Transfer & Transfer History...");
  const targetSupervisor = memoryStore.users.find(u => u.role === "SUPERVISOR");
  assert(targetSupervisor, "Must find supervisor");

  const transferReq = mockReq({
    params: { caseId: importedCase.id },
    body: {
      toEmployeeId: targetSupervisor.id,
      reason: "Complex legal dispute escalation"
    }
  });
  const transferRes = mockRes();
  await transferCase(transferReq, transferRes);
  assert.strictEqual(transferRes.statusCode, 200, "Transfer must succeed");
  assert.strictEqual(importedCase.assigned_employee_id, targetSupervisor.id, "Case assigned employee must now be target supervisor");

  // Verify transfer history
  const historyRes = mockRes();
  await getTransferHistory(mockReq({}), historyRes);
  assert.strictEqual(historyRes.statusCode, 200, "Transfer history must return 200");
  const transfersList = historyRes.data.data.transfers;
  assert(transfersList.length > 0, "Transfer history must contain at least 1 transfer");
  const lastTransfer = transfersList.find(t => t.case_id === importedCase.id);
  assert(lastTransfer, "Transferred case must be recorded in transfer history");
  assert.strictEqual(lastTransfer.remarks, "Complex legal dispute escalation", "Transfer reason must be recorded");
  console.log("✓ Case transfer completed and verified in immutable transfer history.");

  // 9. Test Recovery Targets & Tracking
  console.log("\n🧪 8. Testing Recovery Targets Setting & Retrieval...");
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const targetReq = mockReq({
    body: {
      employeeId: targetCaller.id,
      month: currentMonth,
      year: currentYear,
      target_amount: 150000
    }
  });
  const targetRes = mockRes();
  await setRecoveryTarget(targetReq, targetRes);
  assert([200, 201].includes(targetRes.statusCode), "Set target must succeed with 200 or 201");

  const listTargetsRes = mockRes();
  await listRecoveryTargets(mockReq({ query: { month: currentMonth, year: currentYear } }), listTargetsRes);
  assert.strictEqual(listTargetsRes.statusCode, 200, "List targets must succeed");
  const callerTargetEntry = listTargetsRes.data.data.employee_targets.find(e => e.user_id === targetCaller.id);
  assert(callerTargetEntry, "Caller target entry must exist");
  assert.strictEqual(callerTargetEntry.target_amount, 150000, "Target amount must match 150000");
  assert(callerTargetEntry.remaining_target !== undefined, "Remaining target must be calculated");
  assert(callerTargetEntry.achievement_percentage !== undefined, "Achievement percentage must be calculated");
  console.log("✓ Recovery target successfully set and verified in team target roster.");

  // Test Team-wide target setting
  const teamTargetRes = mockRes();
  await setRecoveryTarget(mockReq({
    body: { employeeId: "ALL", month: currentMonth, year: currentYear, target_amount: 200000 }
  }), teamTargetRes);
  assert.strictEqual(teamTargetRes.statusCode, 200, "Team target setting must succeed");
  assert(teamTargetRes.data.data.targets.length > 0, "Team targets must be set for all active staff");
  console.log(`✓ Team-wide recovery target set across all ${teamTargetRes.data.data.targets.length} active specialists.`);

  // 10. Test Follow-up Scheduling
  console.log("\n🧪 9. Testing Follow-up Date Scheduling...");
  const followUpDate = new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0];
  const followUpRes = mockRes();
  await setFollowUpDate(mockReq({ params: { caseId: importedCase.id }, body: { follow_up_date: followUpDate } }), followUpRes);
  assert.strictEqual(followUpRes.statusCode, 200, "Set follow up must succeed");
  assert.strictEqual(importedCase.follow_up_date, followUpDate, "Follow-up date must be updated");
  console.log(`✓ Follow-up date scheduled for ${followUpDate}.`);

  // 11. Test Critical Status Transition & Business Rule 10 (Closed vs Fully Paid)
  console.log("\n🧪 10. Testing Case Status Management & Business Rule 10...");
  // Test mandatory remarks enforcement
  const invalidStatusReq = mockReq({
    params: { caseId: importedCase.id },
    body: { newStatus: "Disputed", remarks: "" } // Missing mandatory remarks!
  });
  const invalidStatusRes = mockRes();
  await updateCaseStatus(invalidStatusReq, invalidStatusRes);
  assert.strictEqual(invalidStatusRes.statusCode, 400, "Mandatory remarks for 'Disputed' must be enforced");

  // Valid status transition to Disputed with remarks
  const validStatusReq = mockReq({
    params: { caseId: importedCase.id },
    body: { newStatus: "Disputed", remarks: "Customer disputed late payment fee calculation" }
  });
  const validStatusRes = mockRes();
  await updateCaseStatus(validStatusReq, validStatusRes);
  assert.strictEqual(validStatusRes.statusCode, 200, "Valid transition to Disputed must succeed");
  assert.strictEqual(importedCase.status, "Disputed");

  // Business Rule 10 verification:
  // "10. Closed must not automatically mean Fully Paid; allow authorized closure with a recorded reason."
  const originalOutstanding = importedCase.outstanding_amount;
  assert(originalOutstanding > 0, "Case must have positive outstanding amount");

  const closeReq = mockReq({
    params: { caseId: importedCase.id },
    body: { newStatus: "Closed", remarks: "Administrative settlement closed under hardship program" }
  });
  const closeRes = mockRes();
  await updateCaseStatus(closeReq, closeRes);
  assert.strictEqual(closeRes.statusCode, 200, "Close status transition must succeed");
  assert.strictEqual(importedCase.status, "Closed");
  assert.strictEqual(importedCase.is_closed, true, "is_closed flag must be true");
  assert.strictEqual(importedCase.outstanding_amount, originalOutstanding, "Business Rule 10: 'Closed' must NOT zero out outstanding balance!");

  // Transition to Fully Paid: DOES zero out outstanding balance
  const paidReq = mockReq({
    params: { caseId: importedCase.id },
    body: { newStatus: "Fully Paid", remarks: "Full settlement received via RTGS", payment_ref: "RTGS-998877" }
  });
  const paidRes = mockRes();
  await updateCaseStatus(paidReq, paidRes);
  assert.strictEqual(paidRes.statusCode, 200, "Fully Paid status transition must succeed");
  assert.strictEqual(importedCase.status, "Fully Paid");
  assert.strictEqual(importedCase.outstanding_amount, 0, "Fully Paid must zero out outstanding balance");
  console.log("✓ Business Rule 10 Verified: 'Closed' preserves balance; 'Fully Paid' zeroes out balance.");

  // 12. Test Role-Based Security: Caller cannot update unassigned case
  console.log("\n🧪 11. Testing RBAC Security & Case Access Enforcement...");
  const callerUser = memoryStore.users.find(u => u.role === "CALLER");
  const anotherCase = memoryStore.loan_cases.find(c => c.assigned_employee_id !== callerUser.id);
  assert(anotherCase, "Must find case not assigned to caller");

  const unauthorizedReq = mockReq({
    user: callerUser,
    params: { caseId: anotherCase.id },
    body: { newStatus: "Contacted" }
  });
  const unauthorizedRes = mockRes();
  await updateCaseStatus(unauthorizedReq, unauthorizedRes);
  assert.strictEqual(unauthorizedRes.statusCode, 403, "Caller must be forbidden from updating unassigned case");
  console.log("✓ RBAC Security Verified: Callers are strictly blocked from altering other staff's cases.");

  console.log("\n======================================================================");
  console.log("🎉 ALL MODULE A VERIFICATION TESTS PASSED (11/11)");
  console.log("======================================================================");
};

runModuleATests().catch(err => {
  console.error("❌ Module A Verification Failed:", err);
  process.exit(1);
});
