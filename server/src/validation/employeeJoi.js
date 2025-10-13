import Joi from "joi";

// Joi validation schema for Employee
export const employeeValidationSchema = Joi.object({
  // Personal Info
  fullname: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{9,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must contain only digits (9–15 numbers)",
      "string.empty": "Phone number is required",
    }),

  address: Joi.string().trim().min(5).max(200).required(),

  // Department (relation)
  department: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Department must be a valid MongoDB ObjectId",
    }),

  // Employment Info
  position: Joi.string().trim().min(2).max(100).required(),

  hireDate: Joi.date().required().messages({
    "date.base": "Hire date must be a valid date",
  }),

  contractType: Joi.string()
    .valid("Permanent", "Contract", "Internship")
    .required(),

  salary: Joi.number().positive().min(0).required().messages({
    "number.base": "Salary must be a number",
    "number.positive": "Salary must be greater than 0",
  }),

  shiftType: Joi.string().valid("Day", "Night").required(),

  status: Joi.string().valid("Active", "Inactive").default("Active"),
});
