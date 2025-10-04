import express from "express";
import {
  createPayroll,
  getPayrolls,
  getPayrollEnums,
  getPayrollById,
  updatePayroll,
  deletePayroll,
} from "../controllers/payrollController.js";

import { protectHR, adminOnly } from "../middlewares/authMiddleware.js";

const payrollRouter = express.Router();

// All payroll are protected

payrollRouter.use(protectHR);

// HR/Admin
payrollRouter.get("/", getPayrolls);
payrollRouter.get("/enums", getPayrollEnums);
payrollRouter.get("/:id", getPayrollById);

// Only Admin
payrollRouter.post("/", adminOnly, createPayroll);
payrollRouter.put("/:id", adminOnly, updatePayroll);
payrollRouter.delete("/:id", adminOnly, deletePayroll);

export default payrollRouter;
