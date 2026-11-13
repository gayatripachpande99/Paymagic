import { initializeDatabase, memoryStore } from "../config/db.js";
import {
  getFieldOverview,
  listFieldVisits,
  scheduleFieldVisit,
  getMyRoute,
  checkInFieldVisit,
  completeFieldVisit,
  getDigitalReceipt,
  submitCashHandover,
  listCashHandovers,
  reconcileCashHandover,
  getFieldRadar
} from "../controllers/fieldRecoveryController.js";

const runModuleEVerification = async () => {
  console.log("==================================================================");
  console.log("🧪 Running PayMagic Module E — Field Recovery Verification Suite");
  console.log("   (Route Planning, Check-in, GPS Audit, Spot Recovery, Receipts)");
  console.log("==================================================================");

  await initializeDatabase();

  const mockAdminUser = {
    id: "usr_admin",
    employee_id: "PM-ADM-0001",
    fullName: "Bhushan Gaikwad",
    role: "ADMIN"
  };

  const mockFieldAgent = {
    id: "usr_field_1",
    employee_id: "PM-FLD-0001",
    fullName: "Vikram Singh",
    role: "FIELD_AGENT",
    location_zone: "Pune Metro"
  };

  const mockSupervisor = {
    id: "usr_supervisor",
    employee_id: "PM-SUP-0001",
    fullName: "Aarav Mehta",
    role: "SUPERVISOR"
  };

  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      }
    };
    return res;
  };

  // ── [Test 1] Field Recovery Overview & KPIs ──
  console.log("\n[Test 1] Testing Field Operations Overview & KPIs...");
  {
    const req = { user: mockAdminUser, query: {} };
    const res = createMockRes();
    await getFieldOverview(req, res);

    if (res.statusCode !== 200 || !res.jsonData?.success) {
      throw new Error(`getFieldOverview failed: ${JSON.stringify(res.jsonData)}`);
    }

    const d = res.jsonData.data;
    if (typeof d.total_visits !== "number" || typeof d.contact_rate_percentage !== "number") {
      throw new Error("Invalid overview KPI structure.");
    }

    console.log(`  ✓ Total Field Visits: ${d.total_visits}`);
    console.log(`  ✓ Contact Rate: ${d.contact_rate_percentage}%`);
    console.log(`  ✓ Total Spot Collections: ₹${d.total_spot_collections.toLocaleString('en-IN')}`);
    console.log(`  ✓ Cash In Hand: ₹${d.cash_in_hand_total.toLocaleString('en-IN')}`);
    console.log(`  ✓ RBI Compliance Enforced: ${d.rbi_compliance.hours_enforced}`);
  }

  // ── [Test 2] Schedule Field Recovery Visit & ACID Audit ──
  console.log("\n[Test 2] Testing Field Visit Scheduling & Status History Audit...");
  let scheduledVisitId = null;
  const testCase = memoryStore.loan_cases.find(c => c.status !== "Closed");
  {
    const req = {
      user: mockSupervisor,
      body: {
        case_id: testCase.id,
        field_agent_id: mockFieldAgent.id,
        scheduled_date: new Date().toISOString(),
        time_slot: "02:00 - 05:00 PM",
        priority: "URGENT",
        visit_instructions: "Urgent physical visit for demand notice handover & spot collection.",
        geographic_zone: "Pune Metro"
      }
    };
    const res = createMockRes();
    await scheduleFieldVisit(req, res);

    if (res.statusCode !== 201 || !res.jsonData?.success) {
      throw new Error(`scheduleFieldVisit failed: ${JSON.stringify(res.jsonData)}`);
    }

    scheduledVisitId = res.jsonData.visit.id;
    console.log(`  ✓ Scheduled Visit Created: ${scheduledVisitId} for Case: ${testCase.loan_account_no}`);

    // Verify ACID status history record
    const latestAudit = memoryStore.case_status_history[0];
    if (latestAudit.case_id !== testCase.id || latestAudit.new_status !== "Field Visit") {
      throw new Error("ACID case_status_history was not recorded on visit scheduling!");
    }
    console.log(`  ✓ ACID Audit Trail Verified: Transition to 'Field Visit' logged by ${mockSupervisor.fullName}`);
  }

  // ── [Test 3] Daily Itinerary / Route for Field Agent ──
  console.log("\n[Test 3] Testing Field Agent Route Run-Sheet...");
  {
    const req = { user: mockFieldAgent };
    const res = createMockRes();
    await getMyRoute(req, res);

    if (res.statusCode !== 200 || !res.jsonData?.success) {
      throw new Error(`getMyRoute failed: ${JSON.stringify(res.jsonData)}`);
    }

    const { route, agent } = res.jsonData;
    if (!route.stops || route.stops.length === 0) {
      throw new Error("No stops found in field agent route.");
    }

    console.log(`  ✓ Agent: ${agent.name} (${agent.employee_id}) — Zone: ${agent.zone}`);
    console.log(`  ✓ Route Stops: ${route.total_stops} stop(s)`);
    console.log(`  ✓ Stop 1: ${route.stops[0].customer_name} — Priority: ${route.stops[0].priority}`);
    console.log(`  ✓ Map Directions URL: ${route.stops[0].google_maps_directions_url.slice(0, 60)}...`);
  }

  // ── [Test 4] On-Site Check-In with Verified GPS Coordinates ──
  console.log("\n[Test 4] Testing On-Site Check-In & Statutory Compliance...");
  {
    const req = {
      user: mockFieldAgent,
      params: { id: scheduledVisitId },
      body: {
        gps_latitude: 18.5204,
        gps_longitude: 73.8567,
        gps_accuracy: 5.5,
        gps_consent_acknowledged: true,
        id_displayed: true,
        fair_practice_notice_read: true
      }
    };
    const res = createMockRes();
    await checkInFieldVisit(req, res);

    if (res.statusCode !== 200 || !res.jsonData?.success) {
      throw new Error(`checkInFieldVisit failed: ${JSON.stringify(res.jsonData)}`);
    }

    console.log(`  ✓ Checked-in at: ${res.jsonData.visit.visit_start}`);
    console.log(`  ✓ GPS Coordinates: (18.5204° N, 73.8567° E, Acc: ±5.5m)`);
    console.log(`  ✓ RBI Visiting Hours Permissible: ${res.jsonData.rbi_notice.within_permissible_hours}`);
  }

  // ── [Test 5] Complete Visit, Spot Collection & Digital Receipt ──
  console.log("\n[Test 5] Testing Visit Completion, Dynamic Spot Recovery & Digital Receipt...");
  let generatedReceiptRef = null;
  const initialOutstanding = testCase.outstanding_amount;
  const spotPaymentAmount = 10000;
  {
    const req = {
      user: mockFieldAgent,
      params: { id: scheduledVisitId },
      body: {
        visit_outcome: "Customer Met & Paid",
        visit_notes: "Borrower met in person. Scanned PayMagic Dynamic UPI QR code and paid ₹10,000 on spot.",
        notice_served: true,
        collected_amount: spotPaymentAmount,
        payment_mode: "UPI_QR",
        gps_latitude: 18.5206,
        gps_longitude: 73.8569,
        gps_accuracy: 4.8
      }
    };
    const res = createMockRes();
    await completeFieldVisit(req, res);

    if (res.statusCode !== 200 || !res.jsonData?.success) {
      throw new Error(`completeFieldVisit failed: ${JSON.stringify(res.jsonData)}`);
    }

    generatedReceiptRef = res.jsonData.receipt_ref;
    console.log(`  ✓ Visit Concluded: Outcome '${res.jsonData.visit.visit_outcome}'`);
    console.log(`  ✓ Spot Payment Collected: ₹${spotPaymentAmount.toLocaleString('en-IN')} (UPI QR)`);
    console.log(`  ✓ Digital Receipt Issued: ${generatedReceiptRef}`);
    console.log(`  ✓ New Balance Reconciled: ₹${testCase.outstanding_amount.toLocaleString('en-IN')} (Was ₹${initialOutstanding.toLocaleString('en-IN')})`);

    // Verify payment in memoryStore
    const payment = memoryStore.payments.find(p => p.receipt_number === generatedReceiptRef);
    if (!payment) {
      throw new Error("Payment record not found in payment ledger!");
    }
    console.log(`  ✓ Payment Ledger Verified: Transaction Ref ${payment.transaction_ref}`);
  }

  // ── [Test 6] Fetch Complete Digital Receipt Payload ──
  console.log("\n[Test 6] Testing Digital Receipt Payload & Audit Seal...");
  {
    const req = { params: { receiptNumber: generatedReceiptRef } };
    const res = createMockRes();
    await getDigitalReceipt(req, res);

    if (res.statusCode !== 200 || !res.jsonData?.success) {
      throw new Error(`getDigitalReceipt failed: ${JSON.stringify(res.jsonData)}`);
    }

    const { receipt } = res.jsonData;
    if (receipt.payment.amount !== spotPaymentAmount) {
      throw new Error("Receipt amount does not match collected amount.");
    }

    console.log(`  ✓ Receipt #: ${receipt.receipt_number}`);
    console.log(`  ✓ Borrower: ${receipt.customer.name} (Acc: ${receipt.customer.loan_account_no})`);
    console.log(`  ✓ Amount in Words: "${receipt.payment.amount_in_words}"`);
    console.log(`  ✓ Agent: ${receipt.agent.name} (${receipt.agent.employee_id})`);
    console.log(`  ✓ Security Verification Hash: ${receipt.audit.verification_hash}`);
  }

  // ── [Test 7] Cash Handover Submission & Supervisor Reconciliation ──
  console.log("\n[Test 7] Testing Daily Cash Handover & Supervisor Reconciliation...");
  let handoverId = null;
  {
    const req = {
      user: mockFieldAgent,
      body: {
        amount: 8500,
        branch_name: "Pune FC Road Branch",
        deposit_slip_ref: "SLIP-ICICI-88219",
        notes: "End of day cash collection settlement."
      }
    };
    const res = createMockRes();
    await submitCashHandover(req, res);

    if (res.statusCode !== 201 || !res.jsonData?.success) {
      throw new Error(`submitCashHandover failed: ${JSON.stringify(res.jsonData)}`);
    }

    handoverId = res.jsonData.handover.id;
    console.log(`  ✓ Cash Handover Submitted: ${res.jsonData.handover.handover_ref} (₹8,500, Status: PENDING_RECONCILIATION)`);

    // Supervisor Reconciles Handover
    const recReq = {
      user: mockSupervisor,
      params: { id: handoverId },
      body: {
        status: "RECONCILED",
        remarks: "Cash currency denominations verified against bank deposit slip."
      }
    };
    const recRes = createMockRes();
    await reconcileCashHandover(recReq, recRes);

    if (recRes.statusCode !== 200 || !recRes.jsonData?.success) {
      throw new Error(`reconcileCashHandover failed: ${JSON.stringify(recRes.jsonData)}`);
    }

    console.log(`  ✓ Supervisor Reconciliation Verified: Marked as '${recRes.jsonData.handover.status}' by ${recRes.jsonData.handover.reconciled_by}`);
  }

  // ── [Test 8] Field Radar and Map Geolocation Data ──
  console.log("\n[Test 8] Testing Field Radar Map Feeds...");
  {
    const req = { user: mockAdminUser };
    const res = createMockRes();
    await getFieldRadar(req, res);

    if (res.statusCode !== 200 || !res.jsonData?.success) {
      throw new Error(`getFieldRadar failed: ${JSON.stringify(res.jsonData)}`);
    }

    const { radar } = res.jsonData;
    console.log(`  ✓ Field Agent Pins: ${radar.agent_pins.length} active agent(s)`);
    console.log(`  ✓ Field Visit Pins: ${radar.visit_pins.length} visit location(s)`);
    console.log(`  ✓ Map Center: (${radar.center.latitude}° N, ${radar.center.longitude}° E, Zoom: ${radar.center.zoom})`);
  }

  console.log("\n==================================================================");
  console.log("🎉 ALL MODULE E (FIELD RECOVERY MANAGEMENT) TESTS PASSED!");
  console.log("==================================================================");
};

runModuleEVerification().catch((err) => {
  console.error("❌ MODULE E TEST FAILED:", err);
  process.exit(1);
});
