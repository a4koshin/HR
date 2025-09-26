import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// ---------------- Sign Up ----------------
export const register = async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields are required " });

  if (typeof password !== "string")
    return res
      .status(400)
      .json({ success: false, message: "Password must be String" });

  if (password.length < 8)
    return res.status(400).json({
      success: false,
      message: "Password must be 8 characters or more!",
    });

  try {
    // check existing user
    const isExistingUser = await userModel.findOne({ email });
    if (isExistingUser) {
      return res.json({
        success: false,
        message: "User already exists, please log in",
      });
    }

    // hash password
    const hashPass = await bcrypt.hash(password, 10);

    // save user
    const user = await new userModel({
      name,
      email,
      role,
      password: hashPass,
    });
    await user.save();

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("Token", token, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "You have registered successfully 👋🏽",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in signUp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error from register controller",
    });
  }
};

// ---------------- Sign In ----------------
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });

  if (typeof password !== "string")
    return res
      .status(400)
      .json({ success: false, message: "Password must be String" });

  if (password.length < 6)
    return res.status(400).json({
      success: false,
      message: "Password must be 6 characters or more",
    });

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User Not Found!!!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("Token", token, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "You have successfully logged-in 👋🏽",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in signIn:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error from the login controller",
    });
  }
};

// ---------------- Sign Out ----------------
export const logout = async (req, res) => {
  try {
    res.clearCookie("Token", { httpOnly: true });
    res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log("Error in signOut:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error from the logout controller",
    });
  }
};

// ---------------- Update Own Profile ----------------
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
      updates.email = email;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await userModel
      .findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};

// ---------------- List Users (Admin only) ----------------
export const listUsers = async (req, res) => {
  try {
    // Check if logged-in user is Admin
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    // Fetch all users (excluding password)
    const users = await userModel.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error in listUsers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- Delete User (Admin only) ----------------
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.log("Error in deleteUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin can update user info
export const updateUserInfo = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { name, email, password, role } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
      updates.email = email;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (role) updates.role = role;

    const user = await userModel
      .findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error in updateUserInfo:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error updating user",
    });
  }
};

// ---------------- Change Password ----------------
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log("Error in changePassword:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
