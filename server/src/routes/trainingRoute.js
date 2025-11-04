import express from "express";
import {
  createTraining,
  getTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
} from "../controllers/trainingController.js";
import { protectHR } from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { trainingSchema } from "../validation/trainingJoi.js";

const trainingRouter = express.Router();

trainingRouter.get("/", protectHR, getTrainings);


trainingRouter.post("/", validate(trainingSchema), createTraining);
trainingRouter.get("/:id", getTraining);
trainingRouter.put("/:id", updateTraining);
trainingRouter.delete("/:id", deleteTraining);

export default trainingRouter;
