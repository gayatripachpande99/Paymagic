import { uploadedRecords } from "../data/store.js";

// @desc    Get current employee profile
// @route   GET /api/employee/me
export const getEmployeeProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const { password, ...userWithoutPassword } = req.user;
  return res.status(200).json({
    success: true,
    employee: userWithoutPassword
  });
};

// @desc    Get assigned records for logged-in employee
// @route   GET /api/employee/records
export const getEmployeeAssignedRecords = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const empId = req.user.employeeId;
  const myRecords = uploadedRecords.filter(
    (r) => r.assignedTo && r.assignedTo.toUpperCase() === empId.toUpperCase()
  );

  return res.status(200).json({
    success: true,
    employeeId: empId,
    totalAssigned: myRecords.length,
    records: myRecords
  });
};

// @desc    Update record status (e.g. COMPLETED / IN_PROGRESS)
// @route   POST /api/employee/records/:id/status
export const updateRecordStatus = (req, res) => {
  const { id } = req.params;
  const { recordStatus } = req.body;

  const record = uploadedRecords.find((r) => r.id === id);

  if (!record) {
    return res.status(404).json({ message: "Record not found." });
  }

  if (recordStatus) {
    record.recordStatus = recordStatus;
  }

  return res.status(200).json({
    success: true,
    message: "Record status updated successfully",
    record
  });
};

