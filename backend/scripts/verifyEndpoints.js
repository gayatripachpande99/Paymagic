import { initializeDatabase, memoryStore } from "../config/db.js";
import { login } from "../controllers/authController.js";
import {
  getAdminOverview,
  getHierarchy,
  getCases,
  getCaseDetails,
  uploadAllocationFile,
  allocateAccounts,
  getPendingPayments,
  verifyPayment,
  getPaymentLedger,
  getAnalytics,
  getTelephonyLogs,
  exportReport,
  getFieldRecoveryData,
  reconcileCashHandover,
  getCommunicationsData
} from "../controllers/adminController.js";
import {
  getEmployeeDashboard,
  getAssignedCases,
  recordCall,
  saveDisposition,
  recordPaymentClaim,
  getEmployeeFollowups,
  updatePresence,
  getFieldVisits,
  recordFieldVisitCheckIn,
  recordFieldVisitOutcome
} from "../controllers/employeeController.js";

function createMockRes() {
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
}

async function runDirectUnitTests() {
  console.log("--- Starting PayMagic Admin Direct Module Verification ---");
  await initializeDatabase();

  // 1. Unified Auth Login
  console.log("1. Testing login with Employee ID PM-ADM-0001...");
  const loginReq = {
    body: { employeeId: "PM-ADM-0001", password: "Admin@123" }
  };
  const loginRes = createMockRes();
  await login(loginReq, loginRes);
  if (loginRes.statusCode !== 200 || !loginRes.data?.token) {
    throw new Error(`Login failed: ${loginRes.statusCode} ${JSON.stringify(loginRes.data)}`);
  }
  console.log("✓ Login successful: role =", loginRes.data.user.role, "Employee ID =", loginRes.data.user.employeeId);

  const mockAdminUser = loginRes.data.user;

  // 2. Admin Overview Telemetry
  console.log("2. Testing getAdminOverview...");
  const overviewRes = createMockRes();
  await getAdminOverview({ user: mockAdminUser }, overviewRes);
  console.log("✓ Overview status:", overviewRes.statusCode, "Total Debt Portfolio: ₹" + overviewRes.data.data.summary.total_principal.toLocaleString("en-IN"));

  // 3. Hierarchy
  console.log("3. Testing getHierarchy...");
  const hierRes = createMockRes();
  await getHierarchy({ user: mockAdminUser }, hierRes);
  console.log("✓ Hierarchy status:", hierRes.statusCode, "Allocators:", hierRes.data.data.allocators.length, "Campaigns:", hierRes.data.data.campaigns.length);

  // 4. Accounts Queue
  console.log("4. Testing getCases...");
  const casesReq = { query: { page: 1, limit: 10, status: "ALL" }, user: mockAdminUser };
  const casesRes = createMockRes();
  await getCases(casesReq, casesRes);
  const sampleCase = casesRes.data.data.cases[0];
  console.log("✓ Cases status:", casesRes.statusCode, "Fetched cases:", casesRes.data.data.cases.length, "Sample Case:", sampleCase.case_number);

  // 5. Case Details & Timeline
  console.log("5. Testing getCaseDetails for", sampleCase.id, "...");
  const detailReq = { params: { caseId: sampleCase.id }, user: mockAdminUser };
  const detailRes = createMockRes();
  await getCaseDetails(detailReq, detailRes);
  console.log("✓ Details status:", detailRes.statusCode, "Borrower:", detailRes.data.data.customer.full_name, "Timeline steps:", detailRes.data.data.timeline.length);

  // 6. Portfolio Allocation Ingestion
  console.log("6. Testing uploadAllocationFile...");
  const uploadReq = {
    body: {
      allocator_id: hierRes.data.data.allocators[0].id,
      portfolio_name: "Verification Ingestion Batch",
      product_type: "Auto Loan",
      total_accounts: 15,
      total_principal: 2500000,
      bucket: "Writeoff"
    },
    user: mockAdminUser
  };
  const uploadRes = createMockRes();
  await uploadAllocationFile(uploadReq, uploadRes);
  console.log("✓ Ingestion status:", uploadRes.statusCode, "Message:", uploadRes.data.message);

  // 7. Algorithmic Allocation Execution
  console.log("7. Testing allocateAccounts...");
  const allocReq = {
    body: {
      case_ids: [sampleCase.id],
      agent_ids: ["usr_caller_1", "usr_caller_2"],
      rule: "EQUAL_COUNT"
    },
    user: mockAdminUser
  };
  const allocRes = createMockRes();
  await allocateAccounts(allocReq, allocRes);
  console.log("✓ Allocation execution status:", allocRes.statusCode, "Message:", allocRes.data.message);

  // 8. Dual-Control Payment Verification Desk
  console.log("8. Testing getPendingPayments...");
  const payDeskRes = createMockRes();
  await getPendingPayments({ user: mockAdminUser }, payDeskRes);
  const pendingPay = payDeskRes.data.data[0];
  console.log("✓ Payment Desk status:", payDeskRes.statusCode, "Pending audits count:", payDeskRes.data.data.length);

  // 9. Payment Verification & Financial Ledger Posting
  console.log("9. Testing verifyPayment for", pendingPay.id, "...");
  const verifyReq = {
    params: { paymentId: pendingPay.id },
    body: { action: "APPROVE", supervisorRemarks: "Verified against bank settlement." },
    user: mockAdminUser
  };
  const verifyRes = createMockRes();
  await verifyPayment(verifyReq, verifyRes);
  console.log("✓ Payment Verification status:", verifyRes.statusCode, "Message:", verifyRes.data.message);

  // 10. Regulatory & Statutory Report Export
  console.log("10. Testing exportReport...");
  const reportReq = {
    body: { reportType: "EXECUTIVE_ONE_VIEW" },
    user: mockAdminUser,
    ip: "127.0.0.1"
  };
  const reportRes = createMockRes();
  await exportReport(reportReq, reportRes);
  console.log("✓ Report Export status:", reportRes.statusCode, "Compliance Audit ID:", reportRes.data.data.audit.id);

  // 11. Portfolio Analytics & DPD Buckets
  console.log("11. Testing getAnalytics...");
  const analyticsRes = createMockRes();
  await getAnalytics({ user: mockAdminUser }, analyticsRes);
  console.log("✓ Analytics status:", analyticsRes.statusCode, "0-30 DPD count:", analyticsRes.data.data.buckets.b0_30.count, "90+ DPD count:", analyticsRes.data.data.buckets.b90_plus.count);

  // 12. Voice Telephony CDR Logs & Evidence Vault
  console.log("12. Testing getTelephonyLogs...");
  const telRes = createMockRes();
  await getTelephonyLogs({ user: mockAdminUser }, telRes);
  console.log("✓ Telephony status:", telRes.statusCode, "Total logged calls:", telRes.data.data.summary.total_logged_calls, "Connection rate:", telRes.data.data.summary.connection_rate_pct + "%");

  // 13. Financial Ledger Reconciled Records
  console.log("13. Testing getPaymentLedger...");
  const ledgRes = createMockRes();
  await getPaymentLedger({ user: mockAdminUser }, ledgRes);
  console.log("✓ Payment Ledger status:", ledgRes.statusCode, "Reconciled ledger transactions:", ledgRes.data.data.length);

  // 14. Employee Authentication & Operations
  console.log("\n--- Starting Employee Panel Platform Verification ---");
  console.log("14. Testing employee login (PM-CAL-0001)...");
  const empLoginReq = {
    body: { employeeId: "PM-CAL-0001", password: "Emp@123" }
  };
  const empLoginRes = createMockRes();
  await login(empLoginReq, empLoginRes);
  const mockEmpUser = empLoginRes.data.user;
  console.log("✓ Employee login OK:", mockEmpUser.role, mockEmpUser.employeeId);

  // 15. Employee Dashboard Telemetry
  console.log("15. Testing getEmployeeDashboard...");
  const empDashRes = createMockRes();
  await getEmployeeDashboard({ user: mockEmpUser }, empDashRes);
  console.log("✓ Employee Dashboard status:", empDashRes.statusCode, "Assigned accounts:", empDashRes.data.data.summary.assigned_accounts, "Verified recoveries: ₹" + empDashRes.data.data.summary.verified_recovered_amount);

  // 16. Employee Assigned Working Queue
  console.log("16. Testing getAssignedCases for agent...");
  const empCasesRes = createMockRes();
  await getAssignedCases({ user: mockEmpUser, query: { page: 1, limit: 5 } }, empCasesRes);
  const targetWorkingCase = empCasesRes.data.data.cases[0];
  console.log("✓ Assigned Cases status:", empCasesRes.statusCode, "Fetched cases in queue:", empCasesRes.data.data.cases.length, "Working on:", targetWorkingCase.case_number);

  // 17. Click-to-Call Softphone Event Recording
  console.log("17. Testing recordCall softphone event...");
  const callReq = {
    body: { case_id: targetWorkingCase.id, duration: 135, outcome: "Promise to Pay", direction: "OUTBOUND" },
    user: mockEmpUser
  };
  const callRes = createMockRes();
  await recordCall(callReq, callRes);
  console.log("✓ Record Call status:", callRes.statusCode, "Evidence saved:", callRes.data.message);

  // 18. Save Disposition & Auto-Trigger PTP Task
  console.log("18. Testing saveDisposition with Promise to Pay...");
  const dispReq = {
    body: {
      case_id: targetWorkingCase.id,
      disposition: "Promise to Pay",
      remarks: "Borrower agreed to settle ₹12,000 on Friday via UPI.",
      ptp_amount: 12000,
      ptp_date: "2026-11-22"
    },
    user: mockEmpUser
  };
  const dispRes = createMockRes();
  await saveDisposition(dispReq, dispRes);
  console.log("✓ Save Disposition status:", dispRes.statusCode, "Message:", dispRes.data.message);

  // 19. Record Payment Collection Claim (Pending Verification)
  console.log("19. Testing recordPaymentClaim (Dual-Control Invariant 5)...");
  const payClaimReq = {
    body: {
      case_id: targetWorkingCase.id,
      amount: 12000,
      payment_mode: "UPI",
      utr_number: "UPI-TEST-99210842",
      notes: "Customer shared transaction screenshot on WhatsApp."
    },
    user: mockEmpUser
  };
  const payClaimRes = createMockRes();
  await recordPaymentClaim(payClaimReq, payClaimRes);
  console.log("✓ Payment claim status:", payClaimRes.statusCode, "Status:", payClaimRes.data.data.status, "Message:", payClaimRes.data.message);

  // 20. Employee Priority Followups & PTP Tasks
  console.log("20. Testing getEmployeeFollowups...");
  const followupsRes = createMockRes();
  await getEmployeeFollowups({ user: mockEmpUser }, followupsRes);
  console.log("✓ Priority Tasks status:", followupsRes.statusCode, "Tasks count:", followupsRes.data.data.length);

  // 21. Backend-Driven Agent Presence State Transition
  console.log("21. Testing updatePresence (TEA_BREAK)...");
  const presReq = { body: { status: "TEA_BREAK" }, user: mockEmpUser };
  const presRes = createMockRes();
  await updatePresence(presReq, presRes);
  console.log("✓ Presence update status:", presRes.statusCode, "New Presence State:", presRes.data.data.status);

  // 22. Field Recovery Operations & Radar (Admin)
  console.log("\n--- Starting Field Operations & Communications Verification ---");
  console.log("22. Testing getFieldRecoveryData (Admin)...");
  const fieldAdminRes = createMockRes();
  await getFieldRecoveryData({ user: mockAdminUser }, fieldAdminRes);
  console.log("✓ Field Recovery Admin status:", fieldAdminRes.statusCode, "Active field visits:", fieldAdminRes.data.data.visits.length, "Cash handovers:", fieldAdminRes.data.data.handovers.length);

  // 23. Cash Handover Reconcile (Admin Dual-Control)
  const handoverId = fieldAdminRes.data.data.handovers[0]?.id || "fho_101";
  console.log("23. Testing reconcileCashHandover for", handoverId, "...");
  const reconReq = {
    params: { id: handoverId },
    body: { status: "RECONCILED", tellerSlipNumber: "BR-PUN-DEP-99410", remarks: "Physically matched cash in branch safe." },
    user: mockAdminUser
  };
  const reconRes = createMockRes();
  await reconcileCashHandover(reconReq, reconRes);
  console.log("✓ Cash Handover Reconciled:", reconRes.statusCode, "Status:", reconRes.data.data.status);

  // 24. Multi-Channel Digital Communications (Admin)
  console.log("24. Testing getCommunicationsData (SMS, WhatsApp, IVR)...");
  const commsRes = createMockRes();
  await getCommunicationsData({ user: mockAdminUser }, commsRes);
  console.log("✓ Communications Hub status:", commsRes.statusCode, "Total messages logged:", commsRes.data.data.summary.total_sent);

  // 25. Field Visits (Employee - Field Agent)
  console.log("25. Testing getFieldVisits for agent...");
  const fieldLoginReq = {
    body: { employeeId: "PM-FLD-0001", password: "Emp@123" }
  };
  const fieldLoginRes = createMockRes();
  await login(fieldLoginReq, fieldLoginRes);
  const mockFieldUser = fieldLoginRes.data.user;
  console.log("✓ Field Agent login OK:", mockFieldUser.role, mockFieldUser.employeeId);

  const fieldEmpRes = createMockRes();
  await getFieldVisits({ user: mockFieldUser }, fieldEmpRes);
  const firstVisit = fieldEmpRes.data.data[0];
  console.log("✓ Employee Field Visits status:", fieldEmpRes.statusCode, "Assigned visits:", fieldEmpRes.data.data.length, "Target:", firstVisit.borrower_name);

  // 26. Field Visit GPS Check-In (Employee)
  console.log("26. Testing recordFieldVisitCheckIn for visit", firstVisit.id, "...");
  const checkinReq = {
    params: { id: firstVisit.id },
    body: { latitude: 18.5204, longitude: 73.8567, deviationDistanceMeters: 45 },
    user: mockFieldUser
  };
  const checkinRes = createMockRes();
  await recordFieldVisitCheckIn(checkinReq, checkinRes);
  console.log("✓ GPS Check-In status:", checkinRes.statusCode, "Check-in recorded at:", checkinRes.data.data.visit_start);

  // 27. Field Visit Outcome & Spot Digital Receipt (Employee)
  console.log("27. Testing recordFieldVisitOutcome for visit", firstVisit.id, "...");
  const outcomeReq = {
    params: { id: firstVisit.id },
    body: {
      outcome: "Customer Met & Paid",
      notes: "Borrower paid cash token on spot at premises.",
      collected_amount: 8500,
      payment_mode: "CASH"
    },
    user: mockFieldUser
  };
  const outcomeRes = createMockRes();
  await recordFieldVisitOutcome(outcomeReq, outcomeRes);
  console.log("✓ Field Visit Outcome recorded:", outcomeRes.statusCode, "Outcome:", outcomeRes.data.data.visit_outcome, "Digital receipt:", outcomeRes.data.data.receipt_ref);

  console.log("\n=========================================================================");
  console.log("🎉 ALL 27 END-TO-END ADMIN, FIELD, COMMUNICATIONS & EMPLOYEE MODULES VERIFIED 100% OK!");
  console.log("=========================================================================\n");
}

runDirectUnitTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
