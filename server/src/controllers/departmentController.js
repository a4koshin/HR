import Department from "../models/department.js";
import Employee from "../models/employee.js";

// ---------------- Create Department ----------------
export const createDepartment = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Department name is required" });
    }

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: "Department already exists" });
    }

    const department = await Department.create({
      name,
      status: status || "Active",
    });

    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Get All Departments ----------------
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

// ---------------- Get Single Department ----------------
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Update Department ----------------
export const updateDepartment = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (name) {
      const exists = await Department.findOne({ name, _id: { $ne: req.params.id } });
      if (exists) {
        return res.status(400).json({ success: false, message: "Another department with this name already exists" });
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, status: status || "Active" },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Delete Department ----------------
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const employeeCount = await Employee.countDocuments({ department: id });
    if (employeeCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete department with assigned employees" });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
