import { attendanceRecords, leaveRequests } from "../data/store.js";
import { memoryStore } from "../config/db.js";

// @desc    Get today's attendance status for logged-in employee
// @route   GET /api/attendance/today
export const getTodayAttendance = (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const user = req.user;

  let record = attendanceRecords.find(
    (a) => a.employeeMongoId === user.id && a.attendanceDate === todayStr
  );

  return res.status(200).json({
    success: true,
    attendance: record || null
  });
};

// @desc    Get employee attendance history
// @route   GET /api/attendance/history
export const getAttendanceHistory = (req, res) => {
  const user = req.user;
  const userRecords = attendanceRecords.filter((a) => a.employeeMongoId === user.id);

  return res.status(200).json({
    success: true,
    attendance: userRecords
  });
};

// @desc    Check-in attendance
// @route   POST /api/attendance/check-in
export const checkIn = (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const user = req.user;

  let record = attendanceRecords.find(
    (a) => a.employeeMongoId === user.id && a.attendanceDate === todayStr
  );

  if (record && record.checkIn) {
    return res.status(400).json({ message: "Attendance already marked for today." });
  }

  const now = new Date().toISOString();

  if (!record) {
    record = {
      _id: `att-${Date.now()}`,
      employeeMongoId: user.id,
      employeeId: user.employeeId,
      name: user.fullName || user.name,
      department: user.department || "Operations",
      designation: user.designation || "Staff",
      attendanceDate: todayStr,
      checkIn: now,
      checkOut: null,
      totalWorkMinutes: null,
      status: "WORKING"
    };
    attendanceRecords.unshift(record);
  } else {
    record.checkIn = now;
    record.status = "WORKING";
  }

  return res.status(200).json({
    success: true,
    message: "Check-in successful",
    attendance: record
  });
};

// @desc    Check-out attendance
// @route   POST /api/attendance/check-out
export const checkOut = (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const user = req.user;

  let record = attendanceRecords.find(
    (a) => a.employeeMongoId === user.id && a.attendanceDate === todayStr
  );

  if (!record || !record.checkIn) {
    return res.status(400).json({ message: "No active check-in record found for today." });
  }

  if (record.checkOut) {
    return res.status(400).json({ message: "Already checked out for today." });
  }

  const checkOutTime = new Date();
  const checkInTime = new Date(record.checkIn);
  const diffMins = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));

  record.checkOut = checkOutTime.toISOString();
  record.totalWorkMinutes = Math.max(0, diffMins);
  record.status = "COMPLETED";

  return res.status(200).json({
    success: true,
    message: "Check-out successful",
    attendance: record
  });
};

// @desc    Get leave requests for logged-in employee
// @route   GET /api/attendance/leave
export const getLeaveRequests = (req, res) => {
  const user = req.user;
  const userEmpId = user.employeeId || user.employee_id;
  
  const userLeaves = leaveRequests.filter(
    (l) => l.employeeId === userEmpId || l.employeeMongoId === user.id
  );

  return res.status(200).json({
    success: true,
    leaveRequests: userLeaves
  });
};

// @desc    Apply for new employee leave
// @route   POST /api/attendance/leave
export const applyLeave = (req, res) => {
  const user = req.user;
  const { type, fromDate, toDate, reason } = req.body;

  if (!fromDate || !toDate || !reason) {
    return res.status(400).json({ message: "Please provide fromDate, toDate, and reason." });
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  const days = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);

  const newLeave = {
    id: `LV-${Date.now().toString().slice(-4)}`,
    employeeMongoId: user.id,
    employeeId: user.employeeId || user.employee_id || "PM-EMP-0001",
    employeeName: user.fullName || user.name || user.full_name || "Employee",
    department: user.department || "Operations",
    type: type || "Casual Leave",
    fromDate,
    toDate,
    days,
    reason,
    status: "PENDING",
    appliedOn: new Date().toISOString().split("T")[0]
  };

  leaveRequests.unshift(newLeave);

  return res.status(201).json({
    success: true,
    message: "Leave application submitted successfully for supervisor approval.",
    leave: newLeave
  });
};

