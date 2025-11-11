import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getPaginatedEmployees
} from "../controllers/employeeController.js";
import {validate} from "../middlewares/validate.js";
import {employeeSchema} from "../validation/employeeJoi.js";
import { protectHR } from "../middlewares/authMiddleware.js";
const employeeRouter = express.Router();

employeeRouter.use(protectHR)

employeeRouter.post("/", createEmployee);
employeeRouter.get("/", getPaginatedEmployees);
employeeRouter.get("/all", getEmployees);
employeeRouter.get("/:id", getEmployee);
employeeRouter.put("/:id",updateEmployee);
employeeRouter.delete("/:id", deleteEmployee);

export default employeeRouter;
