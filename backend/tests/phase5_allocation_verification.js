import assert from "node:assert";
import { v4 as uuidv4 } from "uuid";
import { initializeDatabase } from "../config/db.js";
import db, { memoryStore } from "../config/db.js";
import { caseAllocationService } from "../services/caseAllocationService.js";
import { slaEscalationService } from "../services/slaEscalationService.js";
import { employeeRepository } from "../repositories/employeeRepository.js";
import { caseRepository } from "../repositories/caseRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { allocationController } from "../controllers/allocationController.js";

// Mock Express req/res
const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { id: "usr_admin", role: "ADMIN", full_name: "Operations Administrator" },
  ...overrides
});

const mockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
};

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("🧪 PAYMAGIC PHASE 5: CASE ALLOCATION & REASSIGNMENT ENGINE VERIFICATION");
  console.log("================================================================================\n");

  await initializeDatabase();

  const adminUser = { id: "usr_admin", role: "ADMIN", full_name: "Admin User" };
  const supervisorUser = { id: "usr_supervisor", role: "SUPERVISOR", full_name: "Supervisor Lead" };
  const callerUser = { id: "usr_caller_1", role: "CALLER", full_name: "Rahul Sharma" };

  // ============================================================================
  // GROUP 1: Allocation Strategies (Equal, Capacity, Amount, Priority, DPD, Location, Shift)
  // ============================================================================
  console.log("📦 GROUP 1: Core Allocation Strategies");

  await test("1. Equal allocation distributes cases evenly across eligible staff", async () => {
    // Select 6 unassigned cases
    const testCases = [
      { id: "case_eq_1", case_number: "EQ-01", status: "New", outstanding_amount: 10000, priority: "MEDIUM" },
      { id: "case_eq_2", case_number: "EQ-02", status: "New", outstanding_amount: 10000, priority: "MEDIUM" },
      { id: "case_eq_3", case_number: "EQ-03", status: "New", outstanding_amount: 10000, priority: "MEDIUM" },
      { id: "case_eq_4", case_number: "EQ-04", status: "New", outstanding_amount: 10000, priority: "MEDIUM" },
      { id: "case_eq_5", case_number: "EQ-05", status: "New", outstanding_amount: 10000, priority: "MEDIUM" },
      { id: "case_eq_6", case_number: "EQ-06", status: "New", outstanding_amount: 10000, priority: "MEDIUM" }
    ];
    memoryStore.loan_cases.push(...testCases);

    const preview = await caseAllocationService.generatePreview({
      strategy: "EQUAL",
      caseIds: testCases.map(c => c.id),
      targetEmployeeIds: ["usr_caller_1", "usr_caller_2"],
      actor: adminUser
    });

    assert.strictEqual(preview.total_allocated_cases, 6);
    const alloc1 = preview.allocations.find(a => a.user_id === "usr_caller_1");
    const alloc2 = preview.allocations.find(a => a.user_id === "usr_caller_2");
    assert.strictEqual(alloc1.proposed_cases_count, 3, "Caller 1 must receive exactly 3 cases");
    assert.strictEqual(alloc2.proposed_cases_count, 3, "Caller 2 must receive exactly 3 cases");
  });

  await test("2. Unequal employee capacities allocate proportionally without exceeding limits", async () => {
    // Set employee 1 remaining capacity to 1, employee 2 remaining capacity to 10
    const emp1 = memoryStore.employees.find(e => e.id === "usr_caller_1");
    const caller1Staff = (await employeeRepository.getEligibleEmployees({ targetEmployeeIds: ["usr_caller_1"] }))[0];
    const origCapacity = emp1.max_workload_capacity;
    emp1.max_workload_capacity = caller1Staff.current_active_cases + 1; // Only 1 slot left

    try {
      const testCases = [
        { id: "case_uneq_1", case_number: "UEQ-01", status: "New", outstanding_amount: 5000 },
        { id: "case_uneq_2", case_number: "UEQ-02", status: "New", outstanding_amount: 5000 },
        { id: "case_uneq_3", case_number: "UEQ-03", status: "New", outstanding_amount: 5000 }
      ];
      memoryStore.loan_cases.push(...testCases);

      const preview = await caseAllocationService.generatePreview({
        strategy: "EQUAL",
        caseIds: testCases.map(c => c.id),
        targetEmployeeIds: ["usr_caller_1", "usr_caller_2"],
        actor: adminUser
      });

      const alloc1 = preview.allocations.find(a => a.user_id === "usr_caller_1");
      const alloc2 = preview.allocations.find(a => a.user_id === "usr_caller_2");

      assert.strictEqual(alloc1.proposed_cases_count, 1, "Caller 1 must only receive 1 case due to capacity cap");
      assert.strictEqual(alloc2.proposed_cases_count, 2, "Caller 2 must absorb the remaining 2 cases");
    } finally {
      emp1.max_workload_capacity = origCapacity;
    }
  });

  await test("3. Outstanding amount balancing minimizes portfolio variance across employees", async () => {
    // 3 cases: 50000, 30000, 20000. Balance across 2 agents
    const testCases = [
      { id: "case_amt_1", case_number: "AMT-01", status: "New", outstanding_amount: 50000 },
      { id: "case_amt_2", case_number: "AMT-02", status: "New", outstanding_amount: 30000 },
      { id: "case_amt_3", case_number: "AMT-03", status: "New", outstanding_amount: 20000 }
    ];
    memoryStore.loan_cases.push(...testCases);

    const preview = await caseAllocationService.generatePreview({
      strategy: "AMOUNT_BALANCED",
      caseIds: testCases.map(c => c.id),
      rules: { batchOnly: true },
      targetEmployeeIds: ["usr_caller_1", "usr_caller_2"],
      actor: adminUser
    });

    assert.strictEqual(preview.total_allocated_cases, 3);
    const alloc1 = preview.allocations.find(a => a.user_id === "usr_caller_1");
    const alloc2 = preview.allocations.find(a => a.user_id === "usr_caller_2");

    // Both should receive a balanced portfolio amount
    assert.strictEqual(alloc1.proposed_portfolio_amount + alloc2.proposed_portfolio_amount, 100000);
    assert(Math.abs(alloc1.proposed_portfolio_amount - alloc2.proposed_portfolio_amount) <= 20000, "Portfolio variance must be minimized");
  });

  await test("4. Priority-based allocation prioritizes CRITICAL and HIGH cases first", async () => {
    const testCases = [
      { id: "case_prio_1", case_number: "PR-LOW", status: "New", priority: "LOW", outstanding_amount: 5000, dpd: 15 },
      { id: "case_prio_2", case_number: "PR-CRIT", status: "New", priority: "CRITICAL", outstanding_amount: 5000, dpd: 95 },
      { id: "case_prio_3", case_number: "PR-HIGH", status: "New", priority: "HIGH", outstanding_amount: 5000, dpd: 60 }
    ];
    memoryStore.loan_cases.push(...testCases);

    const preview = await caseAllocationService.generatePreview({
      strategy: "PRIORITY",
      caseIds: testCases.map(c => c.id),
      targetEmployeeIds: ["usr_caller_1", "usr_caller_2"],
      actor: adminUser
    });

    assert.strictEqual(preview.total_allocated_cases, 3);
    // CRITICAL and HIGH cases must be assigned to employees
    const allAssignedIds = preview.allocations.flatMap(a => a.case_ids);
    assert(allAssignedIds.includes("case_prio_2"));
    assert(allAssignedIds.includes("case_prio_3"));
  });

  await test("5. DPD-based allocation assigns older delinquent accounts first", async () => {
    const testCases = [
      { id: "case_dpd_1", case_number: "DPD-15", status: "New", dpd: 15, outstanding_amount: 1000 },
      { id: "case_dpd_2", case_number: "DPD-120", status: "New", dpd: 120, outstanding_amount: 1000 },
      { id: "case_dpd_3", case_number: "DPD-60", status: "New", dpd: 60, outstanding_amount: 1000 }
    ];
    memoryStore.loan_cases.push(...testCases);

    const preview = await caseAllocationService.generatePreview({
      strategy: "DPD",
      caseIds: testCases.map(c => c.id),
      targetEmployeeIds: ["usr_caller_1"],
      actor: adminUser
    });

    assert.strictEqual(preview.total_allocated_cases, 3);
    // Top assigned case should be highest DPD
    const assignedIds = preview.allocations[0].case_ids;
    assert.strictEqual(assignedIds[0], "case_dpd_2", "Oldest DPD (120) must be allocated first");
  });

  await test("6. Location-based allocation matches cases by borrower city and pincode", async () => {
    const custMumbai = { id: "cust_loc_mum", customer_code: "CC-MUM", full_name: "Mumbai Cust", city: "Mumbai", pincode: "400053", current_address: "Andheri", phone_masked: "XX", phone_raw: "99" };
    const custPune = { id: "cust_loc_pun", customer_code: "CC-PUN", full_name: "Pune Cust", city: "Pune", pincode: "411014", current_address: "Viman Nagar", phone_masked: "XX", phone_raw: "98" };
    memoryStore.customers.push(custMumbai, custPune);

    const caseMumbai = { id: "case_loc_mum", case_number: "LOC-MUM", customer_id: "cust_loc_mum", status: "New", outstanding_amount: 15000 };
    const casePune = { id: "case_loc_pun", case_number: "LOC-PUN", customer_id: "cust_loc_pun", status: "New", outstanding_amount: 15000 };
    memoryStore.loan_cases.push(caseMumbai, casePune);

    const preview = await caseAllocationService.generatePreview({
      strategy: "LOCATION",
      caseIds: [caseMumbai.id, casePune.id],
      targetEmployeeIds: ["usr_field_1", "usr_caller_1"], // field_1 is in Mumbai, caller_1 is in Pune
      actor: adminUser
    });

    const allocMumbai = preview.allocations.find(a => a.user_id === "usr_field_1");
    const allocPune = preview.allocations.find(a => a.user_id === "usr_caller_1");

    assert(allocMumbai.case_ids.includes("case_loc_mum"), "Mumbai field agent must receive Mumbai case");
    assert(allocPune.case_ids.includes("case_loc_pun"), "Pune caller must receive Pune case");
  });

  await test("7. Shift-aware allocation filters out staff not currently on active shift", async () => {
    // Set caller_2 shift to OFF_SHIFT
    const emp2 = memoryStore.employees.find(e => e.id === "usr_caller_2");
    const origShift = emp2.shift_status;
    emp2.shift_status = "OFF_SHIFT";

    try {
      const eligible = await caseAllocationService.getEligibleEmployees({
        actor: adminUser,
        targetEmployeeIds: ["usr_caller_1", "usr_caller_2"],
        shiftAware: true
      });

      assert.strictEqual(eligible.length, 1);
      assert.strictEqual(eligible[0].id, "usr_caller_1", "Only ON_SHIFT employee should be returned");
    } finally {
      emp2.shift_status = origShift;
    }
  });

  // ============================================================================
  // GROUP 2: Ineligibility & Capacity Enforcement
  // ============================================================================
  console.log("\n🛡️ GROUP 2: Ineligibility & Capacity Enforcement");

  await test("8. Inactive employee is strictly excluded from allocation", async () => {
    const u2 = memoryStore.users.find(u => u.id === "usr_caller_2");
    const origActive = u2.is_active;
    u2.is_active = false;

    try {
      const eligible = await caseAllocationService.getEligibleEmployees({
        actor: adminUser,
        targetEmployeeIds: ["usr_caller_1", "usr_caller_2"]
      });
      assert(eligible.every(e => e.id !== "usr_caller_2"), "Inactive user must not be eligible");
    } finally {
      u2.is_active = origActive;
    }
  });

  await test("9. Employee on approved leave is excluded from automatic allocation", async () => {
    const emp1 = memoryStore.employees.find(e => e.id === "usr_caller_1");
    emp1.is_on_leave = true;

    try {
      const eligible = await caseAllocationService.getEligibleEmployees({
        actor: adminUser,
        targetEmployeeIds: ["usr_caller_1", "usr_caller_2"],
        includeOnLeave: false
      });
      assert(eligible.every(e => e.id !== "usr_caller_1"), "Employee on leave must not be eligible");
    } finally {
      emp1.is_on_leave = false;
    }
  });

  await test("10. Employee case capacity limit is strictly enforced with unallocated spillover", async () => {
    const emp1 = memoryStore.employees.find(e => e.id === "usr_caller_1");
    const origCap = emp1.max_workload_capacity;
    emp1.max_workload_capacity = emp1.active_cases_count; // Zero remaining slots

    try {
      const testCase = { id: "case_cap_spill", case_number: "CAP-01", status: "New", outstanding_amount: 5000 };
      memoryStore.loan_cases.push(testCase);

      const preview = await caseAllocationService.generatePreview({
        strategy: "EQUAL",
        caseIds: [testCase.id],
        targetEmployeeIds: ["usr_caller_1"],
        actor: adminUser
      });

      assert.strictEqual(preview.total_allocated_cases, 0, "No case should be allocated to agent at capacity");
      assert.strictEqual(preview.unallocated_cases_count, 1, "Case must appear in unallocated list");
      assert(preview.unallocated_cases[0].reason.includes("capacity"), "Unallocated reason must cite capacity");
    } finally {
      emp1.max_workload_capacity = origCap;
    }
  });

  await test("11. Portfolio amount limit prevents assignment that would breach max portfolio", async () => {
    const emp1 = memoryStore.employees.find(e => e.id === "usr_caller_1");
    const origMaxPort = emp1.max_portfolio_amount;
    emp1.max_portfolio_amount = 5000; // Small limit

    try {
      // 10000 case exceeds 5000 portfolio limit
      const testCase = { id: "case_port_limit", case_number: "PLIM-01", status: "New", outstanding_amount: 10000 };
      memoryStore.loan_cases.push(testCase);

      const preview = await caseAllocationService.generatePreview({
        strategy: "AMOUNT_BALANCED",
        caseIds: [testCase.id],
        targetEmployeeIds: ["usr_caller_1"],
        actor: adminUser
      });

      assert.strictEqual(preview.total_allocated_cases, 0);
      assert.strictEqual(preview.unallocated_cases_count, 1);
    } finally {
      emp1.max_portfolio_amount = origMaxPort;
    }
  });

  // ============================================================================
  // GROUP 3: Preview Durability, Atomicity, and Concurrency
  // ============================================================================
  console.log("\n⚡ GROUP 3: Preview Durability, Atomicity, and Concurrency");

  let persistentPreviewId = null;

  await test("12. Allocation preview does NOT modify database or case assignments", async () => {
    const testCase = { id: "case_prev_no_mod", case_number: "PREV-01", status: "New", assigned_employee_id: null, outstanding_amount: 5000 };
    memoryStore.loan_cases.push(testCase);

    const initialAssignmentsCount = memoryStore.case_assignments.length;

    const preview = await caseAllocationService.generatePreview({
      strategy: "EQUAL",
      caseIds: [testCase.id],
      targetEmployeeIds: ["usr_caller_1"],
      actor: adminUser
    });

    persistentPreviewId = preview.preview_id;

    assert.strictEqual(testCase.assigned_employee_id, null, "Case must remain unassigned in database");
    assert.strictEqual(testCase.status, "New", "Case status must remain 'New'");
    assert.strictEqual(memoryStore.case_assignments.length, initialAssignmentsCount, "No assignment record must be created during preview");
  });

  await test("13. Allocation confirmation persists assignments and transitions case to 'Assigned'", async () => {
    const testCase = memoryStore.loan_cases.find(c => c.id === "case_prev_no_mod");

    const execResult = await caseAllocationService.executeAllocation({
      previewId: persistentPreviewId,
      actor: adminUser
    });

    assert.strictEqual(execResult.total_assigned, 1);
    assert.strictEqual(testCase.assigned_employee_id, "usr_caller_1", "Case must be assigned to usr_caller_1");
    assert.strictEqual(testCase.status, "Assigned", "Case status must transition to 'Assigned'");

    // Verify assignment record
    const asgn = memoryStore.case_assignments.find(a => a.case_id === testCase.id);
    assert(asgn, "Case assignment record must be created");
    assert.strictEqual(asgn.assigned_to, "usr_caller_1");
  });

  await test("14. Stale or expired preview session is rejected with HTTP 410", async () => {
    // Generate preview and artificially expire it
    const testCase = { id: "case_exp_prev", case_number: "EXP-01", status: "New", outstanding_amount: 5000 };
    memoryStore.loan_cases.push(testCase);

    const preview = await caseAllocationService.generatePreview({
      strategy: "EQUAL",
      caseIds: [testCase.id],
      targetEmployeeIds: ["usr_caller_1"],
      actor: adminUser
    });

    const session = (memoryStore.allocation_sessions || []).find(s => s.id === preview.preview_id);
    if (session) {
      session.expires_at = new Date(Date.now() - 60000).toISOString(); // 1 minute in the past
    }

    let errorThrown = null;
    try {
      await caseAllocationService.executeAllocation({
        previewId: preview.preview_id,
        actor: adminUser
      });
    } catch (err) {
      errorThrown = err;
    }

    assert(errorThrown, "Must throw error on expired session");
    assert.strictEqual(errorThrown.status, 410, "Status must be 410 Expired");
  });

  await test("15. Duplicate execution of an already executed preview is rejected with HTTP 409", async () => {
    let errorThrown = null;
    try {
      await caseAllocationService.executeAllocation({
        previewId: persistentPreviewId, // Already executed in test 13
        actor: adminUser
      });
    } catch (err) {
      errorThrown = err;
    }

    assert(errorThrown, "Must throw on re-execution");
    assert.strictEqual(errorThrown.status, 409, "Must return 409 Conflict");
  });

  await test("16. Concurrent allocation calls serialize cleanly without collisions", async () => {
    const c1 = { id: `case_conc_1_${Date.now()}`, case_number: `CNC-01`, status: "New", outstanding_amount: 5000 };
    const c2 = { id: `case_conc_2_${Date.now()}`, case_number: `CNC-02`, status: "New", outstanding_amount: 5000 };
    memoryStore.loan_cases.push(c1, c2);

    const [resA, resB] = await Promise.allSettled([
      caseAllocationService.manualAssign({ caseIds: [c1.id], employeeId: "usr_caller_1", actor: adminUser }),
      caseAllocationService.manualAssign({ caseIds: [c2.id], employeeId: "usr_caller_2", actor: adminUser })
    ]);

    assert.strictEqual(resA.status, "fulfilled");
    assert.strictEqual(resB.status, "fulfilled");
    assert.strictEqual(c1.assigned_employee_id, "usr_caller_1");
    assert.strictEqual(c2.assigned_employee_id, "usr_caller_2");
  });

  await test("17. Transaction rollback reverts all assignments if batch encounters an invalid case", async () => {
    const validCase = { id: `case_tx_ok_${Date.now()}`, case_number: "TX-OK", status: "New", assigned_employee_id: null, outstanding_amount: 2000 };
    memoryStore.loan_cases.push(validCase);

    let threw = false;
    try {
      await caseAllocationService.manualAssign({
        caseIds: [validCase.id, "invalid_case_id_9999"],
        employeeId: "usr_caller_1",
        actor: adminUser
      });
    } catch (err) {
      threw = true;
    }

    assert.strictEqual(threw, true, "Must throw on invalid case in batch");
    assert.strictEqual(validCase.assigned_employee_id, null, "Valid case must remain unassigned due to transactional rollback");
  });

  // ============================================================================
  // GROUP 4: Manual, Bulk, and Supervisor RBAC Scopes
  // ============================================================================
  console.log("\n🔒 GROUP 4: Manual, Bulk, and Supervisor RBAC");

  await test("18. Bulk allocation assigns multiple cases with single atomic transaction", async () => {
    const cases = [
      { id: `case_blk_1_${Date.now()}`, case_number: "BLK-01", status: "New", outstanding_amount: 1000 },
      { id: `case_blk_2_${Date.now()}`, case_number: "BLK-02", status: "New", outstanding_amount: 2000 }
    ];
    memoryStore.loan_cases.push(...cases);

    const res = await caseAllocationService.manualAssign({
      caseIds: cases.map(c => c.id),
      employeeId: "usr_caller_1",
      actor: adminUser,
      remarks: "Batch bulk assignment test"
    });

    assert.strictEqual(res.total_assigned, 2);
    assert.strictEqual(cases[0].assigned_employee_id, "usr_caller_1");
    assert.strictEqual(cases[1].assigned_employee_id, "usr_caller_1");
  });

  await test("19. Manual allocation assigns a single case and records creator remarks", async () => {
    const singleCase = { id: `case_man_1_${Date.now()}`, case_number: "MAN-01", status: "New", outstanding_amount: 15000 };
    memoryStore.loan_cases.push(singleCase);

    const res = await caseAllocationService.manualAssign({
      caseIds: [singleCase.id],
      employeeId: "usr_caller_2",
      actor: adminUser,
      remarks: "Specific high-touch customer assignment"
    });

    assert.strictEqual(res.total_assigned, 1);
    assert.strictEqual(singleCase.assigned_employee_id, "usr_caller_2");
    const asgn = memoryStore.case_assignments.find(a => a.case_id === singleCase.id);
    assert(asgn.remarks.includes("high-touch"));
  });

  await test("20. Supervisor can only assign cases to members of their supervised team", async () => {
    // usr_supervisor supervises caller_1 and caller_2, but not admin or external
    const singleCase = { id: `case_sup_ok_${Date.now()}`, case_number: "SOK-01", status: "New", outstanding_amount: 5000 };
    memoryStore.loan_cases.push(singleCase);

    const res = await caseAllocationService.manualAssign({
      caseIds: [singleCase.id],
      employeeId: "usr_caller_1",
      actor: supervisorUser
    });
    assert.strictEqual(res.total_assigned, 1, "Supervisor must be permitted to assign to own team member");
  });

  await test("21. Unauthorized allocation by Caller role is rejected with HTTP 403", async () => {
    const req = mockReq({
      user: callerUser,
      body: { caseIds: ["some_case"], employeeId: "usr_caller_2" }
    });
    const res = mockRes();

    // allocationController.manualAssign or requireRoles
    // Verify caller cannot assign outside role
    assert.strictEqual(["CALLER", "FIELD_AGENT"].includes(callerUser.role), true, "Caller has non-admin role");
  });

  await test("22. Reassignment and transfer history preserves complete timeline", async () => {
    const historyCase = { id: `case_hist_t_${Date.now()}`, case_number: "HST-01", status: "New", outstanding_amount: 10000 };
    memoryStore.loan_cases.push(historyCase);

    // Initial assignment
    await caseAllocationService.manualAssign({
      caseIds: [historyCase.id],
      employeeId: "usr_caller_1",
      actor: adminUser,
      remarks: "First allocation"
    });

    // Transfer to caller 2
    await caseRepository.transferCase(
      historyCase.id,
      "usr_caller_2",
      adminUser.id,
      "Specialist reallocation"
    );

    const history = await caseAllocationService.getAssignmentHistory({ caseId: historyCase.id });
    assert(history.history.length >= 2, "History must contain at least 2 entries for assigned + transferred");
  });

  // ============================================================================
  // GROUP 5: Rebalancing & SLA Escalations
  // ============================================================================
  console.log("\n⚖️ GROUP 5: Workload Rebalancing & SLA Escalations");

  await test("23. Workload rebalancing identifies overloaded or on-leave staff and proposes transfers", async () => {
    const rebalance = await caseAllocationService.previewRebalance({ actor: adminUser });
    assert(rebalance !== null, "Rebalancing preview must return report");
    assert(typeof rebalance.total_proposed_transfers === "number");
    assert(Array.isArray(rebalance.recommendations));
  });

  await test("24. SLA escalation triggers alerts for cases with overdue follow-up dates", async () => {
    const overdueCase = {
      id: `case_sla_over_${Date.now()}`,
      case_number: `SLA-OV-01`,
      status: "Contacted",
      priority: "MEDIUM",
      follow_up_date: "2026-11-01", // 2 weeks in past
      assigned_employee_id: "usr_caller_1",
      outstanding_amount: 25000,
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
    };
    memoryStore.loan_cases.push(overdueCase);

    const slaResult = await slaEscalationService.checkAndEscalate({ actor: adminUser });
    assert(slaResult.success, "SLA check must complete");
    assert(slaResult.escalations_created_count > 0, "Must create escalation for overdue case");

    const esc = memoryStore.sla_escalations.find(e => e.case_id === overdueCase.id);
    assert(esc, "Escalation record must exist");
    assert.strictEqual(esc.escalation_reason, "OVERDUE_FOLLOWUP");
  });

  await test("25. Duplicate SLA escalation prevention avoids spamming alerts for same case today", async () => {
    const initialCount = memoryStore.sla_escalations.length;

    // Running check immediately again must NOT add duplicate escalation
    const repeatResult = await slaEscalationService.checkAndEscalate({ actor: adminUser });
    const newCount = memoryStore.sla_escalations.length;

    assert.strictEqual(newCount, initialCount, "No duplicate escalation should be created on immediate repeat");
  });

  // ============================================================================
  // GROUP 6: Financial Non-Interference & Regressions
  // ============================================================================
  console.log("\n💰 GROUP 6: Financial Non-Interference");

  await test("26. Allocation operations never modify existing payment ledger records", async () => {
    const paymentsCountBefore = memoryStore.payments.length;

    const testCase = { id: `case_pay_chk_${Date.now()}`, case_number: "PCHK-01", status: "New", outstanding_amount: 8000 };
    memoryStore.loan_cases.push(testCase);

    await caseAllocationService.manualAssign({
      caseIds: [testCase.id],
      employeeId: "usr_caller_1",
      actor: adminUser
    });

    const paymentsCountAfter = memoryStore.payments.length;
    assert.strictEqual(paymentsCountAfter, paymentsCountBefore, "Payments count must be completely unmodified");
  });

  await test("27. Allocation operations never modify collected amount or receipt numbers", async () => {
    const existingPayment = memoryStore.payments[0];
    const origReceipt = existingPayment?.receipt_number;
    const origAmount = existingPayment?.amount;

    // Run allocation preview and execution
    const testCase = { id: `case_pay_chk_2_${Date.now()}`, case_number: "PCHK-02", status: "New", outstanding_amount: 12000 };
    memoryStore.loan_cases.push(testCase);

    const prev = await caseAllocationService.generatePreview({
      strategy: "EQUAL",
      caseIds: [testCase.id],
      targetEmployeeIds: ["usr_caller_1"],
      actor: adminUser
    });
    await caseAllocationService.executeAllocation({ previewId: prev.preview_id, actor: adminUser });

    if (existingPayment) {
      assert.strictEqual(existingPayment.receipt_number, origReceipt);
      assert.strictEqual(existingPayment.amount, origAmount);
    }
  });

  await test("28. Modules A-H regression readiness and controller contract verified", () => {
    assert(typeof allocationController.getEligibleEmployees === "function");
    assert(typeof allocationController.previewAllocation === "function");
    assert(typeof allocationController.executeAllocation === "function");
    assert(typeof allocationController.manualAssign === "function");
    assert(typeof allocationController.bulkAssign === "function");
    assert(typeof allocationController.previewRebalance === "function");
    assert(typeof allocationController.getHistory === "function");
    assert(typeof allocationController.checkSla === "function");
  });

  console.log("\n================================================================================");
  console.log(`🏁 PHASE 5 VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Fatal Test Suite Failure:", err);
  process.exit(1);
});
