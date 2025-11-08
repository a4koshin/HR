import Joi from "joi";
import mongoose from "mongoose";

export const documentSchema = Joi.object({
  employeeId: Joi.string()
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
    .valid("Medical License", "Certification", "Compliance Document")
    .required()
    .messages({
      "any.only": "Type must be 'Medical License', 'Certification', or 'Compliance Document'",
      "any.required": "Document type is required",
      "string.empty": "Document type is required",
    }),

  documentName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      "string.empty": "Document name is required",
      "string.min": "Document name must be at least 2 characters",
      "string.max": "Document name must not exceed 200 characters",
      "any.required": "Document name is required",
    }),

  documentFile: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Document file is required",
      "any.required": "Document file is required",
    }),

  issuedDate: Joi.date()
    .required()
    .messages({
      "date.base": "Issued date must be a valid date",
      "any.required": "Issued date is required",
    }),

  expiryDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      "date.base": "Expiry date must be a valid date",
    }),

  complianceCategory: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("")
    .messages({
      "string.max": "Compliance category must not exceed 100 characters",
    }),

  status: Joi.string()
    .valid("Active", "Inactive")
    .default("Active")
    .messages({
      "any.only": "Status must be 'Active' or 'Inactive'",
    }),
});
