import { v4 as uuidv4 } from "uuid";
import { memoryStore } from "../config/db.js";
import multer from "multer";
import * as XLSX from "xlsx";

// Multer configuration for file uploads (in-memory storage)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
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

  "lender": "lender_name",
  "lender name": "lender_name",
  "lender_name": "lender_name",
  "bank name": "lender_name",
  "bank": "lender_name",
  "financier": "lender_name",

  "loan type": "loan_type",
  "loan_type": "loan_type",
  "product": "loan_type",
  "product type": "loan_type",

  "principal": "principal_amount",
  "principal amount": "principal_amount",
  "principal_amount": "principal_amount",
  "loan amount": "principal_amount",
  "loan_amount": "principal_amount",
  "sanctioned amount": "principal_amount",
  "amount": "principal_amount",

  "outstanding": "outstanding_amount",
  "outstanding amount": "outstanding_amount",
  "outstanding_amount": "outstanding_amount",
  "balance": "outstanding_amount",
  "due amount": "outstanding_amount",
  "due_amount": "outstanding_amount",
  "total due": "outstanding_amount",

  "dpd": "dpd",
  "days past due": "dpd",
  "days_past_due": "dpd",
  "overdue days": "dpd",

  "credit score": "credit_score",
  "credit_score": "credit_score",
  "cibil": "credit_score",
  "cibil score": "credit_score"
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

  if (!row.phone || row.phone.toString().trim().length < 10) {
    errors.push(`Row ${rowIndex}: Phone number is missing or invalid.`);
  }

  if (!row.loan_account_no || row.loan_account_no.toString().trim().length < 3) {
    errors.push(`Row ${rowIndex}: Loan account number is missing.`);
  }

  if (!row.lender_name || row.lender_name.toString().trim().length < 2) {
    errors.push(`Row ${rowIndex}: Lender name is missing.`);
  }

  const principal = parseFloat(row.principal_amount);
  if (isNaN(principal) || principal <= 0) {
    errors.push(`Row ${rowIndex}: Principal amount is invalid or missing.`);
  }

  const outstanding = parseFloat(row.outstanding_amount);
  if (isNaN(outstanding) || outstanding < 0) {
    errors.push(`Row ${rowIndex}: Outstanding amount is invalid.`);
  }

  return errors;
}

/**
 * POST /api/upload
 * Upload and process an Excel/CSV file to import loan cases.
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Please attach an .xlsx or .csv file." });
    }

    const { originalname, buffer, size } = req.file;

    // Parse the workbook from buffer
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

    // Check required columns
    const requiredFields = ["customer_name", "phone", "loan_account_no", "lender_name", "principal_amount"];
    const missingRequired = requiredFields.filter(f => !mappedFields.includes(f));

    if (missingRequired.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingRequired.join(", ")}. Detected columns: ${rawHeaders.join(", ")}`,
        data: {
          detected_headers: rawHeaders,
          mapped_headers: headerMapping,
          missing_required: missingRequired
        }
      });
    }

    // Process rows
    const batchId = `batch_${uuidv4()}`;
    const now = new Date().toISOString();
    let successCount = 0;
    let failCount = 0;
    const errorRows = [];
    const createdCases = [];

    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      const rowIndex = i + 2; // +2 because row 1 is header, data starts at row 2

      // Map raw row to internal field names
      const mappedRow = {};
      for (const [rawHeader, internalField] of Object.entries(headerMapping)) {
        mappedRow[internalField] = rawRow[rawHeader];
      }

      // Validate
      const rowErrors = validateRow(mappedRow, rowIndex);
      if (rowErrors.length > 0) {
        failCount++;
        errorRows.push({ row: rowIndex, errors: rowErrors, data: rawRow });
        continue;
      }

      // Check for duplicate loan account
      const existingCase = memoryStore.loan_cases.find(
        c => c.loan_account_no === mappedRow.loan_account_no.toString().trim()
      );
      if (existingCase) {
        failCount++;
        errorRows.push({
          row: rowIndex,
          errors: [`Row ${rowIndex}: Duplicate loan account number '${mappedRow.loan_account_no}' (case ${existingCase.case_number}).`],
          data: rawRow
        });
        continue;
      }

      // Create or find customer
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

      // Create loan case
      const principal = parseFloat(mappedRow.principal_amount) || 0;
      const outstanding = parseFloat(mappedRow.outstanding_amount) || principal;
      const recovered = Math.max(0, principal - outstanding);
      const dpd = parseInt(mappedRow.dpd, 10) || 0;
      const caseCount = memoryStore.loan_cases.length + 1;

      const caseId = `case_imp_${uuidv4().slice(0, 8)}`;
      const caseNumber = `PM-LN-${new Date().getFullYear()}-IMP-${String(caseCount).padStart(5, "0")}`;

      const priority = outstanding > 120000 ? "CRITICAL" : outstanding > 60000 ? "HIGH" : outstanding > 30000 ? "MEDIUM" : "LOW";

      const newCase = {
        id: caseId,
        case_number: caseNumber,
        customer_id: customer.id,
        lender_name: mappedRow.lender_name.toString().trim(),
        loan_account_no: mappedRow.loan_account_no.toString().trim(),
        loan_type: mappedRow.loan_type ? mappedRow.loan_type.toString().trim() : "Personal Loan",
        principal_amount: principal,
        outstanding_amount: outstanding,
        total_recovered_amount: recovered,
        dpd,
        priority,
        status: "New",
        assigned_employee_id: null,
        assigned_at: null,
        follow_up_date: null,
        is_field_visit_required: false,
        import_batch_id: batchId,
        created_at: now,
        updated_at: now
      };

      memoryStore.loan_cases.push(newCase);

      // Create initial status history
      memoryStore.case_status_history.push({
        id: `csh_${uuidv4()}`,
        case_id: caseId,
        employee_id: req.user.id,
        previous_status: "SYSTEM_INTAKE",
        new_status: "New",
        remarks: `Imported from file '${originalname}' (batch: ${batchId}).`,
        created_at: now
      });

      createdCases.push(newCase);
      successCount++;
    }

    // Create import batch record
    const importBatch = {
      id: batchId,
      uploaded_by: req.user.id,
      uploaded_by_name: req.user.fullName,
      file_name: originalname,
      file_size_bytes: size,
      total_rows: rawData.length,
      success_count: successCount,
      fail_count: failCount,
      status: failCount === rawData.length ? "FAILED" : failCount > 0 ? "PARTIAL" : "SUCCESS",
      detected_headers: rawHeaders,
      header_mapping: headerMapping,
      error_rows: errorRows.length > 0 ? errorRows : [],
      created_at: now
    };

    memoryStore.import_batches.push(importBatch);

    return res.status(200).json({
      success: true,
      message: `Import complete: ${successCount} cases created, ${failCount} failed out of ${rawData.length} rows.`,
      data: {
        batch_id: batchId,
        file_name: originalname,
        total_rows: rawData.length,
        success_count: successCount,
        fail_count: failCount,
        status: importBatch.status,
        header_mapping: headerMapping,
        error_rows: errorRows,
        created_cases: createdCases.slice(0, 10) // Return first 10 for preview
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

    // Strip verbose error_rows from listing (keep count only)
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
