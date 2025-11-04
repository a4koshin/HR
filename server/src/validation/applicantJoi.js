import Joi from "joi";
import mongoose from "mongoose";

export const applicantSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Applicant name is required",
      "string.min": "Applicant name must be at least 2 characters",
      "string.max": "Applicant name must not exceed 100 characters",
      "any.required": "Applicant name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Applicant email is required",
      "string.email": "Please provide a valid email address",
      "any.required": "Applicant email is required",
    }),

  status: Joi.string()
    .valid("applied", "interview", "hired", "rejected")
    .default("applied")
    .messages({
      "any.only": "Status must be one of 'applied', 'interview', 'hired', or 'rejected'",
    }),

  appliedJob: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.empty": "Applied job ID is required",
      "any.required": "Applied job ID is required",
      "any.invalid": "Applied job ID must be a valid ID",
    }),
});
