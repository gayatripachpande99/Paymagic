import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import db, { memoryStore } from "../config/db.js";
import { recoveryRepository } from "./recoveryRepository.js";

/**
 * Exact Decimal Arithmetic Helpers (Integer Paise)
 * 1 INR = 100 Paise. Eliminates IEEE-754 binary floating-point precision loss.
 */
export const toPaise = (amount) => {
  if (amount === null || amount === undefined) return 0n;
  const str = String(amount).trim();
  if (!str || isNaN(Number(str))) {
    throw new Error(`Invalid monetary amount: '${amount}'`);
  }
  const sign = str.startsWith("-") ? -1n : 1n;
  const clean = str.replace("-", "");
  const parts = clean.split(".");
  const intPart = BigInt(parts[0] || "0");
  let fracPartStr = (parts[1] || "").slice(0, 2);
  while (fracPartStr.length < 2) fracPartStr += "0";
  const fracPart = BigInt(fracPartStr);
  return sign * (intPart * 100n + fracPart);
};

export const fromPaise = (paise) => {
  const p = BigInt(paise);
  const sign = p < 0n ? "-" : "";
  const abs = p < 0n ? -p : p;
  const intPart = abs / 100n;
  const fracPart = abs % 100n;
  return `${sign}${intPart}.${fracPart.toString().padStart(2, "0")}`;
};

export const toCurrencyNumber = (paise) => {
  return Number(fromPaise(paise));
};

/**
 * Payment Repository
 * ACID transactional persistence for loan collections, verification workflows, reversals, and receipts.
 */
