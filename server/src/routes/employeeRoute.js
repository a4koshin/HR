import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const employeeRouter = express.Router();

employeeRouter.post("/", createEmployee);
employeeRouter.get("/", getEmployees);
employeeRouter.get("/:id", getEmployee);
employeeRouter.put("/:id", updateEmployee);
employeeRouter.delete("/:id", deleteEmployee);

export default employeeRouter;
