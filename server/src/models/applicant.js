// models/Applicant.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const applicantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Applicant name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Applicant email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    status: {
      type: String,
      enum: ["applied", "interview", "hired", "rejected"],
      default: "applied",
    },
    appliedJob: {
      type: Schema.Types.ObjectId,
      ref: "Recruitment",
      required: [true, "Applied job ID is required"],
    },

    deleted: {type:Number, enum:[0,1], default:0}
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Applicant || mongoose.model("Applicant", applicantSchema);