export const paymentRepository = {
  /**
   * Record a payment against a loan case with atomic row-locking and verification status
   */
  async recordPayment({
    caseId,
    customerId,
    collectedById,
    amount,
    paymentMode = "UPI",
    transactionRef = null,
    receiptNumber = null,
    notes = "",
    verificationStatus = "VERIFIED",
    settlementType = "PARTIAL"
  }, client = null) {
    const paymentPaise = toPaise(amount);
    if (paymentPaise <= 0n) {
      throw new Error("Invalid payment amount. Amount must be a positive number.");
    }
    const paymentFormatted = fromPaise(paymentPaise);
    const paymentAmount = Number(paymentFormatted);

    const now = new Date().toISOString();
    const txnRef = transactionRef || `TXN-PM-${Date.now().toString().slice(-8)}`;
    const rcpNum = receiptNumber || `RCP-PAY-${Date.now().toString().slice(-8)}`;
    const isPendingVerification = verificationStatus === "PENDING_VERIFICATION";

    const execute = async (trxClient) => {
      if (db.isPgActive()) {
        // 1. Prevent duplicate transaction reference
        const dupCheck = await trxClient.query(
          "SELECT id FROM payments WHERE transaction_ref = $1",
          [txnRef]
        );
        if (dupCheck.rows.length > 0) {
          const err = new Error(`Duplicate transaction reference: Payment with reference '${txnRef}' has already been processed.`);
          err.code = "DUPLICATE_PAYMENT";
          err.statusCode = 409;
          throw err;
        }

        // 2. Lock the target loan case row to prevent concurrent balance corruption
        const caseRes = await trxClient.query(
          "SELECT * FROM loan_cases WHERE id = $1 OR case_number = $1 FOR UPDATE",
          [caseId]
        );
        const currentCase = caseRes.rows[0];
        if (!currentCase) {
          throw new Error(`Loan case '${caseId}' not found.`);
        }

        const resolvedCaseId = currentCase.id;
        const targetCustomerId = customerId || currentCase.customer_id;
        const paymentId = `pay_${uuidv4()}`;

        // If PENDING_VERIFICATION, do NOT update balance or status yet
        if (isPendingVerification) {
          const insertPaymentRes = await trxClient.query(
            `INSERT INTO payments (
              id, case_id, customer_id, collected_by_id, amount, payment_mode,
              transaction_ref, receipt_number, reconciliation_status, verification_status,
              verified_by_id, verified_at, settlement_type, payment_date, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
              paymentId,
              resolvedCaseId,
              targetCustomerId,
              collectedById,
              paymentFormatted,
              paymentMode.toUpperCase(),
              txnRef,
              rcpNum,
              "PENDING",
              "PENDING_VERIFICATION",
              null,
              null,
              settlementType,
              now,
              notes,
              now
            ]
          );

          db.cacheService.delPattern("cases:*");
          db.cacheService.delPattern("dashboard:*");

          return {
            payment: insertPaymentRes.rows[0],
            case: currentCase
          };
        }

        // VERIFIED immediate processing: calculate balance & update
        const prevOutstandingPaise = toPaise(currentCase.outstanding_amount || 0);
        const prevRecoveredPaise = toPaise(currentCase.total_recovered_amount || 0);

        const newOutstandingPaise = prevOutstandingPaise > paymentPaise ? prevOutstandingPaise - paymentPaise : 0n;
        const newRecoveredPaise = prevRecoveredPaise + paymentPaise;

        const newOutstandingStr = fromPaise(newOutstandingPaise);
        const newRecoveredStr = fromPaise(newRecoveredPaise);

        const prevStatus = currentCase.status;
        let targetStatus = prevStatus;
        if (newOutstandingPaise === 0n) {
          targetStatus = "Fully Paid";
        } else if (targetStatus !== "Fully Paid") {
          targetStatus = "Partially Paid";
        }

        // Update loan case balance and status
        const updateRes = await trxClient.query(
          `UPDATE loan_cases
           SET outstanding_amount = $1::numeric, total_recovered_amount = $2::numeric, status = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [newOutstandingStr, newRecoveredStr, targetStatus, now, resolvedCaseId]
        );

        // Insert payment record
        const insertPaymentRes = await trxClient.query(
          `INSERT INTO payments (
            id, case_id, customer_id, collected_by_id, amount, payment_mode,
            transaction_ref, receipt_number, reconciliation_status, verification_status,
            verified_by_id, verified_at, settlement_type, payment_date, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *`,
          [
            paymentId,
            resolvedCaseId,
            targetCustomerId,
            collectedById,
            paymentFormatted,
            paymentMode.toUpperCase(),
            txnRef,
            rcpNum,
            "RECONCILED",
            "VERIFIED",
            collectedById,
            now,
            settlementType,
            now,
            notes,
            now
          ]
        );

        // Create official receipt
        const signatureHash = crypto
          .createHash("sha256")
          .update(`${rcpNum}:${paymentId}:${resolvedCaseId}:${paymentFormatted}:${newOutstandingStr}`)
          .digest("hex");

        await trxClient.query(
          `INSERT INTO payment_receipts (
            id, receipt_number, payment_id, case_id, customer_id, issued_by_id,
            amount, balance_after_payment, signature_hash, receipt_data, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            `rcp_${uuidv4()}`,
            rcpNum,
            paymentId,
            resolvedCaseId,
            targetCustomerId,
            collectedById,
            paymentFormatted,
            newOutstandingStr,
            signatureHash,
            JSON.stringify({
              payment_id: paymentId,
              case_id: resolvedCaseId,
              receipt_number: rcpNum,
              amount: paymentAmount,
              balance_after: Number(newOutstandingStr),
              payment_mode: paymentMode.toUpperCase(),
              transaction_ref: txnRef,
              issued_at: now
            }),
            now
          ]
        );

        // Fulfill matching PTP if exists
        await recoveryRepository.fulfillPTPForCase(resolvedCaseId, paymentAmount, paymentId, trxClient);

        // Insert audit log into case_status_history
        const auditId = `csh_${uuidv4()}`;
        await trxClient.query(
          `INSERT INTO case_status_history (
            id, case_id, employee_id, previous_status, new_status, source, reference_id, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            auditId,
            resolvedCaseId,
            collectedById,
            prevStatus,
            targetStatus,
            "Payment Settlement",
            paymentId,
            `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received via ${paymentMode.toUpperCase()}. Receipt: ${rcpNum}. Notes: ${notes}`,
            now
          ]
        );

        db.cacheService.delPattern("cases:*");
        db.cacheService.delPattern("dashboard:*");

        return {
          payment: insertPaymentRes.rows[0],
          case: updateRes.rows[0]
        };
      }

      // In-memory fallback (isolated to test runner / dev)
      const existingPay = (memoryStore.payments || []).find(p => p.transaction_ref === txnRef);
      if (existingPay) {
        const err = new Error(`Duplicate transaction reference: Payment with reference '${txnRef}' has already been processed.`);
        err.code = "DUPLICATE_PAYMENT";
        err.statusCode = 409;
        throw err;
      }

      const lc = (memoryStore.loan_cases || []).find(c => c.id === caseId || c.case_number === caseId);
      if (!lc) throw new Error(`Loan case '${caseId}' not found.`);

      const paymentId = `pay_${uuidv4()}`;

      if (isPendingVerification) {
        const paymentRecord = {
          id: paymentId,
          case_id: lc.id,
          customer_id: customerId || lc.customer_id,
          collected_by_id: collectedById,
          amount: paymentAmount,
          payment_mode: paymentMode.toUpperCase(),
          transaction_ref: txnRef,
          receipt_number: rcpNum,
          reconciliation_status: "PENDING",
          verification_status: "PENDING_VERIFICATION",
          verified_by_id: null,
          verified_at: null,
          is_reversed: false,
          settlement_type: settlementType,
          payment_date: now,
          notes: notes || `Offline collection pending supervisor verification.`,
          created_at: now
        };

        if (!memoryStore.payments) memoryStore.payments = [];
        memoryStore.payments.unshift(paymentRecord);

        return {
          payment: { ...paymentRecord },
          case: { ...lc }
        };
      }

      // VERIFIED immediate processing
      const prevOutstandingPaise = toPaise(lc.outstanding_amount || 0);
      const prevRecoveredPaise = toPaise(lc.total_recovered_amount || lc.recovered_amount || 0);

      const newOutstandingPaise = prevOutstandingPaise > paymentPaise ? prevOutstandingPaise - paymentPaise : 0n;
      const newRecoveredPaise = prevRecoveredPaise + paymentPaise;

      const newOutstandingNum = Number(fromPaise(newOutstandingPaise));
      const newRecoveredNum = Number(fromPaise(newRecoveredPaise));

      const prevStatus = lc.status;
      let targetStatus = prevStatus;
      if (newOutstandingPaise === 0n) {
        targetStatus = "Fully Paid";
      } else if (targetStatus !== "Fully Paid") {
        targetStatus = "Partially Paid";
      }

      lc.outstanding_amount = newOutstandingNum;
      lc.total_recovered_amount = newRecoveredNum;
      lc.recovered_amount = newRecoveredNum;
      lc.status = targetStatus;
      lc.updated_at = now;

      const paymentRecord = {
        id: paymentId,
        case_id: lc.id,
        customer_id: customerId || lc.customer_id,
        collected_by_id: collectedById,
        amount: paymentAmount,
        payment_mode: paymentMode.toUpperCase(),
        transaction_ref: txnRef,
        receipt_number: rcpNum,
        reconciliation_status: "RECONCILED",
        verification_status: "VERIFIED",
        verified_by_id: collectedById,
        verified_at: now,
        is_reversed: false,
        settlement_type: settlementType,
        payment_date: now,
        notes: notes || `Direct payment settlement for loan account ${lc.loan_account_no}`,
        created_at: now
      };

      if (!memoryStore.payments) memoryStore.payments = [];
      memoryStore.payments.unshift(paymentRecord);

      const signatureHash = crypto
        .createHash("sha256")
        .update(`${rcpNum}:${paymentId}:${lc.id}:${fromPaise(paymentPaise)}:${fromPaise(newOutstandingPaise)}`)
        .digest("hex");

      if (!memoryStore.payment_receipts) memoryStore.payment_receipts = [];
      memoryStore.payment_receipts.unshift({
        id: `rcp_${uuidv4()}`,
        receipt_number: rcpNum,
        payment_id: paymentId,
        case_id: lc.id,
        customer_id: customerId || lc.customer_id,
        issued_by_id: collectedById,
        amount: paymentAmount,
        balance_after_payment: newOutstandingNum,
        signature_hash: signatureHash,
        receipt_data: {
          payment_id: paymentId,
          case_id: lc.id,
          receipt_number: rcpNum,
          amount: paymentAmount,
          balance_after: newOutstandingNum,
          payment_mode: paymentMode.toUpperCase(),
          transaction_ref: txnRef,
          issued_at: now
        },
        created_at: now
      });

      // Fulfill matching PTP
      recoveryRepository.fulfillPTPForCase(lc.id, paymentAmount, paymentId);

      if (!memoryStore.case_status_history) memoryStore.case_status_history = [];
      memoryStore.case_status_history.unshift({
        id: `csh_${uuidv4()}`,
        case_id: lc.id,
        employee_id: collectedById,
        previous_status: prevStatus,
        new_status: targetStatus,
        source: "Payment Settlement",
        reference_id: paymentRecord.id,
        remarks: `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received via ${paymentMode.toUpperCase()}. Receipt: ${rcpNum}. Notes: ${notes}`,
        created_at: now
      });

      db.indexService.rebuild(memoryStore);
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return {
        payment: { ...paymentRecord },
        case: { ...lc }
      };
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Supervisor/Admin Payment Verification:
   * Approves a PENDING_VERIFICATION payment, applies balance reduction, creates receipt, and fulfills PTP.
   */
  async verifyPayment({ paymentId, verifiedById, notes = "" }, client = null) {
    const now = new Date().toISOString();

    const execute = async (trxClient) => {
      if (db.isPgActive()) {
        const payRes = await trxClient.query(
          "SELECT * FROM payments WHERE id = $1 FOR UPDATE",
          [paymentId]
        );
        const payment = payRes.rows[0];
        if (!payment) {
          throw new Error(`Payment '${paymentId}' not found.`);
        }
        if (payment.verification_status !== "PENDING_VERIFICATION") {
          throw new Error(`Payment '${paymentId}' is not pending verification (current status: ${payment.verification_status}).`);
        }

        const caseRes = await trxClient.query(
          "SELECT * FROM loan_cases WHERE id = $1 FOR UPDATE",
          [payment.case_id]
        );
        const targetCase = caseRes.rows[0];
        if (!targetCase) throw new Error(`Target case '${payment.case_id}' not found.`);

        const paymentPaise = toPaise(payment.amount);
        const prevOutstandingPaise = toPaise(targetCase.outstanding_amount || 0);
        const prevRecoveredPaise = toPaise(targetCase.total_recovered_amount || 0);

        const newOutstandingPaise = prevOutstandingPaise > paymentPaise ? prevOutstandingPaise - paymentPaise : 0n;
        const newRecoveredPaise = prevRecoveredPaise + paymentPaise;

        const newOutstandingStr = fromPaise(newOutstandingPaise);
        const newRecoveredStr = fromPaise(newRecoveredPaise);

        const prevStatus = targetCase.status;
        let targetStatus = prevStatus;
        if (newOutstandingPaise === 0n) {
          targetStatus = "Fully Paid";
        } else if (targetStatus !== "Fully Paid") {
          targetStatus = "Partially Paid";
        }

        // Update case
        const caseUpdateRes = await trxClient.query(
          `UPDATE loan_cases
           SET outstanding_amount = $1::numeric, total_recovered_amount = $2::numeric, status = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [newOutstandingStr, newRecoveredStr, targetStatus, now, targetCase.id]
        );

        // Update payment
        const payUpdateRes = await trxClient.query(
          `UPDATE payments
           SET verification_status = 'VERIFIED', verified_by_id = $1, verified_at = $2, reconciliation_status = 'RECONCILED'
           WHERE id = $3
           RETURNING *`,
          [verifiedById, now, paymentId]
        );

        // Create official receipt
        const rcpNum = payment.receipt_number || `RCP-PAY-${Date.now().toString().slice(-8)}`;
        const signatureHash = crypto
          .createHash("sha256")
          .update(`${rcpNum}:${paymentId}:${targetCase.id}:${payment.amount}:${newOutstandingStr}`)
          .digest("hex");

        const receiptRes = await trxClient.query(
          `INSERT INTO payment_receipts (
            id, receipt_number, payment_id, case_id, customer_id, issued_by_id,
            amount, balance_after_payment, signature_hash, receipt_data, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
          [
            `rcp_${uuidv4()}`,
            rcpNum,
            paymentId,
            targetCase.id,
            targetCase.customer_id,
            verifiedById,
            payment.amount,
            newOutstandingStr,
            signatureHash,
            JSON.stringify({
              payment_id: paymentId,
              case_id: targetCase.id,
              receipt_number: rcpNum,
              amount: Number(payment.amount),
              balance_after: Number(newOutstandingStr),
              payment_mode: payment.payment_mode,
              transaction_ref: payment.transaction_ref,
              verified_by: verifiedById,
              verified_at: now
            }),
            now
          ]
        );

        // Fulfill matching PTP
        await recoveryRepository.fulfillPTPForCase(targetCase.id, Number(payment.amount), paymentId, trxClient);

        // Audit log
        await trxClient.query(
          `INSERT INTO case_status_history (
            id, case_id, employee_id, previous_status, new_status, source, reference_id, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `csh_${uuidv4()}`,
            targetCase.id,
            verifiedById,
            prevStatus,
            targetStatus,
            "Payment Verification",
            paymentId,
            `Payment of ₹${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} verified by supervisor. Receipt: ${rcpNum}. Notes: ${notes}`,
            now
          ]
        );

        db.cacheService.delPattern("cases:*");
        db.cacheService.delPattern("dashboard:*");

        return {
          payment: payUpdateRes.rows[0],
          case: caseUpdateRes.rows[0],
          receipt: receiptRes.rows[0]
        };
      }

      // In-memory fallback
      const payment = (memoryStore.payments || []).find(p => p.id === paymentId);
      if (!payment) throw new Error(`Payment '${paymentId}' not found.`);
      if (payment.verification_status !== "PENDING_VERIFICATION") {
        throw new Error(`Payment '${paymentId}' is not pending verification (current status: ${payment.verification_status}).`);
      }

      const lc = (memoryStore.loan_cases || []).find(c => c.id === payment.case_id);
      if (!lc) throw new Error(`Target case '${payment.case_id}' not found.`);

      const paymentPaise = toPaise(payment.amount);
      const prevOutstandingPaise = toPaise(lc.outstanding_amount || 0);
      const prevRecoveredPaise = toPaise(lc.total_recovered_amount || lc.recovered_amount || 0);

      const newOutstandingPaise = prevOutstandingPaise > paymentPaise ? prevOutstandingPaise - paymentPaise : 0n;
      const newRecoveredPaise = prevRecoveredPaise + paymentPaise;

      const newOutstandingNum = Number(fromPaise(newOutstandingPaise));
      const newRecoveredNum = Number(fromPaise(newRecoveredPaise));

      const prevStatus = lc.status;
      let targetStatus = prevStatus;
      if (newOutstandingPaise === 0n) {
        targetStatus = "Fully Paid";
      } else if (targetStatus !== "Fully Paid") {
        targetStatus = "Partially Paid";
      }

      lc.outstanding_amount = newOutstandingNum;
      lc.total_recovered_amount = newRecoveredNum;
      lc.recovered_amount = newRecoveredNum;
      lc.status = targetStatus;
      lc.updated_at = now;

      payment.verification_status = "VERIFIED";
      payment.verified_by_id = verifiedById;
      payment.verified_at = now;
      payment.reconciliation_status = "RECONCILED";

      const rcpNum = payment.receipt_number || `RCP-PAY-${Date.now().toString().slice(-8)}`;
      const signatureHash = crypto
        .createHash("sha256")
        .update(`${rcpNum}:${paymentId}:${lc.id}:${fromPaise(paymentPaise)}:${fromPaise(newOutstandingPaise)}`)
        .digest("hex");

      const receiptRecord = {
        id: `rcp_${uuidv4()}`,
        receipt_number: rcpNum,
        payment_id: paymentId,
        case_id: lc.id,
        customer_id: lc.customer_id,
        issued_by_id: verifiedById,
        amount: Number(payment.amount),
        balance_after_payment: newOutstandingNum,
        signature_hash: signatureHash,
        receipt_data: {
          payment_id: paymentId,
          case_id: lc.id,
          receipt_number: rcpNum,
          amount: Number(payment.amount),
          balance_after: newOutstandingNum,
          payment_mode: payment.payment_mode,
          transaction_ref: payment.transaction_ref,
          verified_by: verifiedById,
          verified_at: now
        },
        created_at: now
      };

      if (!memoryStore.payment_receipts) memoryStore.payment_receipts = [];
      memoryStore.payment_receipts.unshift(receiptRecord);

      recoveryRepository.fulfillPTPForCase(lc.id, Number(payment.amount), paymentId);

      if (!memoryStore.case_status_history) memoryStore.case_status_history = [];
      memoryStore.case_status_history.unshift({
        id: `csh_${uuidv4()}`,
        case_id: lc.id,
        employee_id: verifiedById,
        previous_status: prevStatus,
        new_status: targetStatus,
        source: "Payment Verification",
        reference_id: paymentId,
        remarks: `Payment of ₹${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} verified by supervisor. Receipt: ${rcpNum}. Notes: ${notes}`,
        created_at: now
      });

      db.indexService.rebuild(memoryStore);
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return {
        payment: { ...payment },
        case: { ...lc },
        receipt: receiptRecord
      };
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Supervisor/Admin Payment Rejection:
   * Declines a PENDING_VERIFICATION payment. Does not alter loan balance.
   */
  async rejectPayment({ paymentId, rejectedById, reason = "" }, client = null) {
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE payments
         SET verification_status = 'FAILED', verified_by_id = $1, verified_at = $2, rejection_reason = $3
         WHERE id = $4 AND verification_status = 'PENDING_VERIFICATION'
         RETURNING *`,
        [rejectedById, now, reason, paymentId]
      );
      if (res.rows.length === 0) {
        throw new Error(`Payment '${paymentId}' not found or cannot be rejected (must be PENDING_VERIFICATION).`);
      }
      return res.rows[0];
    }

    // In-memory fallback
    const payment = (memoryStore.payments || []).find(p => p.id === paymentId);
    if (!payment) throw new Error(`Payment '${paymentId}' not found.`);
    if (payment.verification_status !== "PENDING_VERIFICATION") {
      throw new Error(`Payment '${paymentId}' is not pending verification.`);
    }

    payment.verification_status = "FAILED";
    payment.verified_by_id = rejectedById;
    payment.verified_at = now;
    payment.rejection_reason = reason;

    return { ...payment };
  },

  /**
   * Reversal / Refund:
   * Atomically restores borrower balance, marks payment reversed, and records audit trail.
   * HISTORICAL PAYMENT IS NEVER DELETED.
   */
  async reversePayment({ paymentId, reversedById, reason = "" }, client = null) {
    const now = new Date().toISOString();

    const execute = async (trxClient) => {
      if (db.isPgActive()) {
        const payRes = await trxClient.query(
          "SELECT * FROM payments WHERE id = $1 FOR UPDATE",
          [paymentId]
        );
        const payment = payRes.rows[0];
        if (!payment) throw new Error(`Payment '${paymentId}' not found.`);
        if (payment.is_reversed) throw new Error(`Payment '${paymentId}' has already been reversed.`);
        if (payment.verification_status !== "VERIFIED") {
          throw new Error(`Only VERIFIED payments can be reversed (current status: ${payment.verification_status}).`);
        }

        const caseRes = await trxClient.query(
          "SELECT * FROM loan_cases WHERE id = $1 FOR UPDATE",
          [payment.case_id]
        );
        const targetCase = caseRes.rows[0];
        if (!targetCase) throw new Error(`Target case '${payment.case_id}' not found.`);

        const paymentPaise = toPaise(payment.amount);
        const prevOutstandingPaise = toPaise(targetCase.outstanding_amount || 0);
        const prevRecoveredPaise = toPaise(targetCase.total_recovered_amount || 0);

        // Exact decimal integer reversal arithmetic
        const newOutstandingPaise = prevOutstandingPaise + paymentPaise;
        const newRecoveredPaise = prevRecoveredPaise > paymentPaise ? prevRecoveredPaise - paymentPaise : 0n;

        const newOutstandingStr = fromPaise(newOutstandingPaise);
        const newRecoveredStr = fromPaise(newRecoveredPaise);

        const prevStatus = targetCase.status;
        let targetStatus = prevStatus;
        if (prevStatus === "Fully Paid") {
          targetStatus = newRecoveredPaise > 0n ? "Partially Paid" : "Assigned";
        }

        // Update case balance and status
        const updateCaseRes = await trxClient.query(
          `UPDATE loan_cases
           SET outstanding_amount = $1::numeric, total_recovered_amount = $2::numeric, status = $3, updated_at = $4
           WHERE id = $5
           RETURNING *`,
          [newOutstandingStr, newRecoveredStr, targetStatus, now, targetCase.id]
        );

        // Mark payment reversed (NEVER DELETE)
        const updatePayRes = await trxClient.query(
          `UPDATE payments
           SET is_reversed = true, verification_status = 'REVERSED', reversal_reason = $1
           WHERE id = $2
           RETURNING *`,
          [reason, paymentId]
        );

        // Audit log
        await trxClient.query(
          `INSERT INTO case_status_history (
            id, case_id, employee_id, previous_status, new_status, source, reference_id, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `csh_${uuidv4()}`,
            targetCase.id,
            reversedById,
            prevStatus,
            targetStatus,
            "Payment Reversal",
            paymentId,
            `REVERSAL: Payment of ₹${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} reversed. Restored balance: ₹${Number(newOutstandingStr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}. Reason: ${reason}`,
            now
          ]
        );

        db.cacheService.delPattern("cases:*");
        db.cacheService.delPattern("dashboard:*");

        return {
          payment: updatePayRes.rows[0],
          case: updateCaseRes.rows[0]
        };
      }

      // In-memory fallback
      const payment = (memoryStore.payments || []).find(p => p.id === paymentId);
      if (!payment) throw new Error(`Payment '${paymentId}' not found.`);
      if (payment.is_reversed) throw new Error(`Payment '${paymentId}' has already been reversed.`);
      if (payment.verification_status !== "VERIFIED") {
        throw new Error(`Only VERIFIED payments can be reversed (current status: ${payment.verification_status}).`);
      }

      const lc = (memoryStore.loan_cases || []).find(c => c.id === payment.case_id);
      if (!lc) throw new Error(`Target case '${payment.case_id}' not found.`);

      const paymentPaise = toPaise(payment.amount);
      const prevOutstandingPaise = toPaise(lc.outstanding_amount || 0);
      const prevRecoveredPaise = toPaise(lc.total_recovered_amount || lc.recovered_amount || 0);

      const newOutstandingPaise = prevOutstandingPaise + paymentPaise;
      const newRecoveredPaise = prevRecoveredPaise > paymentPaise ? prevRecoveredPaise - paymentPaise : 0n;

      const newOutstandingNum = Number(fromPaise(newOutstandingPaise));
      const newRecoveredNum = Number(fromPaise(newRecoveredPaise));

      const prevStatus = lc.status;
      let targetStatus = prevStatus;
      if (prevStatus === "Fully Paid") {
        targetStatus = newRecoveredPaise > 0n ? "Partially Paid" : "Assigned";
      }

      lc.outstanding_amount = newOutstandingNum;
      lc.total_recovered_amount = newRecoveredNum;
      lc.recovered_amount = newRecoveredNum;
      lc.status = targetStatus;
      lc.updated_at = now;

      payment.is_reversed = true;
      payment.verification_status = "REVERSED";
      payment.reversal_reason = reason;

      if (!memoryStore.case_status_history) memoryStore.case_status_history = [];
      memoryStore.case_status_history.unshift({
        id: `csh_${uuidv4()}`,
        case_id: lc.id,
        employee_id: reversedById,
        previous_status: prevStatus,
        new_status: targetStatus,
        source: "Payment Reversal",
        reference_id: paymentId,
        remarks: `REVERSAL: Payment of ₹${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} reversed. Restored balance: ₹${newOutstandingNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. Reason: ${reason}`,
        created_at: now
      });

      db.indexService.rebuild(memoryStore);
      db.cacheService.delPattern("cases:*");
      db.cacheService.delPattern("dashboard:*");

      return {
        payment: { ...payment },
        case: { ...lc }
      };
    };

    if (client) {
      return await execute(client);
    }
    return await db.transaction(execute);
  },

  /**
   * Official Tamper-Evident Receipt Generation
   */
  async generateReceipt({ paymentId, issuedById }, client = null) {
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const payRes = await q.query("SELECT * FROM payments WHERE id = $1", [paymentId]);
      const payment = payRes.rows[0];
      if (!payment) throw new Error(`Payment '${paymentId}' not found.`);
      if (payment.verification_status !== "VERIFIED") {
        throw new Error("Unverified payments cannot generate final official receipts.");
      }

      // Check if receipt already exists
      const existRes = await q.query("SELECT * FROM payment_receipts WHERE payment_id = $1", [paymentId]);
      if (existRes.rows.length > 0) {
        return existRes.rows[0];
      }

      const caseRes = await q.query("SELECT * FROM loan_cases WHERE id = $1", [payment.case_id]);
      const targetCase = caseRes.rows[0];

      const rcpNum = payment.receipt_number || `RCP-PAY-${Date.now().toString().slice(-8)}`;
      const signatureHash = crypto
        .createHash("sha256")
        .update(`${rcpNum}:${paymentId}:${payment.case_id}:${payment.amount}:${targetCase?.outstanding_amount || 0}`)
        .digest("hex");

      const insertRes = await q.query(
        `INSERT INTO payment_receipts (
          id, receipt_number, payment_id, case_id, customer_id, issued_by_id,
          amount, balance_after_payment, signature_hash, receipt_data, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          `rcp_${uuidv4()}`,
          rcpNum,
          paymentId,
          payment.case_id,
          payment.customer_id,
          issuedById,
          payment.amount,
          targetCase?.outstanding_amount || 0,
          signatureHash,
          JSON.stringify({
            payment_id: paymentId,
            case_id: payment.case_id,
            receipt_number: rcpNum,
            amount: Number(payment.amount),
            balance_after: Number(targetCase?.outstanding_amount || 0),
            payment_mode: payment.payment_mode,
            transaction_ref: payment.transaction_ref,
            issued_by: issuedById,
            issued_at: now
          }),
          now
        ]
      );

      return insertRes.rows[0];
    }

    // In-memory fallback
    const payment = (memoryStore.payments || []).find(p => p.id === paymentId);
    if (!payment) throw new Error(`Payment '${paymentId}' not found.`);
    if (payment.verification_status !== "VERIFIED") {
      throw new Error("Unverified payments cannot generate final official receipts.");
    }

    const existing = (memoryStore.payment_receipts || []).find(r => r.payment_id === paymentId);
    if (existing) return { ...existing };

    const lc = (memoryStore.loan_cases || []).find(c => c.id === payment.case_id);
    const rcpNum = payment.receipt_number || `RCP-PAY-${Date.now().toString().slice(-8)}`;
    const signatureHash = crypto
      .createHash("sha256")
      .update(`${rcpNum}:${paymentId}:${payment.case_id}:${payment.amount}:${lc?.outstanding_amount || 0}`)
      .digest("hex");

    const receipt = {
      id: `rcp_${uuidv4()}`,
      receipt_number: rcpNum,
      payment_id: paymentId,
      case_id: payment.case_id,
      customer_id: payment.customer_id,
      issued_by_id: issuedById,
      amount: Number(payment.amount),
      balance_after_payment: lc?.outstanding_amount || 0,
      signature_hash: signatureHash,
      receipt_data: {
        payment_id: paymentId,
        case_id: payment.case_id,
        receipt_number: rcpNum,
        amount: Number(payment.amount),
        balance_after: lc?.outstanding_amount || 0,
        payment_mode: payment.payment_mode,
        transaction_ref: payment.transaction_ref,
        issued_by: issuedById,
        issued_at: now
      },
      created_at: now
    };

    if (!memoryStore.payment_receipts) memoryStore.payment_receipts = [];
    memoryStore.payment_receipts.unshift(receipt);

    return { ...receipt };
  },

  /**
   * Get Receipt by Payment ID
   */
  async getReceiptByPaymentId(paymentId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT r.*,
                lc.case_number, lc.loan_account_no, lc.lender_name,
                c.full_name as customer_name, c.phone as customer_phone,
                u.full_name as issued_by_name
         FROM payment_receipts r
         JOIN loan_cases lc ON r.case_id = lc.id
         JOIN customers c ON r.customer_id = c.id
         LEFT JOIN users u ON r.issued_by_id = u.id
         WHERE r.payment_id = $1`,
        [paymentId]
      );
      return res.rows[0] || null;
    }

    const receipt = (memoryStore.payment_receipts || []).find(r => r.payment_id === paymentId);
    if (!receipt) return null;

    const lc = (memoryStore.loan_cases || []).find(c => c.id === receipt.case_id);
    const cust = (memoryStore.customers || []).find(c => c.id === receipt.customer_id);
    const u = (memoryStore.users || []).find(usr => usr.id === receipt.issued_by_id);

    return {
      ...receipt,
      case_number: lc ? lc.case_number : "Unknown",
      loan_account_no: lc ? lc.loan_account_no : "Unknown",
      lender_name: lc ? lc.lender_name : "Unknown",
      customer_name: cust ? cust.full_name : "Unknown",
      customer_phone: cust ? cust.phone : "Unknown",
      issued_by_name: u ? u.full_name : "Authorized Officer"
    };
  },

  /**
   * Get Payment by ID
   */
  async getPaymentById(paymentId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT p.*,
                lc.case_number, lc.loan_account_no, lc.lender_name, lc.outstanding_amount as current_case_balance,
                c.full_name as customer_name, c.phone as customer_phone,
                u.full_name as collector_name, u.employee_id as collector_code
         FROM payments p
         JOIN loan_cases lc ON p.case_id = lc.id
         JOIN customers c ON p.customer_id = c.id
         LEFT JOIN users u ON p.collected_by_id = u.id
         WHERE p.id = $1`,
        [paymentId]
      );
      return res.rows[0] || null;
    }

    const p = (memoryStore.payments || []).find(item => item.id === paymentId);
    if (!p) return null;

    const lc = (memoryStore.loan_cases || []).find(c => c.id === p.case_id);
    const cust = (memoryStore.customers || []).find(c => c.id === p.customer_id);
    const u = (memoryStore.users || []).find(usr => usr.id === p.collected_by_id);

    return {
      ...p,
      case_number: lc ? lc.case_number : "Unknown",
      loan_account_no: lc ? lc.loan_account_no : "Unknown",
      lender_name: lc ? lc.lender_name : "Unknown",
      current_case_balance: lc ? lc.outstanding_amount : 0,
      customer_name: cust ? cust.full_name : "Unknown",
      customer_phone: cust ? cust.phone : "Unknown",
      collector_name: u ? u.full_name : "Unknown",
      collector_code: u ? u.employee_id : "Unknown"
    };
  },

  /**
   * List payments with filtering, pagination, and verification status
   */
  async listPayments({
    caseId,
    employeeId,
    paymentMode,
    verificationStatus,
    isReversed,
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
        whereClauses.push(`p.case_id = $${params.length}`);
      }
      if (employeeId) {
        params.push(employeeId);
        whereClauses.push(`p.collected_by_id = $${params.length}`);
      }
      if (paymentMode && paymentMode !== "ALL") {
        params.push(paymentMode.toUpperCase());
        whereClauses.push(`p.payment_mode = $${params.length}`);
      }
      if (verificationStatus && verificationStatus !== "ALL") {
        params.push(verificationStatus.toUpperCase());
        whereClauses.push(`p.verification_status = $${params.length}`);
      }
      if (isReversed !== undefined && isReversed !== null) {
        params.push(Boolean(isReversed));
        whereClauses.push(`p.is_reversed = $${params.length}`);
      }
      if (startDate) {
        params.push(new Date(startDate).toISOString());
        whereClauses.push(`p.payment_date >= $${params.length}`);
      }
      if (endDate) {
        params.push(new Date(endDate).toISOString());
        whereClauses.push(`p.payment_date <= $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countRes = await q.query(
        `SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_amount
         FROM payments p
         ${whereSql}`,
        params
      );

      const total = parseInt(countRes.rows[0]?.total_count || 0, 10);
      const totalCollected = parseFloat(countRes.rows[0]?.total_amount || 0);

      const dataParams = [...params, limitNum, offset];
      const dataRes = await q.query(
        `SELECT p.*,
                lc.case_number, lc.loan_account_no, lc.lender_name,
                c.full_name as customer_name, c.customer_code,
                u.full_name as collector_name, u.employee_id as collector_code
         FROM payments p
         JOIN loan_cases lc ON p.case_id = lc.id
         JOIN customers c ON p.customer_id = c.id
         LEFT JOIN users u ON p.collected_by_id = u.id
         ${whereSql}
         ORDER BY p.payment_date DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      return {
        payments: dataRes.rows,
        total,
        totalCollected,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    // In-memory fallback
    let list = [...(memoryStore.payments || [])];
    if (caseId) list = list.filter(p => p.case_id === caseId);
    if (employeeId) list = list.filter(p => p.collected_by_id === employeeId);
    if (paymentMode && paymentMode !== "ALL") {
      list = list.filter(p => p.payment_mode?.toUpperCase() === paymentMode.toUpperCase());
    }
    if (verificationStatus && verificationStatus !== "ALL") {
      list = list.filter(p => p.verification_status?.toUpperCase() === verificationStatus.toUpperCase());
    }
    if (isReversed !== undefined && isReversed !== null) {
      list = list.filter(p => Boolean(p.is_reversed) === Boolean(isReversed));
    }
    if (startDate) list = list.filter(p => p.payment_date >= startDate);
    if (endDate) list = list.filter(p => p.payment_date <= endDate);

    list.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    const total = list.length;
    const totalCollected = list.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const paginated = list.slice(offset, offset + limitNum).map(p => {
      const lc = (memoryStore.loan_cases || []).find(c => c.id === p.case_id);
      const cust = (memoryStore.customers || []).find(c => c.id === p.customer_id);
      const u = (memoryStore.users || []).find(user => user.id === p.collected_by_id);
      return {
        ...p,
        case_number: lc ? lc.case_number : "Unknown",
        loan_account_no: lc ? lc.loan_account_no : "Unknown",
        lender_name: lc ? lc.lender_name : "Unknown",
        customer_name: cust ? cust.full_name : "Unknown",
        customer_code: cust ? cust.customer_code : "Unknown",
        collector_name: u ? u.full_name : "Unknown",
        collector_code: u ? u.employee_id : "Unknown"
      };
    });

    return {
      payments: paginated,
      total,
      totalCollected,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }
};

export default paymentRepository;
