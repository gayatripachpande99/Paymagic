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
