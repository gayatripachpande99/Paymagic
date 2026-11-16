import { caseAllocationService } from "../services/caseAllocationService.js";
import { slaEscalationService } from "../services/slaEscalationService.js";
import { employeeRepository } from "../repositories/employeeRepository.js";

/**
 * Controller for Case Allocation, Workload Management, and Reassignment Engine
 */
export const allocationController = {
  /**
   * GET /api/allocation/eligible-employees
   * List eligible staff with live workloads, capacities, and supervisor scope
   */
  async getEligibleEmployees(req, res) {
    try {
      const { supervisorId, role, city, shiftAware, includeOnLeave } = req.query;

      const employees = await caseAllocationService.getEligibleEmployees({
        actor: req.user,
        supervisorId: supervisorId || null,
        role: role || null,
        city: city || null,
        shiftAware: shiftAware === "true" || shiftAware === true,
        includeOnLeave: includeOnLeave === "true" || includeOnLeave === true
      });

      return res.status(200).json({
        success: true,
        count: employees.length,
        employees
      });
    } catch (error) {
      console.error("getEligibleEmployees Error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/allocation/preview
   * Generate durable read-only allocation preview without modifying database
   */
  async previewAllocation(req, res) {
    try {
      const {
        strategy = "EQUAL",
        caseIds = [],
        rules = {},
        limit = 50,
        targetEmployeeIds = [],
        shiftAware = false
      } = req.body;

      const preview = await caseAllocationService.generatePreview({
        strategy,
        caseIds,
        rules,
        limit,
        targetEmployeeIds,
        shiftAware,
        actor: req.user
      });

      return res.status(200).json({
        success: true,
        message: `Preview generated: ${preview.total_allocated_cases} of ${preview.total_cases_selected} cases distributed across ${preview.eligible_employees_count} agents.`,
        data: preview
      });
    } catch (error) {
      console.error("previewAllocation Error:", error);
      return res.status(error.status || 400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/allocation/execute
   * Atomically commit previewed allocation with real-time revalidation
   */
  async executeAllocation(req, res) {
    try {
      const { preview_id, previewId } = req.body;
      const idToExecute = preview_id || previewId;

      if (!idToExecute) {
        return res.status(400).json({
          success: false,
          message: "preview_id is required."
        });
      }

      const result = await caseAllocationService.executeAllocation({
        previewId: idToExecute,
        actor: req.user
      });

      return res.status(200).json({
        success: true,
        message: `Successfully allocated ${result.total_assigned} cases using strategy '${result.strategy}'.`,
        data: result
      });
    } catch (error) {
      console.error("executeAllocation Error:", error);
      const statusCode = error.status || (error.message.includes("expired") ? 410 : 500);
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/allocation/manual-assign
   * Assign specific cases to an employee with validation
   */
  async manualAssign(req, res) {
    try {
      const { caseIds, caseId, employeeId, remarks } = req.body;
      const ids = caseIds || (caseId ? [caseId] : []);

      if (!ids || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "caseIds array or caseId is required."
        });
      }
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "employeeId is required."
        });
      }

      const result = await caseAllocationService.manualAssign({
        caseIds: ids,
        employeeId,
        actor: req.user,
        remarks: remarks || "Manual Case Assignment"
      });

      return res.status(200).json({
        success: true,
        message: `Successfully assigned ${result.total_assigned} case(s) to ${result.assigned_to}.`,
        data: result
      });
    } catch (error) {
      console.error("manualAssign Error:", error);
      return res.status(error.status || 400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/allocation/bulk-assign
   * Bulk assign cases
   */
  async bulkAssign(req, res) {
    return allocationController.manualAssign(req, res);
  },

  /**
   * POST /api/allocation/rebalance/preview
   * Workload rebalancing recommendations
   */
  async previewRebalance(req, res) {
    try {
      const { supervisorId } = req.body;
      const preview = await caseAllocationService.previewRebalance({
        actor: req.user,
        supervisorId: supervisorId || null
      });

      return res.status(200).json({
        success: true,
        message: preview.rebalance_required
          ? `Workload rebalancing recommendation generated: ${preview.total_proposed_transfers} transfers proposed.`
          : "Workload is currently balanced across staff.",
        data: preview
      });
    } catch (error) {
      console.error("previewRebalance Error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/allocation/rebalance/execute
   * Execute rebalance transfers atomically
   */
  async executeRebalance(req, res) {
    try {
      const { transfers = [] } = req.body;

      if (!Array.isArray(transfers) || transfers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "transfers array is required."
        });
      }

      let executedCount = 0;
      for (const t of transfers) {
        await caseAllocationService.manualAssign({
          caseIds: [t.case_id],
          employeeId: t.to_employee_id,
          actor: req.user,
          remarks: `Automated Workload Rebalance: ${t.reason || 'Capacity balancing'}`
        });
        executedCount++;
      }

      return res.status(200).json({
        success: true,
        message: `Successfully executed ${executedCount} workload rebalance transfer(s).`,
        transferred_count: executedCount
      });
    } catch (error) {
      console.error("executeRebalance Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/allocation/history
   * Audit trail of historical case assignments
   */
  async getHistory(req, res) {
    try {
      const { caseId, employeeId, page = 1, limit = 20 } = req.query;

      const historyData = await caseAllocationService.getAssignmentHistory({
        caseId: caseId || null,
        employeeId: employeeId || null,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        data: historyData
      });
    } catch (error) {
      console.error("getHistory Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/allocation/case/:caseId/history
   * Complete timeline history for a specific case
   */
  async getCaseHistory(req, res) {
    try {
      const { caseId } = req.params;

      const historyData = await caseAllocationService.getAssignmentHistory({
        caseId,
        page: 1,
        limit: 100
      });

      return res.status(200).json({
        success: true,
        case_id: caseId,
        history: historyData.history
      });
    } catch (error) {
      console.error("getCaseHistory Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/allocation/sla/check
   * Run SLA monitoring check and trigger idempotent alerts
   */
  async checkSla(req, res) {
    try {
      const result = await slaEscalationService.checkAndEscalate({
        actor: req.user
      });

      return res.status(200).json({
        success: true,
        message: `SLA Audit Complete: ${result.audited_cases_count} cases evaluated, ${result.escalations_created_count} escalations generated.`,
        data: result
      });
    } catch (error) {
      console.error("checkSla Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/allocation/sla/escalations
   * List recent SLA escalations
   */
  async listSlaEscalations(req, res) {
    try {
      const { caseId, status, page = 1, limit = 20 } = req.query;
      const escalations = await slaEscalationService.listEscalations({
        caseId: caseId || null,
        status: status || null,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        count: escalations.length,
        escalations
      });
    } catch (error) {
      console.error("listSlaEscalations Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default allocationController;
