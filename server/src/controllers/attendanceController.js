// controllers/attendanceController.js
import Attendance from "../models/attendance.js";
import Shift from "../models/shift.js";

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
export const createAttendance = async (req, res) => {
  try {
    const { employee, date, checkIn, checkOut, shift } = req.body;

    // Validate required fields
    if (!employee || !date || !shift) {
      return res.status(400).json({
        success: false,
        message: "Employee, date, and shift are required fields",
      });
    }

    // Check if attendance already exists for this employee, date, and shift
    const existingAttendance = await Attendance.findOne({
      employee,
      date: new Date(date),
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
      date: new Date(date),
      shift,
    };

    // Only add checkIn/checkOut if provided
    if (checkIn) attendanceData.checkIn = new Date(checkIn);
    if (checkOut) attendanceData.checkOut = new Date(checkOut);

    const attendance = await Attendance.create(attendanceData);

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
    const { checkIn, checkOut, ...otherData } = req.body;

    const updateData = { ...otherData };

    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }
    if (checkIn) {
      updateData.checkIn = new Date(checkIn);
    } else {
      updateData.checkIn = null;
    }
    if (checkOut) {
      updateData.checkOut = new Date(checkOut);
    } else {
      updateData.checkOut = null;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("employee", "fullname email position department")
      .populate("shift", "name startTime endTime");

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: attendance,
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

// Mark attendance (bulk operation)
export const markAttendance = async (req, res) => {
  try {
    const { date, shift, attendances } = req.body;

    if (!date || !shift || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({
        success: false,
        message: "Date, shift, and attendances array are required",
      });
    }

    const results = [];
    const errors = [];

    for (const att of attendances) {
      try {
        const attendanceData = {
          employee: att.employeeId,
          date: new Date(date),
          shift: shift,
          status: att.status || "Absent",
        };

        if (att.checkIn) attendanceData.checkIn = new Date(att.checkIn);
        if (att.checkOut) attendanceData.checkOut = new Date(att.checkOut);

        // Use upsert to create or update
        const attendance = await Attendance.findOneAndUpdate(
          {
            employee: att.employeeId,
            date: new Date(date),
            shift: shift,
          },
          attendanceData,
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        ).populate("employee", "fullname email position department");

        results.push(attendance);
      } catch (error) {
        errors.push({
          employeeId: att.employeeId,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked for ${results.length} employees`,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
