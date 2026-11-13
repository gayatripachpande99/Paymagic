/**
 * PayMagic In-Memory Indexing Engine
 * Creates hash maps and inverted indexes over the relational entities
 * to guarantee O(1) lookups and sub-millisecond filtering.
 */

class IndexService {
  constructor() {
    this.indexes = {
      caseById: new Map(),
      casesByEmployee: new Map(),
      casesByStatus: new Map(),
      casesByLender: new Map(),
      casesByPriority: new Map(),
      customerById: new Map(),
      customerByPhone: new Map(),
      callsByCase: new Map(),
      historyByCase: new Map(),
      paymentsByCase: new Map()
    };
  }

  /**
   * Rebuild all indexes from the current store arrays
   */
  rebuild(store) {
    // Clear existing indexes
    Object.values(this.indexes).forEach((map) => map.clear());

    // 1. Index Customers
    if (Array.isArray(store.customers)) {
      for (const cust of store.customers) {
        this.indexes.customerById.set(cust.id, cust);
        if (cust.phone_raw) {
          this.indexes.customerByPhone.set(cust.phone_raw.replace(/\s+/g, ""), cust);
        }
      }
    }

    // 2. Index Loan Cases
    if (Array.isArray(store.loan_cases)) {
      for (const c of store.loan_cases) {
        this.indexCase(c);
      }
    }

    // 3. Index Status History
    if (Array.isArray(store.case_status_history)) {
      for (const h of store.case_status_history) {
        if (!this.indexes.historyByCase.has(h.case_id)) {
          this.indexes.historyByCase.set(h.case_id, []);
        }
        this.indexes.historyByCase.get(h.case_id).push(h);
      }
    }

    // 4. Index Calls
    if (Array.isArray(store.calls)) {
      for (const call of store.calls) {
        if (!this.indexes.callsByCase.has(call.case_id)) {
          this.indexes.callsByCase.set(call.case_id, []);
        }
        this.indexes.callsByCase.get(call.case_id).push(call);
      }
    }

    // 5. Index Payments
    if (Array.isArray(store.payments)) {
      for (const pay of store.payments) {
        if (!this.indexes.paymentsByCase.has(pay.case_id)) {
          this.indexes.paymentsByCase.set(pay.case_id, []);
        }
        this.indexes.paymentsByCase.get(pay.case_id).push(pay);
      }
    }

    return this.getStats();
  }

  /**
   * Index a single case across primary and secondary indexes
   */
  indexCase(c) {
    this.indexes.caseById.set(c.id, c);

    // Index by Employee
    if (c.assigned_employee_id) {
      if (!this.indexes.casesByEmployee.has(c.assigned_employee_id)) {
        this.indexes.casesByEmployee.set(c.assigned_employee_id, new Set());
      }
      this.indexes.casesByEmployee.get(c.assigned_employee_id).add(c);
    }

    // Index by Status
    if (c.status) {
      if (!this.indexes.casesByStatus.has(c.status)) {
        this.indexes.casesByStatus.set(c.status, new Set());
      }
      this.indexes.casesByStatus.get(c.status).add(c);
    }

    // Index by Lender
    if (c.lender_name) {
      if (!this.indexes.casesByLender.has(c.lender_name)) {
        this.indexes.casesByLender.set(c.lender_name, new Set());
      }
      this.indexes.casesByLender.get(c.lender_name).add(c);
    }

    // Index by Priority
    if (c.priority) {
      if (!this.indexes.casesByPriority.has(c.priority)) {
        this.indexes.casesByPriority.set(c.priority, new Set());
      }
      this.indexes.casesByPriority.get(c.priority).add(c);
    }
  }

  /**
   * Update index when case status transitions
   */
  updateCaseStatus(c, oldStatus, newStatus) {
    if (oldStatus && this.indexes.casesByStatus.has(oldStatus)) {
      this.indexes.casesByStatus.get(oldStatus).delete(c);
    }
    if (!this.indexes.casesByStatus.has(newStatus)) {
      this.indexes.casesByStatus.set(newStatus, new Set());
    }
    this.indexes.casesByStatus.get(newStatus).add(c);
  }

  /**
   * Update index when case is transferred or assigned to another employee
   */
  reassignCase(c, oldEmpId, newEmpId) {
    if (oldEmpId && this.indexes.casesByEmployee.has(oldEmpId)) {
      this.indexes.casesByEmployee.get(oldEmpId).delete(c);
    }
    if (newEmpId) {
      if (!this.indexes.casesByEmployee.has(newEmpId)) {
        this.indexes.casesByEmployee.set(newEmpId, new Set());
      }
      this.indexes.casesByEmployee.get(newEmpId).add(c);
    }
  }

  /**
   * Fast O(1) lookups
   */
  getCase(caseId) {
    return this.indexes.caseById.get(caseId) || null;
  }

  getCustomer(customerId) {
    return this.indexes.customerById.get(customerId) || null;
  }

  getCustomerByPhone(phone) {
    if (!phone) return null;
    return this.indexes.customerByPhone.get(phone.replace(/\s+/g, "")) || null;
  }

  getCasesForEmployee(employeeId) {
    const set = this.indexes.casesByEmployee.get(employeeId);
    return set ? Array.from(set) : [];
  }

  getCasesByStatus(status) {
    const set = this.indexes.casesByStatus.get(status);
    return set ? Array.from(set) : [];
  }

  getHistoryForCase(caseId) {
    return this.indexes.historyByCase.get(caseId) || [];
  }

  getCallsForCase(caseId) {
    return this.indexes.callsByCase.get(caseId) || [];
  }

  getPaymentsForCase(caseId) {
    return this.indexes.paymentsByCase.get(caseId) || [];
  }

  /**
   * Get indexing statistics
   */
  getStats() {
    return {
      indexedCases: this.indexes.caseById.size,
      indexedCustomers: this.indexes.customerById.size,
      indexedStatusGroups: this.indexes.casesByStatus.size,
      indexedEmployeeGroups: this.indexes.casesByEmployee.size,
      indexedLenders: this.indexes.casesByLender.size,
      indexedHistoryRecords: this.indexes.historyByCase.size,
      indexedCallRecords: this.indexes.callsByCase.size
    };
  }
}

export const indexService = new IndexService();
export default indexService;

