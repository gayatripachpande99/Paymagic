import { v4 as uuidv4 } from "uuid";
import db, { memoryStore, transaction } from "../config/db.js";
import { uploadRepository } from "../repositories/uploadRepository.js";
import { fileValidationService } from "../services/fileValidationService.js";
import { loanValidationService, STANDARD_COLUMNS } from "../services/loanValidationService.js";
import multer from "multer";
import * as XLSX from "xlsx";

// 1. Multer configuration: 10MB limit and extension filter
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = [".xlsx", ".csv"];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File extension '${ext}' is not permitted. Only .xlsx and .csv files are supported.`));
    }
  }
});

/**
 * GET /api/upload/template
 * Download official PayMagic Loan Import Template with exactly 16 standard business fields.
 */
export const getImportTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();

    const sampleRows = [
      {
        "Borrower Name": "Aarav Sharma",
        "Customer Code": "CUST-MUM-1001",
        "Phone": "9876543210",
        "Alternate Phone": "9823456780",
        "Email": "aarav.sharma@example.com",
        "Address": "Flat 402, Sunset Towers, Andheri West",
        "City": "Mumbai",
        "State": "Maharashtra",
        "Pincode": "400053",
        "Lender Name": "Bajaj Finance",
        "Loan Account No": "LN-BAJAJ-8801",
        "Loan Type": "Personal",
        "Principal Amount": 250000,
        "Outstanding Amount": 185000,
        "DPD": 45,
        "Priority": "HIGH"
      },
      {
        "Borrower Name": "Pooja Verma",
        "Customer Code": "CUST-PUN-2045",
        "Phone": "9823456789",
        "Alternate Phone": "",
        "Email": "pooja.verma@example.com",
        "Address": "Plot 12, Baner Road",
        "City": "Pune",
        "State": "Maharashtra",
        "Pincode": "411045",
        "Lender Name": "HDFC Bank",
        "Loan Account No": "LN-HDFC-9912",
        "Loan Type": "Auto",
        "Principal Amount": 450000,
        "Outstanding Amount": 320000,
        "DPD": 65,
        "Priority": "CRITICAL"
      },
      {
        "Borrower Name": "Vikram Malhotra",
        "Customer Code": "CUST-DEL-3310",
        "Phone": "9910293847",
        "Alternate Phone": "9910293800",
        "Email": "",
        "Address": "B-14, Sector 62",
        "City": "Noida",
        "State": "Uttar Pradesh",
        "Pincode": "201301",
        "Lender Name": "ICICI Bank",
        "Loan Account No": "LN-ICICI-4421",
        "Loan Type": "Credit Card",
        "Principal Amount": 75000,
        "Outstanding Amount": 64500,
        "DPD": 22,
        "Priority": "MEDIUM"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: STANDARD_COLUMNS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Standard_Loan_Template");

    if (format === "csv") {
      let csvOutput = XLSX.utils.sheet_to_csv(ws);
      // Sanitize any dangerous characters in CSV output
      const sanitizedLines = csvOutput.split("\n").map(line => {
        return line.split(",").map(cell => {
          const trimmed = cell.trim();
          if (["=", "+", "-", "@"].includes(trimmed[0]) && isNaN(Number(trimmed))) {
            return `'${trimmed}`;
          }
          return cell;
        }).join(",");
      }).join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="PayMagic_Loan_Import_Template.csv"');
      return res.status(200).send(sanitizedLines);
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
 * Pre-validates uploaded Excel/CSV file without mutating business records.
 * Generates durable preview session, validates 16 columns, detects duplicates, and checks magic bytes.
 */
