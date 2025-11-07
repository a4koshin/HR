import Joi from "joi";
import mongoose from "mongoose";

export const leaveSchema = Joi.object({
  emp_id: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.empty": "Employee ID is required",
      "any.required": "Employee ID is required",
      "any.invalid": "Employee ID must be a valid ID",
    }),

  type: Joi.string()
    .valid("Sick", "Vacation", "Unpaid-Leave", "Other")
    .required()
    .messages({
      "any.only": "Leave type must be one of 'Sick', 'Vacation', 'Unpaid-Leave', or 'Other'",
      "any.required": "Leave type is required",
    }),

  startDate: Joi.date()
    .required()
    .messages({
      "date.base": "Start date must be a valid date",
      "any.required": "Start date is required",
    }),

  endDate: Joi.date()
    .required()
    .messages({
      "date.base": "End date must be a valid date",
      "any.required": "End date is required",
    }),

  status: Joi.string()
    .valid("Pending", "Approved", "Rejected")
    .default("Pending")
    .messages({
      "any.only": "Status must be 'Pending', 'Approved', or 'Rejected'",
    }),

  reason: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      "string.max": "Reason must not exceed 1000 characters",
    }),

  appliedAt: Joi.date()
    .optional()
    .messages({
      "date.base": "Applied date must be a valid date",
    }),

  approvedBy: Joi.string()
    .allow(null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Approved by must be a valid employee ID",
    }),

  approvedAt: Joi.date()
    .optional()
    .messages({
      "date.base": "Approved date must be a valid date",
    }),

  duration: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Duration must be a number",
      "number.min": "Duration cannot be negative",
    }),

  shift_id: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Shift ID must be a valid ID",
    }),

  attendanceLink: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      }).messages({
        "any.invalid": "Each attendance link must be a valid ID",
      })
    )
    .optional(),
});
