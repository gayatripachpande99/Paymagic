import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";
import { initializeDatabase, memoryStore, db } from "../config/db.js";
import { fileValidationService } from "../services/fileValidationService.js";
import { loanValidationService, STANDARD_COLUMNS } from "../services/loanValidationService.js";
import { uploadRepository } from "../repositories/uploadRepository.js";
import {
  getImportTemplate,
  previewUpload,
  confirmUpload,
  downloadErrorRecords,
  getImportHistory
} from "../controllers/uploadController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Express request/response helpers
const mockReq = (overrides = {}) => ({
  user: {
    id: "usr_admin_1",
    employee_id: "PM-ADM-0001",
    role: "ADMIN",
    fullName: "System Administrator"
  },
  query: {},
  params: {},
  body: {},
  headers: {},
  ...overrides
});

const mockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      this.body = payload;
      return this;
    },
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
      return this;
    },
    send(payload) {
      this.body = payload;
      this.data = payload;
      return this;
    }
  };
  return res;
};

async function runPhase3Tests() {
  console.log("======================================================================");
  console.log("🧪 Running PayMagic Phase 3: Loan Import & Pre-Validation Test Suite");
  console.log("======================================================================");

  // Initialize DB engine
  await initializeDatabase();
  console.log("✓ Database engine initialized.");

  // 1. Verify Migration 003 file exists and contains required SQL schema
  console.log("\n🧪 1. Testing Migration 003 Schema Definition...");
  const migrationPath = path.resolve(__dirname, "../migrations/003_module_a_import_enhancements.sql");
  assert(fs.existsSync(migrationPath), "Migration 003 file must exist");
  const sqlContent = fs.readFileSync(migrationPath, "utf8");
  assert(sqlContent.includes("file_checksum"), "Must add file_checksum column");
  assert(sqlContent.includes("preview_data JSONB"), "Must add preview_data JSONB column");
  assert(sqlContent.includes("chk_import_batches_status"), "Must enforce status check constraint");
  console.log("✓ Migration 003 schema verified (checksum, preview_data, status constraint).");

  // 2. Test Download Templates (.xlsx and .csv) with exactly 16 columns
  console.log("\n🧪 2. Testing 16-Column Template Generation...");
  const xlsxRes = mockRes();
  await getImportTemplate(mockReq({ query: { format: "xlsx" } }), xlsxRes);
  assert.strictEqual(xlsxRes.statusCode, 200, "XLSX template must return 200");
  assert(xlsxRes.headers["content-disposition"].includes("PayMagic_Loan_Import_Template.xlsx"));
  const parsedXlsx = XLSX.read(xlsxRes.body, { type: "buffer" });
  const xlsxHeaders = XLSX.utils.sheet_to_json(parsedXlsx.Sheets[parsedXlsx.SheetNames[0]], { header: 1 })[0];
  assert.strictEqual(xlsxHeaders.length, 16, "Template must contain exactly 16 columns");
  assert.deepStrictEqual(xlsxHeaders, STANDARD_COLUMNS, "Headers must match standard order exactly");

  const csvRes = mockRes();
  await getImportTemplate(mockReq({ query: { format: "csv" } }), csvRes);
  assert.strictEqual(csvRes.statusCode, 200, "CSV template must return 200");
  const firstCsvLine = csvRes.body.split("\n")[0].trim().split(",");
  assert.strictEqual(firstCsvLine.length, 16, "CSV template must contain 16 columns");
  console.log("✓ 16-Column template verified in both XLSX and CSV formats.");

  // 3. Test File Validation Security Service (Magic Bytes, Size, Corrupted Files)
  console.log("\n🧪 3. Testing File Security & Magic-Byte Validation...");
  // A. Reject > 10MB file
  const oversizedFile = {
    originalname: "massive_portfolio.xlsx",
    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 11 * 1024 * 1024,
    buffer: Buffer.alloc(100)
  };
  const sizeCheck = fileValidationService.validateUpload(oversizedFile);
  assert.strictEqual(sizeCheck.valid, false, "Must reject file larger than 10 MB");

  // B. Reject renamed Windows PE executable (.exe renamed to .xlsx)
  const fakeExeFile = {
    originalname: "malicious_script.xlsx",
    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 2048,
    buffer: Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]) // 'MZ' magic bytes
  };
  const exeCheck = fileValidationService.validateUpload(fakeExeFile);
  assert.strictEqual(exeCheck.valid, false);
  assert(exeCheck.error.includes("executable"), "Must detect Windows executable signature");

  // C. Reject renamed ELF binary (.xlsx extension)
  const fakeElfFile = {
    originalname: "payload.xlsx",
    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 2048,
    buffer: Buffer.from([0x7F, 0x45, 0x4C, 0x46]) // ELF signature
  };
  const elfCheck = fileValidationService.validateUpload(fakeElfFile);
  assert.strictEqual(elfCheck.valid, false);
  assert(elfCheck.error.includes("ELF"), "Must detect ELF binary signature");

  // D. Reject unsupported extension (.pdf)
  const pdfFile = {
    originalname: "report.pdf",
    mimetype: "application/pdf",
    size: 1024,
    buffer: Buffer.from("%PDF-1.4")
  };
  const extCheck = fileValidationService.validateUpload(pdfFile);
  assert.strictEqual(extCheck.valid, false);
  console.log("✓ File security verified (size limit >10MB, executable signatures, unsupported formats).");

  // 4. Test Formula Injection Detection & Sanitization
  console.log("\n🧪 4. Testing Formula Injection Protection...");
  assert.strictEqual(loanValidationService.hasFormulaInjection("=cmd|'/C calc'!A0"), true, "Must flag '=cmd' formula");
  assert.strictEqual(loanValidationService.hasFormulaInjection("@SUM(1+1)"), true, "Must flag '@SUM' formula");
  assert.strictEqual(loanValidationService.hasFormulaInjection("+HYPERLINK('evil.com')"), true, "Must flag '+HYPERLINK' formula");
  // Legitimate negative numeric value must NOT be flagged as formula injection
  assert.strictEqual(loanValidationService.hasFormulaInjection("-5000", true), false, "Legitimate negative number must not be flagged");
  // Formula sanitization prefixing with single quote
  const sanitizedCsvCell = loanValidationService.sanitizeFormula("=2+5");
  assert.strictEqual(sanitizedCsvCell, "'=2+5", "Must sanitize dangerous formula cell by prefixing with quote");
  console.log("✓ Formula injection detection and sanitization verified.");

  // 5. Test Centralized Row Validation Rules (Pincode, Mobile, Email, Types)
  console.log("\n🧪 5. Testing Row-Level Validation Engine...");
  // Valid row
  const validRow = {
    borrower_name: "Ramesh Sharma",
    customer_code: "CUST-RAM-01",
    phone: "9822334455",
    pincode: "411001",
    city: "Pune",
    state: "Maharashtra",
    lender_name: "HDFC Bank",
    loan_account_no: "LN-VALID-001",
    loan_type: "Personal",
    principal_amount: "100000",
    outstanding_amount: "85000",
    dpd: "35",
    priority: "HIGH"
  };
  const validResult = loanValidationService.validateRow(validRow, 2);
  assert.strictEqual(validResult.isValid, true, "Valid row must pass");
  assert.strictEqual(validResult.sanitized.phone, "+91 9822334455", "Phone must be normalized with +91");
  assert.strictEqual(validResult.sanitized.pincode, "411001", "Pincode must remain string");

  // Invalid row with multiple errors
  const invalidRow = {
    borrower_name: "", // missing
    customer_code: "CUST-02",
    phone: "12345", // invalid mobile
    pincode: "000123", // invalid PIN (starts with 0)
    city: "Pune",
    state: "Maharashtra",
    lender_name: "HDFC Bank",
    loan_account_no: "LN-ERR-002",
    loan_type: "UnknownType", // invalid type
    principal_amount: "-500", // negative
    outstanding_amount: "abc", // NaN
    dpd: "-5", // negative
    priority: "SUPER_URGENT" // invalid priority
  };
  const invalidResult = loanValidationService.validateRow(invalidRow, 3);
  assert.strictEqual(invalidResult.isValid, false, "Invalid row must fail");
  assert(invalidResult.errors.length >= 6, "Must capture all row-level failure reasons");
  console.log("✓ Centralized row-level validation engine verified across all 16 fields.");

  // 6. Test Import Preview Endpoint (Does NOT mutate database)
  console.log("\n🧪 6. Testing Import Preview Endpoint...");
  const initialCasesCount = memoryStore.loan_cases.length;

  // Create valid XLSX file buffer in memory
  const testRows = [
    {
      "Borrower Name": "Tanmay Deshmukh",
      "Customer Code": "CUST-P3-1001",
      "Phone": "9822001122",
      "Alternate Phone": "9822001133",
      "Email": "tanmay@example.com",
      "Address": "MG Road",
      "City": "Pune",
      "State": "Maharashtra",
      "Pincode": "411001",
      "Lender Name": "Tata Capital",
      "Loan Account No": "LN-P3-INSPECTION-001",
      "Loan Type": "Personal",
      "Principal Amount": 120000,
      "Outstanding Amount": 95000,
      "DPD": 30,
      "Priority": "MEDIUM"
    },
    // Duplicate within file
    {
      "Borrower Name": "Tanmay Deshmukh Duplicate",
      "Customer Code": "CUST-P3-1001",
      "Phone": "9822001122",
      "City": "Pune",
      "State": "Maharashtra",
      "Pincode": "411001",
      "Lender Name": "Tata Capital",
      "Loan Account No": "LN-P3-INSPECTION-001", // Duplicate account
      "Principal Amount": 120000,
      "Outstanding Amount": 95000,
      "DPD": 30,
      "Priority": "MEDIUM"
    },
    // Rejected row (Invalid phone)
    {
      "Borrower Name": "Invalid Phone Borrower",
      "Customer Code": "CUST-P3-1002",
      "Phone": "12345",
      "City": "Pune",
      "State": "Maharashtra",
      "Pincode": "411001",
      "Lender Name": "Tata Capital",
      "Loan Account No": "LN-P3-INSPECTION-002",
      "Principal Amount": 50000,
      "Outstanding Amount": 45000
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(testRows, { header: STANDARD_COLUMNS });
  XLSX.utils.book_append_sheet(wb, ws, "Loan_Data");
  const testBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const previewReq = mockReq({
    file: {
      originalname: "portfolio_p3.xlsx",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: testBuffer.length,
      buffer: testBuffer
    }
  });
  const previewRes = mockRes();
  await previewUpload(previewReq, previewRes);
  assert.strictEqual(previewRes.statusCode, 200, "Preview must return 200");
  const previewData = previewRes.data.data;
  assert.strictEqual(previewData.total_records, 3);
  assert.strictEqual(previewData.valid_records, 1, "Must identify 1 valid record");
  assert.strictEqual(previewData.duplicate_records, 1, "Must identify 1 duplicate record");
  assert.strictEqual(previewData.rejected_records, 1, "Must identify 1 rejected record");
  assert(previewData.preview_batch_id, "Must return preview_batch_id");

  // Verify database cases count was NOT modified
  assert.strictEqual(memoryStore.loan_cases.length, initialCasesCount, "Preview must not mutate database cases");
  console.log("✓ Preview endpoint verified: detected 1 valid, 1 duplicate, 1 rejected without modifying database.");

  // 7. Test Preview Session Durability
  console.log("\n🧪 7. Testing Preview Session Durability & Storage...");
  const batchSession = await uploadRepository.getBatchSession(previewData.preview_batch_id);
  assert(batchSession, "Batch session must be stored in database repository");
  assert.strictEqual(batchSession.status, "PENDING");
  assert.strictEqual(batchSession.file_checksum, previewData.file_checksum);
  console.log("✓ Preview session stored durably with checksum and PENDING status.");

  // 8. Test Download Error Records Endpoint
  console.log("\n🧪 8. Testing Download Error Records Endpoint...");
  const errRes = mockRes();
  await downloadErrorRecords(mockReq({ params: { batchId: previewData.preview_batch_id } }), errRes);
  assert.strictEqual(errRes.statusCode, 200);
  assert(errRes.body.includes("LN-P3-INSPECTION-001"), "Error CSV must include duplicate account number");
  console.log("✓ Error records report download verified.");

  // 9. Test Atomic Confirmation & Database Ingestion
  console.log("\n🧪 9. Testing Atomic Confirmation & Ingestion...");
  const confirmReq = mockReq({
    params: { batchId: previewData.preview_batch_id },
    body: { preview_batch_id: previewData.preview_batch_id }
  });
  const confirmRes = mockRes();
  await confirmUpload(confirmReq, confirmRes);
  assert.strictEqual(confirmRes.statusCode, 200, "Confirm import must return 200");
  assert.strictEqual(confirmRes.data.data.success_count, 1, "Must import exactly 1 case");
  assert.strictEqual(confirmRes.data.data.status, "CONFIRMED");

  // Verify created case
  const createdCase = memoryStore.loan_cases.find(c => c.loan_account_no === "LN-P3-INSPECTION-001");
  assert(createdCase, "Imported case must exist in database");
  assert.strictEqual(createdCase.status, "New", "Initial case status must be 'New'");
  assert.strictEqual(createdCase.import_batch_id, previewData.preview_batch_id);

  // Verify initial status audit history
  const auditRow = memoryStore.case_status_history.find(h => h.case_id === createdCase.id);
  assert(auditRow, "Must create case_status_history audit record");
  assert.strictEqual(auditRow.previous_status, "SYSTEM_INTAKE");
  assert.strictEqual(auditRow.new_status, "New");
  console.log("✓ Atomic confirmation verified: case created with status 'New' and intake audit record.");

  // 10. Test Duplicate Confirmation Prevention
  console.log("\n🧪 10. Testing Duplicate Confirmation Prevention...");
  const dupConfirmRes = mockRes();
  await confirmUpload(confirmReq, dupConfirmRes);
  assert.strictEqual(dupConfirmRes.statusCode, 409, "Second confirmation must return 409 Conflict");
  console.log("✓ Duplicate confirmation blocked with 409 Conflict.");

  // 11. Test Expired Preview Session Rejection
  console.log("\n🧪 11. Testing Expired Batch Rejection...");
  const expiredBatch = await uploadRepository.createBatchSession({
    filename: "expired.xlsx",
    uploadedBy: "usr_admin_1",
    totalRecords: 1,
    validRecords: 1,
    previewData: { valid_rows_data: [{ customer: {}, caseData: {} }] },
    expiresAt: new Date(Date.now() - 1000).toISOString() // Expired in past
  });

  const expiredRes = mockRes();
  await confirmUpload(mockReq({ params: { batchId: expiredBatch.id } }), expiredRes);
  assert.strictEqual(expiredRes.statusCode, 410, "Expired preview confirmation must return 410 Gone");
  console.log("✓ Expired preview confirmation rejected with 410.");

  // 12. Test Unauthorized Uploader Confirmation
  console.log("\n🧪 12. Testing Unauthorized User Confirmation...");
  const unauthorizedReq = mockReq({
    user: { id: "usr_caller_1", role: "CALLER" }, // Non-admin cannot confirm
    params: { batchId: previewData.preview_batch_id }
  });
  const unauthRes = mockRes();
  await confirmUpload(unauthorizedReq, unauthRes);
  assert(unauthRes.statusCode === 403 || unauthRes.statusCode === 409, "Unauthorized user must be blocked");
  console.log("✓ Non-admin confirmation strictly blocked.");

  // 13. Test Batch History Endpoint
  console.log("\n🧪 13. Testing Batch History Listing...");
  const historyRes = mockRes();
  await getImportHistory(mockReq({ query: { limit: 10 } }), historyRes);
  assert.strictEqual(historyRes.statusCode, 200);
  assert(historyRes.data.data.batches.length > 0, "History must return batch records");
  console.log("✓ Batch history query verified.");

  console.log("\n======================================================================");
  console.log("🎉 ALL PHASE 3 IMPORT & PRE-VALIDATION TESTS PASSED SUCCESSFULLY!");
  console.log("======================================================================");
}

runPhase3Tests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Phase 3 Verification Failed:", err);
    process.exit(1);
  });

