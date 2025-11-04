import express from "express";
import {
  login,
  logout,
  updateProfile,
  changePassword,
  register,
} from "../controllers/userController.js";
import { protectHR } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { userSchema, } from "../validation/userJoi.js";

const userRouter = express.Router();

// -------- AUTH ROUTES --------
userRouter.post("/register", validate(userSchema), register);
userRouter.post("/login", validate(userSchema), login);
userRouter.post("/logout", logout);

// -------- PROFILE ROUTES --------
userRouter.put("/me", protectHR, updateProfile);
userRouter.post("/change-password", protectHR, changePassword);

export default userRouter;
