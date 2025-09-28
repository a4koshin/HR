import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // Personal Info
    fullname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },

    role: {
      type: String,
      enum: [
        "Doctor",
        "Nurse",
        "Receptionist",
        "Lab Staff",
        "Pharmacist",
        "Accountant",
        "Cleaners",
        "IT-staff",
        "Security",
      ],
      required: true,
    },

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
    shiftType: { type: String, enum: ["Day", "Night", "Both"], required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // Misc contract file, certificate
    document: { type: String },
  },
  { timestamps: true }
);

const Employee =  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
