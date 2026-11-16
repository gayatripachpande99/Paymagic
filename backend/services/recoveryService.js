import { paymentRepository } from "../repositories/paymentRepository.js";
import { recoveryRepository } from "../repositories/recoveryRepository.js";
import db, { memoryStore } from "../config/db.js";

/**
 * Enterprise Recovery & Collection Tracking Service
 * Coordinates verification desks, PTP tracking, omnichannel contacts, statement reconciliation, and financial safety.
 */
export const recoveryService = {
  /**
   * Record a loan recovery collection
   * Callers and Field Agents submit payments that enter PENDING_VERIFICATION.
   * Admins and Supervisors can record immediately VERIFIED or PENDING payments.
   */
  async recordCollection({
    caseId,
    customerId,
    collectedById,
    userRole,
    amount,
    paymentMode = "UPI",
    transactionRef,
    receiptNumber,
    notes = "",
    verificationStatus = null,
    settlementType = "PARTIAL"
  }) {
    // Determine verification status based on RBAC and caller request
    let finalVerificationStatus = "VERIFIED";
    if (["CALLER", "FIELD_AGENT"].includes(userRole)) {
      finalVerificationStatus = "PENDING_VERIFICATION";
    } else if (verificationStatus) {
      finalVerificationStatus = verificationStatus;
    }

    const result = await paymentRepository.recordPayment({
      caseId,
      customerId,
      collectedById,
      amount,
      paymentMode,
      transactionRef,
      receiptNumber,
      notes,
      verificationStatus: finalVerificationStatus,
      settlementType
    });

    // If PENDING_VERIFICATION, notify supervisors
    if (finalVerificationStatus === "PENDING_VERIFICATION") {
      try {
        if (!memoryStore.notifications) memoryStore.notifications = [];
        memoryStore.notifications.unshift({
          id: `notif_${Date.now()}`,
          recipient_role: "SUPERVISOR",
          type: "PAYMENT_VERIFICATION_REQUIRED",
          title: "New Payment Pending Verification",
          message: `Payment of ₹${Number(amount).toLocaleString('en-IN')} submitted by ${userRole} for case ${result.case?.case_number || caseId}. Requires verification.`,
          reference_id: result.payment.id,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Failed to dispatch verification notification:", err.message);
      }
    }

    return result;
  },

  /**
   * Verify and approve a pending payment collection
   */
  async verifyPayment({ paymentId, verifiedById, userRole, notes = "" }) {
    if (["CALLER", "FIELD_AGENT"].includes(userRole)) {
      const err = new Error("Unauthorized: Callers and Field Agents cannot verify payments.");
      err.statusCode = 403;
      throw err;
    }

    return await paymentRepository.verifyPayment({
      paymentId,
      verifiedById,
      notes
    });
  },

  /**
   * Reject a pending payment collection
   */
  async rejectPayment({ paymentId, rejectedById, userRole, reason = "" }) {
    if (["CALLER", "FIELD_AGENT"].includes(userRole)) {
      const err = new Error("Unauthorized: Callers and Field Agents cannot reject payments.");
      err.statusCode = 403;
      throw err;
    }

    return await paymentRepository.rejectPayment({
      paymentId,
      rejectedById,
      reason
    });
  },

  /**
   * Reverse / Refund a verified collection
   * Restores borrower balance transactionally. Never deletes the payment.
   */
  async reversePayment({ paymentId, reversedById, userRole, reason = "" }) {
    if (!["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(userRole)) {
      const err = new Error("Unauthorized: Only Administrators and Supervisors can reverse payments.");
      err.statusCode = 403;
      throw err;
    }

    if (!reason || !reason.trim()) {
      const err = new Error("A valid reason is required to reverse a verified payment.");
      err.statusCode = 400;
      throw err;
    }

    return await paymentRepository.reversePayment({
      paymentId,
      reversedById,
      reason: reason.trim()
    });
  },

  /**
   * Generate official payment receipt
   */
  async generateReceipt({ paymentId, issuedById }) {
    return await paymentRepository.generateReceipt({
      paymentId,
      issuedById
    });
  },

  /**
   * Retrieve official payment receipt
   */
  async getReceipt({ paymentId, receiptNumber }) {
    if (paymentId) {
      return await paymentRepository.getReceiptByPaymentId(paymentId);
    }
    if (receiptNumber) {
      return await paymentRepository.getReceiptByNumber(receiptNumber);
    }
    throw new Error("paymentId or receiptNumber is required to retrieve a receipt.");
  },

  /**
   * Create Promise-to-Pay (PTP) commitment
   */
  async createPTP({
    caseId,
    customerId,
    createdById,
    promisedAmount,
    promisedDate,
    paymentMode = "UPI",
    remarks = ""
  }) {
    return await recoveryRepository.createPTP({
      caseId,
      customerId,
      createdById,
      promisedAmount,
      promisedDate,
      paymentMode,
      remarks
    });
  },

  /**
   * List PTP commitments
   */
  async listPTPs(filters) {
    return await recoveryRepository.listPTPs(filters);
  },

  /**
   * Record Customer Contact
   */
  async recordCustomerContact({
    caseId,
    customerId,
    contactedById,
    contactMethod,
    outcome,
    discussionNotes = "",
    nextCallbackDate = null
  }) {
    return await recoveryRepository.recordCustomerContact({
      caseId,
      customerId,
      contactedById,
      contactMethod,
      outcome,
      discussionNotes,
      nextCallbackDate
    });
  },

  /**
   * List Customer Contacts
   */
  async listCustomerContacts(filters) {
    return await recoveryRepository.listCustomerContacts(filters);
  },

  /**
   * Process Bank / Payment Gateway Statement Reconciliation
   */
  async processStatementReconciliation({
    filename,
    uploadedById,
    userRole,
    statementRows,
    autoReconcile = true
  }) {
    if (["CALLER", "FIELD_AGENT"].includes(userRole)) {
      const err = new Error("Unauthorized: Callers and Field Agents cannot perform statement reconciliation.");
      err.statusCode = 403;
      throw err;
    }

    return await recoveryRepository.processBankStatement({
      filename,
      uploadedById,
      statementRows,
      autoReconcile
    });
  },

  /**
   * Collector Performance Dashboard
   */
  async getCollectorPerformance(filters) {
    return await recoveryRepository.getCollectorPerformance(filters);
  },

  /**
   * Export collections CSV with anti-formula-injection protection
   */
  async exportCollectionsCsv(filters) {
    const result = await paymentRepository.listPayments({
      ...filters,
      limit: 1000
    });

    const headers = [
      "Receipt Number",
      "Transaction Ref",
      "Case Number",
      "Loan Account No",
      "Customer Name",
      "Collector",
      "Amount (INR)",
      "Payment Mode",
      "Verification Status",
      "Reconciliation Status",
      "Is Reversed",
      "Payment Date"
    ];

    const lines = [headers.join(",")];

    for (const p of result.payments) {
      const row = [
        recoveryRepository.sanitizeCsvCell(p.receipt_number),
        recoveryRepository.sanitizeCsvCell(p.transaction_ref),
        recoveryRepository.sanitizeCsvCell(p.case_number),
        recoveryRepository.sanitizeCsvCell(p.loan_account_no),
        recoveryRepository.sanitizeCsvCell(p.customer_name),
        recoveryRepository.sanitizeCsvCell(p.collector_name),
        recoveryRepository.sanitizeCsvCell(p.amount),
        recoveryRepository.sanitizeCsvCell(p.payment_mode),
        recoveryRepository.sanitizeCsvCell(p.verification_status),
        recoveryRepository.sanitizeCsvCell(p.reconciliation_status),
        recoveryRepository.sanitizeCsvCell(p.is_reversed ? "YES" : "NO"),
        recoveryRepository.sanitizeCsvCell(p.payment_date)
      ];
      lines.push(row.join(","));
    }

    return lines.join("\n");
  }
};

export default recoveryService;

