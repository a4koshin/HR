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

departmentRouter.use(protectHR);

departmentRouter.post("/", createDepartment);
departmentRouter.get("/", getDepartments);
departmentRouter.get("/:id", getDepartment);
departmentRouter.put("/:id", updateDepartment);
departmentRouter.delete("/:id", deleteDepartment);

export default departmentRouter;
