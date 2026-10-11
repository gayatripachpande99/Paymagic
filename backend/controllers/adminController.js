import { users, attendanceRecords, uploadedRecords, recordColumns, setRecordColumns } from "../data/store.js";
import { Record, RecordMeta } from "../models/Record.js";

// @desc    Get live admin dashboard attendance summary & logs
// @route   GET /api/admin/attendance/today
export const getAdminTodayAttendance = (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const totalEmployees = users.filter((u) => u.role === "EMPLOYEE").length;
  const todayAtt = attendanceRecords.filter((a) => a.attendanceDate === todayStr);

  const present = todayAtt.filter((a) => a.checkIn).length;
  const working = todayAtt.filter((a) => a.status === "WORKING").length;
  const completed = todayAtt.filter((a) => a.status === "COMPLETED").length;
  const onLeave = todayAtt.filter((a) => a.status === "ON_LEAVE").length;
  const notMarked = Math.max(0, totalEmployees - (present + onLeave));

  return res.status(200).json({
    success: true,
    summary: {
      totalEmployees,
      present,
      working,
      completed,
      notMarked,
      onLeave
    },
    attendance: todayAtt
  });
};

// @desc    Get all employees list with credentials
// @route   GET /api/admin/employees
export const getEmployees = (req, res) => {
  return res.status(200).json({
    success: true,
    employees: users
  });
};

// @desc    Create/Onboard a new employee
// @route   POST /api/admin/employees
export const createEmployee = (req, res) => {
  const { fullName, employeeId, email, phone, department, designation, password, joiningDate } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Full name is required." });
  }

  const generatedId = employeeId || `PM-EMP-000${users.length + 1}`;
  const initialPassword = password || "Emp@123";

  const newEmp = {
    id: `emp-${Date.now()}`,
    name: fullName,
    fullName,
    role: "EMPLOYEE",
    employeeId: generatedId,
    email: email || `${fullName.toLowerCase().replace(/\s+/g, ".")}@paymagic.in`,
    phone: phone || "+91 9876543210",
    department: department || "Operations",
    designation: designation || "Executive",
    password: initialPassword,
    joiningDate: joiningDate || new Date().toISOString().split("T")[0]
  };

  users.push(newEmp);

  // Automatically create a default NOT_MARKED attendance record for today
  const todayStr = new Date().toISOString().split("T")[0];
  attendanceRecords.push({
    _id: `att-${Date.now()}`,
    employeeMongoId: newEmp.id,
    employeeId: newEmp.employeeId,
    name: newEmp.fullName,
    department: newEmp.department,
    designation: newEmp.designation,
    attendanceDate: todayStr,
    checkIn: null,
    checkOut: null,
    totalWorkMinutes: null,
    status: "NOT_MARKED"
  });

  return res.status(201).json({
    success: true,
    message: "Employee created successfully",
    employee: {
      id: newEmp.id,
      fullName: newEmp.fullName,
      employeeId: newEmp.employeeId,
      initialPassword: newEmp.password,
      department: newEmp.department,
      designation: newEmp.designation
    }
  });
};

// @desc    Get all uploaded records & assignment stats
// @route   GET /api/admin/records
export const getAllRecords = (req, res) => {
  const total = uploadedRecords.length;
  const assigned = uploadedRecords.filter((r) => r.assignedTo).length;
  const unassigned = total - assigned;

  // Breakdown per employee
  const breakdown = {};
  uploadedRecords.forEach((r) => {
    if (r.assignedTo) {
      breakdown[r.assignedTo] = (breakdown[r.assignedTo] || 0) + 1;
    }
  });

  return res.status(200).json({
    success: true,
    summary: {
      totalRecords: total,
      assignedRecords: assigned,
      unassignedRecords: unassigned,
      breakdown
    },
    columns: recordColumns,
    records: uploadedRecords
  });
};

