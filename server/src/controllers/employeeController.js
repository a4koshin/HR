import Employee from "../models/employee.js";
import Department from "../models/department.js";
import { employeeSchema } from "../validation/employeeJoi.js";

// Create a new employee
export const createEmployee = async (req, res) => {
  try {
    const { error, value } = employeeSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const deptExists = await Department.findById(value.department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: "Assigned department does not exist",
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ email: value.email }, { phone: value.phone }],
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email or phone already exists",
      });
    }

    const employee = await Employee.create(value);

    // Keep populated department data
    const populatedEmployee = await Employee.findById(employee._id).populate(
      "department",
      "name status"
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: populatedEmployee, // keep original key for frontend
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("department", "name status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees, // keep original key
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single employee by ID
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "department",
      "name status"
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, employee }); // keep original key
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const updates = req.body;

    const updateSchema = employeeSchema.fork(Object.keys(employeeSchema.describe().keys), (field) =>
      field.optional()
    );

    const { error, value } = updateSchema.validate(updates, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    if (value.department) {
      const deptExists = await Department.findById(value.department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: "Assigned department does not exist",
        });
      }
    }

    if (value.email) {
      const exists = await Employee.findOne({ email: value.email, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ success: false, message: "Email already in use" });
    }

    if (value.phone) {
      const exists = await Employee.findOne({ phone: value.phone, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ success: false, message: "Phone already in use" });
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    }).populate("department", "name status");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee, // keep populated data visible
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
