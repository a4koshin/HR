import Joi from "joi";
import mongoose from "mongoose";

export const employeeSchema = Joi.object({
  fullname: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name must not exceed 100 characters",
      "any.required": "Full name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .optional()
    .allow("")
    .messages({
      "string.email": "Please provide a valid email address",
    }),

  phone: Joi.string()
    .trim()
    .min(5)
    .max(20)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.min": "Phone number must be at least 5 characters",
      "string.max": "Phone number must not exceed 20 characters",
      "any.required": "Phone number is required",
    }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      "string.empty": "Address is required",
      "string.min": "Address must be at least 5 characters",
      "string.max": "Address must not exceed 200 characters",
      "any.required": "Address is required",
    }),

  department: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.empty": "Department is required",
      "any.required": "Department is required",
      "any.invalid": "Department must be a valid ID",
    }),

  position: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Position is required",
      "string.min": "Position must be at least 2 characters",
      "string.max": "Position must not exceed 100 characters",
      "any.required": "Position is required",
    }),

  hireDate: Joi.date()
    .required()
    .messages({
      "date.base": "Hire date must be a valid date",
      "any.required": "Hire date is required",
    }),

  contractType: Joi.string()
    .valid("Permanent", "Contract", "Internship")
    .required()
    .messages({
      "any.only": "Contract type must be 'Permanent', 'Contract', or 'Internship'",
      "any.required": "Contract type is required",
    }),

  salary: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Salary must be a number",
      "number.min": "Salary cannot be negative",
      "any.required": "Salary is required",
    }),

  shiftType: Joi.string()
    .valid("Day", "Night")
    .required()
    .messages({
      "any.only": "Shift type must be 'Day' or 'Night'",
      "any.required": "Shift type is required",
    }),

  status: Joi.string()
    .valid("Active", "Inactive")
    .default("Active")
    .messages({
      "any.only": "Status must be 'Active' or 'Inactive'",
    }),
});
