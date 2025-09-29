// controllers/shiftController.js
import Shift from "../models/shift.js";
import Attendance from "../models/attendance.js";

// Total hours calculations
const CalculateHours = (startTime, endTime) => {
  const diff = new Date(endTime) - new Date(startTime);
  const hours = diff / (1000 * 60 * 60);
  return Number(hours.toFixed(2));
};

// ---------------- Get All Shifts ----------------
export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().populate(
      "assignedEmployees",
      "fullname email position"
    );

    // Calculate total hours for each shift and get attendance stats
    const shiftsWithStats = await Promise.all(
      shifts.map(async (shift) => {
        const shiftObj = shift.toObject();

        // Get attendance records for this shift
        const attendanceRecords = await Attendance.find({
          shift: shift._id,
        }).populate("employee", "fullname");

        const totalEmployees = shift.assignedEmployees.length;
        const presentCount = attendanceRecords.filter(
          (att) => att.checkIn
        ).length;
        const attendanceRate =
          totalEmployees > 0 ? (presentCount / totalEmployees) * 100 : 0;

        return {
          ...shiftObj,
          totalHours: CalculateHours(shift.startTime, shift.endTime),
          attendanceStats: {
            totalEmployees,
            presentCount,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            attendanceRecords,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: shifts.length,
      shifts: shiftsWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Get Single Shift ----------------
export const getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id).populate(
      "assignedEmployees",
      "fullname email position department"
    );

    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    // Get attendance records for this shift
    const attendanceRecords = await Attendance.find({
      shift: shift._id,
    })
      .populate("employee", "fullname position")
      .sort({ date: -1 });

    // Calculate shift statistics
    const totalHours = CalculateHours(shift.startTime, shift.endTime);
    const totalEmployees = shift.assignedEmployees.length;

    // Calculate today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      shift: shift._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const presentToday = todayAttendance.filter((att) => att.checkIn).length;

    const shiftWithDetails = {
      ...shift.toObject(),
      totalHours,
      attendanceStats: {
        totalEmployees,
        presentToday,
        absentToday: totalEmployees - presentToday,
        attendanceRate:
          totalEmployees > 0
            ? Math.round((presentToday / totalEmployees) * 100)
            : 0,
        recentAttendance: attendanceRecords.slice(0, 10), // Last 10 records
      },
    };

    res.status(200).json({ success: true, shift: shiftWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Create Shift ----------------
export const createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, assignedEmployees } = req.body;

    // Validate time format and logic
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const shift = await Shift.create({
      name,
      startTime,
      endTime,
      assignedEmployees: assignedEmployees || [],
    });

    const populatedShift = await Shift.findById(shift._id).populate(
      "assignedEmployees",
      "fullname email position"
    );

    res.status(201).json({
      success: true,
      shift: {
        ...populatedShift.toObject(),
        totalHours: CalculateHours(shift.startTime, shift.endTime),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Update Shift ----------------
export const updateShift = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    // Validate time logic if both are provided
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedEmployees", "fullname email position");

    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    const updatedShift = {
      ...shift.toObject(),
      totalHours: CalculateHours(shift.startTime, shift.endTime),
    };

    res.status(200).json({ success: true, shift: updatedShift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Delete Shift (Admin only) ----------------
export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    // Check if there are attendance records linked to this shift
    const attendanceCount = await Attendance.countDocuments({
      shift: shift._id,
    });

    if (attendanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete shift. There are ${attendanceCount} attendance records linked to this shift.`,
      });
    }

    await Shift.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Get Shift Attendance Report ----------------
export const getShiftAttendanceReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const shift = await Shift.findById(id);
    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    // Date range filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const attendanceRecords = await Attendance.find({
      shift: id,
      ...dateFilter,
    })
      .populate("employee", "fullname position department")
      .sort({ date: -1 });

    // Calculate report statistics
    const totalRecords = attendanceRecords.length;
    const completedShifts = attendanceRecords.filter(
      (att) => att.checkIn && att.checkOut
    ).length;
    const inProgressShifts = attendanceRecords.filter(
      (att) => att.checkIn && !att.checkOut
    ).length;
    const absentShifts = attendanceRecords.filter((att) => !att.checkIn).length;

    const totalWorkedHours = attendanceRecords.reduce(
      (sum, att) => sum + (att.workedHours || 0),
      0
    );

    res.status(200).json({
      success: true,
      report: {
        shift: {
          _id: shift._id,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          totalHours: CalculateHours(shift.startTime, shift.endTime),
        },
        statistics: {
          totalRecords,
          completedShifts,
          inProgressShifts,
          absentShifts,
          totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
          averageHours:
            totalRecords > 0
              ? Math.round((totalWorkedHours / totalRecords) * 100) / 100
              : 0,
        },
        attendanceRecords,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