export const previewUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach an .xlsx or .csv file (max 10 MB)."
      });
    }

    // 1. Strict File Security Validation (Size, Extension, Magic Bytes)
    const fileSecurity = fileValidationService.validateUpload(req.file);
    if (!fileSecurity.valid) {
      return res.status(400).json({
        success: false,
        message: fileSecurity.error
      });
    }

    const { buffer, originalname, size } = req.file;

    // 2. Parse Spreadsheet (Never evaluate formulas!)
    let workbook;
    try {
      workbook = XLSX.read(buffer, {
        type: "buffer",
        cellFormula: false, // Security: Do not evaluate formulas
        cellHTML: false,
        raw: false // Parse cells as formatted text to preserve string precision
      });
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: `Corrupted or unreadable spreadsheet: ${parseErr.message}`
      });
    }

    // 3. Validate Workbook Boundaries (Sheet count, row limits)
    const structureCheck = fileValidationService.validateWorkbookStructure(workbook);
    if (!structureCheck.valid) {
      return res.status(400).json({
        success: false,
        message: structureCheck.error
      });
    }

    const worksheet = workbook.Sheets[structureCheck.sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded spreadsheet contains no data rows."
      });
    }

    if (rawData.length > fileValidationService.MAX_ROWS) {
      return res.status(400).json({
        success: false,
        message: `File row count (${rawData.length}) exceeds maximum allowable limit of ${fileValidationService.MAX_ROWS} rows.`
      });
    }

    // 4. Validate Headers
    const firstRowKeys = Object.keys(rawData[0]);
    if (firstRowKeys.length > fileValidationService.MAX_COLS) {
      return res.status(400).json({
        success: false,
        message: `File column count (${firstRowKeys.length}) exceeds maximum allowable limit of ${fileValidationService.MAX_COLS} columns.`
      });
    }

    // 5. Pre-collect loan accounts to query database duplicates
    const normalizedRows = [];
    const loanAccountsToCheck = [];

    rawData.forEach((row, idx) => {
      const normalized = loanValidationService.normalizeHeaders(row);
      normalizedRows.push({ raw: row, normalized, rowIndex: idx + 2 });
      if (normalized.loan_account_no) {
        loanAccountsToCheck.push(normalized.loan_account_no);
      }
    });

    // Query database duplicates using parameterized SQL via repository
    const dbDuplicatesList = await uploadRepository.checkDuplicateAccounts(loanAccountsToCheck);
    const dbDuplicateSet = new Set(dbDuplicatesList.map(a => String(a).trim().toUpperCase()));

    // 6. Partition Rows into Valid, Duplicates, and Rejected
    const validRows = [];
    const duplicateRows = [];
    const rejectedRows = [];

    const seenAccountsInFile = new Set();
    const seenCustomerCodesInFile = new Set();

    normalizedRows.forEach(({ raw, normalized, rowIndex }) => {
      // Validate schema and business rules
      const valResult = loanValidationService.validateRow(normalized, rowIndex);

      if (!valResult.isValid) {
        rejectedRows.push({
          row: rowIndex,
          loan_account_no: normalized.loan_account_no || "N/A",
          customer_name: normalized.borrower_name || "N/A",
          customer_code: normalized.customer_code || "N/A",
          reason: valResult.errors.join("; "),
          data: raw
        });
        return;
      }

      const cleanRow = valResult.sanitized;
      const acctKey = cleanRow.loan_account_no.toUpperCase();
      const custKey = cleanRow.customer_code.toUpperCase();

      // Check duplicate within same file
      if (seenAccountsInFile.has(acctKey)) {
        duplicateRows.push({
          row: rowIndex,
          loan_account_no: cleanRow.loan_account_no,
          customer_name: cleanRow.borrower_name,
          customer_code: cleanRow.customer_code,
          reason: `Duplicate loan account number '${cleanRow.loan_account_no}' appears multiple times in uploaded file.`,
          data: raw
        });
        return;
      }
      seenAccountsInFile.add(acctKey);

      // Check duplicate against existing database
      if (dbDuplicateSet.has(acctKey)) {
        duplicateRows.push({
          row: rowIndex,
          loan_account_no: cleanRow.loan_account_no,
          customer_name: cleanRow.borrower_name,
          customer_code: cleanRow.customer_code,
          reason: `Loan account '${cleanRow.loan_account_no}' already exists in PayMagic portfolio.`,
          data: raw
        });
        return;
      }

      validRows.push({
        row: rowIndex,
        customer: {
          customer_code: cleanRow.customer_code,
          full_name: cleanRow.borrower_name,
          phone_raw: cleanRow.phone,
          phone_masked: `${cleanRow.phone.slice(0, 7)}****${cleanRow.phone.slice(-2)}`,
          alternate_phone: cleanRow.alternate_phone,
          email: cleanRow.email,
          current_address: cleanRow.address,
          city: cleanRow.city,
          state: cleanRow.state,
          pincode: cleanRow.pincode
        },
        caseData: {
          lender_name: cleanRow.lender_name,
          loan_account_no: cleanRow.loan_account_no,
          loan_type: cleanRow.loan_type,
          principal_amount: cleanRow.principal_amount,
          outstanding_amount: cleanRow.outstanding_amount,
          dpd: cleanRow.dpd,
          priority: cleanRow.priority
        }
      });
    });

    // 7. Persist Preview Session Durably in Database
    const previewBatchId = `batch_${uuidv4().slice(0, 8)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    const previewPayload = {
      preview_batch_id: previewBatchId,
      filename: originalname,
      file_size_bytes: size,
      file_checksum: fileSecurity.checksum,
      uploader_id: req.user.id,
      uploader_name: req.user.fullName || req.user.name || "Administrator",
      total_records: rawData.length,
      valid_records: validRows.length,
      duplicate_records: duplicateRows.length,
      rejected_records: rejectedRows.length,
      sample_valid: validRows.slice(0, 5).map(v => ({
        customer_name: v.customer.full_name,
        customer_code: v.customer.customer_code,
        loan_account_no: v.caseData.loan_account_no,
        lender_name: v.caseData.lender_name,
        principal_amount: v.caseData.principal_amount,
        outstanding_amount: v.caseData.outstanding_amount,
        dpd: v.caseData.dpd,
        priority: v.caseData.priority
      })),
      duplicate_records_list: duplicateRows.slice(0, 50),
      rejected_records_list: rejectedRows.slice(0, 50),
      valid_rows_data: validRows, // Stored durably for atomic confirmation
      expires_at: expiresAt
    };

    await uploadRepository.createBatchSession({
      id: previewBatchId,
      filename: originalname,
      uploadedBy: req.user.id,
      fileChecksum: fileSecurity.checksum,
      totalRecords: rawData.length,
      validRecords: validRows.length,
      duplicateRecords: duplicateRows.length,
      failedRecords: rejectedRows.length,
      previewData: previewPayload,
      errorsJson: [...duplicateRows, ...rejectedRows],
      expiresAt
    });

    return res.status(200).json({
      success: true,
      message: `File evaluated: ${validRows.length} valid, ${duplicateRows.length} duplicate, ${rejectedRows.length} rejected.`,
      data: {
        preview_batch_id: previewBatchId,
        filename: originalname,
        file_checksum: fileSecurity.checksum,
        total_records: rawData.length,
        valid_records: validRows.length,
        duplicate_records: duplicateRows.length,
        rejected_records: rejectedRows.length,
        can_import: validRows.length > 0,
        expires_at: expiresAt,
        sample_valid: previewPayload.sample_valid,
        duplicate_rows: duplicateRows.slice(0, 20),
        rejected_rows: rejectedRows.slice(0, 20),
        duplicate_records_list: duplicateRows.slice(0, 20),
        rejected_records_list: rejectedRows.slice(0, 20),
        error_records: [...duplicateRows, ...rejectedRows].slice(0, 30)
      }
    });
  } catch (error) {
    console.error("previewUpload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/upload/:batchId/confirm and POST /api/upload/confirm
 * Atomically commits validated preview batch into PostgreSQL inside a database transaction.
 */
export const confirmUpload = async (req, res) => {
  try {
    const batchId = req.params.batchId || req.body.preview_batch_id || req.body.batch_id;

    if (!batchId) {
      return res.status(400).json({ success: false, message: "batchId or preview_batch_id is required." });
    }

    // 1. Fetch batch session with update lock
    const batch = await uploadRepository.getBatchSession(batchId, null, true);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: `Import batch session '${batchId}' not found. Please upload the file again.`
      });
    }

    // 2. Security & Authorization Checks
    if (batch.status === "CONFIRMED") {
      return res.status(409).json({
        success: false,
        message: `Import batch '${batchId}' has already been confirmed and processed.`
      });
    }

    if (["CANCELLED", "EXPIRED"].includes(batch.status)) {
      return res.status(400).json({
        success: false,
        message: `Import batch '${batchId}' is in '${batch.status}' status and cannot be confirmed.`
      });
    }

    // Check expiration
    if (batch.expires_at && new Date(batch.expires_at) < new Date()) {
      await uploadRepository.expireBatchSession(batchId);
      return res.status(410).json({
        success: false,
        message: `Import preview session '${batchId}' has expired (30-minute validity limit). Please re-upload.`
      });
    }

    // Check uploader ownership or administrative privilege
    const isOwner = batch.uploaded_by === req.user.id;
    const isPrivilegedAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    if (!isOwner && !isPrivilegedAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to confirm an import batch uploaded by another user."
      });
    }

    const previewData = batch.preview_data || {};
    const validRows = previewData.valid_rows_data || [];

    if (validRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot confirm import: Zero valid records found in preview batch."
      });
    }

    // 3. Atomically save records inside transaction
    const createdCases = await uploadRepository.saveImportedRecords(
      batch.id,
      validRows,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: `Successfully confirmed and imported ${createdCases.length} loan case(s).`,
      data: {
        batch_id: batch.id,
        filename: batch.filename,
        success_count: createdCases.length,
        total_records: batch.total_records,
        skipped_duplicates: batch.duplicate_records,
        rejected_count: batch.failed_records,
        status: "CONFIRMED"
      }
    });
  } catch (error) {
    console.error("confirmUpload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/upload/errors/:batchId and GET /api/upload/:batchId/errors
 * Download row-level rejected and duplicate records with sanitized CSV export.
 */
export const downloadErrorRecords = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await uploadRepository.getBatchSession(batchId);

    if (!batch) {
      return res.status(404).json({ success: false, message: `Batch '${batchId}' not found.` });
    }

    const errors = batch.errors_json || [];

    // Build sanitized CSV with formula protection
    const csvHeaders = ["Row Number", "Loan Account Number", "Customer Name", "Failure Reason"];
    const csvRows = [csvHeaders.join(",")];

    errors.forEach(err => {
      const rowNo = err.row || "N/A";
      const acct = loanValidationService.sanitizeFormula(err.loan_account_no || "N/A");
      const name = loanValidationService.sanitizeFormula(err.customer_name || "N/A");
      const reason = loanValidationService.sanitizeFormula(err.reason || "Validation rejected");

      // Wrap fields in double quotes
      csvRows.push(`"${rowNo}","${acct}","${name}","${reason.replace(/"/g, '""')}"`);
    });

    const csvContent = csvRows.join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="import_errors_${batchId}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("downloadErrorRecords Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/upload/history
 * Returns paginated import batch audit history.
 */
