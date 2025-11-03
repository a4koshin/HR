import express from "express";
import {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave, // Add this import
  deleteLeave,
} from "../controllers/leaveController.js";

import { protectHR } from "../middlewares/authMiddleware.js";
import { validateLeaveAsync } from "../validation/leaveAsyncValidation.js";

const leaveRouter = express.Router();

// Protected routes
leaveRouter.post("/", protectHR, validateLeaveAsync, createLeave); // create leave
leaveRouter.get("/", protectHR, getLeaves);                        // get all leaves
leaveRouter.get("/:id", protectHR, getLeaveById);                  // get leave by ID
leaveRouter.put("/:id", protectHR, validateLeaveAsync, updateLeave); // Add this line - general update
leaveRouter.patch("/:id", protectHR, validateLeaveAsync, updateLeave); // Or use PATCH


export default leaveRouter;