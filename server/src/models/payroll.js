import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: String, required: true }, // e.g. "2025-09"

    basicSalary: { type: Number, required: true },
    overtimeHours: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 }, // per hour
    overtimePay: { type: Number, default: 0 },

    grossPay: { type: Number, default: 0 }, // basic + overtimePay
    deduction: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },

    paySlipUrl: { type: String },
    paidStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Pending"],
      default: "Unpaid",
    },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash", "Cheque"],
      default: "Bank Transfer",
    },
  },
  { timestamps: true }
);

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
