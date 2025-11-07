import express from "express";
import {
  createAttendance,
  getAttendances,
  getAttendanceEnums,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  markAttendance,
} from "../controllers/attendanceController.js";

import { protectHR } from "../middlewares/authMiddleware.js";

import {validate} from "../middlewares/validate.js";
import { attendanceSchema } from "../validation/attendanceJoi.js";

const attendanceRouter = express.Router();

//All routes are protected
attendanceRouter.use(protectHR);

// HR/Admin can create, view, update
attendanceRouter.post("/", validate(attendanceSchema), createAttendance);
attendanceRouter.get("/", getAttendances);
attendanceRouter.get("/enums", getAttendanceEnums);
attendanceRouter.post("/mark", markAttendance);
attendanceRouter.get("/:id", getAttendanceById);
attendanceRouter.put("/:id", updateAttendance);
// Only Admin can delete
attendanceRouter.delete("/:id", deleteAttendance);

export default attendanceRouter;
