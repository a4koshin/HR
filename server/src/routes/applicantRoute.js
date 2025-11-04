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
import {validate} from "../middlewares/validate.js";
import { applicantSchema } from "../validation/applicantJoi.js";

const applicantRouter = express.Router();

applicantRouter.use(protectHR);

applicantRouter.post("/",  validate(applicantSchema), createApplicant);
applicantRouter.get("/", getApplicants);
applicantRouter.get("/:id", getApplicantById);
applicantRouter.put("/:id", updateApplicant);
applicantRouter.delete("/:id",  deleteApplicant);

export default applicantRouter;
