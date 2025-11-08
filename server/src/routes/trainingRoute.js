import express from "express";
import {
  createTraining,
  getTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
} from "../controllers/trainingController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const trainingRouter = express.Router();

// Protect all routes
trainingRouter.use(protectHR);

trainingRouter.post("/", createTraining);
trainingRouter.get("/", getTrainings);
trainingRouter.get("/:id", getTraining);
trainingRouter.put("/:id", updateTraining);
trainingRouter.delete("/:id", deleteTraining);

export default trainingRouter;
