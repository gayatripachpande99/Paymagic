import { v4 as uuidv4 } from "uuid";
import { memoryStore, transaction } from "../config/db.js";
import { indexService } from "../services/indexService.js";
import { cacheService } from "../services/cacheService.js";
import multer from "multer";
import * as XLSX from "xlsx";

// Multer configuration for file uploads (in-memory storage)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv"
    ];
    const allowedExts = [".xlsx", ".xls", ".csv"];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx, .xls, and .csv files are allowed."));
    }
  }
});

// In-memory store for active preview sessions
const previewStore = new Map();

/**
 * Standard column name mappings.
 * Maps various common header names to our internal field names.
 */
const COLUMN_MAPPINGS = {
  // Customer fields
  "customer name": "customer_name",
  "customer_name": "customer_name",
  "full name": "customer_name",
  "full_name": "customer_name",
  "borrower name": "customer_name",
  "borrower": "customer_name",
  "name": "customer_name",

  "phone": "phone",
  "phone number": "phone",
  "phone_number": "phone",
  "mobile": "phone",
  "mobile number": "phone",
  "mobile_number": "phone",
  "customer mobile number": "phone",
  "contact": "phone",
  "contact number": "phone",

  "alternate phone": "alternate_phone",
  "alternate_phone": "alternate_phone",
  "alt phone": "alternate_phone",
  "secondary phone": "alternate_phone",

  "email": "email",
  "email address": "email",
  "email_address": "email",

  "address": "address",
  "customer address": "address",
  "current address": "address",
  "current_address": "address",
  "residential address": "address",

  "city": "city",
  "town": "city",

  "state": "state",
  "province": "state",

  "pincode": "pincode",
  "pin code": "pincode",
  "pin_code": "pincode",
  "zip": "pincode",
  "zip code": "pincode",
  "postal code": "pincode",

  // Loan fields
  "loan account": "loan_account_no",
  "loan account no": "loan_account_no",
  "loan_account_no": "loan_account_no",
  "loan account number": "loan_account_no",
  "account number": "loan_account_no",
  "account no": "loan_account_no",
  "account_no": "loan_account_no",

  "loan id": "loan_id",
  "loan_id": "loan_id",

  "lender": "lender_name",
  "lender name": "lender_name",
  "lender_name": "lender_name",
  "bank name": "lender_name",
  "bank": "lender_name",
  "financier": "lender_name",
  "bank / financial institution": "lender_name",
  "financial institution": "lender_name",

  "loan type": "loan_type",
  "loan_type": "loan_type",
  "product": "loan_type",
  "product type": "loan_type",

  "principal": "principal_amount",
  "principal amount": "principal_amount",
  "principal_amount": "principal_amount",
  "loan amount": "principal_amount",
  "loan_amount": "principal_amount",
  "total loan amount": "principal_amount",
  "sanctioned amount": "principal_amount",
  "amount": "principal_amount",

  "outstanding": "outstanding_amount",
  "outstanding amount": "outstanding_amount",
  "outstanding_amount": "outstanding_amount",
  "balance": "outstanding_amount",
  "due amount": "outstanding_amount",
  "due_amount": "outstanding_amount",
  "total due": "outstanding_amount",

  "overdue": "overdue_amount",
  "overdue amount": "overdue_amount",
  "overdue_amount": "overdue_amount",

  "emi": "emi_amount",
  "emi amount": "emi_amount",
  "emi_amount": "emi_amount",
  "monthly emi": "emi_amount",

  "dpd": "dpd",
  "days past due": "dpd",
  "days past due (dpd)": "dpd",
  "days_past_due": "dpd",
  "overdue days": "dpd",

  "priority": "priority",
  "case priority": "priority",

  "assigned employee": "assigned_employee",
  "assigned_employee": "assigned_employee",
  "agent": "assigned_employee",

  "status": "status",
  "case status": "status",

  "follow-up date": "follow_up_date",
  "follow_up_date": "follow_up_date",
  "follow up date": "follow_up_date",

  "recovery target": "recovery_target",
  "recovery_target": "recovery_target",
  "target": "recovery_target",

  "credit score": "credit_score",
  "credit_score": "credit_score",
  "cibil": "credit_score",
  "cibil score": "credit_score",

  // Extended banking recovery fields
  "disbursed date": "disbursed_date",
  "disbursement date": "disbursed_date",
  "disbursed_date": "disbursed_date",

  "principal outstanding": "principal_outstanding",
  "principal_outstanding": "principal_outstanding",

  "interest outstanding": "interest_outstanding",
  "interest_outstanding": "interest_outstanding",

  "penalty": "penalty_amount",
  "late fees": "penalty_amount",
  "penalty amount": "penalty_amount",
  "penalty_amount": "penalty_amount",

  "emi due date": "emi_due_date",
  "due date": "emi_due_date",
  "emi_due_date": "emi_due_date",

  "bucket": "bucket",
  "stage": "bucket",
  "overdue bucket": "bucket",

  "branch": "branch_name",
  "branch name": "branch_name",
  "branch_name": "branch_name",

  "co-borrower name": "co_borrower_name",
  "co borrower name": "co_borrower_name",
  "co_borrower_name": "co_borrower_name",

  "co-borrower phone": "co_borrower_phone",
  "co borrower phone": "co_borrower_phone",
  "co_borrower_phone": "co_borrower_phone",

  "guarantor details": "guarantor_details",
  "guarantor": "guarantor_details",

  "collateral details": "collateral_details",
  "collateral": "collateral_details",

  "risk category": "risk_category",
  "customer risk category": "risk_category",
  "risk_category": "risk_category",

  "remarks": "remarks",
  "notes": "remarks",
  "case remarks": "remarks"
};

