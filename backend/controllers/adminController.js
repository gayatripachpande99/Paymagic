import { users, attendanceRecords } from "../data/store.js";

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
