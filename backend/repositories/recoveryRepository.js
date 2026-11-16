import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import db, { memoryStore } from "../config/db.js";
import { toPaise, fromPaise, toCurrencyNumber } from "./paymentRepository.js";
import { followupRepository } from "./followupRepository.js";

/**
 * Recovery & Collections Repository
 * Manages PTP commitments, customer omnichannel contacts, reconciliation batches, and performance targets.
 */
export const recoveryRepository = {
  /**
   * Create a Promise-to-Pay (PTP) commitment with validation
   */
  async createPTP({
    caseId,
    customerId,
    createdById,
    promisedAmount,
    promisedDate,
    paymentMode = "UPI",
    remarks = ""
  }, client = null) {
    const amountPaise = toPaise(promisedAmount);
    if (amountPaise <= 0n) {
      throw new Error("Invalid promised amount. Amount must be a positive number.");
    }
    const formattedAmount = fromPaise(amountPaise);
    const numAmount = Number(formattedAmount);

    const pDate = new Date(promisedDate);
    if (isNaN(pDate.getTime())) {
      throw new Error("Invalid promised date format.");
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (pDate < todayStart) {
      throw new Error("Promise to Pay date cannot be in the past.");
    }

    const now = new Date().toISOString();
    const ptpId = `ptp_${uuidv4()}`;

    if (db.isPgActive()) {
      const q = client || db.getPool();

      // Verify case exists
      const caseRes = await q.query(
        "SELECT id, customer_id FROM loan_cases WHERE id = $1 OR case_number = $1",
        [caseId]
      );
      const targetCase = caseRes.rows[0];
      if (!targetCase) throw new Error(`Loan case '${caseId}' not found.`);

      const resolvedCaseId = targetCase.id;
      const targetCustomerId = customerId || targetCase.customer_id;

      const res = await q.query(
        `INSERT INTO case_ptp_commitments (
          id, case_id, customer_id, created_by_id, promised_amount,
          promised_date, payment_mode, status, remarks, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          ptpId,
          resolvedCaseId,
          targetCustomerId,
          createdById,
          formattedAmount,
          pDate.toISOString(),
          paymentMode.toUpperCase(),
          "PENDING",
          remarks,
          now,
          now
        ]
      );

      // Also set follow_up_date on loan case
      await q.query(
        "UPDATE loan_cases SET follow_up_date = $1, updated_at = $2 WHERE id = $3",
        [pDate.toISOString(), now, resolvedCaseId]
      );

      return res.rows[0];
    }

    // In-memory fallback
    const targetCase = (memoryStore.loan_cases || []).find(c => c.id === caseId || c.case_number === caseId);
    if (!targetCase) throw new Error(`Loan case '${caseId}' not found.`);

    if (!memoryStore.case_ptp_commitments) memoryStore.case_ptp_commitments = [];

    const newPtp = {
      id: ptpId,
      case_id: targetCase.id,
      customer_id: customerId || targetCase.customer_id,
      created_by_id: createdById,
      promised_amount: numAmount,
      promised_date: pDate.toISOString(),
      payment_mode: paymentMode.toUpperCase(),
      status: "PENDING",
      fulfilled_payment_id: null,
      fulfilled_amount: 0.00,
      remarks,
      created_at: now,
      updated_at: now
    };

    memoryStore.case_ptp_commitments.unshift(newPtp);
    targetCase.follow_up_date = pDate.toISOString();
    targetCase.updated_at = now;

    return { ...newPtp };
  },

  /**
   * List PTP commitments with filtering
   */
  async listPTPs({
    caseId,
    employeeId,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = {}, client = null) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      const whereClauses = [];

      if (caseId) {
        params.push(caseId);
        whereClauses.push(`ptp.case_id = $${params.length}`);
      }
      if (employeeId) {
        params.push(employeeId);
        whereClauses.push(`ptp.created_by_id = $${params.length}`);
      }
      if (status && status !== "ALL") {
        params.push(status.toUpperCase());
        whereClauses.push(`ptp.status = $${params.length}`);
      }
      if (startDate) {
        params.push(new Date(startDate).toISOString());
        whereClauses.push(`ptp.promised_date >= $${params.length}`);
      }
      if (endDate) {
        params.push(new Date(endDate).toISOString());
        whereClauses.push(`ptp.promised_date <= $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countRes = await q.query(
        `SELECT COUNT(*) as count, COALESCE(SUM(promised_amount), 0) as total_promised
         FROM case_ptp_commitments ptp
         ${whereSql}`,
        params
      );
      const total = parseInt(countRes.rows[0]?.count || 0, 10);
      const totalPromised = parseFloat(countRes.rows[0]?.total_promised || 0);

      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT ptp.*,
                lc.case_number, lc.loan_account_no, lc.outstanding_amount,
                c.full_name as customer_name, c.phone as customer_phone,
                u.full_name as created_by_name
         FROM case_ptp_commitments ptp
         JOIN loan_cases lc ON ptp.case_id = lc.id
         JOIN customers c ON ptp.customer_id = c.id
         LEFT JOIN users u ON ptp.created_by_id = u.id
         ${whereSql}
         ORDER BY ptp.promised_date ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      return {
        ptps: dataRes.rows,
        total,
        totalPromised,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    // In-memory fallback
    let list = [...(memoryStore.case_ptp_commitments || [])];
    if (caseId) list = list.filter(p => p.case_id === caseId);
    if (employeeId) list = list.filter(p => p.created_by_id === employeeId);
    if (status && status !== "ALL") list = list.filter(p => p.status?.toUpperCase() === status.toUpperCase());
    if (startDate) list = list.filter(p => p.promised_date >= startDate);
    if (endDate) list = list.filter(p => p.promised_date <= endDate);

    list.sort((a, b) => new Date(a.promised_date) - new Date(b.promised_date));
    const total = list.length;
    const totalPromised = list.reduce((sum, p) => sum + (Number(p.promised_amount) || 0), 0);

    const paginated = list.slice(offset, offset + limitNum).map(ptp => {
      const lc = (memoryStore.loan_cases || []).find(c => c.id === ptp.case_id);
      const cust = (memoryStore.customers || []).find(c => c.id === ptp.customer_id);
      const u = (memoryStore.users || []).find(usr => usr.id === ptp.created_by_id);
      return {
        ...ptp,
        case_number: lc ? lc.case_number : "Unknown",
        loan_account_no: lc ? lc.loan_account_no : "Unknown",
        outstanding_amount: lc ? lc.outstanding_amount : 0,
        customer_name: cust ? cust.full_name : "Unknown",
        customer_phone: cust ? cust.phone : "Unknown",
        created_by_name: u ? u.full_name : "Unknown"
      };
    });

    return {
      ptps: paginated,
      total,
      totalPromised,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  },

  /**
   * Automatically detect and mark overdue PTPs as BROKEN
   */
  async checkBrokenPTPs(client = null) {
    const now = new Date();
    const nowIso = now.toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE case_ptp_commitments
         SET status = 'BROKEN', updated_at = $1
         WHERE status = 'PENDING' AND promised_date < $1
         RETURNING id, case_id, promised_amount, promised_date`,
        [nowIso]
      );
      return res.rows;
    }

    // In-memory fallback
    const broken = [];
    (memoryStore.case_ptp_commitments || []).forEach(ptp => {
      if (ptp.status === "PENDING" && new Date(ptp.promised_date) < now) {
        ptp.status = "BROKEN";
        ptp.updated_at = nowIso;
        broken.push({ id: ptp.id, case_id: ptp.case_id, promised_amount: ptp.promised_amount, promised_date: ptp.promised_date });
      }
    });

    return broken;
  },

  /**
   * Evaluate and link PTP fulfillment on verified payment
   */
  async fulfillPTPForCase(caseId, paymentAmount, paymentId, client = null) {
    const payPaise = toPaise(paymentAmount);
    const nowIso = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      // Find oldest pending PTP for this case
      const ptpRes = await q.query(
        `SELECT * FROM case_ptp_commitments
         WHERE case_id = $1 AND status = 'PENDING'
         ORDER BY promised_date ASC
         LIMIT 1
         FOR UPDATE`,
        [caseId]
      );

      const ptp = ptpRes.rows[0];
      if (!ptp) return null;

      const promisedPaise = toPaise(ptp.promised_amount);
      const isFull = payPaise >= promisedPaise;
      const targetStatus = isFull ? "FULFILLED" : "PARTIALLY_FULFILLED";

      const updateRes = await q.query(
        `UPDATE case_ptp_commitments
         SET status = $1, fulfilled_payment_id = $2, fulfilled_amount = $3::numeric, updated_at = $4
         WHERE id = $5
         RETURNING *`,
        [targetStatus, paymentId, fromPaise(payPaise), nowIso, ptp.id]
      );

      return updateRes.rows[0];
    }

    // In-memory fallback
    const ptps = (memoryStore.case_ptp_commitments || [])
      .filter(p => p.case_id === caseId && p.status === "PENDING")
      .sort((a, b) => new Date(a.promised_date) - new Date(b.promised_date));

    if (ptps.length === 0) return null;

    const ptp = ptps[0];
    const promisedPaise = toPaise(ptp.promised_amount);
    const isFull = payPaise >= promisedPaise;
    ptp.status = isFull ? "FULFILLED" : "PARTIALLY_FULFILLED";
    ptp.fulfilled_payment_id = paymentId;
    ptp.fulfilled_amount = Number(fromPaise(payPaise));
    ptp.updated_at = nowIso;

    return { ...ptp };
  },

  /**
   * Log omnichannel customer contact
   */
  async recordCustomerContact({
    caseId,
    customerId,
    contactedById,
    contactMethod,
    outcome,
    discussionNotes = "",
    nextCallbackDate = null
  }, client = null) {
    const validMethods = ["PHONE_CALL", "FIELD_VISIT", "WHATSAPP", "SMS", "IN_PERSON", "EMAIL"];
    const validOutcomes = [
      "PROMISE_TO_PAY",
      "REFUSED_TO_PAY",
      "DISPUTED",
      "CALL_BACK",
      "UNREACHABLE",
      "WRONG_NUMBER",
      "PAID"
    ];

    const method = (contactMethod || "PHONE_CALL").toUpperCase();
    const cleanOutcome = (outcome || "CALL_BACK").toUpperCase();

    if (!validMethods.includes(method)) {
      throw new Error(`Invalid contact method '${contactMethod}'. Supported: ${validMethods.join(", ")}`);
    }
    if (!validOutcomes.includes(cleanOutcome)) {
      throw new Error(`Invalid contact outcome '${outcome}'. Supported: ${validOutcomes.join(", ")}`);
    }

    const contactId = `cnt_${uuidv4()}`;
    const now = new Date().toISOString();
    const callbackIso = nextCallbackDate ? new Date(nextCallbackDate).toISOString() : null;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const caseRes = await q.query(
        "SELECT id, customer_id FROM loan_cases WHERE id = $1 OR case_number = $1",
        [caseId]
      );
      const targetCase = caseRes.rows[0];
      if (!targetCase) throw new Error(`Loan case '${caseId}' not found.`);

      const resolvedCaseId = targetCase.id;
      const targetCustomerId = customerId || targetCase.customer_id;

      const res = await q.query(
        `INSERT INTO customer_contacts (
          id, case_id, customer_id, contacted_by_id, contact_date,
          contact_method, outcome, discussion_notes, next_callback_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          contactId,
          resolvedCaseId,
          targetCustomerId,
          contactedById,
          now,
          method,
          cleanOutcome,
          discussionNotes,
          callbackIso,
          now
        ]
      );

      if (callbackIso) {
        await q.query(
          "UPDATE loan_cases SET follow_up_date = $1, updated_at = $2 WHERE id = $3",
          [callbackIso, now, resolvedCaseId]
        );
      }

      return res.rows[0];
    }

    // In-memory fallback
    const targetCase = (memoryStore.loan_cases || []).find(c => c.id === caseId || c.case_number === caseId);
    if (!targetCase) throw new Error(`Loan case '${caseId}' not found.`);

    if (!memoryStore.customer_contacts) memoryStore.customer_contacts = [];

    const newContact = {
      id: contactId,
      case_id: targetCase.id,
      customer_id: customerId || targetCase.customer_id,
      contacted_by_id: contactedById,
      contact_date: now,
      contact_method: method,
      outcome: cleanOutcome,
      discussion_notes: discussionNotes,
      next_callback_date: callbackIso,
      created_at: now
    };

    memoryStore.customer_contacts.unshift(newContact);

    if (callbackIso) {
      targetCase.follow_up_date = callbackIso;
      targetCase.updated_at = now;
    }

    return { ...newContact };
  },

  /**
   * List customer contacts
   */
  async listCustomerContacts({
    caseId,
    contactedById,
    outcome,
    page = 1,
    limit = 50
  } = {}, client = null) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const params = [];
      const whereClauses = [];

      if (caseId) {
        params.push(caseId);
        whereClauses.push(`cc.case_id = $${params.length}`);
      }
      if (contactedById) {
        params.push(contactedById);
        whereClauses.push(`cc.contacted_by_id = $${params.length}`);
      }
      if (outcome && outcome !== "ALL") {
        params.push(outcome.toUpperCase());
        whereClauses.push(`cc.outcome = $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countRes = await q.query(
        `SELECT COUNT(*) as count FROM customer_contacts cc ${whereSql}`,
        params
      );
      const total = parseInt(countRes.rows[0]?.count || 0, 10);

      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT cc.*,
                lc.case_number, lc.loan_account_no,
                c.full_name as customer_name, c.phone as customer_phone,
                u.full_name as agent_name
         FROM customer_contacts cc
         JOIN loan_cases lc ON cc.case_id = lc.id
         JOIN customers c ON cc.customer_id = c.id
         LEFT JOIN users u ON cc.contacted_by_id = u.id
         ${whereSql}
         ORDER BY cc.contact_date DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      return {
        contacts: dataRes.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    // In-memory fallback
    let list = [...(memoryStore.customer_contacts || [])];
    if (caseId) list = list.filter(c => c.case_id === caseId);
    if (contactedById) list = list.filter(c => c.contacted_by_id === contactedById);
    if (outcome && outcome !== "ALL") list = list.filter(c => c.outcome === outcome.toUpperCase());

    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(c => {
      const lc = (memoryStore.loan_cases || []).find(item => item.id === c.case_id);
      const cust = (memoryStore.customers || []).find(item => item.id === c.customer_id);
      const u = (memoryStore.users || []).find(item => item.id === c.contacted_by_id);
      return {
        ...c,
        case_number: lc ? lc.case_number : "Unknown",
        loan_account_no: lc ? lc.loan_account_no : "Unknown",
        customer_name: cust ? cust.full_name : "Unknown",
        customer_phone: cust ? cust.phone : "Unknown",
        agent_name: u ? u.full_name : "Unknown"
      };
    });

    return {
      contacts: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  },

  /**
   * Process Bank / Payment Gateway Statement Reconciliation
   */
  async processBankStatement({
    filename,
    uploadedById,
    statementRows = [],
    autoReconcile = true
  }, client = null) {
    if (!statementRows || !Array.isArray(statementRows) || statementRows.length === 0) {
      throw new Error("No statement rows provided for reconciliation.");
    }

    const batchId = `rec_${uuidv4()}`;
    const now = new Date().toISOString();

    let matchedCount = 0;
    let unmatchedCount = 0;
    let discrepancyCount = 0;
    let totalAmountPaise = 0n;

    const reconciledRecords = [];

    // Helper to find payment by txn ref
    const findPaymentByRef = async (ref, q) => {
      if (db.isPgActive()) {
        const res = await q.query(
          "SELECT * FROM payments WHERE transaction_ref = $1",
          [ref]
        );
        return res.rows[0] || null;
      }
      return (memoryStore.payments || []).find(p => p.transaction_ref === ref) || null;
    };

    const q = client || (db.isPgActive() ? db.getPool() : null);

    for (const row of statementRows) {
      const bankTxnRef = (row.bank_txn_ref || row.transaction_ref || row.ref || "").trim();
      const rawAmount = row.amount || row.txn_amount || 0;
      const rowPaise = toPaise(rawAmount);
      totalAmountPaise += rowPaise;

      const txnDate = row.txn_date || row.date || now;

      let matchStatus = "UNMATCHED";
      let matchedPaymentId = null;
      let notes = row.notes || "";

      if (!bankTxnRef) {
        matchStatus = "UNMATCHED";
        notes = "Missing bank transaction reference";
        unmatchedCount++;
      } else {
        const payment = await findPaymentByRef(bankTxnRef, q);
        if (!payment) {
          matchStatus = "UNMATCHED";
          notes = "Transaction reference not found in recorded payments";
          unmatchedCount++;
        } else {
          matchedPaymentId = payment.id;
          const paymentPaise = toPaise(payment.amount);

          if (paymentPaise === rowPaise) {
            matchStatus = "MATCHED";
            matchedCount++;
            notes = `Exact match with payment ${payment.id}`;

            if (autoReconcile) {
              if (db.isPgActive()) {
                await q.query(
                  "UPDATE payments SET reconciliation_status = 'RECONCILED' WHERE id = $1",
                  [payment.id]
                );
              } else {
                payment.reconciliation_status = "RECONCILED";
              }
            }
          } else {
            matchStatus = "AMOUNT_MISMATCH";
            discrepancyCount++;
            notes = `Amount mismatch: Statement ₹${fromPaise(rowPaise)} vs System ₹${fromPaise(paymentPaise)}`;
          }
        }
      }

      reconciledRecords.push({
        id: `rr_${uuidv4()}`,
        batch_id: batchId,
        bank_txn_ref: bankTxnRef || `UNKNOWN-${Date.now()}`,
        amount: Number(fromPaise(rowPaise)),
        txn_date: new Date(txnDate).toISOString(),
        matched_payment_id: matchedPaymentId,
        match_status: matchStatus,
        notes,
        created_at: now
      });
    }

    const totalBatchAmount = Number(fromPaise(totalAmountPaise));

    if (db.isPgActive()) {
      await q.query(
        `INSERT INTO reconciliation_batches (
          id, filename, uploaded_by_id, total_records, matched_records,
          unmatched_records, discrepancy_records, total_amount, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          batchId,
          filename || "bank_statement.csv",
          uploadedById,
          statementRows.length,
          matchedCount,
          unmatchedCount,
          discrepancyCount,
          totalBatchAmount,
          "COMPLETED",
          now
        ]
      );

      for (const rec of reconciledRecords) {
        await q.query(
          `INSERT INTO reconciliation_records (
            id, batch_id, bank_txn_ref, amount, txn_date, matched_payment_id, match_status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            rec.id,
            rec.batch_id,
            rec.bank_txn_ref,
            rec.amount,
            rec.txn_date,
            rec.matched_payment_id,
            rec.match_status,
            rec.notes,
            rec.created_at
          ]
        );
      }
    } else {
      if (!memoryStore.reconciliation_batches) memoryStore.reconciliation_batches = [];
      if (!memoryStore.reconciliation_records) memoryStore.reconciliation_records = [];

      memoryStore.reconciliation_batches.unshift({
        id: batchId,
        filename: filename || "bank_statement.csv",
        uploaded_by_id: uploadedById,
        total_records: statementRows.length,
        matched_records: matchedCount,
        unmatched_records: unmatchedCount,
        discrepancy_records: discrepancyCount,
        total_amount: totalBatchAmount,
        status: "COMPLETED",
        created_at: now
      });

      memoryStore.reconciliation_records.unshift(...reconciledRecords);
    }

    return {
      batchId,
      filename: filename || "bank_statement.csv",
      totalRecords: statementRows.length,
      matchedRecords: matchedCount,
      unmatchedRecords: unmatchedCount,
      discrepancyRecords: discrepancyCount,
      totalAmount: totalBatchAmount,
      records: reconciledRecords
    };
  },

  /**
   * Collector Recovery Performance Dashboard
   */
  async getCollectorPerformance({ employeeId, month, year } = {}) {
    const currentMonth = month || new Date().toLocaleString("en-US", { month: "short" });
    const currentYear = year || new Date().getFullYear();
    const monthYear = `${currentYear}-${new Date().getMonth() + 1 < 10 ? '0' : ''}${new Date().getMonth() + 1}`;

    let users = [];
    let cases = [];
    let payments = [];
    let ptps = [];
    let contacts = [];
    let targets = [];

    if (db.isPgActive()) {
      const pool = db.getPool();
      let userQuery = "SELECT * FROM users WHERE role IN ('CALLER', 'FIELD_AGENT') AND is_active = true";
      const userParams = [];
      if (employeeId) {
        userParams.push(employeeId);
        userQuery += ` AND id = $1`;
      }
      const uRes = await pool.query(userQuery, userParams);
      users = uRes.rows;

      const cRes = await pool.query("SELECT * FROM loan_cases");
      cases = cRes.rows;

      const pRes = await pool.query("SELECT * FROM payments WHERE verification_status = 'VERIFIED' AND is_reversed = false");
      payments = pRes.rows;

      const ptpRes = await pool.query("SELECT * FROM case_ptp_commitments");
      ptps = ptpRes.rows;

      const cntRes = await pool.query("SELECT * FROM customer_contacts");
      contacts = cntRes.rows;

      const tRes = await pool.query("SELECT * FROM targets");
      targets = tRes.rows;
    } else {
      users = (memoryStore.users || []).filter(u => ["CALLER", "FIELD_AGENT"].includes(u.role) && u.is_active);
      if (employeeId) {
        users = users.filter(u => u.id === employeeId || u.employee_id === employeeId);
      }
      cases = memoryStore.loan_cases || [];
      payments = (memoryStore.payments || []).filter(p => p.verification_status !== "FAILED" && p.verification_status !== "REVERSED" && !p.is_reversed);
      ptps = memoryStore.case_ptp_commitments || [];
      contacts = memoryStore.customer_contacts || [];
      targets = memoryStore.targets || [];
    }

    const performance = users.map(user => {
      const assignedCases = cases.filter(c => c.assigned_employee_id === user.id || c.assigned_employee_id === user.employee_id);
      const userPayments = payments.filter(p => p.collected_by_id === user.id);
      const userPtps = ptps.filter(p => p.created_by_id === user.id);
      const userContacts = contacts.filter(c => c.contacted_by_id === user.id);

      const targetRecord = targets.find(t => (t.employee_id === user.id || t.employee_id === user.employee_id));
      const targetAmount = targetRecord ? Number(targetRecord.target_amount) : 500000;

      let verifiedCollectedPaise = 0n;
      userPayments.forEach(p => {
        verifiedCollectedPaise += toPaise(p.amount);
      });
      const verifiedCollected = Number(fromPaise(verifiedCollectedPaise));

      const fulfilledPtps = userPtps.filter(p => p.status === "FULFILLED").length;
      const ptfRate = userPtps.length > 0 ? Math.round((fulfilledPtps / userPtps.length) * 100) : 0;

      const contactReachRate = assignedCases.length > 0
        ? Math.min(100, Math.round((userContacts.length / assignedCases.length) * 100))
        : 0;

      const achievementPct = targetAmount > 0
        ? Math.round((verifiedCollected / targetAmount) * 10000) / 100
        : 0;

      return {
        user_id: user.id,
        employee_id: user.employee_id,
        full_name: user.full_name,
        role: user.role,
        department: user.department || "Operations",
        target_amount: targetAmount,
        verified_collected_amount: verifiedCollected,
        achievement_percentage: achievementPct,
        assigned_cases_count: assignedCases.length,
        contacts_count: userContacts.length,
        reach_rate: contactReachRate,
        ptp_generated_count: userPtps.length,
        ptp_fulfilled_count: fulfilledPtps,
        ptp_fulfillment_rate: ptfRate,
        month: currentMonth,
        year: currentYear
      };
    });

    return {
      month: currentMonth,
      year: currentYear,
      collectors: performance
    };
  },

  /**
   * Anti-formula-injection CSV sanitizer
   * Prepends a single quote if the first character is =, +, -, @, \t, or \r
   */
  sanitizeCsvCell(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const dangerousPrefixes = ["=", "+", "-", "@", "\t", "\r"];
    if (str.length > 0 && dangerousPrefixes.includes(str[0])) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  }
};

export default recoveryRepository;
