import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Upload & Import Batch Repository
 * Manages loan portfolio import batches, schema validation sessions, and bulk ingestions.
 */
export const uploadRepository = {
  /**
   * Create new import batch tracking record
   */
  async createBatch({ id, filename, uploadedBy, totalRecords, successfulRecords = 0, failedRecords = 0, errorsJson = [] }, client = null) {
    const batchId = id || `batch_${uuidv4()}`;
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `INSERT INTO import_batches (
          id, filename, uploaded_by, total_records, successful_records, failed_records, errors_json, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [batchId, filename, uploadedBy, totalRecords, successfulRecords, failedRecords, JSON.stringify(errorsJson), now]
      );
      return res.rows[0];
    }

    const batch = {
      id: batchId,
      filename,
      uploaded_by: uploadedBy,
      total_records: totalRecords,
      successful_records: successfulRecords,
      failed_records: failedRecords,
      errors_json: errorsJson,
      created_at: now
    };

    if (!memoryStore.import_batches) {
      memoryStore.import_batches = [];
    }
    memoryStore.import_batches.unshift(batch);
    return batch;
  },

  /**
   * Update batch completion status and counts
   */
  async updateBatch(batchId, { successfulRecords, failedRecords, errorsJson }, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE import_batches
         SET successful_records = COALESCE($1, successful_records),
             failed_records = COALESCE($2, failed_records),
             errors_json = COALESCE($3, errors_json)
         WHERE id = $4
         RETURNING *`,
        [successfulRecords, failedRecords, errorsJson ? JSON.stringify(errorsJson) : null, batchId]
      );
      return res.rows[0] || null;
    }

    const batch = (memoryStore.import_batches || []).find(b => b.id === batchId);
    if (!batch) return null;

    if (successfulRecords !== undefined) batch.successful_records = successfulRecords;
    if (failedRecords !== undefined) batch.failed_records = failedRecords;
    if (errorsJson !== undefined) batch.errors_json = errorsJson;

    return { ...batch };
  },

  /**
   * Get batch by ID
   */
  async getBatchById(batchId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query("SELECT * FROM import_batches WHERE id = $1", [batchId]);
      return res.rows[0] || null;
    }

    return (memoryStore.import_batches || []).find(b => b.id === batchId) || null;
  },

  /**
   * Check for duplicate loan account numbers across existing cases
   */
  async checkDuplicateAccounts(loanAccountNumbers, client = null) {
    if (!loanAccountNumbers || loanAccountNumbers.length === 0) return [];

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        "SELECT loan_account_no FROM loan_cases WHERE loan_account_no = ANY($1)",
        [loanAccountNumbers]
      );
      return res.rows.map(r => r.loan_account_no);
    }

    const existingMap = new Set(memoryStore.loan_cases.map(c => String(c.loan_account_no).trim()));
    return loanAccountNumbers.filter(no => existingMap.has(String(no).trim()));
  },

  /**
   * Atomically save customer and case records inside a database transaction
   */
  async saveImportedRecords(batchId, records, uploadedById, client = null) {
    const now = new Date().toISOString();
    const createdCases = [];

    // Universal transaction wrapper
    const execute = async (trxClient) => {
      for (const item of records) {
        const { customer, caseData } = item;

        // 1. Persist or locate customer
        let custId = customer.id;
        if (db.isPgActive()) {
          const custRes = await trxClient.query(
            `INSERT INTO customers (
              id, customer_code, full_name, phone_masked, phone_raw, alternate_phone,
              email, current_address, city, state, pincode, credit_score, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (customer_code) DO UPDATE
            SET full_name = EXCLUDED.full_name,
                phone_raw = EXCLUDED.phone_raw,
                phone_masked = EXCLUDED.phone_masked,
                city = EXCLUDED.city,
                state = EXCLUDED.state
            RETURNING id`,
            [
              customer.id || `cust_${uuidv4()}`,
              customer.customer_code,
              customer.full_name,
              customer.phone_masked,
              customer.phone_raw,
              customer.alternate_phone || null,
              customer.email || null,
              customer.current_address || "",
              customer.city || "",
              customer.state || "",
              customer.pincode || "",
              customer.credit_score || 650,
              now
            ]
          );
          custId = custRes.rows[0].id;
        } else {
          let existingCust = memoryStore.customers.find(c => c.customer_code === customer.customer_code);
          if (existingCust) {
            existingCust.full_name = customer.full_name;
            existingCust.phone_raw = customer.phone_raw;
            existingCust.phone_masked = customer.phone_masked;
            custId = existingCust.id;
          } else {
            custId = customer.id || `cust_${uuidv4()}`;
            memoryStore.customers.push({
              ...customer,
              id: custId,
              created_at: now
            });
          }
        }

        // 2. Persist loan case
        const caseId = caseData.id || `case_${uuidv4()}`;
        const caseNumber = caseData.case_number || `PM-LN-${Date.now().toString().slice(-6)}`;

        if (db.isPgActive()) {
          const caseRes = await trxClient.query(
            `INSERT INTO loan_cases (
              id, case_number, customer_id, lender_name, loan_account_no, loan_type,
              principal_amount, outstanding_amount, total_recovered_amount, dpd,
              priority, status, assigned_employee_id, assigned_at, follow_up_date,
              import_batch_id, is_field_visit_required, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *`,
            [
              caseId,
              caseNumber,
              custId,
              caseData.lender_name,
              caseData.loan_account_no,
              caseData.loan_type || "Personal",
              caseData.principal_amount,
              caseData.outstanding_amount,
              0.00,
              caseData.dpd || 0,
              caseData.priority || "MEDIUM",
              "New",
              null,
              null,
              caseData.follow_up_date || null,
              batchId,
              false,
              now,
              now
            ]
          );

          // 3. Atomically record initial status audit record
          const auditId = `csh_${uuidv4()}`;
          await trxClient.query(
            `INSERT INTO case_status_history (
              id, case_id, employee_id, previous_status, new_status, source, reference_id, remarks, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              auditId,
              caseId,
              uploadedById,
              "SYSTEM_INTAKE",
              "New",
              "Batch Import",
              batchId,
              `Batch loan import from batch '${batchId}'`,
              now
            ]
          );

          createdCases.push(caseRes.rows[0]);
        } else {
          const newCase = {
            id: caseId,
            case_number: caseNumber,
            customer_id: custId,
            lender_name: caseData.lender_name,
            loan_account_no: caseData.loan_account_no,
            loan_type: caseData.loan_type || "Personal",
            principal_amount: caseData.principal_amount,
            outstanding_amount: caseData.outstanding_amount,
            total_recovered_amount: 0.00,
            dpd: caseData.dpd || 0,
            priority: caseData.priority || "MEDIUM",
            status: "New",
            assigned_employee_id: null,
            assigned_at: null,
            follow_up_date: caseData.follow_up_date || null,
            import_batch_id: batchId,
            is_field_visit_required: false,
            created_at: now,
            updated_at: now
          };

          memoryStore.loan_cases.unshift(newCase);

          memoryStore.case_status_history.unshift({
            id: `csh_${uuidv4()}`,
            case_id: caseId,
            employee_id: uploadedById,
            previous_status: "SYSTEM_INTAKE",
            new_status: "New",
            source: "Batch Import",
            reference_id: batchId,
            remarks: `Batch loan import from batch '${batchId}'`,
            created_at: now
          });

          createdCases.push(newCase);
        }
      }

      if (!db.isPgActive()) {
        db.indexService.rebuild(memoryStore);
      }
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return createdCases;
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  }
};

export default uploadRepository;