// @desc    Get all leave requests for supervisor/admin
// @route   GET /api/attendance/leave/all
export const getAllLeaveRequests = (req, res) => {
  return res.status(200).json({
    success: true,
    leaveRequests
  });
};

// @desc    Approve or reject leave request (Supervisor / Admin)
// @route   PATCH /api/attendance/leave/:id/status
export const updateLeaveStatus = (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Status must be APPROVED or REJECTED." });
  }

  const target = leaveRequests.find((l) => l.id === id);
  if (!target) {
    return res.status(404).json({ message: "Leave request not found." });
  }

  target.status = status;
  target.remarks = remarks || `Actioned by ${req.user.fullName || req.user.full_name || 'Supervisor'}`;
  target.actionedAt = new Date().toISOString();

  return res.status(200).json({
    success: true,
    message: `Leave request ${status.toLowerCase()} successfully.`,
    leave: target
  });
};

// @desc    Get daily productivity metrics for logged-in employee
// @route   GET /api/attendance/productivity
export const getDailyProductivity = (req, res) => {
  const user = req.user;
  const todayStr = new Date().toISOString().split("T")[0];

  // Today's attendance
  const record = attendanceRecords.find(
    (a) => a.employeeMongoId === user.id && a.attendanceDate === todayStr
  );

  let activeMinutes = 0;
  if (record?.checkIn) {
    const end = record.checkOut ? new Date(record.checkOut) : new Date();
    activeMinutes = Math.max(0, Math.round((end - new Date(record.checkIn)) / (1000 * 60)));
  }

  // Today's calls
  const todayCalls = (memoryStore.calls || []).filter(
    (c) => c.employee_id === user.id && c.started_at && c.started_at.startsWith(todayStr)
  );
  const connectedCalls = todayCalls.filter((c) => c.status === "answered").length;
  const talkSeconds = todayCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);

  // Today's payments collected
  const todayPayments = (memoryStore.payments || []).filter(
    (p) => p.collected_by_id === user.id && p.payment_date && p.payment_date.startsWith(todayStr)
  );
  const amountCollected = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Assigned cases
  const assignedCases = (memoryStore.loan_cases || []).filter(
    (c) => c.assigned_employee_id === user.id
  );
  const ptpCount = assignedCases.filter((c) => c.status === "Promise to Pay").length;
  const followUpsPending = assignedCases.filter(
    (c) => c.follow_up_date && c.follow_up_date <= todayStr && !["Closed", "Fully Paid"].includes(c.status)
  ).length;

  // Field visits today
  const fieldVisitsToday = (memoryStore.field_visits || []).filter(
    (v) => (v.field_agent_id === user.id || v.field_agent_id === user.employeeId) && v.visit_start && v.visit_start.startsWith(todayStr)
  );

  const hoursWorked = activeMinutes > 0 ? (activeMinutes / 60) : 0;
  const callsPerHour = hoursWorked > 0 ? Math.round((todayCalls.length / hoursWorked) * 10) / 10 : 0;
  const productivityScore = Math.min(100, Math.round(
    (connectedCalls * 5) + (ptpCount * 10) + (amountCollected > 0 ? 30 : 0) + (fieldVisitsToday.length * 20) + (activeMinutes > 120 ? 20 : 10)
  ));

  return res.status(200).json({
    success: true,
    productivity: {
      date: todayStr,
      is_on_shift: Boolean(record?.checkIn && !record?.checkOut),
      check_in_time: record?.checkIn || null,
      check_out_time: record?.checkOut || null,
      active_work_minutes: activeMinutes,
      active_work_formatted: `${Math.floor(activeMinutes / 60)}h ${activeMinutes % 60}m`,
      total_calls: todayCalls.length,
      connected_calls: connectedCalls,
      total_talk_time_seconds: talkSeconds,
      total_talk_time_formatted: `${Math.floor(talkSeconds / 3600)}h ${Math.floor((talkSeconds % 3600) / 60)}m`,
      amount_collected_today: amountCollected,
      ptp_secured_today: ptpCount,
      follow_ups_pending: followUpsPending,
      field_visits_completed: fieldVisitsToday.filter(v => v.status === "COMPLETED").length,
      calls_per_hour: callsPerHour,
      productivity_score: productivityScore || 88
    }
  });
};
