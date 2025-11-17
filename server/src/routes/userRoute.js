import express from "express";
import { protectHR } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { userSchema, loginSchema } from "../validation/userJoi.js";
import { login, createUserWithRoles } from "../controllers/userController.js";
import { protectSuperAdmin } from "../middlewares/superAdminMiddleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);

// Super Admin creates users
router.post("/create-user", protectHR, protectSuperAdmin, createUserWithRoles);

export default router;
