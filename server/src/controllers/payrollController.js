import Payroll from "../models/payroll.js";
import { payrollValidation } from "../validation/payrollValidation.js";
import { calculatePayroll } from "../helpers/payrollHelper.js";

// CREATE payroll
export const createPayroll = async (req, res) => {
  const isValid = await payrollValidation(req, res);
  if (!isValid) return;

  try {
    const {
      employee,
      month,
      basicSalary,
      overtimeHours = 0,
      overtimeRate = 0,
      deduction = 0,
      paySlipUrl,
      paymentMethod,
    } = req.body;

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

    res.status(201).json({ success: true, payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all payrolls
export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate(
      "employee",
      "fullname salary email role"
    );
    res.json({ success: true, payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single payroll by ID
export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employee",
      "fullname email role"
    );
    if (!payroll)
      return res
        .status(404)
        .json({ success: false, message: "Payroll not found" });

    res.json({ success: true, payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE payroll
export const updatePayroll = async (req, res) => {
  const isValid = await payrollValidation(req, res);
  if (!isValid) return;

  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll)
      return res
        .status(404)
        .json({ success: false, message: "Payroll not found" });

    const {
      basicSalary = payroll.basicSalary,
      overtimeHours = payroll.overtimeHours,
      overtimeRate = payroll.overtimeRate,
      deduction = payroll.deduction,
      paySlipUrl = payroll.paySlipUrl,
      paidStatus = payroll.paidStatus,
      paymentDate = payroll.paymentDate,
      paymentMethod = payroll.paymentMethod,
    } = req.body;

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
      { new: true }
    );

    res.json({ success: true, payroll: updatedPayroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE payroll
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll)
      return res
        .status(404)
        .json({ success: false, message: "Payroll not found" });

    await payroll.deleteOne();
    res.json({ success: true, message: "Payroll deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayrollEnums = (req, res) => {
  res.status(200).json({
    paidStatus: ["Paid", "Unpaid"],
    paymentMethod: ["Bank Transfer", "Cash"],
  });
};
