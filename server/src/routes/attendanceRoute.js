import express from "express";
import {
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  markAttendance,
} from "../controllers/attendanceController.js";

import { protectHR, adminOnly } from "../middlewares/authMiddleware.js";

const attendanceRouter = express.Router();

//All routes are protected
attendanceRouter.use(protectHR);

// HR/Admin can create, view, update
attendanceRouter.post("/", createAttendance);
attendanceRouter.get("/", getAttendances);
attendanceRouter.post("/mark", markAttendance);
attendanceRouter.get("/:id", getAttendanceById);
attendanceRouter.put("/:id", updateAttendance);
// Only Admin can delete
attendanceRouter.delete("/:id", adminOnly, deleteAttendance);

export default attendanceRouter;
