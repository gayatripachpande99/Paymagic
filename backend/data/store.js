// In-memory data store for PayMagic Backend

const todayStr = new Date().toISOString().split("T")[0];

export const users = [
  {
    id: "admin-1",
    name: "Onkar Holkar",
    fullName: "Onkar Holkar",
    role: "ADMIN",
    employeeId: "PM-ADMIN-0001",
    email: "onkar.holkar@paymagic.in",
    phone: "+91 9900112233",
    department: "Executive Management",
    designation: "Founder & Director",
    password: "Admin@123"
  },
  {
    id: "admin-2",
    name: "Bhushan Gaikwad",
    fullName: "Bhushan Gaikwad",
    role: "ADMIN",
    employeeId: "PM-ADMIN-0002",
    email: "bhushan.gaikwad@paymagic.in",
    phone: "+91 9900112244",
    department: "Executive Management",
    designation: "Founder & Director",
    password: "Admin@123"
  },
  {
    id: "emp-1",
    name: "Rahul Sharma",
    fullName: "Rahul Sharma",
    role: "EMPLOYEE",
    employeeId: "PM-EMP-0001",
    email: "rahul.sharma@paymagic.in",
    phone: "+91 9876543210",
    department: "Operations",
    designation: "Executive",
    password: "Emp@123",
    joiningDate: "2026-01-15"
  },
  {
    id: "emp-2",
    name: "Priya Patel",
    fullName: "Priya Patel",
    role: "EMPLOYEE",
    employeeId: "PM-EMP-0002",
    email: "priya.patel@paymagic.in",
    phone: "+91 9876543211",
    department: "Engineering",
    designation: "Senior Software Engineer",
    password: "Emp@123",
    joiningDate: "2026-02-01"
  },
  {
    id: "emp-3",
    name: "Vikram Singh",
    fullName: "Vikram Singh",
    role: "EMPLOYEE",
    employeeId: "PM-EMP-0003",
    email: "vikram.singh@paymagic.in",
    phone: "+91 9876543212",
    department: "Finance",
    designation: "Financial Analyst",
    password: "Emp@123",
    joiningDate: "2026-03-10"
  }
];

export const attendanceRecords = [
  {
    _id: "att-1",
    employeeMongoId: "emp-1",
    employeeId: "PM-EMP-0001",
    name: "Rahul Sharma",
    department: "Operations",
    designation: "Executive",
    attendanceDate: todayStr,
    checkIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    checkOut: null,
    totalWorkMinutes: null,
    status: "WORKING"
  },
  {
    _id: "att-2",
    employeeMongoId: "emp-2",
    employeeId: "PM-EMP-0002",
    name: "Priya Patel",
    department: "Engineering",
    designation: "Senior Software Engineer",
    attendanceDate: todayStr,
    checkIn: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    totalWorkMinutes: 450,
    status: "COMPLETED"
  },
  {
    _id: "att-3",
    employeeMongoId: "emp-3",
    employeeId: "PM-EMP-0003",
    name: "Vikram Singh",
    department: "Finance",
    designation: "Financial Analyst",
    attendanceDate: todayStr,
    checkIn: null,
    checkOut: null,
    totalWorkMinutes: null,
    status: "NOT_MARKED"
  }
];

export const leaveRequests = [
  {
    id: "LV-204",
    employeeId: "PM-EMP-0001",
    employeeName: "Rahul Sharma",
    department: "Operations",
    type: "Casual Leave",
    fromDate: "2026-10-10",
    toDate: "2026-10-11",
    days: 2,
    reason: "Family emergency",
    status: "PENDING",
    appliedOn: todayStr
  }
];
