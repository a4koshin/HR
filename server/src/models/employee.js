import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // Personal Info
    fullname: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },

    // Department (relation)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    // Employment Info
    position: { type: String, required: true, trim: true },
    hireDate: { type: Date, required: true },
    contractType: {
      type: String,
      enum: ["Permanent", "Contract", "Internship"],
      required: true,
    },
    salary: { type: Number, required: true },
    shiftType: {type: mongoose.Schema.Types.ObjectId, ref: "Shift"},
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