/**
 * Map raw headers to internal field names.
 */
function mapHeaders(rawHeaders) {
  const mapping = {};
  for (const header of rawHeaders) {
    const normalized = header.toString().trim().toLowerCase();
    if (COLUMN_MAPPINGS[normalized]) {
      mapping[header] = COLUMN_MAPPINGS[normalized];
    }
  }
  return mapping;
}

/**
 * Validate a single row of data.
 */
function validateRow(row, rowIndex) {
  const errors = [];

  if (!row.customer_name || row.customer_name.toString().trim().length < 2) {
    errors.push(`Row ${rowIndex}: Customer name is missing or too short.`);
  }

  const phone = row.phone ? row.phone.toString().trim() : "";
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    errors.push(`Row ${rowIndex}: Customer Mobile Number is missing or invalid (must be at least 10 digits).`);
  }

  if (!row.loan_account_no || row.loan_account_no.toString().trim().length < 3) {
    errors.push(`Row ${rowIndex}: Loan account number is missing.`);
  }

  if (!row.lender_name || row.lender_name.toString().trim().length < 2) {
    errors.push(`Row ${rowIndex}: Bank / Financial Institution name is missing.`);
  }

  const principal = parseFloat(row.principal_amount);
  if (isNaN(principal) || principal <= 0) {
    errors.push(`Row ${rowIndex}: Total Loan Amount (Principal) is invalid or must be greater than 0.`);
  }

  const outstanding = parseFloat(row.outstanding_amount);
  if (row.outstanding_amount !== undefined && row.outstanding_amount !== "" && (isNaN(outstanding) || outstanding < 0)) {
    errors.push(`Row ${rowIndex}: Outstanding amount is invalid.`);
  }

  return errors;
}

/**
 * GET /api/upload/template
 * Download official PayMagic Loan Import Template in .xlsx or .csv format.
 */
