import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// Protect routes: Bearer token only
export const protectHR = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId); // match JWT payload

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // attach user info to request
    req.user = { id: user._id, role: user.role, permissions: user.permissions };
    next();
  } catch (error) {
    console.error("JWT Error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied. Admin only." });
};
