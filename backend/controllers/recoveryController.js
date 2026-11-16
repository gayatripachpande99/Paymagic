import { recoveryService } from "../services/recoveryService.js";
import { reconciliationService } from "../services/reconciliationService.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { recoveryRepository } from "../repositories/recoveryRepository.js";

/**
 * Enterprise Recovery & Collection Tracking Controller
 */
export const recoveryController = {
  /**
   * POST /api/recovery/payments
   * POST /api/cases/:id/payments
   * Record a collection payment
   */
  async recordPayment(req, res) {
    try {
      const caseId = req.params.caseId || req.params.id || req.body.caseId || req.body.case_id;
      const {
        amount,
        payment_mode,
        paymentMode,
        transaction_ref,
        transactionRef,
        receipt_number,
        receiptNumber,
        notes = "",
        settlement_type,
        settlementType,
        verification_status,
        verificationStatus
      } = req.body;

      if (!caseId) {
        return res.status(400).json({ success: false, message: "caseId is required." });
      }

      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ success: false, message: "A valid positive payment amount is required." });
      }

      const mode = (paymentMode || payment_mode || "UPI").toUpperCase();
      const txnRef = transactionRef || transaction_ref;
      const rcpNum = receiptNumber || receipt_number;

      const result = await recoveryService.recordCollection({
        caseId,
        customerId: req.body.customerId || req.body.customer_id,
        collectedById: req.user.id,
        userRole: req.user.role,
        amount: paymentAmount,
        paymentMode: mode,
        transactionRef: txnRef,
        receiptNumber: rcpNum,
        notes,
        verificationStatus: verificationStatus || verification_status,
        settlementType: settlementType || settlement_type || "PARTIAL"
      });

      const isPending = result.payment.verification_status === "PENDING_VERIFICATION";
      const message = isPending
        ? `Collection of ₹${paymentAmount.toLocaleString()} recorded and submitted for supervisor verification.`
        : `Payment of ₹${paymentAmount.toLocaleString()} recorded and verified. Case status is now '${result.case?.status}'.`;

      return res.status(201).json({
        success: true,
        message,
        data: {
          payment: result.payment,
          case: result.case
        }
      });
    } catch (error) {
      console.error("recordPayment Error:", error);
      if (error.code === "DUPLICATE_PAYMENT" || error.statusCode === 409) {
        return res.status(409).json({ success: false, message: error.message });
      }
      if (error.message && error.message.includes("not found")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/payments/:id/verify
   * Supervisor/Admin verifies and applies payment to borrower balance
   */
  async verifyPayment(req, res) {
    try {
      const paymentId = req.params.id || req.body.paymentId;
      const { notes } = req.body;

      if (!paymentId) {
        return res.status(400).json({ success: false, message: "paymentId is required." });
      }

      const result = await recoveryService.verifyPayment({
        paymentId,
        verifiedById: req.user.id,
        userRole: req.user.role,
        notes
      });

      return res.status(200).json({
        success: true,
        message: `Payment ${paymentId} successfully verified. Case balance updated.`,
        data: result
      });
    } catch (error) {
      console.error("verifyPayment Error:", error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/payments/:id/reject
   * Supervisor/Admin rejects an invalid payment
   */
  async rejectPayment(req, res) {
    try {
      const paymentId = req.params.id || req.body.paymentId;
      const { reason = "" } = req.body;

      if (!paymentId) {
        return res.status(400).json({ success: false, message: "paymentId is required." });
      }

      const result = await recoveryService.rejectPayment({
        paymentId,
        rejectedById: req.user.id,
        userRole: req.user.role,
        reason
      });

      return res.status(200).json({
        success: true,
        message: `Payment ${paymentId} has been rejected.`,
        data: result
      });
    } catch (error) {
      console.error("rejectPayment Error:", error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/payments/:id/reverse
   * Reverse/Refund a verified payment and restore balance
   */
  async reversePayment(req, res) {
    try {
      const paymentId = req.params.id || req.body.paymentId;
      const { reason = "" } = req.body;

      if (!paymentId) {
        return res.status(400).json({ success: false, message: "paymentId is required." });
      }

      const result = await recoveryService.reversePayment({
        paymentId,
        reversedById: req.user.id,
        userRole: req.user.role,
        reason
      });

      return res.status(200).json({
        success: true,
        message: `Payment ${paymentId} reversed successfully. Outstanding balance restored to ₹${result.case?.outstanding_amount}.`,
        data: result
      });
    } catch (error) {
      console.error("reversePayment Error:", error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/payments/:id/receipt
   * POST /api/recovery/payments/:id/receipt
   * Generate or retrieve official receipt
   */
  async getReceipt(req, res) {
    try {
      const paymentId = req.params.id || req.params.paymentId || req.query.paymentId;

      if (!paymentId) {
        return res.status(400).json({ success: false, message: "paymentId is required." });
      }

      // Check if existing receipt or generate
      let receipt = await paymentRepository.getReceiptByPaymentId(paymentId);
      if (!receipt) {
        receipt = await recoveryService.generateReceipt({
          paymentId,
          issuedById: req.user.id
        });
      }

      return res.status(200).json({
        success: true,
        data: { receipt }
      });
    } catch (error) {
      console.error("getReceipt Error:", error);
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/payments
   * List collections with filtering
   */
  async listPayments(req, res) {
    try {
      const {
        caseId,
        employeeId,
        paymentMode,
        verificationStatus,
        isReversed,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      let targetEmployeeId = employeeId;
      if (["CALLER", "FIELD_AGENT"].includes(req.user?.role) && !employeeId) {
        targetEmployeeId = req.user.id;
      }

      const result = await paymentRepository.listPayments({
        caseId,
        employeeId: targetEmployeeId,
        paymentMode,
        verificationStatus,
        isReversed: isReversed !== undefined ? isReversed === "true" || isReversed === true : undefined,
        startDate,
        endDate,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        data: {
          payments: result.payments,
          summary: {
            total_count: result.total,
            total_collected: result.totalCollected
          },
          pagination: {
            page: result.page,
            limit: result.limit,
            totalCount: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (error) {
      console.error("listPayments Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/payments/:id
   */
  async getPaymentById(req, res) {
    try {
      const paymentId = req.params.id;
      const payment = await paymentRepository.getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({ success: false, message: `Payment '${paymentId}' not found.` });
      }

      return res.status(200).json({
        success: true,
        data: { payment }
      });
    } catch (error) {
      console.error("getPaymentById Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/ptp
   * Create a Promise-to-Pay (PTP) commitment
   */
  async createPTP(req, res) {
    try {
      const {
        caseId,
        case_id,
        customerId,
        customer_id,
        promisedAmount,
        promised_amount,
        promisedDate,
        promised_date,
        paymentMode,
        payment_mode,
        remarks = ""
      } = req.body;

      const targetCaseId = caseId || case_id;
      if (!targetCaseId) {
        return res.status(400).json({ success: false, message: "caseId is required." });
      }

      const amount = promisedAmount !== undefined ? promisedAmount : promised_amount;
      const date = promisedDate || promised_date;

      const ptp = await recoveryService.createPTP({
        caseId: targetCaseId,
        customerId: customerId || customer_id,
        createdById: req.user.id,
        promisedAmount: amount,
        promisedDate: date,
        paymentMode: paymentMode || payment_mode || "UPI",
        remarks
      });

      return res.status(201).json({
        success: true,
        message: `PTP commitment of ₹${Number(ptp.promised_amount).toLocaleString()} recorded for ${ptp.promised_date.slice(0, 10)}.`,
        data: { ptp }
      });
    } catch (error) {
      console.error("createPTP Error:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/ptp
   * List PTP commitments
   */
  async listPTPs(req, res) {
    try {
      const {
        caseId,
        employeeId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      let targetEmployeeId = employeeId;
      if (["CALLER", "FIELD_AGENT"].includes(req.user?.role) && !employeeId) {
        targetEmployeeId = req.user.id;
      }

      const result = await recoveryService.listPTPs({
        caseId,
        employeeId: targetEmployeeId,
        status,
        startDate,
        endDate,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        data: {
          ptps: result.ptps,
          summary: {
            total_count: result.total,
            total_promised: result.totalPromised
          },
          pagination: {
            page: result.page,
            limit: result.limit,
            totalCount: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (error) {
      console.error("listPTPs Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/ptp/check-broken
   * Run automated overdue PTP check
   */
  async checkBrokenPTPs(req, res) {
    try {
      const broken = await recoveryRepository.checkBrokenPTPs();
      return res.status(200).json({
        success: true,
        message: `Identified and marked ${broken.length} overdue PTP(s) as BROKEN.`,
        data: {
          broken_count: broken.length,
          broken_ptps: broken
        }
      });
    } catch (error) {
      console.error("checkBrokenPTPs Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/contacts
   * Log omnichannel borrower contact
   */
  async recordContact(req, res) {
    try {
      const {
        caseId,
        case_id,
        customerId,
        customer_id,
        contactMethod,
        contact_method,
        outcome,
        discussionNotes,
        discussion_notes,
        nextCallbackDate,
        next_callback_date
      } = req.body;

      const targetCaseId = caseId || case_id;
      if (!targetCaseId) {
        return res.status(400).json({ success: false, message: "caseId is required." });
      }

      const contact = await recoveryService.recordCustomerContact({
        caseId: targetCaseId,
        customerId: customerId || customer_id,
        contactedById: req.user.id,
        contactMethod: contactMethod || contact_method,
        outcome,
        discussionNotes: discussionNotes || discussion_notes || "",
        nextCallbackDate: nextCallbackDate || next_callback_date
      });

      return res.status(201).json({
        success: true,
        message: "Customer contact logged successfully.",
        data: { contact }
      });
    } catch (error) {
      console.error("recordContact Error:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/contacts
   */
  async listContacts(req, res) {
    try {
      const { caseId, contactedById, outcome, page = 1, limit = 50 } = req.query;
      const result = await recoveryService.listCustomerContacts({
        caseId,
        contactedById,
        outcome,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        data: {
          contacts: result.contacts,
          pagination: {
            page: result.page,
            limit: result.limit,
            totalCount: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (error) {
      console.error("listContacts Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/reconciliation/upload
   * Bank / Gateway statement reconciliation
   */
  async reconcileStatement(req, res) {
    try {
      const { filename, statementRows, autoReconcile = true } = req.body;

      const result = await recoveryService.processStatementReconciliation({
        filename: filename || "bank_statement.csv",
        uploadedById: req.user.id,
        userRole: req.user.role,
        statementRows: statementRows || [],
        autoReconcile
      });

      return res.status(200).json({
        success: true,
        message: `Statement reconciliation complete: ${result.matchedRecords} matched, ${result.discrepancyRecords} discrepancies, ${result.unmatchedRecords} unmatched.`,
        data: result
      });
    } catch (error) {
      console.error("reconcileStatement Error:", error);
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/reconciliation/preview
   * Generate an automated reconciliation preview
   */
  async previewReconciliation(req, res) {
    try {
      const { filename, statementContent, statementRows, type } = req.body;
      const preview = await reconciliationService.generateReconciliationPreview({
        filename: filename || "bank_statement.csv",
        statementContent,
        statementRows,
        uploadedById: req.user.id,
        userRole: req.user.role,
        type: type || "BANK_STATEMENT"
      });

      return res.status(200).json({
        success: true,
        message: "Reconciliation preview generated successfully.",
        data: preview
      });
    } catch (error) {
      console.error("previewReconciliation Error:", error);
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/recovery/reconciliation/confirm
   * Confirm an existing reconciliation preview and apply ledger updates atomically
   */
  async confirmReconciliation(req, res) {
    try {
      const { previewId, autoReconcileMatched = true } = req.body;
      if (!previewId) {
        return res.status(400).json({ success: false, message: "previewId is required." });
      }

      const result = await reconciliationService.confirmReconciliation({
        previewId,
        confirmedById: req.user.id,
        userRole: req.user.role,
        autoReconcileMatched
      });

      return res.status(200).json({
        success: true,
        message: `Reconciliation batch confirmed and applied: ${result.matched_records} matched, ${result.unmatched_records} unmatched.`,
        data: result
      });
    } catch (error) {
      console.error("confirmReconciliation Error:", error);
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/reconciliation/batches
   * List historical reconciliation batches
   */
  async listBatches(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const result = await reconciliationService.listBatches({ page, limit });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("listBatches Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/reconciliation/batches/:id
   * Get batch details and line items
   */
  async getBatchDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await reconciliationService.getBatchDetails(id);
      if (!result) {
        return res.status(404).json({ success: false, message: `Reconciliation batch '${id}' not found.` });
      }
      return res.status(200).json({ success: true, data: { batch: result } });
    } catch (error) {
      console.error("getBatchDetails Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/performance
   * Recovery agent & team performance metrics
   */
  async getPerformance(req, res) {
    try {
      const { employeeId, month, year } = req.query;
      const data = await recoveryService.getCollectorPerformance({ employeeId, month, year });
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error("getPerformance Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/recovery/reports/export
   * Anti-formula-injection CSV export
   */
  async exportReport(req, res) {
    try {
      const csv = await recoveryService.exportCollectionsCsv(req.query);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=collections_report_${Date.now()}.csv`);
      return res.status(200).send(csv);
    } catch (error) {
      console.error("exportReport Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default recoveryController;

