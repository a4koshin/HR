import express from "express";
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protectHR } from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { departmentSchema } from "../validation/departmentJoi.js";

const departmentRouter = express.Router();

// All routes require HR/Admin access
departmentRouter.use(protectHR);

// HR/Admin can create, list, view, update
departmentRouter.post("/", validate(departmentSchema), createDepartment);
departmentRouter.get("/", getDepartments);
departmentRouter.get("/:id", getDepartment);
departmentRouter.put("/:id", validate(departmentSchema),  updateDepartment);

// Only Admin can delete department

departmentRouter.delete("/:id", deleteDepartment);

export default departmentRouter;
