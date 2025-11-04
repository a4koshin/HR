import Joi from "joi";

export const shiftSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Shift name is required",
      "string.min": "Shift name must be at least 2 characters",
      "string.max": "Shift name must not exceed 50 characters",
      "any.required": "Shift name is required",
    }),

  startTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.empty": "Start time is required",
      "string.pattern.base": "Start time must be in HH:MM (24-hour) format",
      "any.required": "Start time is required",
    }),

  endTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.empty": "End time is required",
      "string.pattern.base": "End time must be in HH:MM (24-hour) format",
      "any.required": "End time is required",
    }),

  status: Joi.string()
    .valid("Active", "Inactive")
    .default("Active")
    .messages({
      "any.only": "Status must be either 'Active' or 'Inactive'",
    }),
});