// @desc    Upload / batch import new records file
// @route   POST /api/admin/records/upload
export const uploadRecords = (req, res) => {
  const { records, columns, mode } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "Please provide a valid list of records to upload." });
  }

  // Update dynamic columns derived from the file's first row
  if (columns && Array.isArray(columns) && columns.length > 0) {
    setRecordColumns(columns);
  } else if (records[0]?.data) {
    setRecordColumns(Object.keys(records[0].data));
  }

  // If mode === "replace", clear existing records array
  if (mode === "replace") {
    uploadedRecords.length = 0;
  }

  const startNumber = uploadedRecords.length + 1;
  const todayStr = new Date().toISOString().split("T")[0];

  const addedRecords = records.map((rec, i) => {
    const num = startNumber + i;
    // Dynamic row data based on uploaded file's columns:
    let rowData = rec.data;
    if (!rowData) {
      const { id, recordNumber, status, assignedTo, assignedToName, assignedBy, assignedAt, recordStatus, ...rest } = rec;
      rowData = rest;
    }

    return {
      id: `REC-${String(num).padStart(4, "0")}`,
      recordNumber: num,
      data: rowData,
      status: "UNASSIGNED",
      assignedTo: null,
      assignedToName: null,
      assignedBy: req.user?.employeeId || "PM-ADMIN-0001",
      assignedAt: null,
      recordStatus: "PENDING"
    };
  });

  uploadedRecords.push(...addedRecords);

  // Asynchronously persist to MongoDB
  (async () => {
    try {
      if (mode === "replace") {
        await Record.deleteMany({});
      }
      await Record.insertMany(addedRecords);
      await RecordMeta.findOneAndUpdate(
        { key: "activeColumns" },
        { columns: recordColumns },
        { upsert: true }
      );
    } catch (err) {
      console.warn("MongoDB record save warning:", err.message);
    }
  })();

  return res.status(201).json({
    success: true,
    message: `Successfully uploaded and stored ${addedRecords.length} records with ${recordColumns.length} dynamic columns!`,
    columns: recordColumns,
    totalRecordsCount: uploadedRecords.length,
    newRange: { start: startNumber, end: startNumber + addedRecords.length - 1 }
  });
};

// @desc    Assign range of records (e.g. 1 to 100) to an employee
// @route   POST /api/admin/records/assign
export const assignRecordsRange = (req, res) => {
  const { employeeId, startRecordNum, endRecordNum } = req.body;

  if (!employeeId || startRecordNum === undefined || endRecordNum === undefined) {
    return res.status(400).json({ message: "Employee ID, start record number, and end record number are required." });
  }

  const start = parseInt(startRecordNum, 10);
  const end = parseInt(endRecordNum, 10);

  if (isNaN(start) || isNaN(end) || start > end || start < 1) {
    return res.status(400).json({ message: "Invalid record range specified." });
  }

  // Find targeted employee in users store
  const targetEmployee = users.find(
    (u) => u.employeeId.toUpperCase() === employeeId.trim().toUpperCase()
  );

  if (!targetEmployee) {
    return res.status(404).json({ message: `Employee with ID '${employeeId}' not found.` });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  let updatedCount = 0;

  uploadedRecords.forEach((r) => {
    if (r.recordNumber >= start && r.recordNumber <= end) {
      r.assignedTo = targetEmployee.employeeId;
      r.assignedToName = targetEmployee.fullName || targetEmployee.name;
      r.assignedBy = req.user?.employeeId || "PM-ADMIN-0001";
      r.assignedAt = todayStr;
      r.status = "ASSIGNED";
      updatedCount++;
    }
  });

  // Asynchronously persist assignment to MongoDB
  (async () => {
    try {
      await Record.updateMany(
        { recordNumber: { $gte: start, $lte: end } },
        {
          $set: {
            assignedTo: targetEmployee.employeeId,
            assignedToName: targetEmployee.fullName || targetEmployee.name,
            assignedBy: req.user?.employeeId || "PM-ADMIN-0001",
            assignedAt: todayStr,
            status: "ASSIGNED"
          }
        }
      );
    } catch (err) {
      console.warn("MongoDB record assign update warning:", err.message);
    }
  })();

  return res.status(200).json({
    success: true,
    message: `Successfully assigned records ${start} to ${end} (${updatedCount} items) to ${targetEmployee.fullName} (${targetEmployee.employeeId}).`,
    assignedCount: updatedCount,
    assignedTo: {
      employeeId: targetEmployee.employeeId,
      name: targetEmployee.fullName
    }
  });
};

