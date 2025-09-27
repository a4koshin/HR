import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift",
    required: true,
  },
});

// Virtual field → workedHours
attendanceSchema.virtual("workedHours").get(function () {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn; // milliseconds
    const diffHours = diffMs / (1000 * 60 * 60); // convert to hours
    return Math.round(diffHours * 100) / 100; // 2 decimal places
  }
  return 0;
});

// Ensure virtuals are included in JSON and objects
attendanceSchema.set("toJSON", { virtuals: true });
attendanceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Attendance", attendanceSchema);
