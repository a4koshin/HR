import Attendance from "../models/attendance.js";
import Shift from "../models/shift.js";
import { attendanceSchema } from "../validation/attendanceJoi.js";

// Utility: normalize date
const normalizeDate = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));

// Utility: calculate worked hours (handles overnight shifts)
const calculateWorkedHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  let inTime = new Date(checkIn);
  let outTime = new Date(checkOut);
  if (outTime < inTime) outTime.setDate(outTime.getDate() + 1);
  const diffMs = outTime - inTime;
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
};

// Get all attendance records
// ---------------- Get All Attendances with Pagination ----------------
export const getAttendances = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = 10; // fixed 10 records per page

    const total = await Attendance.countDocuments();

    const attendances = await Attendance.find()
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime")
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,                   // total attendance records
      page,                    // current page
      pages: Math.ceil(total / limit), // total pages
      attendances,             // records for this page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get single attendance by ID
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new attendance
export const createAttendance = async (req, res) => {
  try {
    const { error, value } = attendanceSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { employee, date, checkIn, checkOut, shift, status } = value;

    const normalizedDate = new Date(date);
    if (isNaN(normalizedDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const existingAttendance = await Attendance.findOne({
      employee,
      date: normalizedDate.toISOString().split("T")[0],
      shift,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance record already exists for this employee, date, and shift",
      });
    }

    const attendanceData = {
      employee,
      date: normalizedDate,
      shift,
      status: status || "Absent",
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
    };

    attendanceData.workedHours = calculateWorkedHours(
      attendanceData.checkIn,
      attendanceData.checkOut
    );

    const attendance = await Attendance.create(attendanceData);

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime");

    res.status(201).json({
      success: true,
      message: "Attendance record created successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance record already exists for this employee, date, and shift",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const updateSchema = attendanceSchema.fork(
      Object.keys(attendanceSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (value.date) attendance.date = normalizeDate(value.date);
    if (value.checkIn !== undefined)
      attendance.checkIn = value.checkIn ? new Date(value.checkIn) : null;
    if (value.checkOut !== undefined)
      attendance.checkOut = value.checkOut ? new Date(value.checkOut) : null;
    if (value.shift) attendance.shift = value.shift;
    if (value.status) attendance.status = value.status;

    attendance.workedHours = calculateWorkedHours(
      attendance.checkIn,
      attendance.checkOut
    );
    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime");

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Attendance record already exists for this combination",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { date, shift, attendances } = req.body;

    if (!date || !shift || !Array.isArray(attendances)) {
      return res.status(400).json({
        success: false,
        message: "Date, shift, and attendances array are required",
      });
    }

    const results = [];
    const errors = [];

    for (const att of attendances) {
      try {
        let attendance = await Attendance.findOne({
          employee: att.employeeId,
          date: normalizeDate(date),
          shift,
        });

        if (!attendance) {
          attendance = new Attendance({
            employee: att.employeeId,
            date: normalizeDate(date),
            shift,
          });
        }

        if (att.checkIn) attendance.checkIn = new Date(att.checkIn);
        if (att.checkOut) attendance.checkOut = new Date(att.checkOut);
        if (att.status) attendance.status = att.status;

        attendance.workedHours = calculateWorkedHours(
          attendance.checkIn,
          attendance.checkOut
        );
        await attendance.save();

        const populated = await Attendance.findById(attendance._id).populate(
          "employee",
          "fullname email position department"
        );

        results.push(populated);
      } catch (err) {
        errors.push({ employeeId: att.employeeId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance processed for ${results.length} employees`,
      attendances: results,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
