import mongoose from "mongoose";
import applicants from "./applicant.js";
const { Schema } = mongoose;

const recruitmentSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Applicant",
      },
    ],
    hiredEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "closed", "hired"],
      default: "open",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const recruitmentModel = mongoose.model("Recruitment", recruitmentSchema);
export default recruitmentModel

