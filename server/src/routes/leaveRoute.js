import express from "express";
import {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave, // Add this import
  deleteLeave,
} from "../controllers/leaveController.js";

import { protectHR } from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { leaveSchema } from "../validation/leaveJoi.js";

const leaveRouter = express.Router();

// Protected routes
leaveRouter.post("/", validate(leaveSchema), createLeave); // create leave
leaveRouter.get("/", getLeaves);                        // get all leaves
leaveRouter.get("/:id", getLeaveById);                  // get leave by ID
leaveRouter.put("/:id", updateLeave); // Add this line - general update
leaveRouter.patch("/:id", updateLeave); // Or use PATCH


export default leaveRouter;