import express from "express";
import {
  createRecruitment,
  getRecruitments,
  getRecruitment,
  updateRecruitment,
  deleteRecruitment,
  hireApplicant,
} from "../controllers/recruitmentController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const recruitmentRouter = express.Router();

// Protect all recruitment routes
recruitmentRouter.use(protectHR);

// CRUD Routes
recruitmentRouter.post("/", createRecruitment);
recruitmentRouter.get("/", getRecruitments);
recruitmentRouter.get("/:id", getRecruitment);
recruitmentRouter.put("/:id", updateRecruitment);
recruitmentRouter.put("/delete/:id", deleteRecruitment);

// Hire applicant
recruitmentRouter.post("/:id/hire", hireApplicant);

export default recruitmentRouter;
