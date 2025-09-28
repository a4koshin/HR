import Leave from "../models/leave.js";
import Attendance from "../models/attendance.js";

/**
 * Create Leave
 * Uses async validation middleware before hitting this controller
 */
export const createLeave = async (req, res) => {
  try {
    const { emp_id, type, startDate, endDate, reason, shift_id, duration } = req.body;

    const leave = new Leave({
      emp_id,
      type,
      startDate,
      endDate,
      reason,
      shift_id: shift_id || null,
      duration,
    });

    // Optional: link attendance records automatically
    const attendanceRecords = await Attendance.find({
      employee: emp_id,
      date: { $gte: startDate, $lte: endDate },
    });

    leave.attendanceLink = attendanceRecords.map((a) => a._id);

    const savedLeave = await leave.save();

    res.status(201).json({ success: true, leave: savedLeave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Get all leaves
 */
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("emp_id", "fullname email")
      .populate("shift_id", "name startTime endTime")
      .populate("attendanceLink");

    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Get leave by ID
 */
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("emp_id", "fullname email")
      .populate("shift_id", "name startTime endTime")
      .populate("attendanceLink");

    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Approve or Reject leave (Admin/HR only)
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, approvedBy } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    leave.status = status;
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();

    const updatedLeave = await leave.save();

    res.json({ success: true, leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Delete leave (Admin/HR only)
 */
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    await leave.remove();

    res.json({ success: true, message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
