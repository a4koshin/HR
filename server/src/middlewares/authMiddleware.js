import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// Protect routes: Bearer token only
export const protectHR = async (req, res, next) => {
  let token;

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
  
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = { id: user._id };
    next();
  } catch (error) {
    console.error("JWT Error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