export const getImportHistory = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * limitNum;

    const batches = await uploadRepository.getBatchHistory({ limit: limitNum, offset });
    return res.status(200).json({
      success: true,
      message: `Retrieved ${batches.length} import batch(es).`,
      data: { batches }
    });
  } catch (error) {
    console.error("getImportHistory Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/upload/:batchId
 * Fetch single batch details
 */
export const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await uploadRepository.getBatchSession(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: `Batch '${batchId}' not found.` });
    }
    return res.status(200).json({ success: true, data: { batch } });
  } catch (error) {
    console.error("getBatchById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Direct file upload & import (Legacy / CLI single-step support)
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // Call preview
    const previewRes = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };

    await previewUpload(req, previewRes);
    if (previewRes.statusCode !== 200) {
      return res.status(previewRes.statusCode).json(previewRes.body);
    }

    const { preview_batch_id } = previewRes.body.data;

    // Call confirm
    const confirmReq = {
      params: { batchId: preview_batch_id },
      body: { preview_batch_id },
      user: req.user
    };
    return await confirmUpload(confirmReq, res);
  } catch (error) {
    console.error("uploadFile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  upload,
  getImportTemplate,
  previewUpload,
  confirmUpload,
  downloadErrorRecords,
  getImportHistory,
  getBatchById,
  uploadFile
};
