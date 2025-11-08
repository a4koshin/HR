import Leave from "../models/leave.js";
import Attendance from "../models/attendance.js";
import { leaveSchema } from "../validation/leaveJoi.js";

// CREATE Leave
export const createLeave = async (req, res) => {
  try {
    const { error, value } = leaveSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { emp_id, type, startDate, endDate, reason, shift_id, duration } = value;

    // Link attendance records automatically
    const attendanceRecords = await Attendance.find({
      employee: emp_id,
      date: { $gte: startDate, $lte: endDate },
    });

    const leave = await Leave.create({
      emp_id,
      type,
      startDate,
      endDate,
      reason,
      shift_id: shift_id || null,
      duration,
      attendanceLink: attendanceRecords.map((a) => a._id),
    });

    res.status(201).json({
      success: true,
      message: "Leave created successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all leaves
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("emp_id", "fullname email")
      .populate("shift_id", "name startTime endTime")
      .populate("attendanceLink");

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single leave by ID
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("emp_id", "fullname email")
      .populate("shift_id", "name startTime endTime")
      .populate("attendanceLink");

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    res.status(200).json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE leave
export const updateLeave = async (req, res) => {
  try {
    // Make all fields optional for update
    const updateSchema = leaveSchema.fork(
      Object.keys(leaveSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    Object.assign(leave, value);

    // Re-link attendance if startDate or endDate changed
    if (value.startDate || value.endDate || value.emp_id) {
      const attendanceRecords = await Attendance.find({
        employee: value.emp_id || leave.emp_id,
        date: { $gte: value.startDate || leave.startDate, $lte: value.endDate || leave.endDate },
      });
      leave.attendanceLink = attendanceRecords.map((a) => a._id);
    }

    const updatedLeave = await leave.save();

    const populatedLeave = await Leave.findById(updatedLeave._id)
      .populate("emp_id", "fullname email")
      .populate("shift_id", "name startTime endTime")
      .populate("attendanceLink");

    res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      leave: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE leave
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    await leave.deleteOne();

    res.status(200).json({ success: true, message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
