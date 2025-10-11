import express from "express";
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const departmentRouter = express.Router();

// All routes require HR/Admin access
departmentRouter.use(protectHR);

// HR/Admin can create, list, view, update
departmentRouter.post("/", createDepartment);
departmentRouter.get("/", getDepartments);
departmentRouter.get("/:id", getDepartment);
departmentRouter.put("/:id", updateDepartment);

// Only Admin can delete department

departmentRouter.delete("/:id", deleteDepartment);

export default departmentRouter;
