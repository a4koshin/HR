import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// helper function to generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// ---------------- Sign Up ----------------
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if user exists
    const isExistUser = await userModel.findOne({ email });
    if (isExistUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashpass,
      role: "User", 
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in signUp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error from the register controller",
    });
  }
};

// ---------------- Sign In ----------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token, // send token in response body
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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


export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["User", "Admin"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (role === "Admin") {
      const adminCount = await userModel.countDocuments({ role: "Admin" });
      if (adminCount >= 2) {
        return res.status(400).json({ success: false, message: "Max 2 Admins allowed" });
      }
    }

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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
