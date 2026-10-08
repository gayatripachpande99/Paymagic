import { attendanceRecords } from "../data/store.js";

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
