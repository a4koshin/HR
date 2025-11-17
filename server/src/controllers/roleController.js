import Role from "../models/role.js";
import userModel from "../models/user.js";

// Super Admin creates a role
export const createRole = async (req, res) => {
  try {
    const { roleName, pages } = req.body;

    const exists = await Role.findOne({ roleName });
    if (exists) return res.status(400).json({ success: false, message: "Role already exists" });

    const role = await Role.create({
      roleName,
      pages,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: "Role created successfully", role });
  } catch (error) {
    console.log("Create Role Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Assign role(s) to a user
export const assignRole = async (req, res) => {
  try {
    const { userId, roleIds } = req.body;

    const roles = await Role.find({ _id: { $in: roleIds } });
    if (!roles.length) return res.status(404).json({ success: false, message: "Roles not found" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const pagesSet = new Set();
    roles.forEach(r => r.pages.forEach(p => pagesSet.add(p)));

    user.role = roleIds[0]; // main role
    user.permissions = Array.from(pagesSet);
    await user.save();

    res.status(200).json({ success: true, message: "Role assigned successfully", permissions: user.permissions });
  } catch (error) {
    console.log("Assign Role Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
