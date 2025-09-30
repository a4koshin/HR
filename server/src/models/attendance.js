import mongoose from "mongoose";

// Utility function to normalize date (always midnight)
const normalizeDate = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      set: normalizeDate,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half-day"],
      default: "Absent",
    },
    workedHours: {
      type: Number, // you can let HR/Admin enter this manually
      default: 0,
    },
  },
  { timestamps: true }
);

// Remove virtuals and middleware — everything is entered manually

attendanceSchema.set("toJSON", { virtuals: true });
attendanceSchema.set("toObject", { virtuals: true });

// Compound index (no duplicate per employee/date/shift)
attendanceSchema.index({ employee: 1, date: 1, shift: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
