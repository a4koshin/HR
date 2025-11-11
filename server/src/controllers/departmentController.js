import Department from "../models/department.js";
import Employee from "../models/employee.js";
import { departmentSchema } from "../validation/departmentJoi.js";

// ✅ Create new department
export const createDepartment = async (req, res) => {
  try {
    const { error, value } = departmentSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const exists = await Department.findOne({ name: value.name });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      });
    }

    const department = await Department.create(value);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all departments (no pagination)
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get all departments with pagination
export const getPaginatedDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = 10; // fixed 10 departments per page

    const total = await Department.countDocuments();

    const departments = await Department.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,                   // total number of departments
      page,                    // current page
      pages: Math.ceil(total / limit), // total pages
      departments,             // departments for this page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single department by ID
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update department
export const updateDepartment = async (req, res) => {
  try {
    const updates = req.body;

    const updateSchema = departmentSchema.fork(Object.keys(departmentSchema.describe().keys), (field) =>
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

    if (value.name) {
      const exists = await Department.findOne({ name: value.name, _id: { $ne: req.params.id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Another department with this name already exists",
        });
      }
    }

    const department = await Department.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department with assigned employees",
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
