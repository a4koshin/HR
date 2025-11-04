import Joi from "joi";
import mongoose from "mongoose";

export const recruitmentSchema = Joi.object({
  jobTitle: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Job title is required",
      "string.min": "Job title must be at least 2 characters",
      "string.max": "Job title must not exceed 100 characters",
      "any.required": "Job title is required",
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      "string.empty": "Job description is required",
      "string.min": "Job description must be at least 10 characters",
      "string.max": "Job description must not exceed 1000 characters",
      "any.required": "Job description is required",
    }),

  applicants: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      }).messages({
        "any.invalid": "Each applicant must be a valid ID",
      })
    )
    .optional(),

  hiredEmployeeId: Joi.string()
    .allow(null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Hired employee ID must be a valid ID",
    }),

  status: Joi.string()
    .valid("open", "closed", "hired")
    .default("open")
    .messages({
      "any.only": "Status must be 'open', 'closed', or 'hired'",
    }),
});
