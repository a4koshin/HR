import Payroll from "../models/payroll.js";
import { calculatePayroll } from "../helpers/payrollHelper.js";
import { payrollSchema } from "../validation/payrollJoi.js";

// ✅ Create new payroll
// ✅ Create new payroll
export const createPayroll = async (req, res) => {
  try {
    const { error, value } = payrollSchema.validate(req.body, { abortEarly: false });

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

    // 🚨 Prevent duplicate payroll for same employee & month
    const existingPayroll = await Payroll.findOne({ employee, month });
    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: `Payroll for this employee already exists for ${month}.`,
      });
    }

    // 🧮 Calculate payroll
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


// ✅ Get all payrolls
export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employee", "fullname salary email position")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single payroll by ID
export const getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employee",
      "fullname email role"
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.status(200).json({ success: true, payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update payroll
export const updatePayroll = async (req, res) => {
  try {
    // make all fields optional for update
    const updateSchema = payrollSchema.fork(
      Object.keys(payrollSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    const {
      basicSalary = payroll.basicSalary,
      overtimeHours = payroll.overtimeHours,
      overtimeRate = payroll.overtimeRate,
      deduction = payroll.deduction,
      paySlipUrl = payroll.paySlipUrl,
      paidStatus = payroll.paidStatus,
      paymentDate = payroll.paymentDate,
      paymentMethod = payroll.paymentMethod,
    } = value;

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
        paidStatus,
        paymentDate,
        paymentMethod,
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

// ✅ Delete payroll
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    await Payroll.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
