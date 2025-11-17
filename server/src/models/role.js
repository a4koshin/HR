import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    pages: [
      {
        type: String,
        enum: [
          "employee",
          "department",
          "shift",
          "attendance",
          "payroll",
          "recruitment",
          "application",
          "training",
          "leaves",
          "documents",
        ],
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
