import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import {validate} from "../middlewares/validate.js";
import {employeeSchema} from "../validation/employeeJoi.js";
const employeeRouter = express.Router();

employeeRouter.post("/", validate(employeeSchema), createEmployee);
employeeRouter.get("/", getEmployees);
employeeRouter.get("/:id", getEmployee);
employeeRouter.put("/:id",  validate(employeeSchema),updateEmployee);
employeeRouter.delete("/:id", deleteEmployee);

export default employeeRouter;
