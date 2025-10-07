// models/Recruitment.js
import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["applied", "interview", "hired", "rejected"],
      default: "applied",
    },
  },
  { _id: false }
);

const recruitmentSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    applicants: [applicantSchema],
    hiredEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // assuming Employee model exists
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recruitment", recruitmentSchema);
