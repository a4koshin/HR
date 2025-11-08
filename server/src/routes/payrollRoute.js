import express from "express";
import {
  createPayroll,
  getPayrolls,
  getPayroll,
  updatePayroll,
  deletePayroll,
} from "../controllers/payrollController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const payrollRouter = express.Router();

// Protect all payroll routes
payrollRouter.use(protectHR);

payrollRouter.post("/", createPayroll);
payrollRouter.get("/", getPayrolls);
payrollRouter.get("/:id", getPayroll);
payrollRouter.put("/:id", updatePayroll);
payrollRouter.delete("/:id", deletePayroll);

export default payrollRouter;
