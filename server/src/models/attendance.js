// models/attendance.js
import mongoose from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

// Virtual field → workedHours
attendanceSchema.virtual("workedHours").get(function () {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100;
  }
  return 0;
});

// Middleware to automatically set status based on checkIn/checkOut
attendanceSchema.pre("save", function (next) {
  if (this.checkIn && this.checkOut) {
    this.status = "Present";

    // Calculate if it's half-day (less than 4 hours)
    const workedHours = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    if (workedHours < 4) {
      this.status = "Half-day";
    }

    // You can add late calculation logic here based on shift timing
  } else if (this.checkIn && !this.checkOut) {
    this.status = "Present";
  } else {
    this.status = "Absent";
  }
  next();
});

attendanceSchema.set("toJSON", { virtuals: true });
attendanceSchema.set("toObject", { virtuals: true });

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ employee: 1, date: 1, shift: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
