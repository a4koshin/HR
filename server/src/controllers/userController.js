import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";
import Role from "../models/role.js";

// JWT helper
function generateToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user);
    res.status(200).json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create user with roles
export const createUserWithRoles = async (req, res) => {
  try {
    const { name, email, password, roleIds } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const roles = await Role.find({ _id: { $in: roleIds } });
    const pagesSet = new Set();
    roles.forEach(r => r.pages.forEach(p => pagesSet.add(p)));

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: roleIds[0],
      permissions: Array.from(pagesSet),
    });

    res.status(201).json({ success: true, message: "User created", user });
  } catch (err) {
    console.log("Create User Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
