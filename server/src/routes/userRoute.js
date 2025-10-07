import express from "express";
import {
  login,
  logout,
  //   getProfile,
  updateUserInfo,
  updateProfile,
  updateUserRole,
  listUsers,
  deleteUser,
  changePassword,
  register,
} from "../controllers/userController.js";
import {protectHR,adminOnly}  from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validate.js";
import { registerSchema,loginSchema } from "../validation/userValidator.js";

const userRouter = express.Router();

// Auth
userRouter.post("/register", validate(registerSchema), register);
userRouter.post("/login", validate(loginSchema),login);
userRouter.post("/logout", logout);

// Profile
userRouter.put("/me", protectHR, updateProfile);
userRouter.put("/:id/role", protectHR, adminOnly, updateUserRole);
userRouter.post("/change-password", protectHR, changePassword);
// Admin
userRouter.get("/", protectHR, listUsers);
userRouter.delete("/:id", protectHR, deleteUser);
userRouter.put("/:id", protectHR, updateUserInfo);

export default userRouter;
