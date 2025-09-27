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

// Protect all department routes → Only HR/Admin can manage departments
departmentRouter.use(protectHR);

// Create and getting the depts
departmentRouter.post("/", createDepartment);
departmentRouter.get("/", getDepartments);

// department by ID
departmentRouter.get("/:id", getDepartment);
departmentRouter.put("/:id", updateDepartment);
departmentRouter.delete("/:id", deleteDepartment);

export default departmentRouter;
