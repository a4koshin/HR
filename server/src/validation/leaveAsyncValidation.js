import Leave from "../models/leave.js";
import Employee from "../models/employee.js";
import { calculateLeaveDuration } from "../helpers/leaveHelper.js";

// Async validation middleware
export const validateLeaveAsync = async (req, res, next) => {
  try {
    const { emp_id, type, startDate, endDate, reason } = req.body;

    // 1️⃣ Required field checks
    if (!emp_id) return res.status(400).json({ success: false, message: "Employee ID is required" });
    if (!type) return res.status(400).json({ success: false, message: "Leave type is required" });
    if (!["Sick","Vacation","Unpaid","Other"].includes(type))
      return res.status(400).json({ success: false, message: "Invalid leave type" });
    if (!startDate) return res.status(400).json({ success: false, message: "Start date is required" });
    if (!endDate) return res.status(400).json({ success: false, message: "End date is required" });

    // 2️⃣ Type & logical validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ success: false, message: "Invalid dates" });
    if (end < start) return res.status(400).json({ success: false, message: "End date cannot be before start date" });

    // 3️⃣ Employee existence
    const employeeExists = await Employee.findById(emp_id);
    if (!employeeExists) return res.status(400).json({ success: false, message: "Employee not found" });

    // 4️⃣ Optional: reason length
    if (reason && reason.length > 200) return res.status(400).json({ success: false, message: "Reason too long" });

    // 5️⃣ Check overlapping leaves (business rule)
    const overlappingLeave = await Leave.findOne({
      emp_id,
      status: { $in: ["Pending","Approved"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } } // any overlap
      ]
    });
    if (overlappingLeave) return res.status(400).json({ success: false, message: "Leave overlaps with existing leave" });

    // 6️⃣ Attach calculated duration for controller
    req.body.duration = calculateLeaveDuration(start, end);

    next(); // all checks passed
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error during leave validation" });
  }
};
