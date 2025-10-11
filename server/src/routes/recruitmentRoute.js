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

const recruitmentRouter = express.Router();

// CRUD routes
recruitmentRouter.post("/", protectHR, createRecruitment); // Only authenticated HR
recruitmentRouter.get("/", protectHR, getRecruitments);
recruitmentRouter.get("/:id", protectHR, getRecruitmentById);
recruitmentRouter.put("/:id", protectHR, updateRecruitment);
recruitmentRouter.delete("/:id", protectHR, deleteRecruitment);

// Hire applicant (Admin only)
recruitmentRouter.post("/:id/hire", protectHR, hireApplicant);

export default recruitmentRouter;
