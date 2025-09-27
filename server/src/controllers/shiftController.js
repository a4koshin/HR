import Shift from "../models/shift.js";

// toTal hours calculations
const CalculateHours = (startTime, endTime) => {
  const diffs = new Date(endTime) - new Date(startTime);
  const hours = diffs / (1000 * 60 * 60);
  return Number(hours.toFixed(2));
};

// ---------------- Get All Shifts ----------------
export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().populate(
      "assignedEmployees",
      "fullname email role"
    );

    // Calculate total hours for each shift
    const totalShiftHours = shifts.map((shift) => ({
      ...shift.toObject(),
      totalHours: CalculateHours(shift.startTime, shift.endTime),
    }));

    res
      .status(200)
      .json({ success: true, count: shifts.length, shifts: totalShiftHours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Get Single Shift ----------------
export const getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id).populate(
      "assignedEmployees",
      "fullname email role"
    );

    // Calculate total hours for each shift
    const totalShiftHour = shift.map((shift) => ({
      ...shift.toObject(),
      totalHours: CalculateHours(shift.startTime, shift.endTime),
    }));

    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    res.status(200).json({ success: true, shift: totalShiftHour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ---------------- Create Shift ----------------
export const createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, assignedEmployees } = req.body;

    const shift = await Shift.create({
      name,
      startTime,
      endTime,
      assignedEmployees,
    });

    res.status(201).json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Update Shift ----------------
export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    res.status(200).json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Delete Shift (Admin only) ----------------
export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
