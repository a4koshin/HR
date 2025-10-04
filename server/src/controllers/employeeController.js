import Employee from "../models/employee.js";
import Department from "../models/department.js";

// ---------------- Create Employee ----------------
export const createEmployee = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      address,
      department,
      position,
      hireDate,
      contractType,
      salary,
      shiftType,
      status,
    } = req.body;

    // Required fields check
    if (!fullname || !email || !phone || !address || !department || !position) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: "Assigned department does not exist",
      });
    }

    // Check for duplicate email or phone
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email or phone already exists",
      });
    }

    const employee = await Employee.create({
      fullname,
      email,
      phone,
      address,
      department,
      position,
      hireDate,
      contractType,
      salary,
      shiftType,
      status,
    });

    // Populate department before sending response
    const populatedEmployee = await Employee.findById(employee._id).populate(
      "department",
      "name status"
    );
    res.status(201).json({ success: true, employee: populatedEmployee });
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

    res.status(200).json({ success: true, count: employees.length, employees });
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

    // If updating department, check if it exists
    if (updates.department) {
      const deptExists = await Department.findById(updates.department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: "Assigned department does not exist",
        });
      }
    }

    // Prevent duplicate email or phone
    if (updates.email) {
      const exists = await Employee.findOne({
        email: updates.email,
        _id: { $ne: req.params.id },
      });
      if (exists)
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
    }
    if (updates.phone) {
      const exists = await Employee.findOne({
        phone: updates.phone,
        _id: { $ne: req.params.id },
      });
      if (exists)
        return res
          .status(400)
          .json({ success: false, message: "Phone already in use" });
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("department", "name status");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, employee });
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

    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEmployee:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// enum
export const getEmployeeEnums = (req, res) => {
  res.json({
    contractType: ["Permanent", "Contract", "Internship"],
    shiftType: ["Day", "Night"],
    status: ["Active", "Inactive"],
  });
};
