import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
    deleted: {type:Number, enum:[0,1], default:0}
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
