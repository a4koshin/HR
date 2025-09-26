import express from "express";
import {
  login,
  logout,
  //   getProfile,
  updateUserInfo,
  updateProfile,
  listUsers,
  deleteUser,
  changePassword,
  register,
} from "../controllers/userController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

// Auth
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);

// Profile
userRouter.put("/me", protectHR, updateProfile);
userRouter.post("/change-password", protectHR, changePassword);
// Admin
userRouter.get("/", protectHR, listUsers);
userRouter.delete("/:id", protectHR, deleteUser);
userRouter.put("/:id", protectHR, updateUserInfo);

export default userRouter;
