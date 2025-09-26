import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// export const protectHR = async (req, res, next) => {
//   const token = req.cookies?.token; // fixed
//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await userModel.findById(decoded.id);
//     if (!user)
//       return res
//         .status(401)
//         .json({ success: false, message: "User not found" });

//     req.user = { id: user._id, role: user.role };
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(401).json({ message: "Invalid token" });
//   }
// };
export const protectHR = async (req, res, next) => {
  let token = req.cookies?.Token;

  // also support Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = { id: user._id, role: user.role };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
