import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeEnums,
} from "../controllers/employeeController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const employeeRouter = express.Router();

// All routes require HR/Admin access
employeeRouter.use(protectHR);

employeeRouter.post("/", createEmployee);
employeeRouter.get("/", getEmployees);
employeeRouter.get("/enums", getEmployeeEnums);
employeeRouter.get("/:id", getEmployee);
employeeRouter.put("/:id", updateEmployee);

// Admin Only can it
employeeRouter.delete("/:id", deleteEmployee);

export default employeeRouter;
