import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import db, { memoryStore } from "../config/db.js";
import { toPaise, fromPaise } from "../repositories/paymentRepository.js";
import { recoveryRepository } from "../repositories/recoveryRepository.js";

/**
 * Enterprise Bank & Gateway Reconciliation Automation Engine
 * Supports bank statement uploads, gateway settlement reports, UTR matching,
 * discrepancy analysis, reconciliation previews, and confirmed settlements.
 */
export const reconciliationService = {
  // In-memory preview cache for staged reconciliations awaiting confirmation
  previewSessions: new Map(),

  /**
   * Parse raw CSV/Text statement lines into normalized transaction objects
   */
  parseStatementContent(content, filename = "statement.csv") {
    if (!content || typeof content !== "string") {
      throw new Error("Invalid statement content: Content must be a non-empty string.");
    }

    const lines = content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 2) {
      throw new Error("Statement file must contain a header row and at least one data row.");
    }

    // Determine delimiter (comma, semicolon, or tab)
    const headerLine = lines[0];
    const delimiter = headerLine.includes("\t") ? "\t" : (headerLine.includes(";") ? ";" : ",");

    const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));

    // Find index of essential columns
    const refIdx = headers.findIndex(h =>
      h.includes("ref") || h.includes("utr") || h.includes("txn") || h.includes("rrn") || h.includes("id")
    );
    const amountIdx = headers.findIndex(h =>
      h.includes("amount") || h.includes("credit") || h.includes("deposit") || h.includes("net")
    );
    const dateIdx = headers.findIndex(h =>
      h.includes("date") || h.includes("time") || h.includes("timestamp")
    );
    const descIdx = headers.findIndex(h =>
      h.includes("desc") || h.includes("particular") || h.includes("narration") || h.includes("notes")
    );

    if (refIdx === -1 || amountIdx === -1) {
      throw new Error("Statement must contain identifiable Reference/UTR and Amount columns.");
    }

    const records = [];
    const seenRefs = new Set();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length <= Math.max(refIdx, amountIdx)) continue;

      const rawRef = parts[refIdx] || "";
      const cleanRef = rawRef.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      const rawAmountStr = (parts[amountIdx] || "0").replace(/[^0-9.-]/g, "");
      const amountNum = parseFloat(rawAmountStr);

      if (isNaN(amountNum) || amountNum <= 0) continue; // Skip debit or non-positive rows

      const dateStr = dateIdx !== -1 && parts[dateIdx] ? parts[dateIdx] : new Date().toISOString();
      const desc = descIdx !== -1 ? parts[descIdx] : "";

      // Deduplicate within the file itself
      const isDuplicateInFile = cleanRef && seenRefs.has(cleanRef);
      if (cleanRef) seenRefs.add(cleanRef);

      records.push({
        raw_row_index: i,
        bank_txn_ref: cleanRef || `AUTO-${Date.now()}-${i}`,
        amount: amountNum,
        txn_date: new Date(dateStr).toISOString() || new Date().toISOString(),
        narration: desc,
        is_duplicate_in_file: isDuplicateInFile
      });
    }

    return records;
  },

  /**
   * Generate an automated reconciliation preview
   * Compares statement rows against recorded payments without committing ledger mutations.
   */
  async generateReconciliationPreview({
    filename = "bank_statement.csv",
    statementContent = null,
    statementRows = null,
    uploadedById,
    userRole,
    type = "BANK_STATEMENT" // BANK_STATEMENT or GATEWAY_SETTLEMENT
  }) {
    if (["CALLER", "FIELD_AGENT"].includes(userRole)) {
      const err = new Error("Unauthorized: Only Supervisors and Admins can perform statement reconciliation.");
      err.statusCode = 403;
      throw err;
    }

    let parsedRows = statementRows;
    if (statementContent && (!parsedRows || parsedRows.length === 0)) {
      parsedRows = this.parseStatementContent(statementContent, filename);
    }

    if (!parsedRows || !Array.isArray(parsedRows) || parsedRows.length === 0) {
      throw new Error("No valid statement transaction records found.");
    }

    const previewId = `prev_${uuidv4()}`;
    const now = new Date().toISOString();

    let matchedCount = 0;
    let unmatchedCount = 0;
    let discrepancyCount = 0;
    let duplicateCount = 0;
    let totalMatchedPaise = 0n;
    let totalStatementPaise = 0n;

    const previewItems = [];

    // Helper to query system payment by reference
    const queryPayment = async (ref) => {
      if (!ref) return null;
      if (db.isPgActive()) {
        const res = await db.query(
          "SELECT p.*, lc.case_number, lc.borrower_name FROM payments p JOIN loan_cases lc ON p.case_id = lc.id WHERE p.transaction_ref = $1",
          [ref]
        );
        return res.rows[0] || null;
      }
      const pay = (memoryStore.payments || []).find(p => p.transaction_ref === ref);
      if (!pay) return null;
      const lc = (memoryStore.loan_cases || []).find(c => c.id === pay.case_id);
      return {
        ...pay,
        case_number: lc ? lc.case_number : "Unknown",
        borrower_name: lc ? (lc.borrower_name || lc.customer_name) : "Unknown"
      };
    };

    for (const row of parsedRows) {
      const ref = (row.bank_txn_ref || row.transaction_ref || row.ref || "").trim();
      const amountPaise = toPaise(row.amount);
      totalStatementPaise += amountPaise;

      let matchStatus = "UNMATCHED";
      let matchedPayment = null;
      let notes = row.narration || "";

      if (row.is_duplicate_in_file) {
        matchStatus = "DUPLICATE_STATEMENT_ENTRY";
        notes = "Duplicate transaction reference found within statement file.";
        duplicateCount++;
      } else if (!ref) {
        matchStatus = "UNMATCHED";
        notes = "Missing transaction reference or UTR in statement row.";
        unmatchedCount++;
      } else {
        matchedPayment = await queryPayment(ref);

        if (!matchedPayment) {
          matchStatus = "UNMATCHED";
          notes = "Transaction reference not found in system recovery collections.";
          unmatchedCount++;
        } else {
          const systemPaise = toPaise(matchedPayment.amount);

          if (systemPaise === amountPaise) {
            matchStatus = "MATCHED";
            matchedCount++;
            totalMatchedPaise += amountPaise;
            notes = `Exact match with payment ${matchedPayment.id} (${matchedPayment.case_number})`;
          } else {
            matchStatus = "AMOUNT_MISMATCH";
            discrepancyCount++;
            notes = `Discrepancy: Statement ₹${fromPaise(amountPaise)} vs System ₹${fromPaise(systemPaise)} (Diff: ₹${fromPaise(amountPaise - systemPaise)})`;
          }
        }
      }

      previewItems.push({
        id: `prev_item_${uuidv4().slice(0, 8)}`,
        bank_txn_ref: ref,
        statement_amount: Number(fromPaise(amountPaise)),
        statement_date: row.txn_date || now,
        match_status: matchStatus,
        matched_payment_id: matchedPayment ? matchedPayment.id : null,
        case_number: matchedPayment ? matchedPayment.case_number : null,
        borrower_name: matchedPayment ? matchedPayment.borrower_name : null,
        notes
      });
    }

    const previewData = {
      preview_id: previewId,
      filename,
      uploaded_by_id: uploadedById,
      reconciliation_type: type,
      total_rows: parsedRows.length,
      matched_count: matchedCount,
      unmatched_count: unmatchedCount,
      discrepancy_count: discrepancyCount,
      duplicate_count: duplicateCount,
      total_statement_amount: Number(fromPaise(totalStatementPaise)),
      total_matched_amount: Number(fromPaise(totalMatchedPaise)),
      status: "PREVIEW_READY",
      items: previewItems,
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour validity
      created_at: now
    };

    // Stage preview in session cache
    this.previewSessions.set(previewId, previewData);

    return previewData;
  },

  /**
   * Confirm an existing reconciliation preview and apply ledger updates atomically
   */
  async confirmReconciliation({
    previewId,
    confirmedById,
    userRole,
    autoReconcileMatched = true
  }) {
    if (["CALLER", "FIELD_AGENT"].includes(userRole)) {
      const err = new Error("Unauthorized: Only Supervisors and Admins can confirm reconciliation settlements.");
      err.statusCode = 403;
      throw err;
    }

    const preview = this.previewSessions.get(previewId);
    if (!preview) {
      const err = new Error(`Reconciliation preview '${previewId}' not found or session has expired.`);
      err.statusCode = 410;
      throw err;
    }

    if (preview.status === "CONFIRMED") {
      const err = new Error("This reconciliation session has already been executed.");
      err.statusCode = 409;
      throw err;
    }

    const batchId = `rec_batch_${Date.now()}_${uuidv4().slice(0, 6)}`;
    const now = new Date().toISOString();

    const execute = async (trxClient) => {
      // 1. Create permanent reconciliation batch record
      if (db.isPgActive()) {
        await trxClient.query(
          `INSERT INTO reconciliation_batches (
            id, filename, uploaded_by_id, total_records, matched_records,
            unmatched_records, discrepancy_records, total_amount, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            batchId,
            preview.filename,
            confirmedById,
            preview.total_rows,
            preview.matched_count,
            preview.unmatched_count,
            preview.discrepancy_count,
            preview.total_statement_amount,
            "COMPLETED",
            now
          ]
        );
      } else {
        if (!memoryStore.reconciliation_batches) memoryStore.reconciliation_batches = [];
        memoryStore.reconciliation_batches.unshift({
          id: batchId,
          filename: preview.filename,
          uploaded_by_id: confirmedById,
          total_records: preview.total_rows,
          matched_records: preview.matched_count,
          unmatched_records: preview.unmatched_count,
          discrepancy_records: preview.discrepancy_count,
          total_amount: preview.total_statement_amount,
          status: "COMPLETED",
          created_at: now
        });
      }

      // 2. Insert items and update matched payments
      for (const item of preview.items) {
        const recordId = `rr_${uuidv4()}`;

        if (db.isPgActive()) {
          await trxClient.query(
            `INSERT INTO reconciliation_records (
              id, batch_id, bank_txn_ref, amount, txn_date, matched_payment_id, match_status, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              recordId,
              batchId,
              item.bank_txn_ref,
              item.statement_amount,
              item.statement_date,
              item.matched_payment_id,
              item.match_status,
              item.notes,
              now
            ]
          );

          if (item.match_status === "MATCHED" && item.matched_payment_id && autoReconcileMatched) {
            await trxClient.query(
              "UPDATE payments SET reconciliation_status = 'RECONCILED' WHERE id = $1",
              [item.matched_payment_id]
            );
          }
        } else {
          if (!memoryStore.reconciliation_records) memoryStore.reconciliation_records = [];
          memoryStore.reconciliation_records.unshift({
            id: recordId,
            batch_id: batchId,
            bank_txn_ref: item.bank_txn_ref,
            amount: item.statement_amount,
            txn_date: item.statement_date,
            matched_payment_id: item.matched_payment_id,
            match_status: item.match_status,
            notes: item.notes,
            created_at: now
          });

          if (item.match_status === "MATCHED" && item.matched_payment_id && autoReconcileMatched) {
            const pay = (memoryStore.payments || []).find(p => p.id === item.matched_payment_id);
            if (pay) pay.reconciliation_status = "RECONCILED";
          }
        }
      }

      preview.status = "CONFIRMED";
      preview.batch_id = batchId;

      return {
        batch_id: batchId,
        preview_id: previewId,
        total_records: preview.total_rows,
        matched_records: preview.matched_count,
        unmatched_records: preview.unmatched_count,
        discrepancy_records: preview.discrepancy_count,
        status: "COMPLETED",
        reconciled_at: now
      };
    };

    if (db.isPgActive()) {
      return await db.transaction(execute);
    }
    return await execute(null);
  },

  /**
   * List historical reconciliation batches
   */
  async listBatches({ page = 1, limit = 50 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const countRes = await db.query("SELECT COUNT(*) as count FROM reconciliation_batches");
      const total = parseInt(countRes.rows[0]?.count || 0, 10);

      const res = await db.query(
        `SELECT rb.*, u.full_name as uploaded_by_name
         FROM reconciliation_batches rb
         LEFT JOIN users u ON rb.uploaded_by_id = u.id
         ORDER BY rb.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limitNum, offset]
      );

      return {
        batches: res.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    const list = [...(memoryStore.reconciliation_batches || [])];
    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(b => {
      const u = (memoryStore.users || []).find(user => user.id === b.uploaded_by_id);
      return {
        ...b,
        uploaded_by_name: u ? u.full_name : "System Staff"
      };
    });

    return {
      batches: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  },

  /**
   * Get single reconciliation batch with its line-item records
   */
  async getBatchDetails(batchId) {
    if (db.isPgActive()) {
      const bRes = await db.query(
        "SELECT rb.*, u.full_name as uploaded_by_name FROM reconciliation_batches rb LEFT JOIN users u ON rb.uploaded_by_id = u.id WHERE rb.id = $1",
        [batchId]
      );
      const batch = bRes.rows[0];
      if (!batch) return null;

      const rRes = await db.query(
        `SELECT rr.*, p.case_id, lc.case_number, lc.borrower_name
         FROM reconciliation_records rr
         LEFT JOIN payments p ON rr.matched_payment_id = p.id
         LEFT JOIN loan_cases lc ON p.case_id = lc.id
         WHERE rr.batch_id = $1
         ORDER BY rr.txn_date DESC`,
        [batchId]
      );

      return {
        ...batch,
        records: rRes.rows
      };
    }

    const batch = (memoryStore.reconciliation_batches || []).find(b => b.id === batchId);
    if (!batch) return null;

    const u = (memoryStore.users || []).find(user => user.id === batch.uploaded_by_id);
    const records = (memoryStore.reconciliation_records || [])
      .filter(r => r.batch_id === batchId)
      .map(r => {
        const p = (memoryStore.payments || []).find(pay => pay.id === r.matched_payment_id);
        const lc = p ? (memoryStore.loan_cases || []).find(c => c.id === p.case_id) : null;
        return {
          ...r,
          case_id: p ? p.case_id : null,
          case_number: lc ? lc.case_number : null,
          borrower_name: lc ? (lc.borrower_name || lc.customer_name) : null
        };
      });

    return {
      ...batch,
      uploaded_by_name: u ? u.full_name : "System Staff",
      records
    };
  }
};

export default reconciliationService;

