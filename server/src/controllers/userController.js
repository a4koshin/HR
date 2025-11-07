import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// Helper: generate JWT
function generateToken(user) {
  return jwt.sign(
    { userId: user._id }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// ---------------- Register ----------------
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Login ----------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Logout ----------------
export const logout = async (req, res) => {
  try {
    res.clearCookie("Token", { httpOnly: true });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Update Profile ----------------
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      updates.email = email;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Change Password ----------------
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
