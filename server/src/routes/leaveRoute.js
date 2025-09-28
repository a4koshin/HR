import express from "express";
import {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
} from "../controllers/leaveController.js";

import { protectHR, adminOnly } from "../middlewares/authMiddleware.js";
import { validateLeaveAsync } from "../validation/leaveAsyncValidation.js";

const leaveRouter = express.Router();

// Protected routes
leaveRouter.post("/", protectHR, validateLeaveAsync, createLeave); // create leave
leaveRouter.get("/", protectHR, getLeaves);                        // get all leaves
leaveRouter.get("/:id", protectHR, getLeaveById);                  // get leave by ID

// Admin-only routes
leaveRouter.patch("/:id/status", protectHR, adminOnly, updateLeaveStatus); // approve/reject
leaveRouter.delete("/:id", protectHR, adminOnly, deleteLeave);             // delete leave

export default leaveRouter;