export const getImportTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();

    const templateHeaders = [
      "Customer Name",
      "Customer Mobile Number",
      "Loan Account Number",
      "Loan ID",
      "Loan Type",
      "Bank / Financial Institution",
      "Total Loan Amount",
      "Outstanding Amount",
      "Overdue Amount",
      "EMI Amount",
      "Days Past Due (DPD)",
      "Customer Address",
      "City",
      "State",
      "PIN Code",
      "Priority",
      "Follow-up Date",
      "Recovery Target"
    ];

    const sampleRows = [
      {
        "Customer Name": "Aarav Sharma",
        "Customer Mobile Number": "9876543210",
        "Loan Account Number": "LN-HDFC-9901",
        "Loan ID": "LOAN-HDFC-01",
        "Loan Type": "Personal Loan",
        "Bank / Financial Institution": "HDFC Bank",
        "Total Loan Amount": 250000,
        "Outstanding Amount": 180000,
        "Overdue Amount": 45000,
        "EMI Amount": 12500,
        "Days Past Due (DPD)": 45,
        "Customer Address": "Flat 402, Sunset Towers, Andheri West",
        "City": "Mumbai",
        "State": "Maharashtra",
        "PIN Code": "400053",
        "Priority": "HIGH",
        "Follow-up Date": new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        "Recovery Target": 50000
      },
      {
        "Customer Name": "Pooja Verma",
        "Customer Mobile Number": "9823456789",
        "Loan Account Number": "LN-ICICI-8812",
        "Loan ID": "LOAN-ICICI-02",
        "Loan Type": "Auto Loan",
        "Bank / Financial Institution": "ICICI Bank",
        "Total Loan Amount": 450000,
        "Outstanding Amount": 320000,
        "Overdue Amount": 80000,
        "EMI Amount": 18200,
        "Days Past Due (DPD)": 62,
        "Customer Address": "Plot 12, Baner Road",
        "City": "Pune",
        "State": "Maharashtra",
        "PIN Code": "411045",
        "Priority": "CRITICAL",
        "Follow-up Date": new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        "Recovery Target": 90000
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: templateHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Loan_Import_Template");

    if (format === "csv") {
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="PayMagic_Loan_Import_Template.csv"');
      return res.status(200).send(csvOutput);
    }

    const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="PayMagic_Loan_Import_Template.xlsx"');
    return res.status(200).send(xlsxBuffer);
  } catch (error) {
    console.error("getImportTemplate Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/upload/preview
 * Pre-validates uploaded Excel/CSV file without saving to database.
 * Detects duplicates, schema issues, and displays row-level errors.
 */
export const previewUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Please attach an .xlsx or .csv file." });
    }

    const { originalname, buffer, size } = req.file;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: "The uploaded file has no sheets." });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rawData.length === 0) {
      return res.status(400).json({ success: false, message: "The uploaded file contains no data rows." });
    }

    // Map headers
    const rawHeaders = Object.keys(rawData[0]);
    const headerMapping = mapHeaders(rawHeaders);
    const mappedFields = Object.values(headerMapping);

    const requiredFields = ["customer_name", "phone", "loan_account_no", "lender_name", "principal_amount"];
    const missingRequired = requiredFields.filter(f => !mappedFields.includes(f));

    if (missingRequired.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingRequired.join(", ")}. Please use the downloadable template.`,
        data: {
          detected_headers: rawHeaders,
          mapped_headers: headerMapping,
          missing_required: missingRequired
        }
      });
    }

    const previewBatchId = `prev_${uuidv4()}`;
    const validRows = [];
    const duplicateRows = [];
    const rejectedRows = [];
    const seenInFile = new Set();

    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      const rowIndex = i + 2;

      const mappedRow = {};
      for (const [rawHeader, internalField] of Object.entries(headerMapping)) {
        mappedRow[internalField] = rawRow[rawHeader];
      }

      // Check validation
      const rowErrors = validateRow(mappedRow, rowIndex);
      if (rowErrors.length > 0) {
        rejectedRows.push({
          row: rowIndex,
          reason: rowErrors.join("; "),
          data: rawRow,
          mapped: mappedRow
        });
        continue;
      }

      const loanAccount = mappedRow.loan_account_no.toString().trim();

      // Check duplicate within same file
      if (seenInFile.has(loanAccount)) {
        duplicateRows.push({
          row: rowIndex,
          loan_account_no: loanAccount,
          reason: `Duplicate loan account number '${loanAccount}' in row ${rowIndex} (appears earlier in same file).`,
          data: rawRow,
          mapped: mappedRow
        });
        continue;
      }
      seenInFile.add(loanAccount);

      // Check duplicate against database
      const existingCase = memoryStore.loan_cases.find(
        c => c.loan_account_no && c.loan_account_no.toLowerCase() === loanAccount.toLowerCase()
      );
      if (existingCase) {
        duplicateRows.push({
          row: rowIndex,
          loan_account_no: loanAccount,
          reason: `Loan account '${loanAccount}' already exists in database (Case: ${existingCase.case_number}).`,
          data: rawRow,
          mapped: mappedRow
        });
        continue;
      }

      validRows.push({
        row: rowIndex,
        data: rawRow,
        mapped: mappedRow
      });
    }

    // Cache preview session for 30 minutes
    const previewData = {
      previewBatchId,
      fileName: originalname,
      fileSizeBytes: size,
      uploaderId: req.user.id,
      uploaderName: req.user.fullName || req.user.name,
      totalRows: rawData.length,
      validRows,
      duplicateRows,
      rejectedRows,
      rawHeaders,
      headerMapping,
      createdAt: new Date().toISOString()
    };
    previewStore.set(previewBatchId, previewData);

    return res.status(200).json({
      success: true,
      message: `File analyzed: ${validRows.length} valid, ${duplicateRows.length} duplicates, ${rejectedRows.length} rejected out of ${rawData.length} rows.`,
      data: {
        preview_batch_id: previewBatchId,
        file_name: originalname,
        file_size_bytes: size,
        total_records: rawData.length,
        valid_records: validRows.length,
        duplicate_records: duplicateRows.length,
        rejected_records: rejectedRows.length,
        can_import: validRows.length > 0,
        sample_valid: validRows.slice(0, 10).map(v => v.mapped),
        error_records: [...duplicateRows, ...rejectedRows].slice(0, 30).map(e => ({
          row: e.row,
          loan_account_no: e.loan_account_no || e.mapped?.loan_account_no || "N/A",
          customer_name: e.mapped?.customer_name || e.data?.["Customer Name"] || "N/A",
          reason: e.reason
        }))
      }
    });
  } catch (error) {
    console.error("previewUpload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/upload/confirm
 * Atomically commits the pre-validated preview batch into the database.
 */
export const confirmUpload = async (req, res) => {
  try {
    const { preview_batch_id, skipDuplicates = true } = req.body;

    if (!preview_batch_id) {
      return res.status(400).json({ success: false, message: "preview_batch_id is required." });
    }

    const preview = previewStore.get(preview_batch_id);
    if (!preview) {
      return res.status(404).json({
        success: false,
        message: "Preview session expired or not found. Please upload the file again."
      });
    }

    const { validRows, duplicateRows, rejectedRows, fileName, fileSizeBytes, uploaderId, uploaderName } = preview;

    if (validRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot confirm import: Zero valid records found in preview batch."
      });
    }

    const batchId = `batch_${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const createdCases = [];

    // Atomically execute import
    await transaction(async () => {
      for (const item of validRows) {
        const mappedRow = item.mapped;
        const phone = mappedRow.phone.toString().trim();

        // Find or create customer
        let customer = memoryStore.customers.find(c => c.phone_raw === phone);
        if (!customer) {
          const custId = `cust_${uuidv4().slice(0, 8)}`;
          const maskedPhone = phone.length > 6
            ? `${phone.slice(0, Math.max(4, phone.length - 4))}****${phone.slice(-2)}`
            : phone;

          customer = {
            id: custId,
            customer_code: `CUST-IMP-${String(memoryStore.customers.length + 1).padStart(4, "0")}`,
            full_name: mappedRow.customer_name.toString().trim(),
            phone_masked: maskedPhone,
            phone_raw: phone,
            alternate_phone: mappedRow.alternate_phone ? mappedRow.alternate_phone.toString().trim() : null,
            email: mappedRow.email ? mappedRow.email.toString().trim() : null,
            current_address: mappedRow.address ? mappedRow.address.toString().trim() : null,
            city: mappedRow.city ? mappedRow.city.toString().trim() : "Unknown",
            state: mappedRow.state ? mappedRow.state.toString().trim() : "Unknown",
            pincode: mappedRow.pincode ? mappedRow.pincode.toString().trim() : null,
            credit_score: mappedRow.credit_score ? parseInt(mappedRow.credit_score, 10) || null : null
          };
          memoryStore.customers.push(customer);
        }

        const principal = parseFloat(mappedRow.principal_amount) || 0;
        const outstanding = parseFloat(mappedRow.outstanding_amount) || principal;
        const overdue = parseFloat(mappedRow.overdue_amount) || Math.round(outstanding * 0.35);
        const emi = parseFloat(mappedRow.emi_amount) || Math.round(principal / 24);
        const recovered = Math.max(0, principal - outstanding);
        const dpd = parseInt(mappedRow.dpd, 10) || 0;
        const caseCount = memoryStore.loan_cases.length + 1;

        const caseId = `case_imp_${uuidv4().slice(0, 8)}`;
        const caseNumber = `PM-LN-${new Date().getFullYear()}-IMP-${String(caseCount).padStart(5, "0")}`;

        const priority = mappedRow.priority
          ? mappedRow.priority.toString().toUpperCase()
          : (outstanding > 120000 ? "CRITICAL" : outstanding > 60000 ? "HIGH" : outstanding > 30000 ? "MEDIUM" : "LOW");

        const target = parseFloat(mappedRow.recovery_target) || Math.round(outstanding * 0.4);

        const newCase = {
          id: caseId,
          case_number: caseNumber,
          customer_id: customer.id,
          lender_name: mappedRow.lender_name.toString().trim(),
          loan_account_no: mappedRow.loan_account_no.toString().trim(),
          loan_id: mappedRow.loan_id ? mappedRow.loan_id.toString().trim() : null,
          loan_type: mappedRow.loan_type ? mappedRow.loan_type.toString().trim() : "Personal Loan",
          principal_amount: principal,
          outstanding_amount: outstanding,
          overdue_amount: overdue,
          emi_amount: emi,
          total_recovered_amount: recovered,
          dpd,
          priority,
          status: "New",
          assigned_employee_id: null,
          assigned_at: null,
          follow_up_date: mappedRow.follow_up_date || null,
          recovery_target: target,
          is_field_visit_required: false,
          import_batch_id: batchId,
          created_at: now,
          updated_at: now
        };

        memoryStore.loan_cases.push(newCase);

        // Immutable initial audit status record
        memoryStore.case_status_history.unshift({
          id: `csh_${uuidv4()}`,
          case_id: caseId,
          employee_id: req.user.id,
          previous_status: "SYSTEM_INTAKE",
          new_status: "New",
          source: "Admin",
          remarks: `Imported from file '${fileName}' (batch: ${batchId}).`,
          created_at: now
        });

        createdCases.push(newCase);
      }

      // Rebuild in-memory search index
      indexService.rebuild(memoryStore);

      // Invalidate relevant cache keys
      cacheService.delPattern("cases:*");
      cacheService.delPattern("dashboard:*");
    });

    const errorRows = [...duplicateRows, ...rejectedRows].map(e => ({
      row: e.row,
      reason: e.reason,
      data: e.data
    }));

    // Record import batch
    const importBatch = {
      id: batchId,
      uploaded_by: uploaderId,
      uploaded_by_name: uploaderName,
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      total_rows: preview.totalRows,
      success_count: createdCases.length,
      duplicate_count: duplicateRows.length,
      rejected_count: rejectedRows.length,
      fail_count: duplicateRows.length + rejectedRows.length,
      status: duplicateRows.length + rejectedRows.length === 0 ? "SUCCESS" : "PARTIAL",
      error_rows: errorRows,
      created_at: now
    };

    memoryStore.import_batches.unshift(importBatch);

    // Clean up preview session
    previewStore.delete(preview_batch_id);

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${createdCases.length} loan cases.`,
      data: {
        batch_id: batchId,
        file_name: fileName,
        total_rows: preview.totalRows,
        success_count: createdCases.length,
        duplicate_count: duplicateRows.length,
        rejected_count: rejectedRows.length,
        status: importBatch.status,
        created_cases: createdCases.slice(0, 10)
      }
    });
  } catch (error) {
    console.error("confirmUpload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/upload/errors/:batchId
 * Download CSV/Excel of rejected and duplicate rows with reasons.
 */
export const downloadErrorRecords = async (req, res) => {
  try {
    const { batchId } = req.params;
    const format = (req.query.format || "csv").toLowerCase();

    // Check if in import_batches
    let errorRows = [];
    let fileName = "loan_import_errors";

    const batch = memoryStore.import_batches.find(b => b.id === batchId);
    if (batch && batch.error_rows) {
      errorRows = batch.error_rows;
      fileName = `${batch.file_name.replace(/\.[^/.]+$/, "")}_errors`;
    } else {
      // Check in active preview store
      const preview = previewStore.get(batchId);
      if (preview) {
        errorRows = [...preview.duplicateRows, ...preview.rejectedRows];
        fileName = `${preview.fileName.replace(/\.[^/.]+$/, "")}_errors`;
      }
    }

    if (!errorRows || errorRows.length === 0) {
      return res.status(404).json({ success: false, message: "No error records found for this batch." });
    }

    const exportRows = errorRows.map(err => {
      const rowData = err.data || {};
      return {
        "Row Number": err.row,
        "Failure Reason": err.reason,
        ...rowData
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rejected_Records");

    if (format === "xlsx") {
      const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}.xlsx"`);
      return res.status(200).send(xlsxBuffer);
    }

    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}.csv"`);
    return res.status(200).send(csvOutput);
  } catch (error) {
    console.error("downloadErrorRecords Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/upload
 * Backwards-compatible direct upload.
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Please attach an .xlsx or .csv file." });
    }

    const { originalname, buffer, size } = req.file;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: "The uploaded file has no sheets." });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rawData.length === 0) {
      return res.status(400).json({ success: false, message: "The uploaded file contains no data rows." });
    }

    const rawHeaders = Object.keys(rawData[0]);
    const headerMapping = mapHeaders(rawHeaders);
    const mappedFields = Object.values(headerMapping);

    const requiredFields = ["customer_name", "phone", "loan_account_no", "lender_name", "principal_amount"];
    const missingRequired = requiredFields.filter(f => !mappedFields.includes(f));

    if (missingRequired.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingRequired.join(", ")}.`,
        data: {
          detected_headers: rawHeaders,
          mapped_headers: headerMapping,
          missing_required: missingRequired
        }
      });
    }

    const batchId = `batch_${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    let successCount = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    const errorRows = [];
    const createdCases = [];
    const seenAccounts = new Set();

    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      const rowIndex = i + 2;

      const mappedRow = {};
      for (const [rawHeader, internalField] of Object.entries(headerMapping)) {
        mappedRow[internalField] = rawRow[rawHeader];
      }

      const rowErrors = validateRow(mappedRow, rowIndex);
      if (rowErrors.length > 0) {
        rejectedCount++;
        errorRows.push({ row: rowIndex, reason: rowErrors.join("; "), data: rawRow });
        continue;
      }

      const loanAccount = mappedRow.loan_account_no.toString().trim();
      if (seenAccounts.has(loanAccount)) {
        duplicateCount++;
        errorRows.push({ row: rowIndex, reason: `Duplicate loan account '${loanAccount}' in file`, data: rawRow });
        continue;
      }
      seenAccounts.add(loanAccount);

      const existingCase = memoryStore.loan_cases.find(
        c => c.loan_account_no && c.loan_account_no.toLowerCase() === loanAccount.toLowerCase()
      );
      if (existingCase) {
        duplicateCount++;
        errorRows.push({
          row: rowIndex,
          reason: `Duplicate loan account number '${loanAccount}' in database (Case: ${existingCase.case_number}).`,
          data: rawRow
        });
        continue;
      }

      const phone = mappedRow.phone.toString().trim();
      let customer = memoryStore.customers.find(c => c.phone_raw === phone);

      if (!customer) {
        const custId = `cust_${uuidv4().slice(0, 8)}`;
        const maskedPhone = phone.length > 6
          ? `${phone.slice(0, Math.max(4, phone.length - 4))}****${phone.slice(-2)}`
          : phone;

        customer = {
          id: custId,
          customer_code: `CUST-IMP-${String(memoryStore.customers.length + 1).padStart(4, "0")}`,
          full_name: mappedRow.customer_name.toString().trim(),
          phone_masked: maskedPhone,
          phone_raw: phone,
          alternate_phone: mappedRow.alternate_phone ? mappedRow.alternate_phone.toString().trim() : null,
          email: mappedRow.email ? mappedRow.email.toString().trim() : null,
          current_address: mappedRow.address ? mappedRow.address.toString().trim() : null,
          city: mappedRow.city ? mappedRow.city.toString().trim() : "Unknown",
          state: mappedRow.state ? mappedRow.state.toString().trim() : "Unknown",
          pincode: mappedRow.pincode ? mappedRow.pincode.toString().trim() : null,
          credit_score: mappedRow.credit_score ? parseInt(mappedRow.credit_score, 10) || null : null
        };
        memoryStore.customers.push(customer);
      }

      const principal = parseFloat(mappedRow.principal_amount) || 0;
      const outstanding = parseFloat(mappedRow.outstanding_amount) || principal;
      const overdue = parseFloat(mappedRow.overdue_amount) || Math.round(outstanding * 0.35);
      const emi = parseFloat(mappedRow.emi_amount) || Math.round(principal / 24);
      const recovered = Math.max(0, principal - outstanding);
      const dpd = parseInt(mappedRow.dpd, 10) || 0;
      const caseCount = memoryStore.loan_cases.length + 1;

      const caseId = `case_imp_${uuidv4().slice(0, 8)}`;
      const caseNumber = `PM-LN-${new Date().getFullYear()}-IMP-${String(caseCount).padStart(5, "0")}`;

      const priority = mappedRow.priority
        ? mappedRow.priority.toString().toUpperCase()
        : (outstanding > 120000 ? "CRITICAL" : outstanding > 60000 ? "HIGH" : outstanding > 30000 ? "MEDIUM" : "LOW");

      const newCase = {
        id: caseId,
        case_number: caseNumber,
        customer_id: customer.id,
        lender_name: mappedRow.lender_name.toString().trim(),
        loan_account_no: mappedRow.loan_account_no.toString().trim(),
        loan_id: mappedRow.loan_id ? mappedRow.loan_id.toString().trim() : null,
        loan_type: mappedRow.loan_type ? mappedRow.loan_type.toString().trim() : "Personal Loan",
        principal_amount: principal,
        outstanding_amount: outstanding,
        overdue_amount: overdue,
        emi_amount: emi,
        total_recovered_amount: recovered,
        dpd,
        priority,
        status: "New",
        assigned_employee_id: null,
        assigned_at: null,
        follow_up_date: mappedRow.follow_up_date || null,
        recovery_target: parseFloat(mappedRow.recovery_target) || Math.round(outstanding * 0.4),
        is_field_visit_required: false,
        import_batch_id: batchId,
        created_at: now,
        updated_at: now
      };

      memoryStore.loan_cases.push(newCase);

      memoryStore.case_status_history.unshift({
        id: `csh_${uuidv4()}`,
        case_id: caseId,
        employee_id: req.user.id,
        previous_status: "SYSTEM_INTAKE",
        new_status: "New",
        source: "Admin",
        remarks: `Imported from file '${originalname}' (batch: ${batchId}).`,
        created_at: now
      });

      createdCases.push(newCase);
      successCount++;
    }

    const importBatch = {
      id: batchId,
      uploaded_by: req.user.id,
      uploaded_by_name: req.user.fullName || req.user.name,
      file_name: originalname,
      file_size_bytes: size,
      total_rows: rawData.length,
      success_count: successCount,
      duplicate_count: duplicateCount,
      rejected_count: rejectedCount,
      fail_count: duplicateCount + rejectedCount,
      status: duplicateCount + rejectedCount === 0 ? "SUCCESS" : (successCount > 0 ? "PARTIAL" : "FAILED"),
      detected_headers: rawHeaders,
      header_mapping: headerMapping,
      error_rows: errorRows,
      created_at: now
    };

    memoryStore.import_batches.unshift(importBatch);
    indexService.rebuild(memoryStore);
    cacheService.delPattern("cases:*");
    cacheService.delPattern("dashboard:*");

    return res.status(200).json({
      success: true,
      message: `Import complete: ${successCount} cases created, ${duplicateCount} duplicates, ${rejectedCount} rejected out of ${rawData.length} rows.`,
      data: {
        batch_id: batchId,
        file_name: originalname,
        total_rows: rawData.length,
        success_count: successCount,
        duplicate_count: duplicateCount,
        rejected_count: rejectedCount,
        status: importBatch.status,
        header_mapping: headerMapping,
        error_rows: errorRows,
        created_cases: createdCases.slice(0, 10)
      }
    });
  } catch (error) {
    console.error("uploadFile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/upload/history
 * Returns all import batch history.
 */
export const getImportHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const sorted = [...memoryStore.import_batches].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const totalCount = sorted.length;
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = sorted.slice(startIdx, startIdx + limitNum);

    const summary = paginated.map(batch => ({
      ...batch,
      error_rows: undefined,
      error_row_count: batch.error_rows ? batch.error_rows.length : 0
    }));

    return res.status(200).json({
      success: true,
      message: `${totalCount} import batch(es) found.`,
      data: {
        batches: summary,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("getImportHistory Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
