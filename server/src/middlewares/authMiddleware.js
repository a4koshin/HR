import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

export const protectHR = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).populate("role");

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = {
      id: user._id,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };
    req.userPermissions = user.permissions;

    next();
  } catch (error) {
    console.error("JWT Error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
