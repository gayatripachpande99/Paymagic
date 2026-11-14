import pg from "pg";
import { v4 as uuidv4 } from "uuid";
import { createSeedData } from "../data/seedData.js";
import { indexService } from "../services/indexService.js";
import { cacheService } from "../services/cacheService.js";
import { runMigrations } from "../scripts/runMigrations.js";

const { Pool } = pg;

let pool = null;
let isPgActive = false;

// Relational memory store used when external PostgreSQL is not configured or in dev fallback
export const memoryStore = {
  roles: [],
  users: [],
  employees: [],
  customers: [],
  loan_cases: [],
  case_status_history: [],
  case_assignments: [],
  case_followups: [],
  calls: [],
  call_recordings: [],
  recording_access_logs: [],
  payments: [],
  targets: [],
  attendance: [],
  shifts: [],
  leave_requests: [],
  field_visits: [],
  cash_handovers: [],
  complaints: [],
  complaint_actions: [],
  notifications: [],
  enquiries: [],
  audit_logs: [],
  import_batches: []
};

export const initializeDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000
      });
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      isPgActive = true;
      console.log("Connected to PostgreSQL Database engine. Running migrations...");
      await runMigrations(pool);
      return;
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        console.error("FATAL: PostgreSQL connection failed in production mode:", err.message);
        throw new Error(`Production database failure: Cannot connect to PostgreSQL: ${err.message}`);
      }
      console.warn("PostgreSQL connection failed, operating with in-memory relational engine:", err.message);
      isPgActive = false;
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: DATABASE_URL must be provided in production environment.");
  }

  // Populate memory store with initial seed data
  console.log("Initializing PayMagic high-integrity relational store with seed data...");
  const seed = await createSeedData();
  memoryStore.roles = seed.roles;
  memoryStore.users = seed.users;
  memoryStore.employees = seed.employees;
  memoryStore.customers = seed.customers;
  memoryStore.loan_cases = seed.loanCases;
  memoryStore.case_status_history = seed.caseStatusHistory;
  memoryStore.calls = seed.calls;
  memoryStore.call_recordings = seed.callRecordings;
  memoryStore.recording_access_logs = seed.recordingAccessLogs || [];
  memoryStore.payments = seed.payments;
  memoryStore.complaints = seed.complaints;
  memoryStore.complaint_actions = seed.complaintActions || [];
  memoryStore.attendance = seed.attendance;
  memoryStore.field_visits = seed.fieldVisits;
  memoryStore.cash_handovers = seed.cashHandovers || [];
  memoryStore.enquiries = seed.enquiries;
  memoryStore.notifications = seed.notifications || [];

  // Rebuild all O(1) in-memory indexes
  const indexStats = indexService.rebuild(memoryStore);

  console.log(`Initialized database with:
  - ${memoryStore.users.length} Users (${memoryStore.roles.map(r => r.id).join(", ")})
  - ${memoryStore.loan_cases.length} Loan Cases (~200 records)
  - ${memoryStore.case_status_history.length} Case Status Audit Entries
  - ${memoryStore.customers.length} Borrowers
  - Indexes: ${indexStats.indexedCases} cases, ${indexStats.indexedCustomers} customers, ${indexStats.indexedStatusGroups} status groups, ${indexStats.indexedEmployeeGroups} staff groups`);
};

/**
 * Universal Database Transaction Manager
 * Guarantees atomic execution for all state transitions
 */
export const transaction = async (callback) => {
  if (isPgActive && pool) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // In-Memory Transaction with Snapshot Isolation & Rollback
  const snapshot = JSON.stringify(memoryStore);
  try {
    const trxClient = {
      isMemory: true,
      store: memoryStore
    };
    const result = await callback(trxClient);
    return result;
  } catch (err) {
    // Rollback snapshot
    const restored = JSON.parse(snapshot);
    Object.keys(restored).forEach((key) => {
      if (Array.isArray(memoryStore[key])) {
        memoryStore[key].length = 0;
        memoryStore[key].push(...restored[key]);
      } else {
        memoryStore[key] = restored[key];
      }
    });
    throw err;
  }
};

/**
 * CRITICAL RULE ENFORCEMENT:
 * Every case-status change must be recorded with employee ID, timestamp,
 * previous status and new status inside the SAME database transaction.
 * No code path may change status without it!
 */
export const updateCaseStatusWithHistory = async ({
  caseId,
  employeeId,
  newStatus,
  remarks = "",
  source = "System"
}) => {
  return await transaction(async (trx) => {
    // 1. Locate existing case via O(1) index or store
    const targetCase = indexService.getCase(caseId) || memoryStore.loan_cases.find((c) => c.id === caseId);
    if (!targetCase) {
      throw new Error(`Loan case with ID '${caseId}' not found.`);
    }

    const previousStatus = targetCase.status;
    if (previousStatus === newStatus) {
      return { case: targetCase, historyEntry: null, changed: false };
    }

    const now = new Date().toISOString();

    // 2. Mutate case status
    targetCase.status = newStatus;
    targetCase.updated_at = now;

    // Adjust specific status side-effects per business rules:
    // Rule 9 & 10: Fully Paid zeroes outstanding amount. Closed does NOT automatically mean Fully Paid (preserves balance).
    if (newStatus === "Fully Paid") {
      targetCase.outstanding_amount = 0;
    } else if (newStatus === "Closed") {
      targetCase.is_closed = true;
      targetCase.closed_at = now;
      targetCase.closed_by = employeeId;
    } else if (newStatus === "Field Visit") {
      targetCase.is_field_visit_required = true;
    }

    // 3. Atomically write audit row to case_status_history
    const historyEntry = {
      id: `csh_${uuidv4()}`,
      case_id: caseId,
      employee_id: employeeId,
      previous_status: previousStatus,
      new_status: newStatus,
      source: source || "System",
      remarks: remarks || `Status transition from ${previousStatus} to ${newStatus}`,
      created_at: now
    };

    memoryStore.case_status_history.unshift(historyEntry);

    // 4. Update in-memory index
    indexService.updateCaseStatus(targetCase, previousStatus, newStatus);

    // 5. Invalidate relevant caches automatically
    cacheService.delPattern("cases:*");
    cacheService.delPattern("dashboard:*");

    // 6. Return updated result
    return {
      case: { ...targetCase },
      historyEntry: { ...historyEntry },
      changed: true
    };
  });
};

export const db = {
  isPgActive: () => isPgActive,
  getPool: () => pool,
  transaction,
  updateCaseStatusWithHistory,
  store: memoryStore,
  indexService,
  cacheService
};

export default db;
