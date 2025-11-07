import express from "express";
import {
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  markAttendance,
} from "../controllers/attendanceController.js";

import { protectHR } from "../middlewares/authMiddleware.js";

const attendanceRouter = express.Router();

//All routes are protected
attendanceRouter.use(protectHR);

attendanceRouter.post("/", createAttendance);
attendanceRouter.get("/", getAttendances);

attendanceRouter.post("/mark", markAttendance);
attendanceRouter.get("/:id", getAttendanceById);
attendanceRouter.put("/:id", updateAttendance);
attendanceRouter.delete("/:id", deleteAttendance);

export default attendanceRouter;
