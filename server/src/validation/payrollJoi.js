import Joi from "joi";
import mongoose from "mongoose";

export const payrollSchema = Joi.object({
  employee: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.empty": "Employee is required",
      "any.required": "Employee is required",
      "any.invalid": "Employee must be a valid ID",
    }),

  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.empty": "Month is required",
      "string.pattern.base": "Month must be in YYYY-MM format",
      "any.required": "Month is required",
    }),

  basicSalary: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Basic salary must be a number",
      "number.min": "Basic salary cannot be negative",
      "any.required": "Basic salary is required",
    }),

  overtimeHours: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Overtime hours must be a number",
      "number.min": "Overtime hours cannot be negative",
    }),

  overtimeRate: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Overtime rate must be a number",
      "number.min": "Overtime rate cannot be negative",
    }),

  overtimePay: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Overtime pay must be a number",
      "number.min": "Overtime pay cannot be negative",
    }),

  grossPay: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Gross pay must be a number",
      "number.min": "Gross pay cannot be negative",
    }),

  deduction: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Deduction must be a number",
      "number.min": "Deduction cannot be negative",
    }),

  netPay: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Net pay must be a number",
      "number.min": "Net pay cannot be negative",
    }),

  paySlipUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      "string.uri": "Pay slip URL must be a valid URL",
    }),

  paidStatus: Joi.string()
    .valid("Paid", "Unpaid")
    .default("Unpaid")
    .messages({
      "any.only": "Paid status must be either 'Paid' or 'Unpaid'",
    }),

  paymentDate: Joi.date()
    .optional()
    .messages({
      "date.base": "Payment date must be a valid date",
    }),

  paymentMethod: Joi.string()
    .valid("Bank Transfer", "Cash")
    .default("Bank Transfer")
    .messages({
      "any.only": "Payment method must be either 'Bank Transfer' or 'Cash'",
    }),
});
