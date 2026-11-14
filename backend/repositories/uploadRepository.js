import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Upload & Import Batch Repository
 * Production PostgreSQL repository with durable preview sessions, checksums, and atomic ingestion.
 */
export const uploadRepository = {
  /**
   * Create new import batch tracking record with durable preview session
   */
  async createBatchSession({
    id,
    filename,
    uploadedBy,
    fileChecksum = null,
    totalRecords = 0,
    validRecords = 0,
    duplicateRecords = 0,
    failedRecords = 0,
    previewData = null,
    errorsJson = [],
    expiresAt = null
  }, client = null) {
    const batchId = id || `batch_${uuidv4()}`;
    const now = new Date().toISOString();
    const expiry = expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins TTL

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `INSERT INTO import_batches (
          id, filename, uploaded_by, file_checksum, status,
          total_records, valid_records, duplicate_records, failed_records,
          preview_data, errors_json, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          batchId,
          filename,
          uploadedBy,
          fileChecksum,
          totalRecords,
          validRecords,
          duplicateRecords,
          failedRecords,
          previewData ? JSON.stringify(previewData) : null,
          JSON.stringify(errorsJson || []),
          expiry,
          now
        ]
      );
      return res.rows[0];
    }

    const batch = {
      id: batchId,
      filename,
      uploaded_by: uploadedBy,
      file_checksum: fileChecksum,
      status: "PENDING",
      total_records: totalRecords,
      valid_records: validRecords,
      duplicate_records: duplicateRecords,
      failed_records: failedRecords,
      successful_records: 0,
      preview_data: previewData,
      errors_json: errorsJson || [],
      expires_at: expiry,
      confirmed_at: null,
      confirmed_by: null,
      created_at: now
    };

    if (!memoryStore.import_batches) {
      memoryStore.import_batches = [];
    }
    memoryStore.import_batches.unshift(batch);
    return batch;
  },

  /**
   * Legacy createBatch wrapper for backwards compatibility
   */
  async createBatch(data, client = null) {
    return this.createBatchSession(data, client);
  },

  /**
   * Get batch session by ID with active lock if inside transaction
   */
  async getBatchSession(batchId, client = null, forUpdate = false) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const lockSql = forUpdate ? " FOR UPDATE" : "";
      const res = await q.query(
        `SELECT * FROM import_batches WHERE id = $1${lockSql}`,
        [batchId]
      );
      const row = res.rows[0];
      if (row && typeof row.preview_data === "string") {
        try { row.preview_data = JSON.parse(row.preview_data); } catch (_) {}
      }
      if (row && typeof row.errors_json === "string") {
        try { row.errors_json = JSON.parse(row.errors_json); } catch (_) {}
      }
      return row || null;
    }

    return (memoryStore.import_batches || []).find(b => b.id === batchId) || null;
  },

  /**
   * Alias for getBatchSession
   */
  async getBatchById(batchId, client = null) {
    return this.getBatchSession(batchId, client);
  },

  /**
   * Update batch preview state
   */
  async updateBatchPreview(batchId, { validRecords, duplicateRecords, failedRecords, previewData, errorsJson }, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE import_batches
         SET valid_records = COALESCE($1, valid_records),
             duplicate_records = COALESCE($2, duplicate_records),
             failed_records = COALESCE($3, failed_records),
             preview_data = COALESCE($4, preview_data),
             errors_json = COALESCE($5, errors_json)
         WHERE id = $6
         RETURNING *`,
        [
          validRecords,
          duplicateRecords,
          failedRecords,
          previewData ? JSON.stringify(previewData) : null,
          errorsJson ? JSON.stringify(errorsJson) : null,
          batchId
        ]
      );
      return res.rows[0] || null;
    }

    const batch = (memoryStore.import_batches || []).find(b => b.id === batchId);
    if (!batch) return null;

    if (validRecords !== undefined) batch.valid_records = validRecords;
    if (duplicateRecords !== undefined) batch.duplicate_records = duplicateRecords;
    if (failedRecords !== undefined) batch.failed_records = failedRecords;
    if (previewData !== undefined) batch.preview_data = previewData;
    if (errorsJson !== undefined) batch.errors_json = errorsJson;

    return { ...batch };
  },

  /**
   * Confirm batch session: transition PENDING -> CONFIRMED
   */
  async confirmBatchSession(batchId, confirmedById, stats = {}, client = null) {
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE import_batches
         SET status = 'CONFIRMED',
             confirmed_by = $1,
             confirmed_at = $2,
             successful_records = COALESCE($3, valid_records),
             preview_data = NULL
         WHERE id = $4 AND status = 'PENDING'
         RETURNING *`,
        [confirmedById, now, stats.successfulRecords, batchId]
      );
      return res.rows[0] || null;
    }

    const batch = (memoryStore.import_batches || []).find(b => b.id === batchId);
    if (!batch || batch.status !== "PENDING") return null;

    batch.status = "CONFIRMED";
    batch.confirmed_by = confirmedById;
    batch.confirmed_at = now;
    batch.successful_records = stats.successfulRecords !== undefined ? stats.successfulRecords : batch.valid_records;
    batch.preview_data = null; // Free storage memory

    return { ...batch };
  },

  /**
   * Cancel batch session: transition PENDING -> CANCELLED
   */
  async cancelBatchSession(batchId, cancelledById, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE import_batches
         SET status = 'CANCELLED', preview_data = NULL
         WHERE id = $1 AND status = 'PENDING'
         RETURNING *`,
        [batchId]
      );
      return res.rows[0] || null;
    }

    const batch = (memoryStore.import_batches || []).find(b => b.id === batchId);
    if (!batch || batch.status !== "PENDING") return null;

    batch.status = "CANCELLED";
    batch.preview_data = null;
    return { ...batch };
  },

  /**
   * Expire batch session: transition PENDING -> EXPIRED
   */
  async expireBatchSession(batchId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE import_batches
         SET status = 'EXPIRED', preview_data = NULL
         WHERE id = $1 AND status = 'PENDING'
         RETURNING *`,
        [batchId]
      );
      return res.rows[0] || null;
    }

    const batch = (memoryStore.import_batches || []).find(b => b.id === batchId);
    if (!batch || batch.status !== "PENDING") return null;

    batch.status = "EXPIRED";
    batch.preview_data = null;
    return { ...batch };
  },

  /**
   * Check for duplicate loan account numbers across existing cases
   */
  async checkDuplicateAccounts(loanAccountNumbers, client = null) {
    if (!loanAccountNumbers || loanAccountNumbers.length === 0) return [];
    const normalized = loanAccountNumbers.map(n => String(n).trim().toUpperCase());

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        "SELECT UPPER(loan_account_no) as loan_account_no FROM loan_cases WHERE UPPER(loan_account_no) = ANY($1)",
        [normalized]
      );
      return res.rows.map(r => r.loan_account_no);
    }

    const existingMap = new Set(memoryStore.loan_cases.map(c => String(c.loan_account_no).trim().toUpperCase()));
    return normalized.filter(no => existingMap.has(no));
  },

  /**
   * Check for duplicate customer codes across existing customers
   */
  async checkDuplicateCustomerCodes(customerCodes, client = null) {
    if (!customerCodes || customerCodes.length === 0) return [];
    const normalized = customerCodes.map(c => String(c).trim().toUpperCase());

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        "SELECT UPPER(customer_code) as customer_code FROM customers WHERE UPPER(customer_code) = ANY($1)",
        [normalized]
      );
      return res.rows.map(r => r.customer_code);
    }

    const existingMap = new Set(memoryStore.customers.map(c => String(c.customer_code).trim().toUpperCase()));
    return normalized.filter(code => existingMap.has(code));
  },

  /**
   * Re-validate duplicates for candidate records inside an active transaction
   */
  async revalidateDuplicates(records, client = null) {
    const loanAccounts = records.map(r => r.caseData?.loan_account_no).filter(Boolean);
    const duplicates = await this.checkDuplicateAccounts(loanAccounts, client);
    return new Set(duplicates);
  },

  /**
   * Get paginated batch history
   */
  async getBatchHistory({ limit = 20, offset = 0, uploadedBy } = {}, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      let where = "";
      if (uploadedBy) {
        params.push(uploadedBy);
        where = "WHERE ib.uploaded_by = $1";
      }

      params.push(limit, offset);
      const res = await q.query(
        `SELECT ib.id, ib.filename, ib.status, ib.total_records, ib.successful_records,
                ib.failed_records, ib.valid_records, ib.duplicate_records, ib.created_at,
                ib.confirmed_at, ib.expires_at, u.full_name as uploaded_by_name,
                uConf.full_name as confirmed_by_name
         FROM import_batches ib
         LEFT JOIN users u ON ib.uploaded_by = u.id
         LEFT JOIN users uConf ON ib.confirmed_by = uConf.id
         ${where}
         ORDER BY ib.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );
      return res.rows;
    }

    let list = memoryStore.import_batches || [];
    if (uploadedBy) {
      list = list.filter(b => b.uploaded_by === uploadedBy);
    }

    return list.slice(offset, offset + limit).map(b => {
      const u = memoryStore.users.find(user => user.id === b.uploaded_by);
      const uConf = b.confirmed_by ? memoryStore.users.find(user => user.id === b.confirmed_by) : null;
      return {
        id: b.id,
        filename: b.filename,
        status: b.status || "CONFIRMED",
        total_records: b.total_records,
        successful_records: b.successful_records || b.valid_records || 0,
        failed_records: b.failed_records,
        valid_records: b.valid_records || 0,
        duplicate_records: b.duplicate_records || 0,
        created_at: b.created_at,
        confirmed_at: b.confirmed_at,
        expires_at: b.expires_at,
        uploaded_by_name: u ? u.full_name : "System Admin",
        confirmed_by_name: uConf ? uConf.full_name : null
      };
    });
  },

  /**
   * Atomically save customer and case records inside a database transaction
   */
  async saveImportedRecords(batchId, records, uploadedById, client = null) {
    const now = new Date().toISOString();
    const createdCases = [];

    // Universal transaction wrapper
    const execute = async (trxClient) => {
      // 1. Re-validate duplicates under transaction lock
      const existingDuplicates = await this.revalidateDuplicates(records, trxClient);

      for (const item of records) {
        const { customer, caseData } = item;
        const acct = String(caseData.loan_account_no).trim().toUpperCase();

        if (existingDuplicates.has(acct)) {
          console.warn(`[saveImportedRecords] Skipping duplicate loan account under concurrency: ${acct}`);
          continue;
        }

        // 2. Persist or locate customer
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

        // 3. Persist loan case
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

          // 4. Atomically record initial status audit record
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

      // Mark batch confirmed
      await this.confirmBatchSession(batchId, uploadedById, { successfulRecords: createdCases.length }, trxClient);

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
