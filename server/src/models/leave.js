import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: { type: String, enum: ["Sick","Vacation","Unpaid-Leave","Other"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["Pending","Approved","Rejected"], default: "Pending" },
  reason: { type: String },
  appliedAt: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approvedAt: { type: Date },
  duration: { type: Number }, 
  shift_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shift" }, 
  attendanceLink: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }] // Optional
});



const Leave = mongoose.model("Leave",leaveSchema)

export default Leave;
