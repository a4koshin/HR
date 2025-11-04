import Joi from "joi";
import mongoose from "mongoose";

export const attendanceSchema = Joi.object({
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

  date: Joi.date()
    .required()
    .messages({
      "date.base": "Date must be a valid date",
      "any.required": "Date is required",
    }),

  checkIn: Joi.date()
    .optional()
    .messages({
      "date.base": "Check-in must be a valid date",
    }),

  checkOut: Joi.date()
    .optional()
    .messages({
      "date.base": "Check-out must be a valid date",
    }),

  shift: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.empty": "Shift is required",
      "any.required": "Shift is required",
      "any.invalid": "Shift must be a valid ID",
    }),

  status: Joi.string()
    .valid("Present", "Absent", "Late", "Half-day")
    .default("Absent")
    .messages({
      "any.only": "Status must be one of 'Present', 'Absent', 'Late', or 'Half-day'",
    }),

  workedHours: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Worked hours must be a number",
      "number.min": "Worked hours cannot be negative",
    }),
});
