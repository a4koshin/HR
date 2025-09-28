import express from "express";
import {
  createTraining,
  getTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
} from "../controllers/trainingController.js";
import { protectHR, adminOnly } from "../middlewares/authMiddleware.js";

const trainingRouter = express.Router();

trainingRouter.get("/", protectHR, getTrainings);


trainingRouter.post("/", protectHR, adminOnly, createTraining);
trainingRouter.get("/:id", protectHR, getTraining);
trainingRouter.put("/:id", protectHR, adminOnly, updateTraining);
trainingRouter.delete("/:id", protectHR, adminOnly, deleteTraining);

export default trainingRouter;
