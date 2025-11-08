import express from "express";
import {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
} from "../controllers/leaveController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const leaveRouter = express.Router();

// Protect all routes
leaveRouter.use(protectHR);

leaveRouter.post("/", createLeave);
leaveRouter.get("/", getLeaves);
leaveRouter.get("/:id", getLeaveById);
leaveRouter.put("/:id", updateLeave);
leaveRouter.delete("/:id", deleteLeave);

export default leaveRouter;
