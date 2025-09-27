import express from "express";
import {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
} from "../controllers/shiftController.js";

import { protectHR, adminOnly } from "../middlewares/authMiddleware.js";

const shiftRouter = express.Router();

// All routes require HR/Admin
shiftRouter.use(protectHR);

// HR/Admin → can create, view, update
shiftRouter.post("/", createShift);
shiftRouter.get("/", getShifts);
shiftRouter.get("/:id", getShiftById);
shiftRouter.put("/:id", updateShift);

//Only Admin → can delete
shiftRouter.delete("/:id", adminOnly, deleteShift);

export default shiftRouter;
