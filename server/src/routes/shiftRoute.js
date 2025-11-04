// routes/shiftRoutes.js
import express from "express";
import {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
  getShiftAttendanceReport,
} from "../controllers/shiftController.js";

import { protectHR,  } from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { shiftSchema } from "../validation/shiftJoi.js";
const shiftRouter = express.Router();

// All routes require HR/Admin
shiftRouter.use(protectHR);

shiftRouter.post("/", validate(shiftSchema),createShift);
shiftRouter.get("/", getShifts);
shiftRouter.get("/:id", getShiftById);
shiftRouter.put("/:id",validate(shiftSchema), updateShift);
shiftRouter.get("/:id/attendance-report", getShiftAttendanceReport);

shiftRouter.delete("/:id",  deleteShift);

export default shiftRouter;
