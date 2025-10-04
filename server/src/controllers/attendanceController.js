import Attendance from "../models/attendance.js";
import Shift from "../models/shift.js";

// Utility to normalize date
const normalizeDate = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));

// Utility to calculate worked hours (handles overnight shifts)
const calculateWorkedHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  let inTime = new Date(checkIn);
  let outTime = new Date(checkOut);

  // Overnight shift: add 1 day to outTime if before inTime
  if (outTime < inTime) {
    outTime.setDate(outTime.getDate() + 1);
  }

  const diffMs = outTime - inTime;
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)); // hours with 2 decimals
};

// Get all attendances
export const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single attendance
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime");

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create attendance
// Create attendance
export const createAttendance = async (req, res) => {
  try {
    const { employee, date, checkIn, checkOut, shift, status } = req.body;

    if (!employee || !date || !shift) {
      return res.status(400).json({
        success: false,
        message: "Employee, date, and shift are required fields",
      });
    }

    // Normalize the date safely
    const normalizedDate = new Date(date);
    if (isNaN(normalizedDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const existingAttendance = await Attendance.findOne({
      employee,
      date: normalizedDate.toISOString().split("T")[0], // compare by YYYY-MM-DD
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

    // Calculate worked hours
    attendanceData.workedHours = calculateWorkedHours(
      attendanceData.checkIn,
      attendanceData.checkOut
    );

    // Save
    const attendance = new Attendance(attendanceData);
    await attendance.save();

    // Re-fetch with populate so frontend gets full object
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime");

    res.status(201).json({
      success: true,
      message: "Attendance record created successfully",
      data: populatedAttendance,
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
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }

    const { date, checkIn, checkOut, shift, status } = req.body;

    if (date) attendance.date = normalizeDate(date);
    if (checkIn !== undefined)
      attendance.checkIn = checkIn ? new Date(checkIn) : null;
    if (checkOut !== undefined)
      attendance.checkOut = checkOut ? new Date(checkOut) : null;
    if (shift) attendance.shift = shift;
    if (status) attendance.status = status;

    // Recalculate worked hours
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
      data: populatedAttendance,
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
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
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
        if (att.status) attendance.status = att.status; // manual input

        // Recalculate worked hours
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
      } catch (error) {
        errors.push({ employeeId: att.employeeId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance processed for ${results.length} employees`,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance enums
export const getAttendanceEnums = (req, res) => {
  res.status(200).json({
    status: ["Present", "Absent"],
  });
};
