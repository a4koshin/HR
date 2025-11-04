import express from "express";
import {
  createPayroll,
  getPayrolls,
  getPayrollEnums,
  getPayrollById,
  updatePayroll,
  deletePayroll,
} from "../controllers/payrollController.js";

import { protectHR } from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { payrollSchema } from "../validation/payrollJoi.js";


const payrollRouter = express.Router();

// All payroll are protected

payrollRouter.use(protectHR);


payrollRouter.get("/", getPayrolls);
payrollRouter.get("/enums", getPayrollEnums);
payrollRouter.get("/:id", getPayrollById);


payrollRouter.post("/",validate(payrollSchema), createPayroll);
payrollRouter.put("/:id", updatePayroll);
payrollRouter.delete("/:id", deletePayroll);

export default payrollRouter;
