import mongoose from "mongoose";
import Attendance from "../models/attendance.js";
import Employee from "../models/employee.js";
import Shift from "../models/shift.js";

// ---------------- Create Attendance ----------------
export const createAttendance = async (req, res) => {
  try {
    const { employee, date, checkIn, checkOut, shift } = req.body;

    const emp = await Employee.findById(employee);
    if (!emp) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const shiftDoc = await Shift.findById(shift);
    if (!shiftDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    const attendance = new Attendance({
      employee,
      date,
      checkIn,
      checkOut,
      shift,
    });

    //Calculate worked hours (from model virtual)
    const workedHours = attendance.workedHours;

    // Calculate overtime (business logic: workedHours - shift duration)
    const shiftDuration =
      (shiftDoc.endTime - shiftDoc.startTime) / (1000 * 60 * 60); // hours
    attendance.overTimeHours = Math.max(0, workedHours - shiftDuration);

    await attendance.save();

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error("Error in createAttendance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get All Attendance ----------------
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("employee", "fullname email role")
      .populate("shift", "name startTime endTime");

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    console.error("Error in getAttendance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get Single Attendance ----------------
export const getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate("employee", "fullname email role")
      .populate("shift", "name startTime endTime");

    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    res.status(200).json({ success: true, record });
  } catch (error) {
    console.error("Error in getAttendanceById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Update Attendance ----------------
export const updateAttendance = async (req, res) => {
  try {
    const { checkIn, checkOut, shift } = req.body;

    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    if (checkIn) record.checkIn = checkIn;
    if (checkOut) record.checkOut = checkOut;
    if (shift) record.shift = shift;

    //  Recalculate workedHours and overtime
    const workedHours = record.workedHours;

    const shiftDoc = await Shift.findById(record.shift);
    if (shiftDoc) {
      const shiftDuration =
        (shiftDoc.endTime - shiftDoc.startTime) / (1000 * 60 * 60);
      record.overTimeHours = Math.max(0, workedHours - shiftDuration);
    }

    await record.save();

    res.status(200).json({ success: true, record });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Delete Attendance ----------------
export const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Attendance deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
