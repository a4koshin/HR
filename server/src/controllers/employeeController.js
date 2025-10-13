import Employee from "../models/employee.js";
import Department from "../models/department.js";
import { employeeValidationSchema } from "../validation/employeeJoi.js";

// ---------------- Create Employee ----------------
export const createEmployee = async (req, res) => {
  try {
    // ✅ Step 1: Validate request body using Joi
    const { error, value } = employeeValidationSchema.validate(req.body, {
      abortEarly: false, // return all validation errors
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    // ✅ Step 2: Check if department exists
    const deptExists = await Department.findById(value.department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: "Assigned department does not exist",
      });
    }

    // ✅ Step 3: Check for duplicate email or phone
    const existingEmployee = await Employee.findOne({
      $or: [{ email: value.email }, { phone: value.phone }],
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email or phone already exists",
      });
    }

    // ✅ Step 4: Create new employee
    const employee = await Employee.create(value);

    // ✅ Step 5: Populate department before sending response
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
    console.error("Error in createEmployee:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------- Get All Employees ----------------
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("department", "name status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Error in getEmployees:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get Single Employee ----------------
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "department",
      "name status"
    );

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Error in getEmployee:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Update Employee ----------------
export const updateEmployee = async (req, res) => {
  try {
    const updates = req.body;

    // ✅ Step 1: Partial validation (some fields optional for update)
    const updateSchema = employeeValidationSchema.fork(Object.keys(employeeValidationSchema.describe().keys), (field) =>
      field.optional()
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

    // ✅ Step 2: Check department if updating it
    if (value.department) {
      const deptExists = await Department.findById(value.department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: "Assigned department does not exist",
        });
      }
    }

    // ✅ Step 3: Check for duplicates
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

    // ✅ Step 4: Update employee
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
    console.error("Error in updateEmployee:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Delete Employee ----------------
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteEmployee:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Search Employees ----------------
