import Employee from "../models/employee.js";
import Department from "../models/department.js";
import { employeeSchema } from "../validation/employeeJoi.js";

// Create a new employee
export const createEmployee = async (req, res) => {
  try {
    const { error, value } = employeeSchema.validate(req.body, {
      abortEarly: false,
    });

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

    const populatedEmployee = await Employee.findById(employee._id).populate(
      "department",
      "name status"
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: populatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all employees (only active ones)
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ deleted: 0 })
      .populate("department", "name status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get paginated employees (only active ones)
export const getPaginatedEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const total = await Employee.countDocuments({ deleted: 0 });

    const employees = await Employee.find({ deleted: 0 })
      .populate("department", "name status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single employee by ID
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      deleted: 0,
    }).populate("department", "name status");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const updates = req.body;

    const updateSchema = employeeSchema.fork(
      Object.keys(employeeSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(updates, {
      abortEarly: false,
    });
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
      const exists = await Employee.findOne({
        email: value.email,
        _id: { $ne: req.params.id },
      });
      if (exists)
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
    }

    if (value.phone) {
      const exists = await Employee.findOne({
        phone: value.phone,
        _id: { $ne: req.params.id },
      });
      if (exists)
        return res
          .status(400)
          .json({ success: false, message: "Phone already in use" });
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    }).populate("department", "name status");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft delete employee (update deleted = 1)
export const softDeleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { deleted: 1 },
      { new: true }
    );

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee soft deleted successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
