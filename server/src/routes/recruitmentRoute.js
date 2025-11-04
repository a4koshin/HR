// routes/recruitmentRoutes.js
import express from "express";
import {
  createRecruitment,
  getRecruitments,
  getRecruitmentById,
  updateRecruitment,
  deleteRecruitment,
  hireApplicant,
} from "../controllers/recruitmentController.js";
import { protectHR,  } from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { recruitmentSchema } from "../validation/recruitmentJoi.js";
const recruitmentRouter = express.Router();

// CRUD routes
recruitmentRouter.post("/", validate(recruitmentSchema), createRecruitment); // Only authenticated HR
recruitmentRouter.get("/", getRecruitments);
recruitmentRouter.get("/:id", getRecruitmentById);
recruitmentRouter.put("/:id", updateRecruitment);
recruitmentRouter.delete("/:id", deleteRecruitment);

recruitmentRouter.post("/:id/hire", protectHR, hireApplicant);

export default recruitmentRouter;
