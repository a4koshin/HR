import express from "express";
import { protectHR } from "../middlewares/authMiddleware.js";
import { protectSuperAdmin } from "../middlewares/superAdminMiddleware.js";
import { createRole, assignRole } from "../controllers/roleController.js";

const roleRouter = express.Router();

roleRouter.post("/create", protectHR, protectSuperAdmin, createRole);
roleRouter.post("/assign", protectHR, protectSuperAdmin, assignRole);

export default roleRouter;
