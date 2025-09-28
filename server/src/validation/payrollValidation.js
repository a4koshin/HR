import Employee from "../models/employee.js";

export const payrollValidation = async (req, res) => {
  const {
    employee,
    month,
    basicSalary,
    overtimeHours = 0,
    overtimeRate = 0,
    deduction = 0,
    paymentMethod,
  } = req.body;

  if (!employee) {
    return res
      .status(400)
      .json({ success: false, message: "Employee ID is required" });
  }

  const employeeExists = await Employee.findById(employee);
  if (!employeeExists) {
    return res
      .status(400)
      .json({ success: false, message: "Employee not found" });
  }

  if (!month) {
    return res
      .status(400)
      .json({ success: false, message: "Month is required" });
  }

  if (basicSalary == null) {
    return res
      .status(400)
      .json({ success: false, message: "Basic salary is required" });
  } else if (basicSalary < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Basic salary must be positive" });
  }

  if (overtimeHours < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Overtime hours cannot be negative" });
  }

  if (overtimeRate < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Overtime rate cannot be negative" });
  }

  if (deduction < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Deduction cannot be negative" });
  }

  if (paymentMethod && !["Cash", "Bank Transfer", "Check"].includes(paymentMethod)) {
    return res
      .status(400)
      .json({ success: false, message: "Payment method must be Cash, Bank Transfer, or Check" });
  }

  return true; 
};
