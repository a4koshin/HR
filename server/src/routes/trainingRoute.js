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

trainingRouter.get("/", protectHR, getTrainings);


trainingRouter.post("/", protectHR, createTraining);
trainingRouter.get("/:id", protectHR, getTraining);
trainingRouter.put("/:id", protectHR, updateTraining);
trainingRouter.delete("/:id", protectHR, deleteTraining);

export default trainingRouter;
