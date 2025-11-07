import Joi from "joi";
import mongoose from "mongoose";

export const trainingSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Training title is required",
      "string.min": "Training title must be at least 2 characters",
      "string.max": "Training title must not exceed 100 characters",
      "any.required": "Training title is required",
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      "string.max": "Description must not exceed 1000 characters",
    }),

  trainer: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Trainer name is required",
      "string.min": "Trainer name must be at least 2 characters",
      "string.max": "Trainer name must not exceed 100 characters",
      "any.required": "Trainer name is required",
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

  participants: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      }).messages({
        "any.invalid": "Each participant must be a valid employee ID",
      })
    )
    .optional(),

  completionStatus: Joi.string()
    .valid("Not Started", "In Progress", "Completed")
    .default("Not Started")
    .messages({
      "any.only": "Completion status must be 'Not Started', 'In Progress', or 'Completed'",
    }),
});
