import Payroll from "../models/payroll.js";
import Employee from "../models/employee.js"; // Optional but recommended for existence check
import { calculatePayroll } from "../helpers/payrollHelper.js";
import { payrollSchema } from "../validation/payrollJoi.js";

// ---------------------- Create Payroll ----------------------
export const createPayroll = async (req, res) => {
  try {
    const { error, value } = payrollSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const {
      employee,
      month,
      basicSalary,
      overtimeHours = 0,
      overtimeRate = 0,
      deduction = 0,
      paySlipUrl,
      paymentMethod,
    } = value;

    // Check if employee exists
    const empExists = await Employee.findById(employee);
    if (!empExists) {
      return res
        .status(400)
        .json({ success: false, message: "Assigned employee does not exist" });
    }

    // Prevent duplicate payroll for same employee + month
    const existingPayroll = await Payroll.findOne({ employee, month, deleted: 0 });
    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: `Payroll for this employee already exists for ${month}.`,
      });
    }

    // Calculate payroll
    const { overtimePay, grossPay, netPay } = calculatePayroll({
      basicSalary,
      overtimeHours,
      overtimeRate,
      deduction,
    });

    const payroll = await Payroll.create({
      employee,
      month,
      basicSalary,
      overtimeHours,
      overtimeRate,
      overtimePay,
      grossPay,
      deduction,
      netPay,
      paySlipUrl,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      payroll,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Get All Payrolls (Paginated) ----------------------
export const getPayrolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const total = await Payroll.countDocuments({ deleted: 0 });

    const payrolls = await Payroll.find({ deleted: 0 })
      .populate("employee", "fullname salary email position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      payrolls,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Get Single Payroll ----------------------
export const getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({
      _id: req.params.id,
      deleted: 0,
    }).populate("employee", "fullname email role");

    if (!payroll) {
      return res
        .status(404)
        .json({ success: false, message: "Payroll not found" });
    }

    res.status(200).json({ success: true, payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Update Payroll ----------------------
export const updatePayroll = async (req, res) => {
  try {
    const updateSchema = payrollSchema.fork(
      Object.keys(payrollSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const payroll = await Payroll.findOne({
      _id: req.params.id,
      deleted: 0,
    });

    if (!payroll) {
      return res
        .status(404)
        .json({ success: false, message: "Payroll not found" });
    }

    // Extract updated fields + fallback defaults
    const {
      basicSalary = payroll.basicSalary,
      overtimeHours = payroll.overtimeHours,
      overtimeRate = payroll.overtimeRate,
      deduction = payroll.deduction,
      paySlipUrl = payroll.paySlipUrl,
      paymentMethod = payroll.paymentMethod,
      paidStatus = payroll.paidStatus,
      paymentDate = payroll.paymentDate,
    } = value;

    // Recalculate payroll details
    const { overtimePay, grossPay, netPay } = calculatePayroll({
      basicSalary,
      overtimeHours,
      overtimeRate,
      deduction,
    });

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        basicSalary,
        overtimeHours,
        overtimeRate,
        overtimePay,
        grossPay,
        deduction,
        netPay,
        paySlipUrl,
        paymentMethod,
        paidStatus,
        paymentDate,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      payroll: updatedPayroll,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Soft Delete Payroll ----------------------
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { deleted: 1 },
      { new: true }
    );

    if (!payroll) {
      return res
        .status(404)
        .json({ success: false, message: "Payroll not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
      payroll,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
