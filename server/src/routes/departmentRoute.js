import express from "express";
import {
  createDepartment,
  getDepartments,
  getPaginatedDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const departmentRouter = express.Router();

departmentRouter.use(protectHR);

departmentRouter.post("/", createDepartment);
departmentRouter.get("/", getPaginatedDepartments); 
departmentRouter.get("/all", getDepartments);       
departmentRouter.get("/:id", getDepartment);
departmentRouter.put("/:id", updateDepartment);
departmentRouter.put("/delete/:id", deleteDepartment);

export default departmentRouter;
