import assert from "assert";
import { memoryStore, initializeDatabase } from "../config/db.js";
import {
  getComplaintsOverview,
  listComplaints,
  getComplaintById,
  recordComplaint,
  assignComplaint,
  resolveComplaint,
  getCustomerInvestigationDossier
} from "../controllers/complaintController.js";

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

async function runModuleGVerification() {
  console.log("==================================================");
  console.log("⚖️ Running Module G Complaint & Dispute Verification");
  console.log("==================================================");

  await initializeDatabase();

  // Test 1: Verify Seeded Complaints & Actions
  assert(memoryStore.complaints.length >= 6, "Must have seeded complaints");
  assert(memoryStore.complaint_actions.length >= 3, "Must have seeded complaint actions");
  const comp1 = memoryStore.complaints[0];
  assert(comp1.complaint_number.startsWith("GRIEV-"), "Ticket number must start with GRIEV-");
  assert(comp1.customer_id, "Customer ID must exist");
  assert(comp1.reported_employee_id, "Reported employee ID must exist");
  console.log(`✓ Test 1 Passed: ${memoryStore.complaints.length} complaints and ${memoryStore.complaint_actions.length} audit actions loaded.`);

  // Test 2: Complaints Overview Telemetry
  const mockResOverview = createMockRes();
  await getComplaintsOverview({}, mockResOverview);
  assert.strictEqual(mockResOverview.statusCode, 200);
  assert(mockResOverview.body.data.total_complaints >= 6, "Total complaints count must match");
  assert(mockResOverview.body.data.open_complaints > 0, "Open complaints count must be > 0");
  assert(mockResOverview.body.data.avg_resolution_hours > 0, "Avg resolution hours must be computed");
  assert(mockResOverview.body.data.sla_compliance_rate_pct, "SLA compliance rate must exist");
  assert(Object.keys(mockResOverview.body.data.by_lender).length > 0, "Lender breakdown must exist");
  console.log("✓ Test 2 Passed: Overview telemetry verified:", {
    total: mockResOverview.body.data.total_complaints,
    open: mockResOverview.body.data.open_complaints,
    resolved: mockResOverview.body.data.resolved_complaints,
    avgHours: `${mockResOverview.body.data.avg_resolution_hours} hrs`,
    slaCompliance: `${mockResOverview.body.data.sla_compliance_rate_pct}%`
  });

  // Test 3: List Complaints with Filters & Rich Enrichment
  const mockResList = createMockRes();
  await listComplaints({
    query: { status: "ALL", page: 1, limit: 10 }
  }, mockResList);
  assert.strictEqual(mockResList.statusCode, 200);
  assert(mockResList.body.data.complaints.length > 0);
  const sampleComp = mockResList.body.data.complaints[0];
  assert(sampleComp.customer_details?.full_name, "Customer details must be enriched");
  assert(sampleComp.case_details?.case_number, "Case details must be enriched");
  assert(sampleComp.reported_employee_details?.full_name, "Reported employee must be enriched");
  console.log("✓ Test 3 Passed: Enriched complaint list verified:", {
    ticket: sampleComp.complaint_number,
    borrower: sampleComp.customer_details?.full_name,
    case: sampleComp.case_details?.case_number,
    reportedStaff: sampleComp.reported_employee_details?.full_name,
    status: sampleComp.status
  });

  // Test 4: Record a New Complaint
  const initialCompCount = memoryStore.complaints.length;
  const initialActionCount = memoryStore.complaint_actions.length;
  const mockResRecord = createMockRes();
  await recordComplaint({
    body: {
      customer_id: "cust_0007",
      case_id: "case_0007",
      reported_employee_id: "usr_caller_1",
      assigned_supervisor_id: "usr_supervisor",
      complaint_type: "Calling outside permissible hours",
      severity: "HIGH",
      description: "Borrower states caller rang them at 7:45 PM on Sunday in breach of RBI fair practice code.",
      lodged_channel: "PHONE_HELPLINE"
    },
    user: { id: "usr_admin", role: "ADMIN", fullName: "Bhushan Gaikwad" }
  }, mockResRecord);

  assert.strictEqual(mockResRecord.statusCode, 201);
  assert(mockResRecord.body.data.complaint.complaint_number.startsWith("GRIEV-"), "Generated complaint number required");
  assert.strictEqual(memoryStore.complaints.length, initialCompCount + 1, "Complaints count must increment");
  assert.strictEqual(memoryStore.complaint_actions.length, initialActionCount + 1, "Audit action log must increment");
  const createdComp = mockResRecord.body.data.complaint;
  console.log("✓ Test 4 Passed: Complaint recorded successfully:", {
    id: createdComp.id,
    ticket: createdComp.complaint_number,
    severity: createdComp.severity,
    slaDeadline: createdComp.sla_deadline
  });

  // Test 5: Open Customer's Complete 360° Calling History & Evidence Pack
  // Requirement:
  // 1. Open customer's complete calling history
  // 2. Listen to relevant recordings
  // 3. Check employee's notes
  // 4. Check previous interactions
  const mockResDossier = createMockRes();
  await getCustomerInvestigationDossier({
    params: { id: createdComp.id },
    user: { id: "usr_admin", role: "ADMIN" }
  }, mockResDossier);

  assert.strictEqual(mockResDossier.statusCode, 200);
  const dossier = mockResDossier.body.data;
  assert(dossier.borrower, "Borrower profile must be present");
  assert(dossier.case, "Case account must be present");
  assert(dossier.calling_history.length > 0, "Calling history must be retrieved for this borrower");
  assert(dossier.recordings.length > 0, "Audio recordings must be available for listening");
  assert(dossier.employee_notes.length > 0, "Employee raw notes must be aggregated");
  assert(dossier.status_transitions, "Case status history must be surfaced");
  console.log("✓ Test 5 Passed: Customer 360° Investigation Dossier verified:", {
    borrower: dossier.borrower?.full_name,
    totalCalls: dossier.summary_metrics?.total_calls,
    connectedCalls: dossier.summary_metrics?.connected_calls,
    recordingsCount: dossier.summary_metrics?.recordings_available,
    employeeNotesCount: dossier.employee_notes.length,
    statusTransitionsCount: dossier.status_transitions.length
  });

  // Test 6: Assign Complaint to Supervisor
  const targetCompId = createdComp.id;
  const mockResAssign = createMockRes();
  await assignComplaint({
    params: { id: targetCompId },
    body: {
      supervisor_id: "usr_supervisor",
      notes: "Assigned to Supervisor Aarav Mehta for immediate telephony recording inspection."
    },
    user: { id: "usr_admin", role: "ADMIN", fullName: "Bhushan Gaikwad" }
  }, mockResAssign);

  assert.strictEqual(mockResAssign.statusCode, 200);
  assert.strictEqual(mockResAssign.body.data.complaint.assigned_supervisor_details.id, "usr_supervisor");
  assert.strictEqual(mockResAssign.body.data.complaint.status, "Under Investigation");
  console.log("✓ Test 6 Passed: Complaint assigned to supervisor with audit trail logged.");

  // Test 7: Document Resolution and Corrective Action
  const mockResResolve = createMockRes();
  await resolveComplaint({
    params: { id: targetCompId },
    body: {
      status: "Resolved",
      resolution_category: "AGENT_CORRECTIVE_ACTION",
      resolution_notes: "Checked telephony logs. Confirmed automated dialer queued attempt at 6:58 PM which bridged at 7:01 PM. Agent failed to cancel dialer queue.",
      corrective_action: "Agent issued written counseling on fair practice cutoff. Dial queue hard-stop configured at 6:45 PM IST."
    },
    user: { id: "usr_supervisor", role: "SUPERVISOR", fullName: "Aarav Mehta" }
  }, mockResResolve);

  assert.strictEqual(mockResResolve.statusCode, 200);
  const resolved = mockResResolve.body.data.complaint;
  assert.strictEqual(resolved.status, "Resolved");
  assert.strictEqual(resolved.resolution_category, "AGENT_CORRECTIVE_ACTION");
  assert(resolved.resolution_notes.includes("Checked telephony logs"));
  assert(resolved.corrective_action.includes("written counseling"));
  assert(resolved.resolved_at, "Must have resolved_at timestamp");
  console.log("✓ Test 7 Passed: Resolution documented with formal findings & corrective action:", {
    status: resolved.status,
    category: resolved.resolution_category,
    resolvedAt: resolved.resolved_at
  });

  // Test 8: Get Complaint by ID with Chronological Audit Actions
  const mockResDetail = createMockRes();
  await getComplaintById({ params: { id: targetCompId } }, mockResDetail);
  assert.strictEqual(mockResDetail.statusCode, 200);
  assert(mockResDetail.body.data.actions.length >= 3, "Must have at least 3 audit actions (Created, Assigned, Resolved)");
  assert(mockResDetail.body.data.actions.some(a => a.action_type === "CREATED"));
  assert(mockResDetail.body.data.actions.some(a => a.action_type === "ASSIGNED_SUPERVISOR"));
  assert(mockResDetail.body.data.actions.some(a => a.action_type === "RESOLVED"));
  console.log(`✓ Test 8 Passed: Complete audit trail verified (${mockResDetail.body.data.actions.length} chronological actions).`);

  console.log("==================================================");
  console.log("🎉 ALL MODULE G COMPLAINT TESTS PASSED (8/8)");
  console.log("==================================================");
}

runModuleGVerification().catch(err => {
  console.error("❌ Module G verification failed:", err);
  process.exit(1);
});

