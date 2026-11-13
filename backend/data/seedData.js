import bcrypt from "bcryptjs";

export const createSeedData = async () => {
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const employeePasswordHash = await bcrypt.hash("Emp@123", 10);

  const roles = [
    { id: "SUPER_ADMIN", name: "Super Administrator", description: "Full system root authority" },
    { id: "ADMIN", name: "Operations Administrator", description: "Portfolio, case management & reports" },
    { id: "SUPERVISOR", name: "Team Supervisor", description: "Team monitoring, approvals & escalations" },
    { id: "CALLER", name: "Telecaller Executive", description: "Customer calling & telephone recovery" },
    { id: "FIELD_AGENT", name: "Ground Field Agent", description: "Physical visits & on-site cash/digital recovery" }
  ];

  const users = [
    {
      id: "usr_super_admin",
      employee_id: "PM-SADM-0001",
      email: "superadmin@paymagic.in",
      password_hash: adminPasswordHash,
      full_name: "Onkar Holkar",
      phone: "+91 9900112233",
      role: "SUPER_ADMIN",
      department: "Executive Management",
      designation: "Chief Operating Officer",
      is_active: true
    },
    {
      id: "usr_admin",
      employee_id: "PM-ADM-0001",
      email: "admin@paymagic.in",
      password_hash: adminPasswordHash,
      full_name: "Bhushan Gaikwad",
      phone: "+91 9900112244",
      role: "ADMIN",
      department: "Operations Leadership",
      designation: "Head of Case Allocation",
      is_active: true
    },
    {
      id: "usr_supervisor",
      employee_id: "PM-SUP-0001",
      email: "supervisor@paymagic.in",
      password_hash: employeePasswordHash,
      full_name: "Aarav Mehta",
      phone: "+91 9876543210",
      role: "SUPERVISOR",
      department: "Recovery Operations",
      designation: "Team Lead & Quality Supervisor",
      is_active: true
    },
    {
      id: "usr_caller_1",
      employee_id: "PM-CAL-0001",
      email: "caller@paymagic.in",
      password_hash: employeePasswordHash,
      full_name: "Rahul Sharma",
      phone: "+91 9876543211",
      role: "CALLER",
      department: "Voice Recovery",
      designation: "Senior Telecalling Officer",
      is_active: true
    },
    {
      id: "usr_caller_2",
      employee_id: "PM-CAL-0002",
      email: "priya.patel@paymagic.in",
      password_hash: employeePasswordHash,
      full_name: "Priya Patel",
      phone: "+91 9876543212",
      role: "CALLER",
      department: "Voice Recovery",
      designation: "Recovery Associate",
      is_active: true
    },
    {
      id: "usr_field_1",
      employee_id: "PM-FLD-0001",
      email: "field@paymagic.in",
      password_hash: employeePasswordHash,
      full_name: "Vikram Singh",
      phone: "+91 9876543213",
      role: "FIELD_AGENT",
      department: "Ground Recovery",
      designation: "Field Enforcement Specialist",
      is_active: true
    }
  ];

  const employees = [
    {
      id: "usr_super_admin",
      employee_id: "PM-SADM-0001",
      assigned_target: 5000000.00,
      current_recovery: 4250000.00,
      max_workload_capacity: 500,
      active_cases_count: 0,
      shift_status: "ON_SHIFT",
      telephony_agent_id: "TEL-SADM-1",
      location_zone: "National HQ"
    },
    {
      id: "usr_admin",
      employee_id: "PM-ADM-0001",
      assigned_target: 2500000.00,
      current_recovery: 1980000.00,
      max_workload_capacity: 400,
      active_cases_count: 0,
      shift_status: "ON_SHIFT",
      telephony_agent_id: "TEL-ADM-1",
      location_zone: "Western Command"
    },
    {
      id: "usr_supervisor",
      employee_id: "PM-SUP-0001",
      assigned_target: 1000000.00,
      current_recovery: 812000.00,
      max_workload_capacity: 250,
      active_cases_count: 10,
      shift_status: "ON_SHIFT",
      telephony_agent_id: "TEL-SUP-1",
      location_zone: "Pune Metro"
    },
    {
      id: "usr_caller_1",
      employee_id: "PM-CAL-0001",
      assigned_target: 100000.00,
      current_recovery: 85000.00,
      max_workload_capacity: 150,
      active_cases_count: 42,
      shift_status: "ON_SHIFT",
      telephony_agent_id: "TEL-CAL-101",
      location_zone: "Pune East"
    },
    {
      id: "usr_caller_2",
      employee_id: "PM-CAL-0002",
      assigned_target: 120000.00,
      current_recovery: 64000.00,
      max_workload_capacity: 150,
      active_cases_count: 38,
      shift_status: "ON_SHIFT",
      telephony_agent_id: "TEL-CAL-102",
      location_zone: "Pune West"
    },
    {
      id: "usr_field_1",
      employee_id: "PM-FLD-0001",
      assigned_target: 200000.00,
      current_recovery: 142000.00,
      max_workload_capacity: 60,
      active_cases_count: 18,
      shift_status: "ON_SHIFT",
      telephony_agent_id: "TEL-FLD-201",
      location_zone: "Mumbai Suburbs"
    }
  ];

  // Generate 200 realistic customers and loan recovery cases
  const lenders = ["Bajaj Finance", "HDFC Bank", "ICICI Bank", "Tata Capital", "Axis Bank", "Kotak Mahindra"];
  const loanTypes = ["Personal Loan", "Credit Card", "Auto Loan", "Business Loan", "Consumer Durable"];
  const cities = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Thane"];
  const statuses = [
    "New",
    "Assigned",
    "Contacted",
    "Promise to Pay",
    "Partially Paid",
    "Fully Paid",
    "Disputed",
    "Not Reachable",
    "Field Visit",
    "Closed"
  ];

  const firstNames = ["Amit", "Rohit", "Sneha", "Kavita", "Sachin", "Deepak", "Anjali", "Suresh", "Pooja", "Manoj", "Kiran", "Gaurav", "Nisha", "Sunil", "Rajesh", "Prakash", "Anita", "Vinay", "Meera", "Santosh"];
  const lastNames = ["Deshmukh", "Kulkarni", "Patil", "Jadhav", "More", "Shinde", "Pawar", "Bhosale", "Chavan", "Gaekwad", "Kadam", "Sawant", "Gokhale", "Thorat", "Salunkhe", "Wagh", "Kamble", "Tambe", "Gupte", "Bapat"];

  const customers = [];
  const loanCases = [];
  const caseStatusHistory = [];
  const calls = [];
  const callRecordings = [];
  const payments = [];

  for (let i = 1; i <= 200; i++) {
    const custId = `cust_${String(i).padStart(4, "0")}`;
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const city = cities[i % cities.length];
    const rawPhone = `+91 9${String(800000000 + i * 371).slice(0, 9)}`;
    const maskedPhone = `${rawPhone.slice(0, 7)}****${rawPhone.slice(-2)}`;

    customers.push({
      id: custId,
      customer_code: `CUST-IN-${String(1000 + i)}`,
      full_name: fullName,
      phone_masked: maskedPhone,
      phone_raw: rawPhone,
      alternate_phone: `+91 9${String(700000000 + i * 193).slice(0, 9)}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@borrowermail.com`,
      current_address: `Flat #${101 + (i % 80)}, Greenfield Heights, Sector ${(i % 18) + 1}`,
      city,
      state: "Maharashtra",
      pincode: `4110${String((i % 50) + 10).padStart(2, "0")}`,
      credit_score: 550 + (i % 230)
    });

    const status = statuses[i % statuses.length];
    const principal = Math.round((25000 + (i * 2450)) / 100) * 100;
    const recovered = status === "Fully Paid" ? principal : status === "Partially Paid" ? Math.round(principal * 0.4) : (status === "Promise to Pay" && i % 3 === 0 ? 5000 : 0);
    const outstanding = Math.max(0, principal - recovered);

    let assignedEmp = null;
    if (status !== "New") {
      if (status === "Field Visit") {
        assignedEmp = "usr_field_1";
      } else if (i % 2 === 0) {
        assignedEmp = "usr_caller_1";
      } else {
        assignedEmp = "usr_caller_2";
      }
    }

    const caseId = `case_${String(i).padStart(4, "0")}`;
    const caseNumber = `PM-LN-2026-${String(10000 + i)}`;

    loanCases.push({
      id: caseId,
      case_number: caseNumber,
      customer_id: custId,
      lender_name: lenders[i % lenders.length],
      loan_account_no: `LON-${lenders[i % lenders.length].slice(0, 3).toUpperCase()}-${String(8820000 + i)}`,
      loan_type: loanTypes[i % loanTypes.length],
      principal_amount: principal,
      outstanding_amount: outstanding,
      total_recovered_amount: recovered,
      dpd: 30 + (i % 150),
      priority: outstanding > 120000 ? "CRITICAL" : outstanding > 60000 ? "HIGH" : outstanding > 30000 ? "MEDIUM" : "LOW",
      status,
      assigned_employee_id: assignedEmp,
      assigned_at: assignedEmp ? new Date(Date.now() - (i % 15) * 86400000).toISOString() : null,
      follow_up_date: new Date(Date.now() + ((i % 5) - 2) * 86400000).toISOString().split("T")[0],
      is_field_visit_required: status === "Field Visit",
      created_at: new Date(Date.now() - (30 + (i % 30)) * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    });

    // Seed Initial status history for each case
    caseStatusHistory.push({
      id: `csh_${caseId}_init`,
      case_id: caseId,
      employee_id: "usr_admin",
      previous_status: "SYSTEM_INTAKE",
      new_status: "New",
      remarks: "Batch uploaded and initial risk assessment processed.",
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    });

    if (status !== "New") {
      caseStatusHistory.push({
        id: `csh_${caseId}_status`,
        case_id: caseId,
        employee_id: assignedEmp || "usr_admin",
        previous_status: "New",
        new_status: status,
        remarks: `Customer interaction outcome recorded: ${status}.`,
        created_at: new Date(Date.now() - (i % 7) * 86400000).toISOString()
      });
    }

    // Seed call records for diverse cases (Outbound & Inbound, answered/busy/unanswered/voicemail)
    const campaignsList = ["May Outreach", "Customer Support", "Follow Up", "Product Demo", "Sales Support", "Check-in Calls", "Bajaj Auto Loan", "HDFC Recovery"];
    const callerPool = ["usr_caller_1", "usr_caller_2", "usr_supervisor", "usr_admin", "usr_field_1"];

    if (i <= 60 || ["Contacted", "Promise to Pay", "Partially Paid", "Disputed", "Not Reachable"].includes(status)) {
      const callId = `call_${caseId}`;
      const isOutbound = (i % 4) !== 2; // ~75% outbound, 25% inbound
      const direction = isOutbound ? "OUTBOUND" : "INBOUND";
      const campaignName = campaignsList[i % campaignsList.length];
      const callerId = assignedEmp || callerPool[i % callerPool.length];

      // Realistic call statuses
      let callStatus = "answered";
      let callDuration = 0;
      let callOutcome = "Completed";
      let callDisposition = "Completed";

      const complaintCaseIds = ["case_0007", "case_0017", "case_0009", "case_0003", "case_0012", "case_0025"];

      if (!complaintCaseIds.includes(caseId) && (status === "Not Reachable" || (i % 7 === 3))) {
        callStatus = "unanswered";
        callDuration = 0;
        callOutcome = "No Answer";
        callDisposition = "No Answer";
      } else if (!complaintCaseIds.includes(caseId) && (i % 9 === 4)) {
        callStatus = "busy";
        callDuration = 0;
        callOutcome = "Busy";
        callDisposition = "Busy";
      } else if (!complaintCaseIds.includes(caseId) && (i % 11 === 5)) {
        callStatus = "voicemail";
        callDuration = 16;
        callOutcome = "Voicemail";
        callDisposition = "Voicemail";
      } else if (!complaintCaseIds.includes(caseId) && (i % 13 === 6)) {
        callStatus = "rejected";
        callDuration = 8;
        callOutcome = "Abandoned";
        callDisposition = "Abandoned";
      } else {
        // Answered durations matching reference screenshot
        const sampleDurations = [342, 201, 438, 723, 291, 167, 185, 310, 480, 245];
        callDuration = sampleDurations[i % sampleDurations.length];
        callStatus = "answered";
        if (status === "Promise to Pay" || i % 5 === 0) {
          callOutcome = "Promise to Pay";
          callDisposition = "Promise to Pay";
        } else if (status === "Disputed" || i % 8 === 0) {
          callOutcome = "Customer Disputed Dues";
          callDisposition = "Disputed";
        } else if (i % 3 === 0) {
          callOutcome = "Interested in Restructuring";
          callDisposition = "Interested";
        } else {
          callOutcome = "Contacted - Settlement Discussed";
          callDisposition = isOutbound ? "Completed" : "Answered";
        }
      }

      // Stagger dates over last 7 days
      const daysAgo = (i % 6);
      const hoursAgo = (i * 3) % 10 + 1;
      const startedAt = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();
      const endedAt = new Date(new Date(startedAt).getTime() + callDuration * 1000).toISOString();

      calls.push({
        id: callId,
        case_id: caseId,
        employee_id: callerId,
        customer_id: custId,
        telephony_call_id: `TEL-SIM-${100000 + i}`,
        direction,
        status: callStatus,
        campaign: campaignName,
        disposition: callDisposition,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: callDuration,
        customer_notification_status: "ANNOUNCED_RECORDED",
        call_outcome: callOutcome,
        call_notes: `Standard recovery protocol applied. Customer identity verified via OTP and repayment timeline discussed for case ${caseNumber}. Notice announced and recorded.`,
        next_follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString()
      });

      if (callDuration > 0 && (callStatus === "answered" || callStatus === "voicemail")) {
        const isLegalHold = status === "Disputed" || i % 17 === 0;
        const linkedCompId = caseId === "case_0007" ? "comp_001" : (caseId === "case_0017" ? "comp_002" : null);
        const linkedCompNum = caseId === "case_0007" ? "GRIEV-2026-0012" : (caseId === "case_0017" ? "GRIEV-2026-0015" : null);

        callRecordings.push({
          id: `rec_${callId}`,
          call_id: callId,
          s3_bucket: "paymagic-telephony-recordings-secure",
          s3_key: `recordings/2026/11/${callId}.mp3`,
          recording_url: `https://paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com/recordings/2026/11/${callId}.mp3`,
          duration_seconds: callDuration,
          file_size_bytes: callDuration * 16000,
          mime_type: "audio/mp3",
          checksum_sha256: `a4f89d${(i * 123456789).toString(16).padStart(12, "0")}e1c944883492ffda01c`.padEnd(64, "7"),
          encryption_type: "aws:kms:sse",
          kms_key_arn: "arn:aws:kms:ap-south-1:123456789012:key/paymagic-voice-rec-vault-kms",
          customer_notification_status: "ANNOUNCED_RECORDED",
          customer_notification_timestamp: startedAt,
          processing_status: isLegalHold ? "LEGAL_HOLD" : "READY",
          is_legal_hold: isLegalHold,
          legal_hold_reason: isLegalHold ? "Borrower formal dispute regarding interest calculation; evidence locked for Ombudsman adjudication." : null,
          legal_hold_reference: isLegalHold ? `OMBUDS-2026-${1000 + i}` : null,
          legal_hold_by_id: isLegalHold ? "usr_supervisor" : null,
          legal_hold_applied_at: isLegalHold ? startedAt : null,
          linked_complaint_id: linkedCompId,
          linked_complaint_number: linkedCompNum,
          retention_until: new Date(Date.now() + 365 * 86400000).toISOString(),
          created_at: startedAt
        });
      }
    }

    // Seed payments for partially and fully paid
    if (recovered > 0) {
      payments.push({
        id: `pay_${caseId}`,
        case_id: caseId,
        customer_id: custId,
        collected_by_id: assignedEmp || "usr_caller_1",
        amount: recovered,
        payment_mode: i % 2 === 0 ? "UPI" : "NetBanking",
        transaction_ref: `TXN-PM-${20260000 + i}`,
        receipt_number: `RCP-PAY-${String(10000 + i)}`,
        reconciliation_status: "RECONCILED",
        payment_date: new Date(Date.now() - (i % 5) * 86400000).toISOString(),
        notes: `Digital payment settlement confirmed for loan account LON-${lenders[i % lenders.length].slice(0, 3).toUpperCase()}-${String(8820000 + i)}.`
      });
    }
  }

  // Seed sample complaints (Module G - Complaint & Dispute Management)
  const complaints = [
    {
      id: "comp_001",
      complaint_number: "GRIEV-2026-0012",
      customer_id: "cust_0007",
      case_id: "case_0007",
      reported_employee_id: "usr_caller_1",
      assigned_supervisor_id: "usr_supervisor",
      lodged_by_id: "usr_admin",
      lodged_channel: "PHONE_HELPLINE",
      complaint_type: "Calling outside permissible hours",
      severity: "HIGH",
      description: "Borrower states they received an outreach call at 7:30 PM outside official RBI fair practice calling hours (08:00 - 19:00 IST).",
      status: "Under Investigation",
      resolution_category: null,
      resolution_notes: "Checked telephony logs; initial dial was placed at 6:52 PM IST. Supervisor investigating if call wrapped up beyond 7:00 PM cutoff.",
      corrective_action: "Agent advised on wrapping up calls 15 mins prior to evening curfew. Legal hold placed on recording.",
      sla_deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      resolved_at: null,
      resolved_by: null,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: "comp_002",
      complaint_number: "GRIEV-2026-0015",
      customer_id: "cust_0017",
      case_id: "case_0017",
      reported_employee_id: "usr_caller_2",
      assigned_supervisor_id: "usr_supervisor",
      lodged_by_id: "usr_admin",
      lodged_channel: "EMAIL",
      complaint_type: "Disputed statement balance / Missing payment credit",
      severity: "MEDIUM",
      description: "Customer claims an installment of ₹12,000 paid through net banking last week is not credited to their statement balance.",
      status: "Open",
      resolution_category: null,
      resolution_notes: null,
      corrective_action: null,
      sla_deadline: new Date(Date.now() + 36 * 3600000).toISOString(),
      resolved_at: null,
      resolved_by: null,
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: "comp_003",
      complaint_number: "GRIEV-2026-0018",
      customer_id: "cust_0009",
      case_id: "case_0009",
      reported_employee_id: "usr_field_1",
      assigned_supervisor_id: "usr_supervisor",
      lodged_by_id: "usr_admin",
      lodged_channel: "WHATSAPP",
      complaint_type: "Rude / Aggressive tone or harassment",
      severity: "HIGH",
      description: "Borrower alleges that field recovery agent spoke in an inappropriate and aggressive tone during home visit.",
      status: "Supervisor Review",
      resolution_category: null,
      resolution_notes: "Supervisor reviewed GPS logs and on-site digital receipt timestamp. Reviewing agent visit notes and conducting follow-up call with borrower.",
      corrective_action: null,
      sla_deadline: new Date(Date.now() + 18 * 3600000).toISOString(),
      resolved_at: null,
      resolved_by: null,
      created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: "comp_004",
      complaint_number: "GRIEV-2026-0008",
      customer_id: "cust_0003",
      case_id: "case_0003",
      reported_employee_id: "usr_caller_1",
      assigned_supervisor_id: "usr_supervisor",
      lodged_by_id: "usr_admin",
      lodged_channel: "PHONE_HELPLINE",
      complaint_type: "Frequent / Excessive calling",
      severity: "CRITICAL",
      description: "Customer reported receiving 6 calls in a single day across morning and afternoon, causing distress at their workplace.",
      status: "Resolved",
      resolution_category: "AGENT_CORRECTIVE_ACTION",
      resolution_notes: "Telephony logs audited. Verified automated dialer repeated attempt after dropped lines. Max dialer limit throttled to 3 attempts/day. Agent advised on manual dialing rules.",
      corrective_action: "Dialer throttling cap enforced in config. Agent attended Fair Practice refresher and issued verbal warning.",
      sla_deadline: new Date(Date.now() - 48 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 20 * 3600000).toISOString(),
      resolved_by: "usr_supervisor",
      created_at: new Date(Date.now() - 68 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 3600000).toISOString()
    },
    {
      id: "comp_005",
      complaint_number: "GRIEV-2026-0004",
      customer_id: "cust_0012",
      case_id: "case_0012",
      reported_employee_id: "usr_caller_2",
      assigned_supervisor_id: "usr_admin",
      lodged_by_id: "usr_admin",
      lodged_channel: "OMBUDSMAN",
      complaint_type: "Unauthorized contact to third parties / relatives",
      severity: "CRITICAL",
      description: "Borrower alleges that recovery agent contacted their workplace colleague without authorization.",
      status: "Resolved",
      resolution_category: "UNSUBSTANTIATED",
      resolution_notes: "Audited call recordings and dialed phone numbers. Outbound calls were made strictly to the primary and verified reference number supplied by borrower on loan application. Audio evidence presented to Ombudsman.",
      corrective_action: "Complete telephony log and audio evidence dossier packaged and submitted to Lending Partner and Ombudsman. Case cleared.",
      sla_deadline: new Date(Date.now() - 72 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      resolved_by: "usr_admin",
      created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 48 * 3600000).toISOString()
    },
    {
      id: "comp_006",
      complaint_number: "GRIEV-2026-0022",
      customer_id: "cust_0025",
      case_id: "case_0025",
      reported_employee_id: "usr_field_1",
      assigned_supervisor_id: "usr_supervisor",
      lodged_by_id: "usr_admin",
      lodged_channel: "DIRECT_CALL",
      complaint_type: "Refusal to provide official receipt",
      severity: "MEDIUM",
      description: "Borrower paid partial settlement of ₹8,500 in cash but claimed digital receipt SMS did not arrive immediately.",
      status: "Open",
      resolution_category: null,
      resolution_notes: null,
      corrective_action: null,
      sla_deadline: new Date(Date.now() + 40 * 3600000).toISOString(),
      resolved_at: null,
      resolved_by: null,
      created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600000).toISOString()
    }
  ];

  // Seed Complaint Actions Audit Ledger
  const complaintActions = [
    {
      id: "cact_001",
      complaint_id: "comp_001",
      performed_by: "usr_admin",
      performed_by_name: "Bhushan Gaikwad",
      performed_by_role: "ADMIN",
      action_type: "CREATED",
      previous_status: null,
      new_status: "Open",
      notes: "Complaint received via borrower customer support helpline. Recorded in grievance registry.",
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    {
      id: "cact_002",
      complaint_id: "comp_001",
      performed_by: "usr_admin",
      performed_by_name: "Bhushan Gaikwad",
      performed_by_role: "ADMIN",
      action_type: "ASSIGNED_SUPERVISOR",
      previous_status: "Open",
      new_status: "Under Investigation",
      notes: "Assigned to Supervisor Aarav Mehta for immediate investigation and call audio review.",
      timestamp: new Date(Date.now() - 20 * 3600000).toISOString()
    },
    {
      id: "cact_003",
      complaint_id: "comp_004",
      performed_by: "usr_supervisor",
      performed_by_name: "Aarav Mehta",
      performed_by_role: "SUPERVISOR",
      action_type: "RESOLVED",
      previous_status: "Under Investigation",
      new_status: "Resolved",
      notes: "Telephony logs audited. Dialing throttling enforced. Agent counseled on fair practice guidelines.",
      timestamp: new Date(Date.now() - 20 * 3600000).toISOString()
    }
  ];

  // Seed attendance for today
  const todayStr = new Date().toISOString().split("T")[0];
  const attendance = [
    {
      id: "att_001",
      employee_id: "usr_caller_1",
      attendance_date: todayStr,
      check_in: new Date(Date.now() - 5 * 3600000).toISOString(),
      check_out: null,
      work_minutes: 300,
      status: "PRESENT"
    },
    {
      id: "att_002",
      employee_id: "usr_caller_2",
      attendance_date: todayStr,
      check_in: new Date(Date.now() - 5.5 * 3600000).toISOString(),
      check_out: null,
      work_minutes: 330,
      status: "PRESENT"
    },
    {
      id: "att_003",
      employee_id: "usr_field_1",
      attendance_date: todayStr,
      check_in: new Date(Date.now() - 4 * 3600000).toISOString(),
      check_out: null,
      work_minutes: 240,
      status: "PRESENT"
    }
  ];

  // Seed field visits (Module E - Field Recovery Management)
  const todayIso = new Date().toISOString().split("T")[0];
  const fieldVisits = [
    {
      id: "fv_001",
      case_id: "case_0009",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0009",
      scheduled_date: `${todayIso}T10:00:00.000Z`,
      time_slot: "08:00 - 11:00 AM",
      priority: "HIGH",
      geographic_zone: "Pune Metro",
      visit_start: new Date(Date.now() - 3 * 3600000).toISOString(),
      visit_end: new Date(Date.now() - 2 * 3600000).toISOString(),
      duration_minutes: 42,
      visit_outcome: "Customer Met & Paid",
      visit_notes: "Visited borrower residence. Borrower paid ₹15,000 via on-site Dynamic UPI QR code. Digital receipt issued on spot.",
      collected_amount: 15000,
      payment_mode: "UPI_QR",
      receipt_ref: "RCP-FLD-901142",
      gps_latitude: 18.5204,
      gps_longitude: 73.8567,
      gps_accuracy: 5.2,
      gps_consent_acknowledged: true,
      notice_served: true,
      status: "COMPLETED"
    },
    {
      id: "fv_002",
      case_id: "case_0012",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0012",
      scheduled_date: `${todayIso}T11:30:00.000Z`,
      time_slot: "11:00 - 02:00 PM",
      priority: "URGENT",
      geographic_zone: "Pune East",
      visit_start: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      visit_end: new Date(Date.now() - 1 * 3600000).toISOString(),
      duration_minutes: 30,
      visit_outcome: "Promise to Pay",
      visit_notes: "Borrower met in person. Salary delayed until Friday. Formally committed to pay ₹25,000 on 18th Nov via net banking.",
      promise_date: "2026-11-18",
      promise_amount: 25000,
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: 18.5089,
      gps_longitude: 73.9260,
      gps_accuracy: 4.8,
      gps_consent_acknowledged: true,
      notice_served: true,
      status: "COMPLETED"
    },
    {
      id: "fv_003",
      case_id: "case_0015",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0015",
      scheduled_date: `${todayIso}T12:45:00.000Z`,
      time_slot: "11:00 - 02:00 PM",
      priority: "NORMAL",
      geographic_zone: "Hadapsar",
      visit_start: new Date(Date.now() - 45 * 60000).toISOString(),
      visit_end: new Date(Date.now() - 25 * 60000).toISOString(),
      duration_minutes: 20,
      visit_outcome: "Premises Locked / Not Available",
      visit_notes: "Door locked. Inquired with neighbor (Mr. Joshi) who stated borrower works night shift. Pasted formal visit slip on door.",
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: 18.5018,
      gps_longitude: 73.9265,
      gps_accuracy: 6.1,
      gps_consent_acknowledged: true,
      notice_served: true,
      status: "COMPLETED"
    },
    {
      id: "fv_004",
      case_id: "case_0018",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0018",
      scheduled_date: `${todayIso}T14:00:00.000Z`,
      time_slot: "02:00 - 05:00 PM",
      priority: "HIGH",
      geographic_zone: "Kothrud",
      visit_start: new Date(Date.now() - 15 * 60000).toISOString(),
      visit_end: null,
      duration_minutes: 15,
      visit_outcome: null,
      visit_notes: "Agent currently on-site. Verifying commercial shop premises and interacting with proprietor.",
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: 18.5074,
      gps_longitude: 73.8077,
      gps_accuracy: 7.0,
      gps_consent_acknowledged: true,
      notice_served: false,
      status: "IN_PROGRESS"
    },
    {
      id: "fv_005",
      case_id: "case_0021",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0021",
      scheduled_date: `${todayIso}T15:30:00.000Z`,
      time_slot: "02:00 - 05:00 PM",
      priority: "URGENT",
      geographic_zone: "Viman Nagar",
      visit_start: null,
      visit_end: null,
      duration_minutes: 0,
      visit_outcome: null,
      visit_notes: "Delivery of final legal demand notice before SARFAESI/Section 138 escalation. Collateral inspection.",
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: 18.5679,
      gps_longitude: 73.9143,
      gps_accuracy: null,
      gps_consent_acknowledged: false,
      notice_served: false,
      status: "SCHEDULED"
    },
    {
      id: "fv_006",
      case_id: "case_0025",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0025",
      scheduled_date: `${todayIso}T17:00:00.000Z`,
      time_slot: "05:00 - 07:00 PM",
      priority: "NORMAL",
      geographic_zone: "Pimpri Chinchwad",
      visit_start: null,
      visit_end: null,
      duration_minutes: 0,
      visit_outcome: null,
      visit_notes: "Evening follow-up per borrower request. Collect promised installment of ₹12,000.",
      collected_amount: 0,
      payment_mode: null,
      receipt_ref: null,
      gps_latitude: 18.6279,
      gps_longitude: 73.7997,
      gps_accuracy: null,
      gps_consent_acknowledged: false,
      notice_served: false,
      status: "SCHEDULED"
    },
    {
      id: "fv_007",
      case_id: "case_0028",
      field_agent_id: "usr_field_1",
      customer_id: "cust_0028",
      scheduled_date: new Date(Date.now() - 86400000).toISOString(),
      time_slot: "11:00 - 02:00 PM",
      priority: "HIGH",
      geographic_zone: "Mumbai Suburbs",
      visit_start: new Date(Date.now() - 25 * 3600000).toISOString(),
      visit_end: new Date(Date.now() - 24 * 3600000).toISOString(),
      duration_minutes: 50,
      visit_outcome: "Customer Met & Paid",
      visit_notes: "Borrower handed over ₹8,500 in cash currency notes. Denominations verified: ₹500 x 17. Handover slip signed.",
      collected_amount: 8500,
      payment_mode: "CASH",
      cash_denominations: { "500": 17, "200": 0, "100": 0, "50": 0 },
      receipt_ref: "RCP-FLD-883192",
      gps_latitude: 19.0760,
      gps_longitude: 72.8777,
      gps_accuracy: 5.0,
      gps_consent_acknowledged: true,
      notice_served: true,
      status: "COMPLETED"
    }
  ];

  // Seed cash handovers
  const cashHandovers = [
    {
      id: "cho_001",
      handover_ref: "CHO-20261109-01",
      agent_id: "usr_field_1",
      agent_name: "Vikram Singh",
      agent_employee_id: "PM-FLD-0001",
      amount: 8500,
      branch_name: "Pune FC Road Branch",
      deposit_slip_ref: "DEP-ICICI-88219",
      notes: "Cash collected from case LON-BAJ-8820028. Deposited to collection branch teller.",
      submitted_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      status: "PENDING_RECONCILIATION",
      reconciled_by: null,
      reconciled_at: null,
      supervisor_remarks: null
    },
    {
      id: "cho_002",
      handover_ref: "CHO-20261108-01",
      agent_id: "usr_field_1",
      agent_name: "Vikram Singh",
      agent_employee_id: "PM-FLD-0001",
      amount: 24000,
      branch_name: "Pune Hadapsar Branch",
      deposit_slip_ref: "DEP-HDFC-99104",
      notes: "Weekend field collections from 3 accounts. Fully reconciled with branch receipts.",
      submitted_at: new Date(Date.now() - 28 * 3600000).toISOString(),
      status: "RECONCILED",
      reconciled_by: "Aarav Mehta (Supervisor)",
      reconciled_at: new Date(Date.now() - 25 * 3600000).toISOString(),
      supervisor_remarks: "Physical cash matches deposit slip. Reconciled."
    }
  ];

  // Seed sample enquiries
  const enquiries = [
    {
      id: "enq_001",
      full_name: "Vikram Malhotra",
      email: "v.malhotra@zenithfinance.co.in",
      phone: "+91 9820011223",
      organization: "Zenith Retail Lending NBFC",
      portfolio_size: "₹50 Cr - ₹200 Cr",
      services_requested: "Voice Calling + Ground Field Recovery",
      message: "Looking for an automated recovery platform with audio recording compliance and field agent GPS verification.",
      status: "NEW",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  // Seed initial immutable recording access logs (Module F - Evidence Management)
  const recordingAccessLogs = [
    {
      id: "ral_seed_001",
      recording_id: "rec_call_case_0007",
      call_id: "call_case_0007",
      user_id: "usr_supervisor",
      user_name: "Aarav Mehta",
      user_role: "SUPERVISOR",
      employee_code: "PM-SUP-0001",
      access_type: "PLAYBACK",
      purpose: "Grievance Investigation for Ticket GRIEV-2026-0012",
      ip_address: "192.168.1.105",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      accessed_at: new Date(Date.now() - 36 * 3600000).toISOString()
    },
    {
      id: "ral_seed_002",
      recording_id: "rec_call_case_0007",
      call_id: "call_case_0007",
      user_id: "usr_admin",
      user_name: "Bhushan Gaikwad",
      user_role: "ADMIN",
      employee_code: "PM-ADM-0001",
      access_type: "DOWNLOAD",
      purpose: "Regulatory Submission for Banking Ombudsman Audit",
      ip_address: "192.168.1.101",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      accessed_at: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: "ral_seed_003",
      recording_id: "rec_call_case_0001",
      call_id: "call_case_0001",
      user_id: "usr_caller_1",
      user_name: "Rohan Kulkarni",
      user_role: "CALLER",
      employee_code: "PM-CLR-0001",
      access_type: "PLAYBACK",
      purpose: "Self-Review for Quality Call Calibration",
      ip_address: "192.168.1.112",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      accessed_at: new Date(Date.now() - 4 * 3600000).toISOString()
    }
  ];

  // ── SEED NOTIFICATIONS & AUTOMATED REMINDERS (Module H) ──
  const notifications = [
    {
      id: "notif_seed_001",
      type: "FOLLOW_UP_DUE_TOMORROW",
      title: "Follow-up due tomorrow: Suresh Kulkarni",
      message: "Scheduled callback on 10 Nov 2026 for Case #PM-LN-2026-10007 (Outstanding: ₹42,500). Borrower requested repayment discussion before noon.",
      severity: "INFO",
      recipient_type: "USER",
      recipient_id: "usr_caller_1",
      recipient_role: "CALLER",
      recipient_name: "Rohan Kulkarni",
      entity_type: "case",
      entity_id: "case_0007",
      metadata: {
        case_number: "PM-LN-2026-10007",
        borrower_name: "Suresh Kulkarni",
        outstanding_amount: 42500,
        due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0]
      },
      status: "UNREAD",
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 35 * 60000).toISOString(),
      created_at: new Date(Date.now() - 35 * 60000).toISOString()
    },
    {
      id: "notif_seed_002",
      type: "PROMISE_TO_PAY_TODAY",
      title: "Customer promised payment today: Amit Deshmukh",
      message: "Promise to Pay ₹25,000 mature today for Case #PM-LN-2026-10012. Verify bank credit or dial customer for payment confirmation.",
      severity: "WARNING",
      recipient_type: "USER",
      recipient_id: "usr_caller_2",
      recipient_role: "CALLER",
      recipient_name: "Sneha Patil",
      entity_type: "case",
      entity_id: "case_0012",
      metadata: {
        case_number: "PM-LN-2026-10012",
        borrower_name: "Amit Deshmukh",
        ptp_amount: 25000,
        due_date: new Date().toISOString().split("T")[0]
      },
      status: "UNREAD",
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 75 * 60000).toISOString(),
      created_at: new Date(Date.now() - 75 * 60000).toISOString()
    },
    {
      id: "notif_seed_003",
      type: "PENDING_CASES_REMINDER",
      title: "Employee has pending cases: 14 untouched accounts",
      message: "You have 14 assigned recovery accounts with DPD > 60 requiring contact. High-priority delinquent accounts awaiting initial dial attempt.",
      severity: "WARNING",
      recipient_type: "USER",
      recipient_id: "usr_caller_1",
      recipient_role: "CALLER",
      recipient_name: "Rohan Kulkarni",
      entity_type: "workload",
      entity_id: "workload_usr_caller_1",
      metadata: {
        pending_count: 14,
        critical_count: 4,
        oldest_uncontacted_days: 12
      },
      status: "UNREAD",
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 120 * 60000).toISOString(),
      created_at: new Date(Date.now() - 120 * 60000).toISOString()
    },
    {
      id: "notif_seed_004",
      type: "SUPERVISOR_APPROVAL_REQUIRED",
      title: "Supervisor approval required: Cash Handover & Leave",
      message: "Action required: 1 field cash handover (CHO-20261109-515, ₹8,500) and 1 sick leave request from Vikram Singh await supervisor sign-off.",
      severity: "CRITICAL",
      recipient_type: "ROLE",
      recipient_id: "usr_supervisor",
      recipient_role: "SUPERVISOR",
      recipient_name: "Aarav Mehta",
      entity_type: "approval",
      entity_id: "CHO-20261109-515",
      metadata: {
        pending_cash_handovers: 1,
        pending_leaves: 1,
        handover_amount: 8500
      },
      status: "UNREAD",
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 180 * 60000).toISOString(),
      created_at: new Date(Date.now() - 180 * 60000).toISOString()
    },
    {
      id: "notif_seed_005",
      type: "FIELD_VISIT_REPORT_OVERDUE",
      title: "Field visit report not submitted: Rajesh Shinde",
      message: "Physical visit scheduled for 14:00 today at Flat #304, Hinjewadi. Visit concluded 3+ hours ago; field report, geo-tag and outcome pending submission.",
      severity: "CRITICAL",
      recipient_type: "USER",
      recipient_id: "usr_field_1",
      recipient_role: "FIELD_AGENT",
      recipient_name: "Vikram Singh",
      entity_type: "visit",
      entity_id: "FV-20261109-001",
      metadata: {
        visit_id: "FV-20261109-001",
        borrower_name: "Rajesh Shinde",
        scheduled_time: "14:00 IST",
        overdue_minutes: 195
      },
      status: "UNREAD",
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 195 * 60000).toISOString(),
      created_at: new Date(Date.now() - 195 * 60000).toISOString()
    },
    {
      id: "notif_seed_006",
      type: "PAYMENT_RECONCILIATION_PENDING",
      title: "Payment reconciliation pending: ₹17,500 HDFC Bank",
      message: "2 field collection receipts (RCP-FLD-640707 & UPI-89421) reconciled in ground operations but awaiting central ledger audit sign-off.",
      severity: "WARNING",
      recipient_type: "ROLE",
      recipient_id: "usr_admin",
      recipient_role: "ADMIN",
      recipient_name: "Bhushan Gaikwad",
      entity_type: "payment",
      entity_id: "RCP-FLD-640707",
      metadata: {
        total_pending_amount: 17500,
        receipts_count: 2,
        bank: "HDFC Bank"
      },
      status: "UNREAD",
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 240 * 60000).toISOString(),
      created_at: new Date(Date.now() - 240 * 60000).toISOString()
    },
    {
      id: "notif_seed_007",
      type: "DAILY_PERFORMANCE_REPORT",
      title: "Daily performance report: 09 Nov 2026 Shift Digest",
      message: "Daily recovery summary: 142 total calls, ₹1,85,000 recovered (88.5% of target), 72.4% connection rate, 18 PTPs logged across calling queues.",
      severity: "INFO",
      recipient_type: "ALL",
      recipient_id: null,
      recipient_role: "ALL",
      recipient_name: "All Management & Supervisors",
      entity_type: "report",
      entity_id: "REP-DAILY-20261109",
      metadata: {
        total_calls: 142,
        total_recovery: 185000,
        target_achievement_pct: 88.5,
        connection_rate_pct: 72.4,
        ptp_count: 18
      },
      status: "READ",
      read_at: new Date(Date.now() - 60 * 60000).toISOString(),
      channel: "IN_APP",
      dispatched_at: new Date(Date.now() - 300 * 60000).toISOString(),
      created_at: new Date(Date.now() - 300 * 60000).toISOString()
    }
  ];

  return {
    roles,
    users,
    employees,
    customers,
    loanCases,
    caseStatusHistory,
    calls,
    callRecordings,
    recordingAccessLogs,
    payments,
    complaints,
    complaintActions,
    attendance,
    fieldVisits,
    cashHandovers,
    enquiries,
    notifications
  };
};

