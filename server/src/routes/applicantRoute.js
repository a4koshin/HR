// routes/shiftRoutes.js
import express from "express";
import {
    createApplicant,
    getApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant,
} from "../controllers/applicantController.js";

import { protectHR,  } from "../middlewares/authMiddleware.js";

const applicantRouter = express.Router();

applicantRouter.use(protectHR);

applicantRouter.post("/", createApplicant);
applicantRouter.get("/", getApplicants);
applicantRouter.get("/:id", getApplicantById);
applicantRouter.put("/:id", updateApplicant);
applicantRouter.delete("/:id",  deleteApplicant);

export default applicantRouter;
