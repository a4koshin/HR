import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  softDeleteEmployee,
  getPaginatedEmployees,
} from "../controllers/employeeController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const employeeRouter = express.Router();

employeeRouter.use(protectHR);

employeeRouter.post("/", createEmployee);
employeeRouter.get("/", getPaginatedEmployees);
employeeRouter.get("/all", getEmployees);
employeeRouter.get("/:id", getEmployee);
employeeRouter.put("/:id", updateEmployee);
employeeRouter.put("/delete/:id", softDeleteEmployee); 

export default employeeRouter;
