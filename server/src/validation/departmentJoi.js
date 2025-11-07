import Joi from "joi";

export const departmentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Department name is required",
      "string.min": "Department name must be at least 2 characters",
      "string.max": "Department name must not exceed 50 characters",
      "any.required": "Department name is required",
    }),

  status: Joi.string()
    .valid("Active", "Inactive")
    .required()
    .messages({
      "any.only": "Status must be either 'Active' or 'Inactive'",
      "any.required": "Status is required",
    }),
});
